import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-bg-base bg-grid">
      <Sidebar />
      <main className="flex-1 ml-56 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
