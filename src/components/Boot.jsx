import { useEffect, useState } from 'react'

export default function Boot({ onDone, loop }) {
  const LINES = [
    ['ok', 'mounting /home/yogesh'],
    ['ok', 'redis ............ ready'],
    ['ok', 'celery workers ... 4 spawned'],
    ['ok', 'postgres + pgvector connected'],
    ['ok', `restoring checkpoint · loop #${loop}`],
    ['>>', 'welcome.'],
  ]
  const [n, setN] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (n < LINES.length) {
      const t = setTimeout(() => setN(n + 1), 160)
      return () => clearTimeout(t)
    }
    const t1 = setTimeout(() => setLeaving(true), 300)
    const t2 = setTimeout(onDone, 950)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [n, onDone, LINES.length])

  useEffect(() => {
    window.addEventListener('keydown', onDone)
    return () => window.removeEventListener('keydown', onDone)
  }, [onDone])

  return (
    <div className={`boot ${leaving ? 'leave' : ''}`} onClick={onDone} role="presentation">
      <div className="boot-inner mono">
        {LINES.slice(0, n).map(([tag, text], i) => (
          <p key={i}>
            <span className={tag === 'ok' ? 'ok' : 'accent'}>[{tag}]</span> {text}
          </p>
        ))}
        <span className="caret" />
      </div>
      <p className="boot-skip mono">click or press any key to skip</p>
    </div>
  )
}
