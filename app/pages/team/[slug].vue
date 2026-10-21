<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const slug = String(route.params.slug)
const member = await useContentOr404('member', (src, locale) => src.getTeamMember(slug, locale), [slug])

useAlternates(() => member.value.translations, { name: 'team-slug', param: 'slug', fallback: 'team' })
usePageSeo(() => ({ ...member.value.seo, image: member.value.seo.image ?? member.value.photo }))
</script>

<template>
  <div>
    <div class="border-b border-border/30 bg-surface-muted">
      <div class="container-content grid gap-10 py-12 md:grid-cols-[18rem_1fr] md:py-16">
        <div class="md:order-2">
          <LayoutBreadcrumbs :items="[{ label: t('nav.team'), to: localePath({ name: 'team' }) }, { label: member.name }]" />
          <h1 class="text-4xl font-semibold md:text-5xl">
            {{ member.name }}
          </h1>
          <p class="mt-2 text-xl font-medium text-accent">
            {{ member.role }}
          </p>
          <p class="mt-4 max-w-2xl text-lg text-text-muted">
            {{ member.shortBio }}
          </p>
          <dl class="mt-6 grid gap-2 text-sm">
            <div
              v-if="member.registration"
              class="flex gap-2"
            >
              <dt class="font-semibold">
                {{ t('team.registration') }}:
              </dt>
              <dd>{{ member.registration }}</dd>
            </div>
            <div
              v-if="member.email"
              class="flex gap-2"
            >
              <dt class="font-semibold">
                {{ t('team.email') }}:
              </dt>
              <dd>
                <a :href="`mailto:${member.email}`">{{ member.email }}</a>
              </dd>
            </div>
          </dl>
          <a
            v-if="member.linkedin"
            :href="member.linkedin"
            rel="noopener noreferrer"
            class="mt-4 inline-flex min-h-11 items-center gap-2"
          >
            <UiIcon name="linkedin" />
            {{ t('team.linkedin', { name: member.name }) }}
          </a>
        </div>
        <NuxtImg
          format="webp"
          :src="member.photo.src"
          :alt="member.photo.alt"
          width="576"
          height="720"
          sizes="xs:100vw sm:288px"
          fetchpriority="high"
          class="aspect-[4/5] w-full max-w-72 rounded-lg object-cover md:order-1"
        />
      </div>
    </div>

    <div class="container-content grid gap-12 py-14 lg:grid-cols-[1fr_18rem]">
      <RichText :value="member.bio" />
      <aside
        v-if="member.areas.length"
        aria-labelledby="member-areas"
      >
        <h2
          id="member-areas"
          class="mb-4 text-xl font-semibold"
        >
          {{ t('team.areas') }}
        </h2>
        <ul class="space-y-2">
          <li
            v-for="area in member.areas"
            :key="area.slug"
          >
            <NuxtLink :to="localePath({ name: 'practice-areas-slug', params: { slug: area.slug } })">
              {{ area.title }}
            </NuxtLink>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>
