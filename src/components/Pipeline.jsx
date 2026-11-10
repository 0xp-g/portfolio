import { Fragment, useEffect, useState } from 'react'
import { reducedMotion } from '../util.js'

// Animated architecture flow: a request lights up each stage in turn.
export default function Pipeline({ steps }) {
  const still = reducedMotion()
  const [active, setActive] = useState(still ? steps.length : 0)

  useEffect(() => {
    if (still) return
    setActive(0)
    const t = setInterval(() => setActive((a) => (a + 1) % (steps.length + 3)), 620)
    return () => clearInterval(t)
  }, [steps, still])

  return (
    <ol className="pipe" aria-label="Architecture flow">
      {steps.map(([label, sub], i) => (
        <Fragment key={label + i}>
          <li className={`pipe-node ${active >= i ? 'lit' : ''} ${active === i ? 'now' : ''}`}>
            <span className="pipe-label mono">{label}</span>
            <span className="pipe-sub">{sub}</span>
          </li>
          {i < steps.length - 1 && (
            <li aria-hidden="true" className={`pipe-link ${active === i ? 'flow' : ''} ${active > i ? 'done' : ''}`} />
          )}
        </Fragment>
      ))}
    </ol>
  )
}
