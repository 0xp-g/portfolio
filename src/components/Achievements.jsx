import { useEffect, useRef, useState } from 'react'
import { ACHIEVEMENTS, useAchievements } from '../achievements.js'
import { useLang } from '../i18n.jsx'
import { chime } from '../sound.js'

export function AchievementToasts() {
  const { t, lang } = useLang()
  const [queue, setQueue] = useState([])

  useEffect(() => {
    const on = (e) => {
      const a = ACHIEVEMENTS.find((x) => x.id === e.detail.id)
      if (!a) return
      chime()
      const key = Date.now() + Math.random()
      setQueue((q) => [...q, { ...a, key }])
      setTimeout(() => setQueue((q) => q.filter((x) => x.key !== key)), 3800)
    }
    window.addEventListener('achievement', on)
    return () => window.removeEventListener('achievement', on)
  }, [])

  return (
    <div className="ach-toasts" role="status" aria-live="polite">
      {queue.map((a) => (
        <button key={a.key} className="ach-toast" onClick={() => setQueue((q) => q.filter((x) => x.key !== a.key))}>
          <span className="ach-icon mono">{a.icon}</span>
          <span className="ach-body">
            <span className="ach-label mono">{t('ach.title')} · <span lang="ja">実績解除</span></span>
            <span className="ach-name">{lang === 'ja' ? a.ja : a.en}</span>
            <span className="ach-hint">{lang === 'ja' ? a.jaHint : a.hint}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

export function AchievementBadge() {
  const { t, lang } = useLang()
  const have = useAchievements()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [open])

  return (
    <div className="ach-badge" ref={ref}>
      <button className="ach-btn mono" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        ★ {have.length}/{ACHIEVEMENTS.length} {t('ach.progress')}
      </button>
      {open && (
        <div className="ach-panel" role="dialog" aria-label={t('ach.progress')}>
          <div className="ach-meter"><i style={{ width: `${(have.length / ACHIEVEMENTS.length) * 100}%` }} /></div>
          <ul>
            {ACHIEVEMENTS.map((a) => {
              const got = have.includes(a.id)
              return (
                <li key={a.id} className={got ? 'got' : ''}>
                  <span className="ach-icon mono">{got ? a.icon : '·'}</span>
                  <span>
                    <b>{got ? (lang === 'ja' ? a.ja : a.en) : t('ach.locked')}</b>
                    <small>{lang === 'ja' ? a.jaHint : a.hint}</small>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
