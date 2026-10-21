import type {
  CategoriesCollectionItem, PagesCollectionItem, PostsCollectionItem, PracticeAreasCollectionItem,
  SettingsCollectionItem, TeamCollectionItem,
} from '@nuxt/content'
import type { ContentSource } from '~~/lib/content/source'
import { resolveContentSourceName } from '~~/lib/content/source'
import { createLocalSource, type LocalCollections, type LocalStore } from '~~/lib/content/adapters/local'
import { createSanitySource, type SanityFetcher } from '~~/lib/content/adapters/sanity'
import type { Locale } from '~~/lib/content/types'

/**
 * Compile-time guard: Nuxt Content's generated collection types must stay
 * assignable to the shapes the local adapter expects. If content.config.ts
 * drifts from lib/content/adapters/local.ts, typecheck fails here.
 */
type Assignable<A, B> = [A] extends [B] ? true : false
const _schemaCheck: [
  Assignable<SettingsCollectionItem, LocalCollections['settings']>,
  Assignable<PagesCollectionItem, LocalCollections['pages']>,
  Assignable<PracticeAreasCollectionItem, LocalCollections['practiceAreas']>,
  Assignable<TeamCollectionItem, LocalCollections['team']>,
  Assignable<CategoriesCollectionItem, LocalCollections['categories']>,
  Assignable<PostsCollectionItem, LocalCollections['posts']>,
] = [true, true, true, true, true, true]
void _schemaCheck

const nuxtContentStore: LocalStore = {
  all(collection, locale: Locale) {
    return queryCollection(collection).where('stem', 'LIKE', `${locale}/%`).all() as never
  },
}

/**
 * On the server (SSR, prerender) queries go straight to Sanity, or to the
 * offline seed. In the browser, which only queries during `nuxt dev`, they go
 * through the dev proxy in server/api/_content/sanity.post.ts.
 */
function sanityFetcher(): SanityFetcher {
  if (import.meta.server) {
    const config = useRuntimeConfig().sanity
    const fetcher = import('~~/lib/content/adapters/sanity-fetcher').then(m => m.getSanityFetcher(config))
    return { fetch: async (query, params) => (await fetcher).fetch(query, params) }
  }
  return { fetch: (query, params) => $fetch('/api/_content/sanity', { method: 'POST', body: { query, params } }) as never }
}

function createSource(): ContentSource {
  const name = resolveContentSourceName(useRuntimeConfig().public.contentSource)
  switch (name) {
    case 'local':
      return createLocalSource(nuxtContentStore)
    case 'sanity':
      return createSanitySource(sanityFetcher())
  }
}

/** The active ContentSource, one instance per request on the server. */
export function useContentSource(): ContentSource {
  const nuxtApp = useNuxtApp() as ReturnType<typeof useNuxtApp> & { _contentSource?: ContentSource }
  nuxtApp._contentSource ??= createSource()
  return nuxtApp._contentSource
}
