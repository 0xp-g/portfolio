import { unlock } from './achievements.js'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const UI = {
  en: {
    'nav.about': 'about', 'nav.projects': 'projects', 'nav.stress': 'stress-test', 'nav.stack': 'stack',
    'nav.log': 'log', 'nav.activity': 'activity', 'nav.terminal': 'terminal', 'nav.contact': 'contact',
    'nav.menu': 'menu',
    'hero.builds': '> builds',
    'hero.explore': 'explore the systems',
    'hero.menu': 'command menu',
    'sec.about': 'About', 'sub.about': '自己紹介',
    'sec.projects': "Systems I've built", 'sub.projects': 'プロジェクト',
    'sec.stress': 'Break my system', 'sub.stress': '負荷試験',
    'sec.stack': 'Stack explorer', 'sub.stack': '技術',
    'sec.log': 'Experience', 'sub.log': '経歴',
    'sec.activity': 'Live from GitHub', 'sub.activity': '活動記録',
    'sec.terminal': 'Talk to the shell', 'sub.terminal': '端末',
    'sec.contact': 'Contact', 'sub.contact': '連絡',
    'ep': 'EP.',
    'char.title': 'Character profile', 'char.stats': 'Stats', 'char.statsNote': 'self-assessed · for fun',
    'char.moves': 'Special moves', 'char.limit': 'Activate limit break',
    'proj.hint': '↑ ↓ to switch · more on', 'proj.source': 'source',
    'proj.updated': 'pushed', 'proj.stars': '★',
    'stack.intro': 'Pick any technology to see which systems it runs in.',
    'stack.systems': 'systems', 'stack.none': 'No matches in the four featured projects.',
    'stack.noneSub': 'Used in coursework, the internship, or day-to-day tooling.',
    'contact.preview': 'Next episode', 'contact.l1': "Let's build something", 'contact.l2a': 'that ', 'contact.hl': 'holds up',
    'contact.l2b': ' in production.',
    'contact.sub': 'Internships, collaborations, or a system design chat. My inbox is open, and I reply fast.',
    'contact.copy': 'copy', 'contact.copied': 'copied ✓',
    'contact.tbc': 'You send the first message.',
    'footer.thanks': 'Thanks for watching.',
    'act.intro': 'Pulled live from the GitHub API when you load this page.',
    'act.contrib': 'contributions in the last year', 'act.recent': 'Recent activity',
    'act.loading': 'fetching from api.github.com…', 'act.error': "GitHub's API didn't answer (probably rate-limited). The real thing is one click away:",
    'act.empty': 'No public events in the last 90 days. Probably heads-down on something.',
    'act.less': 'less', 'act.more': 'more',
    'case.back': '← all systems', 'case.file': 'Case file', 'case.problem': 'The problem', 'case.how': 'How it works',
    'case.decisions': 'Key decisions', 'case.decision': 'Decision', 'case.why': 'Why', 'case.tradeoff': 'Tradeoff',
    'case.numbers': 'By the numbers', 'case.retro': 'If I built it again', 'case.stack': 'Stack', 'case.source': 'View source',
    'case.prev': 'Previous episode', 'case.next': 'Next episode', 'case.enOnly': '',
    'proj.case': 'read the case study',
    'nf.title': 'You took a wrong turn.', 'nf.sub': 'This page doesn’t exist in this loop. Returning to the last checkpoint in',
    'nf.now': '↺ return now',
    'ach.title': 'Achievement unlocked', 'ach.progress': 'achievements', 'ach.locked': '???',
    'sound.on': 'sound on', 'sound.off': 'sound off',
  },
  ja: {
    'nav.about': '紹介', 'nav.projects': '作品', 'nav.stress': '負荷試験', 'nav.stack': '技術',
    'nav.log': '経歴', 'nav.activity': '活動', 'nav.terminal': '端末', 'nav.contact': '連絡',
    'nav.menu': 'メニュー',
    'hero.builds': '> つくるもの:',
    'hero.explore': 'システムを見る',
    'hero.menu': 'コマンドメニュー',
    'sec.about': '自己紹介', 'sub.about': 'About',
    'sec.projects': 'つくったシステム', 'sub.projects': 'Projects',
    'sec.stress': 'システムを壊してみて', 'sub.stress': 'Stress test',
    'sec.stack': '技術スタック', 'sub.stack': 'Stack',
    'sec.log': '経歴', 'sub.log': 'Experience',
    'sec.activity': 'GitHubの活動', 'sub.activity': 'Live',
    'sec.terminal': 'シェルと話す', 'sub.terminal': 'Terminal',
    'sec.contact': '連絡', 'sub.contact': 'Contact',
    'ep': '第',
    'char.title': 'キャラクター紹介', 'char.stats': 'ステータス', 'char.statsNote': '自己評価・お遊び',
    'char.moves': '必殺技', 'char.limit': '限界突破する',
    'proj.hint': '↑ ↓ で切替・その他は', 'proj.source': 'ソース',
    'proj.updated': '更新', 'proj.stars': '★',
    'stack.intro': '技術を選ぶと、それを使っているシステムが表示されます。',
    'stack.systems': 'システム', 'stack.none': '紹介中の4つのプロジェクトでは未使用です。',
    'stack.noneSub': '授業、インターン、日々のツールで使用。',
    'contact.preview': '次回予告', 'contact.l1': '本番でも', 'contact.l2a': '', 'contact.hl': '倒れない',
    'contact.l2b': 'ものを、一緒に。',
    'contact.sub': 'インターン、共同開発、システム設計の雑談でも。いつでも気軽にご連絡ください。',
    'contact.copy': 'コピー', 'contact.copied': 'コピーしました ✓',
    'contact.tbc': 'あなたが最初のメッセージを送る。',
    'footer.thanks': 'ご視聴ありがとうございました。',
    'act.intro': 'ページを開いた時点で GitHub API から取得しています。',
    'act.contrib': '過去1年間のコントリビューション', 'act.recent': '最近の活動',
    'act.loading': 'api.github.com から取得中…', 'act.error': 'GitHub APIから応答がありませんでした（おそらくレート制限）。本物はこちら：',
    'act.empty': '過去90日間の公開イベントはありません。何かに集中しているようです。',
    'act.less': '少', 'act.more': '多',
    'case.back': '← システム一覧', 'case.file': '事件簿', 'case.problem': '課題', 'case.how': '仕組み',
    'case.decisions': '設計判断', 'case.decision': '判断', 'case.why': '理由', 'case.tradeoff': 'トレードオフ',
    'case.numbers': '数字で見る', 'case.retro': 'もう一度作るなら', 'case.stack': '技術', 'case.source': 'ソースを見る',
    'case.prev': '前回', 'case.next': '次回', 'case.enOnly': 'このページの本文は英語のみです。',
    'proj.case': 'ケーススタディを読む',
    'nf.title': '道を間違えたようです。', 'nf.sub': 'このループにこのページは存在しません。最後のチェックポイントに戻るまで',
    'nf.now': '↺ 今すぐ戻る',
    'ach.title': '実績解除', 'ach.progress': '実績', 'ach.locked': '？？？',
    'sound.on': 'サウンド オン', 'sound.off': 'サウンド オフ',
  },
}

const Ctx = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('lang') === 'ja' ? 'ja' : 'en' } catch { return 'en' }
  })

  useEffect(() => {
    if (lang === 'ja') unlock('polyglot')
    document.documentElement.lang = lang
    try { localStorage.setItem('lang', lang) } catch { /* ignore */ }
  }, [lang])

  const t = useCallback((k) => UI[lang][k] ?? UI.en[k] ?? k, [lang])
  // pick obj.ja[field] in Japanese mode when it exists
  const L = useCallback((obj, field) => (lang === 'ja' && obj?.ja?.[field] != null ? obj.ja[field] : obj?.[field]), [lang])

  const value = useMemo(() => ({ lang, setLang, t, L }), [lang, t, L])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
