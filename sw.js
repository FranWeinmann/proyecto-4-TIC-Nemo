const CACHE_NAME = 'nemo';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/manifest.json',
  '/img/logo.png',
  '/img/human.png',
  '/img/robot.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.hostname === "nemo.proyecto-nemo.vercel.app") {
    return; 
  }
});


self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});  