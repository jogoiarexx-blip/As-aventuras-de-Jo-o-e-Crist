# Auditoria de evolução João & Crist — v0.9.11

**Data:** 30/10/2026  
**Projeto:** João & Crist: Rumo a Vegas  
**Escopo:** transições da Fase 7 à Fase 8, cutscenes, persistência da vitória e apresentação do final.

## Resumo técnico antes / depois

| Subsystem | Antes | Depois |
|---|---|---|
| Cenas ausentes | `StoryCutsceneManager.start()` podia chamar `onComplete` ao encontrar cena inexistente, e `startStoryScene()` invocava a continuação **novamente** ao receber `false` | `startStoryScene()` usa callback **idempotente**, acionando o avanço uma só vez |
| Cena interrompida | Cenas eram marcadas como `seen` **na abertura**, mesmo que interrompidas | Cenas só entram no Set de assistidas ao **terminar ou serem puladas voluntariamente** |
| Voltar ao menu | Sem `cancel()` para invalidar callbacks de história pendentes | `releaseCurrentLevelForMenu()` chama `storyCutscenes.cancel()` sem executar a continuação antiga |
| Encerramento invocado repetidamente | Possível novo `start('ending')` enquanto o encerramento estava ativo | Guarda `active.id === 'ending'` impede reiniciar a mesma cena |
| Persistência da vitória | `finishGameWithStory()` gravava `gameCompleted`/limpava checkpoint; `drawVictory()` chamava o commit restante (tempo, pontuação e som), dependente de desenhar outra tela | `finishGameWithStory()` chama `commitVictoryOnce()` **ao concluir o encerramento**, com score, tempo, liberação do seletor e limpeza do checkpoint no mesmo caminho idempotente |
| Texto da tela final | “VOCÊ CHEGOU / EM VEGAS!” mesmo após derrotar o Deus das Apostas | “JOÃO & CRIST / VENCERAM VEGAS!” |
| Efeito de brilho final | 100 estrelas em posições totalmente aleatórias **a cada quadro**, com flicker e custo inútil | 48 estrelas fixas com opacidade pulsante; sem teletransporte a cada frame |

## Testes reproduzidos neste turno

### Gerenciador de narrativa
- Iniciar a cena `ending` não a marca como assistida antes da conclusão.
- Cancelar não marca como assistida, não executa callback e permite exibi-la novamente.
- Concluir uma cena pelo skip registra `seen` e executa callback **uma vez**, mesmo se `finish()` for chamado novamente.
- Cancelar `secretDoor` não avança a fase; terminá-la normalmente avança.
- Callback de cena ausente que já disparou dentro de `start()` é executado **uma única vez**.
- Callback de cena ausente que não disparou dentro de `start()` também executa **uma única vez**.
- Final da história não é salvo antecipadamente; callback registra vitória e muda para `VICTORY`.

**Resultado:** 14/14 testes isolados aprovados.

### Integração de transições e SaveSystem real, com funções do jogo em simulação
- Fase 7 inicia cena `shadowTruth`; Fase 8 não é carregada antecipadamente.
- Conclusão de `shadowTruth` aciona exatamente a transição para índice 7 e cena `godIntro`.
- Conclusão de `godIntro` chega à introdução jogável da fase 8.
- Encerramento inicia sem gravar vitória antecipadamente.
- Checkpoint continua disponível durante o encerramento.
- Conclusão do encerramento muda para estado `VICTORY` e grava `gameCompleted=true`.
- Checkpoint da campanha fica vazio após final.
- `highScore` persiste a pontuação de 34.000 pontos do cenário simulado.
- `highestLevel=8` libera o seletor de fases.
- Segunda tentativa de finalizar não duplica `totalPlaytime`.

**Resultado:** 11/11 verificações de integração simulada aprovadas. **Total: 25 verificações isoladas aprovadas** (não equivalem a completar a campanha num browser).

## QA e publicação

- `tests/qa-v0911.html` preserva os testes anteriores e amplia para **24 testes automáticos programados**, com verificações de cancelamento e gravação final.
- `index.html` atualizado para v0.9.11; `sw.js` com `joao-crist-v0911-20261030`.
- URLs:
  - Jogo: https://jogoiarexx-blip.github.io/As-aventuras-de-Jo-o-e-Crist/
  - Testes: https://jogoiarexx-blip.github.io/As-aventuras-de-Jo-o-e-Crist/tests/qa-v0911.html
  - FPS: https://jogoiarexx-blip.github.io/As-aventuras-de-Jo-o-e-Crist/?perf=1

## Limites e pendências

- **Não houve gameplay completo nem execução real da página QA em um navegador.** A atualização da `main` é confirmada pelo GitHub, mas a propagação no GitHub Pages depende do deploy.
- O sistema de `seen` continua por sessão. Ao recarregar a página uma cena anterior pode ser reexibida, pois o histórico de cutscenes não é um campo persistido no save (deliberadamente não migrado nesta revisão).
- Testar manualmente a cena final, skip, entrada no menu, save e seletor de fases em Android, teclado e gamepad.
- Revalidar a experiência original da história de dois idosos que ganham na loteria e visitam Vegas, pois o roteiro atual inclui um torneio e antagonistas: a evolução narrativa é uma frente separada que ainda necessita trabalho de conteúdo.
- Não há números reais de FPS ou consumo de RAM nesta auditoria.
