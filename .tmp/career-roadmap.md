# フルスタックエンジニア成長ロードマップ

## 目標

年収アップを目指し、フルスタックエンジニアとして成長する。
このリポジトリ（mt.github.io）をエンジニアとしての成長記録・ポートフォリオとして活用する。

---

## 業界標準のロードマップ

最もよく使われているロードマップは [roadmap.sh](https://roadmap.sh/) の[Full Stack Developer Roadmap](https://roadmap.sh/full-stack)。
GitHubで30万スター以上。インタラクティブにチェックしながら進捗管理できる。

### roadmap.shのフルスタック構成

```
フロントエンド → チェックポイント → バックエンド → チェックポイント → DevOps → チェックポイント
```

| Phase | 必須技術 | チェックポイント |
|-------|---------|---------------|
| フロントエンド | HTML, CSS, JavaScript, npm, Tailwind CSS, React, Git, GitHub | 静的ページ → インタラクティブ → 外部パッケージ利用 → フロントエンドアプリ |
| バックエンド | Node.js, RESTful APIs, JWT認証, Redis, Linux基礎, PostgreSQL | CLIアプリ → CRUD → 完全なアプリ |
| DevOps | AWS(EC2, S3, VPC), GitHub Actions, Monitoring, Terraform | デプロイメント → CI/CD → モニタリング → 自動化 |

---

## 2026年版の詳細技術マップ

参考: [The Complete Full-Stack Developer Roadmap for 2026](https://dev.to/thebitforge/the-complete-full-stack-developer-roadmap-for-2026-2i0j)

### 1. 基礎（Core Foundations）

| 領域 | 具体的な技術/知識 | 現状 |
|------|-----------------|------|
| プログラミング基礎 | データ構造、アルゴリズム、時間計算量 | ? |
| Web基礎 | HTTPライフサイクル、ステータスコード、キャッシュ、CORS、Cookie/Session | ? |
| JavaScript/TypeScript | async/await、クロージャ、スコープ | 済 |
| HTML/CSS | セマンティックHTML、Flexbox、Grid、レスポンシブデザイン | 済 |
| ブラウザ理解 | レンダリングパイプライン、イベントループ、DevTools、パフォーマンスプロファイリング | ? |

### 2. フロントエンド

| 領域 | 具体的な技術 | 現状 |
|------|------------|------|
| React | コンポーネント、Hooks（useState, useEffect）、状態管理 | 済 |
| 状態管理 | Context API, Redux, Zustand | ? |
| スタイリング | Tailwind CSS、コンポーネントライブラリ | 済 |
| ツール | Vite, pnpm/npm, ESLint, Prettier, TypeScript | 済 |
| メタフレームワーク | Next.js | 済 |
| アクセシビリティ | ARIA、キーボードナビゲーション、スクリーンリーダー、色コントラスト | 学習中 |
| パフォーマンス | コード分割、遅延読み込み、画像最適化、Web Vitals | 一部 |
| テスト | ユニット(Vitest)、結合(React Testing Library)、E2E(Playwright) | Vitest済 |

### 3. バックエンド

| 領域 | 具体的な技術 | 現状 |
|------|------------|------|
| 言語選択 | Node.js/TypeScript, Python, Go, Ruby | Rails済 |
| HTTP/REST API | RESTful原則、APIデザインパターン | ? |
| フレームワーク | Express, Fastify, NestJS | ? |
| 認証 | Session, JWT, OAuth 2.0, bcrypt/argon2 | Firebase Auth済 |
| ミドルウェア | リクエストバリデーション、ロギング、エラーハンドリング、レートリミット | ? |
| DB統合 | クエリ最適化、N+1防止、コネクションプーリング | ? |
| バックグラウンドジョブ | Bull, BullMQ、スケジューリング | ? |
| リアルタイム | WebSocket, Server-Sent Events | ? |
| バリデーション | Zod, Joi | ? |

### 4. データベース

| 領域 | 具体的な技術 | 現状 |
|------|------------|------|
| SQL | PostgreSQL（推奨デフォルト） | ? |
| データモデリング | 正規化、リレーション、スキーマ設計 | ? |
| SQLスキル | JOIN、集約、サブクエリ、CTE、ウィンドウ関数 | ? |
| インデックス | B-tree、複合インデックス、EXPLAIN解析 | ? |
| ORM | Prisma, TypeORM, Sequelize | ? |
| マイグレーション | バージョン管理、ロールバック | ? |
| トランザクション | ACID特性、分離レベル | ? |
| キャッシュ | Redis、TTL戦略、キャッシュ無効化 | ? |

### 5. API/セキュリティ

| 領域 | 具体的な技術 | 現状 |
|------|------------|------|
| APIスタイル | REST（推奨）、GraphQL、gRPC | ? |
| バージョニング | URLベース、ヘッダーベース | ? |
| 認証 | Session, JWT+リフレッシュトークン, OAuth 2.0 | Firebase済 |
| パスワードセキュリティ | bcrypt/argon2、レートリミット、HTTPS | ? |
| 入力保護 | バリデーションスキーマ、SQLi防止、XSS/CSRF防止 | ? |
| セキュリティヘッダー | Helmet.js, CSP, X-Frame-Options, HSTS | ? |
| シークレット管理 | 環境変数、シークレットサービス | 一部 |

### 6. DevOps/インフラ

| 領域 | 具体的な技術 | 現状 |
|------|------------|------|
| Docker | Dockerfile、docker-compose | ? |
| CI/CD | GitHub Actions | 済 |
| クラウド | AWS(EC2, S3, VPC, Route53) | ? |
| モニタリング | ログ管理、アラート設定 | ? |
| IaC | Terraform, Ansible | ? |
| デプロイ | Vercel | 済 |

---

## 現在のスキルセットとギャップ分析

### 既に持っているもの
- フロントエンド: React, Next.js, TypeScript, Tailwind CSS
- バックエンド: Ruby on Rails
- 認証: Firebase Authentication
- CI/CD: GitHub Actions + Vercel
- テスト: Vitest（基礎）
- バージョン管理: Git/GitHub

### 最優先で埋めるべきギャップ
1. **Docker** - 転職市場でほぼ必須
2. **PostgreSQL/SQL** - DB設計とクエリ最適化
3. **REST API設計** - Node.js(Express/Fastify)での実装経験
4. **セキュリティ** - OWASP Top 10の実装レベルの理解
5. **システム設計** - Senior以上の面接で必須

---

## 推奨学習順序

### Phase 1: 基盤強化（1-3ヶ月）
- [ ] Docker/docker-compose でフルスタック構成を作る
- [ ] PostgreSQL + SQLの基礎（JOIN, インデックス, EXPLAIN）
- [ ] Node.js + Express でREST API を1つ作る
- [ ] OSS に1つ貢献する（typo修正でもOK）

### Phase 2: 実践力（3-6ヶ月）
- [ ] 認証（JWT + OAuth 2.0）を自分で実装
- [ ] テスト拡充（E2E: Playwright、カバレッジ80%+）
- [ ] Redis でキャッシュを実装
- [ ] OWASP Top 10 のハンズオン（Juice Shop）
- [ ] アクセシビリティ対応（ARIA、キーボードナビ）

### Phase 3: シニアレベル（6-12ヶ月）
- [ ] AWS 基本サービス（EC2, S3, RDS）の実践
- [ ] Terraform で IaC の基礎
- [ ] システム設計（マイクロサービス、キャッシュ戦略）
- [ ] パフォーマンス最適化（Lighthouse 90+、Core Web Vitals）
- [ ] GraphQL or gRPC の実装経験

---

## このリポジトリで作るべき実績

### 1. このサイト自体をポートフォリオにする
- [ ] READMEに「技術スタック」「アーキテクチャ図」「こだわりポイント」を記載
- [ ] Lighthouseスコア90+を達成してスクリーンショットを載せる
- [ ] 技術選定の理由を明記

### 2. 実務で使えるミニプロダクトを`/note`に追加
- [ ] **認証付きCRUDアプリ** - JWT + PostgreSQL。面接で「認証/DB実装経験」が話せる
- [ ] **APIモック生成ツール** - OpenAPI specからモックAPIを返す
- [ ] **Dockerで動くフルスタックサンプル** - docker-compose一発で立ち上がる構成

### 3. 技術記事の質を上げる

目指すスタイル:
> 「〇〇で△△の問題を解決した」「〇〇と△△を比較して□□を選んだ理由」

- 実際のコード差分やパフォーマンス改善の数値を入れる
- 「なぜその技術を選んだか」の判断プロセスを書く
- 失敗→解決のストーリーが最も読まれる

### 4. 日次トレンド収集をアウトプットに変換
- [ ] トレンドで見つけた技術を実際に試してブログ記事にする
- [ ] 月末に「今月学んだこと」まとめ記事を書く

---

## 転職で評価されるポイント

| ポイント | やること |
|---------|---------|
| GitHub Profile | コントリビューション、ピン留めリポジトリ、プロフィールREADME |
| 継続的な発信 | 週1でブログ記事（日次トレンド収集の仕組みは既にある） |
| OSS貢献 | typo修正でもいい。「OSS contributorです」と言えること |
| 英語力 | HN/Redditを毎日読む（日次トレンドで仕組み化済み） |
| 説明力 | 技術選定の理由、トレードオフの説明ができること |

### 面接で話せるネタ
- 「GitHub PagesからVercelに移行した理由とImage Optimizationの効果」
- 「CI/CDパイプラインを構築してPRごとに自動テスト・プレビューデプロイを実現」
- 「毎日の技術トレンド収集をAIで自動化し、セキュリティ情報のキャッチアップを効率化」
- 「60以上の技術ブログ記事を執筆し、初心者向けの解説を継続」

---

## 週次ルーティン案

| 曜日 | やること |
|------|---------|
| 毎朝 | `/neta-trend-daily`でトレンド収集、気になる記事を読書メモ |
| 月 | トレンドで見つけた技術を1つ試す |
| 水 | ミニプロダクト開発（1-2時間） |
| 金 | 週のまとめブログ記事を書く |
| 土 | OSS貢献 or システム設計の学習 |

---

## 参考リソース

- [roadmap.sh - Full Stack Developer](https://roadmap.sh/full-stack) - 業界標準のインタラクティブロードマップ（GitHub 30万+スター）
- [roadmap.sh - Frontend Developer](https://roadmap.sh/frontend) - フロントエンド特化ロードマップ
- [roadmap.sh - Developer Roadmaps](https://roadmap.sh/) - 全ロードマップ一覧
- [The Complete Full-Stack Developer Roadmap for 2026](https://dev.to/thebitforge/the-complete-full-stack-developer-roadmap-for-2026-2i0j) - 2026年版の詳細技術マップ
- [kamranahmedse/developer-roadmap](https://github.com/kamranahmedse/developer-roadmap) - roadmap.shのGitHubリポジトリ
- [フルスタックエンジニアの市場価値とAI時代の生存戦略](https://codezine.jp/article/detail/22886) - 日本市場での解説
- [フルスタックエンジニアになるためのロードマップ](https://tech.hipro-job.jp/column/1170) - 日本語のロードマップ解説
- [独力でWebサービスを開発・構築できるフルスタックエンジニアへのロードマップ](https://udemy.benesse.co.jp/development/fullstack.html) - Udemy学習パス
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Webセキュリティの基礎
- [Juice Shop](https://owasp.org/www-project-juice-shop/) - セキュリティ学習用アプリ
