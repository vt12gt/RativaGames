'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { firstAvailableRoom } = require('../room-allocator');

function makeRoom(mode) {
  return { id: 'room-' + Math.random().toString(36).slice(2), mode, players: new Map() };
}

test('acomoda exatamente 10 jogadores na primeira sala', () => {
  const rooms = new Map();
  const createRoom = mode => {
    const room = makeRoom(mode);
    rooms.set(room.id, room);
    return room;
  };

  for (let i = 1; i <= 10; i++) {
    const room = firstAvailableRoom(rooms, 'quick', 10, createRoom);
    room.players.set('player-' + i, { id: 'player-' + i });
  }

  assert.equal(rooms.size, 1);
  assert.equal([...rooms.values()][0].players.size, 10);
});

test('o 11º jogador abre uma segunda sala, sem ultrapassar 10 na primeira', () => {
  const rooms = new Map();
  const createRoom = mode => {
    const room = makeRoom(mode);
    rooms.set(room.id, room);
    return room;
  };

  for (let i = 1; i <= 11; i++) {
    const room = firstAvailableRoom(rooms, 'quick', 10, createRoom);
    room.players.set('player-' + i, { id: 'player-' + i });
  }

  const sizes = [...rooms.values()].map(room => room.players.size);
  assert.deepEqual(sizes, [10, 1]);
  assert.equal(sizes.every(size => size <= 10), true);
});

test('modos diferentes não compartilham a mesma sala', () => {
  const rooms = new Map();
  const createRoom = mode => {
    const room = makeRoom(mode);
    rooms.set(room.id, room);
    return room;
  };

  const quick = firstAvailableRoom(rooms, 'quick', 10, createRoom);
  quick.players.set('p1', { id: 'p1' });
  const survival = firstAvailableRoom(rooms, 'survival', 10, createRoom);

  assert.notEqual(quick.id, survival.id);
  assert.equal(survival.mode, 'survival');
});
