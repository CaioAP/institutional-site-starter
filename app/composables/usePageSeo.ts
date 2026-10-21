import type { Seo } from '~~/lib/content/types'

/** Per-page title, description and social meta from the content's SEO fields. */
export function usePageSeo(seo: MaybeRefOrGetter<Seo & { title?: string } | undefined>, type: 'website' | 'article' = 'website') {
  const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
  const s = computed(() => toValue(seo) ?? {})
  const image = computed(() => {
    const src = s.value.image?.src
    return src ? (src.startsWith('http') ? src : `${siteUrl}${src}`) : undefined
  })
  useSeoMeta({
    title: () => s.value.title,
    description: () => s.value.description,
    ogTitle: () => s.value.title,
    ogDescription: () => s.value.description,
    ogType: type,
    ogImage: () => image.value,
    ogImageAlt: () => s.value.image?.alt,
    twitterCard: 'summary_large_image',
    robots: () => (s.value.noindex ? 'noindex, follow' : undefined),
  })
}
