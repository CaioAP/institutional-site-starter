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

/** One of each detail template, as translation pairs from the sample content. */
export const detailPages = [
  { pt: '/areas-de-atuacao/direito-tributario', en: '/en/practice-areas/tax-law' },
  { pt: '/equipe/ana-ribeiro', en: '/en/team/ana-ribeiro' },
  { pt: '/blog/lgpd-para-pequenas-empresas', en: '/en/blog/lgpd-for-small-businesses' },
  { pt: '/blog/categoria/trabalho', en: '/en/blog/category/employment' },
]

export const allStaticUrls = staticPages.flatMap(p => [p.pt, p.en])
export const allDetailUrls = detailPages.flatMap(p => [p.pt, p.en])
