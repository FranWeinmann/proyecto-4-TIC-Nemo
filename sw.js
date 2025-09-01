const CACHE_NAME = 'nemo';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/manifest.json',
  '/img/logo.png',
  '/img/human.png',
  '/img/robot.png',
  'https://cdn.jsdelivr.net/npm/nipplejs@0.9.0/dist/nipplejs.min.js'

];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});  