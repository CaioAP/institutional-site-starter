import type { SitemapUrl } from '@nuxtjs/sitemap'

/** Routes that should never be indexed. */
const NOINDEX = new Set(['search', '404'])

/**
 * Sitemap source: every indexable route from ContentSource.listRoutes(), with
 * hreflang alternates. @nuxtjs/sitemap splits them into one sitemap per locale.
 */
export default defineSitemapEventHandler(async (event) => {
  const routes = await getServerContentSource(event).listRoutes()
  return routes
    .filter(r => !NOINDEX.has(r.name))
    .map((r): SitemapUrl => {
      const alternates = Object.entries(r.alternates)
      return {
        loc: r.path,
        _sitemap: r.locale,
        ...(r.lastmod ? { lastmod: r.lastmod } : {}),
        ...(alternates.length > 1
          ? {
              alternatives: [
                ...alternates.map(([hreflang, href]) => ({ hreflang, href: href! })),
                ...(r.alternates['pt-BR'] ? [{ hreflang: 'x-default', href: r.alternates['pt-BR'] }] : []),
              ],
            }
          : {}),
      }
    })
})
