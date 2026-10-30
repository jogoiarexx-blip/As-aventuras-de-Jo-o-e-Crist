JOÃO & CRIST: RUMO A VEGAS — v0.9.11
BUILD PARA GITHUB PAGES

Arquivo principal: index.html.
Jogo: https://jogoiarexx-blip.github.io/As-aventuras-de-Jo-o-e-Crist/
QA do navegador: https://jogoiarexx-blip.github.io/As-aventuras-de-Jo-o-e-Crist/tests/qa-v0911.html
Auditoria técnica: AUDITORIA-V0911.md

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

Teste de chefes/ondas v0.9.11: https://jogoiarexx-blip.github.io/As-aventuras-de-Jo-o-e-Crist/tests/qa-v0911.html
