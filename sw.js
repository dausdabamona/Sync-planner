/**
 * Sync Planner v4.2 - Service Worker
 * Offline support & caching
 */

const CACHE_NAME = 'sync-planner-v4.2';
const ASSETS = [
  './',
  './index.html',
  './css/main.css',
  './css/dzikir-fullscreen.css',
  './js/config.js',
  './js/utils.js',
  './js/api.js',
  './js/ui.js',
  './js/dzikir.js',
  './js/app.js',
  './manifest.json'
];

// Install
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.allSettled(
          ASSETS.map(url => 
            cache.add(url).catch(err => console.log('[SW] Cache skip:', url, err))
          )
        );
      })
      .then(() => {
        console.log('[SW] Installed');
        return self.skipWaiting();
      })
  );
});

// Activate
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => {
      console.log('[SW] Activated');
      return self.clients.claim();
    })
  );
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API requests (always fetch fresh)
  if (event.request.url.includes('script.google.com')) return;
  
  // Skip Google APIs
  if (event.request.url.includes('googleapis.com')) return;
  if (event.request.url.includes('gstatic.com')) return;
  
  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone and cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, clone))
            .catch(() => {});
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If no cache for HTML, return index.html
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
            
            // Return offline response
            return new Response('Offline', { 
              status: 503, 
              statusText: 'Service Unavailable' 
            });
          });
      })
  );
});

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
