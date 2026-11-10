import Section from './Section.jsx'
import Pipeline from './Pipeline.jsx'
import { profile, projects } from '../data.js'
import { useLang } from '../i18n.jsx'
import { timeAgo, useGitHubRepos } from '../github.js'
import { onLink } from '../router.js'

function RepoMeta({ id }) {
  const { t, lang } = useLang()
  const { status, data } = useGitHubRepos(profile.githubUser)
  if (status !== 'ok' || !Array.isArray(data)) return null
  const r = data.find((x) => x.name.toLowerCase() === id.toLowerCase())
  if (!r) return null
  return (
    <span className="repo-meta mono" title="live from the GitHub API">
      <span className="live-dot" />
      {r.language && <span>{r.language}</span>}
      <span>{t('proj.stars')} {r.stargazers_count}</span>
      <span>{t('proj.updated')} {timeAgo(r.pushed_at, lang)}</span>
    </span>
  )
}

export default function Projects({ active, setActive }) {
  const { t, L, lang } = useLang()
  const p = projects[active]
  const points = L(p, 'points')
  const metricLabels = lang === 'ja' ? p.ja.metrics : p.metrics.map((m) => m.k)

  const onKey = (e) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
    e.preventDefault()
    const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1
    const next = (active + dir + projects.length) % projects.length
    setActive(next)
    document.getElementById(`tab-${projects[next].id}`)?.focus()
  }

  return (
    <Section id="projects" index={2} k="projects">
      <div className="proj reveal">
        <div className="proj-list" role="tablist" aria-label="Projects" onKeyDown={onKey}>
          {projects.map((x, i) => (
            <button
              key={x.id}
              id={`tab-${x.id}`}
              role="tab"
              aria-selected={i === active}
              aria-controls="proj-panel"
              tabIndex={i === active ? 0 : -1}
              className={`proj-tab ${i === active ? 'active' : ''}`}
              onClick={() => setActive(i)}
            >
              <span className="tab-idx mono">0{i + 1}</span>
              <span className="tab-body">
                <span className="tab-name">{x.title}</span>
                <span className="tab-kind mono">{L(x, 'kind')}</span>
              </span>
              <span className="tab-arrow" aria-hidden="true">→</span>
            </button>
          ))}
          <p className="proj-hint mono">{t('proj.hint')} <a href={profile.github} target="_blank" rel="noreferrer">github</a></p>
        </div>

        <article id="proj-panel" role="tabpanel" aria-labelledby={`tab-${p.id}`} className="proj-panel" key={p.id}>
          <div className="panel-bar mono">
            <span className="dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="path">~/projects/<b>{p.id}</b></span>
            <a href={p.repo} target="_blank" rel="noreferrer">{t('proj.source')} ↗</a>
          </div>
          <div className="panel-body">
            <div className="panel-title">
              <h3>{p.title}</h3>
              <RepoMeta id={p.id} />
            </div>
            <p className="proj-tagline">{L(p, 'tagline')}</p>
            <Pipeline steps={p.pipeline} />
            <ul className="proj-points">
              {points.map((pt, i) => <li key={i}>{pt}</li>)}
            </ul>
            <div className="proj-metrics">
              {p.metrics.map((m, i) => (
                <div key={m.k}>
                  <b>{m.v}</b>
                  <span className="mono">{metricLabels[i]}</span>
                </div>
              ))}
            </div>
            <ul className="tags mono">
              {p.tech.map((x) => <li key={x}>{x}</li>)}
            </ul>
            <a className="case-link" href={`/projects/${p.id}`} onClick={(e) => onLink(e, `/projects/${p.id}`)}>
              <span className="mono">{t('case.file')} · <span lang="ja">事件簿</span></span>
              <b>{t('proj.case')} →</b>
            </a>
          </div>
        </article>
      </div>
    </Section>
  )
}
