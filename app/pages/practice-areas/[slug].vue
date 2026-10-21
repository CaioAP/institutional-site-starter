<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const slug = String(route.params.slug)
const area = await useContentOr404('area', (src, locale) => src.getPracticeArea(slug, locale), [slug])

useAlternates(() => area.value.translations, { name: 'practice-areas-slug', param: 'slug', fallback: 'practice-areas' })
usePageSeo(() => area.value.seo)
</script>

<template>
  <div
    data-pagefind-body
    data-pagefind-meta="type:area"
    data-pagefind-filter="type:area"
  >
    <SectionsPageIntro
      :title="area.title"
      :lead="area.summary"
      :breadcrumbs="[{ label: t('nav.practiceAreas'), to: localePath({ name: 'practice-areas' }) }, { label: area.title }]"
    />
    <div class="container-content py-14">
      <RichText :value="area.body" />
    </div>

    <section
      v-if="area.team.length"
      class="bg-surface-muted py-14"
      data-pagefind-ignore
      aria-labelledby="area-team"
    >
      <div class="container-content">
        <SectionsSectionHeading
          id="area-team"
          :heading="t('areas.team')"
        />
        <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="member in area.team"
            :key="member.slug"
          >
            <CardsTeamCard :member="member" />
          </li>
        </ul>
      </div>
    </section>

    <SectionsCtaBand
      data-pagefind-ignore
      :section="{
        type: 'cta',
        heading: t('areas.cta', { area: area.title }),
        text: t('areas.ctaText'),
        link: { label: t('home.contactCta'), href: localePath({ name: 'contact' }) },
      }"
    />
  </div>
</template>
