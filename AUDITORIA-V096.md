# João & Crist: Rumo a Vegas — Auditoria e evolução v0.9.6

Data: 30/10/2026. Base: branch `main`, versão visual anterior v0.9.5.

## Alterações efetivamente aplicadas

1. **Desempenho adaptativo:** `js/performance-system.js` lê a configuração `graphicsQuality` já usada pelo menu. `index.html` agora importa o módulo e `js/main.js` alimenta suas métricas.
2. **IA distante:** com 10 ou mais inimigos, somente os muito distantes da câmera e sem ações críticas podem ter atualizações de IA espaçadas. Chefes, lacaios de chefes, inimigos atacando/selecionados para atacar e inimigos próximos continuam atualizados normalmente.
3. **Renderização:** a margem de desenho de inimigos passa a seguir a qualidade gráfica escolhida.
4. **Controles:** ao perder foco ou ocultar a página, teclas e touch são liberados para evitar movimento/ataque presos.
5. **PWA:** o service worker agora restringe cache ao escopo deste jogo, limpa somente caches com prefixo `joao-crist-`, faz navegação com preferência por rede e nunca devolve `index.html` como substituto de uma imagem ou script.
6. **Pré-cache:** recursos exclusivos da boate deixam de ser obrigatórios no primeiro install; ainda podem ser armazenados no cache quando utilizados. Recursos básicos, scripts, efeitos e música continuam pré-cacheados.
7. **HTML:** logger carregado antes dos sistemas, script inválido após `</html>` removido e identificador visual alterado para v0.9.6.

## Testes realizados de verdade

- 10 arquivos JavaScript verificados por compilação sintática com `Function`: 10 aprovados.
- 50 scripts relacionados na entrada `index.html`: 50 caminhos encontrados na árvore do repositório.
- 92 recursos do novo CORE PWA: 92 caminhos encontrados.
- 12 verificações isoladas em JavaScript: 12 aprovadas, incluindo IA perto/longe, proteção de chefes e ataques, configuração gráfica, culling de desenho, isolamento de cache, navegação offline e rejeição de HTML como imagem.
- Página de QA para abrir no navegador: `tests/qa-v096.html`.

**Não executado:** partida real no navegador, profiling de FPS em aparelhos reais, travessia das oito fases, multiplayer/cooperativo completo, verificação visual de animações e prova de funcionamento offline completo em dispositivos. Estas verificações permanecem pendentes.

## Riscos e próximos passos

- A IA distante tem sua frequência reduzida, mas não há benchmark de FPS ainda. Comparar em dispositivos lentos e validar que inimigos fora da câmera não bloqueiam ondas/progresso.
- `js/main.js` ainda concentra menu, gameplay, renderização e estados; separar módulos gradualmente sem reescrever de uma vez.
- Existem grupos de assets idênticos; consolidar somente depois de mapear todas as referências.
- Validar teclado, gamepads e touch em dois jogadores, inclusive foco e retomada.
- Exercitar cada transição: fases 1–8, ônibus, pescaria, boate, pause, game over, vitória, checkpoints e saves antigos.
- Testar o PWA atualizado online, offline e após nova publicação, garantindo que os outros jogos do mesmo domínio não sofram alterações.

## Critério de aceite para próxima revisão

Sem regressões nas oito fases e bônus; sem input preso após foco perdido; sem erro de resposta HTML servida como asset; controles preservados; perfil de FPS e uso de memória documentados; relatório de testes jogados com evidência.
