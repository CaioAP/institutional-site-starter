<script setup lang="ts">
import type { PageSection } from '~~/lib/content/types'

defineProps<{ section: Extract<PageSection, { type: 'text' }> }>()
</script>

<template>
  <section class="container-content py-14">
    <h2
      v-if="section.heading"
      class="mb-6 text-3xl font-semibold"
    >
      {{ section.heading }}
    </h2>
    <RichText :value="section.body" />
  </section>
</template>
