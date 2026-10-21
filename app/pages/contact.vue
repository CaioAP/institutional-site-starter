<script setup lang="ts">
const { t } = useI18n()
const page = await useContentOr404('page-contact', (src, locale) => src.getPage('contact', locale))
const settings = await useSiteSettings()
usePageSeo(() => ({ ...page.value.seo, title: page.value.seo.title ?? page.value.title }))
</script>

<template>
  <div>
    <SectionsPageIntro
      :title="page.title"
      :lead="page.lead"
    />
    <div class="container-content grid gap-12 py-14 lg:grid-cols-[1fr_22rem]">
      <section aria-labelledby="contact-form-title">
        <h2
          id="contact-form-title"
          class="sr-only"
        >
          {{ page.title }}
        </h2>
        <p class="text-text-muted">
          {{ t('contact.formSoon') }}
        </p>
      </section>
      <aside aria-labelledby="contact-info">
        <h2
          id="contact-info"
          class="mb-6 text-2xl font-semibold"
        >
          {{ t('contact.info') }}
        </h2>
        <LayoutContactDetails
          v-if="settings"
          :settings="settings"
        />
      </aside>
    </div>
    <SectionsSectionRenderer :sections="page.sections" />
  </div>
</template>
