<script setup lang="ts">
const props = defineProps<{ page: number, pageCount: number, link: (n: number) => string }>()
const { t } = useI18n()
const pages = computed(() => Array.from({ length: props.pageCount }, (_, i) => i + 1))
const itemClass = 'inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-md border border-border/50 px-3 text-text no-underline hover:border-accent'
</script>

<template>
  <nav
    v-if="pageCount > 1"
    :aria-label="t('blog.pagination')"
    class="mt-12"
  >
    <ul class="flex flex-wrap items-center gap-2">
      <li v-if="page > 1">
        <NuxtLink
          :to="link(page - 1)"
          :class="itemClass"
          rel="prev"
        >
          <UiIcon
            name="chevron-left"
            :size="16"
          />
          {{ t('blog.previous') }}
        </NuxtLink>
      </li>
      <li
        v-for="n in pages"
        :key="n"
      >
        <NuxtLink
          :to="link(n)"
          :class="[itemClass, n === page && 'border-accent bg-accent text-on-accent hover:text-on-accent']"
          :aria-current="n === page ? 'page' : undefined"
          :aria-label="t('blog.pageN', { n })"
        >
          {{ n }}
        </NuxtLink>
      </li>
      <li v-if="page < pageCount">
        <NuxtLink
          :to="link(page + 1)"
          :class="itemClass"
          rel="next"
        >
          {{ t('blog.next') }}
          <UiIcon
            name="chevron-right"
            :size="16"
          />
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
