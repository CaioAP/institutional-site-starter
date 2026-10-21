<script setup lang="ts">
import type { SearchResult } from '~/composables/useSearch'

defineProps<{
  results: SearchResult[]
  status: 'idle' | 'loading' | 'done' | 'unavailable'
  query: string
  listId?: string
}>()
const emit = defineEmits<{ navigate: [] }>()
const { t } = useI18n()
</script>

<template>
  <div>
    <!-- Announced to screen readers as results change -->
    <p
      role="status"
      class="mb-4 text-sm text-text-muted"
    >
      <template v-if="status === 'loading'">
        {{ t('search.loading') }}
      </template>
      <template v-else-if="status === 'unavailable'">
        {{ t('search.unavailable') }}
      </template>
      <template v-else-if="status === 'done' && results.length">
        {{ t('search.results', results.length) }}
      </template>
      <template v-else-if="status === 'done'">
        {{ t('search.noResults', { q: query }) }}
      </template>
    </p>
    <ul
      v-if="results.length"
      :id="listId"
      class="divide-y divide-border/30"
    >
      <li
        v-for="r in results"
        :key="r.url"
        class="py-4"
      >
        <span class="mb-1 inline-block rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold tracking-wide text-text uppercase">
          {{ t(`search.types.${r.type}`) }}
        </span>
        <NuxtLink
          :to="r.url"
          class="block text-lg font-semibold"
          @click="emit('navigate')"
        >
          {{ r.title }}
        </NuxtLink>
        <p class="mt-1 text-text-muted">
          <template
            v-for="(part, i) in r.excerpt"
            :key="i"
          >
            <mark
              v-if="part.mark"
              class="bg-accent/15 text-text"
            >{{ part.text }}</mark>
            <template v-else>
              {{ part.text }}
            </template>
          </template>
        </p>
      </li>
    </ul>
  </div>
</template>
