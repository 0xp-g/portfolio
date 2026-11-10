// ─────────────────────────────────────────────────────────────
//  All site content lives here. Fields under `ja:` are the
//  Japanese versions used when the 日本語 toggle is on.
// ─────────────────────────────────────────────────────────────
export const profile = {
  name: 'Yogesh O K',
  handle: 'yogesh',
  githubUser: '0xp-g',
  kana: 'ヨゲシュ',
  role: 'Backend & Systems Engineer',
  roles: ['async build pipelines', 'realtime queues', 'RAG with citations', 'multi-tenant APIs', 'things that scale'],
  tagline:
    'CS undergrad in Chennai building backend systems that stay calm under load: worker queues, realtime streams, and retrieval engines that cite their sources.',
  status: 'open to internships & collaborations',
  location: 'Chennai, India',
  coords: '13.08°N 80.27°E',
  email: 'yogesh.karmegam@gmail.com',
  github: 'https://github.com/0xp-g',
  linkedin: 'https://linkedin.com/in/yogesh-o-k-737320328',
  resumeUrl: '/resume.pdf',
  about: [
    "I'm a Computer Science student at Chennai Institute of Technology (graduating 2028) who likes the part of software most people never see: the queues, workers, schemas and sockets that keep everything else standing.",
    'Most of what I build starts with a "how would this actually work in production?" question, like isolating untrusted Docker builds, keeping queue positions consistent under concurrency, or making an LLM answer with file-and-line citations instead of guesses.',
    "Off the clock I'm a LeetCode Knight (900+ problems), a Japanese learner (JLPT N3, N2 next), and an anime and fiction fan whose favorite series is Re:Zero. It turns out “fail, learn, start again from zero” is also a decent philosophy for retry-safe distributed jobs.",
  ],
  ja: {
    role: 'バックエンド／システムエンジニア',
    roles: ['非同期ビルドパイプライン', 'リアルタイムキュー', '出典付きRAG', 'マルチテナントAPI', 'スケールするシステム'],
    tagline:
      'チェンナイでコンピュータサイエンスを学びながら、負荷がかかっても落ち着いて動くバックエンドを作っています。ワーカーキュー、リアルタイム配信、そして根拠を示せる検索エンジン。',
    status: 'インターン・共同開発の機会を募集中',
    location: 'インド・チェンナイ',
    about: [
      'チェンナイ工科大学でコンピュータサイエンスを専攻している学生です（2028年卒業予定）。キュー、ワーカー、スキーマ、ソケットなど、多くの人が目にしない「システムを支える部分」が好きです。',
      '作るものはいつも「本番環境で本当に動くか？」という問いから始まります。信頼できないDockerビルドの隔離、並行処理下でのキュー順位の整合性、そしてLLMに推測ではなくファイルと行番号を引用して答えさせること。',
      'コード以外では、LeetCode Knight（900問以上）、日本語学習者（JLPT N3合格、次はN2）、そしてアニメと物語が大好きで、一番好きな作品は『Re:ゼロから始める異世界生活』。「失敗して、学んで、ゼロからやり直す」は、リトライ安全な分散ジョブの設計思想でもあります。',
    ],
  },
}

export const stats = [
  { value: 900, suffix: '+', label: 'LeetCode problems', note: 'Knight badge', ja: { label: 'LeetCode 解答数', note: 'Knight バッジ' } },
  { value: 4, label: 'systems shipped', note: 'end-to-end, Dockerized', ja: { label: '開発したシステム', note: 'すべてDocker化' } },
  { value: 7.98, decimals: 2, label: 'CGPA', note: 'B.E. CSE · 2028', ja: { label: 'CGPA', note: 'B.E. CSE・2028年' } },
  { text: 'N3', label: 'JLPT Japanese', note: 'N2 in progress', ja: { label: '日本語能力試験', note: 'N2 勉強中' } },
]

// RPG-style character sheet. Stats are self-assessed and just for fun: tune them.
export const character = {
  fields: [
    ['Class', 'Backend / Systems Engineer', 'クラス', 'バックエンド／システム'],
    ['Origin', 'Chennai, India', '出身', 'インド・チェンナイ'],
    ['Alignment', 'Lawful Asynchronous', '属性', '秩序・非同期'],
    ['Current arc', 'Training arc (B.E. CSE, 2028)', '現在の章', '修行編（2028年卒業予定）'],
    ['Languages', 'English · Tamil · 日本語 N3', '言語', '英語・タミル語・日本語N3'],
    ['Favorite series', 'Re:Zero − Starting Life in Another World', '好きな作品', 'Re:ゼロから始める異世界生活'],
    ['Fuel', 'anime, fiction & late-night system design', '燃料', 'アニメ、物語、深夜のシステム設計'],
  ],
  radar: [
    ['Backend', 'バックエンド', 90],
    ['Systems', '設計', 80],
    ['DSA', 'アルゴリズム', 86],
    ['Databases', 'データベース', 82],
    ['AI / RAG', 'AI・RAG', 72],
    ['Frontend', 'フロント', 62],
  ],
  moves: [
    { name: 'Clone Worker Swarm', jp: '分身ワーカー', desc: 'Splits clone, parse and embed into parallel Celery workers.', jaDesc: 'clone・解析・埋め込みを並列Celeryワーカーへ分割。' },
    { name: 'Transaction Barrier', jp: 'トランザクション結界', desc: 'Queue positions stay consistent under concurrent writes.', jaDesc: '同時書き込みでもキュー順位の整合性を保つ。' },
    { name: 'Citation Eye', jp: '引用の眼', desc: 'Answers point to the exact file and line, never guesses.', jaDesc: '推測せず、正確なファイルと行を示す。' },
    { name: 'Return to Zero', jp: 'ゼロからの再試行', desc: 'Idempotent, retry-safe jobs: any failure restarts cleanly from the last checkpoint.', jaDesc: '冪等でリトライ安全なジョブ。失敗しても直前のチェックポイントからやり直せる。' },
    { name: 'Sandbox Seal', jp: '封印サンドボックス', desc: 'Untrusted builds stay locked in resource-limited containers.', jaDesc: '信頼できないビルドを制限付きコンテナに封じ込める。' },
  ],
}

export const projects = [
  {
    id: 'repo_lens',
    title: 'RepoLens',
    kind: 'code intelligence · RAG',
    tagline: 'Ask a codebase a question and get an answer that cites the exact files and line numbers.',
    repo: 'https://github.com/0xp-g/repo_lens',
    pipeline: [
      ['git', 'snapshot'],
      ['ast', 'parse symbols'],
      ['celery', 'embed workers'],
      ['pgvector', '+ dep graph'],
      ['rag', 'cited answer'],
    ],
    points: [
      'Ingests deterministic Git snapshots and extracts functions, classes, imports, calls and exact line ranges via AST parsing.',
      'Blends dependency-graph traversal with pgvector retrieval so architecture answers come with source-file and line citations.',
      'Clone, parse and embed run as separate Celery workers over Redis, with progress streaming and tenant-aware resource limits.',
    ],
    metrics: [
      { v: '20+', k: 'repos validated' },
      { v: '10k+', k: 'source files' },
      { v: '100', k: 'eval queries' },
    ],
    tech: ['FastAPI', 'React', 'PostgreSQL', 'pgvector', 'Redis', 'Celery', 'AST', 'RAG', 'Docker'],
    ja: {
      kind: 'コード解析・RAG',
      tagline: 'コードベースに質問すると、正確なファイル名と行番号を引用して答えてくれるエンジン。',
      points: [
        '決定論的なGitスナップショットを取り込み、AST解析で関数・クラス・import・呼び出し・正確な行範囲を抽出。',
        '依存グラフの探索とpgvector検索を組み合わせ、アーキテクチャの質問にファイルと行単位の引用付きで回答。',
        'clone・解析・埋め込みをRedis経由の別々のCeleryワーカーに分離し、進捗配信とテナント別のリソース制御を実装。',
      ],
      metrics: ['検証リポジトリ', 'ソースファイル', '評価クエリ'],
    },
  },
  {
    id: 'deploy_lite',
    title: 'Deploy-Lite',
    kind: 'deployment engine',
    tagline: 'Push to GitHub and get a shareable URL: isolated Docker builds with live logs.',
    repo: 'https://github.com/0xp-g/deploy_lite',
    pipeline: [
      ['webhook', 'github push'],
      ['celery', 'queue build'],
      ['docker', 'sandboxed'],
      ['minio', 'artifacts'],
      ['nginx', 'live url'],
    ],
    points: [
      'Clones repos and runs isolated Docker builds with configurable CPU, memory and timeout limits before publishing frontends.',
      'Builds run async via Celery/Redis and are triggered by GitHub webhooks, with WebSocket log streaming so they never block the API.',
      'Artifacts land in MinIO; Nginx reverse-proxy routing gives every deployment its own shareable URL.',
    ],
    metrics: [
      { v: '10', k: 'concurrent builds' },
      { v: '50', k: 'deploy workflows' },
      { v: 'live', k: 'WS log stream' },
    ],
    tech: ['FastAPI', 'Docker', 'Celery', 'Redis', 'PostgreSQL', 'Nginx', 'MinIO', 'WebSockets', 'GitHub Webhooks'],
    ja: {
      kind: 'デプロイエンジン',
      tagline: 'GitHubにpushすると共有URLが発行される。隔離されたDockerビルドとライブログ付き。',
      points: [
        'リポジトリをcloneし、CPU・メモリ・タイムアウトを設定できる隔離Dockerビルドを実行してからフロントエンドを公開。',
        'GitHub Webhookをトリガーに、Celery/Redisで非同期ビルド。WebSocketでログを配信し、APIをブロックしない設計。',
        '成果物はMinIOに保存し、Nginxのリバースプロキシで各デプロイ専用の共有URLを発行。',
      ],
      metrics: ['同時ビルド', 'デプロイフロー', 'WSログ配信'],
    },
  },
  {
    id: 'queue_less',
    title: 'QueueLess',
    kind: 'realtime platform',
    tagline: 'Virtual queues with QR check-in, live positions and wait-time prediction.',
    repo: 'https://github.com/0xp-g/queue_less',
    pipeline: [
      ['qr', 'join / check-in'],
      ['api', 'FastAPI'],
      ['postgres', 'txn-safe'],
      ['redis', 'pub/sub'],
      ['ws', 'live clients'],
    ],
    points: [
      'QR join/check-in, staff controls, cancellations, no-show handling and transaction-safe position updates.',
      'Redis + WebSockets push queue changes live; a rolling service-rate model re-estimates wait times as throughput shifts.',
      'Load testing set up for 100+ simultaneous participants and 1,000 queue events.',
    ],
    metrics: [
      { v: '<500ms', k: 'p95 target' },
      { v: '100+', k: 'live users' },
      { v: '<20%', k: 'ETA error target' },
    ],
    tech: ['FastAPI', 'React', 'PostgreSQL', 'Redis', 'WebSockets', 'QR Workflows', 'Docker'],
    ja: {
      kind: 'リアルタイム基盤',
      tagline: 'QRチェックイン、リアルタイムの順番表示、待ち時間予測を備えたバーチャル整理券システム。',
      points: [
        'QRでの参加・チェックイン、スタッフ操作、キャンセル・不在処理、トランザクション安全な順番更新。',
        'RedisとWebSocketで変更を即時配信し、処理速度の移動推定で待ち時間を再計算。',
        '同時参加者100人以上・キューイベント1,000件の負荷テストを設計。',
      ],
      metrics: ['p95 目標', '同時ユーザー', '予測誤差 目標'],
    },
  },
  {
    id: 'ops_flow',
    title: 'OpsFlow',
    kind: 'multi-tenant SaaS',
    tagline: 'Incident and release management for teams: services, deploys, timelines and postmortems.',
    repo: 'https://github.com/0xp-g/ops_flow',
    pipeline: [
      ['jwt', 'auth'],
      ['rbac', 'tenant scope'],
      ['postgres', 'alembic'],
      ['redis', 'events'],
      ['ws', 'timeline'],
    ],
    points: [
      'Organizations manage users, teams, services, deployments, incidents, timelines and postmortems.',
      'JWT auth, RBAC and tenant-scoped authorization over a relational schema with Alembic migrations and transaction-safe workflows.',
      'Redis-backed notifications, realtime WebSocket events, Docker Compose and CI/CD automation.',
    ],
    metrics: [
      { v: '100+', k: 'test cases' },
      { v: 'RBAC', k: 'tenant isolation' },
      { v: 'CI/CD', k: 'automated' },
    ],
    tech: ['FastAPI', 'React', 'TypeScript', 'PostgreSQL', 'SQLAlchemy', 'Alembic', 'JWT', 'Redis', 'Docker'],
    ja: {
      kind: 'マルチテナントSaaS',
      tagline: 'チーム向けのインシデント・リリース管理。サービス、デプロイ、タイムライン、ポストモーテム。',
      points: [
        '組織がユーザー、チーム、サービス、デプロイ、インシデント、タイムライン、ポストモーテムを管理。',
        'JWT認証、RBAC、テナント単位の認可。Alembicマイグレーションとトランザクション安全なワークフロー。',
        'Redisによる通知、WebSocketのリアルタイムイベント、Docker Compose、CI/CD自動化。',
      ],
      metrics: ['テストケース', 'テナント分離', '自動化'],
    },
  },
]

export const skills = {
  Languages: ['Python', 'Java', 'SQL', 'TypeScript'],
  'Backend & Systems': ['FastAPI', 'REST APIs', 'WebSockets', 'Celery', 'JWT', 'RBAC', 'SQLAlchemy', 'Alembic', 'Redis'],
  Frontend: ['React', 'React Router', 'HTML5', 'CSS3'],
  'Data stores': ['PostgreSQL', 'pgvector', 'MySQL', 'MinIO'],
  'DevOps & Tools': ['Docker', 'Docker Compose', 'Nginx', 'Git', 'GitHub Actions', 'CI/CD', 'Postman'],
  'AI / Data': ['RAG', 'Embeddings', 'AST', 'Dependency Graphs', 'Web Scraping', 'Prompt Engineering', 'Cosine Similarity'],
}

export const skillGroupsJa = {
  Languages: '言語',
  'Backend & Systems': 'バックエンド',
  Frontend: 'フロントエンド',
  'Data stores': 'データストア',
  'DevOps & Tools': 'DevOps・ツール',
  'AI / Data': 'AI・データ',
}

// rendered as a `git log`, newest first
export const log = [
  {
    hash: 'a1f9c2e',
    ref: 'HEAD → main',
    when: 'May – Jun 2026',
    type: 'feat',
    scope: 'internship',
    title: 'Software Development Intern @ eGRCXperts, Chennai',
    body: [
      'Built an RSA Archer workflow-automation system turning client workflow steps + Excel inputs into videos, mind maps and UI visualizations.',
      'Web-scraping and search-API pipelines with cosine-similarity classification to map cybersecurity-tool capabilities.',
      'API-oriented data transformation and structured-output workflows for internal GRC product analysis.',
    ],
    ja: {
      when: '2026年5月〜6月',
      title: 'eGRCXperts（チェンナイ）ソフトウェア開発インターン',
      body: [
        'クライアントの業務手順とExcel入力から動画・マインドマップ・UI可視化を生成する、RSA Archer業務自動化システムを構築。',
        'Webスクレイピングと検索APIのパイプラインを開発し、コサイン類似度でサイバーセキュリティツールの機能を分類。',
        '社内GRC製品分析のための、API指向のデータ変換と構造化出力ワークフローを実装。',
      ],
    },
  },
  {
    hash: '7c4e0b1',
    when: 'ongoing',
    type: 'perf',
    scope: 'dsa',
    title: 'LeetCode Knight: 900+ problems solved',
    body: ['Graphs, dynamic programming and the core data structures, practised daily.'],
    ja: { when: '継続中', title: 'LeetCode Knight：900問以上を解答', body: ['グラフ、動的計画法、主要なデータ構造を毎日練習。'] },
  },
  {
    hash: '3be8d55',
    when: 'N2 next',
    type: 'chore',
    scope: '日本語',
    title: 'Passed JLPT N3, now studying for N2',
    body: ['Also: English (professional), Tamil (native).'],
    ja: { when: '次はN2', title: 'JLPT N3合格、現在N2を勉強中', body: ['英語（ビジネスレベル）、タミル語（母語）。'] },
  },
  {
    hash: '0d2a7f4',
    when: 'exp. 2028',
    type: 'init',
    scope: 'edu',
    title: 'B.E. Computer Science & Engineering, Chennai Institute of Technology',
    body: ['CGPA 7.98', 'DSA · OOP · DBMS · Operating Systems · Computer Networks · Machine Learning · System Design'],
    ja: {
      when: '2028年卒業予定',
      title: 'チェンナイ工科大学 コンピュータサイエンス工学科（B.E.）',
      body: ['CGPA 7.98', 'DSA・OOP・DBMS・OS・ネットワーク・機械学習・システム設計'],
    },
  },
]
