// =====================================================================
//  PAGÉO — Image et titre de partage pour chaque page (Facebook, WhatsApp)
//
//  ✅ Sur Cloudflare Pages : ce fichier s'active tout seul.
//     Quand quelqu'un colle le lien d'une page (ex. /biensant/mon-astuce)
//     sur Facebook ou WhatsApp, il reçoit l'image et le titre de CETTE page.
//  💤 Sur GitHub Pages : ce fichier est ignoré, il ne gêne rien.
//
//  ⚙️ Si tu changes de projet Supabase, modifie seulement les 2 lignes ci-dessous
//     (les mêmes que dans index.html). Jamais la clé « service_role ».
//  © Pagéo. Tous droits réservés.
// =====================================================================

const SUPABASE_URL = "https://wurirnqjilzitkkwsfoo.supabase.co";
const SUPABASE_CLE_PUBLIQUE = "sb_publishable_ceiKUtWwppGRxLCYKsrKKw_sVsdy3CA";

const DESCRIPTIONS = {
  astuce: "Découvre cette astuce 👉 clique pour voir la vidéo.",
  vente: "Commande maintenant, livraison rapide 👉 clique pour voir.",
  inscription: "Inscris-toi gratuitement 👉 clique pour rejoindre.",
};

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

async function appel(nom, corps) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nom}`, {
    method: "POST",
    headers: { apikey: SUPABASE_CLE_PUBLIQUE, Authorization: `Bearer ${SUPABASE_CLE_PUBLIQUE}`, "Content-Type": "application/json" },
    body: JSON.stringify(corps),
  });
  if (!r.ok) return null;
  const t = await r.text();
  return t && t !== "null" ? JSON.parse(t) : null;
}

async function infosPartage(code, slug) {
  const corps = { p_code: code, p_slug: slug };
  // 1) Fonction légère (fichier SQL n° 7)
  try { const d = await appel("page_partage", corps); if (d) return d; } catch (e) {}
  // 2) Secours : la fonction habituelle des pages publiques
  try {
    const p = await appel("page_publique", corps);
    if (!p) return null;
    const pa = (p.contenu && p.contenu.partage) || {};
    return { titre: pa.titre || p.titre, image: pa.image || "", type: p.type };
  } catch (e) { return null; }
}

export async function onRequest(ctx) {
  const { request, next, env } = ctx;
  const url = new URL(request.url);
  const seg = url.pathname.split("/").filter(Boolean);

  // Seulement les adresses de pages : /CODE/nom-de-la-page
  if (request.method !== "GET" || seg.length !== 2 || /\.[a-z0-9]{2,5}$/i.test(seg[1])) return next();

  let page = null;
  try { page = await infosPartage(decodeURIComponent(seg[0]), decodeURIComponent(seg[1])); } catch (e) {}
  if (!page) return next(); // page introuvable : comportement habituel

  const titre = page.titre || "Pagéo";
  const desc = DESCRIPTIONS[page.type] || DESCRIPTIONS.astuce;
  const image = /^https?:\/\//i.test(page.image || "") ? page.image : "";
  const lien = url.origin + url.pathname;

  const meta =
    `<meta name="description" content="${esc(desc)}">` +
    `<meta property="og:type" content="website">` +
    `<meta property="og:site_name" content="Pagéo">` +
    `<meta property="og:url" content="${esc(lien)}">` +
    `<meta property="og:title" content="${esc(titre)}">` +
    `<meta property="og:description" content="${esc(desc)}">` +
    (image ? `<meta property="og:image" content="${esc(image)}"><meta property="og:image:alt" content="${esc(titre)}">` : "") +
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">` +
    `<meta name="twitter:title" content="${esc(titre)}">` +
    (image ? `<meta name="twitter:image" content="${esc(image)}">` : "");

  // On sert le site normal (index.html), avec la bonne fiche de partage dans l'en-tête
  const base = await env.ASSETS.fetch(new URL("/", url));
  const reponse = new Response(base.body, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" },
  });
  return new HTMLRewriter()
    .on("title", { element(e) { e.setInnerContent(titre); } })
    .on('meta[name="description"]', { element(e) { e.remove(); } })
    .on("head", { element(e) { e.append(meta, { html: true }); } })
    .transform(reponse);
}
