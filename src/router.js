import { useEffect, useState } from 'react'

// Tiny History-API router: '/', '/projects/:id', and anything else → 404.
export function usePath() {
  const [path, setPath] = useState(() => window.location.pathname)
  useEffect(() => {
    const on = () => setPath(window.location.pathname)
    window.addEventListener('popstate', on)
    window.addEventListener('navigate', on)
    return () => { window.removeEventListener('popstate', on); window.removeEventListener('navigate', on) }
  }, [])
  return path
}

export function navigate(to) {
  const [p, hash] = to.split('#')
  const target = p || '/'
  if (target !== window.location.pathname || hash) {
    window.history.pushState({}, '', to)
    window.dispatchEvent(new Event('navigate'))
  }
  // after the new page renders: jump to the anchor, or the top
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (hash) document.getElementById(hash)?.scrollIntoView()
      else window.scrollTo(0, 0)
    })
  )
}

export function match(path) {
  const clean = path.replace(/\/+$/, '') || '/'
  if (clean === '/' || clean === '/index.html') return { page: 'home' }
  const m = clean.match(/^\/projects\/([\w-]+)$/)
  if (m) return { page: 'case', id: m[1] }
  return { page: '404' }
}

// <a> that routes client-side but still works as a normal link (new tab, etc.)
export function onLink(e, to) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  navigate(to)
}
