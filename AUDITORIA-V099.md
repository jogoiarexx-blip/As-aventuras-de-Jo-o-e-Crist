# João & Crist — auditoria e evolução v0.9.9

**Data:** 30/10/2026  
**Branch:** `main`  
**Escopo:** estabilidade gráfica de chefes, consumo do carregador e diagnóstico opcional de FPS.

## Problemas corrigidos

### 1. Erro de renderização causava morte artificial de inimigo/chefe

**Antes:** no `js/main.js`, a exceção lançada durante `enemy.draw(ctx)` fazia `enemy.life=0; enemy.dead=true`. Isso podia registrar uma vitória fictícia sobre chefe se houvesse erro de sprite.

**Depois:** a falha de renderização aciona uma silhueta temporária, mantendo a entidade viva, atingível e com colisão; o desenho real é tentado de novo a cada 1,5 segundo. O log completo é emitido apenas na primeira falha por entidade.

Se a atualização lógica `enemy.update()` de um **chefe** lançar erro, a exceção passa ao guarda geral do game loop, que exibe uma tela de recuperação. Assim o jogo não vence sem luta; inimigos comuns continuam com a antiga política de remoção por falha de IA.

### 2. Explosão de carregamentos simultâneos

**Antes:** `AssetManager.loadGroup` criava uma Promise para **todos** os recursos ao mesmo tempo. Em níveis com 40–60 imagens, isso pode exigir muitos decodificadores simultâneos.

**Depois:** pool de workers com até **3 imagens** por vez quando `navigator.deviceMemory <= 4` e até **6** por padrão nos demais dispositivos. Há parâmetro opcional `concurrency` entre 1 e 8 para testes. Manifests, assinaturas públicas e tratamento de erro preservados.

### 3. Não havia leitura de FPS real acessível sem debug interno

Adicionado diagnóstico opt-in com `?perf=1` — HUD pequeno, não intercepta toques e fica invisível na URL normal. Exibe FPS medido pelo loop, custo do quadro, máximo observado, qualidade, fase, quantidade de inimigos e uso de heap JS quando o navegador disponibiliza `performance.memory`.

O diagnóstico é **local**, somente leitura, sem upload de dados e sem alterações de save. Para comparar antes/depois, testar o mesmo trecho do jogo por vários minutos e coletar valores observados.

### 4. Atualização de cache

`sw.js` agora utiliza `joao-crist-v099-20261030` e inclui o diagnóstico opcional na instalação. A limpeza de cache segue restrita ao jogo, protegendo outros projetos no domínio do GitHub Pages.

## Testes realmente executados — isolados, não gameplay

| Teste | Resultado |
| --- | --- |
| Carregamento de 42 arquivos com limite de 3 tarefas ativas | Passou |
| Cada arquivo só processado uma vez e progresso monotônico até 100% | Passou |
| Limite explícito de 5 tarefas respeitado | Passou |
| Uma imagem com falha mantém detalhes para retry | Passou |
| Falha de sprite não reduz vida do chefe | Passou |
| Log de erro gerado uma única vez | Passou |
| Silhueta temporária sem chamar o renderer falho em todos os frames | Passou |
| Retentativa do renderer depois de 1,5 segundo | Passou |
| Erro de IA de chefe chega ao guarda fatal sem marcá-lo morto | Passou |
| Painel opt-in abre somente com `?perf=1` | Passou |
| Diagnóstico não intercepta entrada de toque | Passou |
| Painel exibe FPS e memória reportados pelos dados simulados | Passou |

**Resultados:** 10 verificações no módulo de carregamento/renderização + 5 verificações no painel = **15 testes isolados passaram**. Os scripts alterados foram compilados sintaticamente antes do commit. `tests/qa-v099.html` acrescenta testes executáveis no navegador, ainda não reproduzidos em um browser real neste ambiente.

## Como validar na publicação

1. Abra o jogo com `?perf=1` (ex.: `https://jogoiarexx-blip.github.io/As-aventuras-de-Jo-o-e-Crist/?perf=1`).
2. Jogue cada boss: Coronel (3), Rei de Vegas (5), Engenheiro (6), Sombra (7), Deus das Apostas (8).
3. Compare FPS e pior custo de quadro com poucos e muitos inimigos, e antes/depois de mudar a qualidade gráfica.
4. Reinicie a sessão, volte a fases anteriores e ao minijogo do ônibus; confira se os assets são recarregados e o save foi preservado.
5. Rode `tests/qa-v099.html`, incluindo as verificações manuais de recursos HTTP.
6. Teste 1 e 2 jogadores, Android e desktop. Reinicie a aplicação após atualização do Service Worker para garantir nova versão.

## Limitações / próximas prioridades

**Não houve reprodução de gameplay do início ao fim, execução direta em hardware Android, captura de FPS real, medição de memória de processos ou validação da propagação no GitHub Pages.** O limite de concorrência é uma mudança estrutural que deve reduzir picos de carregamento, mas ganhos reais ainda precisam ser medidos.

Próxima rodada: avaliar FPS e RAM observados em aparelhos reais e auditar as falhas dos chefes/ondas a partir dos logs reproduzidos. Preservar o comportamento atual do combate, progressão e checkpoints.
