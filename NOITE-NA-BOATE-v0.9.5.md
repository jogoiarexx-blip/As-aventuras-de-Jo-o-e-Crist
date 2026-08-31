# João & Crist v0.9.5 — Noite na Boate

## Integração
- Fase especial inserida entre Fase 5 (Vegas) e Fase 6 (Cassino), sem renumerar as 8 fases existentes.
- Reutiliza o LevelManager para carregamento sob demanda e cleanup.
- Combate reaproveita os players, EnemyFactory, colisões, dano, knockback, HUD e controles existentes.

## Fluxo
Chegada -> escolha/confirmacao -> DJ Neon -> Fenix -> Rei da Pista -> segurancas -> 3 ondas -> Chefe da Seguranca -> final -> Fase 6.

## Dança
- 4 trilhas (esquerda/cima/baixo/direita).
- Teclado: setas e WASD.
- Gamepad: direcional/analogico via sistema existente.
- Celular: 4 botoes grandes desenhados na fase.
- Timing real: PERFEITO/BOM/ERRO, combo, multiplicador, score e HYPE.
- Retry do duelo atual sem reiniciar a fase.

## Save e trofeus
- melhor HYPE por duelo;
- melhor score por duelo;
- maior combo;
- conclusao da boate;
- chefe derrotado;
- 4 trofeus integrados ao TrophySystem.

## Arquivos criados
- js/club-sequence.js
- NOITE-NA-BOATE-v0.9.5.md

## Arquivos modificados
- index.html
- js/main.js
- js/level-loader.js
- js/save-system.js
- js/trophy-system-final.js
- js/game-global-bridge.js
- js/touch-controls.js
- sw.js


## Ajuste do seletor
- A Noite na Boate agora aparece no Seletor de Fases como **BÔNUS — NOITE NA BOATE**.
- Continua marcada internamente como conteúdo bônus e não altera a numeração das fases principais.

## Organização de assets — revisão
Os recursos específicos do bônus foram separados em `assets/bonus/boate/`, com subpastas `enemies/`, `ui/` e `sounds/`. O `LevelManager` carrega esses recursos sob demanda ao entrar na boate. Sprites globais dos personagens jogáveis permanecem compartilhados para evitar duplicação desnecessária.
