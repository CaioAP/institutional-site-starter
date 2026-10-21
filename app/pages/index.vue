<script setup lang="ts">
const page = await useContentOr404('page-home', (src, locale) => src.getPage('home', locale))
usePageSeo(() => ({ ...page.value.seo, title: page.value.seo.title ?? page.value.title }))
// The home title already contains the firm name; skip the "| Firm" suffix.
useHead({ titleTemplate: '%s' })
const startsWithHero = computed(() => page.value.sections[0]?.type === 'hero')
</script>

<template>
  <div>
    <SectionsPageIntro
      v-if="!startsWithHero"
      :title="page.title"
      :lead="page.lead"
    />
    <SectionsSectionRenderer
      :sections="page.sections"
      :hero-is-title="startsWithHero"
    />
  </div>
</template>
