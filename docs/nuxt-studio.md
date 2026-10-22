# Nuxt Studio (visual editing for the local content)

[Nuxt Studio](https://nuxt.studio) is the official visual editor for Nuxt
Content. It is a free, open-source Nuxt module (`nuxt-studio`, 1.8.0 here),
self-hosted, with no Nuxt Studio account. It edits the same Markdown/YAML files in
`content/` and commits them to Git, so the site keeps `CONTENT_SOURCE=local`.

## Try it locally

```bash
pnpm dev:studio      # http://localhost:3000
```

A Studio button appears at the bottom left of every page. It opens an editor
for the page's content file (visual Markdown editor, forms for front matter
and YAML, media library). Changes are written to `content/` immediately and
show up in the page. Commit them with your usual Git tools.

`pnpm dev:studio` is `pnpm dev` with `STUDIO_EDITOR=true`, which adds the
module in `nuxt.config.ts`. Normal builds don't include it.

## Using it in production (not set up)

In production, editors open `https://<site>/_studio`, sign in with GitHub,
GitLab or Google, edit, and **publish**, which commits to the repository. The
commit triggers the normal static build.

That needs server routes for sign-in and for committing, so the site would have
to be deployed with SSR (`nuxt build` on a host with functions). The starter
deploys static files only (spec: "no server runtime for pages"), so production
Studio is **not enabled**. The trade-off is recorded in
[decisions.md](decisions.md) (Milestone 7).

If the evaluation favors Nuxt Studio, two ways to keep the public site static:

1. **Separate editor deployment (recommended):** deploy the same repository a
   second time with `nuxt build` (SSR) on a private URL, e.g.
   `edit.example.com`, with Studio enabled. Editors work there; their commits
   rebuild the public static site as usual.
2. **SSR for the whole site:** possible, but it changes hosting, caching and
   the security headers set up in Milestone 6.

### Steps for an editor deployment

Everything below needs accounts and secrets, so none of it is in the repo.

1. Enable the module for that deployment only (for example with
   `STUDIO_EDITOR=true` in its environment) and add the repository config in
   `nuxt.config.ts`:

   ```ts
   studio: {
     repository: { provider: 'github', owner: '<owner>', repo: '<repo>', branch: 'main' },
   },
   ```

2. Create a GitHub OAuth App (GitHub → Settings → Developer settings → OAuth
   Apps) with the callback URL `https://edit.example.com/__nuxt_studio/auth/github`
   (the route nuxt-studio 1.8.0 registers; see the
   [auth provider docs](https://nuxt.studio/auth-providers) for GitLab and Google).
3. Set `STUDIO_GITHUB_CLIENT_ID` and `STUDIO_GITHUB_CLIENT_SECRET` in that
   deployment's environment. There is also an optional
   `STUDIO_GITHUB_MODERATORS` setting for who may sign in (see the auth docs).
4. Build it with `nuxt build` (not `generate`) on a host that runs Nitro
   server functions (Netlify or Cloudflare Pages Functions both work).
5. Open `https://edit.example.com/_studio`.

## Points to check during the evaluation

These were not tested here, because they need the production setup above:

- How site settings and categories, which have no page of their own, are
  reached from the editor (file tree versus on-page editing).
- Translations are separate files linked by `translationKey`. Check whether
  editors can see and follow that link, or have to keep the key in sync by hand.
- Who can sign in and publish, and whether that maps to repository permissions.
