/* Carnet sport hors ligne : la page s'affiche tout de suite depuis le cache et se met à jour en arrière-plan ;
   les photos des exercices (cdn.jsdelivr.net) sont gardées une fois vues. */
const VERSION = 'carnet-v1';
const COQUILLE = ['./', './index.html', './manifest.webmanifest', './icone-180.png', './icone-192.png', './icone-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(COQUILLE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== 'photos').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (url.origin === location.origin){
    const reseau = fetch(r).then(rep => { if (rep.ok){ const copie = rep.clone(); caches.open(VERSION).then(c => c.put(r, copie)); } return rep; });
    e.waitUntil(reseau.catch(() => {}));
    e.respondWith(caches.match(r, {ignoreSearch:true}).then(m => m || reseau.catch(() => caches.match('./index.html'))));
  } else if (url.hostname === 'cdn.jsdelivr.net'){
    e.respondWith(caches.open('photos').then(c => c.match(r).then(m => m || fetch(r).then(rep => { if (rep.ok) c.put(r, rep.clone()); return rep; }))));
  }
});
