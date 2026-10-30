# João & Crist — auditoria v0.9.10

**Data:** 30/10/2026  
**Projeto:** João & Crist: Rumo a Vegas  
**Alvo:** bosses, hordas, efeitos e estabilidade de frames nas fases finais.

## Alterações aplicadas

### Engenheiro — Fase 6
- **Antes:** a área de choque verificava `player.y` (topo do sprite). Um personagem com pés no chão e altura de 100 px, por exemplo, ficava fora do limite de 80 px e não recebia choque.
- **Depois:** o cálculo compara os **pés** do personagem `player.y + player.h` ao chão, com margem vertical de 65 px, conservando o estado de invulnerabilidade.
- **Antes:** a cada cooldown eram criados mais 2 drones sem teto de inimigos vivos. 
- **Depois:** máximo simultâneo de **4 drones nas fases 1–2 do boss** e **6 drones na fase 3 do boss**. Ao derrotar drones, novos podem reaparecer no cooldown normal.

### A Sombra — Fase 7
- **Antes:** clones podiam se acumular sem limite durante uma batalha longa.
- **Depois:** limite de **5 clones vivos nas primeiras formas** e **7 clones vivos na forma final**. Os slots vagos voltam a ser preenchidos normalmente, sem tornar a habilidade permanentemente inativa.

### Deus das Apostas — Fase 8
- **Antes:** a habilidade de invocar não possuía limite de servos ativos.
- **Depois:** até **8 servos vivos**, contando os convocados anteriormente.
- **Antes:** a chuva especial da forma final usava `Date.now() % 4000 < 50`, que podia executar várias vezes durante a janela de 50 ms (e perder disparos quando o FPS caía).
- **Depois:** a chuva especial dispara **uma vez por intervalo de 4000 ms**, controlada por `lastRain`, independentemente da quantidade de quadros. As habilidades regulares do boss continuam separadas e usam seus próprios cooldowns.

### Compatibilidade
- Estrutura de waves `WaveSystem` preservada.
- Spawns normais, fases, bosses, checkpoints, saves e progressão não foram substituídos.
- Contagem usa apenas minions vivos com `isBossMinion`, não remove jogadores, NPCs ou inimigos normais.
- Chave PWA atualizada para `joao-crist-v0910-20261030`.
- QA v0.9.10 adiciona verificações isoladas dos três bosses, choque, chuva e quatro ondas de cada uma das fases 6, 7 e 8.

## Testes executados de verdade — simulações isoladas com classes do repositório

| Teste | Resultado |
| --- | --- |
| Engenheiro: máximo 4 drones nas formas 1–2 | PASS |
| Engenheiro: máximo 6 drones na forma 3 | PASS |
| Engenheiro: repõe apenas 2 drones eliminados | PASS |
| Choque: atinge personagem com pés no chão | PASS |
| Choque: não acerta personagem alto no ar | PASS |
| Sombra: máximo de 7 clones na forma final | PASS |
| Sombra: repõe 1 clone morto sem ultrapassar o teto | PASS |
| Deus das Apostas: máximo de 8 servos ativos | PASS |
| Deus das Apostas: repõe servo morto sem ultrapassar o teto | PASS |
| Chuva: 5 projéteis, não duplica nos quadros subsequentes | PASS |
| Chuva: nova emissão com cooldown completo de 4 s | PASS |
| WaveSystem da Fase 6: quatro ondas simuladas e concluídas | PASS |
| WaveSystem da Fase 7: quatro ondas simuladas e concluídas | PASS |
| WaveSystem da Fase 8: quatro ondas simuladas e concluídas | PASS |

**Nota sobre o teste da chuva:** a primeira execução misturou a chuva automática com a habilidade regular de chuva dourada, gerando 7 projéteis extras; a medição foi isolada para cada habilidade e repetida, com resultado esperado de 5, 5, 5, 10 projéteis nos instantes analisados. O código das duas habilidades mantém controles separados.

## Como medir no Android

Acesse `https://jogoiarexx-blip.github.io/As-aventuras-de-Jo-o-e-Crist/?perf=1`, comente o mesmo aparelho antes e depois da atualização, e faça uma sessão nas Fases 6–8 observando **FPS**, **quadro máximo**, **qualidade adaptativa** e **RAM JS** (quando disponível). O limite de minions deve reduzir picos em lutas longas; o ganho real de FPS ainda não foi medido.

Rode a página `tests/qa-v0910.html` para os testes no navegador. Ela não altera os saves reais (o teste do save usa um armazenamento em memória).

## Pendências

- Não foi realizada partida integral em navegador real, Android ou desktop.
- Não houve medição de FPS antes/depois em dispositivo físico.
- Não foi confirmado o deploy no GitHub Pages, apenas os commits na `main`.
- Validar danos, telegráficos de choque, batalhas cooperativas e minions de cada chefe em gameplay.
- Auditar regras de `GameState` e transições completas após as lutas 6, 7 e 8.
