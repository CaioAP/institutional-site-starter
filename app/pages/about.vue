<script setup lang="ts">
const page = await useContentOr404('page-about', (src, locale) => src.getPage('about', locale))
usePageSeo(() => ({ ...page.value.seo, title: page.value.seo.title ?? page.value.title }))
</script>

<template>
  <div>
    <SectionsPageIntro
      :title="page.title"
      :lead="page.lead"
    />
    <SectionsSectionRenderer :sections="page.sections" />
  </div>
</template>
