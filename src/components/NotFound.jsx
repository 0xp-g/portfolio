import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n.jsx'
import { navigate } from '../router.js'
import { unlock } from '../achievements.js'

export default function NotFound() {
  const { t } = useLang()
  const [n, setN] = useState(7)
  const fired = useRef(false)

  const back = () => {
    if (fired.current) return
    fired.current = true
    window.dispatchEvent(new CustomEvent('return-by-death', { detail: { then: () => navigate('/') } }))
  }

  useEffect(() => {
    unlock('lost')
    document.title = '404 · 死に戻り'
  }, [])

  useEffect(() => {
    if (n <= 0) { back(); return }
    const id = setTimeout(() => setN(n - 1), 1000)
    return () => clearTimeout(id)
  }, [n])

  return (
    <section className="nf">
      <div className="nf-glyph" lang="ja" aria-hidden="true">死</div>
      <p className="nf-code mono">404 · <span className="muted">{window.location.pathname}</span></p>
      <h1 className="nf-title">{t('nf.title')}</h1>
      <p className="nf-sub">
        {t('nf.sub')} <b className="accent mono">{Math.max(n, 0)}</b>…
      </p>
      <button className="btn btn-primary" onClick={back}>{t('nf.now')}</button>
    </section>
  )
}
