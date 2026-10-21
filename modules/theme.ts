import { addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import theme from '../theme.config'

/** camelCase → kebab-case (surfaceMuted → surface-muted) */
const kebab = (s: string) => s.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)

/**
 * Turns `theme.config.ts` into build-time CSS variables and wires the
 * self-hosted font packages, so pages never hard-code brand values.
 */
export default defineNuxtModule({
  meta: { name: 'starter-theme' },
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.alias['#theme'] = resolve('../theme.config')

    const template = addTemplate({
      filename: 'theme-tokens.css',
      write: true,
      getContents: () => {
        const lines = Object.entries(theme.colors).map(([k, v]) => `  --theme-${kebab(k)}: ${v};`)
        lines.push(
          `  --theme-font-sans: "${theme.fonts.sans.family}", ${theme.fonts.sans.fallback};`,
          `  --theme-font-serif: "${theme.fonts.serif.family}", ${theme.fonts.serif.fallback};`,
          `  --theme-radius: ${theme.radius}rem;`,
          `  --theme-spacing: ${theme.spacing}rem;`,
        )
        return `/* Generated from theme.config.ts — do not edit */\n:root {\n${lines.join('\n')}\n}\n`
      },
    })

    // Fonts first, then generated tokens, then the app's own CSS.
    nuxt.options.css.unshift(theme.fonts.sans.package, theme.fonts.serif.package, template.dst)
  },
})
