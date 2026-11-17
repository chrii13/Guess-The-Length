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
        nastro: { DEFAULT: token('nastro'), tinta: token('nastro-tinta') },
        errore: { DEFAULT: token('errore'), tinta: token('errore-tinta'), ombra: token('errore-ombra') },
        sbiadito: token('sbiadito'),
        acciaio: token('acciaio'),
        pece: token('pece'),
      },
      fontFamily: {
        sans: ['var(--font-corpo)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      // Bordi spessi da cantiere: ogni `border` è da 3px
      borderWidth: {
        DEFAULT: '3px',
      },
      // Angoli quasi vivi: blocchi e cartelli, non adesivi
      borderRadius: {
        sm: '1px',
        DEFAULT: '2px',
        md: '2px',
        lg: '2px',
        xl: '3px',
        '2xl': '3px',
        '3xl': '4px',
      },
    },
  },
  plugins: [],
}
export default config
