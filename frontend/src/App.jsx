import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import { GameFilterProvider } from './context/GameFilterContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import Layout from './components/Layout'

// Route-level code splitting: each page ships as its own chunk so the initial
// bundle stays small and navigation only loads what it needs.
const Dashboard        = lazy(() => import('./pages/Dashboard'))
const Players          = lazy(() => import('./pages/Players'))
const PlayerDetail     = lazy(() => import('./pages/PlayerDetail'))
const Coaches          = lazy(() => import('./pages/Coaches'))
const CoachDetail      = lazy(() => import('./pages/CoachDetail'))
const Teams            = lazy(() => import('./pages/Teams'))
const TeamDetail       = lazy(() => import('./pages/TeamDetail'))
const Tournaments      = lazy(() => import('./pages/Tournaments'))
const TournamentDetail = lazy(() => import('./pages/TournamentDetail'))
const Matches          = lazy(() => import('./pages/Matches'))
const MatchDetail      = lazy(() => import('./pages/MatchDetail'))
const Transfers        = lazy(() => import('./pages/Transfers'))

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <LanguageProvider>
      <GameFilterProvider>
      <ToastProvider>
        <Layout>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/"            element={<Dashboard />}   />
              <Route path="/players"     element={<Players />}     />
              <Route path="/players/:id" element={<PlayerDetail />} />
              <Route path="/coaches"     element={<Coaches />}     />
              <Route path="/coaches/:id" element={<CoachDetail />} />
              <Route path="/teams"       element={<Teams />}       />
              <Route path="/teams/:id"   element={<TeamDetail />}  />
              <Route path="/tournaments"     element={<Tournaments />}      />
              <Route path="/tournaments/:id" element={<TournamentDetail />} />
              <Route path="/matches"     element={<Matches />}     />
              <Route path="/matches/:id" element={<MatchDetail />} />
              <Route path="/transfers"   element={<Transfers />}   />
            </Routes>
          </Suspense>
        </Layout>
      </ToastProvider>
      </GameFilterProvider>
      </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
