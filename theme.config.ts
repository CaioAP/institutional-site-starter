/**
 * Brand configuration — the single place to rebrand the starter for a new client.
 *
 * Colors here become CSS variables at build time (see `modules/theme.ts`), and
 * Tailwind utilities (`bg-surface`, `text-accent`, …) read those variables.
 * See docs/theming.md for the full rebranding guide.
 */

export interface ThemeColors {
  /** Page background */
  surface: string
  /** Slightly contrasting background for cards, bands and the footer */
  surfaceMuted: string
  /** Inverted band background (e.g. hero overlay, CTA band) */
  surfaceInverse: string
  /** Body text */
  text: string
  /** Secondary text (captions, meta). Must still pass AA on `surface` and `surfaceMuted`. */
  textMuted: string
  /** Text on `surfaceInverse` */
  textInverse: string
  /** Brand accent used for links, buttons and highlights */
  accent: string
  /** Hover / pressed variant of the accent */
  accentStrong: string
  /** Text placed on top of `accent` (buttons) */
  onAccent: string
  /** Hairlines and input borders (needs 3:1 against surface for inputs) */
  border: string
  /** Focus ring color (needs 3:1 against surface) */
  focus: string
  /** Error messages and invalid fields */
  danger: string
  /** Success messages */
  success: string
}

export interface ThemeFont {
  /** CSS font-family name as declared by the font package */
  family: string
  /** npm package that self-hosts the font (its CSS is bundled by Nuxt) */
  package: string
  /** Fallback stack */
  fallback: string
}

export interface ThemeConfig {
  brand: {
    name: string
    shortName: string
    logo: { light: string, dark: string, width: number, height: number }
  }
  colors: ThemeColors
  fonts: { sans: ThemeFont, serif: ThemeFont }
  /** Base radius in rem; small/large radii derive from it */
  radius: number
  /** Base spacing unit in rem; Tailwind's spacing scale multiplies it */
  spacing: number
  socials: Array<{ label: string, url: string, icon: 'linkedin' | 'instagram' | 'facebook' | 'youtube' | 'x' }>
}

const theme: ThemeConfig = {
  brand: {
    name: 'Exemplo Advocacia',
    shortName: 'Exemplo',
    logo: { light: '/brand/logo.svg', dark: '/brand/logo-inverse.svg', width: 168, height: 40 },
  },
  colors: {
    surface: '#fbfaf7',
    surfaceMuted: '#f1eee7',
    surfaceInverse: '#14213d',
    text: '#1b1f2a',
    textMuted: '#4f5565',
    textInverse: '#f6f4ef',
    accent: '#8a5a12',
    accentStrong: '#6b4409',
    onAccent: '#ffffff',
    border: '#8b8f99',
    focus: '#1d4ed8',
    danger: '#b42318',
    success: '#1e6b3a',
  },
  fonts: {
    sans: { family: 'Inter Variable', package: '@fontsource-variable/inter', fallback: 'ui-sans-serif, system-ui, sans-serif' },
    serif: { family: 'Source Serif 4 Variable', package: '@fontsource-variable/source-serif-4', fallback: 'ui-serif, Georgia, serif' },
  },
  radius: 0.375,
  spacing: 0.25,
  socials: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/', icon: 'linkedin' },
    { label: 'Instagram', url: 'https://www.instagram.com/', icon: 'instagram' },
  ],
}

export default theme
