<script setup lang="ts">
/**
 * Breadcrumb trail for detail pages, with schema.org BreadcrumbList JSON-LD.
 * The last item is the current page (aria-current, not a link).
 */
import type { Crumb } from '~/types/ui'

const props = defineProps<{ items: Crumb[] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')

const trail = computed<Crumb[]>(() => [{ label: t('nav.home'), to: localePath('/') }, ...props.items])

useHead({
  script: [{
    type: 'application/ld+json',
    key: 'breadcrumbs',
    innerHTML: computed(() => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': trail.value.map((c, i) => ({
        '@type': 'ListItem',
        'position': i + 1,
        'name': c.label,
        ...(c.to ? { item: `${siteUrl}${c.to}` } : {}),
      })),
    })),
  }],
})
</script>

<template>
  <nav
    :aria-label="t('a11y.breadcrumb')"
    class="mb-6 text-sm"
  >
    <ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-text-muted">
      <li
        v-for="(c, i) in trail"
        :key="i"
        class="flex items-center gap-2"
      >
        <UiIcon
          v-if="i > 0"
          name="chevron-right"
          :size="14"
        />
        <NuxtLink
          v-if="c.to && i < trail.length - 1"
          :to="c.to"
          class="text-text-muted underline hover:text-accent"
        >
          {{ c.label }}
        </NuxtLink>
        <span
          v-else
          aria-current="page"
          class="text-text"
        >{{ c.label }}</span>
      </li>
    </ol>
  </nav>
</template>
