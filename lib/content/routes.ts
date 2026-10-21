import { localizedPages, type LocalizedPageName } from '../../i18n/routes'
import { DEFAULT_LOCALE, type Locale } from './types'

/**
 * Builds the final URL path for a named route, mirroring @nuxtjs/i18n's
 * `prefix_except_default` strategy. Framework-free so adapters, the sitemap
 * and tests can use it.
 *
 *   localizePath('practice-areas-slug', 'en', { slug: 'tax-law' })
 *   → '/en/practice-areas/tax-law'
 */
export function localizePath(name: LocalizedPageName, locale: Locale, params: Record<string, string | number> = {}): string {
  const template = name === 'index' ? '/' : localizedPages[name][locale]
  const path = template.replace(/\[(\w+)\]/g, (_, key: string) => {
    const value = params[key]
    if (value === undefined || value === '') throw new Error(`Missing param "${key}" for route "${name}"`)
    return encodeURIComponent(String(value))
  })
  if (locale === DEFAULT_LOCALE) return path
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}
