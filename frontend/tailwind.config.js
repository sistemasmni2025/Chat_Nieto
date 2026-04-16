/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nieto: {
          50: '#fff7ed',
          100: '#ffebd5',
          500: '#f97316',
          600: '#ea580c',
          900: '#7c2d12',
          gold: '#fca311'
        },
        dark: {
          bg: '#0f172a', /* slate-900 */
          card: '#1e293b', /* slate-800 */
          elevated: '#334155' /* slate-700 */
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
