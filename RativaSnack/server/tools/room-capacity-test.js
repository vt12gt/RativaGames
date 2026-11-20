#!/usr/bin/env node
'use strict';

/**
 * Teste de capacidade das salas online do RativaSnack.
 *
 * Segurança:
 * - Não cria contas, não altera banco de dados e não usa bypass de autenticação.
 * - Cada conexão precisa de um token válido de uma conta de teste DIFERENTE.
 * - Use somente em ambiente de teste/staging ou em horário de baixo movimento.
 *
 * Uso:
 *   REALTIME_URL=https://SEU-SERVICO.onrender.com \
 *   TEST_TOKENS="token1,token2,...,token11" \
 *   node room-capacity-test.js
 */

const WebSocket = require('ws');

const baseUrl = String(process.env.REALTIME_URL || '').replace(/\/+$/, '');
const tokens = String(process.env.TEST_TOKENS || '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);

const MODE = process.env.TEST_MODE || 'quick';
const EXPECTED_CAPACITY = 10;
const TIMEOUT_MS = 12000;

function fail(message) {
  console.error('\nFALHOU:', message);
  process.exitCode = 1;
}

function waitForMessage(ws, predicate, timeoutMs = TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('tempo esgotado aguardando resposta do servidor'));
    }, timeoutMs);

    function onMessage(raw) {
      let message;
      try { message = JSON.parse(raw.toString()); } catch (_) { return; }
      if (!predicate(message)) return;
      cleanup();
      resolve(message);
    }

    function onError(error) {
      cleanup();
      reject(error);
    }

    function onClose(code, reason) {
      cleanup();
      reject(new Error('conexão fechada: ' + code + ' ' + reason.toString()));
    }

    function cleanup() {
      clearTimeout(timer);
      ws.off('message', onMessage);
      ws.off('error', onError);
      ws.off('close', onClose);
    }

    ws.on('message', onMessage);
    ws.on('error', onError);
    ws.on('close', onClose);
  });
}

async function connectPlayer(token, index) {
  const ticketResponse = await fetch(baseUrl + '/api/ws-ticket', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' }
  });

  let ticketData = {};
  try { ticketData = await ticketResponse.json(); } catch (_) {}
  if (!ticketResponse.ok || !ticketData.ticket) {
    throw new Error('a conta de teste ' + (index + 1) +
      ' não conseguiu emitir ticket (HTTP ' + ticketResponse.status + ')');
  }

  const wsUrl = baseUrl.replace(/^https:/i, 'wss:').replace(/^http:/i, 'ws:') +
    '/ws?ticket=' + encodeURIComponent(ticketData.ticket);
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout ao abrir conexão ' + (index + 1))), TIMEOUT_MS);
    ws.once('open', () => { clearTimeout(timer); resolve(); });
    ws.once('error', error => { clearTimeout(timer); reject(error); });
  });

  await waitForMessage(ws, message => message.t === 'hello');
  const joinedPromise = waitForMessage(ws, message => message.t === 'joined');
  ws.send(JSON.stringify({ t: 'play', mode: MODE }));
  const joined = await joinedPromise;

  return { ws, joined, index };
}

async function main() {
  if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) {
    throw new Error('defina REALTIME_URL com a URL HTTPS do servidor multiplayer');
  }
  if (tokens.length < EXPECTED_CAPACITY + 1) {
    throw new Error('informe 11 tokens válidos de 11 contas de teste diferentes em TEST_TOKENS');
  }
  if (new Set(tokens).size !== tokens.length) {
    throw new Error('há tokens repetidos; cada jogador precisa de uma conta diferente');
  }

  console.log('RativaSnack — teste de limite por sala');
  console.log('Modo:', MODE);
  console.log('Contas de teste:', EXPECTED_CAPACITY + 1);
  console.log('Nenhum token será exibido. Iniciando conexões...\n');

  const players = [];
  try {
    for (let i = 0; i < EXPECTED_CAPACITY + 1; i++) {
      const player = await connectPlayer(tokens[i], i);
      players.push(player);
      const count = Array.isArray(player.joined.players) ? player.joined.players.length : 0;
      console.log('Jogador ' + (i + 1) + ': recebeu roster com ' + count + ' jogador(es).');
    }

    const tenthCount = players[EXPECTED_CAPACITY - 1].joined.players.length;
    const eleventhCount = players[EXPECTED_CAPACITY].joined.players.length;

    console.log('\nResultado esperado:');
    console.log('Sala 1: 10/10 jogadores');
    console.log('Sala 2: 1/10 jogador');

    if (tenthCount !== EXPECTED_CAPACITY) {
      fail('o 10º jogador recebeu roster com ' + tenthCount + ', esperado 10');
    } else if (eleventhCount !== 1) {
      fail('o 11º jogador recebeu roster com ' + eleventhCount +
        '; esperado 1 em uma nova sala');
    } else {
      console.log('\nAPROVADO: o limite de 10 por sala foi respeitado.');
    }
  } finally {
    for (const player of players) {
      try {
        if (player.ws.readyState === WebSocket.OPEN) {
          player.ws.send(JSON.stringify({ t: 'leave' }));
          player.ws.close();
        }
      } catch (_) {}
    }
  }
}

main().catch(error => fail(error.message));
