import type { Seo } from '~~/lib/content/types'

/**
 * Per-page title, description and social meta from the content's SEO fields.
 * When a page has no image, the default from SiteSettings (set in the layout) stays.
 */
export function usePageSeo(seo: MaybeRefOrGetter<Seo & { title?: string } | undefined>, type: 'website' | 'article' = 'website') {
  const socialImage = useSocialImage()
  const s = computed(() => toValue(seo) ?? {})
  const image = computed(() => socialImage(s.value.image))
  useSeoMeta({
    title: () => s.value.title,
    description: () => s.value.description,
    ogTitle: () => s.value.title,
    ogDescription: () => s.value.description,
    ogType: type,
    ...(image.value
      ? {
          ogImage: () => image.value?.url,
          ogImageAlt: () => image.value?.alt,
          ogImageWidth: () => image.value?.width,
          ogImageHeight: () => image.value?.height,
        }
      : {}),
    twitterCard: 'summary_large_image',
    robots: () => (s.value.noindex ? 'noindex, follow' : undefined),
  })
}
