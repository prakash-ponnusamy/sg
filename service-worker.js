importScripts('cache-polyfill.js');
var dataCacheName = 'weatherData-v1';
var cacheName = 'weatherPWA-step-6-1';
var filesToCache = [
  '/',
  'index.html',
  'favicon.ico',
  'styles/inline.css',
  'scripts/main.js'
];

self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
      caches.open(cacheName).then(function (cache) {
          console.log('[ServiceWorker] Caching app shell');
          return cache.addAll(filesToCache);
      })
    );
});

self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
      caches.keys().then(function (keyList) {
          return Promise.all(keyList.map(function (key) {
              if (key !== cacheName) {
                  console.log('[ServiceWorker] Removing old cache', key);
                  return caches.delete(key);
              }
          }));
      })
    );
});

self.addEventListener('fetch', function (e) {
    console.log('[ServiceWorker] Fetch', e.request.url);
    var dataUrl = 'https://socgen-ld.surge.sh/';
    if (e.request.url.indexOf(dataUrl) === 0) {
        e.respondWith(
          fetch(e.request)
            .then(function (response) {
                return caches.open(dataCacheName).then(function (cache) {
                    cache.put(e.request.url, response.clone());
                    console.log('[ServiceWorker] Fetched&Cached Data');
                    return response;
                });
            })
        );
    } else {
        e.respondWith(
          caches.match(e.request).then(function (response) {
              return response || fetch(e.request);
          })
        );
    }
});


self.addEventListener('push', function (event) {
    console.log('Push message', event);

    var title = 'Push message';

    event.waitUntil(
      self.registration.showNotification(title, {
          'body': 'The Message',
          'icon': 'images/icons/icon-32x32.png'
      }));
});


self.addEventListener('notificationclick', function (event) {
    console.log('Notification click: tag', event.notification.tag);
    // Android doesn't close the notification when you click it
    // See http://crbug.com/463146
    event.notification.close();
    var url = 'https://youtu.be/gYMkEMCHtJ4';
    // Check if there's already a tab open with this URL.
    // If yes: focus on the tab.
    // If no: open a tab with the URL.
    event.waitUntil(
      clients.matchAll({
          type: 'window'
      })
      .then(function (windowClients) {
          console.log('WindowClients', windowClients);
          for (var i = 0; i < windowClients.length; i++) {
              var client = windowClients[i];
              console.log('WindowClient', client);
              if (client.url === url && 'focus' in client) {
                  return client.focus();
              }
          }
          if (clients.openWindow) {
              return clients.openWindow(url);
          }
      })
    );
});

