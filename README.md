# Institutional Site Starter

A reusable, client-agnostic Nuxt starter for institutional websites (law firms,
consultancies, professional services). Static-first, bilingual (pt-BR / en),
WCAG 2.2 AA, with a swappable content layer.

Sample content belongs to a fictitious firm, **Exemplo Advocacia**.

> Status: milestones 1–7 (Foundation, Content layer, Pages, Features, SEO and
> performance, Deploy, CMS samples). Decisions and versions are in
> [docs/decisions.md](docs/decisions.md).

## Requirements

- Node.js 22+
- pnpm 10 (`corepack enable`)

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm dev            # http://localhost:3000 (pt-BR) and /en
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server (content source from `.env`, `local` by default) |
| `pnpm dev:local` / `pnpm dev:sanity` | Dev server reading local content / Sanity (see [CMS samples](#cms-samples)) |
| `pnpm dev:studio` | Dev server with the Nuxt Studio visual editor |
| `pnpm studio:sanity` | Sanity Studio on port 3333 |
| `pnpm seed:sanity` / `pnpm seed:sanity:import` | Rebuild the Sanity seed from `content/` / import it into your dataset |
| `pnpm generate` | Static site in `.output/public` (+ post-generate steps) |
| `pnpm preview` | Serve the generated site like the hosts do (headers, 404s), on port 4173 |
| `pnpm lint` / `pnpm lint:fix` | ESLint (`@nuxt/eslint`, stylistic) |
| `pnpm typecheck` | `vue-tsc` via `nuxt typecheck` |
| `pnpm test:unit` | Vitest |
| `pnpm test:build` | Checks that need a build first (Sanity seed parity; run `pnpm generate` first) |
| `pnpm generate:test` | Generate with analytics + endpoint form enabled (what e2e expects) |
| `pnpm test:e2e` | Playwright + axe against the generated site (run `pnpm generate:test` first) |
| `pnpm lhci` | Lighthouse CI budgets against the generated site (run `pnpm generate` first; set `CHROME_PATH` if Chrome isn't found) |

## Project structure

```
app/                 Nuxt app (components/ui, sections, layout; composables; pages)
app/assets/css/      tokens.css (Tailwind theme mapping), base.css
i18n/locales/        UI strings (pt-BR.json, en.json)
i18n/routes.ts       translated slugs for every page
modules/theme.ts     turns theme.config.ts into CSS variables + fonts
lib/                 framework-free code (content layer, forms, consent, deploy headers)
server/              sitemap source (build time only; nothing runs on a server in production)
scripts/             build steps (post-generate: 404 check, search index, _headers), Sanity seed, build comparison
studios/sanity/      Sanity Studio sample (pnpm workspace package) + seed
tests/               unit/, nuxt/, e2e/, a11y/, support/
docs/                decisions.md, theming.md, content-model.md, deploy.md, nuxt-studio.md, cms-evaluation.md
netlify.toml         Netlify build settings
wrangler.toml        Cloudflare Pages output directory
theme.config.ts      brand: name, logo, colors, fonts, socials
```

## Features

- **Search:** Pagefind index per locale, built after `generate`. Press `/` anywhere.
- **Contact form:** accessible validation, honeypot, `FORM_PROVIDER=netlify|endpoint`.
- **Cookie consent (LGPD):** reject is as easy as accept; analytics
  (`ANALYTICS_PROVIDER=ga4|plausible`) loads only after consent.
- **WhatsApp button**, **lite video embeds**, **reduced-motion-aware animations**.

## SEO and performance

- Canonical, hreflang (only for translations that exist) and `og:locale` on
  every page; one sitemap per locale with alternates; `robots.txt`.
- schema.org graph: the firm as `LegalService`, `Person` for team members,
  `BlogPosting` for posts, breadcrumbs.
- Social images cropped to 1200×630 at build time.
- Lighthouse budgets enforced in CI: Performance ≥ 90, Accessibility 100,
  Best Practices ≥ 95, SEO 100, LCP < 2.5 s, CLS < 0.1 (mobile).

All configuration is in [`.env.example`](.env.example).

## CMS samples

The same site runs from three content setups, for a manual comparison of the
editor experience ([docs/cms-evaluation.md](docs/cms-evaluation.md)):

| Sample | Command | Notes |
| --- | --- | --- |
| Local Markdown/YAML (default) | `pnpm dev:local` | Edit files in `content/` ([content/README.md](content/README.md)) |
| Nuxt Studio | `pnpm dev:studio` | Visual editor on top of `content/`. Production publishing needs an SSR editor deployment ([docs/nuxt-studio.md](docs/nuxt-studio.md)) |
| Sanity | `pnpm studio:sanity` + `pnpm dev:sanity` | Studio needs your own Sanity project. `dev:sanity` runs on the bundled seed until `SANITY_PROJECT_ID` is set ([studios/sanity/README.md](studios/sanity/README.md)) |

Pages never talk to a CMS directly: `CONTENT_SOURCE=local|sanity` selects an
adapter in `lib/content/`. CI checks that the Sanity sample renders exactly
the same HTML as the local content.

## Deploying

Cloudflare Pages (default) or Netlify: build command `pnpm generate`, output
`.output/public`, and set `NUXT_PUBLIC_SITE_URL`. A fresh clone builds with no
env vars at all. Security headers (strict CSP), preview `noindex` and
CMS deploy hooks are covered in [docs/deploy.md](docs/deploy.md).

## Continuous integration

Every push and PR runs, in GitHub Actions:

1. Lint, typecheck, unit tests.
2. Test build, then Playwright e2e and axe (desktop and mobile) against the
   static output served with the generated headers. Any CSP violation fails.
3. Production build with no env vars, then the Lighthouse budgets.
4. CMS samples: studio typecheck, schema check and build; the Sanity seed is
   current, returns the same content, and renders the same pages as local.

## Rebranding

See [docs/theming.md](docs/theming.md).

## Accessibility

- Skip link, landmarks, one `h1` per page, visible focus ring from tokens.
- Focus moves to `<main>` after navigation and the new page title is announced.
- Mobile menu traps focus, closes with `Esc`, and returns focus to its trigger.
- `prefers-reduced-motion` disables animations globally.
- CI runs axe (WCAG 2.2 AA) on every page in both locales, and a unit test
  checks the brand palette's contrast.
