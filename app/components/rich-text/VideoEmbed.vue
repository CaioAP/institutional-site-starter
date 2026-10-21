<script setup lang="ts">
/**
 * Privacy-friendly "lite" video embed: renders a local poster and a play
 * button; nothing is requested from YouTube/Vimeo until the visitor clicks.
 * YouTube uses the youtube-nocookie.com domain, Vimeo uses `dnt=1`.
 */
import type { VideoProvider } from '~~/lib/content/types'

const props = defineProps<{
  provider: VideoProvider
  id: string
  title: string
  caption?: string
}>()

const { t } = useI18n()
const playing = ref(false)
const frame = ref<HTMLIFrameElement | null>(null)

const providerName = computed(() => (props.provider === 'youtube' ? 'YouTube' : 'Vimeo'))
const src = computed(() => {
  const id = encodeURIComponent(props.id)
  return props.provider === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
    : `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`
})

async function play() {
  playing.value = true
  await nextTick()
  frame.value?.focus()
}
</script>

<template>
  <figure class="my-8">
    <div class="relative aspect-video overflow-hidden rounded-lg bg-surface-inverse">
      <iframe
        v-if="playing"
        ref="frame"
        :src="src"
        :title="title"
        class="absolute inset-0 size-full"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      />
      <button
        v-else
        type="button"
        class="group absolute inset-0 flex size-full cursor-pointer flex-col items-center justify-center gap-4 p-6 text-center text-text-inverse"
        @click="play"
      >
        <span class="inline-flex size-16 items-center justify-center rounded-full bg-accent text-on-accent transition-transform group-hover:scale-105">
          <UiIcon
            name="play"
            :size="28"
          />
        </span>
        <span class="max-w-md font-medium">
          <span class="sr-only">{{ t('video.play', { title }) }}</span>
          <span aria-hidden="true">{{ title }}</span>
        </span>
        <span class="text-sm opacity-90">{{ t('video.notice', { provider: providerName }) }}</span>
      </button>
    </div>
    <figcaption
      v-if="caption"
      class="mt-2 text-sm text-text-muted"
    >
      {{ caption }}
    </figcaption>
  </figure>
</template>
