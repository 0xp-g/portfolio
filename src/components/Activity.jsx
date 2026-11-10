import { useEffect, useRef } from 'react'
import Section from './Section.jsx'
import { profile } from '../data.js'
import { useLang } from '../i18n.jsx'
import { describeEvent, timeAgo, useContributions, useGitHubEvents } from '../github.js'

function Heatmap() {
  const { t, lang } = useLang()
  const { status, data } = useContributions(profile.githubUser)
  const scroller = useRef(null)

  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth
  }, [status])

  if (status === 'error') return null
  if (status === 'loading') return <div className="heat skeleton" aria-busy="true" />

  const days = data?.contributions ?? []
  if (!days.length) return null
  // pad the first week so columns start on Sunday
  const pad = new Date(days[0].date).getDay()
  const cells = [...Array(pad).fill(null), ...days]
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  const total = data.total ? Object.values(data.total).reduce((a, b) => a + b, 0) : days.reduce((a, d) => a + d.count, 0)

  return (
    <div className="heat">
      <p className="heat-total">
        <b>{total.toLocaleString()}</b> <span className="mono muted">{t('act.contrib')}</span>
      </p>
      <div className="heat-scroll" ref={scroller}>
        <div className="heat-grid" role="img" aria-label={`${total} ${t('act.contrib')}`}>
          {weeks.map((w, wi) => (
            <div key={wi} className="heat-col">
              {w.map((d, di) =>
                d ? <i key={di} className={`l${d.level}`} title={`${d.count} · ${new Date(d.date).toLocaleDateString(lang)}`} /> : <i key={di} className="pad" />
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="heat-legend mono">
        {t('act.less')} <i className="l0" /><i className="l1" /><i className="l2" /><i className="l3" /><i className="l4" /> {t('act.more')}
      </p>
    </div>
  )
}

function Feed() {
  const { t, lang } = useLang()
  const { status, data } = useGitHubEvents(profile.githubUser)

  if (status === 'loading') return <p className="feed-msg mono">{t('act.loading')}<span className="caret" /></p>
  if (status === 'error')
    return (
      <p className="feed-msg">
        {t('act.error')} <a className="cyan" href={profile.github} target="_blank" rel="noreferrer">github.com/{profile.githubUser} ↗</a>
      </p>
    )
  if (!data?.length) return <p className="feed-msg">{t('act.empty')}</p>

  return (
    <ol className="feed">
      {data.slice(0, 8).map((e) => {
        const d = describeEvent(e)
        return (
          <li key={e.id}>
            <span className={`feed-tag mono t-${d.tag}`}>{d.tag}</span>
            <div className="feed-body">
              <p>
                <a href={`https://github.com/${e.repo.name}`} target="_blank" rel="noreferrer" className="feed-repo">{d.repo}</a>{' '}
                <span className="muted">{d.text}</span>
              </p>
              {d.detail && <p className="feed-detail mono">“{d.detail}”</p>}
            </div>
            <time className="mono muted" dateTime={e.created_at}>{timeAgo(e.created_at, lang)}</time>
          </li>
        )
      })}
    </ol>
  )
}

export default function Activity() {
  const { t } = useLang()
  return (
    <Section id="activity" index={6} k="activity">
      <p className="sec-intro reveal">
        <span className="live-dot" /> {t('act.intro')}
      </p>
      <div className="activity reveal">
        <Heatmap />
        <div className="feed-wrap">
          <p className="feed-h mono">{t('act.recent')} <a href={profile.github} target="_blank" rel="noreferrer">@{profile.githubUser} ↗</a></p>
          <Feed />
        </div>
      </div>
    </Section>
  )
}
