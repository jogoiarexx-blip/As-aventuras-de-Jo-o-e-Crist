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

## Atualização de jogabilidade da boate

- Duelo agora possui placar do jogador x rival em tempo real.
- Sequências de notas usam padrões definidos por duelo e BPM, reduzindo aleatoriedade visual.
- HYPE reage ao desempenho; ao atingir 100 ativa FEVER MODE por 6 segundos com multiplicador de pontos.
- Público e NPC acompanhante reagem ao HYPE, combos, PERFEITO e ERRO.
- Cada duelo exibe ranking e estatísticas.
- Após os 3 duelos há resultado geral com rank S/A/B/C/D.
- A transição para a luta ganhou entrada cinematográfica dos Seguranças de Vegas.
- O combate e assets existentes foram preservados.


## v0.9.5g — Duelo avançado
- Entrada VS antes de cada rival.
- Duelos 2 e 3 recebem notas duplas 2X.
- Receptores piscam no acerto.
- PERFEITO recebe flash e pulso visual.
- Duelos mantêm HYPE/FEVER, ranking e combate de segurança.
