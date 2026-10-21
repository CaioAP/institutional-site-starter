import { describe, expect, it } from 'vitest'
import { cleanUrl, parseExcerpt } from '../../app/composables/useSearch'

describe('search helpers', () => {
  it('parses Pagefind excerpts into safe parts', () => {
    expect(parseExcerpt('A <mark>LGPD</mark> &amp; <b>x</b>')).toEqual([
      { text: 'A ', mark: false }, { text: 'LGPD', mark: true }, { text: ' & x', mark: false },
    ])
    expect(parseExcerpt('<img src=x onerror=alert(1)>ok')).toEqual([{ text: 'ok', mark: false }])
  })

  it('normalizes result URLs', () => {
    expect(cleanUrl('/en/blog/x/')).toBe('/en/blog/x')
    expect(cleanUrl('/sobre/index.html')).toBe('/sobre')
    expect(cleanUrl('/')).toBe('/')
  })
})
