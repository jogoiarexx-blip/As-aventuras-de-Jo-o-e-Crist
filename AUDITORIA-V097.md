# João & Crist — Evolução v0.9.7 (30/10/2026)

## Resumo
Rodada de estabilidade, retomada de partidas e validação dos carregadores da campanha, mantendo os oito níveis, três bônus, sistema de evolução e chave de save existentes.

## Correções implementadas
1. **Pausa → menu (atalho Q):** a saída agora usa o mesmo encerramento de fase do menu de pausa. O temporizador global não permanece congelado quando se começa outra partida.
2. **Limpeza de sessão:** retorno ao menu cancela os timers e libera o grupo da fase e grupos dos bônus, desmonta listeners de boate, encerra o estado da pescaria e reseta sequência do ônibus.
3. **Ônibus / bônus / campanha:** após a animação de chegada à Fase 3, os assets do minijogo do ônibus são liberados. A etapa de embarque anterior deixa de persistir entre partidas, e o jogo recarrega sprites após a liberação de recursos.
4. **Boate independente:** voltar ao seletor/menu libera também o grupo de assets da fase anteriormente carregada, evitando referência de cena antiga.
5. **Controles touch:** libera ação apenas após todos os dedos soltarem um botão, ignorando `pointercancel`/`lostpointercapture` duplicados.
6. **Ponte de estado:** reatribuir `window.players = window.players` (ou inimigos, partículas, etc.) deixa de limpar acidentalmente o array original.
7. **Cache de publicação:** `sw.js` recebeu nova chave de versão `joao-crist-v097-20261030` para renovar os arquivos de produção.
8. **QA no navegador:** `tests/qa-v097.html` pode validar carga simulada das oito fases e bônus e permite verificar HTTP HEAD de todas as imagens dos manifests sem baixar imagens inteiras.

## Antes e depois

| Item | Antes | Depois |
| --- | --- | --- |
| Atalho Q na pausa | saia para menu sem limpar recursos ou reativar timers | saída completa, timers reativados e assets liberados |
| Retorno do clube | referências da fase anterior podiam permanecer | liberação completa do nível para menu/seletor |
| Ônibus | estado de embarque e flag de assets podiam sobreviver à mudança de jogo | reset e novo carregamento de assets se descartados |
| Chegada à Fase 3 | recursos do ônibus ainda retidos | liberação após concluir animação de chegada |
| Multitouch | primeiro dedo liberado podia cancelar botão ainda pressionado | ação persiste enquanto qualquer dedo está no botão |
| Reatribuição de arrays globais | setter podia apagar conteúdo se origem e destino fossem mesmo array | setter não altera referência idêntica |

## Testes reproduzidos

- Sintaxe JavaScript: seis módulos testados (6/6).
- Campanha: construtores reais de oito fases avaliados e oito transições executadas com carregador de arquivos simulado (8/8).
- Bônus: ônibus, boate e pescaria testados com carregador simulado (3/3).
- Arquivos: manifests dos onze cenários referenciam 317 caminhos de imagens (241 distintos); todos presentes na árvore GitHub (317/317).
- Ponte global: teste de reatribuição idêntica e substituição com cópia.
- Ônibus: teste isolado de reentrada após descarte do cache e reset do embarque.
- Limpeza ao menu: teste isolado comprova retomada do gerenciador de timers e liberação de recursos.
- Touch: simulação isolada de dois toques no mesmo botão, soltura parcial, cancelamento duplicado e liberação total (5/5).

## Não testado
Não houve sessão jogada no navegador real, nem FPS medido em dispositivo, nem conclusão de fases/chefes. Os testes de carregamento simulam sucesso de imagens e sons, portanto não comprovam a ausência de problemas de renderização ou gameplay. O formulário `tests/qa-v097.html` permite verificar arquivos reais servidos por HTTP, mas esse teste manual ainda não foi acionado aqui.

## Próximas prioridades
- Testar Fase 1 → 2 → ônibus → 3, até vitória na Fase 8.
- Testar retorno de cada bônus para menu e repetição no mesmo navegador.
- Medir FPS/uso de memória em Android com 1 e 2 jogadores; comparar antes/depois.
- Verificar save e checkpoint em reabertura do navegador, com e sem rede.
- Diminuir custo de renderização de bosses e reduzir imagens duplicadas apenas após mapear todas as referências.
