import { useEffect, useRef, useState } from 'react'
import Section from './Section.jsx'
import { log, profile, projects, skills } from '../data.js'
import { useLang } from '../i18n.jsx'
import { eyecatch, limitBreak, reducedMotion } from '../util.js'
import { ACHIEVEMENTS, unlock } from '../achievements.js'
import { isSoundOn, setSound } from '../sound.js'

const readAch = () => { try { return JSON.parse(localStorage.getItem('achievements') || '[]') } catch { return [] } }

const COMMANDS = ['help', 'whoami', 'about', 'ls', 'projects', 'open', 'skills', 'experience', 'contact', 'resume', 'github', 'linkedin', 'lang', 'stress', 'limit-break', 'return-by-death', 'achievements', 'sound', 'konnichiwa', 'sudo', 'clear']

const WELCOME = [
  { t: `yogesh-sh 1.0 · type 'help' to see what you can do.`, c: 'muted' },
]

export default function Terminal({ onOpenProject, loop }) {
  const ran = useRef(0)
  const { lang, setLang } = useLang()
  const loops = useRef(0)
  const [lines, setLines] = useState(WELCOME)
  const [input, setInput] = useState('')
  const hist = useRef([])
  const histIdx = useRef(-1)
  const outRef = useRef(null)
  const inRef = useRef(null)

  useEffect(() => {
    const el = outRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  useEffect(() => {
    const focus = () => inRef.current?.focus({ preventScroll: true })
    window.addEventListener('focus-terminal', focus)
    return () => window.removeEventListener('focus-terminal', focus)
  }, [])

  const out = (...rows) => rows.map((r) => (typeof r === 'string' ? { t: r } : r))

  function exec(raw) {
    const cmd = raw.trim()
    const [name, ...args] = cmd.split(/\s+/)
    const arg = args.join(' ').toLowerCase()
    const echo = { t: cmd, c: 'cmd' }
    if (cmd && ++ran.current === 5) unlock('shell')
    if (!cmd) return setLines((l) => [...l, echo])

    let res
    switch (name.toLowerCase()) {
      case 'help':
        res = out(
          { t: 'available commands:', c: 'cyan' },
          '  whoami         who is this',
          '  about          the longer version',
          '  projects       list systems · open <n> to view one',
          '  skills         the stack',
          '  experience     git log, but for a person',
          '  contact        how to reach me',
          '  resume [ja]    open the PDF (ja = 履歴書)',
          '  github / linkedin',
          '  lang en|ja     switch language · 言語切替',
          '  stress         go break my queue system',
          '  achievements   what you have found so far',
          '  sound on|off   synthesized sound effects',
          '  clear          clean slate',
          { t: '  …and a few hidden ones. try a famous code, or ask what happens when things fail. 🥚', c: 'muted' }
        )
        break
      case 'whoami':
        res = out({ t: `${profile.name} · ${profile.role}`, c: 'accent' }, profile.tagline)
        break
      case 'about':
      case 'cat':
        res = out(...profile.about)
        break
      case 'ls':
        res = out({ t: 'about.txt  projects/  skills.json  resume.pdf  履歴書.pdf  contact.md', c: 'cyan' })
        break
      case 'projects':
        res = out(
          ...projects.map((p, i) => `  [${i + 1}] ${p.title.padEnd(12)} ${p.kind}`),
          { t: "→ try 'open 1' or 'open deploy-lite'", c: 'muted' }
        )
        break
      case 'open': {
        const idx = projects.findIndex(
          (p, i) => String(i + 1) === arg || p.title.toLowerCase() === arg || p.id === arg.replace('-', '_')
        )
        if (idx === -1) res = out({ t: `open: no such project '${arg}'. try 'projects'`, c: 'err' })
        else {
          res = out({ t: `opening ${projects[idx].title}…`, c: 'ok' })
          setTimeout(() => onOpenProject(idx), 250)
        }
        break
      }
      case 'skills':
        res = out(...Object.entries(skills).map(([g, s]) => `  ${g.padEnd(18)} ${s.join(', ')}`))
        break
      case 'experience':
      case 'git':
        res = out(...log.map((c) => ({ t: `  ${c.hash}  ${c.type}(${c.scope}): ${c.title}`, c: c.ref ? 'accent' : '' })))
        break
      case 'contact':
        res = out(`  email     ${profile.email}`, `  github    ${profile.github}`, `  linkedin  ${profile.linkedin}`)
        break
      case 'resume':
      {
        const ja = arg ? ['ja', 'jp', '日本語'].includes(arg) : lang === 'ja'
        window.open(ja ? profile.resumeJaUrl : profile.resumeUrl, '_blank', 'noopener')
        res = out({ t: ja ? 'opening 履歴書.pdf…' : "opening resume.pdf…  (Japanese: 'resume ja')", c: 'ok' })
      }
        break
      case 'github':
      case 'linkedin':
        window.open(profile[name.toLowerCase()], '_blank', 'noopener')
        res = out({ t: `opening ${name}…`, c: 'ok' })
        break
      case 'sudo':
        res = arg.replace(/\s/g, '').startsWith('hire')
          ? out(
              { t: '[sudo] password for recruiter: ••••••••', c: 'muted' },
              { t: 'access granted ✓  drafting an email to Yogesh…', c: 'ok' }
            )
          : out({ t: `sudo: '${arg || '?'}' isn't allowed. (psst: sudo hire-me)`, c: 'err' })
        if (arg.replace(/\s/g, '').startsWith('hire')) setTimeout(() => (window.location.href = `mailto:${profile.email}?subject=Let's%20talk`), 900)
        break
      case 'konnichiwa':
      case 'こんにちは':
      case 'japanese':
        res = out({ t: 'こんにちは！JLPT N3に合格して、今はN2を勉強しています。', c: 'accent' }, { t: '(Hello! I passed JLPT N3 and am now studying for N2.)', c: 'muted' })
        break
      case 'lang': {
        const to = arg === 'ja' || arg === 'jp' || arg === '日本語' ? 'ja' : arg === 'en' ? 'en' : lang === 'en' ? 'ja' : 'en'
        res = out({ t: to === 'ja' ? '言語を日本語に切り替えます…' : 'switching language to English…', c: 'ok' })
        if (to !== lang) setTimeout(() => eyecatch(to === 'ja' ? '日本語' : 'English', to === 'ja' ? 'SWITCHING LANGUAGE' : '言語を切り替え中', () => setLang(to)), 200)
        break
      }
      case 'stress':
        res = out({ t: 'routing you to the stress test. please be gentle. (or not.)', c: 'ok' })
        setTimeout(() => document.getElementById('stress')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' }), 250)
        break
      case 'limit-break':
      case 'limitbreak':
      case 'overdrive':
        res = out({ t: '限界突破 · toggling limit break…', c: 'accent' })
        setTimeout(limitBreak, 200)
        break
      case 'return-by-death':
      case 'rezero':
      case 're:zero': {
        loops.current += 1
        const n = (loop || 1) + loops.current
        res = []
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('return-by-death', {
            detail: {
              loop: n,
              then: () => setLines([
                { t: `↺ checkpoint restored · loop #${n}`, c: 'accent' },
                { t: 'state rolled back, memories kept. every failure is a retry with more information.', c: 'muted' },
                { t: "(that's also how good job queues work: idempotent tasks, safe retries.)", c: 'muted' },
              ]),
            },
          }))
        }, 150)
        break
      }
      case 'achievements':
      case 'ach': {
        const have = readAch()
        res = out(
          { t: `achievements ${have.length}/${ACHIEVEMENTS.length}`, c: 'cyan' },
          ...ACHIEVEMENTS.map((a) => have.includes(a.id)
            ? { t: `  ✓ ${a.en.padEnd(18)} ${a.hint}`, c: 'ok' }
            : { t: `  · ${'???'.padEnd(18)} ${a.hint}`, c: 'muted' })
        )
        break
      }
      case 'sound': {
        const on = arg === 'on' ? true : arg === 'off' ? false : !isSoundOn()
        setSound(on)
        if (on) unlock('sound')
        res = out({ t: `sound ${on ? 'on ♪ (all synthesized live, no audio files)' : 'off'}`, c: 'ok' })
        break
      }
      case 'rm':
        res = out({ t: 'rm: permission denied. this portfolio is in production. 😅', c: 'err' })
        break
      case 'exit':
        res = out({ t: "there is no exit. only more projects. try 'projects'.", c: 'muted' })
        break
      case 'clear':
        hist.current.unshift(cmd)
        setLines([])
        return
      default:
        res = out({ t: `command not found: ${name}. try 'help'`, c: 'err' })
    }
    hist.current.unshift(cmd)
    setLines((l) => [...l, echo, ...res])
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      exec(input)
      setInput('')
      histIdx.current = -1
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const i = Math.min(histIdx.current + 1, hist.current.length - 1)
      if (i >= 0) { histIdx.current = i; setInput(hist.current[i]) }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const i = histIdx.current - 1
      histIdx.current = Math.max(i, -1)
      setInput(i >= 0 ? hist.current[i] : '')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const m = COMMANDS.filter((c) => c.startsWith(input.toLowerCase()))
      if (m.length === 1) setInput(m[0] + ' ')
      else if (m.length > 1) setLines((l) => [...l, { t: input, c: 'cmd' }, { t: m.join('  '), c: 'muted' }])
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  const chips = ['help', 'whoami', 'projects', 'lang ja', 'limit-break', 'sudo hire-me']

  return (
    <Section id="terminal" index={7} k="terminal">
      <div className="term reveal" onClick={() => inRef.current?.focus({ preventScroll: true })}>
        <div className="term-bar mono">
          <span className="dots" aria-hidden="true"><i /><i /><i /></span>
          <span>yogesh@portfolio: ~</span>
          <span className="muted">zsh</span>
        </div>
        <div className="term-out mono" ref={outRef} aria-live="polite">
          {lines.map((l, i) =>
            l.c === 'cmd' ? (
              <p key={i}><span className="prompt">yogesh@portfolio</span><span className="muted">:~$</span> {l.t}</p>
            ) : (
              <p key={i} className={l.c || ''}>{l.t}</p>
            )
          )}
          <label className="term-in">
            <span className="prompt">yogesh@portfolio</span><span className="muted">:~$</span>
            <input
              ref={inRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck="false"
              autoComplete="off"
              autoCapitalize="off"
              aria-label="Terminal input"
            />
          </label>
        </div>
      </div>
      <div className="term-chips mono reveal">
        <span className="muted">try:</span>
        {chips.map((c) => (
          <button key={c} onClick={() => exec(c)}>{c}</button>
        ))}
      </div>
    </Section>
  )
}
