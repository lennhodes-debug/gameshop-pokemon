import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#064e3b',
          900: '#022c22',
        },
        teal: {
          500: '#0d9488',
          600: '#0891b2',
        },
        navy: {
          900: '#050810',
          800: '#0a0e1a',
          700: '#0d1220',
          600: '#111827',
        },
        gold: '#d4a76a',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      /* keyframes and animations defined in globals.css */
    },
  },
  plugins: [],
}

export default config
