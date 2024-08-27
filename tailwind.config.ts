import { Options, withMaterialColors } from 'tailwind-material-colors'
import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: 'class',
  content: ['./src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/aspect-ratio')],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Inconsolata"', ...defaultTheme.fontFamily.mono],
      },
    },
  },
}

//
// https://tailwind-material-colors-docs.vercel.app/
//

const primary = process.env.THEME_PRIMARY || '#323e48'

const note = process.env.THEME_NOTE || '#1f6feb'
const tip = process.env.THEME_TIP || '#238636'
const important = process.env.THEME_IMPORTANT || '#8957e5'
const warning = process.env.THEME_WARNING || '#d29922'
const caution = process.env.THEME_CAUTION || '#da3633'

const scheme = (process.env.THEME_SCHEME || 'tonalSpot') as Options['scheme']
const contrast = Number(process.env.THEME_CONTRAST) || 0

const config2 = withMaterialColors(
  config,
  {
    // Your base colors as HEX values. 'primary' is required.
    primary,
    // Secondary and/or tertiary are optional, if not set they will be derived from the primary color.
    // secondary: '#ffff00',
    // tertiary: '#0000ff',

    // Add any named colors you need:
    note,
    tip,
    important,
    warning,
    caution,
  },
  {
    extend: false,
    scheme, // one of 'content', 'expressive', 'fidelity', 'monochrome', 'neutral', 'tonalSpot' or 'vibrant'
    contrast, // contrast is optional and ranges from -1 (less contrast) to 1 (more contrast).
  },
)

export default config2