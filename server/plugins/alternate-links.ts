/**
 * Replaces the language switcher placeholders emitted during SSR
 * (see app/composables/useAlternates.ts) with the links the page registered,
 * or with the default switch-locale path when the page registered none.
 */
const PLACEHOLDER = /\/__alternate__\/([\w-]+)\?fallback=([^"&<\s]*)/g

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:html', (html, { event }) => {
    const links = (event.context.alternateLinks ?? {}) as Record<string, string | undefined>
    const replace = (chunk: string) => chunk.replace(PLACEHOLDER, (_, locale: string, fallback: string) => links[locale] ?? decodeURIComponent(fallback))
    html.body = html.body.map(replace)
  })
})
