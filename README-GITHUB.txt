JOÃO & CRIST: RUMO A VEGAS — v0.9.12
BUILD PARA GITHUB PAGES

Arquivo principal: index.html.
Jogo: https://jogoiarexx-blip.github.io/As-aventuras-de-Jo-o-e-Crist/
QA do navegador: https://jogoiarexx-blip.github.io/As-aventuras-de-Jo-o-e-Crist/tests/qa-v0912.html
Auditoria técnica: AUDITORIA-V0912.md

Publicação:
1. Manter index.html, style.css, js/, assets/, sw.js e manifest.webmanifest na raiz.
2. Em Settings > Pages, usar Deploy from a branch, branch main, pasta /(root).
3. Aguardar o GitHub Pages refletir o último commit.
4. No navegador, validar menu, fases, bônus e controles com a página de QA.

NOTAS:
- sw.js armazena core no primeiro acesso; assets de boate entram no cache quando visitados.
- Os saves locais existentes são mantidos.
- PWA só funciona no contexto HTTPS do GitHub Pages.
- Não usar INICIAR_JOGO.bat; esta build é HTML/JavaScript.
- joao-e-crist.html e test.html são entradas legadas; usar index.html.

Diagnóstico opcional: https://jogoiarexx-blip.github.io/As-aventuras-de-Jo-o-e-Crist/?perf=1
Mostra FPS, tempo de quadro, qualidade e RAM JS (se suportada pelo navegador). Não altera o save.

Teste de chefes/ondas v0.9.12: https://jogoiarexx-blip.github.io/As-aventuras-de-Jo-o-e-Crist/tests/qa-v0912.html

Novos capítulos da viagem na v0.9.12:
- Fazenda: pegar bilhete da loteria, malas e documentos; os três objetivos são necessários para concluir a fase.
- Cidade: diálogo na rodoviária e bicicleta em movimento com aviso, desvio por salto e dano único.
- O progresso dos objetivos é reiniciado ao carregar a Fase 1; o checkpoint continua no início da fase, sem mudar o formato de save.
- O jogo permanece Canvas 2D; uma conversão para Three.js ainda não foi realizada.
