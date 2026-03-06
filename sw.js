const CACHE_NAME = 'gamaflak2-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icon.png' // Ajoute ici toutes tes ressources (images, sons)
];

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW enregistré !'))
      .catch(err => console.log('Erreur SW:', err));
  });
}



// Installation : Mise en cache des fichiers
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache ouvert');
      return cache.addAll(ASSETS);
    })
  );
  // Force le SW à devenir actif immédiatement
  self.skipWaiting();
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Ancien cache supprimé');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Prend le contrôle des pages ouvertes immédiatement
  return self.clients.claim();
});

// Fetch : Stratégie "Cache First, Network Fallback"
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retourne le fichier du cache s'il existe, sinon fait la requête réseau
      return response || fetch(event.request).catch(() => {
        // Optionnel : page de secours si réseau coupé et pas en cache
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
