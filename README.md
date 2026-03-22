# mt114ran.github.io

技術ブログと実験的なWebアプリケーションのポートフォリオサイトです。

## 技術構成

| 技術                | バージョン | 用途                          |
| ------------------- | ---------- | ----------------------------- |
| Next.js             | 16.2       | フレームワーク（App Router）  |
| React               | 19         | UIライブラリ                  |
| TypeScript          | 5          | 型安全な開発                  |
| Tailwind CSS        | 3.4        | スタイリング                  |
| Mermaid             | 11.9       | 図表描画（記事内）            |
| gray-matter         | 4          | Markdownフロントマター解析    |
| remark / rehype     | 15 / 10    | Markdown→HTML変換パイプライン |
| Vitest              | 4          | テスト                        |
| ESLint + Prettier   | 9 / 3.8    | Lint / フォーマッタ           |
| husky + lint-staged | 9 / 16     | pre-commitフック              |

**ビルド方式**: `output: 'export'`（静的サイト生成）
**デプロイ**: GitHub Pages（`gh-pages`ブランチ）

## ディレクトリ構成

```
mt.github.io/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # トップページ（記事一覧）
│   │   ├── layout.tsx            # 共通レイアウト
│   │   ├── sitemap.ts            # SEO用サイトマップ自動生成
│   │   ├── blog/                 # ブログ機能
│   │   │   ├── [slug]/           # 個別記事ページ
│   │   │   ├── page/[pageNum]/   # ページネーション
│   │   │   └── tags/             # タグ別一覧
│   │   ├── daily/                # 日次トレンド記事
│   │   │   └── [date]/           # 個別トレンドページ
│   │   └── note/                 # 個人プロジェクト
│   │       ├── books/            # 読書記録
│   │       │   └── [slug]/       # 個別読書記事
│   │       ├── game/             # ブラウザゲーム
│   │       ├── roadmap/          # 学習ロードマップ
│   │       └── webpage-temp/     # Webテンプレート集
│   ├── components/               # UIコンポーネント
│   │   ├── Header.tsx            # ヘッダー・ナビゲーション
│   │   ├── Footer.tsx            # フッター
│   │   ├── HomeTabs.tsx          # トップページタブ切替
│   │   ├── Pagination.tsx        # ページネーション
│   │   ├── SearchBox.tsx         # 記事検索
│   │   ├── MermaidRenderer.tsx   # Mermaid図表描画
│   │   ├── games/                # ゲームコンポーネント
│   │   └── templates/            # テンプレート関連
│   └── lib/                      # データ取得ロジック
│       ├── posts.ts              # ブログ記事取得
│       ├── daily.ts              # トレンド記事取得
│       ├── books.ts              # 読書記録取得
│       ├── roadmap.ts            # ロードマップ取得
│       ├── games/                # ゲームデータ
│       └── templates/            # テンプレートデータ
├── posts/                        # ブログ記事Markdown（62記事）
├── daily/                        # 日次トレンドMarkdown
├── books/                        # 読書記録Markdown
├── books-pdf/                    # 読書用PDF（ローカルのみ、gitignore）
├── roadmap/                      # ロードマップMarkdown
├── public/                       # 静的アセット
├── .claude/commands/             # Claude Codeカスタムスキル
│   ├── neta-trend-daily.md       # トレンド収集スキル
│   └── book-review.md            # 読書レビュースキル
└── .github/workflows/            # GitHub Actions
```

### コンテンツの仕組み

全てのコンテンツはMarkdownファイルで管理し、ビルド時にHTMLに変換されます。

| コンテンツ   | Markdownの場所 | 表示URL                 | 管理ロジック         |
| ------------ | -------------- | ----------------------- | -------------------- |
| ブログ記事   | `posts/`       | `/blog/[slug]/`         | `src/lib/posts.ts`   |
| トレンド     | `daily/`       | `/daily/[date]/`        | `src/lib/daily.ts`   |
| 読書記録     | `books/`       | `/note/books/[slug]/`   | `src/lib/books.ts`   |
| ロードマップ | `roadmap/`     | `/note/roadmap/[slug]/` | `src/lib/roadmap.ts` |

## Getting Started

開発サーバーの起動:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Claude Codeスキル（カスタムコマンド）

このリポジトリではClaude Codeのカスタムコマンド（Skills）を使って作業を効率化しています。

### `/neta-trend-daily` - トレンドネタ収集

はてなブックマークIT人気エントリー、Hacker News、Reddit、セキュリティブログからトレンド情報を収集し、`daily/YYYYMMDD-trend.md`に保存します。

```bash
# Claude Codeで実行
/neta-trend-daily
```

**機能:**

- はてブIT（6カテゴリ）、Hacker News、Reddit（13サブレッド）、セキュリティブログからデータ収集
- 興味領域（AI、セキュリティ、OSS、個人開発、キャリア等）に基づく関連度評価
- 前日記事との重複排除（ブクマ数が2倍以上増加した記事は「継続注目」として残る）
- 注目記事3-5件の要約を自動生成
- `http://localhost:3000/daily/YYYYMMDD/`で確認可能

**出力先:** `daily/YYYYMMDD-trend.md`

---

### `/book-review` - 読書レビュー記事生成

本のPDFを読み込み、読書記録の記事を自動生成します。

```bash
# 1. PDFをbooks-pdf/に配置（gitignore対象）
cp ~/Downloads/本のファイル名.pdf ./books-pdf/

# 2. Claude Codeで実行（単一PDFの場合）
/book-review books-pdf/本のファイル名.pdf

# 3. 分割PDFの場合はフォルダにまとめて指定
/book-review books-pdf/本のフォルダ名/
```

**機能:**

- PDFから本の構造（章構成）を自動分析
- 各章の要約を3-5行で生成
- タイトル、著者、購入リンク、評価、タグをユーザーに確認
- 感想・アクション欄はユーザーが後で追記する前提のテンプレート生成
- 著作権に配慮し、要約と解釈に留める（コピーはしない）

**PDFの配置ルール:**

- PDFは`books-pdf/`ディレクトリに配置する（gitignore対象のためリモートにpushされない）
- **1ファイルあたり100MB以下**になるように分割すること（大きすぎるとPDF読み取り処理がタイムアウトする）
- 分割PDFは本ごとにサブディレクトリにまとめる

```
books-pdf/
├── effortless-thinking/     # 本ごとにフォルダ分け
│   ├── part1.pdf            # 各100MB以下に分割
│   ├── part2.pdf
│   └── part3.pdf
└── clean-code.pdf           # 100MB以下なら単体でOK
```

**ディレクトリ構成:**

```
books/           # 読書記録Markdown（Gitで管理）
books-pdf/       # PDFファイル（ローカルのみ、gitignore）
```

**出力先:** `books/NNNN_book-slug.md`
**閲覧:** `http://localhost:3000/note/books/NNNN_book-slug/`

---

### スキルファイルの場所

```
.claude/commands/
├── neta-trend-daily.md   # トレンドネタ収集
└── book-review.md        # 読書レビュー記事生成
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
