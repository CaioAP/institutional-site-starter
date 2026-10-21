<script setup lang="ts">
import type { PracticeAreaSummary } from '~~/lib/content/types'
import type { IconName } from '~/components/ui/Icon.vue'

const props = defineProps<{ area: PracticeAreaSummary, headingLevel?: 'h2' | 'h3' }>()
const localePath = useLocalePath()
const to = computed(() => localePath({ name: 'practice-areas-slug', params: { slug: props.area.slug } }))
</script>

<template>
  <article class="group relative flex h-full flex-col gap-4 rounded-lg border border-border/30 bg-surface p-6 transition-shadow focus-within:shadow-lg hover:shadow-lg">
    <span class="inline-flex size-12 items-center justify-center rounded-md bg-surface-muted text-accent">
      <UiIcon
        :name="area.icon as IconName"
        :size="24"
      />
    </span>
    <component
      :is="headingLevel ?? 'h3'"
      class="text-xl font-semibold"
    >
      <NuxtLink
        :to="to"
        class="text-text no-underline after:absolute after:inset-0 after:content-[''] group-hover:text-accent"
      >
        {{ area.title }}
      </NuxtLink>
    </component>
    <p class="text-text-muted">
      {{ area.summary }}
    </p>
  </article>
</template>
