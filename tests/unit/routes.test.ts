import { describe, expect, it } from 'vitest'
import { localizePath } from '../../lib/content/routes'
import { paginate, readingTime } from '../../lib/content/utils'
import { resolveContentSourceName } from '../../lib/content/source'

describe('localizePath', () => {
  it('uses no prefix for pt-BR and /en for English', () => {
    expect(localizePath('index', 'pt-BR')).toBe('/')
    expect(localizePath('index', 'en')).toBe('/en')
    expect(localizePath('about', 'pt-BR')).toBe('/sobre')
    expect(localizePath('about', 'en')).toBe('/en/about')
  })

  it('fills params and translated segments', () => {
    expect(localizePath('practice-areas-slug', 'en', { slug: 'tax-law' })).toBe('/en/practice-areas/tax-law')
    expect(localizePath('blog-category-category-page-page', 'pt-BR', { category: 'trabalho', page: 2 }))
      .toBe('/blog/categoria/trabalho/pagina/2')
  })

  it('throws on missing params', () => {
    expect(() => localizePath('team-slug', 'en')).toThrow(/slug/)
  })
})

describe('utils', () => {
  it('paginate handles empty lists', () => {
    expect(paginate([], 1)).toEqual({ items: [], page: 1, pageCount: 1, perPage: 6, total: 0 })
  })

  it('readingTime has a 1 minute floor', () => {
    expect(readingTime({ nodes: [] })).toBe(1)
  })
})

describe('resolveContentSourceName', () => {
  it('defaults to local and rejects unknown sources', () => {
    expect(resolveContentSourceName(undefined)).toBe('local')
    expect(resolveContentSourceName('SANITY')).toBe('sanity')
    expect(() => resolveContentSourceName('wordpress')).toThrow(/Unknown CONTENT_SOURCE/)
  })
})
