import { useEffect, useRef } from 'react'
import { isOverdrive, reducedMotion } from '../util.js'

// Slow violet "miasma": large soft blobs drifting through the hero,
// drawn at half resolution (cheap, and naturally soft) and drawn toward the cursor.
const COLORS = ['124, 58, 237', '155, 92, 255', '217, 70, 239', '88, 28, 135', '192, 132, 252']

export default function MiasmaFog() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const still = reducedMotion()
    const SCALE = 0.5
    let W = 0, H = 0, raf = 0, running = true, t0 = performance.now()
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const blobs = Array.from({ length: 9 }, (_, i) => ({
      x: Math.random(), y: Math.random(),
      r: 0.22 + Math.random() * 0.22,
      sx: 0.02 + Math.random() * 0.04, sy: 0.02 + Math.random() * 0.04,
      ph: Math.random() * Math.PI * 2,
      c: COLORS[i % COLORS.length],
      a: 0.1 + Math.random() * 0.1,
      pull: 0.05 + Math.random() * 0.12,
    }))

    const resize = () => {
      W = canvas.clientWidth; H = canvas.clientHeight
      canvas.width = Math.max(1, W * SCALE); canvas.height = Math.max(1, H * SCALE)
    }

    const draw = (now) => {
      const t = (now - t0) / 1000
      const od = isOverdrive()
      mouse.x += (mouse.tx - mouse.x) * 0.03
      mouse.y += (mouse.ty - mouse.y) * 0.03
      const cw = canvas.width, ch = canvas.height
      ctx.clearRect(0, 0, cw, ch)
      ctx.globalCompositeOperation = 'lighter'
      const speed = od ? 3.2 : 1
      for (const b of blobs) {
        const x = (b.x + Math.sin(t * b.sx * speed + b.ph) * 0.18 + (mouse.x - 0.5) * b.pull * 2) * cw
        const y = (b.y + Math.cos(t * b.sy * speed + b.ph) * 0.14 + (mouse.y - 0.5) * b.pull * 2) * ch
        const r = b.r * Math.max(cw, ch) * (1 + Math.sin(t * 0.3 + b.ph) * 0.08)
        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        const a = od ? b.a * 1.8 : b.a
        g.addColorStop(0, `rgba(${od ? '217, 70, 239' : b.c}, ${a})`)
        g.addColorStop(0.55, `rgba(${b.c}, ${a * 0.35})`)
        g.addColorStop(1, `rgba(${b.c}, 0)`)
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
    }

    const loop = (now) => { draw(now); if (running) raf = requestAnimationFrame(loop) }
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.tx = (e.clientX - r.left) / r.width
      mouse.ty = (e.clientY - r.top) / r.height
    }

    resize()
    const ro = new ResizeObserver(() => { resize(); if (still) draw(performance.now()) })
    ro.observe(canvas)
    if (still) draw(performance.now())
    else raf = requestAnimationFrame(loop)
    const io = new IntersectionObserver(([e]) => {
      if (still) return
      if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(loop) }
      else if (!e.isIntersecting) { running = false; cancelAnimationFrame(raf) }
    })
    io.observe(canvas)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => { running = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener('pointermove', onMove) }
  }, [])

  return <canvas ref={ref} className="miasma" aria-hidden="true" />
}
