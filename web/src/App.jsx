
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import TeamManagementPage from './pages/TeamManagementPage'
import './App.css'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/team-management" element={<TeamManagementPage />} />
            </Routes>
        </Router>
    )
}

export default App