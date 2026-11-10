import { useEffect, useState } from 'react'
import { profile } from '../data.js'
import { useLang } from '../i18n.jsx'
import { eyecatch, isMac } from '../util.js'
import { onLink } from '../router.js'
import { isSoundOn, setSound } from '../sound.js'
import { unlock } from '../achievements.js'

const links = [
  ['about', 'nav.about'],
  ['projects', 'nav.projects'],
  ['stress', 'nav.stress'],
  ['stack', 'nav.stack'],
  ['log', 'nav.log'],
  ['activity', 'nav.activity'],
  ['terminal', 'nav.terminal'],
  ['contact', 'nav.contact'],
]

export function LangToggle() {
  const { lang, setLang } = useLang()
  const flip = (to) => {
    if (to === lang) return
    eyecatch(to === 'ja' ? '日本語' : 'English', to === 'ja' ? 'SWITCHING LANGUAGE' : '言語を切り替え中', () => setLang(to))
  }
  return (
    <div className={`lang-toggle mono ${lang}`} role="group" aria-label="Language">
      <span className="lang-thumb" aria-hidden="true" />
      <button aria-pressed={lang === 'en'} onClick={() => flip('en')}>EN</button>
      <button aria-pressed={lang === 'ja'} onClick={() => flip('ja')} lang="ja">日本語</button>
    </div>
  )
}

export function SoundToggle() {
  const { t } = useLang()
  const [on, setOn] = useState(isSoundOn)
  useEffect(() => {
    const sync = () => setOn(isSoundOn())
    window.addEventListener('sound-change', sync)
    return () => window.removeEventListener('sound-change', sync)
  }, [])
  const flip = () => { const next = !on; setSound(next); if (next) unlock('sound') }
  return (
    <button className={`sound-btn ${on ? 'on' : ''}`} onClick={flip} aria-pressed={on} title={on ? t('sound.on') : t('sound.off')} aria-label={on ? t('sound.on') : t('sound.off')}>
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        {on ? (
          <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M16.5 8.5a5 5 0 0 1 0 7" /><path d="M19 6a8.5 8.5 0 0 1 0 12" />
          </g>
        ) : (
          <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        )}
      </svg>
      {on && <span className="eq" aria-hidden="true"><i /><i /><i /></span>}
    </button>
  )
}

export default function Nav({ onPalette, path = '/' }) {
  const home = path === '/'
  const { t } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [current, setCurrent] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    const t = setTimeout(() => links.forEach(([id]) => { const el = document.getElementById(id); el && io.observe(el) }), 50)
    return () => { window.removeEventListener('scroll', onScroll); io.disconnect(); clearTimeout(t) }
  }, [path])

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <a href="/" className="logo" onClick={(e) => { if (home) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) } else onLink(e, '/') }}>
        <span className="logo-mark" lang="ja">ヨ</span>
        <span className="mono">{profile.handle}<span className="accent">.dev</span></span>
      </a>
      <nav className="nav-links mono">
        {links.map(([id, key]) => (
          <a key={id} href={home ? `#${id}` : `/#${id}`} onClick={(e) => !home && onLink(e, `/#${id}`)} className={home && current === id ? 'active' : ''}>{t(key)}</a>
        ))}
      </nav>
      <SoundToggle />
      <LangToggle />
      <button className="kbd-btn mono" onClick={onPalette} aria-label="Open command menu">
        <span className="kbd-desktop"><kbd>{isMac() ? '⌘' : 'Ctrl'}</kbd><kbd>K</kbd></span>
        <span className="kbd-mobile">{t('nav.menu')}</span>
      </button>
    </header>
  )
}
