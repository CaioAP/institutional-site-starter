# Content layer

```
types.ts          domain models — the only content types pages may import
source.ts         ContentSource interface, CONTENT_SOURCE resolution, shared listRoutes()
routes.ts         localizePath(): route name + locale + params → URL path
utils.ts          pagination, reading time, sorting
rich-text/        converters from each CMS format to the RichText AST
adapters/
  local.ts        Nuxt Content (Markdown/YAML in content/)
```

Rules:

1. No Nuxt or Vue imports here. Adapters get their I/O injected (see
   `LocalStore`), so they can be unit-tested with fixtures.
2. Adapters return domain types only. CMS-specific fields never leak out.
3. Add a new CMS by writing `adapters/<name>.ts` that returns a
   `ContentSource`, adding its name to `CONTENT_SOURCES`, and wiring it in
   `app/composables/useContentSource.ts`.
