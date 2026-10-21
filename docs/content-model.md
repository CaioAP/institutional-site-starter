# Content model

Domain types live in [`lib/content/types.ts`](../lib/content/types.ts). Pages
only see these types; each content source maps into them.

## Entities

| Entity | Key fields | Notes |
| --- | --- | --- |
| SiteSettings | firmName, tagline, contact (email, phone, WhatsApp), address + mapUrl, officeHours, socials, seo | one per locale |
| Page | key, title, lead, sections[], seo, updatedAt | keys: home, about, contact, search, privacy, terms |
| PracticeArea | slug, title, summary, icon, body, team[], order, seo | |
| TeamMember | slug, name, role, registration (OAB), photo, shortBio, bio, areas[], email, linkedin, order, seo | |
| Post | slug, title, excerpt, cover, body, category, tags, author, publishedAt, updatedAt, seo, related[] | body supports images and YouTube/Vimeo |
| Category | slug, title | |

Every localized entity has `translations: { 'pt-BR'?: slug, en?: slug }`. The
language switcher uses it to open the equivalent page, or the localized
listing when no translation exists.

## Page sections

`hero`, `text`, `highlights`, `cta`, plus data-driven blocks that pull from
other collections: `practiceAreas`, `team`, `latestPosts`, `location`.

## Rich text

`RichText` is a small AST: whitelisted HTML elements (`p`, `h2`–`h4`, lists,
links, emphasis, quotes, tables, code), plus `image` (alt required) and
`video` (`provider: youtube | vimeo`, `id`, `title`) nodes. One `<RichText>`
component renders it for every source.

## Routes

| Route name | pt-BR | en |
| --- | --- | --- |
| index | `/` | `/en` |
| about | `/sobre` | `/en/about` |
| practice-areas | `/areas-de-atuacao` | `/en/practice-areas` |
| practice-areas-slug | `/areas-de-atuacao/[slug]` | `/en/practice-areas/[slug]` |
| team | `/equipe` | `/en/team` |
| team-slug | `/equipe/[slug]` | `/en/team/[slug]` |
| blog | `/blog` | `/en/blog` |
| blog-page-page | `/blog/pagina/[page]` | `/en/blog/page/[page]` |
| blog-category-category | `/blog/categoria/[category]` | `/en/blog/category/[category]` |
| blog-category-category-page-page | `/blog/categoria/[category]/pagina/[page]` | `/en/blog/category/[category]/page/[page]` |
| blog-slug | `/blog/[slug]` | `/en/blog/[slug]` |
| contact | `/contato` | `/en/contact` |
| search | `/busca` | `/en/search` |
| privacy | `/privacidade` | `/en/privacy` |
| terms | `/termos` | `/en/terms` |
| 404 | `/404` | `/en/404` |

Source of truth: [`i18n/routes.ts`](../i18n/routes.ts). `listRoutes()` turns
content into concrete paths for prerendering and the sitemap.

## Local source (Nuxt Content)

See [`content/README.md`](../content/README.md).
