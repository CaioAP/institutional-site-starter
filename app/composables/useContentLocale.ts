import type { Locale } from '~~/lib/content/types'
import { LOCALES } from '~~/lib/content/types'

/**
 * The locale of the route being rendered, typed for the content layer.
 *
 * Read from the route name (`about___en`), not from i18n's global locale:
 * when the language switcher is used, i18n changes the locale before the
 * next page's payload has loaded. A page keyed on the global locale would
 * re-query for the new language while still on the old route, and on a static
 * site with a hosted CMS that query has nowhere to go. Inside a page,
 * useRoute() is that page's own route, so its keys only change with it.
 */
export function useContentLocale() {
  const { locale } = useI18n()
  const route = useRoute()
  return computed(() => {
    const fromRoute = typeof route.name === 'string' ? route.name.split('___')[1] : undefined
    return (fromRoute && (LOCALES as readonly string[]).includes(fromRoute) ? fromRoute : locale.value) as Locale
  })
}

/** Locale-aware date formatting (dates in content are ISO "YYYY-MM-DD"). */
export function useFormatDate() {
  const locale = useContentLocale()
  return (iso: string) => new Intl.DateTimeFormat(locale.value, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(iso))
}
