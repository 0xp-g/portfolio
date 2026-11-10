import { skills } from '../data.js'

const PHRASES = [
  'SYSTEM DESIGN', 'システム設計', 'ASYNC', '非同期', 'REALTIME', 'リアルタイム', 'RETRY FROM ZERO', 'ゼロから再試行',
  'IDEMPOTENT', '冪等', 'SHIP IT', '出荷', 'NO GUESSES · ONLY CITATIONS', '引用', 'LOAD TESTED', '負荷試験',
]

function Tape({ items, className, sep }) {
  const row = items.map((s, i) => (
    <span key={i} className="mq-item">
      {s}<span className="mq-sep" aria-hidden="true">{sep}</span>
    </span>
  ))
  return (
    <div className={`tape ${className}`}>
      <div className="mq-track">
        <div className="mq-row">{row}</div>
        <div className="mq-row" aria-hidden="true">{row}</div>
      </div>
    </div>
  )
}

// Two crossing caution-tape marquees.
export default function Tapes() {
  return (
    <div className="tapes mono" aria-label="Technologies">
      <Tape className="tape-a" items={PHRASES} sep="◆" />
      <Tape className="tape-b" items={Object.values(skills).flat()} sep="✦" />
    </div>
  )
}
