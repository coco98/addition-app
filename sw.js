const STATIC_CACHE = 'bridge-game-static-v1';
const DYNAMIC_CACHE = 'bridge-game-dynamic-v1';

// Static assets that rarely change
const STATIC_ASSETS = [
  './background.png',
  './plank.png', 
  './again.png',
  './jungle-monkey-platformer/1-Sprites/Character-Spritesheets/1-Idle/Idle.png',
  './jungle-monkey-platformer/1-Sprites/Character-Spritesheets/2-Run/Run.png',
  './jungle-monkey-platformer/1-Sprites/Character-Spritesheets/3-Jump/Jump.png',
  './manifest.json'
];

// Dynamic assets that should be fresh in dev, cached for offline
const DYNAMIC_ASSETS = [
  './',
  './index.html',
  './game.js'
];

// Helper function to check if we're in development mode
function isDevelopmentMode(url) {
  const urlObj = new URL(url);
  return urlObj.searchParams.get('dev') === 'true';
}

// Helper function to check if request is for static asset
function isStaticAsset(url) {
  const pathname = new URL(url).pathname;
  return pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i);
}

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', event => {
  const url = event.request.url;
  const isStatic = isStaticAsset(url);
  const isDev = isDevelopmentMode(url);
  
  // Static assets: Cache-first (good for performance)
  if (isStatic) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request)
            .then(fetchResponse => {
              const responseClone = fetchResponse.clone();
              caches.open(STATIC_CACHE).then(cache => {
                cache.put(event.request, responseClone);
              });
              return fetchResponse;
            });
        })
    );
    return;
  }
  
  // Dynamic assets: Strategy depends on mode
  if (isDev) {
    // Development mode: Always try network first, minimal caching
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Only use cache if network completely fails
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                console.log('Using cached fallback in dev mode for:', url);
                return cachedResponse;
              }
              if (event.request.destination === 'document') {
                return caches.match('./index.html');
              }
            });
        })
    );
  } else {
    // Production mode (default): Network-first with cache fallback
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Fallback for HTML requests
              if (event.request.destination === 'document') {
                return caches.match('./index.html');
              }
            });
        })
    );
  }
});

// Listen for messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});