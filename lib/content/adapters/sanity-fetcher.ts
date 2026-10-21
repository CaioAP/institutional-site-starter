/**
 * Fetchers for the Sanity adapter. Server-only (Node APIs, groq-js).
 *
 * - Live: @sanity/client against a real project (SANITY_PROJECT_ID set).
 * - Offline: groq-js evaluates the same GROQ queries in memory over the seed
 *   file (studios/sanity/seed/content.ndjson). Used when no project is
 *   configured, so `pnpm dev:sanity` runs without a Sanity account, and in
 *   tests to prove both sources render the same content.
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createClient } from '@sanity/client'
import { evaluate, parse } from 'groq-js'
import type { SanityFetcher } from './sanity'

export interface SanityConfig {
  projectId: string
  dataset: string
  apiVersion: string
  /** Read token: needed for private datasets and for drafts. */
  token?: string
  /** `drafts` shows unpublished changes (local preview, needs a token). */
  perspective?: string
}

export const SANITY_API_VERSION = '2025-02-19'

export function createLiveFetcher(config: SanityConfig): SanityFetcher {
  const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion || SANITY_API_VERSION,
    token: config.token || undefined,
    // Builds run right after a publish webhook: skip the CDN cache.
    useCdn: false,
    perspective: config.perspective === 'drafts' ? 'drafts' : 'published',
  })
  return { fetch: (query, params) => client.fetch(query, params) }
}

export function createOfflineFetcher(dataset: object[]): SanityFetcher {
  return {
    async fetch<T>(query: string, params: Record<string, unknown>) {
      const tree = parse(query, { params })
      const value = await evaluate(tree, { dataset, params })
      return (await value.get()) as T
    },
  }
}

// ---------------------------------------------------------------------------
// Seed dataset
// ---------------------------------------------------------------------------

export const SEED_DIR = 'studios/sanity/seed'

/** Metadata of the files the seed uploads, keyed by repo-relative path. */
export type SeedAssets = Record<string, { width?: number, height?: number, mimeType?: string }>

/**
 * Turns the import file into a queryable dataset: every
 * `{ "_sanityAsset": "image@file://./public/images/x.jpg" }` becomes a
 * reference to a synthesized asset document whose `url` is the file's public
 * path (/images/x.jpg), as `sanity dataset import` would do with real uploads.
 */
export function resolveSeedAssets(docs: object[], assets: SeedAssets): object[] {
  const assetDocs = new Map<string, object>()
  const visit = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(visit)
    if (!value || typeof value !== 'object') return value
    const obj = value as Record<string, unknown>
    if (typeof obj._sanityAsset === 'string') {
      const [kind, location] = obj._sanityAsset.split('@') as [string, string]
      const path = location.replace(/^file:\/\//, '')
      const meta = assets[path] ?? {}
      const id = `${kind}-${path.replace(/[^\w]+/g, '-')}`
      const url = path.startsWith('./public/') ? path.slice('./public'.length) : path
      assetDocs.set(id, kind === 'image'
        ? { _id: id, _type: 'sanity.imageAsset', url, metadata: { dimensions: { width: meta.width, height: meta.height } } }
        : { _id: id, _type: 'sanity.fileAsset', url, mimeType: meta.mimeType })
      const { _sanityAsset, ...rest } = obj
      return { ...Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, visit(v)])), asset: { _type: 'reference', _ref: id } }
    }
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, visit(v)]))
  }
  const resolved = docs.map(visit) as object[]
  return [...resolved, ...assetDocs.values()]
}

export async function loadSeedDataset(root = process.cwd()): Promise<object[]> {
  const dir = join(root, SEED_DIR)
  const [ndjson, assets] = await Promise.all([
    readFile(join(dir, 'content.ndjson'), 'utf8'),
    readFile(join(dir, 'assets.json'), 'utf8').then(JSON.parse as (s: string) => SeedAssets),
  ])
  const docs = ndjson.split('\n').filter(Boolean).map(line => JSON.parse(line) as object)
  return resolveSeedAssets(docs, assets)
}

// ---------------------------------------------------------------------------
// Runtime selection
// ---------------------------------------------------------------------------

let shared: { key: string, fetcher: SanityFetcher } | undefined

/**
 * One fetcher per process: live when a project id is configured, otherwise
 * offline over the seed (loaded once). Shared by SSR, prerender and the dev
 * query proxy.
 */
export function getSanityFetcher(config: Partial<SanityConfig>): SanityFetcher {
  const key = JSON.stringify([config.projectId, config.dataset, config.apiVersion, config.perspective])
  if (shared?.key === key) return shared.fetcher

  let fetcher: SanityFetcher
  if (config.projectId) {
    fetcher = createLiveFetcher({
      projectId: config.projectId,
      dataset: config.dataset || 'production',
      apiVersion: config.apiVersion || SANITY_API_VERSION,
      token: config.token,
      perspective: config.perspective,
    })
    if (config.perspective === 'drafts' && !config.token) {
      console.warn('[content:sanity] SANITY_PERSPECTIVE=drafts needs SANITY_API_READ_TOKEN; drafts will not be visible.')
    }
  }
  else {
    console.warn('[content:sanity] SANITY_PROJECT_ID is not set: using the offline seed (studios/sanity/seed). See studios/sanity/README.md to connect a real project.')
    const dataset = loadSeedDataset().then(createOfflineFetcher)
    fetcher = { fetch: async (query, params) => (await dataset).fetch(query, params) }
  }
  shared = { key, fetcher }
  return fetcher
}
