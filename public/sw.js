self.addEventListener('install', (e) => {
    // console.log('[Service Worker] Install');
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    // console.log('[Service Worker] Activate');
    e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
    // Basic fetch handler required for PWA installation
    // console.log('[Service Worker] Fetch', e.request.url);
});
