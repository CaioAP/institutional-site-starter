<script setup lang="ts">
/**
 * Breadcrumb trail for detail pages, with a schema.org BreadcrumbList.
 * The last item is the current page (aria-current, not a link).
 */
import type { Crumb } from '~/types/ui'

const props = defineProps<{ items: Crumb[] }>()
const { t } = useI18n()
const localePath = useLocalePath()

const trail = computed<Crumb[]>(() => [{ label: t('nav.home'), to: localePath('/') }, ...props.items])

// Linked from the page's WebPage node by nuxt-schema-org.
useSchemaOrg([
  defineBreadcrumb({
    itemListElement: trail.value.map(c => ({ name: c.label, ...(c.to ? { item: c.to } : {}) })),
  }),
])
</script>

<template>
  <nav
    :aria-label="t('a11y.breadcrumb')"
    data-pagefind-ignore
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
