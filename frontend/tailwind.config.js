/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:    '#020617',
          primary: '#0F172A',
          card:    '#0d1829',
          border:  '#1E293B',
        },
        accent: {
          green:  '#22C55E',
          cyan:   '#06B6D4',
          blue:   '#3B82F6',
          purple: '#8B5CF6',
        },
        text: {
          primary: '#F8FAFC',
          muted:   '#94A3B8',
          dim:     '#475569',
        },
      },
      fontFamily: {
        display: ['"Russo One"', 'sans-serif'],
        body:    ['"Chakra Petch"', 'sans-serif'],
      },
      boxShadow: {
        glow:        '0 0 20px rgba(34,197,94,0.15)',
        'glow-cyan': '0 0 20px rgba(6,182,212,0.15)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.15)',
        card:        '0 4px 32px rgba(0,0,0,0.4)',
      },
      backdropBlur: { xs: '4px' },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.35s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 10px rgba(34,197,94,0.2)' }, '50%': { boxShadow: '0 0 30px rgba(34,197,94,0.5)' } },
      },
    },
  },
  plugins: [],
}
