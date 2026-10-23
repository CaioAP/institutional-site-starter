# Local content

Used when `CONTENT_SOURCE=local`. The default source is Sanity, whose sample
seed is generated from these files (`pnpm seed:sanity`), so edit content here
to change the sample content of both. Schemas are in
[`content.config.ts`](../content.config.ts).

```
content/
  pt-BR/                      # one folder per locale
    settings.yml              # SiteSettings
    pages/<key>.md            # home, about, contact, search, privacy, terms
    practice-areas/<slug>.md
    team/<slug>.md
    blog/<slug>.md
    categories/<slug>.yml
  en/ ...                     # same structure, translated slugs
```

- **Slug** = file name. Rename the file to change the URL.
- **`translationKey`** links translations: give the pt-BR and en files the
  same value. It is also what references use: `author: ana-ribeiro`,
  `category: privacidade`, `team: [bruno-costa]`, `areas: [contratos]`.
- **Images** need `alt`. Use `alt: ""` only for decorative images. Give
  images in the Markdown body their size, so the page doesn't jump while they
  load: `![Alt text](/images/photo.jpg){width="1200" height="800"}`.
- **Page sections** are listed in frontmatter (`sections:`). A
  `- type: body` entry renders the Markdown body of the file at that position.
- **Video in posts**:

  ```md
  ::video-embed{provider="youtube" id="VIDEO_ID" title="Accessible title"}
  ::
  ```

  `provider` can be `youtube` or `vimeo`. The player loads only after a click.
