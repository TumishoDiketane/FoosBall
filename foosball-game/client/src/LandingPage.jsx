import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import FoosballTable from './FoosballTable'
import './LandingPage.css'

const VIEWS = {
  HOME: 'home',
  JOIN: 'join',
  HOST: 'host',
}

const MAX_NAME_LENGTH = 20
const ROOM_CODE_LENGTH = 6

function LandingPage({ onHostGame, onJoinGame }) {
  const [view, setView] = useState(VIEWS.HOME)
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [joinAs, setJoinAs] = useState('player')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const resetState = useCallback(() => {
    setError('')
    setName('')
    setRoomCode('')
    setJoinAs('player')
    setIsLoading(false)
  }, [])

  const goHome = useCallback(() => {
    setView(VIEWS.HOME)
    resetState()
  }, [resetState])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && view !== VIEWS.HOME) {
        goHome()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, goHome])

  const validateCommon = (trimmedName) => {
    if (!trimmedName) return 'Enter your name.'
    if (trimmedName.length > MAX_NAME_LENGTH)
      return `Name must be ${MAX_NAME_LENGTH} characters or less.`
    return ''
  }

  const validateJoin = (trimmedCode) => {
    if (!trimmedCode) return 'Enter a room code to join.'
    if (trimmedCode.length !== ROOM_CODE_LENGTH)
      return `Room code must be ${ROOM_CODE_LENGTH} characters.`
    return ''
  }

  const handleSubmit = async (mode) => {
    const trimmedName = name.trim()
    const commonError = validateCommon(trimmedName)
    if (commonError) {
      setError(commonError)
      return
    }

    let payload = {
      name: trimmedName,
      spectator: joinAs === 'spectator',
    }

    if (mode === VIEWS.JOIN) {
      const trimmedCode = roomCode.trim().toUpperCase()
      const joinError = validateJoin(trimmedCode)
      if (joinError) {
        setError(joinError)
        return
      }
      payload = { ...payload, roomCode: trimmedCode }
    }

    setError('')
    setIsLoading(true)

    try {
      if (mode === VIEWS.HOST) {
        await onHostGame?.(payload)
      } else if (mode === VIEWS.JOIN) {
        await onJoinGame?.(payload)
      }
    } catch (err) {
      setError(err?.message || `Failed to ${mode === VIEWS.HOST ? 'host' : 'join'} game. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameChange = (e) => {
    setName(e.target.value.slice(0, MAX_NAME_LENGTH))
    if (error) setError('')
  }

  const handleRoomCodeChange = (e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, ROOM_CODE_LENGTH)
    setRoomCode(value)
    if (error) setError('')
  }

  const handleSpectatorToggle = (e) => {
    setJoinAs(e.target.checked ? 'spectator' : 'player')
  }

  const HomeActions = () => (
    <div className="home-actions">
      <div className="top-buttons">
        <button
          type="button"
          className="btn-Play"
          onClick={() => {
            resetState()
            setView(VIEWS.HOST)
          }}
        >
          Host Game
        </button>
        <button
          type="button"
          className="btn-Play btn-outline"
          onClick={() => {
            resetState()
            setView(VIEWS.JOIN)
          }}
        >
          Join Game
        </button>
      </div>
      <div className="bottom-button">
        <button
          type="button"
          className="btn-Spectate"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  )

  const LandingForm = ({ mode }) => {
    const isHost = mode === VIEWS.HOST

    const onSubmit = (e) => {
      e.preventDefault()
      handleSubmit(mode)
    }

    return (
      <form className="landing-form" onSubmit={onSubmit}>
        <label htmlFor={`${mode}-name`}>Your name</label>
        <input
          id={`${mode}-name`}
          type="text"
          placeholder="e.g. Alex"
          value={name}
          onChange={handleNameChange}
          autoFocus
          disabled={isLoading}
          maxLength={MAX_NAME_LENGTH}
        />

        {!isHost && (
          <>
            <label htmlFor="room-code">Room code</label>
            <input
              id="room-code"
              type="text"
              placeholder="ABC123"
              value={roomCode}
              onChange={handleRoomCodeChange}
              maxLength={ROOM_CODE_LENGTH}
              disabled={isLoading}
              autoCapitalize="characters"
              spellCheck={false}
            />
          </>
        )}

        <div className="spectator-toggle">
          <label htmlFor={`${mode}-spectator`}>
            <input
              id={`${mode}-spectator`}
              type="checkbox"
              checked={joinAs === 'spectator'}
              onChange={handleSpectatorToggle}
              disabled={isLoading}
            />
            Join as spectator
          </label>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="form-actions">
          <div className="top-buttons">
            <button type="submit" className="btn-Play" disabled={isLoading}>
              {isLoading
                ? isHost
                  ? 'Creating...'
                  : 'Joining...'
                : isHost
                ? 'Create Room'
                : 'Join Game'}
            </button>
            <button
              type="button"
              className="btn-Play btn-outline"
              onClick={goHome}
              disabled={isLoading}
            >
              Back to Lobby
            </button>
          </div>
          <div className="bottom-button">
            <button
              type="button"
              className="btn-Spectate"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Back to Home
            </button>
          </div>
        </div>
      </form>
    )
  }

  return (
    <section id="center">
      <div className="landing-wrap">
        <FoosballTable />
        <h1 className="title-main">Foosball Game</h1>

        {view === VIEWS.HOME && <HomeActions />}
        {view === VIEWS.HOST && <LandingForm mode={VIEWS.HOST} />}
        {view === VIEWS.JOIN && <LandingForm mode={VIEWS.JOIN} />}
      </div>
    </section>
  )
}

export default LandingPage
