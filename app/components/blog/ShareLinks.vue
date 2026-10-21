<script setup lang="ts">
/** Plain share links (no third-party scripts, no tracking). */
const props = defineProps<{ url: string, title: string }>()
const { t } = useI18n()

const links = computed(() => {
  const u = encodeURIComponent(props.url)
  const text = encodeURIComponent(props.title)
  return [
    { network: 'LinkedIn', icon: 'linkedin' as const, href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { network: 'WhatsApp', icon: 'whatsapp' as const, href: `https://wa.me/?text=${text}%20${u}` },
    { network: 'Facebook', icon: 'facebook' as const, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { network: 'X', icon: 'x' as const, href: `https://x.com/intent/post?url=${u}&text=${text}` },
  ]
})
</script>

<template>
  <div data-pagefind-ignore>
    <h2 class="mb-3 font-sans text-sm font-semibold tracking-wide uppercase">
      {{ t('blog.share') }}
    </h2>
    <ul class="flex flex-wrap gap-2">
      <li
        v-for="l in links"
        :key="l.network"
      >
        <a
          :href="l.href"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex size-11 items-center justify-center rounded-full border border-border/50 text-text hover:border-accent hover:text-accent"
        >
          <UiIcon
            :name="l.icon"
            :label="`${t('blog.shareOn', { network: l.network })} ${t('a11y.opensInNewTab')}`"
          />
        </a>
      </li>
      <li>
        <a
          :href="`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`"
          class="inline-flex size-11 items-center justify-center rounded-full border border-border/50 text-text hover:border-accent hover:text-accent"
        >
          <UiIcon
            name="mail"
            :label="t('blog.shareEmail')"
          />
        </a>
      </li>
    </ul>
  </div>
</template>
