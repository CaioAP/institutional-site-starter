# Institutional Site Starter

A reusable, client-agnostic Nuxt starter for institutional websites (law firms,
consultancies, professional services). Static-first, bilingual (pt-BR / en),
WCAG 2.2 AA, with a swappable content layer.

Sample content belongs to a fictitious firm, **Exemplo Advocacia**.

> Status: milestones 1–6 (Foundation, Content layer, Pages, Features, SEO and
> performance, Deploy). Decisions and versions are in
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
| `pnpm dev` | Dev server |
| `pnpm generate` | Static site in `.output/public` (+ post-generate steps) |
| `pnpm preview` | Serve the generated site like the hosts do (headers, 404s), on port 4173 |
| `pnpm lint` / `pnpm lint:fix` | ESLint (`@nuxt/eslint`, stylistic) |
| `pnpm typecheck` | `vue-tsc` via `nuxt typecheck` |
| `pnpm test:unit` | Vitest |
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
scripts/             build steps (post-generate: 404 check, search index, _headers)
tests/               unit/, nuxt/, e2e/, a11y/, support/
docs/                decisions.md, theming.md, content-model.md, deploy.md
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

## Rebranding

See [docs/theming.md](docs/theming.md).

## Accessibility

- Skip link, landmarks, one `h1` per page, visible focus ring from tokens.
- Focus moves to `<main>` after navigation and the new page title is announced.
- Mobile menu traps focus, closes with `Esc`, and returns focus to its trigger.
- `prefers-reduced-motion` disables animations globally.
- CI runs axe (WCAG 2.2 AA) on every page in both locales, and a unit test
  checks the brand palette's contrast.
