// Service worker mínimo de Antojo.
// Solo hace que la app sea instalable: NO guarda nada en caché ni funciona sin conexión.
// Todas las peticiones van directo a la red, como en una web normal.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (evento) => evento.waitUntil(self.clients.claim()))
