import { getSanityFetcher } from '../../../lib/content/adapters/sanity-fetcher'

/**
 * Dev-only GROQ proxy for CONTENT_SOURCE=sanity. During `nuxt dev`, client-side
 * navigation runs the content queries in the browser; they come through here
 * so offline mode works and no CORS origin or token reaches the browser.
 * Generated sites never call it: every page ships with its prerendered payload.
 */
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) throw createError({ statusCode: 404 })
  const { query, params } = await readBody<{ query: string, params: Record<string, unknown> }>(event)
  return getSanityFetcher(useRuntimeConfig(event).sanity).fetch(query, params)
})
