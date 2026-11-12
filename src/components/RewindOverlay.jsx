import { useEffect, useRef, useState } from 'react'
import { REWIND_SNAP, REWIND_SNAP_SHORT, isSoundOn, rewind, tryAutoplay, unlockAudio } from '../sound.js'
import { unlock } from '../achievements.js'
import { reducedMotion } from '../util.js'
import { useLang } from '../i18n.jsx'

// 死に戻り: the world drains of colour, a clock spins backwards,
// a snap, and you're back at the checkpoint.
// Trigger: window.dispatchEvent(new CustomEvent('return-by-death', { detail: { short, scroll, then, loop, gate } }))
// `gate` (used on page refresh): if sound is on but the browser hasn't allowed audio yet,
// hold on the opening frame until the visitor clicks, so the cue can play with sound.
export default function RewindOverlay() {
  const { t, lang } = useLang()
  const [run, setRun] = useState(null)
  const [gate, setGate] = useState(null)
  const timers = useRef([])

  useEffect(() => {
    const start = ({ short = false, scroll = true, then, loop } = {}) => {
      rewind(short)
      timers.current.forEach(clearTimeout)
      const snap = (short ? REWIND_SNAP_SHORT : REWIND_SNAP) * 1000
      const end = short ? 1500 : 2500
      setRun({ key: Date.now(), short, loop })
      document.body.classList.add('rewinding')
      timers.current = [
        setTimeout(() => {
          document.body.classList.remove('rewinding')
          document.body.classList.add('rewound')
          if (scroll) window.scrollTo({ top: 0, behavior: 'instant' })
          then?.()
        }, snap),
        setTimeout(() => { document.body.classList.remove('rewound'); setRun(null) }, end),
      ]
    }

    const on = async (e) => {
      const detail = e.detail || {}
      unlock('rbd')
      if (reducedMotion()) {
        if (detail.scroll !== false) window.scrollTo(0, 0)
        detail.then?.()
        return
      }
      if (detail.gate && isSoundOn()) {
        // grey the page right away so the refresh still feels like a "death"
        document.body.classList.add('rewinding')
        if (await tryAutoplay()) { start(detail); return }
        setGate(detail)
        return
      }
      start(detail)
    }

    const onGo = async (e) => {
      const detail = e.detail
      await unlockAudio()  // we're inside the visitor's click: audio may start now
      setGate(null)
      start(detail)
    }

    window.addEventListener('return-by-death', on)
    window.addEventListener('rbd-gate-go', onGo)
    return () => {
      window.removeEventListener('return-by-death', on)
      window.removeEventListener('rbd-gate-go', onGo)
      timers.current.forEach(clearTimeout)
    }
  }, [])

  // any click or key releases the gate
  useEffect(() => {
    if (!gate) return
    const go = (e) => {
      if (e.type === 'keydown' && ['Shift', 'Control', 'Alt', 'Meta', 'Tab'].includes(e.key)) return
      e.preventDefault()
      window.removeEventListener('pointerdown', go, true)
      window.removeEventListener('keydown', go, true)
      window.dispatchEvent(new CustomEvent('rbd-gate-go', { detail: gate }))
    }
    window.addEventListener('pointerdown', go, true)
    window.addEventListener('keydown', go, true)
    return () => { window.removeEventListener('pointerdown', go, true); window.removeEventListener('keydown', go, true) }
  }, [gate])

  if (gate) {
    return (
      <div className="rbd rbd-gate" role="button" tabIndex={0} aria-label={t('rbd.gate')}>
        <div className="rbd-vignette" />
        <div className="rbd-stage">
          <ClockFace />
          <span className="rbd-small mono">RETURN BY DEATH{gate.loop ? ` · LOOP #${gate.loop}` : ''}</span>
        </div>
        <p className="gate-hint">
          <span className="gate-pulse" aria-hidden="true" />
          {t('rbd.gate')}
          {lang === 'en' && <span className="mono" lang="ja">クリックで戻る</span>}
        </p>
      </div>
    )
  }

  if (!run) return null
  return (
    <div className={`rbd ${run.short ? 'short' : ''}`} key={run.key} aria-hidden="true">
      <div className="rbd-vignette" />
      <div className="rbd-stage">
        <div className="rbd-particles">
          {PARTICLES.map((p, i) => (
            <i key={i} style={{ '--a': `${p.a}deg`, '--i': i, '--s': p.s }} />
          ))}
        </div>
        <svg className="rbd-echo e1" viewBox="0 0 400 400"><EchoFace /></svg>
        <svg className="rbd-echo e2" viewBox="0 0 400 400"><EchoFace /></svg>
        <ClockFace />
        <span className="rbd-small mono">RETURN BY DEATH{run.loop ? ` · LOOP #${run.loop}` : ''}</span>
        <div className="rbd-shock" />
      </div>
      <div className="rbd-flash" />
      <div className="rbd-title">
        <span className="rbd-big" lang="ja">死に戻り</span>
        <span className="rbd-sub mono">RETURN BY DEATH</span>
      </div>
    </div>
  )
}

function ClockFace() {
  return (
    <svg className="rbd-clock" viewBox="0 0 400 400">
      <defs>
        <path id="rbd-ring-path" d="M200,200 m-183,0 a183,183 0 1,1 366,0 a183,183 0 1,1 -366,0" />
        <radialGradient id="rbd-face-grad" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#2a1650" />
          <stop offset="65%" stopColor="#120a22" />
          <stop offset="100%" stopColor="#07040e" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="196" className="rc-band" />
      <circle cx="200" cy="200" r="196" className="rc-rim" />
      <circle cx="200" cy="200" r="172" fill="url(#rbd-face-grad)" className="rc-face" />
      <g className="rc-textring">
        <text className="rc-ringtext"><textPath href="#rbd-ring-path" startOffset="0">{RING_TEXT}</textPath></text>
      </g>
      <g className="rc-ticks">
        {TICKS.map((t) => <line key={t.i} x1="200" y1={t.major ? 32 : 36} x2="200" y2="46" transform={`rotate(${t.i * 6} 200 200)`} className={t.major ? 'major' : ''} />)}
      </g>
      <circle cx="200" cy="200" r="112" className="rc-inner" />
      <g className="rc-numerals">
        {NUMERALS.map((n) => <text key={n.k} x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central">{n.k}</text>)}
      </g>
      <g className="rc-cracks">
        {CRACKS.map((d, i) => <polyline key={i} points={d} style={{ '--i': i }} />)}
      </g>
      {/* hands: each spins backwards, accelerating toward the hit */}
      <g className="rc-hand rc-hour"><path d="M200 214 L193 200 L200 112 L207 200 Z" /></g>
      <g className="rc-hand rc-min"><path d="M200 222 L195.5 200 L200 64 L204.5 200 Z" /></g>
      <g className="rc-hand rc-sec">
        <g className="rc-trail">
          {[1, 2, 3, 4, 5, 6].map((k) => <line key={k} x1="200" y1="200" x2="200" y2="42" transform={`rotate(${k * 7} 200 200)`} style={{ opacity: 0.5 - k * 0.075 }} />)}
        </g>
        <line x1="200" y1="236" x2="200" y2="40" className="rc-sec-line" />
        <circle cx="200" cy="236" r="6" className="rc-sec-weight" />
      </g>
      <circle cx="200" cy="200" r="9" className="rc-pin" />
      <circle cx="200" cy="200" r="3.5" className="rc-pin-core" />
    </svg>
  )
}

function EchoFace() {
  return (
    <>
      <circle cx="200" cy="200" r="190" />
      {TICKS.filter((t) => t.major).map((t) => <line key={t.i} x1="200" y1="14" x2="200" y2="34" transform={`rotate(${t.i * 6} 200 200)`} />)}
    </>
  )
}

const TICKS = Array.from({ length: 60 }, (_, i) => ({ i, major: i % 5 === 0 }))
const KANJI = ['十二', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一']
const NUMERALS = KANJI.map((k, i) => {
  const a = (i * 30 * Math.PI) / 180
  return { k, x: 200 + Math.sin(a) * 140, y: 200 - Math.cos(a) * 140 }
})
const RING_TEXT = '死に戻り ✦ RETURN BY DEATH ✦ 死に戻り ✦ RETURN BY DEATH ✦ 死に戻り ✦ RETURN BY DEATH ✦ '
// deterministic jagged "glass" cracks radiating from the centre
const CRACKS = Array.from({ length: 7 }, (_, k) => {
  const base = k * (360 / 7) + 17
  const pts = []
  for (let j = 0; j <= 6; j++) {
    const r = 18 + j * 30
    const jitter = Math.sin(k * 12.9898 + j * 78.233) * 9
    const a = ((base + jitter) * Math.PI) / 180
    pts.push(`${(200 + Math.sin(a) * r).toFixed(1)},${(200 - Math.cos(a) * r).toFixed(1)}`)
  }
  return pts.join(' ')
})
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({ a: (i * 137.5) % 360, s: 0.6 + ((i * 7) % 5) / 6 }))
