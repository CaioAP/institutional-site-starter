import type {
  CategoriesCollectionItem, PagesCollectionItem, PostsCollectionItem, PracticeAreasCollectionItem,
  SettingsCollectionItem, TeamCollectionItem,
} from '@nuxt/content'
import type { ContentSource } from '~~/lib/content/source'
import { resolveContentSourceName } from '~~/lib/content/source'
import { createLocalSource, type LocalCollections, type LocalStore } from '~~/lib/content/adapters/local'
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

function createSource(): ContentSource {
  const name = resolveContentSourceName(useRuntimeConfig().public.contentSource)
  switch (name) {
    case 'local':
      return createLocalSource(nuxtContentStore)
    case 'sanity':
      throw new Error('CONTENT_SOURCE=sanity is not available yet (added with the CMS samples).')
  }
}

/** The active ContentSource, one instance per request on the server. */
export function useContentSource(): ContentSource {
  const nuxtApp = useNuxtApp() as ReturnType<typeof useNuxtApp> & { _contentSource?: ContentSource }
  nuxtApp._contentSource ??= createSource()
  return nuxtApp._contentSource
}
