// ─────────────────────────────────────────────────────────────
//  Case studies: one per project, at /projects/<id>.
//
//  ⚠ REVIEW THESE. The "how it works" steps come from the resume, but the
//  reasoning in `decisions` and everything in `retro` are drafted from it:
//  rewrite them in your own words so you can defend every line in an interview.
//  (Content is English-only; the page chrome is translated.)
// ─────────────────────────────────────────────────────────────
export const cases = {
  repo_lens: {
    problem:
      "LLM answers about a codebase are confidently wrong. Plain chunk-and-embed RAG loses the code's structure: it doesn't know which function calls which, so it can't answer “what happens when a job fails?”, and it can't show where an answer came from.",
    steps: [
      ['git', 'Deterministic snapshots', 'Every ingest pins an exact Git snapshot, so an answer is always reproducible against the code it was built from.'],
      ['ast', 'Parse, don’t split', 'AST parsing extracts functions, classes, imports and calls with exact line ranges, instead of cutting text into arbitrary chunks.'],
      ['celery', 'Workers per workload', 'Clone, parse and embed run as separate Celery workers over Redis, with progress streamed back and tenant-aware resource controls.'],
      ['pgvector', 'Vectors + a graph', 'Symbols are embedded into pgvector; calls and imports form a dependency graph that can be traversed next to the vectors.'],
      ['rag', 'Cite or don’t answer', 'Retrieval combines graph traversal with vector search, and answers come back with source-file and line-level citations.'],
    ],
    decisions: [
      {
        title: 'AST symbols over fixed-size text chunks',
        why: 'Chunks split functions mid-body and lose names. Symbols are natural retrieval units, and their exact line ranges are what make precise citations possible.',
        tradeoff: 'Needs a parser per language; unsupported files fall back to coarser handling.',
      },
      {
        title: 'pgvector inside Postgres instead of a separate vector DB',
        why: 'Embeddings, symbol metadata and graph edges live in one transactional store and join with plain SQL. One less service to run and keep consistent.',
        tradeoff: 'At very large scale a dedicated ANN service could outperform it.',
      },
      {
        title: 'Separate Celery workers for clone, parse and embed',
        why: 'Cloning is network-bound, parsing CPU-bound, embedding rate-limited. Isolating them lets each scale, fail and retry on its own without starving the others.',
        tradeoff: 'More moving parts, and every task has to be idempotent so retries are safe.',
      },
      {
        title: 'Citations are part of the contract',
        why: 'An architecture answer without file:line evidence can’t be trusted or checked. Grounding every claim in the source is the whole point of the tool.',
        tradeoff: 'Some questions honestly get “not enough evidence” instead of a confident guess. That’s intended.',
      },
    ],
    retro: [
      'Incremental re-indexing: re-parse only the files that changed between snapshots instead of a full re-ingest.',
      'Break evaluation down by question type (call-flow, ownership, config) rather than one overall score.',
      'A tree-sitter based parser layer to widen language support without one parser per language.',
    ],
  },

  deploy_lite: {
    problem:
      "Deploying a frontend shouldn't require configuring a server. But a deployment platform has to run other people's build scripts, and one runaway build must never take the platform, or anyone else's deploy, down with it.",
    steps: [
      ['webhook', 'Push triggers a deploy', 'A GitHub webhook creates a deployment record in PostgreSQL and enqueues a build; the API returns immediately.'],
      ['celery', 'Async build queue', 'Builds run on Celery workers via Redis, independent of API request handling, however long they take.'],
      ['docker', 'Sandboxed builds', 'Each repo is cloned and built in an isolated Docker container with configurable CPU, memory and timeout limits; logs stream live over WebSockets.'],
      ['minio', 'Artifacts, not servers', 'Build output is stored in MinIO object storage, keyed by deployment, with full deployment history in PostgreSQL.'],
      ['nginx', 'A URL per deploy', 'Nginx reverse-proxy routing exposes a deployment-specific, shareable URL for every build.'],
    ],
    decisions: [
      {
        title: 'Builds never run inside the request',
        why: 'Builds take seconds to minutes. Pushing them to a queue keeps the API fast and lets workers scale separately from the web tier.',
        tradeoff: 'Requires status tracking and live log streaming so users aren’t left staring at a spinner.',
      },
      {
        title: 'Hard resource limits on every container',
        why: 'Build scripts are untrusted code. CPU, memory and timeout caps turn a fork bomb or infinite loop into one failed build instead of an outage.',
        tradeoff: 'Container start-up adds overhead to every build.',
      },
      {
        title: 'Artifacts in object storage',
        why: 'Build workers stay stateless, and serving a deployment becomes a routing problem: point the URL at the right artifact set.',
        tradeoff: 'Storage grows with every deploy and needs a retention policy.',
      },
      {
        title: 'WebSockets for logs instead of polling',
        why: 'Build logs are a stream; pushing lines as they happen feels instant and avoids hammering the API with polls.',
        tradeoff: 'Connections need lifecycle handling (reconnects, closing when builds end).',
      },
    ],
    retro: [
      'Cache dependency layers between builds to cut repeat build times.',
      'Retention and garbage collection for old artifacts.',
      'A stricter sandbox (rootless runtime or gVisor) for stronger isolation of untrusted builds.',
    ],
  },

  queue_less: {
    problem:
      "Physical queues waste time and nobody knows how long they'll wait. Doing it virtually turns it into a concurrency problem: many phones joining, cancelling and checking in at once must all agree on exactly who is next.",
    steps: [
      ['qr', 'Join by QR', 'Scan to join the queue; QR check-in at the counter confirms the person is actually there.'],
      ['api', 'Queue operations', 'FastAPI endpoints handle join, cancel, staff controls, no-shows and check-in.'],
      ['postgres', 'Transaction-safe positions', 'Position updates happen inside transactions, so concurrent joins and cancels can’t corrupt the order.'],
      ['redis', 'Fan-out', 'Every change is published through Redis for live propagation.'],
      ['ws', 'Live positions + ETA', 'WebSocket clients receive their new position immediately; a rolling service-rate estimate keeps the wait-time prediction current.'],
    ],
    decisions: [
      {
        title: 'Postgres is the truth, Redis is the megaphone',
        why: 'Ordering has to be correct, so it lives in transactions. Redis only broadcasts changes and never decides who is next.',
        tradeoff: 'Two systems to keep in sync; a missed broadcast must be recoverable by re-reading state.',
      },
      {
        title: 'Rolling service-rate estimation for ETAs',
        why: 'A fixed average is wrong the moment a counter slows down. A rolling estimate adapts as throughput changes (you can watch it learn in the stress test on the home page).',
        tradeoff: 'Noisy until it has data, so it needs a sensible starting estimate.',
      },
      {
        title: 'No-shows as a first-class state',
        why: 'Someone who never turns up would otherwise block a counter indefinitely. Explicit no-show handling skips them and shifts everyone forward.',
        tradeoff: 'More states and transitions to test.',
      },
      {
        title: 'Load-test targets defined up front',
        why: '100+ simultaneous participants, 1,000 queue events, sub-500 ms p95 updates and under 20% ETA error: concrete numbers to build towards before calling it production-ready.',
        tradeoff: 'Targets, not guarantees, until they’re measured under real load.',
      },
    ],
    retro: [
      'Per-counter service rates instead of one shared estimate.',
      'Prediction intervals (“6–9 min”) instead of a single number.',
      'An SMS fallback for people who close the page.',
    ],
  },

  ops_flow: {
    problem:
      "When production breaks, teams juggle chat threads, spreadsheets and memory. And in a multi-tenant tool the worst possible bug isn't downtime, it's one organization seeing another's incidents.",
    steps: [
      ['jwt', 'Authentication', 'JWT-based authentication for every request.'],
      ['rbac', 'Tenant-scoped authorization', 'Role-based access control, with every resource scoped to the caller’s organization.'],
      ['postgres', 'Relational core', 'Users, teams, services, deployments, incidents, timelines and postmortems in a relational schema with Alembic migrations.'],
      ['redis', 'Notifications', 'Redis-backed notifications for incident and release events.'],
      ['ws', 'Realtime timeline', 'WebSocket events keep incident timelines live for everyone watching.'],
    ],
    decisions: [
      {
        title: 'Tenant isolation as a tested invariant',
        why: 'Cross-tenant leaks are the highest-impact bug a multi-tenant product can ship, so isolation, permissions and rollback behaviour get dedicated test cases (100+ designed).',
        tradeoff: 'A larger test suite to maintain as the schema evolves.',
      },
      {
        title: 'Transactions across related resources',
        why: 'Incidents, timeline entries and related records change together. Transaction-safe workflows mean there’s never a half-written incident.',
        tradeoff: 'Longer transactions need care to avoid contention.',
      },
      {
        title: 'Migrations from day one',
        why: 'Alembic keeps schema changes versioned and reviewable, which matters once real tenants have real data.',
        tradeoff: 'A little ceremony for every schema change.',
      },
      {
        title: 'Realtime by default',
        why: 'During an incident, a page refresh is too slow. WebSocket events keep everyone on the same timeline.',
        tradeoff: 'Events must also respect tenant scoping, so they’re another surface to test.',
      },
    ],
    retro: [
      'Postgres row-level security as a second line of defence for tenant isolation.',
      'An audit log for every permission-sensitive action.',
      'Integrations (Slack, paging tools) for incident alerts.',
    ],
  },
}
