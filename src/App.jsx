import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BigBoard from './pages/BigBoard'
import ScoutingCard from './pages/ScoutingCard'
import PlayerEdit from './pages/PlayerEdit'
import ComparePlayers from './pages/ComparePlayers'
import Dashboard from './pages/Dashboard'
import DraftResults from './pages/DraftResults'
import DraftArchive from './pages/DraftArchive'
import MockDraft from './pages/MockDraft'
import TeamNeeds from './pages/TeamNeeds'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BigBoard />} />
        <Route path="/player/new" element={<PlayerEdit />} />
        <Route path="/player/:playerId" element={<ScoutingCard />} />
        <Route path="/player/:playerId/edit" element={<PlayerEdit />} />
        <Route path="/compare" element={<ComparePlayers />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/draft-results" element={<DraftResults />} />
        <Route path="/archive" element={<DraftArchive />} />
        <Route path="/mock-draft" element={<MockDraft />} />
        <Route path="/team-needs" element={<TeamNeeds />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
