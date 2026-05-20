const CACHE_NAME = 'devserver-cache-v1';

// Arquivos base que serão salvos no cache para funcionamento offline
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Evento de Instalação: Salva a estrutura no cache assim que acessado
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Evento de Ativação: Limpa caches antigos se você atualizar a versão (v1 -> v2)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

// Evento Fetch: Tenta pegar do cache primeiro para economizar rede/offline.
// Como usamos bibliotecas via CDN (Tailwind, Phosphor), elas buscarão da rede se não estiverem no cache.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se encontrar, senão busca da internet
        return response || fetch(event.request);
      })
  );
});