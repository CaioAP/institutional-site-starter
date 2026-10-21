<script setup lang="ts">
import type { Crumb } from '~/types/ui'

/** Page title block. Renders the page's single <h1>, with optional breadcrumbs. */
defineProps<{
  title: string
  lead?: string
  breadcrumbs?: Crumb[]
}>()
</script>

<template>
  <div class="border-b border-border/30 bg-surface-muted">
    <div class="container-content py-12 md:py-16">
      <LayoutBreadcrumbs
        v-if="breadcrumbs?.length"
        :items="breadcrumbs"
      />
      <slot name="before" />
      <h1 class="max-w-3xl text-4xl font-semibold md:text-5xl">
        {{ title }}
      </h1>
      <p
        v-if="lead"
        class="mt-4 max-w-2xl text-lg text-text-muted"
      >
        {{ lead }}
      </p>
      <slot />
    </div>
  </div>
</template>
