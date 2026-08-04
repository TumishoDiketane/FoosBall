import { useEffect, useState } from 'react'
import { socket } from '../socket'

export function useGamesList() {
  const [games, setGames] = useState([])

  useEffect(() => {
    const handleList = (list) => setGames(list)
    socket.on('games:list', handleList)
    return () => socket.off('games:list', handleList)
  }, [])

  return games
}