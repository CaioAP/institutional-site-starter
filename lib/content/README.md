# Content layer

```
types.ts          domain models — the only content types pages may import
source.ts         ContentSource interface, CONTENT_SOURCE resolution, shared listRoutes()
routes.ts         localizePath(): route name + locale + params → URL path
utils.ts          pagination, reading time, sorting
rich-text/        converters to the RichText AST (minimark, Portable Text) + video links
adapters/
  documents.ts    shared mapper: normalized documents → domain models (every source)
  local.ts        Nuxt Content (Markdown/YAML in content/)
  local-sqlite.ts reads Nuxt Content's build database outside Nuxt (seed, tests)
  sanity.ts       Sanity: GROQ queries + normalization
  sanity-fetcher.ts  @sanity/client, or groq-js over the seed (offline). Server-only
```

Rules:

1. No Nuxt or Vue imports here. Adapters get their I/O injected (see
   `LocalStore`, `SanityFetcher`), so they can be unit-tested with fixtures.
2. Adapters return domain types only. CMS-specific fields never leak out.
3. Add a new CMS by writing `adapters/<name>.ts` that turns its documents
   into the shapes in `documents.ts` and calls `createDocumentSource`, adding
   its name to `CONTENT_SOURCES`, and wiring it in
   `app/composables/useContentSource.ts` and `server/utils/contentSource.ts`.
