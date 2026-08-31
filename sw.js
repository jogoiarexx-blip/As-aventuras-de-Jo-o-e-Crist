const VERSION='joao-crist-v095-club-assets-3';
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
  './js/game-hardening.js',
  './js/game-log.js',
  './js/game-over.js',
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
  './js/sound-system.js',
  './js/story-cutscenes.js',
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
  './assets/players/joao/joao-16bit.webp',
  './assets/players/crist/frames/idle1.webp',
  './assets/players/chico/frames/idle1.webp'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url); if(u.origin!==location.origin)return;

  // Requisições Range (áudio/vídeo e alguns assets grandes) podem responder 206.
  // Cache Storage não aceita respostas parciais, então elas seguem direto pela rede.
  if(e.request.headers.has('range')){
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
    return;
  }

  e.respondWith(caches.match(e.request).then(hit=>{
    const network=fetch(e.request).then(r=>{
      // Só armazena respostas completas. Nunca tenta cache.put() com status 206.
      if(r && r.status===200){
        const copy=r.clone();
        const cacheWrite=caches.open(VERSION)
          .then(c=>c.put(e.request,copy))
          .catch(()=>{}); // falha de cache não pode derrubar o jogo
        e.waitUntil(cacheWrite);
      }
      return r;
    }).catch(()=>hit||caches.match('./index.html'));
    return hit||network;
  }));
});
