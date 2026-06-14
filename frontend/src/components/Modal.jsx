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
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className={`relative w-full ${width} animate-slide-up rounded`}
        style={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--bg-border))', boxShadow: '0 24px 70px rgba(0,0,0,0.5)' }}>

        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <h2 className="font-display font-bold text-base text-text-primary tracking-tight">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-sm flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-primary transition-all duration-150 cursor-pointer">
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
