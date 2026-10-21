<script setup lang="ts">
import type { PageSection } from '~~/lib/content/types'

const props = defineProps<{ section: Extract<PageSection, { type: 'latestPosts' }> }>()
const { t } = useI18n()
const localePath = useLocalePath()
const { data: posts } = await useContent(
  'latest-posts',
  (src, locale) => src.listPosts(locale, { perPage: props.section.limit }),
  [props.section.limit],
)
</script>

<template>
  <section
    v-if="posts?.items.length"
    class="container-content py-16 md:py-20"
  >
    <SectionsSectionHeading :heading="section.heading">
      <NuxtLink
        :to="localePath({ name: 'blog' })"
        class="font-semibold"
      >{{ t('home.seeAllPosts') }}</NuxtLink>
    </SectionsSectionHeading>
    <ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="post in posts.items"
        :key="post.slug"
        v-reveal
      >
        <CardsPostCard :post="post" />
      </li>
    </ul>
  </section>
</template>
