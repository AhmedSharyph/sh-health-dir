const CACHE_NAME = 'health-directory-cache-v1';
const urlsToCache = [
  'https://ahmedsharyph.github.io/sh-health-dir/',
  'https://ahmedsharyph.github.io/sh-health-dir/index.html',
  'https://ahmedsharyph.github.io/sh-health-dir/manifest.json',
  'https://ahmedsharyph.github.io/sh-health-dir/icon-192x192.png',
  'https://ahmedsharyph.github.io/sh-health-dir/icon-512x512.png',
  'https://ahmedsharyph.github.io/sh-health-dir/logo.png',
  'https://cdn.tailwindcss.com',
  'https://ahmedsharyph.github.io/sh-health-dir/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
