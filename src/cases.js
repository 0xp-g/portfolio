// ─────────────────────────────────────────────────────────────
//  Case studies: one per project, at /projects/<id>.
//  Every number here matches docs/RESULTS.md in the project repo.
//  `measured` = the test conditions; `bugs` = real bugs the
//  measurements caught. (Content is English-only; the page chrome is translated.)
// ─────────────────────────────────────────────────────────────
export const cases = {
  repo_lens: {
    problem:
      "LLM answers about a codebase are confidently wrong. Plain chunk-and-embed RAG loses the code's structure: it doesn't know which function calls which, so it can't answer “what happens when a job fails?”, and it can't show where an answer came from.",
    steps: [
      ['git', 'Deterministic snapshots', 'Every ingest pins an exact Git snapshot, so an answer is always reproducible against the code it was built from.'],
      ['ast', 'Parse, don’t split', 'AST parsing extracts functions, classes, imports and calls with exact line ranges, instead of cutting text into arbitrary chunks.'],
      ['celery', 'Index off the request path', 'One Celery task per job runs clone → parse → embed → index; jobs run in parallel across workers, progress streams over Redis, and tenant quotas cap repos and files.'],
      ['pgvector', 'Vectors + a graph', 'Symbols are embedded into pgvector; calls and imports form a dependency graph that can be traversed next to the vectors.'],
      ['rag', 'Cite or don’t answer', 'Vector search finds seed symbols, a bounded graph walk adds their callers and callees, and every citation comes from the index (LLM citations are checked against the evidence).'],
    ],
    decisions: [
      {
        title: 'AST symbols over fixed-size text chunks',
        why: 'Chunks split functions mid-body and lose names. Symbols are natural retrieval units, and their exact line ranges are what make precise citations possible.',
        tradeoff: 'Only Python is parsed into symbols today; other languages would need their own parser (tree-sitter is the plan).',
      },
      {
        title: 'pgvector inside Postgres instead of a separate vector DB',
        why: 'Embeddings, symbol metadata and graph edges live in one transactional store and join with plain SQL. One less service to run and keep consistent.',
        tradeoff: 'At very large scale a dedicated ANN service could outperform it.',
      },
      {
        title: 'Atomic re-index into a fresh snapshot',
        why: 'A re-index builds a new snapshot for the new commit and switches to it only on success, so a failed or half-finished run never replaces a working index. A redelivered task for a finished job is a no-op.',
        tradeoff: 'Two copies exist briefly during a re-index, and old snapshots need cleaning up.',
      },
      {
        title: 'Citations are part of the contract',
        why: 'An architecture answer without file:line evidence can’t be trusted or checked. Grounding every claim in the source is the whole point of the tool.',
        tradeoff: 'Some questions honestly get “not enough evidence” instead of a confident guess. That’s intended.',
      },
    ],
    retro: [
      'Incremental re-indexing: re-parse only the files that changed between commits instead of a full re-ingest.',
      'Swap the local hash embeddings for a real embedding model and re-run the same 36-question evaluation to compare.',
      'A tree-sitter based parser layer to widen language support without one parser per language.',
    ],
    measured:
      '10 public Python repositories (640 files, 14,797 chunks) indexed by one Celery worker with PostgreSQL 16 + pgvector on a 4-vCPU VM, using local hash embeddings; 36 hand-written questions, each with the file that should be retrieved. recall@8 = the right file is in the top 8 results.',
    bugs: [
      {
        title: 'Decorators counted as calls',
        what: 'The call extractor walked the whole function node, so decorator calls like @click.option(...) became fake call edges, about 19% of the edges in click.',
        fix: 'Walk only node.body; a regression test pins it.',
      },
      {
        title: 'Filtered vector search returned nothing',
        what: 'The HNSW index returns its top candidates first and the tenant/snapshot filter runs afterwards, so a filtered query could end up with zero rows. Recall sat at 61%.',
        fix: 'Raise hnsw.ef_search and fall back to an exact scan when the filtered result is short. Recall went from 61% to 75%.',
      },
    ],
  },

  deploy_lite: {
    problem:
      "Deploying a frontend shouldn't require configuring a server. But a deployment platform has to run other people's build scripts, and one runaway build must never take the platform, or anyone else's deploy, down with it.",
    steps: [
      ['webhook', 'Push triggers a deploy', 'An HMAC-verified GitHub webhook (de-duplicated by delivery id) creates a deployment record in PostgreSQL and enqueues a build; the API returns 202 immediately.'],
      ['celery', 'Async build queue', 'Builds run on Celery workers via Redis, independent of API request handling, however long they take.'],
      ['docker', 'Limited builds', 'The exact commit is checked out and built in a throwaway Docker container with memory, CPU, PID and timeout limits; logs stream live over WebSockets.'],
      ['minio', 'Artifacts, not servers', 'Build output is stored in MinIO object storage, keyed by deployment, with full deployment history in PostgreSQL.'],
      ['nginx', 'A URL per deploy', 'One wildcard Nginx rule maps d-<slug>.host to that deployment’s files in MinIO, so publishing needs no config change or reload.'],
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
        tradeoff: 'Container start-up adds overhead, and the worker talks to the Docker socket, which is root-equivalent on the host. Fine for a demo; production needs rootless Docker or a separate build VM.',
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
    measured:
      '10 simultaneous builds through the full path (webhook → Celery → real Docker builds → object storage → Nginx) on a 4-vCPU VM, plus 50 scripted success, failure, redeploy and webhook workflows. The sample repos have no npm dependencies, so this measures the platform, not npm install time. Artifacts went to an S3-compatible stand-in (MinIO images were blocked there); Compose runs real MinIO.',
    bugs: [
      {
        title: '.git was published',
        what: 'A test caught it: a static site with output directory "." published the repository’s .git folder, exposing its whole history at the deployment URL.',
        fix: 'Exclude .git and node_modules from every upload; the test now asserts .git is never published.',
      },
      {
        title: 'Bucket startup race',
        what: 'Found while writing the setup guide: if MinIO started after the API, the storage bucket was never created and every upload failed.',
        fix: 'The worker now creates the bucket before an upload when it is missing, so start-up order no longer matters.',
      },
    ],
  },

  queue_less: {
    problem:
      "Physical queues waste time and nobody knows how long they'll wait. Doing it virtually turns it into a concurrency problem: many phones joining, cancelling and checking in at once must all agree on exactly who is next.",
    steps: [
      ['qr', 'Join by QR', 'A signed QR that rotates daily lets people join; a counter QR that rotates every 30 seconds confirms they are actually there.'],
      ['api', 'Queue operations', 'FastAPI endpoints handle join, cancel, staff controls, no-shows and check-in.'],
      ['postgres', 'Correct under concurrency', 'Call-next locks the next waiting ticket with FOR UPDATE SKIP LOCKED; positions are computed from the order, never stored, so a cancel can’t leave gaps.'],
      ['redis', 'Fan-out after commit', 'Events are published to Redis only after the transaction commits, so every API instance hears about changes that really happened.'],
      ['ws', 'Live positions + ETA', 'Each instance pushes versioned personal views over WebSockets; an EWMA of service times keeps the wait estimate current.'],
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
        title: 'Versioned full views instead of diffs',
        why: 'Each message carries the whole personal view with a version number, so a lost or out-of-order message is harmless: the client keeps the newest version, and a reconnect starts from a fresh snapshot.',
        tradeoff: 'Slightly larger messages than sending only the change.',
      },
    ],
    retro: [
      'Per-counter service rates instead of one shared estimate.',
      'Prediction intervals (“6–9 min”) instead of a single number.',
      'An SMS fallback for people who close the page.',
    ],
    measured:
      '3 rounds of 100 simultaneous joins (300 participants, 900 queue events) against the Docker Compose stack (one API container, PostgreSQL 16, Redis 7) on a 4-vCPU VM, 2 counters, 2 s mean simulated service time. Latency = event committed → WebSocket message received; ETA error compares the predicted wait to the actual wait in a simulated session.',
    bugs: [
      {
        title: 'Fetch inside render',
        what: 'The ticket page ran a side effect directly in render, before it even knew which queue the ticket belonged to.',
        fix: 'Move it into useEffect, and make the socket hook wait until it has a queue ID.',
      },
      {
        title: 'Two ETA tests expected the wrong thing',
        what: 'With an idle counter, the first visitor is called immediately (ETA 0) and the second waits one service. The tests assumed otherwise: the expectation was wrong, not the estimator.',
        fix: 'Correct the expectations and keep the idle-counter case as an explicit test.',
      },
    ],
  },

  ops_flow: {
    problem:
      "When production breaks, teams juggle chat threads, spreadsheets and memory. And in a multi-tenant tool the worst possible bug isn't downtime, it's one organization seeing another's incidents.",
    steps: [
      ['jwt', 'Authentication', 'JWT authentication that re-reads the user on every request, so a role change or deactivation applies immediately.'],
      ['rbac', 'Tenant-scoped authorization', 'Level-based roles (viewer < member < manager < admin); every query is scoped to the caller’s organization, and other orgs’ resources return 404.'],
      ['postgres', 'Relational core', 'Users, teams, services, deployments, incidents, timelines and postmortems in a relational schema with Alembic migrations.'],
      ['redis', 'Org events', 'Incident and release events are published to Redis after commit, on one channel per organization.'],
      ['ws', 'Realtime timeline', 'WebSocket events keep incident timelines live for everyone watching.'],
    ],
    decisions: [
      {
        title: 'Tenant isolation as a tested invariant',
        why: 'Cross-tenant leaks are the highest-impact bug a multi-tenant product can ship, so isolation is tested directly: 105 automated tests, including a 72-case RBAC matrix and 10 cross-tenant attacks that must all return 404.',
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
    measured:
      'pytest against a real PostgreSQL, in GitHub Actions on every push. The RBAC matrix checks every role against every protected action; the cross-tenant tests use org B’s token on org A’s IDs.',
    bugs: [
      {
        title: 'Fake heartbeat',
        what: 'A realtime test received a ping instead of the incident event. redis-py’s first get_message() returns None for the subscribe confirmation, and the loop treated None as 25 s of silence.',
        fix: 'Send heartbeats only after real silence, measured with a clock.',
      },
      {
        title: 'Services list didn’t refresh',
        what: 'A browser test timed out waiting for a new service to appear: the UI refetched only on WebSocket events, and services publish none.',
        fix: 'Fire a local “changed” event after every successful action; WebSockets stay for other people’s changes.',
      },
    ],
  },
}
