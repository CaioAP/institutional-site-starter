<script setup lang="ts">
import type { PageSection } from '~~/lib/content/types'

/** Renders a page's ordered sections. A leading hero becomes the page's <h1>. */
defineProps<{ sections: PageSection[], heroIsTitle?: boolean }>()
</script>

<template>
  <template
    v-for="(section, i) in sections"
    :key="i"
  >
    <SectionsHero
      v-if="section.type === 'hero'"
      :section="section"
      :primary="heroIsTitle && i === 0"
    />
    <SectionsTextBlock
      v-else-if="section.type === 'text'"
      :section="section"
    />
    <SectionsHighlights
      v-else-if="section.type === 'highlights'"
      :section="section"
    />
    <SectionsCtaBand
      v-else-if="section.type === 'cta'"
      :section="section"
    />
    <SectionsPracticeAreas
      v-else-if="section.type === 'practiceAreas'"
      :section="section"
    />
    <SectionsTeam
      v-else-if="section.type === 'team'"
      :section="section"
    />
    <SectionsLatestPosts
      v-else-if="section.type === 'latestPosts'"
      :section="section"
    />
    <SectionsLocation
      v-else-if="section.type === 'location'"
      :section="section"
    />
  </template>
</template>
