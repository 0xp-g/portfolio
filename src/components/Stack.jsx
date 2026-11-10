import { useState } from 'react'
import Section from './Section.jsx'
import { projects, skillGroupsJa, skills } from '../data.js'
import { useLang } from '../i18n.jsx'

const usedIn = (skill) =>
  projects
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.tech.some((t) => t.toLowerCase() === skill.toLowerCase()))

export default function Stack({ onOpenProject }) {
  const { t, L, lang } = useLang()
  const [sel, setSel] = useState('Redis')
  const hits = usedIn(sel)

  return (
    <Section id="stack" index={4} k="stack">
      <p className="sec-intro reveal">{t('stack.intro')}</p>
      <div className="stack reveal">
        <div className="stack-groups">
          {Object.entries(skills).map(([group, items]) => (
            <div key={group} className="stack-group">
              <h3 className="mono">{lang === 'ja' ? skillGroupsJa[group] : group}</h3>
              <div className="chips">
                {items.map((s) => {
                  const n = usedIn(s).length
                  return (
                    <button
                      key={s}
                      className={`chip ${sel === s ? 'on' : ''} ${n ? 'used' : ''}`}
                      onClick={() => setSel(s)}
                      onMouseEnter={() => setSel(s)}
                      aria-pressed={sel === s}
                    >
                      {s}
                      {n > 0 && <sup className="mono">{n}</sup>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <aside className="stack-panel" aria-live="polite">
          <p className="mono stack-q">
            <span className="muted">$ grep -r</span> <span className="cyan">"{sel}"</span> <span className="muted">./projects</span>
          </p>
          {hits.length ? (
            <>
              <p className="stack-count">
                <b>{hits.length}</b> / {projects.length} {t('stack.systems')}
              </p>
              <div className="stack-meter" aria-hidden="true">
                {projects.map((p) => (
                  <i key={p.id} className={hits.some((h) => h.p.id === p.id) ? 'on' : ''} />
                ))}
              </div>
              <ul className="stack-hits">
                {hits.map(({ p, i }) => (
                  <li key={p.id}>
                    <button onClick={() => onOpenProject(i)}>
                      <span>{p.title}</span>
                      <span className="mono muted">{L(p, 'kind')}</span>
                      <span className="accent" aria-hidden="true">↗</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="stack-none">
              {t('stack.none')} <span className="muted">{t('stack.noneSub')}</span>
            </p>
          )}
        </aside>
      </div>
    </Section>
  )
}
