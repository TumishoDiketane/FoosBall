import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'
import Welcome from './Welcome.jsx'
import LandingPage from './LandingPage.jsx'
import FoosballTable from './FoosballTable.jsx'
import { socket } from './socket.js'
import { useGamesList } from './hooks/useGamesList.js'
import './App.css'

function emitWithAck(event, payload) {
  return new Promise((resolve, reject) => {
    socket.emit(event, payload, (res) => {
      if (res?.ok) resolve(res)
      else reject(new Error(res?.message || 'Something went wrong.'))
    })
  })
}

function LandingRoute() {
  const navigate = useNavigate()
  const games = useGamesList()

  const onHostGame = async (payload) => {
    const res = await emitWithAck('game:host', payload)
    navigate(`/game/${res.roomCode}`)
  }

  const onJoinGame = async (payload) => {
    const res = await emitWithAck('game:join', payload)
    navigate(`/game/${res.roomCode}`)
  }

  const onSpectateGame = async (gameId) => {
    const res = await emitWithAck('game:spectate', { gameId })
    navigate(`/game/${res.roomCode}`)
  }

  return (
    <LandingPage
      onHostGame={onHostGame}
      onJoinGame={onJoinGame}
      onSpectateGame={onSpectateGame}
      games={games}
    />
  )
}

function GameRoute() {
  return <FoosballTable />
  // roomCode is available via useParams() inside FoosballTable if you need
  // to scope socket events (moves, scores, etc.) to that specific room.
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/landing" element={<LandingRoute />} />
        <Route path="/game/:roomCode" element={<GameRoute />} />
      </Routes>
    </Router>
  )
}

export default App