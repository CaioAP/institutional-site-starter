import { describe, expect, it } from 'vitest'
import { minimarkToRichText } from '../../lib/content/rich-text/minimark'
import type { MinimarkTree } from '../../lib/content/rich-text/minimark'

const tree = (...value: MinimarkTree['value']): MinimarkTree => ({ type: 'minimark', value })

describe('minimarkToRichText', () => {
  it('handles empty input', () => {
    expect(minimarkToRichText(undefined)).toEqual({ nodes: [] })
  })

  it('keeps whitelisted tags and heading ids, drops whitespace between blocks', () => {
    const out = minimarkToRichText(tree(['h2', { id: 'a' }, 'Title'], '\n', ['p', {}, 'Hello ', ['strong', {}, 'world']]))
    expect(out.nodes).toEqual([
      { type: 'element', tag: 'h2', attrs: { id: 'a' }, children: [{ type: 'text', value: 'Title' }] },
      { type: 'element', tag: 'p', children: [{ type: 'text', value: 'Hello ' }, { type: 'element', tag: 'strong', children: [{ type: 'text', value: 'world' }] }] },
    ])
  })

  it('lifts images out of paragraphs and keeps alt text', () => {
    const out = minimarkToRichText(tree(['p', {}, ['img', { src: '/a.jpg', alt: 'A', width: '640' }]]))
    expect(out.nodes).toEqual([{ type: 'image', image: { src: '/a.jpg', alt: 'A', width: 640, height: undefined } }])
  })

  it('converts the video-embed component', () => {
    const out = minimarkToRichText(tree(['video-embed', { provider: 'vimeo', id: '123', title: 'T' }]))
    expect(out.nodes).toEqual([{ type: 'video', provider: 'vimeo', id: '123', title: 'T', caption: undefined }])
  })

  it('drops unsupported video providers and unsafe content', () => {
    const out = minimarkToRichText(tree(
      ['video-embed', { provider: 'other', id: '1' }],
      ['script', {}, 'alert(1)'],
      ['p', {}, ['a', { href: 'javascript:alert(1)' }, 'click']],
    ))
    expect(out.nodes).toEqual([{ type: 'element', tag: 'p', children: [{ type: 'text', value: 'click' }] }])
  })

  it('unwraps unknown elements and demotes h1/h5', () => {
    const out = minimarkToRichText(tree(['div', {}, ['h1', {}, 'A']], ['h5', {}, 'B']))
    expect(out.nodes.map(n => n.type === 'element' && n.tag)).toEqual(['h2', 'h4'])
  })

  it('keeps safe links', () => {
    const out = minimarkToRichText(tree(['p', {}, ['a', { href: 'https://x.dev', target: '_blank' }, 'x']]))
    expect(out.nodes[0]).toMatchObject({ children: [{ tag: 'a', attrs: { href: 'https://x.dev' } }] })
  })
})
