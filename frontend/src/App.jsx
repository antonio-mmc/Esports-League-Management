import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import Layout      from './components/Layout'
import Dashboard   from './pages/Dashboard'
import Players     from './pages/Players'
import Coaches     from './pages/Coaches'
import Teams       from './pages/Teams'
import TeamDetail  from './pages/TeamDetail'
import Tournaments from './pages/Tournaments'
import Matches     from './pages/Matches'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route path="/"            element={<Dashboard />}   />
            <Route path="/players"     element={<Players />}     />
            <Route path="/coaches"     element={<Coaches />}     />
            <Route path="/teams"       element={<Teams />}       />
            <Route path="/teams/:id"   element={<TeamDetail />}  />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/matches"     element={<Matches />}     />
          </Routes>
        </Layout>
      </ToastProvider>
    </BrowserRouter>
  )
}
