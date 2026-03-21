# 日次トレンド情報収集スキル設計書

## 概要

毎日の技術トレンドを複数ソースから収集し、専用ページ（`/daily`）の記事として自動生成する。
localhostで確認後、PR経由でmainにマージ→Vercel自動デプロイ。

参考: https://gist.github.com/hand-dot/bf6f928dce14095d5eef4f6aae63275e

---

## 決定事項

- 出力方式: 案B（専用ディレクトリ + 専用ページ）
- スキル名: `/neta-trend-daily`
- デプロイ: PR経由、localhostで確認
- URL要約機能: あり（注目記事の要約を含める）

---

## 興味領域

- AI（開発とセキュリティへの応用）
- Webセキュリティ/ハッキング（OWASP、脆弱性、サプライチェーン攻撃）
- OSS開発/コミュニティ
- 個人開発/SaaS運営（Technical SEO、グロースハック、収益化）
- キャリア/人生哲学（経済的自由、外資転職、Build in Public）
- JavaScript/TypeScript技術スタック
- アクセシビリティ
- Kiro
- 編み物
- 筋トレ

---

## 情報収集ソース

### 日本市場（はてなブックマーク）
- IT人気エントリー（プログラミング、AI、セキュリティ、エンジニア等）
- タイトル、元記事URL、ブックマーク数を取得

### グローバル（Hacker News）
- トップページの人気記事
- タイトル（日本語訳）、HNコメントページURL、ポイント数

### Reddit（13サブレッド）
- セキュリティ系: r/netsec, r/cybersecurity
- AI系: r/OpenAI, r/LocalLLaMA, r/ClaudeCode
- コア技術系: r/programming, r/technology
- OSS/個人開発系: r/opensource, r/indiehackers, r/webdev, r/javascript
- キャリア/実践系: r/cscareerquestions, r/productivity
- curlで取得（WebFetchがRedditをブロックするため）

### セキュリティブログ
- aikido.dev/blog
- wiz.io/blog

---

## 実装タスク

### タスク1: 専用ディレクトリとデータ管理（`daily/`）

```
daily/
└── YYYYMMDD-trend.md   # 日次トレンド記事
```

- frontmatter形式:
```yaml
---
title: "YYYY-MM-DD トレンド情報収集"
date: "YYYY-MM-DD"
---
```

- `src/lib/daily.ts`を作成
  - dailyディレクトリからMarkdown記事を読み込む関数
  - 日付降順ソート
  - frontmatter解析（gray-matter）

### タスク2: 専用ページの実装

```
src/app/daily/
├── page.tsx              # 日次トレンド一覧ページ
└── [date]/
    └── page.tsx          # 個別日付の記事ページ
```

- `/daily` : 日付リスト（最新順）
- `/daily/20260321` : その日のトレンド記事
- ダークテーマ統一
- ヘッダーのナビにDailyリンク追加

### タスク3: スキルファイルの作成

```
.claude/commands/neta-trend-daily.md
```

スキルの実行フロー:
1. 現在日付を取得（JST）
2. はてなブックマーク収集（WebFetch x 6ページ）
3. Hacker News収集（WebFetch）
4. Reddit収集（curl x 13サブレッド）
5. セキュリティブログ収集（WebFetch x 2）
6. 興味領域でフィルタリング・評価（★★★/★★/★）
7. 注目記事（★★★）のURLを要約（WebFetch）
8. Markdown記事を生成し`daily/YYYYMMDD-trend.md`に保存
9. `npm run dev`を起動し、`http://localhost:3000/daily/YYYYMMDD/`のURLを提示
10. ユーザーがlocalhostで確認

### タスク4: ヘッダーにDailyリンク追加

`src/components/Header.tsx`のnavItemsに追加:
```ts
{ href: '/daily', label: 'Daily' }
```

---

## 記事フォーマット

```markdown
---
title: "YYYY-MM-DD トレンド情報収集"
date: "YYYY-MM-DD"
---

# YYYY-MM-DD トレンド情報収集

## 注目ピックアップ

### [記事タイトル](URL)
> 3-5行の要約。記事の核心を抽出。

**ソース**: はてブ XXX users / HN XXXpt / Reddit XXX ups
**カテゴリ**: AI / セキュリティ / etc

（★★★の記事を3-5件ピックアップし、URL先を要約）

---

## はてブIT（日本市場）

### 注目トピック

| タイトル | ブクマ数 | 興味度 | カテゴリ | メモ |
|---------|---------|--------|---------|------|
| [タイトル](URL) | XXX users | ★★★ | AI | ... |

### 全エントリー
1. [タイトル](URL) (XXX users) - 一行概要
...

## Hacker News（グローバル）

### 注目トピック

| タイトル | ポイント | 興味度 | カテゴリ | メモ |
|---------|---------|--------|---------|------|
| [タイトル](HN URL) | XXXpt | ★★★ | Security | ... |

### 全エントリー
1. [タイトル](HN URL) (XXXpt) - 一行概要
...

## Reddit（13サブレッド）

### 注目トピック

| タイトル | 投票数 | コメント | 興味度 | サブレッド | メモ |
|---------|--------|---------|--------|-----------|------|
| [タイトル](URL) | XXX | XXX | ★★★ | r/xxx | ... |

### カテゴリ別

#### セキュリティ系
1. [タイトル](URL) (XXX ups, XXX comments) - r/netsec - 概要
...

#### AI系
...

#### OSS/個人開発系
...

#### キャリア/実践系
...
```

---

## 実行順序

1. タスク1: `daily/`ディレクトリ + `src/lib/daily.ts` 作成
2. タスク2: `/daily`ページ + `/daily/[date]`ページ実装
3. タスク4: ヘッダーにDailyリンク追加
4. タスク3: スキルファイル作成
5. ビルド確認 + テスト
6. コミット → PR作成

---

## 確認事項

- [ ] この設計で進めてよいか？
- [ ] 興味領域の追加/変更はないか？
- [ ] 記事フォーマットについて変更したい点はあるか？
