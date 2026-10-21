# CMS evaluation checklist

Manual comparison of the editor experience. Each sample runs the same site
with the same content, so only the editing experience differs. Fill in the
notes and a score from 1 (poor) to 5 (excellent) per criterion, then record
the chosen default in the "Open decisions" table in [decisions.md](decisions.md).

| Sample | Run it | Setup notes |
| --- | --- | --- |
| A. Local / Nuxt Content (baseline, no CMS) | `pnpm dev:local`, edit files in `content/` | [content/README.md](../content/README.md) |
| B. Nuxt Content + Nuxt Studio | `pnpm dev:studio` (local editing); production needs an editor deployment | [nuxt-studio.md](nuxt-studio.md) |
| C. Sanity | `pnpm studio:sanity` + `pnpm dev:sanity` (needs your own free Sanity project) | [studios/sanity/README.md](../studios/sanity/README.md) |

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

## Summary

| Sample | Total (/50) | Biggest strength | Biggest blocker |
| --- | --- | --- | --- |
| A. Local / Nuxt Content | | | |
| B. Nuxt Studio | | | |
| C. Sanity | | | |

Decision and date:
