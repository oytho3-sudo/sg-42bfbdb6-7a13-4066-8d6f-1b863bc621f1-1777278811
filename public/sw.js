// WICHTIG: Diese Version MUSS bei jedem Deploy geändert werden!
// Service Worker für Offline-Funktionalität und Caching
const CACHE_VERSION = '2026-11-13-11-12';
const CACHE_NAME = `gerlieva-cache-${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - NICHT automatisch aktivieren
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate event - Alte Caches löschen
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network First, fallback to Cache (aber NICHT für API-Calls!)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // WICHTIG: API-Calls und externe Requests NICHT cachen!
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    event.request.method !== 'GET'
  ) {
    // Direkt an Netzwerk weiterleiten ohne Caching
    event.respondWith(fetch(event.request));
    return;
  }

  // Nur statische Assets cachen
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Message event - NUR bei Benutzerbestätigung aktivieren
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});