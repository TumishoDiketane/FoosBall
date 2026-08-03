import { useNavigate } from 'react-router-dom'
import FoosballTable from './FoosballTable.jsx'

function Welcome() {
  const navigate = useNavigate()

  const handlePlay = () => {
    navigate('/landing')
  }

  const handleSpectate = () => {
    navigate('/landing', { state: { spectator: true } })
  }

  return (
    <section id="center" className="bg-dark">
      <div>
        <h1 className="title-main">Foosball Game</h1>
        <button className="btn-Play" onClick={handlePlay}>
          Play
        </button>
        <button className="btn-Spectate" onClick={handleSpectate}>
          Spectate
        </button>
      </div>
      <div>
        <FoosballTable />
      </div>
    </section>
  )
}

export default Welcome
