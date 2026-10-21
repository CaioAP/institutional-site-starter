import type { LocalizedPageName } from '~~/i18n/routes'
import type { Locale, Translations } from '~~/lib/content/types'
import { LOCALES } from '~~/lib/content/types'
import { localizePath } from '~~/lib/content/routes'

interface AlternatesState {
  path: string
  links: Partial<Record<Locale, string>>
}

/**
 * Detail pages register where the language switcher should go for each
 * locale: the translated entity when it exists, otherwise the localized
 * listing (spec 5.2). Static pages don't need to call this.
 */
export function useAlternates(
  translations: MaybeRefOrGetter<Translations | undefined>,
  route: { name: LocalizedPageName, param: string, fallback: LocalizedPageName, extraParams?: Record<string, string> },
) {
  const state = useState<AlternatesState | null>('i18n-alternates', () => null)
  const current = useRoute()
  const setI18nParams = useSetI18nParams()

  const apply = () => {
    const t = toValue(translations) ?? {}
    const links: AlternatesState['links'] = {}
    const params: Record<string, Record<string, string>> = {}
    for (const locale of LOCALES) {
      const slug = t[locale]
      if (slug) {
        links[locale] = localizePath(route.name, locale, { ...route.extraParams, [route.param]: slug })
        params[locale] = { ...route.extraParams, [route.param]: slug }
      }
      else {
        links[locale] = localizePath(route.fallback, locale)
      }
    }
    state.value = { path: current.path, links }
    if (import.meta.server) {
      const event = useRequestEvent()
      if (event) event.context.alternateLinks = links
    }
    // Lets @nuxtjs/i18n emit correct hreflang links for translated slugs.
    setI18nParams(params)
  }
  apply()
  watch(() => toValue(translations), apply)
}

export const ALTERNATE_PLACEHOLDER = '/__alternate__/'

/**
 * Used by the language switcher.
 *
 * During SSR the header renders before the page has loaded its content, so the
 * page's translations aren't known yet. The server then emits a placeholder
 * (with the default link as fallback) that server/plugins/alternate-links.ts
 * swaps for the real link once the whole page has rendered. On the client the
 * state is already hydrated, so both sides agree.
 */
export function useAlternateLink() {
  const state = useState<AlternatesState | null>('i18n-alternates', () => null)
  const route = useRoute()
  const switchLocalePath = useSwitchLocalePath()
  return (locale: Locale) => {
    if (state.value && state.value.path === route.path && state.value.links[locale]) return state.value.links[locale]!
    const fallback = switchLocalePath(locale)
    if (import.meta.server) return `${ALTERNATE_PLACEHOLDER}${locale}?fallback=${encodeURIComponent(fallback)}`
    return fallback
  }
}
