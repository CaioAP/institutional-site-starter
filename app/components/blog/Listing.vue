<script setup lang="ts">
/**
 * Shared blog listing for /blog, /blog/pagina/N, /blog/categoria/X and
 * /blog/categoria/X/pagina/N. Every combination is a static page.
 */
const props = defineProps<{ page: number, category?: string }>()

const { t } = useI18n()
const localePath = useLocalePath()

const { data: categories } = await useContent('categories', (src, locale) => src.listCategories(locale))
const current = computed(() => categories.value?.find(c => c.slug === props.category))
if (props.category && !current.value) throw createError({ statusCode: 404, fatal: true })

const posts = await useContentOr404(
  'posts',
  (src, locale) => src.listPosts(locale, { page: props.page, category: props.category }),
  [props.page, props.category],
)
if (props.page > posts.value.pageCount) throw createError({ statusCode: 404, fatal: true })

const title = computed(() => current.value ? t('blog.categoryTitle', { category: current.value.title }) : t('nav.blog'))
const fullTitle = computed(() => props.page > 1 ? `${title.value} – ${t('blog.pageN', { n: props.page })}` : title.value)

if (current.value) {
  useAlternates(() => current.value?.translations, { name: 'blog-category-category', param: 'category', fallback: 'blog' })
}
usePageSeo(() => ({ title: fullTitle.value, description: t('blog.lead') }))

const pageLink = (n: number) => {
  if (props.category) {
    return n === 1
      ? localePath({ name: 'blog-category-category', params: { category: props.category } })
      : localePath({ name: 'blog-category-category-page-page', params: { category: props.category, page: n } })
  }
  return n === 1 ? localePath({ name: 'blog' }) : localePath({ name: 'blog-page-page', params: { page: n } })
}

const breadcrumbs = computed(() => current.value
  ? [{ label: t('nav.blog'), to: localePath({ name: 'blog' }) }, { label: current.value.title }]
  : [])
</script>

<template>
  <div>
    <SectionsPageIntro
      :title="title"
      :lead="t('blog.lead')"
      :breadcrumbs="breadcrumbs"
    />
    <div class="container-content py-12">
      <nav
        v-if="categories?.length"
        :aria-label="t('blog.categories')"
        class="mb-10"
      >
        <ul class="flex flex-wrap gap-2">
          <li>
            <NuxtLink
              :to="localePath({ name: 'blog' })"
              :aria-current="!category ? 'page' : undefined"
              class="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium text-text no-underline hover:border-accent aria-[current=page]:border-accent aria-[current=page]:bg-accent aria-[current=page]:text-on-accent"
            >
              {{ t('blog.all') }}
            </NuxtLink>
          </li>
          <li
            v-for="c in categories"
            :key="c.slug"
          >
            <NuxtLink
              :to="localePath({ name: 'blog-category-category', params: { category: c.slug } })"
              :aria-current="category === c.slug ? 'page' : undefined"
              class="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium text-text no-underline hover:border-accent aria-[current=page]:border-accent aria-[current=page]:bg-accent aria-[current=page]:text-on-accent"
            >
              {{ c.title }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <p
        v-if="posts.pageCount > 1"
        class="mb-6 text-sm text-text-muted"
      >
        {{ t('blog.pageOf', { page: posts.page, total: posts.pageCount }) }}
      </p>

      <ul
        v-if="posts.items.length"
        class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <li
          v-for="(post, i) in posts.items"
          :key="post.slug"
        >
          <CardsPostCard
            :post="post"
            :priority="i === 0"
            heading-level="h2"
          />
        </li>
      </ul>
      <p v-else>
        {{ t('blog.empty') }}
      </p>

      <BlogPagination
        :page="posts.page"
        :page-count="posts.pageCount"
        :link="pageLink"
      />
    </div>
  </div>
</template>
