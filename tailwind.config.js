/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0c0e14',
          panel: '#12161f',
          card: '#181e2a',
          border: '#1e2638',
          accent: '#10b981', // clean emerald green
          cyan: '#38bdf8',   // soft sky cyan
          yellow: '#f59e0b', // muted amber
          red: '#ef4444',    // muted red
          purple: '#a855f7', // muted purple
          muted: '#64748b'   // slate muted text
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
