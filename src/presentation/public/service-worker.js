// Event listener for when the service worker is installed
self.addEventListener('install', (event) => {
  // Log that the service worker has been installed
  console.log('Service Worker: Installed');

  // Open a cache called 'app-cache' and add the following URLs to it
  event.waitUntil(
    caches.open('app-cache').then((cache) => {
      return cache.addAll([
        '/', // root URL
        '/icon.png',
        '/favicon.ico',
        '/main.ts',
      ]);
    }),
  );
});

// Event listener for when the service worker receives a fetch event
self.addEventListener('fetch', (event) => {
  // Log that the service worker is fetching a URL
  console.log('Service Worker: Fetching', event.request.url);

  // Respond with a cached response if it exists, otherwise fetch the URL
  event.respondWith(
    caches.match(event.request).then((response) => {
      // If a cached response exists, return it
      if (response) {
        console.log('Service Worker: Found in cache', event.request.url);
        return response;
      }

      // If no cached response exists, fetch the URL and cache the response
      const fetchRequest = event.request.clone();
      return fetch(fetchRequest).then((response) => {
        // If the response is not valid, return it without caching
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Cache the response and return it
        const responseToCache = response.clone();
        caches.open('app-cache').then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    }),
  );
});

// Event listener for when the service worker is activated
self.addEventListener('activate', (event) => {
  // Log that the service worker has been activated
  console.log('Service Worker: Activated');

  // Remove old caches that start with 'app-' except for 'app-cache'
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName.startsWith('app-') && cacheName !== 'app-cache';
        }).map((cacheName) => {
          return caches.delete(cacheName);
        }),
      );
    }),
  );
});

