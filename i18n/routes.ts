/**
 * Translated slugs for every page, keyed by Nuxt route name.
 * pt-BR is the default locale (no prefix); en lives under /en.
 * Keep in sync with the route table in docs/content-model.md.
 */
export const localizedPages = {
  'about': { 'pt-BR': '/sobre', 'en': '/about' },
  'practice-areas': { 'pt-BR': '/areas-de-atuacao', 'en': '/practice-areas' },
  'practice-areas-slug': { 'pt-BR': '/areas-de-atuacao/[slug]', 'en': '/practice-areas/[slug]' },
  'team': { 'pt-BR': '/equipe', 'en': '/team' },
  'team-slug': { 'pt-BR': '/equipe/[slug]', 'en': '/team/[slug]' },
  'blog': { 'pt-BR': '/blog', 'en': '/blog' },
  'blog-slug': { 'pt-BR': '/blog/[slug]', 'en': '/blog/[slug]' },
  'blog-page-page': { 'pt-BR': '/blog/pagina/[page]', 'en': '/blog/page/[page]' },
  'blog-category-category': { 'pt-BR': '/blog/categoria/[category]', 'en': '/blog/category/[category]' },
  'blog-category-category-page-page': { 'pt-BR': '/blog/categoria/[category]/pagina/[page]', 'en': '/blog/category/[category]/page/[page]' },
  'contact': { 'pt-BR': '/contato', 'en': '/contact' },
  'search': { 'pt-BR': '/busca', 'en': '/search' },
  'privacy': { 'pt-BR': '/privacidade', 'en': '/privacy' },
  'terms': { 'pt-BR': '/termos', 'en': '/terms' },
  '404': { 'pt-BR': '/404', 'en': '/404' },
} as const

export type LocalizedPageName = keyof typeof localizedPages | 'index'

/** Path of the home page per locale (not part of `localizedPages`, Nuxt handles it). */
export const homePaths = { 'pt-BR': '/', 'en': '/' } as const
