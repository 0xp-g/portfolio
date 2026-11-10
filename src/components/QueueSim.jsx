import { useCallback, useEffect, useRef, useState } from 'react'
import Section from './Section.jsx'
import { projects } from '../data.js'
import { useLang } from '../i18n.jsx'
import { isOverdrive, reducedMotion } from '../util.js'
import { unlock } from '../achievements.js'

// In-browser toy model of QueueLess: arrivals, counters, no-shows,
// and a rolling (EWMA) service-rate estimate that predicts wait times.
// 1 real second = 1 simulated minute.

const TXT = {
  en: {
    intro: 'A live, in-browser model of QueueLess. Flood it, take counters away, unleash no-shows, and watch the wait-time predictor adapt.',
    join: '+1 join', rush: '+25 rush', stampede: '+100 stampede', counters: 'counters', speed: 'staff speed',
    noshow: 'no-show chaos', auto: 'auto arrivals', reset: '↺ return to checkpoint',
    q: 'in queue', served: 'served', thr: 'throughput', rate: 'est. service rate', eta: 'ETA for next joiner', err: 'prediction error',
    perMin: '/min', min: 'min', events: 'websocket events', chart: 'predicted vs actual wait (min)', pred: 'predicted', act: 'actual',
    note: 'Toy simulation of the real logic. The production version runs on FastAPI + Redis + WebSockets:', src: 'source',
    learning: 'learning…', counter: 'counter', paused: 'paused · scroll here to resume',
  },
  ja: {
    intro: 'ブラウザ上で動くQueueLessのモデルです。人を殺到させたり、窓口を減らしたり、不在者を発生させたりして、待ち時間予測が適応する様子を見てください。',
    join: '+1 参加', rush: '+25 殺到', stampede: '+100 大混雑', counters: '窓口数', speed: 'スタッフ速度',
    noshow: '不在者カオス', auto: '自動来客', reset: '↺ チェックポイントに戻る',
    q: '待機中', served: '対応済み', thr: 'スループット', rate: '推定処理速度', eta: '次の人の予測待ち時間', err: '予測誤差',
    perMin: '/分', min: '分', events: 'WebSocketイベント', chart: '予測と実際の待ち時間（分）', pred: '予測', act: '実際',
    note: '実際のロジックを簡略化したシミュレーションです。本番版は FastAPI + Redis + WebSocket で動作：', src: 'ソース',
    learning: '学習中…', counter: '窓口', paused: '一時停止中・スクロールで再開',
  },
}

const SLOT = 15
const expo = (mean) => -Math.log(1 - Math.random()) * mean
// Erlang-3 service times: random, but less wild than pure exponential (like real counters)
const serviceTime = (mean) => (expo(mean) + expo(mean) + expo(mean)) / 3

function makeSim() {
  return {
    t: 0, nextId: 1, queue: [], counters: [], leaving: [], served: 0,
    meanDur: 4, // rolling mean service time (min). Deliberately wrong prior (true ≈ 2) so you can watch it learn
    rateEst: 0.25, // = 1 / meanDur, per counter per minute
    errors: [], points: [], events: [], completions: [],
    nCounters: 3, speed: 1, noShow: false, auto: true, arrivalAcc: 0,
  }
}

export default function QueueSim() {
  const { lang } = useLang()
  const x = TXT[lang]
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const sim = useRef(makeSim())
  const [ui, setUi] = useState({ q: 0, served: 0, thr: 0, rate: 0.3, eta: 0, err: null, events: [], points: [] })
  const [ctl, setCtl] = useState({ nCounters: 3, speed: 1, noShow: false, auto: true })
  const [visible, setVisible] = useState(false)
  const qlProject = projects.find((p) => p.id === 'queue_less')

  const log = (msg, kind = '') => {
    const s = sim.current
    s.events.unshift({ id: Math.random(), t: s.t, msg, kind })
    s.events.length = Math.min(s.events.length, 7)
  }

  const predictWait = (ahead) => {
    const s = sim.current
    return (ahead + 1) / Math.max(0.01, s.rateEst * s.nCounters)
  }

  const join = useCallback((n) => {
    const s = sim.current
    const W = canvasRef.current?.clientWidth || 600
    for (let i = 0; i < n; i++) {
      const pred = predictWait(s.queue.length)
      s.queue.push({
        id: s.nextId++, joinedAt: s.t, pred, noShow: s.noShow && Math.random() < 0.18,
        x: -10 - Math.random() * 60, y: 40 + Math.random() * 200, born: s.t, fresh: 1,
      })
    }
    if (n === 1) log(`queue.join #${s.nextId - 1} · pos=${s.queue.length} · eta=${predictWait(s.queue.length - 1).toFixed(1)}m`)
    else log(`queue.bulk_join ×${n} · len=${s.queue.length} · broadcast→${s.queue.length} clients`, n >= 100 ? 'hot' : '')
    void W
  }, [])

  const reset = () => {
    const keep = { nCounters: ctl.nCounters, speed: ctl.speed, noShow: ctl.noShow, auto: ctl.auto }
    window.dispatchEvent(new CustomEvent('return-by-death', {
      detail: {
        short: true, scroll: false,
        then: () => {
          sim.current = { ...makeSim(), ...keep }
          log('checkpoint restored · state rolled back to zero', 'ok')
        },
      },
    }))
  }

  useEffect(() => { Object.assign(sim.current, ctl) }, [ctl])

  // pause when off-screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 })
    io.observe(wrapRef.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const still = reducedMotion()
    let raf = 0, last = 0, uiAcc = 0, W = 0, H = 0

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2)
      W = canvas.clientWidth; H = canvas.clientHeight
      canvas.width = W * dpr; canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const step = (dtMin) => {
      const s = sim.current
      s.t += dtMin
      // counters array follows nCounters
      while (s.counters.length < s.nCounters) s.counters.push({ person: null, until: 0, start: 0 })
      if (s.counters.length > s.nCounters) {
        s.counters.slice(s.nCounters).forEach((c) => c.person && s.queue.unshift(c.person))
        s.counters.length = s.nCounters
      }
      // auto arrivals (Poisson-ish)
      if (s.auto) {
        s.arrivalAcc += dtMin * (isOverdrive() ? 4 : 0.9)
        while (s.arrivalAcc >= 1) { s.arrivalAcc -= 1; if (Math.random() < 0.9) join(1) }
      }
      // service
      s.counters.forEach((c, ci) => {
        if (c.person && s.t >= c.until) {
          const p = c.person
          const dur = s.t - c.start
          if (p.noShow) {
            log(`no-show #${p.id} · called ×3 · skipped, positions shifted`, 'err')
          } else {
            // EWMA over durations, then invert. (Averaging 1/duration would be badly biased.)
            s.meanDur = s.meanDur * 0.88 + dur * 0.12
            s.rateEst = 1 / s.meanDur
            const actual = c.start - p.joinedAt
            const e = Math.abs(p.pred - actual) / Math.max(actual, 1)
            s.errors.push(e); if (s.errors.length > 30) s.errors.shift()
            s.points.push([p.pred, actual]); if (s.points.length > 40) s.points.shift()
            s.served++
            s.completions.push(s.t)
            if (s.served % 3 === 0) log(`served #${p.id} @ ${ci + 1} · waited ${actual.toFixed(1)}m (pred ${p.pred.toFixed(1)}m)`)
          }
          s.leaving.push({ ...p, life: 1, done: !p.noShow })
          c.person = null
        }
        if (!c.person && s.queue.length) {
          const p = s.queue.shift()
          c.person = p
          c.start = s.t
          c.until = s.t + (p.noShow ? 0.8 : serviceTime(2 / s.speed))
        }
      })
      s.completions = s.completions.filter((tc) => s.t - tc < 5)
    }

    const draw = () => {
      const s = sim.current
      const od = isOverdrive()
      ctx.clearRect(0, 0, W, H)
      const cW = Math.min(112, W * 0.26)
      const cx = W - cW - 12
      const ch = Math.min(56, (H - 30) / Math.max(s.counters.length, 1) - 8)
      // lane
      const laneRight = cx - 26
      const cols = Math.max(4, Math.floor((laneRight - 16) / SLOT))
      const rows = Math.max(1, Math.floor((H - 36) / SLOT))
      ctx.strokeStyle = 'rgba(150,160,190,0.08)'
      ctx.setLineDash([3, 5])
      for (let r = 0; r < rows; r++) {
        ctx.beginPath(); ctx.moveTo(16, 26 + r * SLOT); ctx.lineTo(laneRight, 26 + r * SLOT); ctx.stroke()
      }
      ctx.setLineDash([])
      // counters
      s.counters.forEach((c, i) => {
        const y = 16 + i * (ch + 8)
        ctx.fillStyle = c.person ? 'rgba(155,92,255,0.10)' : 'rgba(24,16,39,0.9)'
        ctx.strokeStyle = c.person ? 'rgba(155,92,255,0.6)' : 'rgba(51,38,77,1)'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.roundRect(cx, y, cW, ch, 8); ctx.fill(); ctx.stroke()
        ctx.fillStyle = 'rgba(160,170,190,0.9)'
        ctx.font = '10px "JetBrains Mono", monospace'
        ctx.fillText(`${x.counter} ${i + 1}`, cx + 10, y + 16)
        if (c.person) {
          const pr = Math.min(1, (s.t - c.start) / Math.max(c.until - c.start, 0.01))
          ctx.fillStyle = c.person.noShow ? 'rgba(255,123,114,0.9)' : 'rgba(155,92,255,0.9)'
          ctx.fillRect(cx + 10, y + ch - 12, (cW - 20) * pr, 3)
          c.person.tx = cx + cW - 20; c.person.ty = y + 14
        }
      })
      // queue targets: serpentine with head nearest the counters
      s.queue.forEach((p, i) => {
        const r = Math.floor(i / cols), k = i % cols
        const col = r % 2 === 0 ? k : cols - 1 - k
        if (r < rows) { p.tx = laneRight - col * SLOT; p.ty = 26 + r * SLOT }
        else { p.tx = 18; p.ty = 26 + (rows - 1) * SLOT }
      })
      const ease = od ? 0.3 : 0.16
      const dot = (p, color, rad = 4.5, alpha = 1) => {
        p.x += (p.tx - p.x) * ease; p.y += (p.ty - p.y) * ease
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
      }
      const visibleQ = s.queue.slice(0, cols * rows)
      visibleQ.forEach((p) => {
        p.fresh = Math.max(0, (p.fresh || 0) - 0.03)
        dot(p, p.fresh > 0.05 ? `rgba(255,255,255,${0.5 + p.fresh / 2})` : 'rgba(201,167,255,0.85)')
      })
      if (s.queue.length > visibleQ.length) {
        ctx.fillStyle = 'rgba(155,92,255,0.95)'
        ctx.font = 'bold 11px "JetBrains Mono", monospace'
        ctx.fillText(`+${s.queue.length - visibleQ.length}`, 22, H - 8)
      }
      s.counters.forEach((c) => c.person && dot(c.person, c.person.noShow ? '#ff7b72' : '#9b5cff', 5.5))
      s.leaving = s.leaving.filter((p) => {
        p.life -= 0.03
        p.tx = W + 10; p.ty = p.y
        dot(p, p.done ? '#4ade80' : '#ff7b72', 4, Math.max(0, p.life))
        if (!p.done && p.life > 0.4) {
          ctx.fillStyle = '#ff7b72'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('×', p.x + 6, p.y - 6)
        }
        return p.life > 0
      })
    }

    const pushUi = () => {
      const s = sim.current
      setUi({
        q: s.queue.length,
        served: s.served,
        thr: s.completions.length / 5,
        rate: s.rateEst,
        eta: predictWait(s.queue.length),
        err: s.errors.length >= 3 ? (s.errors.reduce((a, b) => a + b, 0) / s.errors.length) * 100 : null,
        events: [...s.events],
        points: [...s.points],
      })
    }

    const loop = (ts) => {
      const dt = last ? Math.min((ts - last) / 1000, 0.1) : 0.016
      last = ts
      step(dt * (isOverdrive() ? 3 : 1))
      draw()
      uiAcc += dt
      if (uiAcc > 0.25) { uiAcc = 0; pushUi() }
      raf = requestAnimationFrame(loop)
    }

    if (still) {
      const tick = setInterval(() => { step(0.5); draw(); pushUi() }, 500)
      return () => { clearInterval(tick); ro.disconnect() }
    }
    if (sim.current.t === 0) join(8)
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [visible, join, x.counter])

  const errClass = ui.err == null ? '' : ui.err < 20 ? 'good' : ui.err < 40 ? 'warn' : 'bad'

  return (
    <Section id="stress" index={3} k="stress">
      <p className="sec-intro reveal">{x.intro}</p>
      <div className="qsim reveal" ref={wrapRef}>
        <div className="qsim-stage">
          <div className="qsim-bar mono">
            <span className="dots" aria-hidden="true"><i /><i /><i /></span>
            <span>queueless://campus-event/live</span>
            <span className={`qsim-state ${visible ? 'on' : ''}`}>{visible ? '● live' : x.paused}</span>
          </div>
          <canvas ref={canvasRef} className="qsim-canvas" aria-label={`${ui.q} ${x.q}, ${ui.served} ${x.served}`} role="img" />
          <div className="qsim-controls">
            <div className="btn-row">
              <button className="qbtn" onClick={() => join(1)}>{x.join}</button>
              <button className="qbtn" onClick={() => join(25)}>{x.rush}</button>
              <button className="qbtn hot" onClick={() => { join(100); unlock('broke') }}>{x.stampede}</button>
              <button className="qbtn ghost" onClick={reset}>{x.reset}</button>
            </div>
            <div className="ctl-row mono">
              <label className="stepper">
                <span>{x.counters}</span>
                <button onClick={() => setCtl((c) => ({ ...c, nCounters: Math.max(1, c.nCounters - 1) }))} aria-label="fewer counters">−</button>
                <b>{ctl.nCounters}</b>
                <button onClick={() => setCtl((c) => ({ ...c, nCounters: Math.min(5, c.nCounters + 1) }))} aria-label="more counters">+</button>
              </label>
              <label className="slider">
                <span>{x.speed} <b>{ctl.speed.toFixed(1)}×</b></span>
                <input type="range" min="0.4" max="2.5" step="0.1" value={ctl.speed}
                  onChange={(e) => setCtl((c) => ({ ...c, speed: Number(e.target.value) }))} />
              </label>
              <label className="toggle">
                <input type="checkbox" checked={ctl.noShow} onChange={(e) => setCtl((c) => ({ ...c, noShow: e.target.checked }))} />
                <span className="sw" /> {x.noshow}
              </label>
              <label className="toggle">
                <input type="checkbox" checked={ctl.auto} onChange={(e) => setCtl((c) => ({ ...c, auto: e.target.checked }))} />
                <span className="sw" /> {x.auto}
              </label>
            </div>
          </div>
        </div>

        <aside className="qsim-side">
          <div className="qstats">
            <div><span className="mono">{x.q}</span><b className={ui.q > 60 ? 'bad' : ''}>{ui.q}</b></div>
            <div><span className="mono">{x.served}</span><b>{ui.served}</b></div>
            <div><span className="mono">{x.thr}</span><b>{ui.thr.toFixed(1)}<small>{x.perMin}</small></b></div>
            <div><span className="mono">{x.rate}</span><b>{ui.rate.toFixed(2)}<small>{x.perMin}</small></b></div>
            <div><span className="mono">{x.eta}</span><b>{ui.eta.toFixed(1)}<small>{x.min}</small></b></div>
            <div><span className="mono">{x.err}</span><b className={errClass}>{ui.err == null ? <small>{x.learning}</small> : `${ui.err.toFixed(0)}%`}</b></div>
          </div>
          <Scatter points={ui.points} label={x.chart} pred={x.pred} act={x.act} />
          <div className="qevents mono">
            <p className="qevents-h">{x.events}</p>
            {ui.events.map((e) => (
              <p key={e.id} className={e.kind}>
                <span className="muted">t+{e.t.toFixed(1)}</span> {e.msg}
              </p>
            ))}
          </div>
        </aside>
      </div>
      <p className="qsim-note mono reveal">
        {x.note} <a href={qlProject?.repo} target="_blank" rel="noreferrer">{x.src} ↗</a>
      </p>
    </Section>
  )
}

function Scatter({ points, label, pred, act }) {
  const S = 120
  const max = Math.max(5, ...points.flat()) * 1.1
  const p = (v) => (v / max) * (S - 16) + 8
  return (
    <figure className="qscatter">
      <svg viewBox={`0 0 ${S} ${S}`} role="img" aria-label={label}>
        <line x1="8" y1={S - 8} x2={S - 8} y2="8" className="diag" />
        <line x1="8" y1={S - 8} x2={S - 8} y2={S - 8} className="axis" />
        <line x1="8" y1={S - 8} x2="8" y2="8" className="axis" />
        {points.map(([pr, ac], i) => (
          <circle key={i} cx={p(ac)} cy={S - p(pr)} r="2.6" style={{ opacity: 0.35 + (i / points.length) * 0.65 }} />
        ))}
      </svg>
      <figcaption className="mono">
        {label}
        <span><i className="k-diag" /> {pred} = {act}</span>
      </figcaption>
    </figure>
  )
}
