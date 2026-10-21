<script setup lang="ts">
/**
 * Floating WhatsApp link. Disabled with WHATSAPP_BUTTON=false or by leaving
 * the WhatsApp number empty in SiteSettings. Hidden while the consent banner
 * is open so the two never overlap.
 */
const { t } = useI18n()
const settings = await useSiteSettings()
const enabled = useRuntimeConfig().public.whatsappButton
const { choice, loaded } = useConsent()
const mounted = ref(false)
onMounted(() => (mounted.value = true))

const number = computed(() => settings.value?.contact.whatsapp.replace(/\D/g, '') ?? '')
const href = computed(() => `https://wa.me/${number.value}?text=${encodeURIComponent(t('whatsapp.message'))}`)
const hidden = computed(() => mounted.value && loaded.value && !choice.value)
</script>

<template>
  <a
    v-if="enabled && number"
    v-show="!hidden"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="fixed right-4 bottom-4 z-40 inline-flex size-14 items-center justify-center rounded-full bg-[#1f7a4a] text-white shadow-lg hover:bg-[#186a3f] hover:text-white focus-visible:outline-offset-4"
    data-whatsapp-button
  >
    <UiIcon
      name="whatsapp"
      :size="28"
      :label="`${t('whatsapp.label')} ${t('a11y.opensInNewTab')}`"
    />
  </a>
</template>
