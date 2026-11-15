# RativaSnack — servidor de teste de rede (lag)

Esta pasta é uma cópia isolada do servidor WebSocket atual. Não altera `RativaSnack/server` nem o endpoint de produção.

## O que muda

- Descarta snapshots antigos (`t: "st"`) quando o socket do destinatário acumula mais de 128 KiB.
- Mantém mensagens de controle e lobby fora dessa regra de descarte.
- Envia ping WebSocket a cada 25 segundos e encerra conexões que não respondem.
- Expõe contadores `stateSent` e `stateDropped` em `GET /health`.

## Implantação de teste no Render

1. Crie um Web Service separado, sem substituir o serviço atual.
2. Repository: `vt12gt/RativaGames`.
3. Branch: `main`.
4. Root Directory: `RativaSnack/server-lag-test`.
5. Runtime: Node.
6. Build Command: `npm install`.
7. Start Command: `npm start`.
8. Copie as variáveis `RATOPOLIS_API_URL` e `RATO_SNACK_API_URL` do serviço atual. Não publique valores secretos no GitHub.
9. Teste `/health` e duas contas/celulares antes de mudar qualquer endereço do jogo.

## Limites desta etapa

Este serviço continua sendo um relay: o celular anfitrião ainda executa a simulação. A proteção contra backpressure evita entregar uma fila de snapshots velhos, mas não transforma o servidor em simulador autoritativo e não reduz a latência física da rota.
