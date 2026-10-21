<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const page = await useContentOr404('page-search', (src, locale) => src.getPage('search', locale))
usePageSeo(() => ({ ...page.value.seo, title: page.value.seo.title ?? page.value.title }))

const { query, results, status } = useSearch()
onMounted(() => {
  query.value = typeof route.query.q === 'string' ? route.query.q : ''
})
// Keep ?q= in the URL so results can be shared and survive a reload.
watch(query, (q) => {
  if (q !== route.query.q) router.replace({ query: q ? { q } : {} })
})
</script>

<template>
  <div>
    <SectionsPageIntro :title="page.title" />
    <div class="container-content max-w-3xl py-12">
      <form
        role="search"
        class="flex gap-2"
        action=""
        @submit.prevent
      >
        <label
          for="search-page-input"
          class="sr-only"
        >{{ t('search.label') }}</label>
        <input
          id="search-page-input"
          v-model="query"
          name="q"
          type="search"
          autocomplete="off"
          :placeholder="t('search.placeholder')"
          class="min-h-12 w-full rounded-md border border-border bg-surface px-4 text-lg"
        >
        <button
          type="submit"
          class="min-h-12 rounded-md bg-accent px-5 font-semibold text-on-accent hover:bg-accent-strong"
        >
          {{ t('search.submit') }}
        </button>
      </form>
      <SearchResults
        class="mt-6"
        :results="results"
        :status="status"
        :query="query"
      />
    </div>
  </div>
</template>
