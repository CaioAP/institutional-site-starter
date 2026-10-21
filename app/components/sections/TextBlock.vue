<script setup lang="ts">
import type { PageSection } from '~~/lib/content/types'

defineProps<{
  section: Extract<PageSection, { type: 'text' }>
  /** First section of the page: its first image may be the LCP element. */
  priority?: boolean
}>()
</script>

<template>
  <section class="container-content py-14">
    <h2
      v-if="section.heading"
      class="mb-6 text-3xl font-semibold"
    >
      {{ section.heading }}
    </h2>
    <RichText
      :value="section.body"
      :priority="priority"
    />
  </section>
</template>
