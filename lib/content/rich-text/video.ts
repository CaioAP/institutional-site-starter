import type { VideoProvider } from '../types'

/**
 * YouTube/Vimeo URL <-> { provider, id }. Editors paste a link in the CMS;
 * <VideoEmbed> needs the provider and id to build a privacy-friendly embed.
 */
export function parseVideoUrl(url: string | undefined | null): { provider: VideoProvider, id: string } | null {
  if (!url) return null
  let u: URL
  try {
    u = new URL(url.trim())
  }
  catch {
    return null
  }
  const host = u.hostname.replace(/^(www|m)\./, '')
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1).split('/')[0]
    return id ? { provider: 'youtube', id } : null
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const id = u.searchParams.get('v') ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1]
    return id ? { provider: 'youtube', id } : null
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = u.pathname.match(/\/(?:video\/)?(\d+)/)?.[1]
    return id ? { provider: 'vimeo', id } : null
  }
  return null
}

export function videoUrl(provider: VideoProvider, id: string): string {
  return provider === 'youtube' ? `https://www.youtube.com/watch?v=${id}` : `https://vimeo.com/${id}`
}
