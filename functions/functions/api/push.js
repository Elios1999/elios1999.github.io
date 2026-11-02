/* =====================================================================
   PAGÉO — Envoi des notifications sur le téléphone des vendeurs
   Appelé par Supabase (webhook) à chaque nouvelle commande ou inscription.
   © Pagéo. Tous droits réservés.
   ===================================================================== */
const enc = new TextEncoder();
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const deb64u = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), c => c.charCodeAt(0));
const concat = (...a) => { const n = a.reduce((t, x) => t + x.length, 0), r = new Uint8Array(n); let o = 0; for (const x of a) { r.set(x, o); o += x.length; } return r; };
async function hkdf(salt, ikm, info, len) {
  const k = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, len * 8));
}
/* Chiffrement du message (norme Web Push, aes128gcm) */
async function chiffrer(abo, texte) {
  const uaPub = deb64u(abo.p256dh), auth = deb64u(abo.auth);
  const local = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPub = new Uint8Array(await crypto.subtle.exportKey("raw", local.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPub, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const secret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, local.privateKey, 256));
  const ikm = await hkdf(auth, secret, concat(enc.encode("WebPush: info\0"), uaPub, asPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);
  const k = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const chiffre = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, k, concat(enc.encode(texte), new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]);
  return concat(salt, rs, new Uint8Array([asPub.length]), asPub, chiffre);
}
/* Signature VAPID (prouve que c'est bien Pagéo qui envoie) */
async function vapid(endpoint, env) {
  const jwk = JSON.parse(env.VAPID_PRIVATE_JWK);
  const cle = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const h = b64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const p = b64u(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: "mailto:biensante2@gmail.com" })));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, cle, enc.encode(h + "." + p));
  return `vapid t=${h}.${p}.${b64u(sig)}, k=${env.VAPID_PUBLIC}`;
}
async function supabase(env, chemin, options = {}) {
  return fetch(env.SUPABASE_URL + "/rest/v1/" + chemin, { ...options, headers: { apikey: env.SUPABASE_SERVICE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_KEY, "Content-Type": "application/json", ...(options.headers || {}) } });
}
const fcfa = n => Math.round(Number(n) || 0).toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ") + " FCFA";

export async function onRequestPost({ request, env }) {
  if (!env.PUSH_SECRET || request.headers.get("x-pageo-secret") !== env.PUSH_SECRET) return new Response("Refusé", { status: 401 });
  let corps; try { corps = await request.json(); } catch (e) { return new Response("Mauvais message", { status: 400 }); }
  const c = corps.record || corps; if (!c || !c.proprietaire) return new Response("Rien à envoyer");
  const cmd = c.type === "commande";
  const titre = cmd ? "🛒 Nouvelle commande" : "👥 Nouvel inscrit";
  const texte = [c.nom && c.nom !== "Client WhatsApp" && c.nom !== "Visiteur" ? c.nom : null, c.produit, cmd && c.montant ? fcfa(c.montant) : null, c.ville].filter(Boolean).join(" · ") || (cmd ? "Ouvre Pagéo pour la voir." : "Ouvre Pagéo pour le voir.");
  const message = JSON.stringify({ titre, texte, lien: "/#commandes" });
  const r = await supabase(env, "push_abonnements?select=endpoint,p256dh,auth&user_id=eq." + encodeURIComponent(c.proprietaire));
  const abos = r.ok ? await r.json() : [];
  let ok = 0;
  for (const a of abos) {
    try {
      const res = await fetch(a.endpoint, { method: "POST", headers: { "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream", TTL: "86400", Urgency: "high", Authorization: await vapid(a.endpoint, env) }, body: await chiffrer(a, message) });
      if (res.status === 404 || res.status === 410) await supabase(env, "push_abonnements?endpoint=eq." + encodeURIComponent(a.endpoint), { method: "DELETE" });
      else if (res.ok) ok++;
    } catch (e) {}
  }
  return new Response(JSON.stringify({ envoyes: ok, abonnements: abos.length }), { headers: { "Content-Type": "application/json" } });
}
