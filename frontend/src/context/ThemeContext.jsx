import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'theme'          // 'system' | 'light' | 'dark'
const getStored = () => {
  try { return localStorage.getItem(STORAGE_KEY) || 'system' } catch { return 'system' }
}

const systemPrefersDark = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true

const resolve = (pref) => (pref === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : pref)

function apply(resolved) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStored)            // user preference
  const [resolved, setResolved] = useState(() => resolve(getStored()))

  // Keep the resolved theme in sync with the preference (adjust during render).
  const [prevTheme, setPrevTheme] = useState(theme)
  if (theme !== prevTheme) {
    setPrevTheme(theme)
    setResolved(resolve(theme))
  }

  // Apply the resolved theme to the DOM and persist the preference.
  useEffect(() => {
    apply(resolve(theme))
    try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* ignore */ }
  }, [theme])

  // React to OS changes while in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => { const r = resolve('system'); setResolved(r); apply(r) }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = useCallback((t) => {
    apply(resolve(t))        // apply synchronously on click for an instant switch
    setThemeState(t)
  }, [])
  const toggle   = useCallback(() => setThemeState(resolve(getStored()) === 'dark' ? 'light' : 'dark'), [])

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with its provider
export const useTheme = () => useContext(ThemeContext)
