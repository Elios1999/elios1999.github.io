/* =====================================================================
   PAGÉO — Chariow prévient Pagéo à chaque vente (webhook « Pulse »)
   Adresse à coller dans Chariow : https://monpageo.com/api/chariow?cle=VOTRE_PUSH_SECRET
   Réglages Cloudflare utilisés : SUPABASE_URL, SUPABASE_SERVICE_KEY, PUSH_SECRET
   Chaque message reçu est gardé (même refusé), pour pouvoir vérifier ce qui se passe.
   © Pagéo. Tous droits réservés.
   ===================================================================== */
async function lire(request) {
  const brut = await request.text();
  try { return JSON.parse(brut); } catch (e) {}
  try { const o = Object.fromEntries(new URLSearchParams(brut)); if (o.payload) { try { return JSON.parse(o.payload); } catch (e) {} } return { brut: brut.slice(0, 20000) }; } catch (e) { return { brut: brut.slice(0, 20000) }; }
}
export async function onRequestPost({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return new Response("Réglages Cloudflare manquants", { status: 500 });
  const url = new URL(request.url);
  const cle = url.searchParams.get("cle") || request.headers.get("x-pageo-secret") || "";
  const payload = await lire(request);
  const h = { apikey: env.SUPABASE_SERVICE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_KEY, "Content-Type": "application/json" };
  const bonneCle = !!env.PUSH_SECRET && cle === env.PUSH_SECRET;
  const r = await fetch(env.SUPABASE_URL + "/rest/v1/chariow_evenements", { method: "POST", headers: { ...h, Prefer: "return=representation" }, body: JSON.stringify({ payload, statut: bonneCle ? "reçu" : "clé refusée" }) });
  if (!bonneCle) return new Response("Refusé", { status: 401 });
  if (!r.ok) return new Response("Base indisponible : " + (await r.text()).slice(0, 200), { status: 500 });
  const [ligne] = await r.json();
  const t = await fetch(env.SUPABASE_URL + "/rest/v1/rpc/traiter_chariow", { method: "POST", headers: h, body: JSON.stringify({ p_id: ligne.id }) });
  const statut = t.ok ? await t.json() : "erreur : " + (await t.text()).slice(0, 200);
  return new Response(JSON.stringify({ ok: true, statut }), { headers: { "Content-Type": "application/json" } });
}
export async function onRequestGet({ request, env }) {
  const manque = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY", "PUSH_SECRET"].filter((k) => !env[k]);
  const txt = (m) => new Response(m, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  if (manque.length) return txt("⚠️ Réglages Cloudflare manquants : " + manque.join(", "));
  const url = new URL(request.url);
  if (url.searchParams.get("test") !== "1") return txt("Pagéo : adresse du webhook Chariow prête ✅");
  /* Test depuis le navigateur : on enregistre un faux signal, pour vérifier que Pagéo et Supabase communiquent */
  if (url.searchParams.get("cle") !== env.PUSH_SECRET) return txt("❌ La clé ne correspond pas à PUSH_SECRET dans Cloudflare.");
  const h = { apikey: env.SUPABASE_SERVICE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_KEY, "Content-Type": "application/json" };
  const r = await fetch(env.SUPABASE_URL + "/rest/v1/chariow_evenements", { method: "POST", headers: h, body: JSON.stringify({ payload: { event: "test", note: "Test depuis le navigateur" }, statut: "test" }) });
  return txt(r.ok ? "✅ Test réussi : Pagéo a bien écrit dans Supabase. Regarde la table chariow_evenements : une ligne « test » vient d’apparaître." : "❌ Pagéo n’arrive pas à écrire dans Supabase : " + (await r.text()).slice(0, 300));
}
