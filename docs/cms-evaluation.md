# CMS evaluation

Which CMS should non-technical editors use? This page has the recommendation
(desk research, 2026-10-23) and a checklist to confirm it by hand. Record the
final choice in the "Open decisions" table in [decisions.md](decisions.md);
the default stays local Nuxt Content until then.

## Recommendation (2026-10-23)

**Use Sanity as the default CMS for non-technical editors. Keep Contentful as
the alternative if the editors try both and prefer its translation screen.**
Nuxt Studio is out: publishing from it needs a server.

Hard rule: the site must stay a static (SSG) build on Cloudflare Pages.
Anything that needs a server at request time is excluded.

| | Sanity | Contentful |
| --- | --- | --- |
| Works with a static build on Cloudflare Pages | Yes. Content is read at build time; a publish webhook calls the Pages deploy hook | Yes, same way |
| Excluded features (need a server) | Presentation tool (live visual editing) | Live preview / Studio visual editing |
| Editor app | Sanity Studio, hosted free at `<name>.sanity.studio`; its layout is defined in code in this repo | Contentful web app, nothing to host; layout set in the web app |
| Editor UI in Portuguese | **Yes** (`@sanity/locale-pt-br`, already on) | **No**: English, French and German only |
| Translations | One document per language, linked through the "Translations" menu. Less obvious for editors | Both languages side by side in one entry (field-level). **Easiest for bilingual editing** |
| Posts in one language only (the site supports this) | Natural: just don't create the translation | Awkward with field-level locales: needs an extra field or entry-level localization. Publishing one language while the other stays a draft is a paid feature |
| Free plan | 20 users, 2 roles (Administrator, Viewer), 10k documents, 2 datasets | 10 users, 2 roles, **2 languages max**, 25 content types, 10k records |
| First paid step | Growth: about US$15 per user/month, adds Editor and other roles | Lite: about US$300/month, adds a 3rd language and a 3rd role |
| Preview before publishing | Link to the page; drafts visible in a local or separate preview build | Same limits under static hosting |
| Export / lock-in | `sanity dataset export` (NDJSON + files) | `contentful space export` (JSON + files) |
| Work left in this repo | **None**: adapter, Studio, seed, and CI check that it renders the same site as the local content are on `main` | New adapter, rich text converter, content model script and seed import (about the size of the Sanity sample) |

Why Sanity:

- Portuguese editor interface. For people who are not technical, this
  matters more than any other single point.
- Cheaper growth path: about US$15 per editor per month, against about
  US$300/month for Contentful as soon as a 3rd language or role is needed.
- Already built and tested here, so it can be tried today.

Its weak spot is translations as separate documents. If editors find that
confusing, two options exist without leaving Sanity: a guided
"Translations" workflow in the Studio, or field-level translations
(`sanity-plugin-internationalized-array`), which give a side-by-side screen
like Contentful's. Both are developer work and not done yet.

Choose Contentful instead if the editors only ever need pt-BR and English,
are comfortable with an English interface, and prefer side-by-side
translations. It needs a sample built first (see above).

Free plan weak spot for Sanity: only Administrator and Viewer roles, so every
editor is an administrator until the Growth plan.

Prices and limits are from third-party summaries and vendor help pages, read
on 2026-10-23. Check them on the vendor sites before deciding:

- Sanity: [plan summary](https://nayankyada.com/blog/sanity-cms-pricing-in-2026-free-plan-growth-and-when-you-need-enterprise),
  [robotostudio](https://robotostudio.com/blog/sanity-cms-pricing-which-plan-is-right-for-you),
  [sanity.io/pricing](https://www.sanity.io/pricing).
- Contentful: [plan summary](https://dev.to/nayankyada/contentful-pricing-2026-free-tier-limits-the-300-cliff-and-enterprise-3gii),
  [localization](https://www.contentful.com/help/getting-started/localized-product/),
  [field vs entry localization](https://contentful.com/help/localization/field-and-entry-localization),
  [locale-based publishing](https://contentful.com/help/localization/locale-based-publishing),
  [contentful.com/pricing](https://www.contentful.com/pricing/).

### Why Nuxt Studio is out

Nuxt Studio edits the files in `content/` and commits them, which keeps the
site static. But its production editor (`/_studio`, sign-in and publishing)
runs as server routes, so it needs an SSR deployment. That breaks the static
rule unless a second, private SSR "editor" site is deployed next to the
public one. Its editor is also built for Markdown files, which is less
approachable than a form-based CMS. It stays available for local editing by
developers (`pnpm dev:studio`). See [nuxt-studio.md](nuxt-studio.md).

## Checklist to confirm by hand

Each sample runs the same site with the same content, so only the editing
experience differs. Fill in the notes and a score from 1 (poor) to 5
(excellent) per criterion.

| Sample | Run it | Setup notes |
| --- | --- | --- |
| A. Local / Nuxt Content (baseline, no CMS) | `pnpm dev:local`, edit files in `content/` | [content/README.md](../content/README.md) |
| B. Nuxt Content + Nuxt Studio (out: production needs SSR) | `pnpm dev:studio` (local editing only) | [nuxt-studio.md](nuxt-studio.md) |
| C. Sanity | `pnpm studio:sanity` + `pnpm dev:sanity` (needs your own free Sanity project) | [studios/sanity/README.md](../studios/sanity/README.md) |
| D. Contentful | Not built yet. To judge the editor alone, model one "post" by hand in a free Contentful space | [contentful.com](https://www.contentful.com) |

Suggested script for each sample, timed:

1. Create a post in Portuguese with a cover image, an embedded YouTube video
   and a category, then its English translation.
2. Switch between the two language versions in the editor.
3. Change a team member's role and photo.
4. Move a practice area to the top of the list.
5. Preview the post before publishing, publish, and time until it is live.
6. Invite a second editor with restricted rights.

Things already known from building the samples (check them, don't take them
on trust):

- A: editors need Git and Markdown; preview is `pnpm dev`; publish = push.
- B: local editing works out of the box. Publishing from the website needs an
  SSR "editor" deployment plus an OAuth app, because the public site is static.
- C: translations are linked documents (Translations menu); preview links
  open the page on the site, and draft preview needs `pnpm dev:sanity` with a
  token. Publishing triggers the host's deploy hook (needs a webhook).
- D: languages side by side in one entry; English-only interface; 2 languages
  on the free plan. Publishing would trigger the deploy hook through a
  Contentful webhook, like Sanity.

## A. Local / Nuxt Content (baseline)

| Criterion | Notes | Score (1–5) |
| --- | --- | --- |
| 1. Creating a bilingual post with cover image and embedded video, as a non-technical editor | | |
| 2. Linking translations and switching language in the editor | | |
| 3. Editing a team member and reordering practice areas | | |
| 4. Preview before publishing | | |
| 5. Time from "publish" to live site (rebuild) | | |
| 6. Roles/permissions for multiple editors | | |
| 7. Free tier limits and paid pricing (check by hand on the vendor site) | | |
| 8. Editor UI in Portuguese | | |
| 9. Lock-in: effort to export content and migrate | | |
| 10. Setup and maintenance effort for the developer | | |
| **Total** | | **/50** |

## B. Nuxt Content + Nuxt Studio

| Criterion | Notes | Score (1–5) |
| --- | --- | --- |
| 1. Creating a bilingual post with cover image and embedded video, as a non-technical editor | | |
| 2. Linking translations and switching language in the editor | | |
| 3. Editing a team member and reordering practice areas | | |
| 4. Preview before publishing | | |
| 5. Time from "publish" to live site (rebuild) | | |
| 6. Roles/permissions for multiple editors | | |
| 7. Free tier limits and paid pricing (check by hand on the vendor site) | | |
| 8. Editor UI in Portuguese | | |
| 9. Lock-in: effort to export content and migrate | | |
| 10. Setup and maintenance effort for the developer | | |
| **Total** | | **/50** |

## C. Sanity

| Criterion | Notes | Score (1–5) |
| --- | --- | --- |
| 1. Creating a bilingual post with cover image and embedded video, as a non-technical editor | | |
| 2. Linking translations and switching language in the editor | | |
| 3. Editing a team member and reordering practice areas | | |
| 4. Preview before publishing | | |
| 5. Time from "publish" to live site (rebuild) | | |
| 6. Roles/permissions for multiple editors | | |
| 7. Free tier limits and paid pricing (check by hand on the vendor site) | | |
| 8. Editor UI in Portuguese | | |
| 9. Lock-in: effort to export content and migrate | | |
| 10. Setup and maintenance effort for the developer | | |
| **Total** | | **/50** |

## D. Contentful

| Criterion | Notes | Score (1–5) |
| --- | --- | --- |
| 1. Creating a bilingual post with cover image and embedded video, as a non-technical editor | | |
| 2. Linking translations and switching language in the editor | | |
| 3. Editing a team member and reordering practice areas | | |
| 4. Preview before publishing | | |
| 5. Time from "publish" to live site (rebuild) | | |
| 6. Roles/permissions for multiple editors | | |
| 7. Free tier limits and paid pricing (check by hand on the vendor site) | | |
| 8. Editor UI in Portuguese | | |
| 9. Lock-in: effort to export content and migrate | | |
| 10. Setup and maintenance effort for the developer | | |
| **Total** | | **/50** |

## Summary

| Sample | Total (/50) | Biggest strength | Biggest blocker |
| --- | --- | --- | --- |
| A. Local / Nuxt Content | | | |
| B. Nuxt Studio | | | |
| C. Sanity | | | |
| D. Contentful | | | |

Decision and date:
