# トレンドネタ収集

はてなブックマークIT人気エントリー、Hacker News、Reddit、セキュリティブログから情報を収集し、`daily/YYYYMMDD-trend.md`に保存する。

## 実行手順

### 0. 興味領域

以下の興味領域を基準にフィルタリング・評価する:

- AI（開発とセキュリティへの応用。AWSが提供しているKiroやClaudeの追加機能・活用事例の記事も含む）
- Webセキュリティ/ハッキング（OWASP、脆弱性、サプライチェーン攻撃）
- OSS開発/コミュニティ
- 個人開発/SaaS運営（Technical SEO、グロースハック、収益化）
- AIを活用した個人開発/個人起業/稼ぎ方/成功事例
- キャリア/人生哲学（経済的自由、外資転職、Build in Public）
- 習慣化（生産性、ルーティン、行動変容、セルフマネジメント）
- JavaScript/TypeScript技術スタック
- アクセシビリティ
- Kiro
- 編み物
- 筋トレ

### 1. 前日記事の重複排除

収集を開始する前に、前日の記事と重複しないようにする:

1. `daily/`ディレクトリから**直近のトレンド記事ファイル**（前日分）を特定する
2. そのファイルからすべてのURL（`(https://...)`形式）を抽出し、**既出URLリスト**として保持する
3. 収集した記事のURLが既出URLリストに含まれる場合は、**出力から除外する**
4. ただし、以下の場合は重複でも掲載する:
   - ブクマ数やポイント数が前日から**大幅に増加**（2倍以上）した記事は「継続注目」として掲載可
   - その場合、メモ欄に「前日比+XXX users」等を付記する

**重複排除の対象:**

- はてブ: 元記事URLで照合
- Hacker News: HNコメントページURLで照合
- Reddit: RedditコメントページURLで照合
- セキュリティブログ: 記事URLで照合

**注意:** 前日ファイルが存在しない場合はこのステップをスキップする

### 2. トレンド情報の収集

以下のサイトから最新のトレンド情報を取得:

**日本市場（はてブIT）**

- https://b.hatena.ne.jp/hotentry/it
- https://b.hatena.ne.jp/hotentry/it/%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%9F%E3%83%B3%E3%82%B0
- https://b.hatena.ne.jp/hotentry/it/AI%E3%83%BB%E6%A9%9F%E6%A2%B0%E5%AD%A6%E7%BF%92
- https://b.hatena.ne.jp/hotentry/it/%E3%81%AF%E3%81%A6%E3%81%AA%E3%83%96%E3%83%AD%E3%82%B0%EF%BC%88%E3%83%86%E3%82%AF%E3%83%8E%E3%83%AD%E3%82%B8%E3%83%BC%EF%BC%89
- https://b.hatena.ne.jp/hotentry/it/%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%E6%8A%80%E8%A1%93
- https://b.hatena.ne.jp/hotentry/it/%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%8B%E3%82%A2
- 各エントリーの**タイトル、元記事URL、ブックマーク数**を取得
- はてブのエントリーページURLではなく、リンク先の元記事URLを抽出

**グローバル（Hacker News）**

- https://news.ycombinator.com/
- 各記事の**タイトル、HNコメントページURL（`https://news.ycombinator.com/item?id=XXXXX`形式）、ポイント数**を取得
- **元記事URLではなくHNのコメントページURLを使用すること**
- **タイトルは日本語に翻訳して出力**

**セキュリティブログ**

- https://www.aikido.dev/blog
- https://www.wiz.io/blog
- 最新1-3記事をチェックし、興味度★★★のものがあれば注目トピックに含める

**Reddit（13サブレッド）**

- **重要**: WebFetchツールはreddit.comをブロックするため、**Bashツールでcurlコマンドを使用**すること
- 各サブレッドから `/hot.json?t=day&limit=10` で上位10件を取得
- **old.reddit.com**を使用
- User-Agentヘッダーを設定: `"User-Agent: neta-trend-collector/1.0 (trend analysis tool)"`
- **タイトルは日本語に翻訳して出力**

取得例:

```bash
curl -s -H "User-Agent: neta-trend-collector/1.0 (trend analysis tool)" \
  "https://old.reddit.com/r/programming/hot.json?t=day&limit=10" | \
  jq -r '.data.children[] | "\(.data.title)|\(.data.ups)|\(.data.num_comments)|https://www.reddit.com\(.data.permalink)"'
```

サブレッド一覧:

- セキュリティ系: r/netsec, r/cybersecurity
- AI系: r/OpenAI, r/LocalLLaMA, r/ClaudeCode
- コア技術系: r/programming, r/technology
- OSS/個人開発系: r/opensource, r/indiehackers, r/webdev, r/javascript
- キャリア/実践系: r/cscareerquestions, r/productivity

### 3. 分析

収集した情報を興味領域と照合し、関連度を評価:

- ★★★: 興味領域に直接関連
- ★★: 間接的に関連
- ★: 一般的なIT/技術ニュース

### 4. 注目記事の要約

★★★の記事から3-5件を選び、**WebFetchで記事URLにアクセスして内容を要約**する。

- 3-5行で記事の核心を抽出
- 「注目ピックアップ」セクションに配置

### 5. 出力

**日付はJSTで取得すること:**

```bash
TZ=Asia/Tokyo date "+%Y%m%d"
```

`daily/YYYYMMDD-trend.md`に以下のフォーマットで保存:

```markdown
---
title: 'YYYY-MM-DD トレンド情報収集'
date: 'YYYY-MM-DD'
---

# YYYY-MM-DD トレンド情報収集

## 注目ピックアップ

### [記事タイトル](URL)

> 3-5行の要約。

**ソース**: はてブ XXX users / HN XXXpt / Reddit XXX ups
**カテゴリ**: AI / セキュリティ / etc

---

## はてブIT（日本市場）

### 注目トピック

| タイトル              | ブクマ数  | 興味度   | カテゴリ | メモ |
| --------------------- | --------- | -------- | -------- | ---- |
| [タイトル](元記事URL) | XXX users | ★★★/★★/★ | カテゴリ | メモ |

### 全エントリー

1. [タイトル](元記事URL) (XXX users) - 一行概要
2. ...

## Hacker News（グローバル）

### 注目トピック

| タイトル                        | ポイント | 興味度   | カテゴリ | メモ |
| ------------------------------- | -------- | -------- | -------- | ---- |
| [タイトル](HNコメントページURL) | XXXpt    | ★★★/★★/★ | カテゴリ | メモ |

### 全エントリー

1. [タイトル](HNコメントページURL) (XXXpt) - 一行概要
2. ...

## Reddit（13サブレッド）

### 注目トピック

| タイトル                            | 投票数  | コメント | 興味度   | サブレッド | メモ |
| ----------------------------------- | ------- | -------- | -------- | ---------- | ---- |
| [タイトル](RedditコメントページURL) | XXX ups | XXX      | ★★★/★★/★ | r/xxx      | メモ |

### セキュリティ系

1. [タイトル](URL) (XXX ups, XXX comments) - r/netsec - 概要
   ...

### AI系

1. [タイトル](URL) (XXX ups, XXX comments) - r/OpenAI - 概要
   ...

### OSS/個人開発系

1. [タイトル](URL) (XXX ups, XXX comments) - r/opensource - 概要
   ...

### キャリア/実践系

1. [タイトル](URL) (XXX ups, XXX comments) - r/cscareerquestions - 概要
   ...

## 用語集

| 用語  | 説明             |
| ----- | ---------------- |
| 用語A | 一行の簡潔な説明 |
| 用語B | 一行の簡潔な説明 |

## 読書メモ

（スキル実行時は空。ユーザーが記事を読んだ後に追記する）
```

**用語集のルール:**

- 記事中に登場する専門用語のうち、初心者〜中級エンジニアが知らない可能性があるものだけをピックアップ
- 一般的なIT用語（API、CSS等）は含めない
- 各用語の説明は1行以内で簡潔に
- 5〜15個程度が目安。多すぎると読みづらくなる

### 6. 確認

記事を保存した後:

1. `npm run dev`が起動していなければ起動する
2. `http://localhost:3000/daily/YYYYMMDD/` のURLをユーザーに提示
3. ユーザーがlocalhostで確認できるようにする

## 記事確認後の追記機能

スキル実行後、ユーザーが記事を読んで以下を依頼した場合に対応する:

**読書メモの追記:**

- 「〇〇の記事を読んで△△と思った」→ 記事末尾の「読書メモ」セクションに追記
- 記事タイトルとURL + ユーザーのメモをリスト形式で追加
- 記事の特定セクションへのリンク（#アンカー付き）も可

**Q&Aの追記:**

- 「〇〇って何？記事に追記して」→ 用語集テーブルに行を追加
- 説明は1行で簡潔に

## 注意事項

- **すべての記事にURLリンクを必ず含める（リンクなしは不可）**
- **はてブは元記事のURLを必ず取得**（はてブページURLではなく）
- **Hacker NewsはHNコメントページURL（`item?id=`形式）を使用**
- **Hacker Newsのタイトルは日本語に翻訳**
- **RedditはBashツールのcurlで取得**（WebFetchは使わない）
- **Redditのタイトルは日本語に翻訳**
- Reddit APIレート制限に注意（1分あたり60リクエスト程度）
- 出力ファイルのYYYYMMDDは実行日のJST日付を使用
