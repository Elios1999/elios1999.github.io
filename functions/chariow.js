/* =====================================================================
   PAGÉO — Chariow prévient Pagéo à chaque vente (webhook)
   Adresse à coller dans Chariow : https://monpageo.com/api/chariow?cle=VOTRE_PUSH_SECRET
   Réglages Cloudflare utilisés : SUPABASE_URL, SUPABASE_SERVICE_KEY, PUSH_SECRET
   © Pagéo. Tous droits réservés.
   ===================================================================== */
export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const cle = url.searchParams.get("cle") || request.headers.get("x-pageo-secret") || "";
  if (!env.PUSH_SECRET || cle !== env.PUSH_SECRET) return new Response("Refusé", { status: 401 });
  let payload; try { payload = await request.json(); } catch (e) { return new Response("Mauvais message", { status: 400 }); }
  const h = { apikey: env.SUPABASE_SERVICE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_KEY, "Content-Type": "application/json" };
  /* 1. on garde le message de Chariow */
  const r = await fetch(env.SUPABASE_URL + "/rest/v1/chariow_evenements", { method: "POST", headers: { ...h, Prefer: "return=representation" }, body: JSON.stringify({ payload }) });
  if (!r.ok) return new Response("Base indisponible", { status: 500 });
  const [ligne] = await r.json();
  /* 2. on le traite : Premium activé, paiement et commission enregistrés */
  const t = await fetch(env.SUPABASE_URL + "/rest/v1/rpc/traiter_chariow", { method: "POST", headers: h, body: JSON.stringify({ p_id: ligne.id }) });
  const statut = t.ok ? await t.json() : "erreur";
  return new Response(JSON.stringify({ ok: true, statut }), { headers: { "Content-Type": "application/json" } });
}
export async function onRequestGet() { return new Response("Pagéo : adresse du webhook Chariow prête ✅"); }
