# João & Crist — Auditoria de evolução v0.9.8

**Data:** 30/10/2026  
**Repositório:** `jogoiarexx-blip/As-aventuras-de-Jo-o-e-Crist`  
**Escopo:** recuperação da campanha entre Fase 2 / ônibus / Fase 3, resiliência do ônibus e migração de saves legados.

## Alterações reais

| Subsistema | Antes | Depois |
|---|---|---|
| Gate da Fase 3 | Ao terminar o ônibus abaixo do nível mínimo, a corrida permanecia marcada como concluída e podia bloquear o novo embarque após retornar à Fase 2 | Gate negado libera os assets do ônibus e reseta a corrida; novo carregamento da Fase 2 também reseta o estado |
| Retry do ônibus | Erros internos mantinham a tela de erro sem recuperação | `R`, `Enter` ou toque no canvas reinicia o ônibus, retomando seu checkpoint de 50% quando existe |
| Interface de erro | Indicava apenas preservação do save | Explica controles de recuperação e saída ao menu (`Esc`) |
| Migração de save legado | `gameCompleted` herdado do default impedia identificar saves antigos sem esse campo | Checa diretamente `parsed.gameCompleted`, mantendo intenção antiga baseada em `highestLevel >= 8` quando o campo não existia |
| Save explícito | Necessário não mudar partidas com `gameCompleted:false` | O valor explícito permanece preservado |
| Atualização offline | Mesma chave de cache da versão anterior | Nova chave `joao-crist-v098-20261030`, com limpeza isolada ao jogo |
| QA | Testes v0.9.7 | `tests/qa-v098.html` adiciona verificações isoladas de retomada, gate e saves, preservando a verificação de fases, bônus e 241 recursos distintos |

### Código alterado
- `js/main.js`: reset no início da Fase 2, limpeza após bloqueio na Fase 3 e teclas/toque de recuperação da corrida.
- `js/bus-sequence.js`: método `retryAfterError()` e instruções de recuperação na tela.
- `js/save-system.js`: migração corrigida de `gameCompleted`.
- `index.html`, `sw.js`, `README-GITHUB.txt`, `PWA-OFFLINE.md`: versão e documentação.
- `tests/qa-v098.html`: diagnóstico acessível pelo GitHub Pages com testes em memória isolada.

## Testes realmente reproduzidos em código

1. Save antigo sem `gameCompleted`, com `highestLevel=8`, migra corretamente.
2. Save com `gameCompleted=false` explícito não é marcado como vitória.
3. Checkpoint de dois jogadores, personagens, pontuação e nível sobrevive a nova instância de SaveSystem.
4. Não é possível salvar novo checkpoint de campanha já concluída.
5. `BusSequence.reset()` elimina corrida e embarque antigos.
6. `BusSequence.retryAfterError()` preserva checkpoint interno de progresso 50%.
7. Retry não solicitado não reinicia a corrida.
8. Fase 2 reseta a sequência de ônibus na entrada.
9. Gate da Fase 3 libera os recursos do ônibus quando bloqueado.
10. O código de entrada de teclado e de toque chama a recuperação.
11. **Simulação dinâmica do `loadLevel()`:** Fase 3 negada com nível 2 → liberação da corrida → replay da Fase 2 → progresso no checkpoint de Fase 2 → nova entrada permitida na Fase 3 com nível 3 → checkpoint na Fase 3.

Resultado das primeiras dez verificações: **10/10 passaram**. A décima primeira simulação de transição também passou. Os três scripts modificados compilaram sintaticamente. Os scripts inline da página QA também compilaram sintaticamente.

O carregador de fases e os minijogos foram exercitados em isolamento na revisão anterior (v0.9.7), sem renderização real. Esses resultados não foram convertidos em alegações de gameplay completo.

## Teste manual recomendado

1. Abrir `tests/qa-v098.html`; conferir os testes locais e executar a verificação dos recursos no botão (não altera o save real).
2. Na Fase 2, eliminar os inimigos, acompanhar a chegada do ônibus e embarcar.
3. Jogar até ultrapassar 50%; após falha, confirmar reinício do ponto intermediário.
4. Completar o ônibus com personagem abaixo do nível 3: o gate da Fase 3 deve bloquear o avanço sem prender o retorno à Fase 2.
5. Voltar à Fase 2 e entrar no ônibus novamente; repetir com nível 3+ para confirmar a chegada à Fase 3.
6. Fechar/reabrir o navegador, testar `CONTINUAR CAMPANHA`, controles touch e multiplayer.

## Pendências e limites da evidência

- Não foi possível abrir a versão pública do GitHub Pages com navegador automatizado neste ambiente; a atualização da branch `main` não comprova a propagação do deploy nem que os testes da página QA tenham rodado no navegador.
- Não foi jogada a campanha, nem os três bônus, do início ao fim; não há medições reais de FPS ou RAM no Android.
- O save legado continua usando a regra histórica `highestLevel >= 8` para decidir vitória **somente se não existe um campo explícito**; refinar essa política exigiria um indicador adicional de conclusão para versões antigas.
- Testar a Fase 3 com nível insuficiente é um cenário intencional de progressão, não uma falha de carregamento.

## Próxima prioridade

Teste de jogabilidade real no navegador Android e no desktop, começando pela Fase 2 → Fase 3, seguido da persistência do save e dos bosses avançados. Registrar FPS, memória e falhas reproduzidas antes de alterar dificuldade ou conteúdo.
