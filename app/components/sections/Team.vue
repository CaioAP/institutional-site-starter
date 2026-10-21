<script setup lang="ts">
import type { PageSection } from '~~/lib/content/types'

defineProps<{ section: Extract<PageSection, { type: 'team' }> }>()
const { t } = useI18n()
const localePath = useLocalePath()
const { data: members } = await useContent('team', (src, locale) => src.listTeamMembers(locale))
</script>

<template>
  <section class="bg-surface-muted py-16 md:py-20">
    <div class="container-content">
      <SectionsSectionHeading
        :heading="section.heading"
        :text="section.text"
      >
        <NuxtLink
          :to="localePath({ name: 'team' })"
          class="font-semibold"
        >{{ t('home.seeAllTeam') }}</NuxtLink>
      </SectionsSectionHeading>
      <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="member in members"
          :key="member.slug"
          v-reveal
        >
          <CardsTeamCard :member="member" />
        </li>
      </ul>
    </div>
  </section>
</template>
