# Local content

Used when `CONTENT_SOURCE=local` (the default). Schemas are in
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
- **Images** need `alt`. Use `alt: ""` only for decorative images.
- **Page sections** are listed in frontmatter (`sections:`). A
  `- type: body` entry renders the Markdown body of the file at that position.
- **Video in posts**:

  ```md
  ::video-embed{provider="youtube" id="VIDEO_ID" title="Accessible title"}
  ::
  ```

  `provider` can be `youtube` or `vimeo`. The player loads only after a click.
