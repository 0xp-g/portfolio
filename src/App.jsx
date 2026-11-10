import { useCallback, useEffect, useState } from 'react'
import { profile } from './data.js'
import { useLang } from './i18n.jsx'
import { match, navigate, usePath } from './router.js'
import { unlock } from './achievements.js'
import { riser } from './sound.js'
import Boot from './components/Boot.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Tapes from './components/Tapes.jsx'
import About from './components/About.jsx'
import Projects from './components/Projects.jsx'
import QueueSim from './components/QueueSim.jsx'
import Stack from './components/Stack.jsx'
import Log from './components/Log.jsx'
import Activity from './components/Activity.jsx'
import Terminal from './components/Terminal.jsx'
import Contact from './components/Contact.jsx'
import CaseStudy from './components/CaseStudy.jsx'
import NotFound from './components/NotFound.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import Eyecatch from './components/Eyecatch.jsx'
import Starfield from './components/Starfield.jsx'
import RewindOverlay from './components/RewindOverlay.jsx'
import { AchievementBadge, AchievementToasts } from './components/Achievements.jsx'
import { cases } from './cases.js'
import { eyecatch, reducedMotion } from './util.js'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

// A refresh is a "death": it starts a new loop and plays the return-by-death rewind.
const isReload = () => {
  try {
    const nav = performance.getEntriesByType('navigation')[0]
    return nav ? nav.type === 'reload' : performance.navigation?.type === 1
  } catch { return false }
}

function useLoopCount() {
  const [n, setN] = useState(1)
  useEffect(() => {
    try {
      let next = Number(localStorage.getItem('loop')) || 0
      if (!sessionStorage.getItem('loop-counted') || isReload()) {
        next += 1
        localStorage.setItem('loop', String(next))
        sessionStorage.setItem('loop-counted', '1')
      }
      setN(next || 1)
      if (next >= 5) unlock('loop5')
    } catch { /* storage blocked: stay on loop 1 */ }
  }, [])
  return n
}

export default function App() {
  const { t, lang } = useLang()
  const path = usePath()
  const route = match(path)
  const loop = useLoopCount()

  useEffect(() => {
    if (!isReload()) return
    const id = setTimeout(() => {
      let n = 1
      try { n = Number(localStorage.getItem('loop')) || 1 } catch { /* ignore */ }
      window.dispatchEvent(new CustomEvent('return-by-death', { detail: { loop: n } }))
    }, 200)
    return () => clearTimeout(id)
  }, [])
  const [booted, setBooted] = useState(() => {
    try { return reducedMotion() || sessionStorage.getItem('booted') === '1' || match(window.location.pathname).page !== 'home' } catch { return true }
  })
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [activeProject, setActiveProject] = useState(0)
  const [overdrive, setOverdrive] = useState(false)
  const [progress, setProgress] = useState(0)

  const finishBoot = useCallback(() => {
    setBooted(true)
    try { sessionStorage.setItem('booted', '1') } catch { /* ignore */ }
  }, [])

  const openProject = useCallback((i) => {
    setActiveProject(i)
    if (window.location.pathname !== '/') navigate('/#projects')
    else document.getElementById('projects')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
  }, [])

  // limit break toggling (konami code, terminal, palette, character sheet)
  useEffect(() => {
    const toggle = () =>
      setOverdrive((on) => {
        if (!on) { riser(); unlock('limit') }
        eyecatch(on ? '解除' : '限界突破', on ? 'COOLDOWN' : 'LIMIT BREAK', () => setOverdrive(!on))
        return on
      })
    window.addEventListener('limit-break', toggle)
    let seq = []
    const onKey = (e) => {
      seq = [...seq, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length)
      if (seq.join() === KONAMI.join()) { seq = []; toggle() }
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('limit-break', toggle); window.removeEventListener('keydown', onKey) }
  }, [])

  useEffect(() => { document.body.classList.toggle('overdrive', overdrive) }, [overdrive])
  useEffect(() => { if (paletteOpen) unlock('palette') }, [paletteOpen])

  useEffect(() => {
    if (route.page === 'home')
      document.title = lang === 'ja' ? `${profile.name}｜${profile.ja.role}` : `${profile.name} · ${profile.role}`
  }, [lang, route.page])

  useEffect(() => {
    const onKey = (e) => {
      const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      } else if (e.key === '/' && !typing) {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)

    const onMove = (e) => {
      document.documentElement.style.setProperty('--mx', `${e.clientX}px`)
      document.documentElement.style.setProperty('--my', `${e.clientY}px`)
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight
        setProgress(max > 0 ? scrollY / max : 0)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add('in')),
      { threshold: 0.1 }
    )
    const observeAll = () => document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el))
    observeAll()
    const mo = new MutationObserver(observeAll)
    mo.observe(document.querySelector('main'), { childList: true, subtree: true })

    // deep link to a section on first load (e.g. /#projects)
    if (window.location.hash) requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView())

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
      mo.disconnect()
    }
  }, [])

  let page
  if (route.page === 'home')
    page = (
      <>
        <Hero onPalette={() => setPaletteOpen(true)} />
        <Tapes />
        <About />
        <Projects active={activeProject} setActive={setActiveProject} />
        <QueueSim />
        <Stack onOpenProject={openProject} />
        <Log />
        <Activity />
        <Terminal onOpenProject={openProject} loop={loop} />
        <Contact />
      </>
    )
  else if (route.page === 'case' && cases[route.id]) page = <CaseStudy key={route.id} id={route.id} />
  else page = <NotFound />

  return (
    <>
      {!booted && <Boot onDone={finishBoot} loop={loop} />}
      <div className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <Starfield />
      <div className="spotlight" aria-hidden="true" />
      <div className="speedlines" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <Nav onPalette={() => setPaletteOpen(true)} path={path} />
      <main>{page}</main>
      <footer className="footer">
        <div className="footer-end">
          <span className="end-jp" lang="ja">おわり</span>
          <span className="end-en mono">{t('footer.thanks')}</span>
        </div>
        <div className="footer-meta mono">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span title="Visits from this browser. Every return starts a new loop.">
            ↺ loop #{loop}{loop > 1 ? (lang === 'ja' ? '・おかえりなさい' : ' · welcome back') : ''}
          </span>
          <AchievementBadge />
          <span>React + Vite · ↑↑↓↓←→←→BA</span>
        </div>
      </footer>
      {overdrive && (
        <button className="od-hud mono" onClick={() => window.dispatchEvent(new Event('limit-break'))}>
          <span className="od-dot" /> 限界突破 · LIMIT BREAK ON <span className="od-off">× {lang === 'ja' ? '解除' : 'disengage'}</span>
        </button>
      )}
      <Eyecatch />
      <RewindOverlay />
      <AchievementToasts />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onOpenProject={openProject} />
    </>
  )
}
