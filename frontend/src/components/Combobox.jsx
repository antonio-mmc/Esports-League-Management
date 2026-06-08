import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

export default function Combobox({ value, onChange, options = [], placeholder = 'Select...', style }) {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)

  const selected  = options.find(o => String(o.value) === String(value))
  const isDefault = String(value) === String(options[0]?.value ?? '')
  const filtered  = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => {
    const handler = e => {
      if (!containerRef.current?.contains(e.target)) { setQuery(''); setOpen(false) }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = e  => { setQuery(e.target.value); setOpen(true) }
  const handleFocus  = () => { setQuery(''); setOpen(true) }
  const handleSelect = opt => { onChange(opt.value); setQuery(''); setOpen(false) }
  const handleClear  = ()  => { onChange(options[0]?.value ?? ''); setQuery(''); setOpen(false) }

  const displayValue = open ? query : (selected?.label || '')

  return (
    <div ref={containerRef} className="relative" style={style}>
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-primary border border-bg-border focus-within:border-accent-green/40 transition-colors duration-150 cursor-text"
        onClick={() => { if (!open) { setQuery(''); setOpen(true) } }}>
        <input
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="bg-transparent font-body text-sm text-text-primary placeholder:text-text-dim outline-none flex-1 min-w-0 cursor-text"
        />
        {!isDefault && (
          <button onMouseDown={e => { e.preventDefault(); handleClear() }}
            className="text-text-dim hover:text-text-muted transition-colors cursor-pointer flex-shrink-0">
            <X size={11} />
          </button>
        )}
        <ChevronDown size={12} className={`text-text-dim flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && filtered.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-bg-border py-1 max-h-52 overflow-y-auto"
          style={{
            background: 'rgba(9,15,29,0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
          {filtered.map(opt => (
            <button
              key={opt.value}
              onMouseDown={e => { e.preventDefault(); handleSelect(opt) }}
              className={`w-full text-left px-3 py-2 font-body text-sm transition-colors duration-100 cursor-pointer ${
                String(opt.value) === String(value)
                  ? 'text-accent-green bg-accent-green/10'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
