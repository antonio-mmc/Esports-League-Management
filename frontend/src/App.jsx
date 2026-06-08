import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import { GameFilterProvider } from './context/GameFilterContext'
import Layout      from './components/Layout'
import Dashboard   from './pages/Dashboard'
import Players     from './pages/Players'
import Coaches     from './pages/Coaches'
import Teams       from './pages/Teams'
import PlayerDetail      from './pages/PlayerDetail'
import TeamDetail        from './pages/TeamDetail'
import Tournaments       from './pages/Tournaments'
import TournamentDetail  from './pages/TournamentDetail'
import Matches     from './pages/Matches'

export default function App() {
  return (
    <BrowserRouter>
      <GameFilterProvider>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route path="/"            element={<Dashboard />}   />
            <Route path="/players"     element={<Players />}     />
            <Route path="/players/:id" element={<PlayerDetail />} />
            <Route path="/coaches"     element={<Coaches />}     />
            <Route path="/teams"       element={<Teams />}       />
            <Route path="/teams/:id"   element={<TeamDetail />}  />
            <Route path="/tournaments"     element={<Tournaments />}      />
            <Route path="/tournaments/:id" element={<TournamentDetail />} />
            <Route path="/matches"     element={<Matches />}     />
          </Routes>
        </Layout>
      </ToastProvider>
      </GameFilterProvider>
    </BrowserRouter>
  )
}
