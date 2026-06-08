import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className={`relative glass-card w-full ${width} animate-slide-up`}
        style={{ borderColor: 'rgba(34,197,94,0.2)', boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 30px rgba(34,197,94,0.05)' }}>

        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <h2 className="font-display text-base text-text-primary tracking-wide">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-primary transition-all duration-150 cursor-pointer">
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
