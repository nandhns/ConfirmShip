export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#081c36',
          900: '#0b2545',
          800: '#102f57',
          700: '#17406f',
          600: '#1f5490',
        },
        ink: '#0f172a',
        muted: '#64748b',
        hair: '#e6ebf2',
        canvas: '#f4f7fb',
        danger: {
          DEFAULT: '#e11d48',
          soft: '#fdeef1',
        },
        warn: {
          DEFAULT: '#d97706',
          soft: '#fef6e7',
        },
        good: {
          DEFAULT: '#15803d',
          soft: '#eaf6ee',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -16px rgba(15, 23, 42, 0.18)',
        device: '0 40px 80px -30px rgba(8, 28, 54, 0.45)',
      },
    },
  },
}
