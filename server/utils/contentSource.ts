import type { H3Event } from 'h3'
import { queryCollection } from '@nuxt/content/nitro'
import { createLocalSource, type LocalStore } from '../../lib/content/adapters/local'
import { resolveContentSourceName, type ContentSource } from '../../lib/content/source'

/**
 * The active ContentSource for server routes (sitemap, feeds). Mirrors
 * app/composables/useContentSource.ts, but queries through the request event.
 */
export function getServerContentSource(event: H3Event): ContentSource {
  const name = resolveContentSourceName(useRuntimeConfig(event).public.contentSource)
  switch (name) {
    case 'local': {
      const store: LocalStore = {
        all(collection, locale) {
          return queryCollection(event, collection).where('stem', 'LIKE', `${locale}/%`).all() as never
        },
      }
      return createLocalSource(store)
    }
    case 'sanity':
      throw new Error('CONTENT_SOURCE=sanity is not available yet (added with the CMS samples).')
  }
}
