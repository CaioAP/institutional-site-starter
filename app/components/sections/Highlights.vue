<script setup lang="ts">
import type { PageSection } from '~~/lib/content/types'

defineProps<{ section: Extract<PageSection, { type: 'highlights' }> }>()
</script>

<template>
  <section class="bg-surface-muted py-16 md:py-20">
    <div class="container-content">
      <SectionsSectionHeading
        v-if="section.heading"
        :heading="section.heading"
      />
      <ul class="grid gap-8 md:grid-cols-3">
        <li
          v-for="item in section.items"
          :key="item.title"
          v-reveal
          class="border-t-2 border-accent pt-5"
        >
          <h3 class="text-xl font-semibold">
            {{ item.title }}
          </h3>
          <p class="mt-2 text-text-muted">
            {{ item.text }}
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>
