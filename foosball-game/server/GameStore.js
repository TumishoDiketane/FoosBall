// In-memory store of active games. Fine for a single Node process;
// if you ever run multiple server instances, this would need to move
// to something shared like Redis.
const games = new Map() // gameId -> game object

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion
  let code
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  } while ([...games.values()].some((g) => g.code === code))
  return code
}

function toPublicGame(game) {
  return {
    id: game.id,
    code: game.code,
    hostName: game.hostName,
    playerCount: game.players.length,
    maxPlayers: game.maxPlayers,
    status: game.players.length >= game.maxPlayers ? 'live' : 'waiting',
    spectatorCount: game.spectators.length,
  }
}

function listPublicGames() {
  return [...games.values()].map(toPublicGame)
}

module.exports = { games, generateRoomCode, toPublicGame, listPublicGames }
