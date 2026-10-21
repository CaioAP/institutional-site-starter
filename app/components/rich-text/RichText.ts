/**
 * Renders the normalized RichText AST (lib/content/types.ts) for every content
 * source. Only whitelisted tags exist in the AST, so no HTML sanitizing is
 * needed here. Typography comes from the `.prose-content` styles in base.css.
 */
import { defineComponent, h, type Component, type PropType, type VNodeChild } from 'vue'
import type { RichText, RichTextNode } from '~~/lib/content/types'
import { NuxtImg, NuxtLink } from '#components'
import VideoEmbed from './VideoEmbed.vue'

// NuxtImg is a generic component; its inferred type doesn't fit h()'s overloads.
const Img = NuxtImg as Component

function render(node: RichTextNode, key: number, priority = false): VNodeChild {
  switch (node.type) {
    case 'text':
      return node.value
    case 'image':
      return h('figure', { key, class: 'my-8' }, [
        h(Img, {
          src: node.image.src,
          alt: node.image.alt,
          width: node.image.width,
          height: node.image.height,
          sizes: 'xs:100vw sm:100vw md:768px',
          // A priority image may be the page's LCP element: load it right away.
          ...(priority
            ? { loading: 'eager', fetchpriority: 'high', preload: { fetchPriority: 'high' } }
            : { loading: 'lazy' }),
          format: 'webp',
          class: 'h-auto w-full rounded-lg',
        }),
        node.caption ? h('figcaption', { class: 'mt-2 text-sm text-text-muted' }, node.caption) : null,
      ])
    case 'video':
      return h(VideoEmbed, { key, provider: node.provider, id: node.id, title: node.title, caption: node.caption })
    case 'element': {
      const children = () => node.children.map((child, i) => render(child, i))
      if (node.tag === 'a' && node.attrs?.href) {
        const href = node.attrs.href
        return href.startsWith('/')
          ? h(NuxtLink, { key, to: href }, children)
          : h('a', { key, href, ...(href.startsWith('http') ? { rel: 'noopener noreferrer' } : {}) }, children())
      }
      if (node.tag === 'table') {
        return h('div', { key, class: 'my-6 overflow-x-auto', tabindex: 0 }, [h('table', null, children())])
      }
      return h(node.tag, { key, ...(node.attrs?.id ? { id: node.attrs.id } : {}) }, children())
    }
  }
}

export default defineComponent({
  name: 'RichText',
  props: {
    value: { type: Object as PropType<RichText>, required: true },
    /** Load the first image eagerly: set when the text opens the page. */
    priority: { type: Boolean, default: false },
  },
  setup(props) {
    return () => {
      const first = props.priority ? props.value.nodes.findIndex(n => n.type === 'image') : -1
      return h('div', { class: 'prose-content' }, props.value.nodes.map((n, i) => render(n, i, i === first)))
    }
  },
})
