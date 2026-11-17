import type { Config } from 'tailwindcss'

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        carta: token('carta'),
        foglio: token('foglio'),
        inchiostro: token('inchiostro'),
        grafite: token('grafite'),
        riga: token('riga'),
        // Ogni colore ha le sue varianti: tinta per gli sfondi, ombra per il gradino dei bottoni
        nastro: { DEFAULT: token('nastro'), tinta: token('nastro-tinta'), ombra: token('nastro-ombra') },
        errore: { DEFAULT: token('errore'), tinta: token('errore-tinta'), ombra: token('errore-ombra') },
        sbiadito: token('sbiadito'),
        acciaio: token('acciaio'),
        pece: token('pece'),
      },
      fontFamily: {
        sans: ['var(--font-corpo)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      // Bordi spessi come adesivi: ogni `border` è da 2px
      borderWidth: {
        DEFAULT: '2px',
      },
    },
  },
  plugins: [],
}
export default config
