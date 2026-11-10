import { useEffect, useMemo, useState } from 'react'
import { profile } from '../data.js'
import { useLang } from '../i18n.jsx'
import { describeEvent, timeAgo, useGitHubEvents } from '../github.js'
import { isMac, reducedMotion } from '../util.js'
import NetworkCanvas from './NetworkCanvas.jsx'
import MiasmaFog from './MiasmaFog.jsx'
import Pleiades from './Pleiades.jsx'
import Scramble from './Scramble.jsx'

function useRotator(words) {
  const [state, setState] = useState({ i: 0, len: words[0].length, del: false })
  useEffect(() => { setState({ i: 0, len: words[0].length, del: false }) }, [words])
  useEffect(() => {
    if (reducedMotion()) return
    const word = words[state.i] ?? ''
    let delay = state.del ? 35 : 70
    if (!state.del && state.len === word.length) delay = 1800
    const t = setTimeout(() => {
      setState((s) => {
        const w = words[s.i] ?? ''
        if (!s.del && s.len >= w.length) return { ...s, del: true }
        if (s.del && s.len <= 0) return { i: (s.i + 1) % words.length, len: 0, del: false }
        return { ...s, len: s.len + (s.del ? -1 : 1) }
      })
    }, delay)
    return () => clearTimeout(t)
  }, [state, words])
  return (words[state.i] ?? '').slice(0, state.len)
}

const SIM_LOGS = [
  ['celery', 'task clone_repo[7f3a] succeeded · 1.8s'],
  ['ast', 'parsed 1,284 functions · 312 classes'],
  ['pgvector', 'top_k=8 retrieved · 41ms'],
  ['deploy', 'build #42 → live, 3 artifacts to minio'],
  ['ws', 'queue:counter-3 · position → 4 · eta 6m'],
  ['opsflow', 'INC-118 resolved · postmortem drafted'],
  ['redis', 'pub queue.events · 1.2k msg/s'],
  ['rag', 'answer cited src/worker.py:L88-L131'],
]

function HeroLog() {
  const { lang } = useLang()
  const { status, data } = useGitHubEvents(profile.githubUser)
  const [tick, setTick] = useState(4)

  // Real GitHub events (marked live) interleaved with system chatter.
  const feed = useMemo(() => {
    const real = status === 'ok' && Array.isArray(data)
      ? data.slice(0, 6).map((e) => {
          const d = describeEvent(e)
          return { src: 'github', msg: `${d.text} · ${d.repo} · ${timeAgo(e.created_at, lang)}`, live: true }
        })
      : []
    const sim = SIM_LOGS.map(([src, msg]) => ({ src, msg }))
    if (!real.length) return sim
    const out = []
    sim.forEach((s, i) => { out.push(s); if (real[i]) out.push(real[i]) })
    return out
  }, [status, data, lang])

  useEffect(() => {
    if (reducedMotion()) return
    const t = setInterval(() => setTick((n) => n + 1), 1500)
    return () => clearInterval(t)
  }, [])

  const rows = Array.from({ length: 5 }, (_, k) => {
    const n = tick - 4 + k
    return { n, entry: feed[n % feed.length] }
  })
  return (
    <div className="hero-log mono" aria-hidden="true">
      <div className="hero-log-head">
        <span className="pulse-dot" /> live · system log
        {status === 'ok' && <span className="gh-chip">+ github api</span>}
      </div>
      {rows.map(({ n, entry }) => (
        <p key={n} className={entry.live ? 'live' : ''}>
          <span className="log-src">[{entry.src}]</span> {entry.msg}
        </p>
      ))}
    </div>
  )
}

export default function Hero({ onPalette }) {
  const { t, L, lang } = useLang()
  const roles = L(profile, 'roles')
  const role = useRotator(roles)
  return (
    <section id="top" className="hero">
      <MiasmaFog />
      <NetworkCanvas />
      <div className="hero-fade" aria-hidden="true" />
      <div className="halftone" aria-hidden="true" />

      <div className="hero-inner">
        <p className="eyebrow mono">
          <span className="pulse-dot" /> {L(profile, 'status')}
        </p>
        <h1 className="hero-name">
          <Scramble text="YOGESH" delay={250} />
          <Scramble text="O K" delay={550} className="outline" />
          <span className="sfx" lang="ja" aria-hidden="true">ドドド</span>
        </h1>
        <p className="hero-role mono">
          <span className="muted">{t('hero.builds')}</span> <span className="cyan">{role}</span>
          <span className="caret" />
        </p>
        <p className="hero-tagline" lang={lang}>{L(profile, 'tagline')}</p>
        <div className="hero-cta">
          <a href="#projects" className="btn btn-primary">{t('hero.explore')} <span aria-hidden="true">↓</span></a>
          <button className="btn btn-ghost mono" onClick={onPalette}>
            <kbd>{isMac() ? '⌘' : 'Ctrl'}</kbd><kbd>K</kbd> {t('hero.menu')}
          </button>
        </div>
      </div>

      <Pleiades />
      <div className="hero-kana" lang="ja" aria-hidden="true">{profile.kana}</div>
      <HeroLog />
      <div className="hero-coords mono" aria-hidden="true">
        {profile.coords} · {L(profile, 'location')}
      </div>
      <a href="#about" className="scroll-cue mono" aria-label="Scroll to about">scroll</a>
    </section>
  )
}
