import type { LocalizedPageName } from '~~/i18n/routes'

export interface NavItem {
  name: LocalizedPageName
  labelKey: string
}

/** Main navigation, in display order. Labels are i18n keys. */
export const mainNav: NavItem[] = [
  { name: 'about', labelKey: 'nav.about' },
  { name: 'practice-areas', labelKey: 'nav.practiceAreas' },
  { name: 'team', labelKey: 'nav.team' },
  { name: 'blog', labelKey: 'nav.blog' },
  { name: 'contact', labelKey: 'nav.contact' },
]

export const legalNav: NavItem[] = [
  { name: 'privacy', labelKey: 'nav.privacy' },
  { name: 'terms', labelKey: 'nav.terms' },
]

export function useNavigation() {
  const localePath = useLocalePath()
  const route = useRoute()
  const getRouteBaseName = useRouteBaseName()

  /** True for the item's own page and its detail pages (e.g. a post under Blog). */
  const isActive = (item: NavItem) => {
    const base = getRouteBaseName(route)
    return base === item.name || base === `${item.name}-slug`
  }

  const to = (item: NavItem) => localePath({ name: item.name })

  return { mainNav, legalNav, isActive, to }
}
