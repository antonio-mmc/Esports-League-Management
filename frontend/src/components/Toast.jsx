import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: <CheckCircle size={15} className="text-accent-green flex-shrink-0" />,
  error:   <XCircle    size={15} className="text-red-400 flex-shrink-0"      />,
  info:    <AlertCircle size={15} className="text-accent-cyan flex-shrink-0"  />,
}

const BORDERS = {
  success: 'border-accent-green/30',
  error:   'border-red-400/30',
  info:    'border-accent-cyan/30',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration)
  }, [])

  const remove = (id) => setToasts(t => t.filter(x => x.id !== id))

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 340 }}>
        {toasts.map(toast => (
          <div key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border glass-card animate-slide-up ${BORDERS[toast.type]}`}
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            {ICONS[toast.type]}
            <p className="font-body text-sm text-text-primary flex-1 leading-snug">{toast.message}</p>
            <button onClick={() => remove(toast.id)}
              className="text-text-dim hover:text-text-primary transition-colors cursor-pointer flex-shrink-0 mt-0.5">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
