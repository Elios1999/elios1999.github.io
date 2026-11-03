/* Pagéo — service des notifications (commandes et inscriptions sur le téléphone) */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { titre: "Pagéo", texte: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.titre || "Pagéo", { body: d.texte || "", icon: "/icone-pageo-192.png", badge: "/icone-pageo-192.png", tag: "pageo-" + Date.now(), data: { lien: d.lien || "/#commandes" }, vibrate: [200, 100, 200] }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close(); const lien = (e.notification.data && e.notification.data.lien) || "/#commandes";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(l => { for (const c of l) { if ("focus" in c) { c.navigate(lien).catch(() => {}); return c.focus(); } } return self.clients.openWindow(lien); }));
});
