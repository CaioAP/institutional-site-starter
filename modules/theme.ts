import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import theme, { type ThemeFont } from '../theme.config'

/** camelCase → kebab-case (surfaceMuted → surface-muted) */
const kebab = (s: string) => s.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)

const require = createRequire(import.meta.url)

/**
 * Reads a Fontsource package's @font-face rules and serves its files from
 * /fonts/<package-name>/ so they can be preloaded by a stable URL. Rules switch
 * to `font-display: optional`: with the preload the font is almost always
 * there for the first paint, and when it isn't the fallback stays for that
 * page view instead of swapping, so text never shifts (no CLS from fonts).
 */
function fontsourceFont(font: ThemeFont, outDir: string) {
  const pkgDir = dirname(require.resolve(`${font.package}/package.json`))
  const id = font.package.split('/').pop()!
  const baseURL = `/fonts/${id}`
  const dir = join(outDir, id)
  mkdirSync(dir, { recursive: true })
  const css = readFileSync(join(pkgDir, 'index.css'), 'utf8')
    .replace(/url\(\.\/files\/([^)]+)\)/g, (_, file: string) => {
      // Ship only the files the CSS uses (the package has every axis/style).
      copyFileSync(join(pkgDir, 'files', file), join(dir, file))
      return `url(${baseURL}/${file})`
    })
    .replace(/font-display:\s*swap/g, 'font-display: optional')
  // The latin subset covers pt-BR and en; other subsets load only if a page needs them.
  const latin = css.match(new RegExp(`${baseURL}/[^)]*-latin-wght-normal\\.woff2`))?.[0]
  return { css, latin, publicAsset: { dir, baseURL, maxAge: 60 * 60 * 24 * 365 } }
}

/**
 * Turns `theme.config.ts` into build-time CSS variables and wires the
 * self-hosted font packages, so pages never hard-code brand values.
 */
export default defineNuxtModule({
  meta: { name: 'starter-theme' },
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.alias['#theme'] = resolve('../theme.config')

    // Outside buildDir, which Nuxt clears when the build starts.
    const fontsDir = join(nuxt.options.rootDir, 'node_modules/.cache/theme-fonts')
    const fonts = [theme.fonts.sans, theme.fonts.serif].map(f => fontsourceFont(f, fontsDir))

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
        return `/* Generated from theme.config.ts — do not edit */\n${fonts.map(f => f.css).join('\n')}\n:root {\n${lines.join('\n')}\n}\n`
      },
    })

    nuxt.options.css.unshift(template.dst)
    nuxt.options.nitro.publicAssets ||= []
    nuxt.options.nitro.publicAssets.push(...fonts.map(f => f.publicAsset))
    nuxt.options.app.head.link ||= []
    for (const { latin } of fonts) {
      if (latin) nuxt.options.app.head.link.push({ rel: 'preload', as: 'font', type: 'font/woff2', href: latin, crossorigin: '' })
    }
  },
})
