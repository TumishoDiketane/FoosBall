const http = require('http')
const express = require('express')
const { Server } = require('socket.io')
const { games, generateRoomCode, listPublicGames } = require('./gameStore')

const PORT = process.env.PORT || 3001
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
const MAX_PLAYERS = 2 // change to 4 if you're doing 2v2 foosball

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: CLIENT_URL },
})

// Simple health check so you can confirm the server is up in a browser
app.get('/health', (req, res) => res.json({ ok: true, games: games.size }))

function broadcastGamesList() {
  io.emit('games:list', listPublicGames())
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // Send current state immediately to the newly connected client
  socket.emit('games:list', listPublicGames())

  socket.on('game:host', ({ name, spectator }, ack) => {
    try {
      const id = `${socket.id}-${Date.now()}`
      const code = generateRoomCode()
      const game = {
        id,
        code,
        hostName: name,
        maxPlayers: MAX_PLAYERS,
        players: [{ socketId: socket.id, name }],
        spectators: [],
      }
      games.set(id, game)
      socket.join(code)
      socket.data.gameId = id

      broadcastGamesList()
      ack?.({ ok: true, gameId: id, roomCode: code })
    } catch (err) {
      console.error('game:host error', err)
      ack?.({ ok: false, message: 'Failed to host game.' })
    }
  })

  socket.on('game:join', ({ name, roomCode, spectator }, ack) => {
    try {
      const game = [...games.values()].find((g) => g.code === roomCode)
      if (!game) return ack?.({ ok: false, message: 'Room not found.' })

      if (spectator) {
        game.spectators.push({ socketId: socket.id, name })
      } else {
        if (game.players.length >= game.maxPlayers) {
          return ack?.({ ok: false, message: 'Room is full.' })
        }
        game.players.push({ socketId: socket.id, name })
      }

      socket.join(game.code)
      socket.data.gameId = game.id

      broadcastGamesList()
      ack?.({ ok: true, gameId: game.id, roomCode: game.code })
    } catch (err) {
      console.error('game:join error', err)
      ack?.({ ok: false, message: 'Failed to join game.' })
    }
  })

  // Direct spectate from the games list — no name required
  socket.on('game:spectate', ({ gameId }, ack) => {
    try {
      const game = games.get(gameId)
      if (!game) return ack?.({ ok: false, message: 'Game not found.' })

      game.spectators.push({ socketId: socket.id, name: 'Spectator' })
      socket.join(game.code)
      socket.data.gameId = game.id

      broadcastGamesList()
      ack?.({ ok: true, gameId: game.id, roomCode: game.code })
    } catch (err) {
      console.error('game:spectate error', err)
      ack?.({ ok: false, message: 'Failed to spectate game.' })
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
    const gameId = socket.data.gameId
    if (!gameId) return

    const game = games.get(gameId)
    if (!game) return

    game.players = game.players.filter((p) => p.socketId !== socket.id)
    game.spectators = game.spectators.filter((s) => s.socketId !== socket.id)

    if (game.players.length === 0 && game.spectators.length === 0) {
      games.delete(gameId)
    }
    broadcastGamesList()
  })
})

server.listen(PORT, () => {
  console.log(`Socket server running on http://localhost:${PORT}`)
})
