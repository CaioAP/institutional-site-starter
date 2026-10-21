# Rebranding the starter (≈ 1 hour)

Everything brand-specific is in **one file**, `theme.config.ts`, plus the logo
files in `public/brand/`.

## 1. Name and logo (10 min)

1. Replace `public/brand/logo.svg` (on light backgrounds) and
   `public/brand/logo-inverse.svg` (on the dark footer). SVG preferred.
2. Replace `public/favicon.svg`.
3. In `theme.config.ts` → `brand`, set `name`, `shortName` and the logo's
   intrinsic `width` / `height` (prevents layout shift).

## 2. Colors (20 min)

Edit `theme.config.ts` → `colors`. Each token has a job:

| Token | Used for |
| --- | --- |
| `surface`, `surfaceMuted` | page background, cards / bands |
| `surfaceInverse`, `textInverse` | footer and dark bands |
| `text`, `textMuted` | body and secondary text |
| `accent`, `accentStrong`, `onAccent` | links, buttons, hover, text on buttons |
| `border` | input borders and dividers |
| `focus` | focus ring |
| `danger`, `success` | form messages |

Then run `pnpm test:unit`. **The contrast test fails if any pair drops below
WCAG AA** (4.5:1 for text, 3:1 for borders and focus rings), and it names the
pair to fix.

In components use the Tailwind names: `bg-surface`, `text-text-muted`,
`text-accent`, `border-border`, `bg-surface-inverse`, etc. Never hard-code hex
values in components.

## 3. Fonts (15 min)

Fonts are self-hosted through [Fontsource](https://fontsource.org) packages.

```bash
pnpm remove @fontsource-variable/inter
pnpm add @fontsource-variable/<new-font>
```

Then update `theme.config.ts` → `fonts.sans` / `fonts.serif` with the package
name and the CSS family name it declares (shown on the Fontsource page, e.g.
`"Inter Variable"`). Headings use the serif family, body text the sans family.

## 4. Shape and spacing (5 min)

- `radius`: base corner radius in rem. `rounded-sm` / `rounded-lg` derive from it.
- `spacing`: base spacing unit in rem (Tailwind's `p-4` = 4 × unit). Leave at
  `0.25` unless the client wants a denser or airier layout overall.

## 5. Social links

`theme.config.ts` → `socials`. Supported icons: linkedin, instagram, facebook,
youtube, x.

## 6. Check

```bash
pnpm test:unit       # contrast
pnpm generate && pnpm test:e2e   # axe on every page
```
