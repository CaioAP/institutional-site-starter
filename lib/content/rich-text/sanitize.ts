/** Allows http(s), mailto, tel, root-relative and in-page links; rejects javascript:, data:, etc. */
export function safeHref(href: string | undefined | null): string | undefined {
  if (!href) return undefined
  const value = href.trim()
  if (value.startsWith('/') && !value.startsWith('//')) return value
  if (value.startsWith('#')) return value
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value
  return undefined
}
