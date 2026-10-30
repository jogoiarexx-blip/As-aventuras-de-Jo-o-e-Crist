# PWA / Offline — v0.9.6

- `manifest.webmanifest` mantém configuração de app instalável (landscape).
- `index.html` registra `sw.js` em contexto HTTP(S), com funcionamento do service worker no HTTPS público.
- Cache de versão `joao-crist-v096-20261030`, isolado por prefixo `joao-crist-`.
- Na atualização, somente versões antigas do cache deste jogo são excluídas; caches dos outros projetos hospedados no mesmo domínio não são afetados.
- Instalação pré-carrega scripts essenciais, menu, efeitos, músicas e ícones. Assets exclusivos da boate são carregados e guardados quando usados, não na instalação inicial.
- Navegação usa rede primeiro com fallback para página em cache. Requisições de imagens/scripts não retornam HTML como fallback.
- Recursos de fases ainda não visitadas podem exigir rede; não há garantia de campanha inteira offline em primeira instalação.
- Requisições Range não são interceptadas para evitar armazenar respostas parciais HTTP 206.
- Limpeza do AssetManager em RAM é independente do cache offline persistente.
- Testar online, offline, após upgrade de service worker e entre jogos diferentes do mesmo domínio.
