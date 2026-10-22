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

## Milestone 4 – Features (2026-10-21)

### Versions

| Package | Version | Notes |
| --- | --- | --- |
| pagefind | 1.5.2 | Node API, run from `scripts/postgenerate.ts` |

### Search

Pagefind runs after `nuxt generate` and writes one index per `<html lang>`
(`pt-br`, `en`), so the browser only loads and searches the current
locale's index. Only detail pages, About and the legal pages are indexed
(`data-pagefind-body`); listings, search and 404 are not. Each indexed page
carries `data-pagefind-meta="type:page|area|team|post"` and the UI labels
results from it. Breadcrumbs, share links, related posts and CTAs are marked
`data-pagefind-ignore`.

The UI uses Pagefind's JS API (not its default UI) so it matches the design
system and accessibility patterns: a native `<dialog>` (Esc, focus return and
inert background for free), `/` shortcut, a `role="status"` result count, and
a full results page that keeps `?q=` in the URL. Excerpts are parsed into
text parts instead of rendered with `v-html`. In `pnpm dev` there is no index;
the UI says so.

### Contact form

`lib/forms/contact.ts` holds validation and the provider adapters
(`FORM_PROVIDER=netlify` posts urlencoded data with `form-name`;
`FORM_PROVIDER=endpoint` posts JSON to `FORM_ENDPOINT`, e.g. Formspree or a
Worker). The rendered `<form>` carries `data-netlify` + `netlify-honeypot` so
Netlify detects it in the static HTML. Validation runs on submit, then live as
fields are fixed; the first invalid field receives focus and the count is
announced. Honeypot submissions show success without sending anything.

### Consent and analytics

Banner with Reject / Accept (same size and style) and Customize; choices are
versioned in `localStorage` and reopened from the footer. Analytics
(`ANALYTICS_PROVIDER=ga4|plausible`, `ANALYTICS_ID`) is injected by a client
plugin only after consent; nothing analytics-related is in the static HTML.
Revoking consent clears GA cookies and reloads, because a running script can't
be unloaded. Plausible is cookieless and could arguably run without consent;
the spec asks for consent first, so it is gated too.

The banner isn't modal (the site stays usable) and hides the WhatsApp button
while it's open so they never overlap.

### WhatsApp button

Uses SiteSettings' WhatsApp number; hidden when the number is empty or
`WHATSAPP_BUTTON=false`. Its green is WhatsApp's brand color, not a theme
token, and passes contrast with white.

### Links are underlined by default

axe's `link-in-text-block` flagged a link inside the consent label. Links are
now underlined globally; navigation and cards opt out with `no-underline`.

### Test build

E2E needs analytics and the endpoint form enabled, so CI runs
`pnpm generate:test` (sets `ANALYTICS_PROVIDER=plausible`,
`FORM_PROVIDER=endpoint` with a fake endpoint the tests intercept).

## Milestone 5 – SEO and performance (2026-10-21)

### Versions

| Package | Version | Notes |
| --- | --- | --- |
| @nuxtjs/sitemap | 9.1.0 | Pulls in nuxt-site-config 5.0.3 |
| @nuxtjs/robots | 7.0.2 | Replaces `public/robots.txt` |
| nuxt-schema-org | 7.0.1 | JSON-LD graph |
| @lhci/cli | 0.15.1 | Latest release; bundles Lighthouse 12 (Lighthouse 13 has no LHCI release yet) |

`pnpm install` prints an unmet optional peer warning (`zod@^4.6.5`, from the
Nuxt SEO packages) because Nuxt Content still ships zod 3. Nothing uses the
zod 4 code path; revisit when Nuxt Content moves to zod 4.

### One site URL

`NUXT_PUBLIC_SITE_URL` feeds canonical links, hreflang, the sitemap, robots and
OG images. It defaults to `https://www.example.com` (not localhost) so a build
without env vars still produces valid absolute URLs. Set it per deployment.

### Sitemap from `listRoutes()`

The sitemap ignores Nuxt's route scan (`excludeAppSources`) and reads
`server/api/__sitemap__/urls.ts`, which calls the same
`ContentSource.listRoutes()` used for prerendering. So the sitemap, the
prerendered pages and the content can't drift apart. It is split per locale
(`/__sitemap__/pt-BR.xml`, `/__sitemap__/en.xml`, plus `sitemap_index.xml`),
each URL with hreflang alternates and `x-default` → pt-BR. Search and 404 are
excluded and carry `noindex`.

### hreflang only for translations that exist

By default @nuxtjs/i18n emits an hreflang link for every locale, even when a
post has no English version (the link would point to a 404). Its
`experimental.strictSeo` mode drops alternates for locales missing from
`setI18nParams`, which `useAlternates()` already fills from `translations`.
Checked with a temporary pt-only post: the page and the sitemap both list only
pt-BR + x-default. Strict mode also means i18n manages `<html lang>`,
canonical and `og:locale` itself, so `useLocaleHead()` is no longer called.

i18n also emits a bare `hreflang="pt"` next to `pt-BR`; that is valid and was
left as is. The home canonical is `https://www.example.com` (no trailing
slash) while the sitemap says `.../`; both are the same URL.

The e2e test `tests/e2e/seo.spec.ts` reads every URL in both sitemaps and
checks it against the page's own canonical, hreflang, OG tags and JSON-LD.

### Structured data

One JSON-LD graph per page via nuxt-schema-org:

- Identity: a `LegalService` built from SiteSettings in the default layout (the
  firm's real name, contact details, address and socials live in content, so
  the config-level `identity` option is not used). WebSite, WebPage and Article
  link to it as publisher.
- Team member pages: `ProfilePage` whose main entity is a `Person` working for
  the firm.
- Posts: `BlogPosting` with author, dates, section and keywords.
- Breadcrumbs: `defineBreadcrumb` (the M3 hand-written JSON-LD would have
  produced a second, unlinked graph).

### Social images

Default `og:image` comes from `settings.seo.image`; posts use their cover, team
pages the photo. Local images are cropped to 1200×630 JPEG through
@nuxt/image (sharp's `attention` crop, which keeps faces in portraits), and
the variants are written to `.output/public/_ipx/` during generate. A source
smaller than 1200px wide yields a smaller crop with the same ratio and the
reported size matches. Absolute URLs (a CMS CDN) are used as they are.

### Performance changes

The first Lighthouse run (mobile, simulated throttling) scored 70–73. Fixes:

- The test static server now compresses text (brotli/gzip) as any CDN does;
  without it Lighthouse measured 300 KB of uncompressed JS.
- The consent banner used to appear after hydration, so on text-led pages it
  became the LCP element at ~3 s. It is now in the static HTML, hidden by CSS
  unless a 300-byte inline head script finds no stored decision. It paints
  with the page, never flashes for returning visitors, and stays hidden
  without JavaScript.
- Likely LCP images get `fetchpriority="high"` and a high-priority preload: the
  hero, post cover, team photo, the first card of the blog and team listings,
  and the first image of a page whose first section is text.
- Markdown body images take `{width="…" height="…"}` (documented in
  `content/README.md`), which removed a 0.07 CLS on the About page.

- Fonts: CI's Chrome (on a runner whose fallback fonts differ a lot from
  Inter) measured CLS 0.14 on the contact page when the web fonts swapped in.
  The theme module now serves the Fontsource files from `/fonts/<name>/`,
  preloads the latin subset of both families, and switches them to
  `font-display: optional`. With the preload the fonts are there for the
  first paint; when they aren't, the fallback stays for that view instead of
  shifting the text. Only the files the CSS references are shipped (≈420 KB
  in total, of which a page loads two ≈50 KB files).

Result: performance 95–100 on the nine audited pages (median of three runs),
accessibility 100, best practices 100, SEO 100, LCP ≈1.5–1.8 s, CLS 0.

### Lighthouse CI

`lighthouserc.cjs` holds the spec budgets (Perf ≥ 0.9, A11y = 1, BP ≥ 0.95,
SEO = 1, LCP < 2.5 s, CLS < 0.1) for a representative set of pages: home in
both locales, about, a practice area, a team member, blog index, a post in
both locales and contact. It serves the generated site with the same static
server as Playwright and keeps reports as a CI artifact (no LHCI server or
token needed). CI builds with the default env, i.e. what a fresh deployment
ships.

### Hydration in e2e tests

Since the banner is now clickable before Vue hydrates, tests could click it
too early. A client plugin sets `<html data-hydrated>` after hydration and
`tests/support/test.ts` makes `page.goto` wait for it.

## Milestone 6 – Deploy (2026-10-21)

No new dependencies.

### One `_headers` file for both hosts

Cloudflare Pages and Netlify both read `_headers` from the output directory,
so headers are generated once by `scripts/postgenerate.ts` from
`lib/deploy/headers.ts` instead of being written twice (and drifting) in
`netlify.toml` and a Cloudflare file. The spec asks for headers in
`netlify.toml`; this is the same result from a single source.

### CSP with hashes, not `'unsafe-inline'`

Nuxt's static output has a few inline scripts (runtime config, import map,
the consent head script). Their sha256 hashes are collected from the
generated HTML at build time, so `script-src` needs no `'unsafe-inline'`.
`style-src` keeps `'unsafe-inline'` because Vue binds inline `style`
attributes; styles can't execute code. `'wasm-unsafe-eval'` is needed by
Pagefind. Hosts for the form endpoint and analytics are added only when the
build env enables them; video embeds allow youtube-nocookie.com and
player.vimeo.com frames.

Nuxt Image 2.2 renders `onerror="this.setAttribute('data-error', 1)"` on
every server-rendered image, so it can tell after hydration that an image
failed before Vue loaded. Inline event handlers can't be allowed by hash
alone: `postgenerate` hashes every `on*=""` attribute in the output and adds
`'unsafe-hashes'` with those hashes. That allows exactly this handler, and
any other inline handler is still blocked. The alternative, stripping the
attribute, would silently break Nuxt Image's error detection.

The local static server applies the generated `_headers`, and the shared
Playwright fixture fails any test that logs a CSP violation. So the e2e suite
(search, embeds, Plausible, the endpoint form) proves the policy is complete,
and a new third-party script without a CSP entry fails CI.

### Flat `.html` files (no trailing-slash redirects)

With `/sobre/index.html`, Cloudflare Pages redirects `/sobre` to `/sobre/`,
so every canonical URL (no trailing slash) would point at a redirect. Nitro's
`prerender.autoSubfolderIndex: false` writes `/sobre.html`, which both hosts
serve at `/sobre` directly. The localized 404 pages now land at `404.html`
and `en/404.html` without the copy step. Pagefind result URLs drop `.html`.
`nitro.preset: 'static'` is pinned so neither host's auto-detected preset
changes the output layout.

### Previews are noindex

`lib/deploy/env.ts` treats Cloudflare branch builds and Netlify deploy
previews and branch deploys as previews. Site config then sets
`indexable: false`: `robots.txt` disallows everything, pages get
`noindex, nofollow`, and `_headers` adds `X-Robots-Tag: noindex`.
`NUXT_SITE_ENV` overrides the detection. Verified with
`CF_PAGES_BRANCH=feature-x pnpm generate`.

### One source for build env

`readBuildEnv()` holds every variable and default. `nuxt.config.ts` and
`postgenerate` both use it, so the CSP always matches what the pages load.
Unit tests check that the defaults build with no env vars at all, and CI's
Lighthouse job builds that way and checks the output files.

### Build hooks

Documented in `docs/deploy.md` (Cloudflare deploy hooks, Netlify build hooks,
and a Sanity webhook pointing at one). No account was created and no hook URL
is in the repo.

## Milestone 7 – CMS samples (2026-10-21)

### Versions

| Package | Version | Where |
| --- | --- | --- |
| @sanity/client | 8.10.1 | site (build time) |
| groq-js | 2.0.0 | site (offline Sanity source, tests) |
| github-slugger | 2.0.0 | site (heading ids for Sanity rich text) |
| jiti | 2.7.0 | dev (runs `scripts/sanity-seed.ts`) |
| nuxt-studio | 1.8.0 | dev (`pnpm dev:studio` only) |
| sanity, @sanity/vision | 6.20.0 | studios/sanity |
| @sanity/document-internationalization | 6.2.43 | studios/sanity |
| sanity-plugin-internationalized-array | 5.3.6 | studios/sanity (peer of the above) |
| @sanity/language-filter | 5.0.23 | studios/sanity (peer of the above) |
| @sanity/locale-pt-br | 1.1.37 | studios/sanity |
| @sanity/icons | 5.2.3 | studios/sanity |
| react, react-dom | 19.3.1 | studios/sanity |
| styled-components | 6.6.0 | studios/sanity |

`pnpm install` warns that `@sanity/cli` wants zod 4 while Nuxt Content uses
zod 3. They are separate copies and neither is used across the boundary.

### One mapper for every source

The local adapter's mapping (SEO fallbacks, sorting, references,
translations, related posts, routes) moved to `lib/content/adapters/documents.ts`.
Each adapter now only turns its CMS shapes into normalized documents. Rules
like "related posts prefer the same category" therefore can't drift between
sources, which is what makes "render the same pages identically" testable.

### Sanity runs without an account

No Sanity project exists for the starter (the agent creates no accounts). So
that the Sanity sample still runs with one command, the adapter takes a
`fetch(query, params)` function:

- with `SANITY_PROJECT_ID` set, it is `@sanity/client`;
- without it, `groq-js` evaluates the **same GROQ queries** in memory over the
  seed file. `pnpm dev:sanity` prints a warning and runs on the seed.

CI uses the offline mode to prove the sample works: the seed must be current
with the local content, the Sanity adapter must return exactly the same
domain data as the local adapter (`tests/build/sanity-parity.test.ts`), a site
generated with `CONTENT_SOURCE=sanity` must render the same HTML as the local
one (`scripts/compare-builds.ts`), the seed must validate against the studio
schemas, and the studio must typecheck and build. What CI cannot check is the
real Sanity API, auth and image CDN; those need a project (see
`studios/sanity/README.md`).

### Seed generated from the local content

`pnpm seed:sanity` reads Nuxt Content's build database
(`.data/content/contents.sqlite`) through the local adapter and writes
`studios/sanity/seed/content.ndjson` in `sanity dataset import` format, with
deterministic ids and keys so diffs stay readable. Images are
`_sanityAsset` import directives pointing at `public/`; `assets.json` holds
their dimensions for the offline mode. The local content stays the single
source of sample content.

### Sanity content model

- One document per language (`language` field), linked by
  `@sanity/document-internationalization` metadata documents. The metadata id
  is the `translationKey`. References (author, category, team, areas) point at
  documents in the same language, and the reference pickers only offer those.
- Post excerpt is `excerpt` in Sanity (`description` in the local front
  matter, kept from M2).
- Rich text offers only what `<RichText>` renders. Tables, code blocks and
  rules have no equivalent; the seed script refuses them instead of dropping
  content.
- Videos are a pasted YouTube/Vimeo link; `lib/content/rich-text/video.ts`
  turns it into provider + id.
- Heading ids are generated the way Nuxt Content does (github-slugger, `_`
  before a leading digit), so anchors match across sources.
- Image hotspot/crop are stored but not applied: `<NuxtImg>` resizes the full
  image. `cdn.sanity.io` is in `image.domains`, so Sanity images are
  optimized and prerendered like local ones.

### Sanity queries in the browser go through a dev-only proxy

Client-side navigation in `nuxt dev` runs content queries in the browser. For
Sanity they go to `server/api/_content/sanity.post.ts`, which only answers in
dev, so offline mode works and no token or CORS origin is needed. Generated
sites never call it, since every page ships its prerendered payload, and the
client bundle is unchanged in size.

### Preview

The spec asks for a "preview link to the site". Studio's "Open preview"
opens the document's page on `SANITY_STUDIO_SITE_URL`. A static site only
shows published content, so draft preview runs locally:
`pnpm dev:sanity` with `SANITY_PERSPECTIVE=drafts` and a read token. In-studio
live preview (Sanity's Presentation tool) needs pages rendered on request,
which the static-only rule excludes.

### Nuxt Studio: local editing only (trade-off)

`nuxt-studio` 1.8.0 is free and self-hosted, so it supports self-setup.
Local editing (`pnpm dev:studio`) works on top of `content/`. **Publishing
from the website needs server routes** (OAuth sign-in, Git commits), so it only
runs on an SSR deployment. That conflicts with "no server runtime for pages",
so production Studio is not enabled. `docs/nuxt-studio.md` documents a
separate SSR "editor" deployment that keeps the public site static, with the
GitHub OAuth steps. The module is added only when `STUDIO_EDITOR=true`. That
name avoids `NUXT_STUDIO`, which Nuxt would read as a runtime config
override and which breaks the module.

### Evaluation checklist

`docs/cms-evaluation.md` has one table per sample with the spec's ten
criteria and empty notes/score columns, plus a suggested timed script.
Pricing and free-tier limits are left for the evaluator to check on the
vendor sites.
