<script setup lang="ts">
const { t } = useI18n()
const page = await useContentOr404('page-search', (src, locale) => src.getPage('search', locale))
usePageSeo(() => ({ ...page.value.seo, title: page.value.seo.title ?? page.value.title }))
</script>

<template>
  <div>
    <SectionsPageIntro :title="page.title" />
    <div class="container-content py-14">
      <p>{{ t('search.soon') }}</p>
    </div>
  </div>
</template>
