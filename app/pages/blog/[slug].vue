<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const formatDate = useFormatDate()
const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
const slug = String(route.params.slug)
const post = await useContentOr404('post', (src, locale) => src.getPost(slug, locale), [slug])

useAlternates(() => post.value.translations, { name: 'blog-slug', param: 'slug', fallback: 'blog' })
usePageSeo(() => ({ ...post.value.seo, image: post.value.seo.image ?? post.value.cover }), 'article')
useSeoMeta({
  articlePublishedTime: () => post.value.publishedAt,
  articleModifiedTime: () => post.value.updatedAt,
})

const url = computed(() => `${siteUrl}${route.path}`)
const categoryLink = computed(() => localePath({ name: 'blog-category-category', params: { category: post.value.category.slug } }))
</script>

<template>
  <article>
    <header class="border-b border-border/30 bg-surface-muted">
      <div class="container-content py-12 md:py-16">
        <LayoutBreadcrumbs
          :items="[
            { label: t('nav.blog'), to: localePath({ name: 'blog' }) },
            { label: post.category.title, to: categoryLink },
            { label: post.title },
          ]"
        />
        <p class="mb-3 text-sm font-semibold tracking-wide uppercase">
          <NuxtLink :to="categoryLink">
            {{ post.category.title }}
          </NuxtLink>
        </p>
        <h1 class="max-w-4xl text-4xl font-semibold md:text-5xl">
          {{ post.title }}
        </h1>
        <p class="mt-4 max-w-3xl text-lg text-text-muted">
          {{ post.excerpt }}
        </p>
        <p class="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
          <span>
            {{ post.author.name }}
          </span>
          <time :datetime="post.publishedAt">{{ t('common.publishedOn', { date: formatDate(post.publishedAt) }) }}</time>
          <time
            v-if="post.updatedAt"
            :datetime="post.updatedAt"
          >{{ t('common.updatedOn', { date: formatDate(post.updatedAt) }) }}</time>
          <span>{{ t('common.minutesRead', { n: post.readingTime }) }}</span>
        </p>
      </div>
    </header>

    <div class="container-content py-10">
      <NuxtImg
        format="webp"
        :src="post.cover.src"
        :alt="post.cover.alt"
        :width="post.cover.width ?? 1600"
        :height="post.cover.height ?? 900"
        sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:1152px"
        fetchpriority="high"
        preload
        class="aspect-video w-full rounded-lg object-cover"
      />
    </div>

    <div class="container-content grid gap-12 pb-10 lg:grid-cols-[1fr_16rem]">
      <RichText :value="post.body" />
      <aside class="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
        <BlogShareLinks
          :url="url"
          :title="post.title"
        />
        <div v-if="post.tags.length">
          <h2 class="mb-3 font-sans text-sm font-semibold tracking-wide uppercase">
            {{ t('blog.tags') }}
          </h2>
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="tag in post.tags"
              :key="tag"
              class="rounded-full bg-surface-muted px-3 py-1 text-sm"
            >
              {{ tag }}
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <div class="container-content max-w-4xl pb-14">
      <BlogAuthorCard :author="post.author" />
    </div>

    <section
      v-if="post.related.length"
      aria-labelledby="related-posts"
      class="bg-surface-muted py-14"
    >
      <div class="container-content">
        <SectionsSectionHeading
          id="related-posts"
          :heading="t('blog.related')"
        />
        <ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="r in post.related"
            :key="r.slug"
          >
            <CardsPostCard :post="r" />
          </li>
        </ul>
      </div>
    </section>
  </article>
</template>
