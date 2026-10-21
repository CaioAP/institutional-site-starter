import { describe, expect, it } from 'vitest'
import { createSanitySource } from '../../lib/content/adapters/sanity'
import { createOfflineFetcher, resolveSeedAssets } from '../../lib/content/adapters/sanity-fetcher'

const img = (file: string) => ({ _type: 'altImage', _sanityAsset: `image@file://./public/images/${file}`, alt: file })
const ref = (id: string) => ({ _type: 'reference', _ref: id })
const tr = (lang: string, id: string) => ({ _key: lang, _type: 'internationalizedArrayReferenceValue', language: lang, value: { ...ref(id), _weak: true } })

const dataset = resolveSeedAssets([
  { _id: 'cat-pt', _type: 'category', language: 'pt-BR', slug: { current: 'geral' }, title: 'Geral' },
  { _id: 'cat-en', _type: 'category', language: 'en', slug: { current: 'general' }, title: 'General' },
  { _id: 'tm-cat', _type: 'translation.metadata', translations: [tr('pt-BR', 'cat-pt'), tr('en', 'cat-en')] },
  { _id: 'ana-pt', _type: 'teamMember', language: 'pt-BR', slug: { current: 'ana' }, name: 'Ana', role: 'Sócia', photo: img('a.jpg'), shortBio: 'Bio', order: 1, bio: [] },
  {
    _id: 'post-pt', _type: 'post', language: 'pt-BR', slug: { current: 'so-pt' }, title: 'Só em português', excerpt: 'Resumo',
    cover: img('c.jpg'), category: ref('cat-pt'), author: ref('ana-pt'), publishedAt: '2026-01-01',
    body: [
      { _type: 'block', _key: 'b', style: 'normal', markDefs: [], children: [{ _type: 'span', text: 'Olá' }] },
      { _type: 'videoEmbed', _key: 'v', url: 'https://youtu.be/abc', title: 'Vídeo' },
    ],
  },
  { _id: 'drafts.post-pt', _type: 'post', language: 'pt-BR', slug: { current: 'rascunho' }, title: 'Rascunho' },
], { './public/images/a.jpg': { width: 4, height: 5 }, './public/images/c.jpg': { width: 16, height: 9 } })

const source = createSanitySource(createOfflineFetcher(dataset))

describe('sanity adapter', () => {
  it('reads published documents only, with assets and references resolved', async () => {
    const { items } = await source.listPosts('pt-BR')
    expect(items.map(p => p.slug)).toEqual(['so-pt'])
    const post = await source.getPost('so-pt', 'pt-BR')
    expect(post?.cover).toEqual({ src: '/images/c.jpg', alt: 'c.jpg', width: 16, height: 9 })
    expect(post?.author.name).toBe('Ana')
    expect(post?.category.translations).toEqual({ 'pt-BR': 'geral', 'en': 'general' })
    expect(post?.body.nodes[1]).toEqual({ type: 'video', provider: 'youtube', id: 'abc', title: 'Vídeo' })
  })

  it('links translations through the metadata document only', async () => {
    const post = await source.getPost('so-pt', 'pt-BR')
    expect(post?.translations).toEqual({ 'pt-BR': 'so-pt' })
    expect(await source.getPost('so-pt', 'en')).toBeNull()
  })

  it('leaves out fields that are not set instead of returning null', async () => {
    const member = await source.getTeamMember('ana', 'pt-BR')
    expect(member).not.toHaveProperty('registration')
    expect(member).not.toHaveProperty('email')
    expect(member?.seo).toEqual({ title: 'Ana', description: 'Bio' })
  })
})
