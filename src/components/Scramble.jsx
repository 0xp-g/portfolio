import { useCallback, useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../util.js'

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ#%&*+=<>/'

// Decodes text from random glyphs; replays on hover.
export default function Scramble({ text, delay = 0, className = '' }) {
  const [out, setOut] = useState(text)
  const timer = useRef(0)

  const run = useCallback(() => {
    if (reducedMotion()) return
    clearInterval(timer.current)
    let frame = 0
    const total = text.length * 3 + 10
    timer.current = setInterval(() => {
      frame++
      setOut(
        text
          .split('')
          .map((c, i) => (c === ' ' || frame > i * 3 + 10 ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join('')
      )
      if (frame >= total) { clearInterval(timer.current); setOut(text) }
    }, 38)
  }, [text])

  useEffect(() => {
    const t = setTimeout(run, delay)
    return () => { clearTimeout(t); clearInterval(timer.current) }
  }, [run, delay])

  return (
    <span className={className} onMouseEnter={run} aria-label={text}>
      <span aria-hidden="true">{out}</span>
    </span>
  )
}
