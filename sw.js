const VERSION='joao-crist-v0911-20261030';
const CORE=[
  './',
  './index.html',
  './style.css',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon-32.png',
  './favicon-64.png',
  './favicon.ico',
  './assets/music/normal-theme.ogg',
  './assets/music/farm-theme.ogg',
  './assets/music/city-theme.ogg',
  './assets/music/desert-theme.ogg',
  './assets/music/vegas-theme.ogg',
  './assets/music/boss-theme.ogg',
  './assets/music/fishing-theme.ogg',
  './assets/music/final-theme.ogg',
  './assets/effects/hit-spark.webp',
  './assets/effects/explosion-burst.webp',
  './assets/effects/dust-cloud.webp',
  './assets/effects/boss-aura.webp',
  './assets/effects/slash-arc.webp',
  './assets/effects/energy-orb.webp',
  './js/boss-enemies.js',
  './js/boss-expansion.js',
  './js/bus-sequence.js',
  './js/club-sequence.js',
  './js/combat-system-advanced.js',
  './js/controles.js',
  './js/enemy-basic.js',
  './js/enemy-berserker-melhorado.js',
  './js/enemy-ciclista.js',
  './js/enemy-cockroach.js',
  './js/enemy-cowboy.js',
  './js/enemy-elite.js',
  './js/enemy-factory.js',
  './js/enemy-fast.js',
  './js/enemy-sprite-renderer.js',
  './js/enemy-strong.js',
  './js/enemy-tank.js',
  './js/enemy-vegas.js',
  './js/enemy.js',
  './js/evolution-system.js',
  './js/farm-background-16bit.js',
  './js/farm-dog-npc.js',
  './js/fishing-bonus.js',
  './js/game-global-bridge.js',
  './js/performance-monitor.js',
  './js/game-hardening.js',
  './js/game-log.js',
  './js/game-over.js',
  './js/fx-sprite-pack.js',
  './js/gamepad-system.js',
  './js/graphics-upgrade.js',
  './js/hud-v093.js',
  './js/level-loader.js',
  './js/level.js',
  './js/main.js',
  './js/missing-sprites-pack.js',
  './js/player-chico.js',
  './js/player-crist.js',
  './js/player-joao.js',
  './js/regression-guards.js',
  './js/runtime-stability.js',
  './js/save-system.js',
  './js/settings-system.js',
  './js/performance-system.js',
  './js/sound-system.js',
  './js/story-cutscenes.js',
  './js/popup-polish.js',
  './js/story.js',
  './js/touch-controls.js',
  './js/trophy-system-final.js',
  './js/wave-system.js',
  './assets/ui/menu-principal-vegas.webp',
  './assets/ui/loading-screen.webp',
  './assets/ui/pause-menu-vegas.webp',
  './assets/ui/hud-joao-frame.webp',
  './assets/ui/hud-crist-frame.webp',
  './assets/ui/hud-chico-frame.webp',
  './assets/ui/portrait-joao.webp',
  './assets/ui/portrait-crist.webp',
  './assets/ui/portrait-chico.webp',
  './assets/ui/portrait-colonel.webp',
  './assets/ui/portrait-victor.webp',
  './assets/ui/portrait-shadow.webp',
  './assets/ui/portrait-god.webp',
  './assets/ui/portrait-bandido.webp',
  './assets/players/joao/joao-16bit.webp',
  './assets/players/crist/frames/idle1.webp',
  './assets/players/chico/frames/idle1.webp'
];
// Cache separado por jogo: jamais apagar caches de outros projetos no GitHub Pages.
const CACHE_PREFIX = 'joao-crist-';
const SCOPE_PATH = new URL(self.registration.scope).pathname;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== VERSION)
            .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE_PATH)) return;

  // Cache Storage não deve armazenar respostas parciais (HTTP 206).
  if (request.headers.has('range')) return;

  const saveValidResponse = response => {
    if (!response || response.status !== 200) return response;
    const copy = response.clone();
    event.waitUntil(
      caches.open(VERSION).then(cache => cache.put(request, copy)).catch(() => {})
    );
    return response;
  };

  if (request.mode === 'navigate') {
    // HTML novo primeiro, menu antigo apenas quando realmente sem conexão.
    event.respondWith(
      fetch(request).then(saveValidResponse)
        .catch(async () => (await caches.match(request)) || (await caches.match('./index.html')) || Response.error())
    );
    return;
  }

  // Scripts, imagens e sons: nunca devolver HTML no lugar de um arquivo.
  event.respondWith(
    caches.match(request).then(hit => hit || fetch(request).then(saveValidResponse))
  );
});
