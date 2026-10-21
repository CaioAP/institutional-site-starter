# Institutional Site Starter

A reusable, client-agnostic Nuxt starter for institutional websites (law firms,
consultancies, professional services). Static-first, bilingual (pt-BR / en),
WCAG 2.2 AA, with a swappable content layer.

Sample content belongs to a fictitious firm, **Exemplo Advocacia**.

> Status: milestone 1 (Foundation). See the build plan in
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
| `pnpm preview` | Serve the generated site |
| `pnpm lint` / `pnpm lint:fix` | ESLint (`@nuxt/eslint`, stylistic) |
| `pnpm typecheck` | `vue-tsc` via `nuxt typecheck` |
| `pnpm test:unit` | Vitest |
| `pnpm test:e2e` | Playwright + axe against the generated site (run `pnpm generate` first) |

## Project structure

```
app/                 Nuxt app (components/ui, sections, layout; composables; pages)
app/assets/css/      tokens.css (Tailwind theme mapping), base.css
i18n/locales/        UI strings (pt-BR.json, en.json)
i18n/routes.ts       translated slugs for every page
modules/theme.ts     turns theme.config.ts into CSS variables + fonts
lib/                 framework-free code (content layer, utilities)
scripts/             build steps (post-generate)
tests/               unit/, nuxt/, e2e/, a11y/, support/
docs/                decisions.md, theming.md
theme.config.ts      brand: name, logo, colors, fonts, socials
```

## Rebranding

See [docs/theming.md](docs/theming.md).

## Accessibility

- Skip link, landmarks, one `h1` per page, visible focus ring from tokens.
- Focus moves to `<main>` after navigation and the new page title is announced.
- Mobile menu traps focus, closes with `Esc`, and returns focus to its trigger.
- `prefers-reduced-motion` disables animations globally.
- CI runs axe (WCAG 2.2 AA) on every page in both locales, and a unit test
  checks the brand palette's contrast.
