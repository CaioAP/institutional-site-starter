import { beforeAll, describe, expect, it } from 'vitest'
import { createLocalSource } from '../../lib/content/adapters/local'
import { readLocalContent } from '../../lib/content/adapters/local-sqlite'
import { createSanitySource } from '../../lib/content/adapters/sanity'
import { createOfflineFetcher, loadSeedDataset } from '../../lib/content/adapters/sanity-fetcher'
import type { ContentSource } from '../../lib/content/source'
import { LOCALES, PAGE_KEYS } from '../../lib/content/types'

/**
 * The Sanity sample must render the same site as the local content. This runs
 * the Sanity adapter's real GROQ queries (via groq-js) over the committed seed
 * and compares every ContentSource method with the local source.
 *
 * Failing? The seed is out of date: run `pnpm seed:sanity` and commit
 * studios/sanity/seed/.
 */
let local: ContentSource
let sanity: ContentSource

beforeAll(async () => {
  local = createLocalSource(await readLocalContent())
  sanity = createSanitySource(createOfflineFetcher(await loadSeedDataset()))
})

describe('Sanity seed matches the local content', () => {
  it('lists the same routes', async () => {
    expect(await sanity.listRoutes()).toEqual(await local.listRoutes())
  })

  for (const locale of LOCALES) {
    describe(locale, () => {
      it('site settings and pages', async () => {
        expect(await sanity.getSiteSettings(locale)).toEqual(await local.getSiteSettings(locale))
        for (const key of PAGE_KEYS) {
          expect(await sanity.getPage(key, locale), key).toEqual(await local.getPage(key, locale))
        }
      })

      it('practice areas and team', async () => {
        const areas = await local.listPracticeAreas(locale)
        expect(await sanity.listPracticeAreas(locale)).toEqual(areas)
        for (const { slug } of areas) {
          expect(await sanity.getPracticeArea(slug, locale), slug).toEqual(await local.getPracticeArea(slug, locale))
        }
        const team = await local.listTeamMembers(locale)
        expect(await sanity.listTeamMembers(locale)).toEqual(team)
        for (const { slug } of team) {
          expect(await sanity.getTeamMember(slug, locale), slug).toEqual(await local.getTeamMember(slug, locale))
        }
      })

      it('blog', async () => {
        const categories = await local.listCategories(locale)
        expect(await sanity.listCategories(locale)).toEqual(categories)
        const posts = await local.listPosts(locale, { perPage: 100 })
        expect(await sanity.listPosts(locale, { perPage: 100 })).toEqual(posts)
        for (const { slug } of categories) {
          expect(await sanity.listPosts(locale, { category: slug })).toEqual(await local.listPosts(locale, { category: slug }))
        }
        for (const { slug } of posts.items) {
          expect(await sanity.getPost(slug, locale), slug).toEqual(await local.getPost(slug, locale))
        }
      })
    })
  }
})
