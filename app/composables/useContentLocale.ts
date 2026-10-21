import type { Locale } from '~~/lib/content/types'

/** The active i18n locale, typed for the content layer. */
export function useContentLocale() {
  const { locale } = useI18n()
  return computed(() => locale.value as Locale)
}

/** Locale-aware date formatting (dates in content are ISO "YYYY-MM-DD"). */
export function useFormatDate() {
  const locale = useContentLocale()
  return (iso: string) => new Intl.DateTimeFormat(locale.value, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(iso))
}
