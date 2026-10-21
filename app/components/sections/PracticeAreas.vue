<script setup lang="ts">
import type { PageSection } from '~~/lib/content/types'

defineProps<{ section: Extract<PageSection, { type: 'practiceAreas' }> }>()
const { t } = useI18n()
const localePath = useLocalePath()
const { data: areas } = await useContent('areas', (src, locale) => src.listPracticeAreas(locale))
</script>

<template>
  <section class="container-content py-16 md:py-20">
    <SectionsSectionHeading
      :heading="section.heading"
      :text="section.text"
    >
      <NuxtLink
        :to="localePath({ name: 'practice-areas' })"
        class="font-semibold"
      >{{ t('home.seeAllAreas') }}</NuxtLink>
    </SectionsSectionHeading>
    <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="area in areas"
        :key="area.slug"
        v-reveal
      >
        <CardsPracticeAreaCard :area="area" />
      </li>
    </ul>
  </section>
</template>
