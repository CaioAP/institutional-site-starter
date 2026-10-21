<script setup lang="ts">
/**
 * Contact form with accessible client-side validation and a pluggable
 * provider (FORM_PROVIDER = netlify | endpoint, see lib/forms/contact.ts).
 *
 * - Errors are linked to fields with aria-describedby and aria-invalid.
 * - On a failed submit, focus moves to the first invalid field and a summary
 *   is announced; success and failure are announced through a live region.
 * - A honeypot field silently drops bot submissions.
 */
import {
  CONTACT_FIELDS, emptyContactForm, isSpam, submitContact, validateContact,
  type ContactErrors, type FormProvider,
} from '~~/lib/forms/contact'

const props = defineProps<{ email: string }>()
const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig().public
const provider = (config.formProvider || 'netlify') as FormProvider

const form = reactive(emptyContactForm())
const errors = ref<ContactErrors>({})
const attempted = ref(false)
const state = ref<'idle' | 'sending' | 'success' | 'error'>('idle')
const announcement = ref('')
const formEl = ref<HTMLFormElement | null>(null)

const errorText = (f: keyof ContactErrors) => (errors.value[f] ? t(`form.errors.${errors.value[f]}`) : undefined)

// After the first submit attempt, re-validate as the visitor fixes fields.
watch(form, () => {
  if (attempted.value) errors.value = validateContact(form)
})

async function onSubmit() {
  attempted.value = true
  errors.value = validateContact(form)
  const invalid = CONTACT_FIELDS.filter(f => errors.value[f])
  if (invalid.length) {
    announcement.value = t('form.summary', invalid.length)
    await nextTick()
    formEl.value?.querySelector<HTMLElement>(`#contact-${invalid[0]}`)?.focus()
    return
  }

  state.value = 'sending'
  announcement.value = t('form.sending')
  try {
    if (!isSpam(form)) {
      await submitContact(form, { provider, endpoint: config.formEndpoint, formName: 'contact' })
    }
    state.value = 'success'
    announcement.value = t('form.success')
    Object.assign(form, emptyContactForm())
    attempted.value = false
    errors.value = {}
  }
  catch {
    state.value = 'error'
    announcement.value = t('form.error', { email: props.email })
  }
}

const inputClass = 'min-h-12 w-full rounded-md border bg-surface px-4 py-2 aria-[invalid=true]:border-danger aria-[invalid=true]:border-2'
</script>

<template>
  <form
    ref="formEl"
    name="contact"
    method="POST"
    novalidate
    class="grid gap-6"
    v-bind="provider === 'netlify' ? { 'data-netlify': 'true', 'netlify-honeypot': 'website' } : {}"
    @submit.prevent="onSubmit"
  >
    <input
      v-if="provider === 'netlify'"
      type="hidden"
      name="form-name"
      value="contact"
    >

    <div class="grid gap-6 md:grid-cols-2">
      <FormsField
        id="contact-name"
        :label="t('form.name')"
        :error="errorText('name')"
        required
      >
        <template #default="{ describedBy, invalid }">
          <input
            id="contact-name"
            v-model="form.name"
            name="name"
            type="text"
            autocomplete="name"
            required
            :aria-invalid="invalid"
            :aria-describedby="describedBy"
            :class="[inputClass, 'border-border']"
          >
        </template>
      </FormsField>
      <FormsField
        id="contact-email"
        :label="t('form.email')"
        :error="errorText('email')"
        required
      >
        <template #default="{ describedBy, invalid }">
          <input
            id="contact-email"
            v-model="form.email"
            name="email"
            type="email"
            autocomplete="email"
            inputmode="email"
            required
            :aria-invalid="invalid"
            :aria-describedby="describedBy"
            :class="[inputClass, 'border-border']"
          >
        </template>
      </FormsField>
      <FormsField
        id="contact-phone"
        :label="t('form.phone')"
        :hint="t('form.phoneHint')"
        :error="errorText('phone')"
      >
        <template #default="{ describedBy, invalid }">
          <input
            id="contact-phone"
            v-model="form.phone"
            name="phone"
            type="tel"
            autocomplete="tel"
            inputmode="tel"
            :aria-invalid="invalid"
            :aria-describedby="describedBy"
            :class="[inputClass, 'border-border']"
          >
        </template>
      </FormsField>
      <FormsField
        id="contact-subject"
        :label="t('form.subject')"
        :error="errorText('subject')"
        required
      >
        <template #default="{ describedBy, invalid }">
          <input
            id="contact-subject"
            v-model="form.subject"
            name="subject"
            type="text"
            required
            :aria-invalid="invalid"
            :aria-describedby="describedBy"
            :class="[inputClass, 'border-border']"
          >
        </template>
      </FormsField>
    </div>

    <FormsField
      id="contact-message"
      :label="t('form.message')"
      :error="errorText('message')"
      required
    >
      <template #default="{ describedBy, invalid }">
        <textarea
          id="contact-message"
          v-model="form.message"
          name="message"
          rows="6"
          required
          :aria-invalid="invalid"
          :aria-describedby="describedBy"
          :class="[inputClass, 'border-border']"
        />
      </template>
    </FormsField>

    <!-- Honeypot: visually hidden and skipped by keyboard; bots fill it in. -->
    <div
      class="absolute -left-[9999px] h-px w-px overflow-hidden"
      aria-hidden="true"
    >
      <label for="contact-website">{{ t('form.honeypot') }}</label>
      <input
        id="contact-website"
        v-model="form.website"
        name="website"
        type="text"
        tabindex="-1"
        autocomplete="off"
      >
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-start gap-3">
        <input
          id="contact-consent"
          v-model="form.consent"
          name="consent"
          type="checkbox"
          required
          :aria-invalid="!!errors.consent"
          :aria-describedby="errors.consent ? 'contact-consent-error' : undefined"
          class="mt-1 size-5 shrink-0 accent-accent"
        >
        <label for="contact-consent">
          <i18n-t
            keypath="form.consent"
            scope="global"
          >
            <template #link>
              <NuxtLink :to="localePath({ name: 'privacy' })">{{ t('form.consentLink') }}</NuxtLink>
            </template>
          </i18n-t>
        </label>
      </div>
      <p
        v-if="errors.consent"
        id="contact-consent-error"
        class="flex items-center gap-1.5 text-sm font-medium text-danger"
      >
        <UiIcon
          name="alert"
          :size="16"
        />
        {{ errorText('consent') }}
      </p>
    </div>

    <div>
      <button
        type="submit"
        :disabled="state === 'sending'"
        class="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-6 font-semibold text-on-accent hover:bg-accent-strong disabled:opacity-70"
      >
        {{ state === 'sending' ? t('form.sending') : t('form.submit') }}
      </button>
    </div>

    <!-- Live region: validation summary, sending, success and error states -->
    <p
      role="status"
      aria-live="polite"
      :class="{
        'rounded-md p-4 font-medium': state === 'success' || state === 'error',
        'bg-success/10 text-success': state === 'success',
        'bg-danger/10 text-danger': state === 'error',
        'sr-only': state !== 'success' && state !== 'error',
      }"
    >
      {{ announcement }}
    </p>
  </form>
</template>
