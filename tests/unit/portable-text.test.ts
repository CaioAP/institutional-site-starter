import { describe, expect, it } from 'vitest'
import { portableTextToRichText, richTextToPortableText, type PtNode } from '../../lib/content/rich-text/portable-text'
import { parseVideoUrl, videoUrl } from '../../lib/content/rich-text/video'
import type { RichText, RichTextNode } from '../../lib/content/types'

const t = (value: string): RichTextNode => ({ type: 'text', value })
const el = (tag: Extract<RichTextNode, { type: 'element' }>['tag'], children: RichTextNode[], attrs?: { href?: string, id?: string }): RichTextNode =>
  ({ type: 'element', tag, ...(attrs ? { attrs } : {}), children })

let n = 0
const opts = {
  key: () => `k${n++}`,
  // Stand-in for the seed's import directive; resolved back the way GROQ projects images.
  image: (image: { src: string, alt: string, width?: number, height?: number }, caption?: string) =>
    ({ _type: 'image', src: image.src, alt: image.alt, width: image.width, height: image.height, ...(caption ? { caption } : {}) }),
}
const roundTrip = (body: RichText) => portableTextToRichText(richTextToPortableText(body, opts) as PtNode[])

describe('Portable Text', () => {
  it('round-trips everything the Sanity schema allows', () => {
    const body: RichText = {
      nodes: [
        el('h2', [t('1. Ação imediata')], { id: '_1-ação-imediata' }),
        el('p', [t('Texto com '), el('strong', [t('negrito')]), t(', '), el('a', [t('um link')], { href: 'https://example.com' }), t(' e '), el('em', [el('code', [t('código')])]), t('.')]),
        el('blockquote', [el('p', [t('Primeiro parágrafo')]), el('p', [t('Segundo parágrafo')])]),
        el('ul', [el('li', [t('Um')]), el('li', [t('Dois'), el('ol', [el('li', [t('Dois A')])])]), el('li', [t('Três')])]),
        { type: 'image', image: { src: '/images/a.jpg', alt: 'Alt', width: 10, height: 5 }, caption: 'Legenda' },
        { type: 'video', provider: 'vimeo', id: '76979871', title: 'Vídeo' },
        el('h3', [t('1. Ação imediata')], { id: '_1-ação-imediata-1' }),
      ],
    }
    expect(roundTrip(body)).toEqual(body)
  })

  it('refuses content the schema cannot hold instead of dropping it', () => {
    expect(() => richTextToPortableText({ nodes: [el('table', [])] }, opts)).toThrow(/<table>/)
  })

  it('drops unsafe links and unknown blocks', () => {
    const pt = [
      { _type: 'block', style: 'normal', markDefs: [{ _type: 'link', _key: 'l', href: 'javascript:alert(1)' }], children: [{ _type: 'span', text: 'x', marks: ['l'] }] },
      { _type: 'codeBlock', code: 'x' },
    ] as PtNode[]
    expect(portableTextToRichText(pt)).toEqual({ nodes: [el('p', [t('x')])] })
  })
})

describe('video URLs', () => {
  it.each([
    ['https://www.youtube.com/watch?v=aqz-KE-bpKQ&t=10', { provider: 'youtube', id: 'aqz-KE-bpKQ' }],
    ['https://youtu.be/aqz-KE-bpKQ', { provider: 'youtube', id: 'aqz-KE-bpKQ' }],
    ['https://www.youtube.com/shorts/aqz-KE-bpKQ', { provider: 'youtube', id: 'aqz-KE-bpKQ' }],
    ['https://vimeo.com/76979871', { provider: 'vimeo', id: '76979871' }],
    ['https://player.vimeo.com/video/76979871', { provider: 'vimeo', id: '76979871' }],
    ['https://example.com/watch?v=1', null],
    ['not a url', null],
  ])('%s', (url, expected) => {
    expect(parseVideoUrl(url)).toEqual(expected)
  })

  it('builds a URL that parses back', () => {
    expect(parseVideoUrl(videoUrl('youtube', 'abc'))).toEqual({ provider: 'youtube', id: 'abc' })
    expect(parseVideoUrl(videoUrl('vimeo', '123'))).toEqual({ provider: 'vimeo', id: '123' })
  })
})
