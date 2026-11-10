import Section from './Section.jsx'
import { log } from '../data.js'
import { useLang } from '../i18n.jsx'

export default function Log() {
  const { L } = useLang()
  return (
    <Section id="log" index={5} k="log">
      <p className="sec-intro mono reveal">
        <span className="muted">$</span> git log --graph --oneline <span className="muted">life</span>
      </p>
      <ol className="gitlog reveal">
        {log.map((c, i) => (
          <li key={c.hash} className={i === 0 ? 'head' : ''}>
            <div className="commit-meta mono">
              <span className="hash">{c.hash}</span>
              {c.ref && <span className="ref">({c.ref})</span>}
              <span className="when">{L(c, 'when')}</span>
            </div>
            <h3>
              <span className="ctype mono">{c.type}({c.scope}):</span> {L(c, 'title')}
            </h3>
            <ul>
              {L(c, 'body').map((b, k) => <li key={k}>{b}</li>)}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  )
}
