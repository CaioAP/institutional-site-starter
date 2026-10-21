<script setup lang="ts">
const { t } = useI18n()
const { data: members } = await useContent('team', (src, locale) => src.listTeamMembers(locale))
usePageSeo(() => ({ title: t('nav.team'), description: t('team.lead') }))
</script>

<template>
  <div>
    <SectionsPageIntro
      :title="t('nav.team')"
      :lead="t('team.lead')"
    />
    <div class="container-content py-14">
      <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="member in members"
          :key="member.slug"
        >
          <CardsTeamCard
            :member="member"
            heading-level="h2"
          />
        </li>
      </ul>
    </div>
  </div>
</template>
