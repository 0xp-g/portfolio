export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const scrollToId = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })

export const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

// Anime-style eyecatch wipe. `after` runs while the screen is covered.
export const eyecatch = (big, small, after) =>
  window.dispatchEvent(new CustomEvent('eyecatch', { detail: { big, small, after } }))

export const limitBreak = () => window.dispatchEvent(new Event('limit-break'))

export const isOverdrive = () => document.body.classList.contains('overdrive')
