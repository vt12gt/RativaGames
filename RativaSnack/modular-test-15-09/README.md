# RativaSnack — teste modular 15/09

Esta pasta é uma cópia de teste de `RativaSnack/Online-Test.html`.

- `Online.html`: estrutura da página original, preservada.
- `css/style.css`: CSS extraído literalmente.
- `js/main.js`: JavaScript extraído literalmente, mantendo IIFE, ordem, nomes, lógica e comentários.

## Dependências preservadas
Manifesto e ícone originais continuam sendo usados por caminhos relativos. Integrações, chamadas HTTP/request, conexões e recursos referenciados pelo código permanecem no JavaScript original, sem reescrita.

## Segurança
Não altera `Online.html`, `Offline.html`, `Index.html` nem a versão de produção. O backup integral está em `RativaSnack/backups/Online-Test-15-09-pre-modularizacao.html`.

## Etapa seguinte
A divisão do JavaScript em config, data, save, audio, snake, world, ui e online exige mapear dependências e escopos. Nesta primeira etapa, o JS permanece integral em `main.js` para não quebrar referências internas. Não foram criados módulos vazios ou falsos.


## JavaScript dividido em partes
O código foi organizado em `js/modules/` por responsabilidade. Como a versão original usa uma única IIFE com muitas variáveis `let` e `const` compartilhadas, os arquivos são fragmentos de origem, não scripts independentes. `js/build.mjs` concatena as partes na ordem original e gera `js/main.js`, preservando o escopo. A primeira versão do bundle continua publicada e não foi alterada nesta etapa.
