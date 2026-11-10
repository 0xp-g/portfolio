import { Fragment, useEffect, useState } from 'react'
import { profile, projects } from '../data.js'
import { cases } from '../cases.js'
import { useLang } from '../i18n.jsx'
import { onLink } from '../router.js'
import { unlock } from '../achievements.js'
import { reducedMotion } from '../util.js'

function ArchFlow({ steps }) {
  const still = reducedMotion()
  const [active, setActive] = useState(still ? steps.length : 0)
  useEffect(() => {
    if (still) return
    const t = setInterval(() => setActive((a) => (a + 1) % (steps.length + 2)), 1100)
    return () => clearInterval(t)
  }, [steps, still])

  return (
    <ol className="arch">
      {steps.map(([node, title, desc], i) => (
        <Fragment key={node + i}>
          <li className={`arch-step ${active >= i ? 'lit' : ''} ${active === i ? 'now' : ''}`}>
            <span className="arch-node mono">{node}</span>
            <div>
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          </li>
          {i < steps.length - 1 && <li aria-hidden="true" className={`arch-link ${active === i ? 'flow' : ''} ${active > i ? 'done' : ''}`} />}
        </Fragment>
      ))}
    </ol>
  )
}

export default function CaseStudy({ id }) {
  const { t, L, lang } = useLang()
  const idx = projects.findIndex((p) => p.id === id)
  const p = projects[idx]
  const c = cases[id]
  const prev = projects[(idx - 1 + projects.length) % projects.length]
  const next = projects[(idx + 1) % projects.length]
  const metricLabels = lang === 'ja' ? p.ja.metrics : p.metrics.map((m) => m.k)

  useEffect(() => {
    unlock('archivist')
    document.title = `${p.title} · ${t('case.file')} · ${profile.name}`
  }, [p, t])

  return (
    <article className="case">
      <header className="case-hero">
        <div className="case-halftone" aria-hidden="true" />
        <a href="/#projects" className="case-back mono" onClick={(e) => onLink(e, '/#projects')}>{t('case.back')}</a>
        <div className="case-file mono">
          <span className="cf-box">{t('case.file')} #{String(idx + 1).padStart(2, '0')}</span>
          <span lang="ja">事件簿</span>
          <span className="muted">{L(p, 'kind')}</span>
        </div>
        <h1 className="case-title">{p.title}</h1>
        <p className="case-tagline">{L(p, 'tagline')}</p>
        <div className="case-actions">
          <a className="btn btn-primary" href={p.repo} target="_blank" rel="noreferrer">{t('case.source')} ↗</a>
          <ul className="tags mono">{p.tech.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        {t('case.enOnly') && <p className="case-note mono">{t('case.enOnly')}</p>}
      </header>

      <section className="case-sec reveal">
        <h2 className="case-h"><span className="mono">01</span> {t('case.problem')}</h2>
        <blockquote className="case-problem">{c.problem}</blockquote>
      </section>

      <section className="case-sec reveal">
        <h2 className="case-h"><span className="mono">02</span> {t('case.how')}</h2>
        <ArchFlow steps={c.steps} />
      </section>

      <section className="case-sec reveal">
        <h2 className="case-h"><span className="mono">03</span> {t('case.decisions')}</h2>
        <div className="decisions">
          {c.decisions.map((d, i) => (
            <div key={d.title} className="decision">
              <span className="dec-n mono">{t('case.decision')} {String(i + 1).padStart(2, '0')}</span>
              <h3>{d.title}</h3>
              <p><b className="mono">{t('case.why')}</b> {d.why}</p>
              <p className="dec-trade"><b className="mono">{t('case.tradeoff')}</b> {d.tradeoff}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="case-sec reveal">
        <h2 className="case-h"><span className="mono">04</span> {t('case.numbers')}</h2>
        <div className="proj-metrics case-metrics">
          {p.metrics.map((m, i) => (
            <div key={m.k}><b>{m.v}</b><span className="mono">{metricLabels[i]}</span></div>
          ))}
        </div>
        <ul className="proj-points">{L(p, 'points').map((pt, i) => <li key={i}>{pt}</li>)}</ul>
      </section>

      <section className="case-sec reveal">
        <h2 className="case-h"><span className="mono">05</span> {t('case.retro')}</h2>
        <ol className="retro">
          {c.retro.map((r, i) => <li key={i}><span className="mono accent">↺ {i + 1}</span> {r}</li>)}
        </ol>
      </section>

      <nav className="case-nav reveal" aria-label="More case studies">
        <a href={`/projects/${prev.id}`} onClick={(e) => onLink(e, `/projects/${prev.id}`)}>
          <span className="mono muted">◀ {t('case.prev')}</span>
          <b>{prev.title}</b>
        </a>
        <a href={`/projects/${next.id}`} onClick={(e) => onLink(e, `/projects/${next.id}`)} className="next">
          <span className="mono muted">{t('case.next')} ▶</span>
          <b>{next.title}</b>
        </a>
      </nav>
    </article>
  )
}
