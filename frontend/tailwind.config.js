/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Theme-aware tokens — values come from CSS variables (see index.css).
        // RGB channels + <alpha-value> so Tailwind opacity modifiers keep working.
        bg: {
          base:     'rgb(var(--bg-base) / <alpha-value>)',
          primary:  'rgb(var(--bg-primary) / <alpha-value>)',
          card:     'rgb(var(--bg-card) / <alpha-value>)',
          elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
          border:   'rgb(var(--bg-border) / <alpha-value>)',
          sidebar:  'rgb(var(--bg-sidebar) / <alpha-value>)',
        },
        accent: {
          green:  '#22C55E',   // the single signature accent — used sparingly
          cyan:   '#38BDF8',   // reserved for game-mode semantics only
          blue:   '#60A5FA',
          purple: '#A78BFA',
        },
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          muted:   'rgb(var(--text-muted) / <alpha-value>)',
          dim:     'rgb(var(--text-dim) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        body:    ['Archivo', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      // Broadcast-editorial: sharp corners everywhere. `full` kept for pills/avatars.
      borderRadius: {
        none: '0px',
        sm:   '2px',
        DEFAULT: '2px',
        md:   '3px',
        lg:   '4px',
        xl:   '5px',
        '2xl': '6px',
        '3xl': '8px',
        full: '9999px',
      },
      boxShadow: {
        glow:        'none',
        'glow-cyan': 'none',
        'glow-blue': 'none',
        card:        '0 1px 0 rgba(255,255,255,0.02) inset',
        pop:         '0 12px 40px rgba(0,0,0,0.55)',
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGlow: { '0%,100%': { opacity: 0.35 }, '50%': { opacity: 1 } },
      },
    },
  },
  plugins: [],
}
