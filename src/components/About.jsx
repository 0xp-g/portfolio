import { useEffect, useRef, useState } from 'react'
import Section from './Section.jsx'
import { character, profile, stats } from '../data.js'
import { useLang } from '../i18n.jsx'
import { limitBreak, reducedMotion } from '../util.js'

function Stat({ value, decimals = 0, suffix = '', text, label, note, ja }) {
  const { lang } = useLang()
  const ref = useRef(null)
  const [shown, setShown] = useState(text ? null : reducedMotion() ? value : 0)

  useEffect(() => {
    if (text || reducedMotion()) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const step = (now) => {
        const p = Math.min((now - start) / 1400, 1)
        setShown(value * (1 - Math.pow(1 - p, 3)))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, { threshold: 0.4 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [value, text])

  return (
    <div className="stat" ref={ref}>
      <p className="stat-value">
        {text ?? shown.toFixed(decimals)}
        <span className="accent">{suffix}</span>
      </p>
      <p className="stat-label mono">{lang === 'ja' ? ja.label : label}</p>
      <p className="stat-note">{lang === 'ja' ? ja.note : note}</p>
    </div>
  )
}

function Radar({ data, lang }) {
  const ref = useRef(null)
  const [grow, setGrow] = useState(reducedMotion())
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGrow(true); io.disconnect() } }, { threshold: 0.4 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  const size = 260, c = size / 2, R = 92
  const pt = (i, r) => {
    const a = (Math.PI * 2 * i) / data.length - Math.PI / 2
    return [c + Math.cos(a) * r, c + Math.sin(a) * r]
  }
  const ring = (f) => data.map((_, i) => pt(i, R * f).join(',')).join(' ')
  const poly = data.map(([, , v], i) => pt(i, (R * v) / 100).join(',')).join(' ')

  return (
    <svg ref={ref} viewBox={`0 0 ${size} ${size}`} className="radar" role="img"
      aria-label={data.map(([en, ja, v]) => `${lang === 'ja' ? ja : en} ${v}`).join(', ')}>
      {[0.25, 0.5, 0.75, 1].map((f) => <polygon key={f} points={ring(f)} className="radar-ring" />)}
      {data.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={c} y1={c} x2={x} y2={y} className="radar-axis" /> })}
      <g className={`radar-shape ${grow ? 'grow' : ''}`} style={{ transformOrigin: `${c}px ${c}px` }}>
        <polygon points={poly} className="radar-fill" />
        {data.map(([, , v], i) => { const [x, y] = pt(i, (R * v) / 100); return <circle key={i} cx={x} cy={y} r="3" className="radar-dot" /> })}
      </g>
      {data.map(([en, ja, v], i) => {
        const [x, y] = pt(i, R + 22)
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="radar-label">
            <tspan>{lang === 'ja' ? ja : en}</tspan>
            <tspan x={x} dy="12" className="radar-val">{v}</tspan>
          </text>
        )
      })}
    </svg>
  )
}

function CharacterSheet() {
  const { t, lang } = useLang()
  return (
    <div className="charsheet">
      <div className="cs-head">
        <span className="cs-tag mono">{t('char.title')}</span>
        <span className="cs-kana" lang="ja">{profile.kana}</span>
      </div>
      <h3 className="cs-name">{profile.name}</h3>
      <dl className="cs-fields">
        {character.fields.map(([k, v, kj, vj]) => (
          <div key={k}>
            <dt className="mono">{lang === 'ja' ? kj : k}</dt>
            <dd>{lang === 'ja' ? vj : v}</dd>
          </div>
        ))}
      </dl>
      <div className="cs-split">
        <div>
          <p className="cs-sub mono">{t('char.stats')} <span className="muted">· {t('char.statsNote')}</span></p>
          <Radar data={character.radar} lang={lang} />
        </div>
        <div>
          <p className="cs-sub mono">{t('char.moves')}</p>
          <ul className="cs-moves">
            {character.moves.map((m) => (
              <li key={m.name}>
                <span className="move-name">{lang === 'ja' ? m.jp : m.name}</span>
                <span className="move-jp" lang={lang === 'ja' ? 'en' : 'ja'}>{lang === 'ja' ? m.name : m.jp}</span>
                <span className="move-desc">{lang === 'ja' ? m.jaDesc : m.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button className="limit-btn mono" onClick={limitBreak}>
        <span aria-hidden="true">⚡</span> {t('char.limit')} <span className="muted">↑↑↓↓←→←→BA</span>
      </button>
    </div>
  )
}

export default function About() {
  const { L } = useLang()
  return (
    <Section id="about" index={1} k="about">
      <div className="about reveal">
        <div className="about-text">
          {L(profile, 'about').map((p, i) => (
            <p key={i} className={i === 0 ? 'lead' : ''}>{p}</p>
          ))}
          <div className="stats">
            {stats.map((s) => <Stat key={s.label} {...s} />)}
          </div>
        </div>
        <CharacterSheet />
      </div>
    </Section>
  )
}
