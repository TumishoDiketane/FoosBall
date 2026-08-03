import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FoosballTable from './FoosballTable'
import './LandingPage.css'

const VIEWS = { HOME: 'home', JOIN: 'join', HOST: 'host' }
const MAX_NAME_LENGTH = 20
const ROOM_CODE_LENGTH = 6

// ... GamesList and LandingForm stay exactly as before ...

function HomeActions({ onHost, onJoin, navigate, games, onJoinWaiting, onSpectateLive, spectatingId, spectateError, spectatorOnly }) {
  return (
    <div className="home-actions">
      {!spectatorOnly && (
        <div className="top-buttons">
          <button className="btn-Play" onClick={onHost}>Host Game</button>
          <button className="btn-Play btn-outline" onClick={onJoin}>Join Game</button>
        </div>
      )}

      {spectatorOnly && <h2 className="section-heading">Live games to watch</h2>}

      {spectateError && <p className="form-error" role="alert">{spectateError}</p>}

      <GamesList
        games={spectatorOnly ? games.filter(g => g.status === 'live') : games}
        onJoinWaiting={onJoinWaiting}
        onSpectateLive={onSpectateLive}
        spectatingId={spectatingId}
      />

      <div className="bottom-button">
        <button className="btn-Spectate" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  )
}

function LandingPage({ onHostGame, onJoinGame, onSpectateGame, games = [] }) {
  const location = useLocation()
  const spectatorOnly = location.state?.spectator === true

  const [view, setView] = useState(VIEWS.HOME)
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [lockedRoomCode, setLockedRoomCode] = useState(false)
  const [joinAs, setJoinAs] = useState('player')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [spectatingId, setSpectatingId] = useState(null)
  const [spectateError, setSpectateError] = useState('')

  const navigate = useNavigate()
  const nameInputRef = useRef(null)

  const resetState = useCallback(() => {
    setError('')
    setName('')
    setRoomCode('')
    setLockedRoomCode(false)
    setJoinAs('player')
    setIsLoading(false)
  }, [])

  const goHome = useCallback(() => {
    setView(VIEWS.HOME)
    resetState()
  }, [resetState])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && view !== VIEWS.HOME) goHome()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, goHome])

  useEffect(() => {
    if ((view === VIEWS.HOST || view === VIEWS.JOIN) && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [view])

  const handleSubmit = async (mode) => {
    const trimmedName = name.trim()
    if (!trimmedName) return setError('Enter your name.')
    if (trimmedName.length > MAX_NAME_LENGTH)
      return setError(`Name must be ${MAX_NAME_LENGTH} characters or less.`)

    let payload = { name: trimmedName, spectator: joinAs === 'spectator' }

    if (mode === VIEWS.JOIN) {
      const trimmedCode = roomCode.trim().toUpperCase()
      if (!trimmedCode) return setError('Enter a room code to join.')
      if (trimmedCode.length !== ROOM_CODE_LENGTH)
        return setError(`Room code must be ${ROOM_CODE_LENGTH} characters.`)
      payload = { ...payload, roomCode: trimmedCode }
    }

    setError('')
    setIsLoading(true)
    try {
      if (mode === VIEWS.HOST) await onHostGame?.(payload)
      else if (mode === VIEWS.JOIN) await onJoinGame?.(payload)
    } catch (err) {
      setError(err?.message || `Failed to ${mode === VIEWS.HOST ? 'host' : 'join'} game.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinWaitingGame = (game) => {
    resetState()
    setRoomCode(game.code)
    setLockedRoomCode(true)
    setJoinAs('player')
    setView(VIEWS.JOIN)
  }

  const handleSpectateLiveGame = async (game) => {
    setSpectateError('')
    setSpectatingId(game.id)
    try {
      await onSpectateGame?.(game.id)
    } catch (err) {
      setSpectateError(err?.message || 'Failed to join as spectator.')
    } finally {
      setSpectatingId(null)
    }
  }

  return (
    <section id="center">
      <div className="landing-wrap">
        <FoosballTable />
        <h1 className="title-main">Foosball Game</h1>
        {view === VIEWS.HOME && (
          <HomeActions
            navigate={navigate}
            onHost={() => { resetState(); setView(VIEWS.HOST) }}
            onJoin={() => { resetState(); setView(VIEWS.JOIN) }}
            games={games}
            onJoinWaiting={handleJoinWaitingGame}
            onSpectateLive={handleSpectateLiveGame}
            spectatingId={spectatingId}
            spectateError={spectateError}
            spectatorOnly={spectatorOnly}
          />
        )}
        {!spectatorOnly && (view === VIEWS.HOST || view === VIEWS.JOIN) && (
          <LandingForm
            mode={view}
            name={name}
            setName={setName}
            roomCode={roomCode}
            lockedRoomCode={lockedRoomCode}
            error={error}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            goHome={goHome}
            navigate={navigate}
            nameInputRef={nameInputRef}
          />
        )}
      </div>
    </section>
  )
}

export default LandingPage