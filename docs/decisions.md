# Decisions log

Every dependency and notable trade-off, newest milestone last. Versions were
checked against the npm registry on the date shown and pinned to the latest
stable release unless noted.

## Open decisions (owner: Caio)

| Topic | Default used in the starter | Alternatives |
| --- | --- | --- |
| Default host | Cloudflare Pages (Netlify config also provided) | Netlify |
| Analytics | None by default; GA4 or Plausible enabled via env, loaded only after consent | — |
| GSAP | Not included; CSS + IntersectionObserver cover current needs | Allow per project |
| Default CMS | Local Nuxt Content until the manual evaluation in `cms-evaluation.md` | Nuxt Studio, Sanity |

## Milestone 1 – Foundation (2026-10-21)

### Versions

| Package | Version | Notes |
| --- | --- | --- |
| nuxt | 4.6.2 | Nuxt 4 `app/` directory layout |
| vue / vue-router | 3.5.44 / 5.4.0 | as required by Nuxt 4.6 |
| @nuxtjs/i18n | 10.6.0 | `prefix_except_default`, translated slugs via `customRoutes: 'config'` |
| tailwindcss / @tailwindcss/vite | 4.3.3 | CSS-first config, tokens via `@theme inline` |
| @fontsource-variable/inter | 5.3.0 | self-hosted, `font-display: swap` |
| @fontsource-variable/source-serif-4 | 5.3.1 | self-hosted, `font-display: swap` |
| typescript | 6.0.3 | **not 7.0.2** – see below |
| vue-tsc | 3.3.13 | |
| @nuxt/eslint / eslint | 1.17.0 / 10.13.0 | stylistic rules on |
| vitest | 5.0.5 | two projects: `unit` (node) and `nuxt` |
| @nuxt/test-utils | 4.3.4 | |
| @playwright/test | 1.64.1 | |
| @axe-core/playwright | 4.14.0 | WCAG 2.0/2.1/2.2 A+AA + best-practice tags |
| pnpm | 10.28.0 | workspaces for `studios/*` |

### TypeScript 6 instead of 7

TypeScript 7.0.2 (the native port) is the latest stable, but `typescript-eslint`
refuses to run on it and `vue-tsc` 3.3 still imports `typescript/lib/tsc`, which
TS 7 no longer exports. Both tools document running against the TS 6 API, so
the starter pins TS 6.0.3. Revisit when vue-tsc and typescript-eslint support 7.

### Translated slugs live in `i18n/routes.ts`

`customRoutes: 'config'` keeps every localized path in one file keyed by route
name, instead of spreading `definePageMeta({ i18n })` across pages. The content
layer's `listRoutes()` and the e2e route list use the same table.

### Theme tokens generated from `theme.config.ts`

Brand colors, fonts, radius and spacing unit are TypeScript values so that a
unit test can check WCAG contrast for every text/background pair
(`tests/unit/theme-contrast.test.ts`). A local Nuxt module (`modules/theme.ts`)
writes them as `--theme-*` CSS variables at build time; `tokens.css` maps them
into Tailwind. No runtime cost.

### Localized 404 on static hosts

Nuxt's own `404.html` cannot know the locale. A `/404` page is prerendered per
locale and `scripts/postgenerate.ts` copies it to `404.html` and `en/404.html`.
Cloudflare Pages and Netlify both serve the nearest `404.html` with a 404 status.

### Focus management

On client-side navigation focus moves to `<main id="main" tabindex="-1">`
(`app/plugins/route-focus.client.ts`), and `NuxtRouteAnnouncer` reads
"Page loaded: <title>" in the active language. The first load is untouched so
the skip link stays the first tab stop.

### Language switcher shows the full language name

axe's `label-content-name-mismatch` (WCAG 2.5.3) flagged a visible "EN" with an
`aria-label` of "View this page in English". The switcher now shows the
language name as visible text, marked with `lang` and `hreflang`.

## Milestone 2 – Content layer (2026-10-21)

### Versions

| Package | Version | Notes |
| --- | --- | --- |
| @nuxt/content | 3.16.2 | SQLite via Node's built-in `node:sqlite` (`experimental.sqliteConnector: 'native'`), no native build step |
| @nuxt/image | 2.2.0 | installed now, used from the pages milestone |

### Adapters are framework-free

`lib/content/` has no Nuxt imports. The local adapter receives a `LocalStore`
(`all(collection, locale)`), which the app implements with `queryCollection`
and tests implement with in-memory fixtures. That keeps the adapter fully
unit-testable and lets the Sanity adapter plug into the same interface.

Collections are small for institutional sites, so the adapter loads a whole
collection per locale once (memoized) and filters, sorts and paginates in
JavaScript. If a client ever has thousands of posts, push filtering into
`LocalStore`.

### Rich text is a normalized AST, not HTML

Adapters convert their native format (Nuxt Content minimark, later Sanity
Portable Text) into `RichText` (`lib/content/types.ts`): whitelisted elements,
plus `image` and `video` nodes. No `v-html`, so nothing to sanitize at render
time. `h1` in content is demoted to `h2` to keep one `h1` per page. Unsafe
links (`javascript:`, `data:`) are dropped.

### Translations are linked with `translationKey`

Each localized file has the same `translationKey` in every locale; the slug is
the file name. References (post author and category, area team, member areas)
also use `translationKey`, so they don't break when a slug is translated.

### `listRoutes()` is the only prerender source

`nitro.prerender.crawlLinks` is off. While `/` is prerendered,
`app/plugins/prerender-routes.server.ts` sends every path from
`listRoutes()` to Nitro through `prerenderRoutes()`. A route missing from
`listRoutes()` is therefore missing from the build, which the e2e suite catches.

### Additions to the spec's interface

- `getPage(key, locale)` takes a stable page key (`home`, `about`, `contact`,
  `search`, `privacy`, `terms`) instead of a slug, because page slugs are
  translated in `i18n/routes.ts`.
- `listCategories(locale)` feeds the blog's category filter and category routes.
- `listPosts` accepts `perPage` (used by `listRoutes`).
- Summaries (`PostSummary`, `PracticeAreaSummary`, `TeamMemberSummary`) carry
  `translations` so listings and the sitemap can build alternates without
  fetching every detail document.

### Post excerpt field is `description`

Nuxt Content's `page` collections reserve `excerpt` (it is filled from a
`<!--more-->` marker and overwrote our frontmatter with `null`). Posts use
`description` in frontmatter; the domain model still calls it `excerpt`.

### Sample media

All images in `public/images/` are generated abstract compositions (no
people, no third-party assets). The sample video embed points to *Big Buck
Bunny* on YouTube (Blender Foundation, CC BY 3.0) and is labelled as such.
The hero supports a muted video with a poster, but the sample uses an image
only, so the starter ships no video file.

## Milestone 3 – Pages (2026-10-21)

### Language switcher links are resolved after the page renders

During SSR the header renders before the page has loaded its content, so it
can't know a post's translated slug yet. Pages register their translations with
`useAlternates()`; the switcher emits a placeholder during SSR and
`server/plugins/alternate-links.ts` swaps in the real link (or the localized
listing when there is no translation) once the page has rendered. On the client
the state is hydrated from the payload, so there's no mismatch. `setI18nParams`
is called too, so @nuxtjs/i18n's own `hreflang` links use translated slugs.

### `app/components/content/` is reserved

Nuxt Content registers everything in `components/content/` as global MDC
components without a prefix. The RichText renderer lives in
`components/rich-text/` instead.

### Image sizes need an `xs` screen

@nuxt/image 2 treats a bare size (`sizes="100vw"`) as a 1px screen and
generates 1px variants. The config adds `xs: 320` and components write
mobile-first sizes (`xs:100vw md:50vw`). Every `<NuxtImg>` requests WebP.

### Lite video embed shows no third-party thumbnail

Fetching the YouTube thumbnail would contact Google before consent, so the
embed shows a local poster with the video title. The iframe (YouTube on
`youtube-nocookie.com`, Vimeo with `dnt=1`) loads only on click and receives
focus.

### `v-reveal` is in place early

The pages use `v-reveal`, so the directive landed here: content is visible in
the server HTML, only elements below the fold are hidden on the client, and
`prefers-reduced-motion` disables it. The features milestone adds tests.
