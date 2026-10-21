<script setup lang="ts">
import type { SiteSettings } from '~~/lib/content/types'

defineProps<{ settings: SiteSettings }>()
const { t } = useI18n()
const tel = (phone: string) => `tel:${phone.replace(/[^+\d]/g, '')}`
</script>

<template>
  <dl class="grid gap-5">
    <div>
      <dt class="flex items-center gap-2 font-semibold">
        <UiIcon
          name="pin"
          class="text-accent"
        />
        {{ t('contact.address') }}
      </dt>
      <dd class="ps-7">
        <address class="not-italic">
          {{ settings.address.street }}<br>
          {{ settings.address.city }} – {{ settings.address.region }}, {{ settings.address.postalCode }}
        </address>
        <a
          :href="settings.address.mapUrl"
          rel="noopener noreferrer"
          class="text-sm"
        >{{ t('home.mapLink') }}</a>
      </dd>
    </div>
    <div>
      <dt class="flex items-center gap-2 font-semibold">
        <UiIcon
          name="phone"
          class="text-accent"
        />
        {{ t('contact.phone') }}
      </dt>
      <dd class="ps-7">
        <a :href="tel(settings.contact.phone)">{{ settings.contact.phone }}</a>
      </dd>
    </div>
    <div>
      <dt class="flex items-center gap-2 font-semibold">
        <UiIcon
          name="mail"
          class="text-accent"
        />
        {{ t('contact.email') }}
      </dt>
      <dd class="ps-7">
        <a :href="`mailto:${settings.contact.email}`">{{ settings.contact.email }}</a>
      </dd>
    </div>
    <div>
      <dt class="flex items-center gap-2 font-semibold">
        <UiIcon
          name="clock"
          class="text-accent"
        />
        {{ t('contact.hours') }}
      </dt>
      <dd class="ps-7">
        {{ settings.officeHours }}
      </dd>
    </div>
  </dl>
</template>
