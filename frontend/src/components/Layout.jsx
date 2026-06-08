import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-bg-base bg-grid">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <motion.main
        animate={{ marginLeft: collapsed ? 64 : 224 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-1 min-h-screen"
      >
        <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
          {children}
        </div>
      </motion.main>
    </div>
  )
}
