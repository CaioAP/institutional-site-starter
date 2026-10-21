<script setup lang="ts">
import type { PageSection } from '~~/lib/content/types'

/**
 * Full-width hero. The image is the LCP element (preloaded, high priority).
 * An optional muted, looping video plays on top only when the visitor hasn't
 * asked for reduced motion; it never has sound and can be paused (WCAG 2.2.2).
 */
const props = defineProps<{
  section: Extract<PageSection, { type: 'hero' }>
  /** Render the heading as the page's <h1> */
  primary?: boolean
}>()

const { t } = useI18n()
const videoEl = ref<HTMLVideoElement | null>(null)
const showVideo = ref(false)
const paused = ref(false)

onMounted(() => {
  if (props.section.video && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) showVideo.value = true
})

function toggle() {
  const v = videoEl.value
  if (!v) return
  if (v.paused) {
    void v.play()
    paused.value = false
  }
  else {
    v.pause()
    paused.value = true
  }
}
</script>

<template>
  <section class="on-inverse relative isolate overflow-hidden bg-surface-inverse text-text-inverse">
    <NuxtImg
      format="webp"
      :src="section.image.src"
      :alt="section.image.alt"
      :width="section.image.width ?? 1920"
      :height="section.image.height ?? 1080"
      sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw 2xl:100vw"
      densities="x1"
      preload
      fetchpriority="high"
      loading="eager"
      class="absolute inset-0 -z-20 size-full object-cover"
    />
    <video
      v-if="showVideo && section.video"
      ref="videoEl"
      class="absolute inset-0 -z-20 size-full object-cover"
      :poster="section.image.src"
      autoplay
      muted
      loop
      playsinline
      aria-hidden="true"
    >
      <source
        :src="section.video.src"
        :type="section.video.type"
      >
    </video>
    <div class="absolute inset-0 -z-10 bg-gradient-to-r from-surface-inverse/95 via-surface-inverse/80 to-surface-inverse/40" />

    <div class="container-content flex min-h-[32rem] flex-col justify-center gap-6 py-20 md:min-h-[38rem]">
      <component
        :is="primary ? 'h1' : 'h2'"
        class="max-w-3xl text-4xl font-semibold md:text-6xl"
      >
        {{ section.heading }}
      </component>
      <p
        v-if="section.text"
        class="max-w-2xl text-lg md:text-xl"
      >
        {{ section.text }}
      </p>
      <div v-if="section.cta">
        <UiButtonLink
          :to="section.cta.href"
          variant="inverse"
        >
          {{ section.cta.label }}
          <UiIcon name="arrow-right" />
        </UiButtonLink>
      </div>
    </div>

    <button
      v-if="showVideo"
      type="button"
      class="absolute right-4 bottom-4 inline-flex size-11 items-center justify-center rounded-full bg-surface-inverse/70 text-text-inverse"
      :aria-pressed="paused"
      @click="toggle"
    >
      <UiIcon
        :name="paused ? 'play' : 'pause'"
        :label="paused ? t('hero.playVideo') : t('hero.pauseVideo')"
      />
    </button>
  </section>
</template>
