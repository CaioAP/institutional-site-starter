<script setup lang="ts">
import type { TeamMemberSummary } from '~~/lib/content/types'

const props = defineProps<{ author: TeamMemberSummary }>()
const { t } = useI18n()
const localePath = useLocalePath()
const to = computed(() => localePath({ name: 'team-slug', params: { slug: props.author.slug } }))
</script>

<template>
  <section
    aria-labelledby="post-author"
    class="flex gap-5 rounded-lg border border-border/30 bg-surface-muted p-6"
  >
    <NuxtImg
      format="webp"
      :src="author.photo.src"
      :alt="author.photo.alt"
      width="96"
      height="96"
      loading="lazy"
      class="size-20 shrink-0 rounded-full object-cover"
    />
    <div>
      <h2
        id="post-author"
        class="font-sans text-sm font-semibold tracking-wide text-text-muted uppercase"
      >
        {{ t('blog.author') }}
      </h2>
      <p class="mt-1 text-lg font-semibold">
        <NuxtLink :to="to">
          {{ author.name }}
        </NuxtLink>
      </p>
      <p class="text-text-muted">
        {{ author.role }}
      </p>
      <p class="mt-2">
        {{ author.shortBio }}
      </p>
    </div>
  </section>
</template>
