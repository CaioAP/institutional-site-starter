<script setup lang="ts">
const { t } = useI18n()
const { data: areas } = await useContent('areas', (src, locale) => src.listPracticeAreas(locale))
usePageSeo(() => ({ title: t('nav.practiceAreas'), description: t('areas.lead') }))
</script>

<template>
  <div>
    <SectionsPageIntro
      :title="t('nav.practiceAreas')"
      :lead="t('areas.lead')"
    />
    <div class="container-content py-14">
      <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="area in areas"
          :key="area.slug"
        >
          <CardsPracticeAreaCard
            :area="area"
            heading-level="h2"
          />
        </li>
      </ul>
    </div>
  </div>
</template>
