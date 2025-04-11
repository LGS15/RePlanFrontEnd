
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import TeamManagementPage from './pages/TeamManagementPage'
import TeamPage from './pages/TeamPage.jsx'
import './App.css'



function App() {
    return (
        <Router>

                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/team-management" element={<TeamManagementPage />} />
                    <Route path="/team/:teamId" element={<TeamPage />} />
                </Routes>

        </Router>
    )
}

export default App