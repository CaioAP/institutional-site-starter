# Sanity Studio sample

Sanity Studio for the starter's content model. Sanity is the starter's
default CMS (chosen in [docs/cms-evaluation.md](../../docs/cms-evaluation.md)).

- **Schemas** (`schemas/`) mirror the domain models in `lib/content/types.ts`:
  site settings, pages with sections, practice areas, team members, blog
  categories and posts.
- **Languages:** one document per language, linked as translations by
  [`@sanity/document-internationalization`](https://www.sanity.io/plugins/document-internationalization).
  The content list is grouped by language; create a document from inside a
  language group, then use the **Translations** menu in the document toolbar
  to create or link its other language version.
- **Rich text** allows exactly what the site renders: headings, quotes, lists,
  links, images with alt text and captions, and YouTube/Vimeo videos (paste
  the link).
- **Preview link:** "Open preview" in the document menu opens the page on the
  site URL in `SANITY_STUDIO_SITE_URL` (see [Preview](#preview)).
- **Studio UI in Portuguese** (`@sanity/locale-pt-br`). Remove `ptBRLocale()`
  in `sanity.config.ts` for English.
- **Seed:** `seed/content.ndjson` is the sample content, generated from the
  local Markdown, so both samples show the same site.

No Sanity project is configured in the repo: you create one yourself (free
plan is enough) and put its id in `.env`. Until then the site can still run
from Sanity's data model with `pnpm dev:sanity`, which reads the seed file
offline (see below).

## Commands (from the repository root)

| Command | What it does |
| --- | --- |
| `pnpm studio:sanity` | Studio on http://localhost:3333 (needs a project id) |
| `pnpm dev:sanity` | Site with `CONTENT_SOURCE=sanity`. Without `SANITY_PROJECT_ID` it reads the seed file offline |
| `pnpm seed:sanity` | Rebuilds `seed/` from the local content (run `pnpm generate` once first) |
| `pnpm seed:sanity:import` | Imports the seed into your dataset (`sanity login` first) |
| `pnpm --filter @starter/sanity-studio check:seed` | Checks the seed against the schemas |
| `pnpm --filter @starter/sanity-studio build` | Builds the studio into `studios/sanity/dist` |
| `pnpm --filter @starter/sanity-studio deploy` | Hosts the studio at `<SANITY_STUDIO_HOSTNAME>.sanity.studio` |

## Connecting a real project

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage)
   (or `pnpm --filter @starter/sanity-studio exec sanity init --env`), with a
   `production` dataset. Public datasets need no token for reading.
2. `cp studios/sanity/.env.example studios/sanity/.env` and set
   `SANITY_STUDIO_PROJECT_ID`.
3. `pnpm --filter @starter/sanity-studio exec sanity login`, then
   `pnpm seed:sanity:import` to load the sample content and images.
4. `pnpm studio:sanity` and sign in. In Manage → API → CORS origins, add
   `http://localhost:3333` if the studio asks for it.
5. In the root `.env`, set `SANITY_PROJECT_ID` (plus `SANITY_DATASET` if not
   `production`). Sanity is the default content source, so `pnpm dev` now
   reads the real dataset and `pnpm generate` builds the static site from it.

For a private dataset, create a read token (Manage → API → Tokens, Viewer)
and set `SANITY_API_READ_TOKEN` in the build environment. It is only used at
build time and never reaches the browser.

## Publishing

The site is static, so publishing in Sanity has to trigger a rebuild. Add a
webhook in Manage → API → Webhooks that POSTs to the host's deploy hook on
create/update/delete of published documents. See "Rebuilding when content
changes" in [docs/deploy.md](../../docs/deploy.md).

## Preview

"Open preview" links each post, practice area, team member, category and page
to its address on `SANITY_STUDIO_SITE_URL`:

- **Production site:** shows the published version after the rebuild.
- **Local drafts:** run `pnpm dev:sanity` with `SANITY_PERSPECTIVE=drafts` and
  a Viewer token in `SANITY_API_READ_TOKEN`, and point
  `SANITY_STUDIO_SITE_URL` at `http://localhost:3000`. Pages then show
  unpublished changes.

Live preview inside the studio (Sanity's Presentation tool) needs the site to
render on request, which the static-only rule excludes. See the M7 notes in
[docs/decisions.md](../../docs/decisions.md).

## Changing the schema

The adapter's GROQ queries (`lib/content/adapters/sanity.ts`), the seed script
(`scripts/sanity-seed.ts`) and these schemas must agree. CI checks this: the
seed must validate against the schemas, and a site built from the seed must
render the same HTML as one built from the local content.
