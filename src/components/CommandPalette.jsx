import { useEffect, useMemo, useRef, useState } from 'react'
import { profile, projects } from '../data.js'
import { eyecatch, limitBreak, scrollToId } from '../util.js'
import { navigate } from '../router.js'
import { isSoundOn, setSound } from '../sound.js'
import { unlock } from '../achievements.js'
import { useLang } from '../i18n.jsx'

export default function CommandPalette({ open, onClose, onOpenProject }) {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef(null)
  const [toast, setToast] = useState('')
  const { lang, setLang } = useLang()

  const items = useMemo(() => {
    const go = (id) => () => (window.location.pathname === '/' ? scrollToId(id) : navigate(`/#${id}`))
    return [
      { group: 'Navigate', label: 'About', icon: '§', run: go('about') },
      { group: 'Navigate', label: 'Projects', icon: '§', run: go('projects') },
      { group: 'Navigate', label: 'Break my system (stress test)', icon: '§', run: go('stress') },
      { group: 'Navigate', label: 'Stack explorer', icon: '§', run: go('stack') },
      { group: 'Navigate', label: 'Experience', icon: '§', run: go('log') },
      { group: 'Navigate', label: 'Live GitHub activity', icon: '§', run: go('activity') },
      { group: 'Navigate', label: 'Contact', icon: '§', run: go('contact') },
      {
        group: 'Navigate', label: 'Open the terminal', icon: '>_',
        run: () => { go('terminal')(); setTimeout(() => window.dispatchEvent(new Event('focus-terminal')), 600) },
      },
      ...projects.map((p, i) => ({ group: 'Projects', label: p.title, hint: p.kind, icon: '◆', run: () => onOpenProject(i) })),
      ...projects.map((p) => ({ group: 'Case studies', label: `${p.title}: case study`, hint: '事件簿', icon: '📜', run: () => navigate(`/projects/${p.id}`) })),
      {
        group: 'Actions', label: 'Copy email address', hint: profile.email, icon: '@',
        run: () => navigator.clipboard?.writeText(profile.email).then(() => flash('email copied ✓')).catch(() => {}),
      },
      { group: 'Actions', label: 'Send an email', icon: '✉', run: () => (window.location.href = `mailto:${profile.email}`) },
      {
        group: 'Actions', label: lang === 'en' ? '日本語に切り替え' : 'Switch to English', hint: 'EN ⇄ 日本語', icon: '文',
        run: () => { const to = lang === 'en' ? 'ja' : 'en'; eyecatch(to === 'ja' ? '日本語' : 'English', to === 'ja' ? 'SWITCHING LANGUAGE' : '言語を切り替え中', () => setLang(to)) },
      },
      { group: 'Actions', label: 'Limit break', hint: '限界突破', icon: '⚡', run: limitBreak },
      { group: 'Actions', label: 'Return by death', hint: '死に戻り', icon: '↺', run: () => window.dispatchEvent(new CustomEvent('return-by-death')) },
      { group: 'Actions', label: isSoundOn() ? 'Turn sound off' : 'Turn sound on', hint: '♪ synthesized', icon: '♪', run: () => { const on = !isSoundOn(); setSound(on); if (on) unlock('sound') } },
      { group: 'Links', label: 'GitHub', hint: '0xp-g', icon: '↗', run: () => window.open(profile.github, '_blank', 'noopener') },
      { group: 'Links', label: 'LinkedIn', icon: '↗', run: () => window.open(profile.linkedin, '_blank', 'noopener') },
      { group: 'Links', label: 'Resume (PDF)', icon: '↓', run: () => window.open(profile.resumeUrl, '_blank', 'noopener') },
    ]
  }, [onOpenProject, lang, setLang, open])

  function flash(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 1600)
  }

  const filtered = items.filter((it) =>
    `${it.group} ${it.label} ${it.hint || ''}`.toLowerCase().includes(q.trim().toLowerCase())
  )

  useEffect(() => {
    if (open) {
      setQ('')
      setIdx(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  useEffect(() => setIdx(0), [q])

  const run = (it) => {
    onClose()
    setTimeout(it.run, 60)
  }

  const onKey = (e) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && filtered[idx]) run(filtered[idx])
  }

  return (
    <>
      {toast && <div className="toast mono" role="status">{toast}</div>}
      {open && (
        <div className="pal-backdrop" onMouseDown={onClose}>
          <div className="pal" role="dialog" aria-modal="true" aria-label="Command menu" onMouseDown={(e) => e.stopPropagation()}>
            <div className="pal-input">
              <span className="accent mono">❯</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="Jump to a section, project or link…"
                aria-label="Search commands"
              />
              <kbd className="mono">esc</kbd>
            </div>
            <ul className="pal-list" role="listbox">
              {filtered.length === 0 && <li className="pal-empty mono">no results for “{q}”</li>}
              {filtered.map((it, i) => (
                <li key={it.group + it.label}>
                  {(i === 0 || filtered[i - 1].group !== it.group) && <p className="pal-group mono">{it.group}</p>}
                  <button
                    role="option"
                    aria-selected={i === idx}
                    className={i === idx ? 'sel' : ''}
                    onMouseEnter={() => setIdx(i)}
                    onClick={() => run(it)}
                  >
                    <span className="pal-icon mono">{it.icon}</span>
                    <span>{it.label}</span>
                    {it.hint && <span className="pal-hint mono">{it.hint}</span>}
                  </button>
                </li>
              ))}
            </ul>
            <div className="pal-foot mono">
              <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
              <span><kbd>↵</kbd> select</span>
              <span>tip: press <kbd>/</kbd> anywhere</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
