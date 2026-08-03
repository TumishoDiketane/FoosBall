import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Welcome from './Welcome.jsx'
import LandingPage from './LandingPage.jsx'
import FoosballTable from './FoosballTable.jsx'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* App starts on Welcome */}
        <Route path="/" element={<Welcome />} />

        {/* Redirect from Welcome buttons */}
        <Route path="/landing" element={<LandingPage />} />

        {/* Game page */}
        <Route path="/game" element={<FoosballTable />} />
      </Routes>
    </Router>
  )
}

export default App
