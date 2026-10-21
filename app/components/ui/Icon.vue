<script setup lang="ts">
/**
 * Small inline SVG icon set (no icon font, no network request).
 * Icons are decorative by default; pass `label` to expose one to assistive tech.
 */
export type IconName = 'menu' | 'close' | 'search' | 'arrow-right' | 'phone' | 'mail' | 'pin' | 'clock'
  | 'whatsapp' | 'linkedin' | 'instagram' | 'facebook' | 'youtube' | 'x' | 'globe' | 'play'

const props = withDefaults(defineProps<{
  name: IconName
  /** Accessible name; omit for decorative icons */
  label?: string
  size?: number
}>(), { size: 20, label: undefined })

const paths: Record<IconName, string> = {
  'menu': 'M3 6h18M3 12h18M3 18h18',
  'close': 'M6 6l12 12M18 6L6 18',
  'search': 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2-4.35-4.35',
  'arrow-right': 'M5 12h14m-6-6 6 6-6 6',
  'phone': 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',
  'mail': 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm18 2-10 7L2 6',
  'pin': 'M12 22s-8-6.2-8-12a8 8 0 0 1 16 0c0 5.8-8 12-8 12zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  'clock': 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-16v6l4 2',
  'whatsapp': 'M3 21l1.65-4.8A9 9 0 1 1 7.8 19.4L3 21zm6-12.5c0 3.6 2.9 6.5 6.5 6.5l1-1.5-2-1-1 1a4.5 4.5 0 0 1-3-3l1-1-1-2L9 8.5z',
  'linkedin': 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  'instagram': 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm9 9.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4zM17.5 6.5h.01',
  'facebook': 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  'youtube': 'M22.5 6.4a2.8 2.8 0 0 0-2-2C18.9 4 12 4 12 4s-6.9 0-8.5.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 5.6 2.8 2.8 0 0 0 2 2c1.6.4 8.5.4 8.5.4s6.9 0 8.5-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-5.6zM9.8 15.5V8.5l5.7 3.5z',
  'x': 'M4 4l16 16M20 4 4 20',
  'globe': 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z',
  'play': 'M8 5v14l11-7z',
}
const d = computed(() => paths[props.name])
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
    class="shrink-0"
  >
    <path :d="d" />
  </svg>
</template>
