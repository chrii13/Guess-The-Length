import type { Config } from 'tailwindcss'

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        carta: token('carta'),
        foglio: token('foglio'),
        inchiostro: token('inchiostro'),
        grafite: token('grafite'),
        riga: token('riga'),
        nastro: token('nastro'),
        errore: token('errore'),
        acciaio: token('acciaio'),
        pece: token('pece'),
      },
      fontFamily: {
        sans: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
