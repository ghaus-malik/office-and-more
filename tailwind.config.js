/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'] },
      colors: {
        ink: { DEFAULT: 'rgb(var(--ink) / <alpha-value>)', soft: 'rgb(var(--ink-soft) / <alpha-value>)' },
        paper: 'rgb(var(--paper) / <alpha-value>)',
        sand: {
          50: 'rgb(var(--sand-50) / <alpha-value>)',
          100: 'rgb(var(--sand-100) / <alpha-value>)',
          200: 'rgb(var(--sand-200) / <alpha-value>)',
          300: 'rgb(var(--sand-300) / <alpha-value>)',
        },
        muted: 'rgb(var(--muted) / <alpha-value>)',
        ok: { DEFAULT: 'rgb(var(--ok) / <alpha-value>)', bg: 'rgb(var(--ok-bg) / <alpha-value>)' },
        warn: { DEFAULT: 'rgb(var(--warn) / <alpha-value>)', bg: 'rgb(var(--warn-bg) / <alpha-value>)' },
        bad: { DEFAULT: 'rgb(var(--bad) / <alpha-value>)', bg: 'rgb(var(--bad-bg) / <alpha-value>)' },
        info: { DEFAULT: 'rgb(var(--info) / <alpha-value>)', bg: 'rgb(var(--info-bg) / <alpha-value>)' },
      },
      letterSpacing: { tightest: '-0.035em' },
      boxShadow: {
        card: '0 1px 2px rgb(17 17 17 / 0.04), 0 1px 1px rgb(17 17 17 / 0.03)',
        pop: '0 12px 40px -8px rgb(17 17 17 / 0.18), 0 2px 6px rgb(17 17 17 / 0.06)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        'slide-left': { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        pop: { '0%': { transform: 'scale(.6)', opacity: 0 }, '70%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
      },
      animation: {
        'fade-in': 'fade-in .18s ease-out',
        'slide-up': 'slide-up .22s ease-out',
        'slide-left': 'slide-left .26s cubic-bezier(.2,.8,.2,1)',
        pop: 'pop .4s ease-out',
      },
    },
  },
  plugins: [],
}
