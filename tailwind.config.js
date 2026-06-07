/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        sand:  { DEFAULT: '#f0ebe3', dark: '#e8e1d7' },
        warm:  { DEFAULT: '#c8a97e', light: '#d9be9e', dark: '#a8895e' },
        ink:   { DEFAULT: '#1a1a18', light: '#2d2a24' },
        stone: { DEFAULT: '#7a7570', light: '#9a9590' },
        deep:  { DEFAULT: '#2d2a24' },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'ui-serif', 'Georgia', 'serif'],
        sans:  ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['clamp(52px,7vw,96px)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        hero:    ['clamp(40px,5vw,72px)',  { lineHeight: '1.06', letterSpacing: '-0.015em' }],
        title:   ['clamp(28px,3vw,44px)',  { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      animation: {
        'fade-up':   'fadeUp 0.7s ease forwards',
        'fade-in':   'fadeIn 0.5s ease forwards',
        'ticker':    'ticker 35s linear infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        ticker:   { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        pulseDot: { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '0.4', transform: 'scale(0.75)' } },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
