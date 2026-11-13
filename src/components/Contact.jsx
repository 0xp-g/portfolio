import { useState } from 'react'
import Section from './Section.jsx'
import { profile } from '../data.js'
import { useLang } from '../i18n.jsx'

export default function Contact() {
  const { t, lang } = useLang()
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard blocked; the mailto link still works */ }
  }

  return (
    <Section id="contact" index={8} k="contact">
      <div className="contact reveal">
        <div className="contact-halftone" aria-hidden="true" />
        <p className="preview-tag mono">
          <span className="pv-box">{t('contact.preview')}</span>
          {lang === 'en' && <span lang="ja">次回予告</span>}
        </p>
        <h3 className="contact-big">
          {t('contact.l1')}<br />
          {t('contact.l2a')}<span className="hl">{t('contact.hl')}</span>{t('contact.l2b')}
          {t('contact.l3') && <><br />{t('contact.l3')}</>}
        </h3>
        <p className="contact-sub">{t('contact.sub')}</p>
        <div className="contact-mail">
          <a href={`mailto:${profile.email}`} className="mail-link">{profile.email}</a>
          <button className="btn btn-ghost mono" onClick={copy}>{copied ? t('contact.copied') : t('contact.copy')}</button>
        </div>
        <div className="contact-links mono">
          <a href={profile.github} target="_blank" rel="noreferrer"><span>github</span><span aria-hidden="true">↗</span></a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer"><span>linkedin</span><span aria-hidden="true">↗</span></a>
          <a href={profile.resumeUrl} target="_blank" rel="noreferrer"><span>resume.pdf</span><span aria-hidden="true">↓</span></a>
          <a href={profile.resumeJaUrl} target="_blank" rel="noreferrer" lang="ja"><span>履歴書.pdf</span><span aria-hidden="true">↓</span></a>
        </div>
        <p className="tbc mono">
          <span className="tbc-arrow" aria-hidden="true">◀━━</span> {t('contact.tbc')}
        </p>
      </div>
    </Section>
  )
}
