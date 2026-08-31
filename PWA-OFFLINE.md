# PWA / Offline

- `manifest.webmanifest` torna o jogo instalável em navegadores compatíveis.
- `sw.js` guarda o CORE na instalação e usa cache em tempo de execução para fases/assets visitados.
- O cache offline no disco é independente do AssetManager na memória: assets de fases antigas continuam podendo ser liberados da RAM.
- Em GitHub Pages, use HTTPS para Service Worker/PWA.
