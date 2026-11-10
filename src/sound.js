// Sounds are synthesized live with the Web Audio API. Off by default; the visitor
// opts in with the nav toggle.
//
// Optional custom sample: drop an audio file at public/sfx/return-by-death.mp3
// (or .ogg / .wav) and the 死に戻り cue plays that instead of the synthesized one.
// Only use audio you have the rights to publish.

let ctx = null
let master = null
let enabled = (() => { try { return localStorage.getItem('sound') === 'on' } catch { return false } })()

let offline = false

function ac() {
  if (offline) return ctx
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    const comp = ctx.createDynamicsCompressor()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(comp).connect(ctx.destination)
  }
  if (ctx.state === 'suspended') {
    // Before the visitor has interacted, browsers keep audio suspended. Scheduling
    // sounds now would make them all fire at once on the first click, so skip instead.
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null
    ctx.resume()
  }
  return ctx
}

// ── optional sample for the return-by-death cue ──
const SAMPLE_URLS = ['/sfx/return-by-death.mp3', '/sfx/return-by-death.ogg', '/sfx/return-by-death.wav']
let sample = null        // decoded AudioBuffer, once loaded
let sampleInfo = null    // { onset, end, gain }: measured from the file itself
let sampleTried = false

// Find where the sound really starts and ends (files often carry silence)
// and how much gain brings its peak to a consistent level.
function analyse(buf) {
  let peak = 0
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const d = buf.getChannelData(c)
    for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > peak) peak = v }
  }
  if (!peak) return { onset: 0, end: buf.duration, gain: 1 }
  const d = buf.getChannelData(0), thr = peak * 0.03
  let first = 0, last = d.length - 1
  while (first < d.length && Math.abs(d[first]) < thr) first++
  while (last > first && Math.abs(d[last]) < thr * 0.3) last--
  const sr = buf.sampleRate
  return {
    onset: Math.max(0, first / sr - 0.01),
    end: Math.min(buf.duration, last / sr + 0.15),
    gain: Math.min(0.8 / peak, 4),
  }
}

async function loadSample(c) {
  if (sampleTried) return
  sampleTried = true
  for (const url of SAMPLE_URLS) {
    try {
      const r = await fetch(url)
      // SPA hosts answer missing files with index.html, so check it's really audio
      if (!r.ok || !(r.headers.get('content-type') || '').startsWith('audio')) continue
      sample = await c.decodeAudioData(await r.arrayBuffer())
      sampleInfo = analyse(sample)
      return
    } catch { /* try the next format */ }
  }
}

export const isSoundOn = () => enabled
export function setSound(on) {
  enabled = on
  try { localStorage.setItem('sound', on ? 'on' : 'off') } catch { /* ignore */ }
  window.dispatchEvent(new Event('sound-change'))
  if (on) { const c = ac(); if (c) loadSample(c); blip(880, 0.08) }
}

function noiseBuffer(c, secs) {
  const b = c.createBuffer(1, c.sampleRate * secs, c.sampleRate)
  const d = b.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return b
}

function env(g, t, a, peak, d, end = 0.0001) {
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + a)
  g.gain.exponentialRampToValueAtTime(end, t + a + d)
}

function tone(type, freq, t, a, peak, d, freqEnd) {
  const c = ctx
  const o = c.createOscillator(), g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t + a + d)
  env(g, t, a, peak, d)
  o.connect(g).connect(master)
  o.start(t); o.stop(t + a + d + 0.05)
}

function blip(freq = 1400, peak = 0.05) {
  const c = ac(); if (!c) return
  tone('sine', freq, c.currentTime, 0.004, peak, 0.06)
}

export function click() {
  if (enabled) blip(1500, 0.035)
}

// eyecatch swoosh: filtered noise sweeping up then down
export function whoosh() {
  if (!enabled) return
  const c = ac(); if (!c) return
  const t = c.currentTime
  const src = c.createBufferSource(); src.buffer = noiseBuffer(c, 1)
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2
  bp.frequency.setValueAtTime(300, t)
  bp.frequency.exponentialRampToValueAtTime(3200, t + 0.35)
  bp.frequency.exponentialRampToValueAtTime(400, t + 0.9)
  const g = c.createGain(); env(g, t, 0.3, 0.35, 0.6)
  src.connect(bp).connect(g).connect(master)
  src.start(t); src.stop(t + 1)
  tone('sine', 196, t + 0.42, 0.01, 0.12, 0.5, 98)
}

// limit break: rising saw + noise into an impact
export function riser() {
  if (!enabled) return
  const c = ac(); if (!c) return
  const t = c.currentTime
  const o = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain()
  o.type = 'sawtooth'
  o.frequency.setValueAtTime(70, t)
  o.frequency.exponentialRampToValueAtTime(660, t + 0.55)
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(400, t); lp.frequency.exponentialRampToValueAtTime(5000, t + 0.55)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.18, t + 0.5)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.62)
  o.connect(lp).connect(g).connect(master)
  o.start(t); o.stop(t + 0.7)
  // impact
  tone('sine', 120, t + 0.55, 0.005, 0.6, 0.6, 38)
  const n = c.createBufferSource(); n.buffer = noiseBuffer(c, 0.5)
  const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1500
  const ng = c.createGain(); env(ng, t + 0.55, 0.003, 0.25, 0.35)
  n.connect(hp).connect(ng).connect(master)
  n.start(t + 0.55); n.stop(t + 1)
}

// seconds from trigger to the flash in RewindOverlay (62% of its 2.5s / 1.5s animation)
export const REWIND_SNAP = 1.55
export const REWIND_SNAP_SHORT = 0.93

// 死に戻り: an original "return to checkpoint" cue.
// slowing heartbeat → backwards clock ticks → reversed swell → snap → checkpoint chime
export function rewind(short = false) {
  if (!enabled) return
  const c = ac(); if (!c) return
  if (!offline) loadSample(c)
  if (sample && !offline) {
    // The visual drains colour and spins the clock back in silence; the file's
    // hit lands exactly on the flash (the "snap" back to the checkpoint),
    // and its ring-out carries over as the page fades back in.
    const { onset, end, gain } = sampleInfo
    const src = c.createBufferSource(), g = c.createGain()
    src.buffer = sample
    g.gain.value = gain
    const hitAt = c.currentTime + (short ? REWIND_SNAP_SHORT : REWIND_SNAP)
    src.connect(g).connect(c.destination) // bypass the synth bus so the file plays as-is
    src.start(hitAt, onset)
    src.stop(hitAt + (end - onset))
    return
  }
  const t = c.currentTime
  const L = short ? 0.55 : 1 // time scale

  // eerie drone: detuned saws + a minor second, low-passed
  const drone = c.createGain(); const dlp = c.createBiquadFilter()
  dlp.type = 'lowpass'; dlp.frequency.value = 420
  drone.gain.setValueAtTime(0.0001, t)
  drone.gain.exponentialRampToValueAtTime(0.09, t + 0.5 * L)
  drone.gain.exponentialRampToValueAtTime(0.0001, t + 1.7 * L)
  ;[55, 55.6, 58.3].forEach((f) => {
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f
    o.connect(dlp); o.start(t); o.stop(t + 1.8 * L)
  })
  dlp.connect(drone).connect(master)

  // heartbeat, slowing down
  ;[0, 0.26, 0.85, 1.15].forEach((dt, i) => {
    if (short && i > 1) return
    tone('sine', i % 2 ? 52 : 64, t + dt * L, 0.008, 0.7 - i * 0.1, 0.22, 34)
  })

  // clock ticks, accelerating backwards
  let tt = 0.15
  for (let i = 0; i < (short ? 7 : 14); i++) {
    tone('square', i % 2 ? 2400 : 1800, t + tt * L, 0.001, 0.035, 0.025)
    tt += Math.max(0.03, 0.13 - i * 0.008)
  }

  // reversed swell (noise that grows and cuts off abruptly)
  const snapAt = t + 1.55 * L
  const n = c.createBufferSource(); n.buffer = noiseBuffer(c, 2)
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.8
  bp.frequency.setValueAtTime(500, t + 0.3 * L)
  bp.frequency.exponentialRampToValueAtTime(6000, snapAt)
  const ng = c.createGain()
  ng.gain.setValueAtTime(0.0001, t + 0.3 * L)
  ng.gain.exponentialRampToValueAtTime(0.4, snapAt - 0.01)
  ng.gain.setValueAtTime(0.0001, snapAt)
  n.connect(bp).connect(ng).connect(master)
  n.start(t + 0.3 * L); n.stop(snapAt + 0.05)

  // snap + pitch drop
  tone('triangle', 1760, snapAt, 0.002, 0.3, 0.25, 110)
  // checkpoint chime (soft, glassy)
  ;[523.25, 783.99, 1046.5].forEach((f, i) =>
    tone('sine', f, snapAt + 0.35 + i * 0.07, 0.01, 0.09 - i * 0.02, short ? 0.9 : 1.6))
}

// achievement unlocked: a bright two-note chime
export function chime() {
  if (!enabled) return
  const c = ac(); if (!c) return
  const t = c.currentTime
  tone('triangle', 987.77, t, 0.005, 0.12, 0.25)
  tone('triangle', 1318.5, t + 0.09, 0.005, 0.12, 0.5)
}

// Dev helper: render any of the effects above into an AudioBuffer (unused by the site,
// so the bundler drops it). Lets the sounds be exported to a WAV for listening.
export async function renderOffline(name, seconds = 3, arg) {
  const fns = { rewind, whoosh, riser, chime, click }
  const saved = { ctx, master, enabled, offline }
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext
  ctx = new OAC(2, Math.ceil(44100 * seconds), 44100)
  const comp = ctx.createDynamicsCompressor()
  master = ctx.createGain(); master.gain.value = 0.5
  master.connect(comp).connect(ctx.destination)
  enabled = true; offline = true
  try { fns[name](arg); return await ctx.startRendering() }
  finally { ({ ctx, master, enabled, offline } = saved) }
}

// If sound was left on from a previous visit, fetch the sample on the first
// interaction so the very first rewind already uses it.
if (typeof window !== 'undefined') {
  const warm = () => {
    if (enabled) { const c = ac(); if (c) loadSample(c) }
    window.removeEventListener('pointerdown', warm)
    window.removeEventListener('keydown', warm)
  }
  window.addEventListener('pointerdown', warm)
  window.addEventListener('keydown', warm)
}
