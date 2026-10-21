import theme from '#theme'
import type { SiteSettings } from '~~/lib/content/types'

/**
 * Site-wide head defaults from SiteSettings: og:site_name, the default social
 * image, and the schema.org identity (a LegalService that WebSite, WebPage and
 * Article nodes point to as publisher). Called once from the default layout.
 */
export function useSiteIdentity(settings: MaybeRefOrGetter<SiteSettings | null | undefined>) {
  const socialImage = useSocialImage()
  const s = computed(() => toValue(settings))
  const image = computed(() => socialImage(s.value?.seo.image))

  useSeoMeta({
    ogSiteName: () => s.value?.firmName,
    ogImage: () => image.value?.url,
    ogImageAlt: () => image.value?.alt,
    ogImageWidth: () => image.value?.width,
    ogImageHeight: () => image.value?.height,
    twitterCard: 'summary_large_image',
  })

  const value = s.value
  if (!value) return
  useSchemaOrg([
    defineLocalBusiness({
      '@type': 'LegalService',
      'name': value.firmName,
      'description': value.tagline,
      'logo': theme.brand.logo.light,
      ...(image.value ? { image: image.value.url } : {}),
      'email': value.contact.email,
      'telephone': value.contact.phone,
      'address': {
        streetAddress: value.address.street,
        addressLocality: value.address.city,
        addressRegion: value.address.region,
        postalCode: value.address.postalCode,
        addressCountry: value.address.country,
      },
      'sameAs': value.socials.map(link => link.url),
    }),
  ])
}
