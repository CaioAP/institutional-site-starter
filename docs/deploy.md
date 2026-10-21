# Deploying

The site is fully static: `pnpm generate` writes everything to
`.output/public`, and any static host can serve it. The starter ships ready
for **Cloudflare Pages** (default) and **Netlify**.

## What every deployment needs

| Variable | Required | Notes |
| --- | --- | --- |
| `NUXT_PUBLIC_SITE_URL` | Yes for production | Public origin, e.g. `https://www.client.com.br`. Canonical links, hreflang, sitemap and social images use it. Defaults to `https://www.example.com`. |
| Everything else in [`.env.example`](../.env.example) | No | Form provider, analytics, WhatsApp button, content source. |

All variables are read at build time and end up in public files, so none of
them may be a secret. Changing one needs a new build.

Node 22 and pnpm 10 are used (`.node-version`, `packageManager` in
`package.json`); both hosts pick them up on their own.

## Cloudflare Pages (default)

1. Workers & Pages → Create → Pages → connect the Git repository.
2. Build settings:
   - Framework preset: **None**
   - Build command: `pnpm generate`
   - Build output directory: `.output/public`
3. Environment variables (Production): `NUXT_PUBLIC_SITE_URL`, plus any
   optional ones.
4. Add the custom domain under Custom domains.

`wrangler.toml` records the output directory. Cloudflare serves the nearest
`404.html`, so English URLs that don't exist get the English not-found page.

## Netlify

1. Add new site → Import an existing project → pick the repository.
2. `netlify.toml` already sets the build command, publish directory and Node
   version.
3. Site configuration → Environment variables: `NUXT_PUBLIC_SITE_URL`, plus any
   optional ones.
4. With `FORM_PROVIDER=netlify` (the default) Netlify Forms picks up the
   contact form from the built HTML. Turn on form detection under Forms if it
   is off, and set up notifications there.

## Headers and Content Security Policy

`scripts/postgenerate.ts` writes `.output/public/_headers`, which both hosts
apply:

- A strict CSP built from the build env (`lib/deploy/headers.ts`). Inline
  scripts are allowed by hash, collected from the generated HTML. Third-party
  hosts are only added when used: the form endpoint's origin when
  `FORM_PROVIDER=endpoint`, Plausible's or Google's hosts when analytics is on.
  YouTube (privacy-enhanced) and Vimeo frames are allowed for video embeds.
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, HSTS and `Cross-Origin-Opener-Policy`.
- Long-lived caching for hashed assets in `/_nuxt/`, one week for resized
  images in `/_ipx/`.

Adding a third-party script or embed means adding its host in
`lib/deploy/headers.ts`. The e2e suite runs under the generated CSP and fails
on any violation, so a missing host shows up in CI.

Don't add headers in the host dashboards or in `netlify.toml`: two CSP headers
are both enforced, and the stricter one wins.

## Redirects

`public/_redirects` (read by both hosts) sends `/pt-BR/...` and `/pt/...` to
the unprefixed Portuguese URLs. When the starter replaces a client's old site,
map the old URLs there so links and rankings carry over. Netlify's only extra
rule, the English 404 page, lives in `netlify.toml` because Cloudflare doesn't
accept 404 rules (it finds `/en/404.html` by itself).

## Preview deployments

Branch builds on Cloudflare Pages (`CF_PAGES_BRANCH` other than
`PRODUCTION_BRANCH`, default `main`) and Netlify deploy previews or branch
deploys (`CONTEXT` other than `production`) build as **previews**:
`robots.txt` disallows everything, every page has `noindex`, and responses
carry `X-Robots-Tag: noindex`. Force either mode with
`NUXT_SITE_ENV=production` or `NUXT_SITE_ENV=preview`.

## Rebuilding when content changes

Content is baked in at build time. With local Markdown, every push rebuilds.
With a hosted CMS, the CMS calls a **deploy hook** when content is published:

- Cloudflare Pages: Settings → Builds → Deploy hooks → Add (branch `main`).
- Netlify: Site configuration → Build & deploy → Build hooks → Add.

Paste the hook URL into the CMS's webhook settings (for Sanity: Manage →
API → Webhooks, trigger on create/update/delete, filtered to published
documents). Treat the URL as a secret: anyone who has it can trigger builds.
Never commit it.

For scheduled posts, a daily rebuild is enough: a GitHub Actions `schedule`
workflow that `curl -X POST`s the hook from a repository secret.

## Checking a build locally

```bash
pnpm generate   # production build in .output/public
pnpm preview    # http://localhost:4173, served the way the hosts do (headers, 404s, compression)
```
