import { useEffect, useRef } from 'react'
import { isOverdrive, reducedMotion } from '../util.js'

// A living "service mesh": drifting nodes, labelled services,
// and packets hopping along edges. Reacts to the cursor.
const LABELS = ['api', 'redis', 'celery', 'postgres', 'pgvector', 'nginx', 'minio', 'ws', 'docker', 'git', 'ast', 'rag']
const ACCENT = '155, 92, 255'
const CYAN = '201, 167, 255'

export default function NetworkCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const still = reducedMotion()
    let W = 0, H = 0, nodes = [], edges = [], adj = [], packets = [], raf = 0, running = true, last = 0
    const mouse = { x: -9999, y: -9999 }

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas.clientWidth
      H = canvas.clientHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.max(18, Math.min(72, Math.round((W * H) / 20000)))
      const labelled = W > 700 ? LABELS.length : 5
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        label: i < labelled ? LABELS[i] : null,
        heat: 0,
      }))
      edges = []
      adj = nodes.map(() => [])
      nodes.forEach((a, i) => {
        nodes
          .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
          .filter((o) => o.j !== i)
          .sort((p, q) => p.d - q.d)
          .slice(0, 2)
          .forEach(({ j }) => {
            if (adj[i].includes(j)) return
            adj[i].push(j)
            adj[j].push(i)
            edges.push([i, j])
          })
      })
      packets = []
    }

    function spawn(from) {
      const a = from ?? Math.floor(Math.random() * nodes.length)
      if (!adj[a]?.length) return
      const b = adj[a][Math.floor(Math.random() * adj[a].length)]
      packets.push({ a, b, t: 0, speed: 0.006 + Math.random() * 0.01, hot: Math.random() < 0.3, hops: 0 })
    }

    function draw(dt) {
      ctx.clearRect(0, 0, W, H)

      for (const n of nodes) {
        if (!still) {
          n.x += n.vx * dt
          n.y += n.vy * dt
          if (n.x < 0 || n.x > W) n.vx *= -1
          if (n.y < 0 || n.y > H) n.vy *= -1
          const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy)
          if (d < 120 && d > 0) { n.x += (dx / d) * 0.6; n.y += (dy / d) * 0.6 }
        }
        n.heat *= 0.96
      }

      ctx.lineWidth = 1
      for (const [i, j] of edges) {
        const a = nodes[i], b = nodes[j]
        const mx = (a.x + b.x) / 2 - mouse.x, my = (a.y + b.y) / 2 - mouse.y
        const near = Math.max(0, 1 - Math.hypot(mx, my) / 220)
        ctx.strokeStyle = near > 0 ? `rgba(${ACCENT}, ${0.08 + near * 0.4})` : 'rgba(150, 130, 200, 0.09)'
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }

      for (let k = packets.length - 1; k >= 0; k--) {
        const p = packets[k]
        p.t += p.speed * dt
        const a = nodes[p.a], b = nodes[p.b]
        if (p.t >= 1) {
          b.heat = 1
          packets.splice(k, 1)
          if (p.hops < 4 && Math.random() < 0.7) {
            const next = adj[p.b].filter((x) => x !== p.a)
            if (next.length) packets.push({ ...p, a: p.b, b: next[Math.floor(Math.random() * next.length)], t: 0, hops: p.hops + 1 })
          }
          continue
        }
        const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t
        const c = p.hot ? ACCENT : CYAN
        ctx.fillStyle = `rgba(${c}, 0.15)`
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = `rgba(${c}, 0.95)`
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill()
      }

      ctx.font = '11px "JetBrains Mono", monospace'
      for (const n of nodes) {
        const d = Math.hypot(n.x - mouse.x, n.y - mouse.y)
        const lit = Math.max(n.heat, d < 160 ? 1 - d / 160 : 0)
        const r = n.label ? 3 : 1.6
        ctx.fillStyle = lit > 0.05 ? `rgba(${CYAN}, ${0.4 + lit * 0.6})` : 'rgba(180, 165, 215, 0.35)'
        ctx.beginPath(); ctx.arc(n.x, n.y, r + lit * 1.5, 0, Math.PI * 2); ctx.fill()
        if (n.label) {
          ctx.fillStyle = lit > 0.05 ? `rgba(${ACCENT}, ${0.55 + lit * 0.45})` : 'rgba(160, 145, 200, 0.45)'
          ctx.fillText(n.label, n.x + 7, n.y - 6)
        }
      }
    }

    function loop(ts) {
      const dt = last ? Math.min((ts - last) / 16.67, 3) : 1
      last = ts
      const od = isOverdrive()
      if (Math.random() < (od ? 0.45 : 0.06) * dt && packets.length < (od ? 140 : 40)) spawn()
      draw(od ? dt * 2.2 : dt)
      if (running) raf = requestAnimationFrame(loop)
    }

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
      if (still) draw(1)
    }
    const onLeave = () => { mouse.x = mouse.y = -9999 }

    build()
    if (still) {
      draw(1)
    } else {
      for (let i = 0; i < 12; i++) spawn()
      raf = requestAnimationFrame(loop)
    }

    const ro = new ResizeObserver(() => { build(); if (still) draw(1) })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      if (still) return
      if (e.isIntersecting && !running) { running = true; last = 0; raf = requestAnimationFrame(loop) }
      else if (!e.isIntersecting) { running = false; cancelAnimationFrame(raf) }
    })
    io.observe(canvas)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} className="net-canvas" aria-hidden="true" />
}
