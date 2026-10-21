<script setup lang="ts">
const { t } = useI18n()
const formatDate = useFormatDate()
const page = await useContentOr404('page-terms', (src, locale) => src.getPage('terms', locale))
usePageSeo(() => ({ ...page.value.seo, title: page.value.seo.title ?? page.value.title }))
</script>

<template>
  <div
    data-pagefind-body
    data-pagefind-meta="type:page"
    data-pagefind-filter="type:page"
  >
    <SectionsPageIntro :title="page.title">
      <p
        v-if="page.updatedAt"
        class="mt-4 text-sm text-text-muted"
      >
        {{ t('common.lastUpdated', { date: formatDate(page.updatedAt) }) }}
      </p>
    </SectionsPageIntro>
    <SectionsSectionRenderer :sections="page.sections" />
  </div>
</template>
