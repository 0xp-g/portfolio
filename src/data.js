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
  resumeJaUrl: '/resume-ja.pdf', // 履歴書・職務経歴書 (web version: no phone, birth date or photo)
  about: [
    "I'm a Computer Science student at Chennai Institute of Technology (graduating 2028) who likes the part of software most people never see: the queues, workers, schemas and sockets that keep everything else standing.",
    'Most of what I build starts with a "how would this actually work in production?" question, like isolating untrusted Docker builds, keeping queue positions consistent under concurrency, or making an LLM answer with file-and-line citations instead of guesses.',
    "Off the clock I'm a LeetCode Knight (900+ problems), a Japanese learner (JLPT N3, N2 next), and an anime and fiction fan whose favorite series is Re:Zero. It turns out “fail, learn, start again from zero” is also a decent philosophy for retry-safe distributed jobs.",
  ],
  ja: {
    role: 'バックエンド／システムエンジニア',
    roles: ['非同期ビルドパイプライン', 'リアルタイムキュー', '出典付きRAG', 'マルチテナントAPI', 'スケールするシステム'],
    tagline:
      'チェンナイでコンピュータサイエンスを学びながら、高負荷でも安定して動くバックエンドを開発しています。ワーカーキュー、リアルタイム配信、根拠を示して答える検索エンジンなど。',
    status: 'インターン・共同開発の機会を募集中',
    location: 'インド・チェンナイ',
    about: [
      'チェンナイ工科大学でコンピュータサイエンスを専攻している学生です（2028年卒業予定）。キュー、ワーカー、スキーマ、ソケットなど、多くの人が目にしない「システムを支える部分」が好きです。',
      '私の開発は、いつも「本番環境で本当に動くか？」という問いから始まります。信頼できないDockerビルドをどう隔離するか、並行処理の中でキューの順番をどう正しく保つか、LLMに推測ではなくファイル名と行番号を引用して答えさせるにはどうするか。',
      'コード以外では、LeetCodeでKnightを獲得し（900問以上）、日本語も勉強しています（JLPT N3合格、次はN2）。アニメや物語が大好きで、一番好きな作品は『Re:ゼロから始める異世界生活』です。「失敗して、学んで、ゼロからやり直す」という考え方は、リトライ安全な分散ジョブの設計にも通じます。',
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
    { name: 'Clone Worker Swarm', jp: '分身ワーカー', desc: 'Runs clone → parse → embed pipelines on parallel Celery workers, off the request path.', jaDesc: 'clone→解析→埋め込みのパイプラインを並列Celeryワーカーで実行し、リクエスト処理を妨げない。' },
    { name: 'Transaction Barrier', jp: 'トランザクション結界', desc: 'SKIP LOCKED and compare-and-set: two counters never call the same person.', jaDesc: 'SKIP LOCKEDと比較交換で、2つの窓口が同じ人を呼ぶことはない。' },
    { name: 'Citation Eye', jp: '引用の眼', desc: 'Answers point to the exact file and line, never guesses.', jaDesc: '推測せず、正確なファイルと行を示す。' },
    { name: 'Return to Zero', jp: 'ゼロからの再試行', desc: 'Idempotent, retry-safe jobs: a redelivered task is a no-op, and a failed re-index rolls back to the last good index.', jaDesc: '冪等でリトライ安全なジョブ。再配信されたタスクは何もせず、失敗した再インデックスは直前の正常な状態に戻る。' },
    { name: 'Sandbox Seal', jp: '封印サンドボックス', desc: 'Builds run in memory-, CPU-, PID- and time-limited containers; a runaway build is killed, not the platform.', jaDesc: 'メモリ・CPU・PID・時間を制限したコンテナでビルド。暴走したビルドだけが止まり、基盤は落ちない。' },
  ],
}

export const projects = [
  {
    id: 'repo_lens',
    title: 'RepoLens',
    kind: 'code intelligence · RAG',
    tagline: 'Ask a codebase a question and get an answer that cites the exact files and line numbers at a pinned commit.',
    repo: 'https://github.com/0xp-g/repo_lens',
    pipeline: [
      ['git', 'pin commit SHA'],
      ['ast', 'parse symbols'],
      ['celery', 'index worker'],
      ['pgvector', '+ dep graph'],
      ['rag', 'cited answer'],
    ],
    points: [
      'Pins every index to an exact commit and extracts modules, classes, functions, methods, imports, calls and exact line ranges with Python AST parsing.',
      'Combines pgvector cosine retrieval with bounded dependency-graph expansion; citations come from the index, and LLM citations are verified against the evidence.',
      'Celery workers run clone → parse → embed → index with Redis progress streaming, an atomic re-index (a failed re-index keeps serving the old commit) and tenant quotas.',
      'Evaluated on 10 public repos (640 files, 14,797 chunks): 75% recall@8 on 36 questions, 14 ms p95 queries. The evaluation also caught two real bugs, both fixed with tests.',
    ],
    metrics: [
      { v: '75%', k: 'recall@8 (36 Qs)' },
      { v: '10', k: 'public repos evaluated' },
      { v: '14 ms', k: 'p95 query' },
    ],
    tech: ['FastAPI', 'React', 'TypeScript', 'PostgreSQL', 'pgvector', 'Redis', 'Celery', 'AST', 'RAG', 'Docker'],
    ja: {
      kind: 'コード解析・RAG',
      tagline: 'コードベースに質問すると、固定したコミット上の正確なファイル名と行番号を引用して答えてくれるエンジン。',
      points: [
        'インデックスを正確なコミットに固定し、Python AST解析でモジュール・クラス・関数・メソッド・import・呼び出し・正確な行範囲を抽出。',
        'pgvectorのコサイン検索と範囲を限定した依存グラフ探索を組み合わせ、引用はインデックスから生成。LLMの引用は根拠と照合して検証。',
        'Celeryワーカーがclone→解析→埋め込み→インデックスを実行し、Redisで進捗を配信。再インデックスは原子的に置き換え（失敗時は旧コミットのまま提供）、テナント別の上限付き。',
        '公開リポジトリ10件（640ファイル、14,797チャンク）で評価：36問でrecall@8 75%、p95 14ms。評価中に実際のバグを2件発見し、テスト付きで修正。',
      ],
      metrics: ['recall@8（36問）', '評価リポジトリ', 'p95 クエリ'],
    },
  },
  {
    id: 'deploy_lite',
    title: 'Deploy-Lite',
    kind: 'deployment engine',
    tagline: 'Push to GitHub and get a shareable URL: resource-limited Docker builds, live logs, one wildcard Nginx route.',
    repo: 'https://github.com/0xp-g/deploy_lite',
    pipeline: [
      ['webhook', 'HMAC-verified'],
      ['celery', 'queue build'],
      ['docker', 'limited build'],
      ['minio', 'artifacts'],
      ['nginx', 'd-<slug> url'],
    ],
    points: [
      'Checks out the exact commit and builds frontends in throwaway Docker containers with per-project memory, CPU, PID and timeout limits (memory and timeout kills are tested).',
      'GitHub webhooks are HMAC-verified over the raw body and de-duplicated by delivery id; builds run on Celery/Redis with live WebSocket logs and PostgreSQL history.',
      'Build output goes to MinIO and is served by a single wildcard Nginx rule: publishing is just an upload, with no per-deploy config or reloads.',
      'Validated 10 simultaneous builds (10/10, 2.8 s p95 trigger → live) and 50/50 success, failure, redeploy and webhook workflows.',
    ],
    metrics: [
      { v: '10/10', k: 'simultaneous builds' },
      { v: '50/50', k: 'workflows passed' },
      { v: '2.8 s', k: 'p95 trigger → live' },
    ],
    tech: ['FastAPI', 'Docker', 'Celery', 'Redis', 'PostgreSQL', 'Nginx', 'MinIO', 'WebSockets', 'GitHub Webhooks'],
    ja: {
      kind: 'デプロイエンジン',
      tagline: 'GitHubにpushするだけで共有URLを発行。リソース制限付きのDockerビルド、リアルタイムのビルドログ、ワイルドカード指定のNginxルート1本で運用。',
      points: [
        '正確なコミットをチェックアウトし、プロジェクトごとのメモリ・CPU・PID・タイムアウト制限付きの使い捨てDockerコンテナでビルド（メモリ超過・タイムアウトの強制終了をテスト済み）。',
        'GitHub Webhookは生のリクエストボディでHMAC検証し、配信IDで重複排除。Celery/Redisで非同期ビルドし、WebSocketでログを配信、履歴はPostgreSQLに保存。',
        'ビルド成果物はMinIOに保存し、ワイルドカードのNginxルール1本で配信。公開はアップロードするだけで、デプロイごとの設定やリロードは不要。',
        '同時ビルド10件（10/10成功、p95 2.8秒）と、成功・失敗・再デプロイ・Webhookの50ワークフロー（50/50合格）で検証。',
      ],
      metrics: ['同時ビルド成功', 'ワークフロー合格', 'p95 公開まで'],
    },
  },
  {
    id: 'queue_less',
    title: 'QueueLess',
    kind: 'realtime platform',
    tagline: 'Virtual queues with QR join and check-in, live positions and wait-time prediction that stay correct under concurrency.',
    repo: 'https://github.com/0xp-g/queue_less',
    pipeline: [
      ['qr', 'signed join'],
      ['api', 'FastAPI'],
      ['postgres', 'SKIP LOCKED'],
      ['redis', 'pub/sub'],
      ['ws', 'live clients'],
    ],
    points: [
      'Signed daily-rotating join QR, a 30-second rotating counter QR for check-in, staff controls, cancellation, auto no-show and requeue.',
      'Call-next uses FOR UPDATE SKIP LOCKED, joins are idempotent, and positions are computed rather than stored: tested with zero double-calls under concurrent counters.',
      'Events are published to Redis after commit and every API instance pushes personal views over WebSockets (tested across two servers); an EWMA estimates wait times.',
      'Load-tested 300 participants and 900 queue events: 80 ms p95 live updates and 13.5% median wait-time prediction error.',
    ],
    metrics: [
      { v: '80 ms', k: 'p95 live update' },
      { v: '300', k: 'participants tested' },
      { v: '13.5%', k: 'median ETA error' },
    ],
    tech: ['FastAPI', 'React', 'PostgreSQL', 'Redis', 'WebSockets', 'QR Workflows', 'Docker'],
    ja: {
      kind: 'リアルタイム基盤',
      tagline: 'QRでの参加・チェックイン、リアルタイムの順番表示、待ち時間予測。同時操作でも正しく動くバーチャル整理券。',
      points: [
        '毎日更新される署名付き参加QR、30秒ごとに変わる窓口チェックインQR、スタッフ操作、キャンセル、自動不在処理、再登録。',
        '呼び出しはFOR UPDATE SKIP LOCKED、参加は冪等、順番は保存せず計算。複数窓口の同時操作で二重呼び出しゼロをテストで確認。',
        'コミット後にRedisへ配信し、各APIインスタンスがWebSocketで個別の画面を更新（2台のサーバーでテスト済み）。待ち時間はEWMAで推定。',
        '参加者300人・キューイベント900件で負荷テスト：リアルタイム更新p95 80ms、待ち時間予測誤差（中央値）13.5%。',
      ],
      metrics: ['p95 リアルタイム更新', '負荷テスト参加者', '予測誤差（中央値）'],
    },
  },
  {
    id: 'ops_flow',
    title: 'OpsFlow',
    kind: 'multi-tenant SaaS',
    tagline: 'Incident and release management for teams: services, incidents, timelines, postmortems and rollbacks, isolated per organization.',
    repo: 'https://github.com/0xp-g/ops_flow',
    pipeline: [
      ['jwt', 'auth + reload'],
      ['rbac', 'role levels'],
      ['postgres', 'one commit'],
      ['redis', 'org events'],
      ['ws', 'live timeline'],
    ],
    points: [
      'Organizations manage users, roles, teams, services, incidents, timelines, postmortems and releases with rollback (history is never overwritten).',
      'JWT auth that re-reads the user on every request, level-based RBAC, tenant-scoped authorization (other orgs get 404), Alembic migrations and single-transaction workflows.',
      'Post-commit Redis events over org-scoped WebSockets, Docker Compose, and GitHub Actions CI with 105 automated tests, including a 72-case RBAC matrix and 10 cross-tenant attacks.',
    ],
    metrics: [
      { v: '105', k: 'automated tests' },
      { v: '72', k: 'RBAC matrix cases' },
      { v: '10/10', k: 'cross-tenant attacks blocked' },
    ],
    tech: ['FastAPI', 'React', 'TypeScript', 'PostgreSQL', 'SQLAlchemy', 'Alembic', 'JWT', 'Redis', 'Docker'],
    ja: {
      kind: 'マルチテナントSaaS',
      tagline: 'チーム向けのインシデント・リリース管理。サービス、インシデント、タイムライン、ポストモーテム、ロールバックを組織ごとに分離。',
      points: [
        '組織がユーザー、ロール、チーム、サービス、インシデント、タイムライン、ポストモーテム、ロールバック付きリリースを管理（履歴は上書きしない）。',
        'リクエストごとにユーザーを再読み込みするJWT認証、レベル制RBAC、テナント単位の認可（他組織には404）、Alembicマイグレーション、単一トランザクションのワークフロー。',
        'コミット後のRedisイベントを組織単位のWebSocketで配信。Docker ComposeとGitHub Actions CI、105件の自動テスト（RBACマトリクス72件・テナント越境攻撃10件を含む）。',
      ],
      metrics: ['自動テスト', 'RBACマトリクス', 'テナント越境の遮断'],
    },
  },
]

export const skills = {
  Languages: ['Python', 'Java', 'SQL', 'TypeScript'],
  'Backend & Systems': ['FastAPI', 'REST APIs', 'WebSockets', 'Celery', 'JWT', 'RBAC', 'SQLAlchemy', 'Alembic', 'Redis'],
  Frontend: ['React', 'React Router', 'HTML5', 'CSS3'],
  'Data stores': ['PostgreSQL', 'pgvector', 'MySQL', 'MinIO'],
  'DevOps & Tools': ['Docker', 'Docker Compose', 'Nginx', 'Git', 'GitHub Actions', 'CI/CD', 'Postman', 'pytest', 'Playwright'],
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
      title: 'チェンナイ工科大学 コンピュータ科学工学科（B.E.）',
      body: ['CGPA 7.98', 'DSA・OOP・DBMS・OS・ネットワーク・機械学習・システム設計'],
    },
  },
]
