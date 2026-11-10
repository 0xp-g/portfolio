import { useLang } from '../i18n.jsx'

// Anime-episode style section header: EP.02 / 第2話 + speed-line burst on reveal.
export default function Section({ id, index, k, children, className = '' }) {
  const { t, lang } = useLang()
  const n = String(index).padStart(2, '0')
  return (
    <section id={id} className={`section ${className}`}>
      <header className="sec-head reveal">
        <span className="sec-burst" aria-hidden="true" />
        <div className="sec-ep mono">
          <span className="ep-num">EP.{n}</span>
          <span className="ep-jp" lang="ja">第{index}話</span>
        </div>
        <h2>{t(`sec.${k}`)}</h2>
        <span className="sec-jp" lang={lang === 'en' ? 'ja' : 'en'}>{t(`sub.${k}`)}</span>
      </header>
      {children}
    </section>
  )
}
