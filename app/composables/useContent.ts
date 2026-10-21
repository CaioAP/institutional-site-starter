import type { ContentSource } from '~~/lib/content/source'

/**
 * Fetches content through the active ContentSource with useAsyncData, keyed
 * by locale so each language gets its own payload. During `nuxt generate` the
 * result is stored in the page payload, so client navigation never re-queries.
 *
 *   const { data: area } = await useContent('area', (src, locale) => src.getPracticeArea(slug, locale), [slug])
 */
export async function useContent<T>(
  key: string,
  fetcher: (source: ContentSource, locale: ReturnType<typeof useContentLocale>['value']) => Promise<T>,
  deps: Array<string | number | undefined> = [],
) {
  const source = useContentSource()
  const locale = useContentLocale()
  return useAsyncData(
    () => [key, locale.value, ...deps].join(':'),
    () => fetcher(source, locale.value),
  )
}

/** SiteSettings for the active locale (shared across components). */
export async function useSiteSettings() {
  const { data } = await useContent('settings', (src, locale) => src.getSiteSettings(locale))
  return data
}

/** Fetch a single item or show the localized 404 page. */
export async function useContentOr404<T>(
  key: string,
  fetcher: (source: ContentSource, locale: ReturnType<typeof useContentLocale>['value']) => Promise<T | null>,
  deps: Array<string | number | undefined> = [],
) {
  const { data } = await useContent(key, fetcher, deps)
  if (!data.value) throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })
  return data as Ref<T>
}
