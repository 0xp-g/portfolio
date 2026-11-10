import { useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../util.js'
import { whoosh } from '../sound.js'

// Full-screen anime "eyecatch" wipe: slabs slash across, big kanji, then out.
export default function Eyecatch() {
  const [shot, setShot] = useState(null)
  const timers = useRef([])

  useEffect(() => {
    const onCatch = (e) => {
      const { big, small, after } = e.detail || {}
      if (reducedMotion()) { after?.(); return }
      timers.current.forEach(clearTimeout)
      whoosh()
      setShot({ big, small, key: Date.now() })
      timers.current = [
        setTimeout(() => after?.(), 520),
        setTimeout(() => setShot(null), 1250),
      ]
    }
    window.addEventListener('eyecatch', onCatch)
    return () => { window.removeEventListener('eyecatch', onCatch); timers.current.forEach(clearTimeout) }
  }, [])

  if (!shot) return null
  return (
    <div className="eyecatch" key={shot.key} aria-hidden="true">
      <div className="ec-slab ec-a" />
      <div className="ec-slab ec-b" />
      <div className="ec-text">
        <span className="ec-big" lang="ja">{shot.big}</span>
        <span className="ec-small mono">{shot.small}</span>
      </div>
    </div>
  )
}
