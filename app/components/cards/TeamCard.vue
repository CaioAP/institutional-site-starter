<script setup lang="ts">
import type { TeamMemberSummary } from '~~/lib/content/types'

const props = defineProps<{ member: TeamMemberSummary, headingLevel?: 'h2' | 'h3' }>()
const localePath = useLocalePath()
const to = computed(() => localePath({ name: 'team-slug', params: { slug: props.member.slug } }))
</script>

<template>
  <article class="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border/30 bg-surface">
    <NuxtImg
      format="webp"
      :src="member.photo.src"
      :alt="member.photo.alt"
      width="400"
      height="500"
      sizes="xs:100vw sm:100vw md:50vw lg:400px"
      loading="lazy"
      class="aspect-[4/5] w-full object-cover"
    />
    <div class="flex flex-1 flex-col gap-1 p-5">
      <component
        :is="headingLevel ?? 'h3'"
        class="text-xl font-semibold"
      >
        <NuxtLink
          :to="to"
          class="text-text no-underline after:absolute after:inset-0 after:content-[''] group-hover:text-accent"
        >
          {{ member.name }}
        </NuxtLink>
      </component>
      <p class="font-medium text-accent">
        {{ member.role }}
      </p>
      <p class="mt-2 text-text-muted">
        {{ member.shortBio }}
      </p>
    </div>
  </article>
</template>
