/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d0d0d',
        surface: '#121212',
        panel: '#161616',
        border: '#262626',
        term: '#00ff41',
        amber: '#ffb300',
        cyan: '#00e5ff',
        magenta: '#ff2e97',
        dim: '#0a3d18',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        scan: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
        flicker: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.93' } },
        blink: { '0%,50%': { opacity: '1' }, '51%,100%': { opacity: '0' } },
        'pulse-term': { '0%,100%': { boxShadow: '0 0 8px #00ff4140' }, '50%': { boxShadow: '0 0 20px #00ff4180' } },
      },
      animation: {
        scan: 'scan 8s linear infinite',
        flicker: 'flicker 4s ease-in-out infinite',
        blink: 'blink 1s step-end infinite',
        'pulse-term': 'pulse-term 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
