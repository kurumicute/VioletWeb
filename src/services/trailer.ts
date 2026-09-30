export const trailerUrl = 'https://www.youtube.com/watch?v=NSIzsFOfd8M'
export const trailerEmbedUrl =
  'https://www.youtube.com/embed/NSIzsFOfd8M?autoplay=1&playsinline=1&rel=0&hl=zh-TW'

export function prepareTrailerConnection() {
  // Warm up connections on user intent without loading the player on every page visit.
  for (const [id, origin] of [
    ['youtube-connection', 'https://www.youtube.com'],
    ['youtube-images-connection', 'https://i.ytimg.com'],
  ]) {
    if (document.getElementById(id)) continue
    const link = document.createElement('link')
    link.id = id
    link.rel = 'preconnect'
    link.href = origin
    document.head.appendChild(link)
  }
}
