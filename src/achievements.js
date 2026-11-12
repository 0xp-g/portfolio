import { useEffect, useState } from 'react'

export const ACHIEVEMENTS = [
  { id: 'polyglot', icon: '文', en: 'Polyglot', ja: '言語の壁を越えて', hint: 'Switched to 日本語', jaHint: '日本語に切り替えた' },
  { id: 'limit', icon: '⚡', en: 'Limit Breaker', ja: '限界突破', hint: 'Unleashed limit break', jaHint: '限界突破を発動した' },
  { id: 'broke', icon: '💥', en: 'Broke the System', ja: 'システム崩壊', hint: 'Sent a 100-person stampede', jaHint: '100人を殺到させた' },
  { id: 'rbd', icon: '↺', en: 'Return by Death', ja: '死に戻り', hint: 'Returned to a checkpoint', jaHint: 'チェックポイントに戻った' },
  { id: 'shell', icon: '>_', en: 'Shell Whisperer', ja: 'シェル使い', hint: 'Ran 5 terminal commands', jaHint: 'コマンドを5回実行した' },
  { id: 'palette', icon: '⌘', en: 'Power User', ja: '上級者', hint: 'Opened the command menu', jaHint: 'コマンドメニューを開いた' },
  { id: 'archivist', icon: '📜', en: 'Archivist', ja: '記録係', hint: 'Read a case study', jaHint: 'ケーススタディを読んだ' },
  { id: 'lost', icon: '?', en: 'Lost Soul', ja: '迷える魂', hint: 'Found the 404 page', jaHint: '404ページを見つけた' },
  { id: 'loop5', icon: '∞', en: 'Fifth Loop', ja: '五周目', hint: 'Came back 5 times', jaHint: '5回訪れた' },
  { id: 'sound', icon: '♪', en: 'Listener', ja: '聴く者', hint: 'Turned the sound on', jaHint: 'サウンドをオンにした' },
]

const KEY = 'achievements'

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function unlock(id) {
  const have = read()
  if (have.includes(id) || !ACHIEVEMENTS.some((a) => a.id === id)) return
  const next = [...have, id]
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('achievement', { detail: { id } }))
}

export function useAchievements() {
  const [have, setHave] = useState(read)
  useEffect(() => {
    const on = () => setHave(read())
    window.addEventListener('achievement', on)
    return () => window.removeEventListener('achievement', on)
  }, [])
  return have
}
