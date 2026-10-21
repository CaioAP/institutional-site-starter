<script setup lang="ts">
import type { PostSummary } from '~~/lib/content/types'

const props = defineProps<{ post: PostSummary, headingLevel?: 'h2' | 'h3' }>()
const { t } = useI18n()
const localePath = useLocalePath()
const formatDate = useFormatDate()
const to = computed(() => localePath({ name: 'blog-slug', params: { slug: props.post.slug } }))
</script>

<template>
  <article class="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border/30 bg-surface">
    <NuxtImg
      format="webp"
      :src="post.cover.src"
      :alt="post.cover.alt"
      width="640"
      height="360"
      sizes="xs:100vw sm:100vw md:50vw lg:400px"
      loading="lazy"
      class="aspect-video w-full object-cover"
    />
    <div class="flex flex-1 flex-col gap-3 p-5">
      <p class="text-sm font-semibold tracking-wide text-accent uppercase">
        {{ post.category.title }}
      </p>
      <component
        :is="headingLevel ?? 'h3'"
        class="text-xl font-semibold"
      >
        <NuxtLink
          :to="to"
          class="text-text no-underline after:absolute after:inset-0 after:content-[''] group-hover:text-accent"
        >
          {{ post.title }}
        </NuxtLink>
      </component>
      <p class="text-text-muted">
        {{ post.excerpt }}
      </p>
      <p class="mt-auto pt-2 text-sm text-text-muted">
        <time :datetime="post.publishedAt">{{ formatDate(post.publishedAt) }}</time>
        <span aria-hidden="true"> · </span>
        <span>{{ t('common.minutesRead', { n: post.readingTime }) }}</span>
      </p>
    </div>
  </article>
</template>
