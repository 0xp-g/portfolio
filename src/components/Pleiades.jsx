// The Pleiades (プレアデス, the Seven Sisters): a real star cluster,
// drawn as a small constellation whose lines trace in on load.
const STARS = [
  ['Alcyone', 120, 92, 3.4],
  ['Atlas', 30, 98, 2.6],
  ['Pleione', 28, 120, 1.8],
  ['Electra', 196, 62, 2.6],
  ['Merope', 160, 40, 2.3],
  ['Maia', 182, 118, 2.4],
  ['Taygeta', 200, 154, 2.0],
  ['Celaeno', 214, 96, 1.6],
]
const LINES = [[2, 1], [1, 0], [0, 4], [4, 3], [3, 7], [7, 5], [5, 0], [5, 6]]

export default function Pleiades() {
  const at = (i) => STARS[i]
  return (
    <figure className="pleiades" aria-hidden="true">
      <svg viewBox="0 0 240 180">
        {LINES.map(([a, b], i) => (
          <line key={i} x1={at(a)[1]} y1={at(a)[2]} x2={at(b)[1]} y2={at(b)[2]}
            className="pl-line" style={{ animationDelay: `${1.2 + i * 0.25}s` }} />
        ))}
        {STARS.map(([name, x, y, r], i) => (
          <g key={name} className="pl-star" style={{ animationDelay: `${0.3 + i * 0.12}s, ${i * 0.7}s` }}>
            <title>{name}</title>
            <circle cx={x} cy={y} r={r * 2.6} className="pl-halo" />
            <path d={`M${x} ${y - r * 2.4}L${x + r * 0.5} ${y - r * 0.5}L${x + r * 2.4} ${y}L${x + r * 0.5} ${y + r * 0.5}L${x} ${y + r * 2.4}L${x - r * 0.5} ${y + r * 0.5}L${x - r * 2.4} ${y}L${x - r * 0.5} ${y - r * 0.5}Z`} className="pl-core" />
          </g>
        ))}
      </svg>
      <figcaption className="mono">PLEIADES · <span lang="ja">プレアデス</span></figcaption>
    </figure>
  )
}
