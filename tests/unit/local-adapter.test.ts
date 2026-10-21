import { describe, expect, it } from 'vitest'
import { createLocalSource, slugOf } from '../../lib/content/adapters/local'
import { createFixtureStore } from './fixtures/local-store'

const setup = () => {
  const store = createFixtureStore()
  return { store, source: createLocalSource(store) }
}

describe('local adapter', () => {
  it('derives slugs from the file name', () => {
    expect(slugOf({ stem: 'en/blog/my-post' })).toBe('my-post')
  })

  describe('getSiteSettings', () => {
    it('returns settings for the locale with SEO fallbacks', async () => {
      const { source } = setup()
      const pt = await source.getSiteSettings('pt-BR')
      expect(pt).toMatchObject({ locale: 'pt-BR', firmName: 'Firma', seo: { title: 'Firma', description: 'Slogan' } })
      const en = await source.getSiteSettings('en')
      expect(en.seo.description).toBe('Custom description')
    })
  })

  describe('getPage', () => {
    it('replaces the body section with the normalized markdown body', async () => {
      const { source } = setup()
      const page = await source.getPage('about', 'pt-BR')
      expect(page?.sections[0]).toMatchObject({ type: 'text' })
      const text = page!.sections[0] as Extract<typeof page.sections[number], { type: 'text' }>
      // h1 in content is demoted: the page owns the only <h1>
      expect(text.body.nodes[0]).toMatchObject({ type: 'element', tag: 'h2' })
      expect(page?.sections[1]).toEqual({ type: 'latestPosts', heading: 'Posts', limit: 3 })
    })

    it('defaults to a single body section and keeps updatedAt', async () => {
      const { source } = setup()
      const page = await source.getPage('about', 'en')
      expect(page?.sections).toHaveLength(1)
      expect(page?.updatedAt).toBe('2026-01-01')
    })

    it('returns null for a missing page', async () => {
      const { source } = setup()
      expect(await source.getPage('terms', 'en')).toBeNull()
    })
  })

  describe('practice areas', () => {
    it('lists by order with translations', async () => {
      const { source } = setup()
      const areas = await source.listPracticeAreas('pt-BR')
      expect(areas.map(a => a.slug)).toEqual(['civil', 'tributario'])
      expect(areas[1]!.translations).toEqual({ 'pt-BR': 'tributario', 'en': 'tax-law' })
    })

    it('resolves related team members', async () => {
      const { source } = setup()
      const area = await source.getPracticeArea('tributario', 'pt-BR')
      expect(area?.team.map(m => m.slug)).toEqual(['ana'])
      expect(area?.seo.title).toBe('Tributário')
    })

    it('returns null for an unknown slug or a slug from another locale', async () => {
      const { source } = setup()
      expect(await source.getPracticeArea('nope', 'pt-BR')).toBeNull()
      expect(await source.getPracticeArea('tax-law', 'pt-BR')).toBeNull()
    })
  })

  describe('team', () => {
    it('lists by order', async () => {
      const { source } = setup()
      expect((await source.listTeamMembers('pt-BR')).map(m => m.slug)).toEqual(['ana', 'bia'])
    })

    it('returns a member with areas and optional fields', async () => {
      const { source } = setup()
      const ana = await source.getTeamMember('ana', 'pt-BR')
      expect(ana?.areas.map(a => a.slug)).toEqual(['civil', 'tributario'])
      expect(ana?.registration).toBe('OAB 1')
      expect(ana?.translations).toEqual({ 'pt-BR': 'ana', 'en': 'ana' })
      const bia = await source.getTeamMember('bia', 'pt-BR')
      expect(bia?.translations).toEqual({ 'pt-BR': 'bia' })
      expect(bia).not.toHaveProperty('registration')
    })
  })

  describe('posts', () => {
    it('sorts newest first and paginates', async () => {
      const { source } = setup()
      const page1 = await source.listPosts('pt-BR')
      expect(page1).toMatchObject({ page: 1, pageCount: 2, total: 8, perPage: 6 })
      expect(page1.items[0]!.slug).toBe('post-7')
      const page2 = await source.listPosts('pt-BR', { page: 2 })
      expect(page2.items.map(p => p.slug)).toEqual(['post-1', 'only-pt'])
    })

    it('clamps out-of-range pages', async () => {
      const { source } = setup()
      expect((await source.listPosts('pt-BR', { page: 99 })).page).toBe(2)
    })

    it('filters by category slug', async () => {
      const { source } = setup()
      const work = await source.listPosts('pt-BR', { category: 'trabalho' })
      expect(work.total).toBe(3)
      expect(work.items.every(p => p.category.slug === 'trabalho')).toBe(true)
    })

    it('computes reading time from the body', async () => {
      const { source } = setup()
      const { items } = await source.listPosts('pt-BR', { perPage: 100 })
      expect(items.find(p => p.slug === 'post-1')!.readingTime).toBe(3) // 450 words / 200 wpm
      expect(items.find(p => p.slug === 'only-pt')!.readingTime).toBe(1)
    })

    it('returns a full post with author, video and related posts from the same category first', async () => {
      const { source } = setup()
      const post = await source.getPost('only-pt', 'pt-BR')
      expect(post?.author.slug).toBe('bia')
      expect(post?.body.nodes).toContainEqual({ type: 'video', provider: 'youtube', id: 'abc', title: 'Vídeo', caption: undefined })
      expect(post?.related).toHaveLength(3)
      expect(post?.related.every(p => p.category.slug === 'empresarial')).toBe(true)
      expect(post?.translations).toEqual({ 'pt-BR': 'only-pt' })
    })

    it('links translations across locales', async () => {
      const { source } = setup()
      const post = await source.getPost('post-1-en', 'en')
      expect(post?.translations).toEqual({ 'pt-BR': 'post-1', 'en': 'post-1-en' })
      expect(post?.category.translations).toEqual({ 'pt-BR': 'empresarial', 'en': 'business' })
    })
  })

  describe('listRoutes', () => {
    it('lists every route in both locales with localized paths and alternates', async () => {
      const { source } = setup()
      const routes = await source.listRoutes()
      const paths = routes.map(r => r.path)

      expect(paths).toEqual(expect.arrayContaining([
        '/', '/en', '/sobre', '/en/about', '/areas-de-atuacao', '/en/practice-areas',
        '/areas-de-atuacao/tributario', '/en/practice-areas/tax-law',
        '/equipe/ana', '/equipe/bia', '/en/team/ana',
        '/blog', '/blog/pagina/2', '/blog/post-1', '/blog/only-pt', '/en/blog/post-1-en',
        '/blog/categoria/empresarial', '/blog/categoria/trabalho', '/en/blog/category/business',
        '/contato', '/en/contact', '/busca', '/en/search', '/privacidade', '/en/privacy', '/termos', '/en/terms',
        '/404', '/en/404',
      ]))
      expect(new Set(paths).size).toBe(paths.length)
      // English has a single post, so no second page.
      expect(paths).not.toContain('/en/blog/page/2')

      const tax = routes.find(r => r.path === '/areas-de-atuacao/tributario')!
      expect(tax.alternates).toEqual({ 'pt-BR': '/areas-de-atuacao/tributario', 'en': '/en/practice-areas/tax-law' })
      const solo = routes.find(r => r.path === '/blog/only-pt')!
      expect(solo.alternates).toEqual({ 'pt-BR': '/blog/only-pt' })
      expect(solo.lastmod).toBe('2025-12-01')
      expect(routes.find(r => r.path === '/en/about')!.lastmod).toBe('2026-01-01')
    })
  })

  it('reads each collection once per locale (memoized)', async () => {
    const { source, store } = setup()
    await source.listRoutes()
    const first = store.calls
    await source.listRoutes()
    expect(store.calls).toBe(first)
    expect(first).toBeLessThanOrEqual(6 * 2)
  })
})
