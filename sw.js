const VERSION='joao-crist-v100-premium-cinematic';
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
  './assets/bonus/boate/players/joao/dance-sheet-transparent.webp',
  './assets/bonus/boate/players/crist/dance-sheet-transparent.webp',
  './assets/bonus/boate/npcs/crowd/crowd-girl-casual.webp',
  './assets/bonus/boate/npcs/crowd/crowd-guy-black.webp',
  './assets/bonus/boate/npcs/crowd/crowd-girl-pink.webp',
  './assets/bonus/boate/backgrounds/noite-na-boate.webp',
  './assets/bonus/boate/ui/notes/receptor-left.webp',
  './assets/bonus/boate/ui/notes/receptor-up.webp',
  './assets/bonus/boate/ui/notes/receptor-down.webp',
  './assets/bonus/boate/ui/notes/receptor-right.webp',
  './assets/bonus/boate/ui/notes/normal-left.webp',
  './assets/bonus/boate/ui/notes/normal-up.webp',
  './assets/bonus/boate/ui/notes/normal-down.webp',
  './assets/bonus/boate/ui/notes/normal-right.webp',
  './assets/bonus/boate/ui/notes/gold-left.webp',
  './assets/bonus/boate/ui/notes/gold-up.webp',
  './assets/bonus/boate/ui/notes/gold-down.webp',
  './assets/bonus/boate/ui/notes/gold-right.webp',
  './assets/bonus/boate/ui/notes/avoid-left.webp',
  './assets/bonus/boate/ui/notes/avoid-up.webp',
  './assets/bonus/boate/ui/notes/avoid-down.webp',
  './assets/bonus/boate/ui/notes/avoid-right.webp',
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
