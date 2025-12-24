const CACHE_NAME = 'bridge-game-v' + Date.now(); // Always use new cache
const urlsToCache = [
  './',
  './index.html',
  './game.js',
  './background.png',
  './plank.png', 
  './again.png',
  './jungle-monkey-platformer/1-Sprites/Character-Spritesheets/1-Idle/Idle.png',
  './jungle-monkey-platformer/1-Sprites/Character-Spritesheets/2-Run/Run.png',
  './jungle-monkey-platformer/1-Sprites/Character-Spritesheets/3-Jump/Jump.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Ensure the new service worker takes control immediately
  self.clients.claim();
});

// Fetch event - always fetch fresh JS/CSS, cache other resources
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // For JS and CSS files, always fetch from network (no caching)
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(
      fetch(event.request.url + '?v=' + Date.now())
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // For other files, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});