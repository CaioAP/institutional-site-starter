import type { LocalCollections, LocalStore } from '../../../lib/content/adapters/local'
import type { MinimarkTree } from '../../../lib/content/rich-text/minimark'
import type { Locale } from '../../../lib/content/types'

const body = (...value: MinimarkTree['value']): MinimarkTree => ({ type: 'minimark', value })
const img = (n: number) => ({ src: `/img/${n}.jpg`, alt: `Image ${n}`, width: 800, height: 600 })
const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ')

type Docs = { [K in keyof LocalCollections]: Array<LocalCollections[K]> }

/**
 * Small bilingual dataset with deliberate edge cases:
 *  - post "only-pt" has no English translation
 *  - practice areas are stored out of order
 *  - 8 pt-BR posts so pagination (6/page) has two pages
 */
export const fixtures: Docs = {
  settings: [
    {
      stem: 'pt-BR/settings', firmName: 'Firma', tagline: 'Slogan',
      contact: { email: 'a@b.c', phone: '1', whatsapp: '55' },
      address: { street: 'Rua', city: 'SP', region: 'SP', postalCode: '0', country: 'BR', mapUrl: 'https://map' },
      officeHours: '9-18', socials: [],
    },
    {
      stem: 'en/settings', firmName: 'Firm', tagline: 'Tagline',
      contact: { email: 'a@b.c', phone: '1', whatsapp: '55' },
      address: { street: 'Street', city: 'SP', region: 'SP', postalCode: '0', country: 'BR', mapUrl: 'https://map' },
      officeHours: '9-6', socials: [], seo: { description: 'Custom description' },
    },
  ],
  pages: [
    {
      stem: 'pt-BR/pages/about', key: 'about', title: 'Sobre', lead: 'Lead',
      sections: [{ type: 'body' }, { type: 'latestPosts', heading: 'Posts' }],
      body: body(['h1', {}, 'Título'], ['p', {}, 'Texto']),
    },
    { stem: 'en/pages/about', key: 'about', title: 'About', updatedAt: '2026-01-01', body: body(['p', {}, 'Text']) },
  ],
  practiceAreas: [
    { stem: 'pt-BR/practice-areas/tributario', translationKey: 'tax', title: 'Tributário', summary: 's', icon: 'landmark', order: 2, team: ['ana'], body: body(['p', {}, 'x']) },
    { stem: 'pt-BR/practice-areas/civil', translationKey: 'civil', title: 'Civil', summary: 's', icon: 'scale', order: 1, team: [] },
    { stem: 'en/practice-areas/tax-law', translationKey: 'tax', title: 'Tax', summary: 's', icon: 'landmark', order: 2, team: ['ana'] },
    { stem: 'en/practice-areas/civil-law', translationKey: 'civil', title: 'Civil', summary: 's', icon: 'scale', order: 1 },
  ],
  team: [
    { stem: 'pt-BR/team/ana', translationKey: 'ana', name: 'Ana', role: 'Sócia', photo: img(1), shortBio: 'b', areas: ['tax', 'civil'], order: 1, registration: 'OAB 1', body: body(['p', {}, 'Bio']) },
    { stem: 'pt-BR/team/bia', translationKey: 'bia', name: 'Bia', role: 'Associada', photo: img(2), shortBio: 'b', order: 2 },
    { stem: 'en/team/ana', translationKey: 'ana', name: 'Ana', role: 'Partner', photo: img(1), shortBio: 'b', areas: ['tax'], order: 1 },
  ],
  categories: [
    { stem: 'pt-BR/categories/empresarial', translationKey: 'biz', title: 'Empresarial' },
    { stem: 'pt-BR/categories/trabalho', translationKey: 'work', title: 'Trabalho' },
    { stem: 'en/categories/business', translationKey: 'biz', title: 'Business' },
  ],
  posts: [
    ...Array.from({ length: 7 }, (_, i) => ({
      stem: `pt-BR/blog/post-${i + 1}`, translationKey: `p${i + 1}`, title: `Post ${i + 1}`, description: 'd',
      cover: img(10 + i), category: i % 2 ? 'work' : 'biz', author: 'ana', publishedAt: `2026-0${(i % 9) + 1}-10`,
      body: body(['p', {}, words(450)]),
    })),
    {
      stem: 'pt-BR/blog/only-pt', translationKey: 'solo', title: 'Só em português', description: 'd', cover: img(30),
      category: 'biz', author: 'bia', publishedAt: '2025-12-01', tags: ['x'],
      body: body(['p', {}, 'curto'], ['video-embed', { provider: 'youtube', id: 'abc', title: 'Vídeo' }]),
    },
    {
      stem: 'en/blog/post-1-en', translationKey: 'p1', title: 'Post 1 EN', description: 'd', cover: img(10),
      category: 'biz', author: 'ana', publishedAt: '2026-01-10', body: body(['p', {}, 'short']),
    },
  ],
}

export function createFixtureStore(data: Docs = fixtures): LocalStore & { calls: number } {
  const store = {
    calls: 0,
    async all<K extends keyof LocalCollections>(collection: K, locale: Locale) {
      store.calls++
      return (data[collection] as Array<LocalCollections[K]>).filter(d => d.stem.startsWith(`${locale}/`))
    },
  }
  return store
}
