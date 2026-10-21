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
