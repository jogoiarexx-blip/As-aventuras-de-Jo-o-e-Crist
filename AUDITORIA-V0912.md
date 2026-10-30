# Auditoria geral + desenvolvimento da história — João & Crist v0.9.12

**Data:** 30/10/2026  
**Repositório:** `jogoiarexx-blip/As-aventuras-de-Jo-o-e-Crist`  
**Objetivo original:** dois velhinhos do interior ganham na loteria e realizam o sonho de conhecer Las Vegas; acidentes e imprevistos com bicicleta, ônibus, boate e confusões pelo caminho.

## Evolução nova da história e jogabilidade (v0.9.12)

### História, antes e depois
**Antes:** o início de `js/story.js` e `js/story-cutscenes.js` convocava antigos campeões para um torneio de US$10 milhões. O sonho da loteria não aparecia como motivação inicial.

**Depois:** a primeira cena agora apresenta João e Crist na fazenda, a confirmação do bilhete premiado, o desejo de conhecer Vegas e a despedida de Pantera. O fim da Fase 1 explicita o preparo da viagem. Existe uma nova cena `cityArrival` antes da Fase 2; a chegada ao deserto menciona que a dupla embarcou no ônibus errado com artistas a caminho de um espetáculo. Diálogos mantêm humor sem transformar identidade de gênero ou orientação sexual em insulto.

O texto introdutório em `js/story.js` e os resumos das Fases 1 e 2 foram adaptados à premissa; a história posterior de Victor, Sombra e Deus das Apostas permanece por enquanto, de modo que **a adaptação narrativa do game inteiro ainda está incompleta**.

### Gameplay novo
- **Fase 1:** coletar bilhete premiado (x=330), malas (x=660), documentos (x=995). Coleta ao se aproximar a pé; suporte a 1 ou 2 jogadores; HUD 0/3, 1/3, 2/3, 3/3. A saída da fase só é liberada quando **os 3 itens** e o combate com todos os inimigos tiverem sido concluídos. O objetivo reinicia em replay; save mantém o checkpoint no começo da fase e não muda o schema.
- **Fase 2:** evento de bicicleta acionado ao passar x=1120; aviso de 65 ticks, ciclista movendo-se da direita para a esquerda, **um único possível impacto de 8 pontos de dano**, evitável ao sair da trajetória ou ficar no ar. A cena termina mesmo se ninguém sofrer dano, sem impedir o ônibus existente.
- **Visual:** ícones de bilhete, mala e passaporte desenhados no Canvas sem arquivos adicionais; bicicleta desenhada com primitivas 2D. A arquitetura continua Canvas 2D estilo 16-bit, **não foi migrada para Three.js**.
- **Integração:** `js/early-adventure.js` criado, incluído no `index.html`, pré-cacheado no PWA, conectado ao loop de gameplay, desenho em coordenadas do mundo, HUD, carregamento e limpeza de fase.
- A versão e o cache passam a `v0.9.12` e `joao-crist-v0912-20261030`.

## Histórico verificável de evolução e correções desde o início deste ciclo

| Revisão | Mudanças efetivamente registradas | Situação dos problemas |
| --- | --- | --- |
| Base até v0.9.5 | Já havia 8 fases, bosses, bônus de ônibus, pescaria e boate, campanha Canvas 2D | Sistemas existentes, não comprovadamente vencidos numa partida integral |
| **v0.9.6** | Qualidade gráfica adaptativa, espaçamento de IA distante, culling; liberação de teclas após perda de foco; cache PWA isolado | Corrigidos no código e em simulações; FPS e Android não medidos |
| **v0.9.7** | Limpeza de timers e assets ao sair da pausa/menu; reset e recarregamento do ônibus; multitouch; setters da ponte global; simulação de 8 fases e 3 bônus | Simulações passaram; falta teste jogando |
| **v0.9.8** | Gate da Fase 3 após ônibus, retry do ônibus no checkpoint e preservação de saves antigos/cooperativos | Fluxo de replay e migração reproduzidos em testes isolados; ciclo real ainda pendente |
| **v0.9.9** | Erro de sprite não mata boss artificialmente; silhueta temporária; limite de carregamentos 3 (celular com pouca RAM) ou 6 (padrão); overlay `?perf=1` | 15 testes isolados; sem benchmark de RAM/FPS real |
| **v0.9.10** | Choque do Engenheiro, teto de drones/clones/servos e controle por tempo da chuva de projéteis; 4 ondas simuladas para cada fase 6–8 | 14 simulações de boss/onda; falta jogabilidade completa |
| **v0.9.11** | Cenas sem callback duplo, cancelamento seguro, `seen` após término, vitória salva ao concluir a história, tela final estável | 25 simulações, incluindo transição Fase 7→8→ending; browser real ainda não testado |
| **v0.9.12** | Origem da loteria, objetivos da Fase 1, introdução da rodoviária/Fase 2, bicicleta e atualização de textos iniciais | 11 testes isolados do módulo e 1 simulação de transição Fase 1→2 aprovados; requer teste manual |

## Diagnóstico de pendências: corrigido não é igual a comprovado em gameplay

| Problema | Status técnico | Evidência / Limitação |
| --- | --- | --- |
| História original não corresponde à campanha | **Parcialmente corrigida** | Abertura e fases iniciais agora falam da loteria. Antagonistas e desfecho do torneio ainda exigem harmonização |
| Objetivos / interatividade da Fazenda | **Implementados** | 3 objetos coletáveis, gate de avanço e HUD; validar jogando a fase toda |
| Imprudência do ciclista na cidade | **Implementada** | Evento com aviso, deslocamento, uma colisão possível e desvio; validar sensação de jogo |
| Fase 2→ônibus→Fase 3 travava / falhava gate | **Correção no código, validação real pendente** | Retry/reset e teste dinâmico isolado na v0.9.8 |
| Save/checkpoints antigos | **Correção no código, validação real pendente** | Migração e dois personagens testados em memória |
| Pausa, foco, touch, assets e cache | **Correções no código, validação real pendente** | Testes isolados v0.9.6–0.9.7; hardware não verificado |
| Boss derrotado artificialmente por erro gráfico | **Corrigido no código** | Teste de vida preservada v0.9.9; real sprite failure não reproduzido no navegador |
| Invocações infinitas de bosses e chuva repetida | **Corrigido no código** | Testes com classes dos bosses reais e players simulados v0.9.10 |
| Vitória e callbacks de cenas duplicados | **Corrigido no código** | Testes isolados e integração simulada v0.9.11 |
| Travadas/FPS/memória em Android | **Não comprovado** | Há otimizações e medidor `?perf=1`, mas não há FPS antes/depois medido |
| Port para Three.js | **Não realizado nesta base** | O jogo atual é Canvas 2D; seria uma mudança substancial de engine |
| Jogar da Fase 1 à 8, todos os bosses, boate e ônibus | **Não verificado** | Não houve playthrough manual integral neste ambiente |
| Cache publicado no GitHub Pages e modo offline | **Pendência de validação externa** | Commits confirmados na `main`; ainda precisa testar o SW e o conteúdo servido em dispositivos |

## Testes efetivamente executados nesta revisão

- **11/11 simulações do módulo EarlyAdventure:** gate da Fazenda, coleta de 3 itens, cooperativo, limpeza de replay, alerta/movimento/fim da bicicleta, um único impacto, desvio no ar e renderização independente de assets.
- **1/1 simulação de transição com a função `nextLevel()` real**: registrou `farmFarewell` antes de carregar índice 1, seguiu para `cityArrival` e saiu em `STORY_LEVEL`. No cenário simulador, `recordLevelCompletion` foi chamado duas vezes (na entrada e no callback), mas o método de produção é idempotente via Set e só contabiliza uma vez.
- `tests/qa-v0912.html` mantém testes anteriores e adiciona verificações da origem da loteria, objetivos, dois jogadores, bicicleta e integração de scripts. A presença de testes programados não significa que tenham sido executados em navegador real.
- Sintaxe de novos e alterados JS validada antes dos commits. Ainda é necessário comparar visual, responsividade e colisões com um navegador e controles reais.

## Próximo bloco de história recomendado

A continuação narrativa deve concentrar-se no **ônibus errado**: encontrar a plataforma, embarcar em meio a artistas/excursão, descobrir o destino inesperado, criar escolhas cômicas e aterrissar na rota para Vegas. Em seguida, adaptar a boate como uma aventura com personagens e motivos próprios — sem ridicularizar seus frequentadores. **Uma fase por vez**, mantendo tudo o que funciona.

## Links
- Jogo: https://jogoiarexx-blip.github.io/As-aventuras-de-Jo-o-e-Crist/
- QA: https://jogoiarexx-blip.github.io/As-aventuras-de-Jo-o-e-Crist/tests/qa-v0912.html
- Medidor FPS: https://jogoiarexx-blip.github.io/As-aventuras-de-Jo-o-e-Crist/?perf=1
