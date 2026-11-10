import { useEffect, useState } from 'react'

// One shared fetch per page load (+10 min sessionStorage cache) so
// visitors don't burn GitHub's 60 req/hour unauthenticated limit.
const TTL = 10 * 60 * 1000
const cache = {}

function cached(key, url) {
  if (cache[key]) return cache[key]
  try {
    const hit = JSON.parse(sessionStorage.getItem(`gh:${key}`) || 'null')
    if (hit && Date.now() - hit.at < TTL) return (cache[key] = Promise.resolve(hit.data))
  } catch { /* ignore */ }
  cache[key] = fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    })
    .then((data) => {
      try { sessionStorage.setItem(`gh:${key}`, JSON.stringify({ at: Date.now(), data })) } catch { /* ignore */ }
      return data
    })
  cache[key].catch(() => { delete cache[key] })
  return cache[key]
}

function useResource(key, url) {
  const [state, setState] = useState({ status: 'loading', data: null })
  useEffect(() => {
    let alive = true
    cached(key, url)
      .then((data) => alive && setState({ status: 'ok', data }))
      .catch(() => alive && setState({ status: 'error', data: null }))
    return () => { alive = false }
  }, [key, url])
  return state
}

export const useGitHubEvents = (user) =>
  useResource(`events:${user}`, `https://api.github.com/users/${user}/events/public?per_page=30`)

export const useGitHubRepos = (user) =>
  useResource(`repos:${user}`, `https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`)

// Contribution calendar (GitHub has no unauthenticated endpoint for this).
export const useContributions = (user) =>
  useResource(`contrib:${user}`, `https://github-contributions-api.jogruber.de/v4/${user}?y=last`)

export function describeEvent(e) {
  const repo = e.repo?.name?.split('/')[1] ?? e.repo?.name ?? '?'
  const p = e.payload || {}
  switch (e.type) {
    case 'PushEvent': {
      const n = p.size ?? p.commits?.length
      const msg = p.commits?.[p.commits.length - 1]?.message?.split('\n')[0]
      const branch = p.ref?.replace('refs/heads/', '')
      return {
        tag: 'push',
        repo,
        text: n ? `pushed ${n} commit${n > 1 ? 's' : ''}${branch ? ` to ${branch}` : ''}` : `pushed${branch ? ` to ${branch}` : ''}`,
        detail: msg,
      }
    }
    case 'CreateEvent':
      return { tag: 'create', repo, text: p.ref_type === 'repository' ? 'created repository' : `created ${p.ref_type} ${p.ref ?? ''}` }
    case 'DeleteEvent':
      return { tag: 'delete', repo, text: `deleted ${p.ref_type} ${p.ref ?? ''}` }
    case 'PullRequestEvent':
      return { tag: 'pr', repo, text: `${p.action} PR #${p.number ?? p.pull_request?.number ?? ''}`, detail: p.pull_request?.title }
    case 'IssuesEvent':
      return { tag: 'issue', repo, text: `${p.action} issue #${p.issue?.number ?? ''}`, detail: p.issue?.title }
    case 'IssueCommentEvent':
      return { tag: 'comment', repo, text: `commented on #${p.issue?.number ?? ''}`, detail: p.issue?.title }
    case 'WatchEvent':
      return { tag: 'star', repo, text: 'starred' }
    case 'ForkEvent':
      return { tag: 'fork', repo, text: 'forked' }
    case 'ReleaseEvent':
      return { tag: 'release', repo, text: `released ${p.release?.tag_name ?? ''}` }
    case 'PublicEvent':
      return { tag: 'public', repo, text: 'open-sourced' }
    default:
      return { tag: e.type?.replace('Event', '').toLowerCase() || 'event', repo, text: 'activity' }
  }
}

export function timeAgo(iso, lang = 'en') {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  const units = [
    [31536000, 'y', '年'], [2592000, 'mo', 'ヶ月'], [86400, 'd', '日'], [3600, 'h', '時間'], [60, 'm', '分'], [1, 's', '秒'],
  ]
  for (const [sec, en, ja] of units) {
    if (s >= sec) {
      const n = Math.floor(s / sec)
      return lang === 'ja' ? `${n}${ja}前` : `${n}${en} ago`
    }
  }
  return ''
}
