'use strict';

/**
 * Seleciona a primeira sala do mesmo modo que ainda tenha capacidade.
 * Se todas estiverem cheias, cria uma nova sala.
 * Mantém a regra central isolada para o servidor e os testes usarem a mesma função.
 */
function firstAvailableRoom(rooms, mode, maxPlayers, createRoom) {
  if (!(rooms instanceof Map)) throw new TypeError('rooms precisa ser um Map');
  if (!Number.isInteger(maxPlayers) || maxPlayers < 1) {
    throw new TypeError('maxPlayers precisa ser um inteiro positivo');
  }
  if (typeof createRoom !== 'function') throw new TypeError('createRoom precisa ser uma função');

  for (const room of rooms.values()) {
    if (room.mode === mode && room.players instanceof Map && room.players.size < maxPlayers) {
      return room;
    }
  }
  return createRoom(mode);
}

module.exports = { firstAvailableRoom };
