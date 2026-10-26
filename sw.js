const CACHE_NAME = 'esteira-wen-v3';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Navegação/HTML: sempre busca a versão mais nova na rede primeiro,
  // ignorando o cache HTTP do navegador (cache:'no-store') — sem isso,
  // o Cache-Control do GitHub Pages (max-age=600) podia fazer o fetch()
  // devolver uma resposta "fresca" só pros padrões do HTTP, mas com
  // conteúdo antigo. O cache do Service Worker só entra como fallback
  // se o dispositivo estiver offline.
  if(req.mode === 'navigate' || req.destination === 'document'){
    event.respondWith(
      fetch(req, {cache: 'no-store'})
        .then(res => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // Demais arquivos same-origin (ícones, manifest): cache-first,
  // atualizando o cache em segundo plano a cada visita.
  event.respondWith(
    caches.match(req).then(cached => {
      const networkFetch = fetch(req).then(res => {
        if(res && res.status === 200){
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        }
        return res;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});
