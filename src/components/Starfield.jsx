import { useEffect, useRef } from 'react'
import { reducedMotion } from '../util.js'

// A faint, sparse starfield behind the whole site: a few stars twinkle,
// and every so often a shooting star crosses. Kept deliberately quiet.
export default function Starfield() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const still = reducedMotion()
    let W = 0, H = 0, stars = [], raf = 0, shoot = null, nextShoot = 0

    const build = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2)
      W = innerWidth; H = innerHeight
      canvas.width = W * dpr; canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(110, (W * H) / 14000))
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() < 0.12 ? 1.3 : 0.4 + Math.random() * 0.6,
        a: 0.15 + Math.random() * 0.45,
        tw: Math.random() < 0.35 ? 0.6 + Math.random() * 1.6 : 0, // only some twinkle
        ph: Math.random() * Math.PI * 2,
        violet: Math.random() < 0.3,
      }))
    }

    const draw = (now) => {
      const t = now / 1000
      ctx.clearRect(0, 0, W, H)
      for (const s of stars) {
        const a = s.tw ? s.a * (0.55 + 0.45 * Math.sin(t * s.tw + s.ph)) : s.a
        ctx.fillStyle = s.violet ? `rgba(201, 167, 255, ${a})` : `rgba(239, 233, 255, ${a})`
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill()
        if (s.r > 1.2) { // brighter stars get a soft cross glint
          ctx.strokeStyle = `rgba(201, 167, 255, ${a * 0.35})`
          ctx.lineWidth = 0.6
          ctx.beginPath(); ctx.moveTo(s.x - 4, s.y); ctx.lineTo(s.x + 4, s.y); ctx.moveTo(s.x, s.y - 4); ctx.lineTo(s.x, s.y + 4); ctx.stroke()
        }
      }
      // shooting star
      if (!still && !shoot && now > nextShoot) {
        const fromLeft = Math.random() < 0.5
        shoot = { x: fromLeft ? Math.random() * W * 0.5 : W * (0.5 + Math.random() * 0.5), y: Math.random() * H * 0.4, vx: (fromLeft ? 1 : -1) * (7 + Math.random() * 4), vy: 2.5 + Math.random() * 2, life: 1 }
      }
      if (shoot) {
        const { x, y, vx, vy } = shoot
        const g = ctx.createLinearGradient(x, y, x - vx * 14, y - vy * 14)
        g.addColorStop(0, `rgba(239, 233, 255, ${0.85 * shoot.life})`)
        g.addColorStop(1, 'rgba(155, 92, 255, 0)')
        ctx.strokeStyle = g; ctx.lineWidth = 1.4
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - vx * 14, y - vy * 14); ctx.stroke()
        shoot.x += vx; shoot.y += vy; shoot.life -= 0.018
        if (shoot.life <= 0 || shoot.x < -200 || shoot.x > W + 200 || shoot.y > H) {
          shoot = null
          nextShoot = now + 15000 + Math.random() * 10000
        }
      }
    }

    // ~30fps is plenty for twinkling
    let last = 0
    const loop = (now) => {
      if (now - last > 33) { draw(now); last = now }
      raf = requestAnimationFrame(loop)
    }

    build()
    nextShoot = performance.now() + 6000
    if (still) draw(0)
    else raf = requestAnimationFrame(loop)
    const onResize = () => { build(); if (still) draw(0) }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  return <canvas ref={ref} className="starfield" aria-hidden="true" />
}
