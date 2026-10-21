/** Static (non-slug) pages in both locales, used by smoke and a11y tests. */
export const staticPages = [
  { pt: '/', en: '/en' },
  { pt: '/sobre', en: '/en/about' },
  { pt: '/areas-de-atuacao', en: '/en/practice-areas' },
  { pt: '/equipe', en: '/en/team' },
  { pt: '/blog', en: '/en/blog' },
  { pt: '/contato', en: '/en/contact' },
  { pt: '/busca', en: '/en/search' },
  { pt: '/privacidade', en: '/en/privacy' },
  { pt: '/termos', en: '/en/terms' },
]

export const allStaticUrls = staticPages.flatMap(p => [p.pt, p.en])
