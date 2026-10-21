import type { Image } from '~~/lib/content/types'

export const OG_IMAGE = { width: 1200, height: 630 } as const

/**
 * Turns a content image into an Open Graph image: local images are cropped to
 * 1200×630 JPEG through @nuxt/image (sharp's "attention" crop keeps faces in
 * portraits) (and written to the static output during
 * `nuxt generate`); absolute URLs, e.g. from a CMS CDN, are used as they are.
 */
export function useSocialImage() {
  const img = useImage()
  const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
  return (image: Image | undefined) => {
    if (!image?.src) return undefined
    if (/^https?:\/\//.test(image.src)) {
      return { url: image.src, alt: image.alt, width: image.width, height: image.height }
    }
    const path = img(image.src, { ...OG_IMAGE, fit: 'cover', position: 'attention', format: 'jpg', quality: 80 })
    // IPX never upscales, so a smaller source yields a smaller crop.
    const scale = image.width && image.width < OG_IMAGE.width ? image.width / OG_IMAGE.width : 1
    return {
      url: `${siteUrl}${path}`,
      alt: image.alt,
      width: Math.round(OG_IMAGE.width * scale),
      height: Math.round(OG_IMAGE.height * scale),
    }
  }
}
