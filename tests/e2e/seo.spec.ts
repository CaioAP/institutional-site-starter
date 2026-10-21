import { expect, test, type APIRequestContext } from '@playwright/test'

/**
 * SEO checks on the generated HTML (no JavaScript involved, like a crawler).
 * Every URL in the sitemaps must agree with its own page: canonical, hreflang
 * alternates, social image and a single schema.org graph.
 */

// Static HTML is the same for every viewport.
test.skip(({ isMobile }) => isMobile, 'viewport independent')

const toPath = (url: string) => new URL(url).pathname
/** "https://x.com" and "https://x.com/" are the same URL. */
const norm = (url: string | undefined) => (url ? new URL(url).href : url)
const normAll = (links: Record<string, string>) => Object.fromEntries(Object.entries(links).map(([k, v]) => [k, norm(v)]))

function attr(tag: string, name: string) {
  return tag.match(new RegExp(`${name}="([^"]*)"`))?.[1]
}

function sitemapEntries(xml: string) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, body]) => ({
    loc: body!.match(/<loc>([^<]+)<\/loc>/)![1]!,
    alternates: Object.fromEntries(
      [...body!.matchAll(/<xhtml:link [^>]*>/g)].map(([tag]) => [attr(tag, 'hreflang')!, attr(tag, 'href')!]),
    ) as Record<string, string>,
  }))
}

function pageHead(html: string) {
  const links = [...html.matchAll(/<link [^>]*>/g)].map(([tag]) => tag)
  const metas = [...html.matchAll(/<meta [^>]*>/g)].map(([tag]) => tag)
  const meta = (property: string) => attr(metas.find(m => attr(m, 'property') === property || attr(m, 'name') === property) ?? '', 'content')
  return {
    canonical: attr(links.find(l => attr(l, 'rel') === 'canonical') ?? '', 'href'),
    hreflang: Object.fromEntries(
      links.filter(l => attr(l, 'rel') === 'alternate' && attr(l, 'hreflang'))
        .map(l => [attr(l, 'hreflang')!, attr(l, 'href')!]),
    ) as Record<string, string>,
    meta,
    jsonLd: [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map(([, json]) => JSON.parse(json!)),
  }
}

async function text(request: APIRequestContext, path: string) {
  const res = await request.get(path)
  expect(res.status(), path).toBe(200)
  return res.text()
}

test('robots.txt allows crawling and points to the sitemap index', async ({ request }) => {
  const robots = await text(request, '/robots.txt')
  expect(robots).toMatch(/^Sitemap: https?:\/\/.+\/sitemap_index\.xml$/m)
  expect(robots).not.toMatch(/^Disallow: \/$/m)
})

test('sitemap index lists one sitemap per locale', async ({ request }) => {
  const index = await text(request, '/sitemap_index.xml')
  const sitemaps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => toPath(loc!))
  expect(sitemaps.sort()).toEqual(['/__sitemap__/en.xml', '/__sitemap__/pt-BR.xml'])
})

for (const locale of ['pt-BR', 'en'] as const) {
  test(`every URL in the ${locale} sitemap matches its page head`, async ({ request }) => {
    const entries = sitemapEntries(await text(request, `/__sitemap__/${locale}.xml`))
    expect(entries.length).toBeGreaterThan(10)

    for (const { loc, alternates } of entries) {
      const path = toPath(loc)
      expect(path, 'locale prefix').toMatch(locale === 'en' ? /^\/en(\/|$)/ : /^\/(?!en(\/|$))/)
      const head = pageHead(await text(request, path))

      expect(norm(head.canonical), `${path} canonical`).toBe(norm(loc))
      expect(head.meta('robots') ?? '', `${path} robots`).not.toContain('noindex')

      // Same alternates in the page and in the sitemap; i18n also adds a bare "pt".
      const { pt: _pt, ...pageAlternates } = head.hreflang
      expect(normAll(pageAlternates), `${path} hreflang`).toEqual(normAll(alternates))
      expect(alternates['x-default'], `${path} x-default`).toBeTruthy()

      expect(norm(head.meta('og:url'))).toBe(norm(loc))
      expect(head.meta('og:site_name')).toBeTruthy()
      expect(head.meta('og:image'), `${path} og:image`).toMatch(/^https?:\/\//)
      expect(Number(head.meta('og:image:width'))).toBeGreaterThan(0)

      expect(head.jsonLd, `${path} has one JSON-LD graph`).toHaveLength(1)
      const types = (head.jsonLd[0]['@graph'] as Array<{ '@type': string | string[] }>).flatMap(n => n['@type'])
      expect(types).toEqual(expect.arrayContaining(['WebSite', 'WebPage', 'LegalService']))
      if (/\/(blog|en\/blog)\/(?!pagina|page|categoria|category)[^/]+$/.test(path)) expect(types).toContain('BlogPosting')
      if (/\/(equipe|en\/team)\/[^/]+$/.test(path)) expect(types).toContain('Person')
    }
  })
}

test('pages that should not be indexed are noindex and left out of the sitemap', async ({ request }) => {
  const sitemaps = (await text(request, '/__sitemap__/pt-BR.xml')) + (await text(request, '/__sitemap__/en.xml'))
  for (const path of ['/busca', '/en/search', '/404.html', '/en/404.html']) {
    const head = pageHead(await text(request, path))
    expect(head.meta('robots'), path).toContain('noindex')
    expect(sitemaps).not.toContain(path.replace(/\.html$/, ''))
  }
})

test('social images are generated at 1200×630 or smaller with the same ratio', async ({ request }) => {
  const head = pageHead(await text(request, '/blog/planejamento-sucessorio'))
  const image = await request.get(toPath(head.meta('og:image')!))
  expect(image.status()).toBe(200)
  expect(image.headers()['content-type']).toContain('image/jpeg')
  expect(head.meta('og:image:width')).toBe('1200')
  expect(head.meta('og:image:height')).toBe('630')
})
