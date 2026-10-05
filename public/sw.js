const CACHE_NAME = 'ats-optimizer-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './favicon.jpg',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.1/marked.min.js'
];

self.addEventListener('install', event => {
  // Força o novo service worker a se ativar imediatamente
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache v2');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  // 1. Ignorar requisições que não sejam GET (como os POSTs do Firebase)
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. Ignorar APIs do Firebase / Google (evita pendurar conexões WebSockets e Long-polling)
  const url = new URL(event.request.url);
  if (url.hostname.includes('firestore.googleapis.com') || url.hostname.includes('firebase')) {
    return;
  }

  event.respondWith(
    // Estratégia: Network First (Tenta a rede, se falhar ou estiver offline, usa o cache)
    fetch(event.request).then(response => {
      // Só faz cache se a resposta for bem sucedida
      if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
        return response;
      }
      
      const responseToCache = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, responseToCache);
      });
      
      return response;
    }).catch(() => {
      return caches.match(event.request).then(response => {
        if (response) return response;
        if (event.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Faz com que a nova versão assuma o controle de todas as páginas abertas imediatamente
      return self.clients.claim();
    })
  );
});
