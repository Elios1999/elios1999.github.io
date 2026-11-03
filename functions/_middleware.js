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
    headers: { apikey: SUPABASE_CLE_PUBLIQUE, "Content-Type": "application/json" },
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


/* ---------- Pages en code HTML : envoyées directement, sans charger toute l'application ---------- */
const KIT = "(function(){\nvar TZ={\"Africa/Ouagadougou\":\"BF\",\"Africa/Abidjan\":\"CI\",\"Africa/Dakar\":\"SN\",\"Africa/Bamako\":\"ML\",\"Africa/Porto-Novo\":\"BJ\",\"Africa/Lome\":\"TG\",\"Africa/Douala\":\"CM\",\"Africa/Niamey\":\"NE\",\"Africa/Conakry\":\"GN\",\"Africa/Libreville\":\"GA\",\"Africa/Kinshasa\":\"CD\",\"Africa/Lubumbashi\":\"CD\",\"Africa/Brazzaville\":\"CG\",\"Africa/Casablanca\":\"MA\",\"Africa/Algiers\":\"DZ\",\"Africa/Tunis\":\"TN\",\"Africa/Lagos\":\"NG\",\"Africa/Accra\":\"GH\",\"Africa/Nairobi\":\"KE\",\"Africa/Kigali\":\"RW\",\"Africa/Bujumbura\":\"BI\",\"Africa/Ndjamena\":\"TD\",\"Africa/Bangui\":\"CF\",\"Africa/Nouakchott\":\"MR\",\"Africa/Johannesburg\":\"ZA\",\"Africa/Cairo\":\"EG\",\"Indian/Antananarivo\":\"MG\",\"Europe/Paris\":\"FR\",\"Europe/Brussels\":\"BE\",\"Europe/Zurich\":\"CH\",\"Europe/Luxembourg\":\"LU\",\"America/Montreal\":\"CA\",\"America/Toronto\":\"CA\",\"America/New_York\":\"US\",\"Europe/London\":\"GB\",\"Europe/Madrid\":\"ES\",\"Europe/Rome\":\"IT\",\"Europe/Berlin\":\"DE\"};\nvar BADGE_TEXTE=\"Tu es e-commerçant, formateur ou entrepreneur web ? Crée ta page comme celle-ci avec Pagéo.\";\nvar REGLAGES={badgeTexte:\"\"};\nfunction esc(t){ return (t==null?\"\":String(t)).replace(/&/g,\"&amp;\").replace(/<\/g,\"&lt;\").replace(/>/g,\"&gt;\").replace(/\"/g,\"&quot;\").replace(/'/g,\"&#39;\"); }\nfunction badgeVisible(bd){ return !(bd&&bd.masquer); }\nfunction badgePageo(bd,premium,code,force){\n  bd=bd||{}; if(!force&&!badgeVisible(bd,premium)) return \"\";\n  var lien=location.origin+\"/?ref=\"+encodeURIComponent(String(code||\"\").toUpperCase()), t=(REGLAGES.badgeTexte||\"\").trim(), txt=t&&t.length<=60?t:\"Crée ta page comme celle-ci avec Pagéo\";\n  /* barre fine et discrète, qui s'accorde avec toutes les pages */\n  return '<style>.bdg-p{font-family:system-ui,-apple-system,sans-serif;display:flex;justify-content:center;margin:16px auto 8px;padding:0 10px}.bdg-p a{display:inline-flex;align-items:center;gap:8px;max-width:100%;padding:7px 8px 7px 14px;border-radius:999px;background:rgba(127,127,127,.12);border:1px solid rgba(127,127,127,.25);color:inherit;text-decoration:none;font-size:12.5px;line-height:1.2;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}.bdg-p .bdg-t{opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bdg-p b{flex:none;background:linear-gradient(90deg,#5B2BE0,#F97316);color:#fff;font-weight:800;padding:5px 10px;border-radius:999px;font-size:12px}<\/style>'+\n    '<div class=\"bdg-p\"><a href=\"'+esc(lien)+'\" target=\"_blank\" rel=\"noopener\"><span class=\"bdg-t\">✨ '+esc(txt)+'<\/span><b>Essayer →<\/b><\/a><\/div>';\n}\nfunction unJour(cle){ try{ var k=\"pg1-\"+cle+\"-\"+new Date().toISOString().slice(0,10); if(localStorage.getItem(k)) return false; localStorage.setItem(k,\"1\"); }catch(e){} return true; }\nfunction suiviHTML(cfg){\n  /* Tout ce qui se passe sur la page HTML est envoyé à Pagéo */\n  function rpc(nom,corps){ try{ return fetch(cfg.url+\"/rest/v1/rpc/\"+nom,{method:\"POST\",keepalive:true,headers:{apikey:cfg.cle,\"Content-Type\":\"application/json\"},body:JSON.stringify(corps)}); }catch(x){ return Promise.reject(x); } }\n  function c(t){ rpc(\"compter\",{p_page:cfg.id,p_type:t}).catch(function(){}); }\n  function une(cle,t){ try{ var k=\"pg1-\"+cle+\"-\"+cfg.id+\"-\"+new Date().toISOString().slice(0,10); if(localStorage.getItem(k)) return false; localStorage.setItem(k,\"1\"); }catch(x){} c(t); return true; }\n  /* Clics, WhatsApp */\n  document.addEventListener(\"click\",function(e){\n    var a=e.target.closest&&e.target.closest(\"a,button,[role=button],input[type=submit],input[type=button]\"); if(!a||a.closest(\"#pageo-avis\")) return;\n    var href=a.getAttribute(\"href\")||\"\";\n    if(/wa\\.me|whatsapp|api\\.whatsapp/i.test(href)){ if(une(\"wa\",\"wa\")){ var mw=\"\"; try{ mw=decodeURIComponent((href.split(\"text=\")[1]||\"\").split(\"&\")[0].replace(/\\+/g,\" \")); }catch(x){} rpc(\"contact_clic\",{p_page:cfg.id,p_canal:\"whatsapp\",p_message:mw||\"Contact WhatsApp depuis la page\"}).catch(function(){}); } return; }\n    var tx=String(a.textContent||a.value||\"\").replace(/\\s+/g,\" \").trim();\n    if(cfg.type===\"inscription\"&&!a.closest(\"form\")&&/r[ée]serv|inscri|rejoin|ma place|particip|je veux/i.test(tx)){ try{ var ki=\"pg1-inscr-\"+cfg.id+\"-\"+new Date().toISOString().slice(0,10); if(!localStorage.getItem(ki)){ localStorage.setItem(ki,\"1\"); rpc(\"contact_clic\",{p_page:cfg.id,p_canal:\"clic\",p_message:\"A cliqué sur « \"+tx.slice(0,60)+\" »\"}).catch(function(){}); } }catch(x){} }\n    une(\"clic\",\"clics\");\n  },true);\n  /* Vidéos : fichiers vidéo et lecteurs YouTube, Vimeo, TikTok, Facebook */\n  document.addEventListener(\"play\",function(e){ if(e.target&&e.target.tagName===\"VIDEO\") une(\"vue\",\"vues\"); },true);\n  window.addEventListener(\"blur\",function(){ setTimeout(function(){ var f=document.activeElement; if(f&&f.tagName===\"IFRAME\"&&/youtube|youtu\\.be|vimeo|tiktok|dailymotion|facebook/i.test(f.src||\"\")) une(\"vue\",\"vues\"); },0); });\n  /* Formulaires : lus automatiquement, quels que soient les noms des champs */\n  function lire(f){\n    var d={nom:\"\",telephone:\"\",email:null,ville:null,zone:null,adresse:null,produit:null,quantite:null,message:null}, autres=[], prenom=\"\";\n    Array.prototype.forEach.call(f.elements,function(x){\n      var t=(x.type||\"\").toLowerCase(); if(!x.tagName||/^(submit|button|hidden|password|file|reset|image)$/.test(t)) return;\n      if((t===\"checkbox\"||t===\"radio\")&&!x.checked) return;\n      var v=String(x.value||\"\").trim(); if(!v) return;\n      var lab=\"\"; if(x.id){ var l=f.querySelector('label[for=\"'+x.id+'\"]'); if(l) lab=l.textContent; } if(!lab&&x.closest(\"label\")) lab=x.closest(\"label\").textContent;\n      var n=((x.name||\"\")+\" \"+(x.id||\"\")+\" \"+(x.getAttribute(\"placeholder\")||\"\")+\" \"+lab+\" \"+(x.getAttribute(\"autocomplete\")||\"\")).toLowerCase();\n      if(t===\"email\"||/mail/.test(n)) d.email=d.email||v.slice(0,160);\n      else if(t===\"tel\"||/t[ée]l|phone|whats|num[ée]ro|mobile|portable|contact/.test(n)) d.telephone=d.telephone||v.slice(0,30);\n      else if(/pr[ée]nom|first/.test(n)) prenom=prenom||v;\n      else if(/nom|name/.test(n)) d.nom=d.nom||v;\n      else if(/ville|city|localit/.test(n)) d.ville=d.ville||v;\n      else if(/quartier|zone|secteur/.test(n)) d.zone=d.zone||v;\n      else if(/adresse|address|livraison/.test(n)) d.adresse=d.adresse||v;\n      else if(/produit|product|article|pack|offre|formule|choix|mod[eè]le/.test(n)) d.produit=d.produit||v;\n      else if(/prix|price|total|montant|amount|somme/.test(n)&&/\\d/.test(v)) d.montant=d.montant||+v.replace(/[^\\d.,]/g,\"\").replace(/[.,](?=\\d{3}(\\D|$))/g,\"\").replace(\",\",\".\");\n      else if(/quantit|qty|qt[ée]|nombre/.test(n)&&+v>0) d.quantite=d.quantite||Math.round(+v);\n      else if(/message|commentaire|remarque|question|note|besoin/.test(n)) d.message=d.message||v;\n      else autres.push((lab||x.name||x.getAttribute(\"placeholder\")||\"Champ\").replace(/\\s+/g,\" \").trim().slice(0,40)+\" : \"+v);\n    });\n    if(prenom) d.nom=(prenom+\" \"+d.nom).trim();\n    if(!d.montant&&d.produit){ var mp=String(d.produit).match(/(\\d[\\d\\s.]{2,})\\s*(f\\s?cfa|fcfa|cfa|f\\b|xof|gnf|ngn|ghs|€|eur|\\$)/i); if(mp) d.montant=(+mp[1].replace(/[\\s.]/g,\"\"))*(d.quantite||1); }\n    if(autres.length) d.message=((d.message?d.message+\"\\n\":\"\")+autres.join(\"\\n\"));\n    if(d.message) d.message=d.message.slice(0,500);\n    return d;\n  }\n  document.addEventListener(\"submit\",function(e){\n    var f=e.target; if(!f||f.tagName!==\"FORM\") return; var d=lire(f);\n    if(d.nom.length<2&&d.telephone.replace(/\\D/g,\"\").length<6&&!d.email) return;\n    var type=cfg.type===\"vente\"?\"commande\":cfg.type===\"inscription\"?\"inscrit\":(d.produit||d.quantite?\"commande\":\"inscrit\");\n    var cleD=\"pg1-env-\"+cfg.id+\"-\"+(d.telephone.replace(/\\D/g,\"\")||d.email||d.nom)+\"-\"+new Date().toISOString().slice(0,10), deja=false; try{ deja=!!localStorage.getItem(cleD); localStorage.setItem(cleD,\"1\"); }catch(x){}\n    var envoi=deja?Promise.resolve(null):rpc(\"nouveau_contact2\",{p_page:cfg.id,p_type:type,p:d});\n    if(!deja){ try{ if(window.pageoPixel) window.pageoPixel(type===\"commande\"?\"Purchase\":\"Lead\",d); }catch(x){} }\n    f.setAttribute(\"data-pageo-envoye\",\"1\"); f._pageoEnvoi=envoi;\n  },true);\n  /* Après le code de la page : si personne ne gère l'envoi, Pagéo affiche le message de remerciement */\n  window.addEventListener(\"submit\",function(e){\n    var f=e.target; if(!f||f.getAttribute(\"data-pageo-envoye\")!==\"1\"||e.defaultPrevented) return;\n    var act=(f.getAttribute(\"action\")||\"\").trim();\n    if(/^(https?:|mailto:)/i.test(act)&&act.indexOf(location.host)<0) return; /* formulaire vers un autre site : on le laisse partir */\n    e.preventDefault();\n    var bt=f.querySelector(\"[type=submit],button\"); if(bt){ bt.disabled=true; }\n    (f._pageoEnvoi||Promise.resolve()).then(function(){ var r=f.getAttribute(\"data-pageo-redirection\")||cfg.red; f.innerHTML='<p style=\"text-align:center;font-weight:700;padding:14px;font-family:system-ui,sans-serif\">✅ Merci, c’est bien reçu !<\/p>'; if(r) setTimeout(function(){ location.href=r; },900); },function(){ if(bt) bt.disabled=false; alert(\"Petit souci de connexion, réessaie.\"); });\n  });\n  if(cfg.badge&&document.body){ var bz=document.createElement(\"div\"); bz.innerHTML=cfg.badge; document.body.appendChild(bz); }\n  /* Boutons J'aime (option) */\n  if(cfg.avis&&document.body){\n    var z=document.createElement(\"div\"); z.id=\"pageo-avis\";\n    z.style.cssText=\"font-family:system-ui,sans-serif;text-align:center;padding:18px 12px;margin:24px auto;max-width:520px\";\n    var deja=false; try{ deja=!!localStorage.getItem(\"pageo-avis-\"+cfg.id); }catch(x){}\n    z.innerHTML='<p style=\"font-weight:700;margin:0 0 10px;font-size:16px\">Cette page t’a été utile ?<\/p><button type=\"button\" data-v=\"1\" style=\"font:600 15px system-ui;padding:10px 18px;border-radius:999px;border:1.5px solid #E2E8F0;background:#fff;cursor:pointer;margin:0 4px\">👍 J’aime<\/button><button type=\"button\" data-v=\"0\" style=\"font:600 15px system-ui;padding:10px 18px;border-radius:999px;border:1.5px solid #E2E8F0;background:#fff;cursor:pointer;margin:0 4px\">👎<\/button>'+(deja?'<p style=\"margin:10px 0 0;color:#64748B;font-size:13px\">Tu as déjà donné ton avis 👍<\/p>':'');\n    document.body.appendChild(z);\n    z.addEventListener(\"click\",function(e){ var b=e.target.closest(\"[data-v]\"); if(!b) return; var k=\"pageo-avis-\"+cfg.id; try{ if(localStorage.getItem(k)){ z.querySelector(\"p\").textContent=\"Tu as déjà donné ton avis 👍\"; return; } localStorage.setItem(k,\"1\"); }catch(x){} c(b.getAttribute(\"data-v\")===\"1\"?\"likes\":\"dislikes\"); b.style.borderColor=\"#22C55E\"; b.textContent=b.getAttribute(\"data-v\")===\"1\"?\"👍 Merci !\":\"👎 Merci pour ton avis\"; });\n  }\n}\nfunction codePixels(px){ if(!px) return \"\"; var h=\"\";\n  var fb=String(px.fb||\"\").replace(/\\D/g,\"\"), tt=String(px.tiktok||\"\").replace(/[^A-Za-z0-9]/g,\"\"), ga=String(px.ga||\"\").replace(/[^A-Za-z0-9-]/g,\"\");\n  if(fb) h+=\"<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','\"+fb+\"');fbq('track','PageView');<\\/script>\";\n  if(tt) h+=\"<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e,n){var r='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var s=d.createElement('script');s.type='text/javascript';s.async=!0;s.src=r+'?sdkid='+e+'&lib='+t;var a=d.getElementsByTagName('script')[0];a.parentNode.insertBefore(s,a)};ttq.load('\"+tt+\"');ttq.page();}(window,document,'ttq');<\\/script>\";\n  if(ga) h+=\"<script async src=\\\"https://www.googletagmanager.com/gtag/js?id=\"+ga+\"\\\"><\\/script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','\"+ga+\"');<\\/script>\";\n  if(px.autre) h+=String(px.autre);\n  return h; }\nfunction pixelEvenement(ev,d){ d=d||{}; var v=+d.montant||0, cur=(d.devise&&/^[A-Z]{3}$/.test(d.devise))?d.devise:\"XOF\", o=v?{value:v,currency:cur}:{};\n  try{ if(window.fbq) fbq(\"track\",ev,o); }catch(e){}\n  try{ if(window.ttq) ttq.track(ev===\"Purchase\"?\"CompletePayment\":\"SubmitForm\",o); }catch(e){}\n  try{ if(window.gtag) gtag(\"event\",ev===\"Purchase\"?\"purchase\":\"generate_lead\",o); }catch(e){} }\nwindow.pageoDemarrer=function(D){ var cfg=D.cfg; REGLAGES.badgeTexte=D.badgeTexte||\"\";\n  try{ var hp=codePixels(D.px); if(hp){ window.pageoPixel=pixelEvenement; document.head.appendChild(document.createRange().createContextualFragment(hp)); } }catch(e){}\n  try{ cfg.badge=badgeVisible(D.bd)?badgePageo(D.bd,false,D.code,true):\"\"; }catch(e){ cfg.badge=\"\"; }\n  if(unJour(\"pageo-vu-\"+cfg.id)){ var tz=\"\"; try{ tz=Intl.DateTimeFormat().resolvedOptions().timeZone||\"\"; }catch(e){}\n    var pc=TZ[tz]; if(!pc){ var r=((navigator.language||\"\").split(\"-\")[1]||\"\").slice(0,2); pc=/^[A-Za-z]{2}$/.test(r)?r.toUpperCase():\"BF\"; }\n    var rf=document.referrer, src=/facebook|fb\\./i.test(rf)?\"facebook\":/tiktok/i.test(rf)?\"tiktok\":/whatsapp|wa\\.me/i.test(rf)?\"whatsapp\":/instagram/i.test(rf)?\"instagram\":rf?\"autre\":\"direct\";\n    try{ fetch(cfg.url+\"/rest/v1/rpc/compter\",{method:\"POST\",keepalive:true,headers:{apikey:cfg.cle,\"Content-Type\":\"application/json\"},body:JSON.stringify({p_page:cfg.id,p_type:\"visites\",p_pays:pc,p_source:src})}); }catch(e){} }\n  suiviHTML(cfg); };\n})();"; /* suivi des visites, clics, formulaires et badge (généré depuis l'application) */
async function reglageBadge() {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/reglages?select=valeur&cle=eq.badge_texte`, { headers: { apikey: SUPABASE_CLE_PUBLIQUE } });
    const l = r.ok ? await r.json() : []; return (l[0] && l[0].valeur) || "";
  } catch (e) { return ""; }
}
function pageHTML(page, code, metaPartage, badgeTexte, pixels) {
  let h = String(page.html || "");
  /* la fiche de partage de Pagéo remplace celle écrite dans le code (évite les doublons) */
  h = h.replace(/<meta[^>]+(?:property|name)=["'](?:og:|twitter:)[^>]*>/gi, "");
  const c = page.contenu || {};
  const donnees = { cfg: { url: SUPABASE_URL, cle: SUPABASE_CLE_PUBLIQUE, id: page.id, red: page.redirection || "", type: page.type, avis: !!c.avis, badge: "" },
                    bd: c.badge || null, code, badgeTexte, px: pixels || null };
  const json = JSON.stringify(donnees).replace(/</g, "\\u003c");
  const suivi = `<script>${KIT}\n;pageoDemarrer(${json});</script>`;
  const ib = h.toLowerCase().lastIndexOf("</body>");
  h = ib >= 0 ? h.slice(0, ib) + suivi + h.slice(ib) : h + suivi;
  /* téléphone : bonne largeur, et le texte ne grossit pas tout seul (navigateur de Facebook) */
  let tete = '<style>html{-webkit-text-size-adjust:100%!important;text-size-adjust:100%!important}img{max-width:100%;height:auto}video,iframe{max-width:100%}</style>' + metaPartage;
  if (!/name=["']viewport/i.test(h)) tete = '<meta name="viewport" content="width=device-width, initial-scale=1">' + tete;
  if (!/<meta[^>]+charset/i.test(h)) tete = '<meta charset="utf-8">' + tete;
  h = /<head[^>]*>/i.test(h) ? h.replace(/<head[^>]*>/i, (x) => x + tete) : tete + h;
  return new Response(h, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=60" } });
}

export async function onRequest(ctx) {
  const { request, next, env } = ctx;
  const url = new URL(request.url);
  const seg = url.pathname.split("/").filter(Boolean);

  // Accueil et liens de parrainage (/?ref=…) : l'image de Pagéo, prise sur la même adresse que le lien
  if (request.method === "GET" && seg.length === 0) {
    const rep = await next();
    if (!(rep.headers.get("content-type") || "").includes("text/html")) return rep;
    const img = url.origin + "/partage-pageo.jpg";
    return new HTMLRewriter()
      .on('meta[property="og:image"]', { element(e) { e.setAttribute("content", img); } })
      .on('meta[name="twitter:image"]', { element(e) { e.setAttribute("content", img); } })
      .transform(rep);
  }

  // Seulement les adresses de pages : /CODE/nom-de-la-page
  if (request.method !== "GET" || seg.length !== 2 || /\.[a-z0-9]{2,5}$/i.test(seg[1])) return next();

  const code = decodeURIComponent(seg[0]), slug = decodeURIComponent(seg[1]);
  const [page, complete, badgeTexte, pixels] = await Promise.all([
    infosPartage(code, slug).catch(() => null),
    appel("page_publique", { p_code: code, p_slug: slug }).catch(() => null),
    reglageBadge(),
    appel("pixels_page", { p_code: code }).catch(() => null),
  ]);
  if (!page && !complete) return next();
  const infos = page || { titre: complete.titre, image: "", type: complete.type }; // page introuvable : comportement habituel

  const titre = infos.titre || "Pagéo";
  const desc = DESCRIPTIONS[infos.type] || DESCRIPTIONS.astuce;
  /* l'image de la page ; sinon l'image de Pagéo */
  const image = /^https?:\/\//i.test(infos.image || "") ? infos.image : url.origin + "/partage-pageo.jpg";
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
  /* page en code HTML : on l'envoie directement (plus rapide, et sans déformation dans Facebook) */
  if (complete && complete.mode === "html" && !complete.bloquee && complete.html) {
    try { return pageHTML(complete, code, meta, badgeTexte, pixels); } catch (e) {}
  }

  const base = await env.ASSETS.fetch(new URL("/", url));
  const reponse = new Response(base.body, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900" },
  });
  return new HTMLRewriter()
    .on("title", { element(e) { e.setInnerContent(titre); } })
    .on('meta[name="description"]', { element(e) { e.remove(); } })
    /* on retire la fiche de partage générale de Pagéo : la page garde SA miniature */
    .on('meta[property^="og:"]', { element(e) { e.remove(); } })
    .on('meta[name^="twitter:"]', { element(e) { e.remove(); } })
    .on("head", { element(e) { e.append(meta, { html: true }); } })
    .transform(reponse);
}
