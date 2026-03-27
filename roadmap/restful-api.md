---
title: 'RESTful API'
order: 17
section: 'API/認証'
---

# RESTful API

## APIとは何か

API（Application Programming Interface）は、ソフトウェア同士が「会話」するための**約束事（インターフェース）** のこと。

レストランに例えるとわかりやすい。

```
お客さん（フロントエンド）
    |
    | 「カレーライスをください」（リクエスト）
    v
ウェイター（API）
    |
    | 注文をキッチンに伝える
    v
キッチン（サーバー/データベース）
    |
    | 料理を作る
    v
ウェイター（API）
    |
    | 「お待たせしました」（レスポンス）
    v
お客さん（フロントエンド）
```

お客さんはキッチンの中に入れないし、料理の作り方を知る必要もない。ウェイター（API）が間に立って、決まったメニュー（エンドポイント）から注文を受け付け、結果を返してくれる。

身の回りのAPI利用例:

| サービス       | API利用例                         |
| -------------- | --------------------------------- |
| 天気予報アプリ | 気象データAPIから天気情報を取得   |
| SNSログイン    | Google/GitHub APIでユーザー認証   |
| 地図アプリ     | Google Maps APIで地図データを取得 |
| 決済システム   | Stripe APIでクレジットカード決済  |
| チャットボット | OpenAI APIでAIの回答を取得        |

つまりAPIとは、**「このURLにこの形式でリクエストを送ったら、こういう形式でデータが返ってきます」という約束事**。

## RESTとは

REST（Representational State Transfer）は、2000年にRoy Fieldingが博士論文で提唱した**Webサービスを設計するためのアーキテクチャスタイル（設計思想）** のこと。

RESTは「プロトコル（厳密なルール）」ではなく「スタイル（設計の考え方）」であることがポイント。つまり、RESTの原則に従って設計されたAPIを**RESTful API**と呼ぶ。

### RESTの6つの制約

| 制約                       | 説明                                               | 具体例                                                     |
| -------------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| クライアント-サーバー      | UIとデータ処理を分離する                           | フロントエンド（React）とバックエンド（Express）を分ける   |
| ステートレス               | サーバーはリクエスト間で状態を保持しない           | 毎回のリクエストに必要な情報を全て含める（認証トークン等） |
| キャッシュ可能             | レスポンスがキャッシュ可能かどうかを明示する       | Cache-Controlヘッダーの活用                                |
| 統一インターフェース       | 一貫したURLとHTTPメソッドの使い方                  | `/api/users`にGETで取得、POSTで作成                        |
| レイヤードシステム         | 中間サーバー（ロードバランサ、プロキシ等）を挟める | CDN、APIゲートウェイの利用                                 |
| コードオンデマンド（任意） | 必要に応じてクライアントにコードを送信             | JavaScriptの動的ロード                                     |

最も重要なのは**統一インターフェース**と**ステートレス**の2つ。

**ステートレスとは:**
セッション情報をサーバー側に保存しないということ。リクエストごとに認証情報（トークン等）を送信する必要がある。

```
【ステートフル（従来のセッション方式）】
リクエスト1: 「ログインします」 → サーバー:「OK、session_id=abc123を覚えておきます」
リクエスト2: 「データをください」 → サーバー:「abc123さんですね、はいどうぞ」
（サーバーがセッション状態を記憶している）

【ステートレス（REST方式）】
リクエスト1: 「ログインします」 → サーバー:「OK、トークンJWT_XYZを発行します」
リクエスト2: 「データをください。トークンはJWT_XYZです」 → サーバー:「トークン確認OK、はいどうぞ」
（毎回自己完結した情報を送る。サーバーは何も覚えていない）
```

## RESTful APIの設計原則

### リソース指向

RESTでは全てを**リソース（資源）** として考える。リソースとは「操作の対象となるもの」のこと。

- ユーザー → `/users`
- 投稿記事 → `/posts`
- コメント → `/comments`
- 商品 → `/products`

リソースは**名詞**で表現し、操作は**HTTPメソッド**で表現する。これがRESTの基本的な考え方。

```
悪い例: /getUsers, /createUser, /deleteUser（動詞がURLに含まれている）
良い例: GET /users, POST /users, DELETE /users/:id（動詞はHTTPメソッドで表現）
```

## HTTPメソッド

HTTPメソッドは「リソースに対して何をするか」を表現する。

### 主要メソッド一覧

| メソッド | 意味               | CRUD操作       | べき等性 | 安全性 | リクエストボディ |
| -------- | ------------------ | -------------- | -------- | ------ | ---------------- |
| GET      | リソースの取得     | Read           | あり     | あり   | なし             |
| POST     | リソースの作成     | Create         | なし     | なし   | あり             |
| PUT      | リソースの全体更新 | Update（全体） | あり     | なし   | あり             |
| PATCH    | リソースの部分更新 | Update（部分） | なし     | なし   | あり             |
| DELETE   | リソースの削除     | Delete         | あり     | なし   | なし             |

**べき等性（idempotent）** とは、「何回実行しても結果が同じになる」性質のこと。

- `GET /users/1` → 何回呼んでも同じユーザーが返る（べき等）
- `DELETE /users/1` → 1回目は削除成功、2回目以降は404だが、最終状態は同じ（べき等）
- `POST /users` → 呼ぶたびに新しいユーザーが作られる（べき等ではない）

**安全性（safe）** とは、「サーバーの状態を変更しない」性質のこと。GETは安全（データを取得するだけ）、POSTは安全ではない（データを変更する）。

### 各メソッドの使い分け

```
GET    /api/users        → ユーザー一覧を取得
GET    /api/users/123    → ID:123のユーザーを取得
POST   /api/users        → 新しいユーザーを作成
PUT    /api/users/123    → ID:123のユーザーを全体更新
PATCH  /api/users/123    → ID:123のユーザーを部分更新
DELETE /api/users/123    → ID:123のユーザーを削除
```

### PUTとPATCHの違い

```javascript
// 現在のユーザーデータ
// { id: 1, name: "太郎", email: "taro@example.com", age: 25 }

// PUT /api/users/1（全体更新 - 全フィールドを送信する必要がある）
// リクエストボディ:
{ "name": "太郎", "email": "newtaro@example.com", "age": 25 }
// → 全フィールドを指定しないと、省略したフィールドが消える可能性がある

// PATCH /api/users/1（部分更新 - 変更したいフィールドだけ送ればOK）
// リクエストボディ:
{ "email": "newtaro@example.com" }
// → emailだけが更新され、他のフィールドはそのまま
```

## HTTPステータスコード

ステータスコードは「リクエストの結果」をクライアントに伝えるための3桁の数字。

### 主要ステータスコード一覧

| コード                      | 名前                  | 意味                         | 使用場面                   |
| --------------------------- | --------------------- | ---------------------------- | -------------------------- |
| **2xx: 成功**               |                       |                              |                            |
| 200                         | OK                    | 成功                         | GETの成功、PUT/PATCHの成功 |
| 201                         | Created               | リソース作成成功             | POSTの成功                 |
| 204                         | No Content            | 成功だがレスポンスボディなし | DELETEの成功               |
| **3xx: リダイレクト**       |                       |                              |                            |
| 301                         | Moved Permanently     | 恒久的な移転                 | URLの恒久変更              |
| 302                         | Found                 | 一時的な移転                 | 一時的なリダイレクト       |
| 304                         | Not Modified          | 変更なし（キャッシュ利用可） | キャッシュが有効な場合     |
| **4xx: クライアントエラー** |                       |                              |                            |
| 400                         | Bad Request           | リクエストが不正             | バリデーションエラー       |
| 401                         | Unauthorized          | 認証が必要                   | トークンなし/無効          |
| 403                         | Forbidden             | アクセス権限なし             | 権限不足                   |
| 404                         | Not Found             | リソースが見つからない       | 存在しないURL              |
| 405                         | Method Not Allowed    | 許可されていないメソッド     | GET専用にPOSTした場合      |
| 409                         | Conflict              | 競合                         | 重複登録など               |
| 422                         | Unprocessable Entity  | 処理不可                     | データの意味的な誤り       |
| 429                         | Too Many Requests     | リクエスト過多               | レート制限に到達           |
| **5xx: サーバーエラー**     |                       |                              |                            |
| 500                         | Internal Server Error | サーバー内部エラー           | 予期しないエラー           |
| 502                         | Bad Gateway           | ゲートウェイエラー           | バックエンドサーバーの障害 |
| 503                         | Service Unavailable   | サービス利用不可             | メンテナンス中             |
| 504                         | Gateway Timeout       | タイムアウト                 | バックエンドの応答遅延     |

**覚え方:**

- 2xx = 「うまくいった」
- 3xx = 「あっちを見て」
- 4xx = 「あなた（クライアント）が悪い」
- 5xx = 「私（サーバー）が悪い」

## URI設計のベストプラクティス

### 基本ルール

| ルール             | 良い例             | 悪い例                 | 理由                           |
| ------------------ | ------------------ | ---------------------- | ------------------------------ |
| 名詞を使う         | `/users`           | `/getUsers`            | HTTPメソッドが動詞の役割を担う |
| 複数形を使う       | `/users`           | `/user`                | リソースのコレクションを表す   |
| 小文字を使う       | `/user-profiles`   | `/UserProfiles`        | URLは大文字小文字を区別する    |
| ハイフン区切り     | `/user-profiles`   | `/user_profiles`       | URLの慣例                      |
| 階層構造           | `/users/123/posts` | `/getUserPosts?id=123` | リソースの親子関係を表現       |
| バージョニング     | `/api/v1/users`    | `/api/users`           | APIの破壊的変更に対応          |
| 末尾スラッシュなし | `/users`           | `/users/`              | 統一性のため                   |

### 階層構造の例

```
/api/v1/users                    → 全ユーザー一覧
/api/v1/users/123                → ID:123のユーザー
/api/v1/users/123/posts          → ユーザー123の投稿一覧
/api/v1/users/123/posts/456      → ユーザー123の投稿456
/api/v1/users/123/posts/456/comments  → 投稿456のコメント一覧
```

ただし、階層は**3段階まで**にとどめるのが推奨。深すぎるネストは可読性が下がる。

```
悪い例: /api/v1/users/123/posts/456/comments/789/likes（深すぎる）
良い例: /api/v1/comments/789/likes（直接アクセスできるようにする）
```

## リクエストとレスポンスの構造

### HTTPリクエストの構造

```
POST /api/v1/users HTTP/1.1          ← リクエストライン（メソッド、URL、プロトコル）
Host: api.example.com                ← ヘッダー
Content-Type: application/json       ← ヘッダー（ボディの形式を指定）
Authorization: Bearer eyJhbGci...    ← ヘッダー（認証トークン）
Accept: application/json             ← ヘッダー（期待するレスポンス形式）
                                     ← 空行
{                                    ← ボディ（リクエストデータ）
  "name": "太郎",
  "email": "taro@example.com"
}
```

### HTTPレスポンスの構造

```
HTTP/1.1 201 Created                 ← ステータスライン
Content-Type: application/json       ← ヘッダー
X-RateLimit-Remaining: 99           ← ヘッダー（カスタム）
                                     ← 空行
{                                    ← ボディ（レスポンスデータ）
  "id": 1,
  "name": "太郎",
  "email": "taro@example.com",
  "createdAt": "2026-03-28T10:00:00Z"
}
```

### よく使うヘッダー

| ヘッダー                | 方向       | 説明                                             |
| ----------------------- | ---------- | ------------------------------------------------ |
| `Content-Type`          | 両方       | ボディのデータ形式（`application/json`が一般的） |
| `Authorization`         | リクエスト | 認証情報（`Bearer <トークン>`）                  |
| `Accept`                | リクエスト | クライアントが受け入れ可能なデータ形式           |
| `Cache-Control`         | レスポンス | キャッシュの制御                                 |
| `X-RateLimit-Limit`     | レスポンス | レート制限の上限                                 |
| `X-RateLimit-Remaining` | レスポンス | 残りのリクエスト数                               |

## JSONフォーマット

RESTful APIのデータ交換で最も一般的に使われるフォーマット。

### JSONの基本構造

```json
{
  "string": "文字列はダブルクォートで囲む",
  "number": 42,
  "float": 3.14,
  "boolean": true,
  "null": null,
  "array": [1, 2, 3],
  "object": {
    "nested": "オブジェクトの中にオブジェクト"
  }
}
```

### APIレスポンスのよくある形式

```json
// 単一リソース
{
  "id": 1,
  "name": "太郎",
  "email": "taro@example.com",
  "createdAt": "2026-03-28T10:00:00Z"
}

// リソースのリスト（ページネーション付き）
{
  "data": [
    { "id": 1, "name": "太郎" },
    { "id": 2, "name": "花子" }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "totalPages": 5,
    "totalItems": 100
  }
}

// エラーレスポンス
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": [
      { "field": "email", "message": "有効なメールアドレスを入力してください" },
      { "field": "name", "message": "名前は必須項目です" }
    ]
  }
}
```

### JSONの注意点

| 注意点                   | 説明                                                     |
| ------------------------ | -------------------------------------------------------- |
| キーはダブルクォート必須 | `{ name: "太郎" }` はNG。`{ "name": "太郎" }` が正しい   |
| 末尾カンマ不可           | `{ "a": 1, }` はNG。最後の要素の後にカンマを付けない     |
| コメント不可             | JSONにコメントは書けない                                 |
| 日付型なし               | 文字列としてISO 8601形式（`2026-03-28T10:00:00Z`）を使う |
| undefinedなし            | `null`を使う                                             |

## Express.jsでのAPI実装

### CRUD全操作のコード例

```javascript
const express = require('express')
const app = express()

app.use(express.json())

// 仮のデータベース（実際にはDBを使う）
let users = [
  { id: 1, name: '太郎', email: 'taro@example.com', age: 25 },
  { id: 2, name: '花子', email: 'hanako@example.com', age: 30 },
  { id: 3, name: '次郎', email: 'jiro@example.com', age: 22 },
]
let nextId = 4

// ========================================
// CREATE - ユーザーの作成
// POST /api/users
// ========================================
app.post('/api/users', (req, res) => {
  const { name, email, age } = req.body

  // バリデーション
  if (!name || !email) {
    return res.status(400).json({
      error: {
        message: '名前とメールアドレスは必須です',
        details: [
          ...(!name ? [{ field: 'name', message: '名前は必須です' }] : []),
          ...(!email ? [{ field: 'email', message: 'メールアドレスは必須です' }] : []),
        ],
      },
    })
  }

  // メールアドレスの重複チェック
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({
      error: { message: 'このメールアドレスは既に使用されています' },
    })
  }

  const newUser = { id: nextId++, name, email, age: age || null }
  users.push(newUser)

  // 201 Created + 作成されたリソースを返す
  res.status(201).json(newUser)
})

// ========================================
// READ - ユーザー一覧の取得
// GET /api/users
// GET /api/users?page=1&limit=10&sort=name&order=asc
// ========================================
app.get('/api/users', (req, res) => {
  let result = [...users]

  // フィルタリング（クエリパラメータ）
  if (req.query.name) {
    result = result.filter((u) => u.name.toLowerCase().includes(req.query.name.toLowerCase()))
  }

  // ソート
  const sortField = req.query.sort || 'id'
  const sortOrder = req.query.order === 'desc' ? -1 : 1
  result.sort((a, b) => {
    if (a[sortField] < b[sortField]) return -1 * sortOrder
    if (a[sortField] > b[sortField]) return 1 * sortOrder
    return 0
  })

  // ページネーション
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedResult = result.slice(startIndex, endIndex)

  res.json({
    data: paginatedResult,
    pagination: {
      page,
      limit,
      totalItems: result.length,
      totalPages: Math.ceil(result.length / limit),
    },
  })
})

// ========================================
// READ - 個別ユーザーの取得
// GET /api/users/:id
// ========================================
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const user = users.find((u) => u.id === id)

  if (!user) {
    return res.status(404).json({
      error: { message: `ID: ${id} のユーザーが見つかりません` },
    })
  }

  res.json(user)
})

// ========================================
// UPDATE - ユーザーの全体更新
// PUT /api/users/:id
// ========================================
app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const index = users.findIndex((u) => u.id === id)

  if (index === -1) {
    return res.status(404).json({
      error: { message: `ID: ${id} のユーザーが見つかりません` },
    })
  }

  const { name, email, age } = req.body
  if (!name || !email) {
    return res.status(400).json({
      error: { message: 'PUTリクエストでは全フィールドが必須です' },
    })
  }

  users[index] = { id, name, email, age: age || null }
  res.json(users[index])
})

// ========================================
// UPDATE - ユーザーの部分更新
// PATCH /api/users/:id
// ========================================
app.patch('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const index = users.findIndex((u) => u.id === id)

  if (index === -1) {
    return res.status(404).json({
      error: { message: `ID: ${id} のユーザーが見つかりません` },
    })
  }

  // 送信されたフィールドのみ更新
  users[index] = { ...users[index], ...req.body, id } // idは上書きさせない
  res.json(users[index])
})

// ========================================
// DELETE - ユーザーの削除
// DELETE /api/users/:id
// ========================================
app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const index = users.findIndex((u) => u.id === id)

  if (index === -1) {
    return res.status(404).json({
      error: { message: `ID: ${id} のユーザーが見つかりません` },
    })
  }

  users.splice(index, 1)
  res.status(204).send() // No Content
})

app.listen(3000, () => {
  console.log('APIサーバーが http://localhost:3000 で起動しました')
})
```

### curlでのテスト方法

```bash
# ユーザー一覧の取得
curl http://localhost:3000/api/users

# ページネーション付き
curl "http://localhost:3000/api/users?page=1&limit=2&sort=name&order=asc"

# 個別ユーザーの取得
curl http://localhost:3000/api/users/1

# ユーザーの作成
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "三郎", "email": "saburo@example.com", "age": 28}'

# ユーザーの全体更新
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "太郎（更新）", "email": "taro-new@example.com", "age": 26}'

# ユーザーの部分更新
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"age": 27}'

# ユーザーの削除
curl -X DELETE http://localhost:3000/api/users/1
```

## クエリパラメータとパスパラメータ

### パスパラメータ

リソースを**特定**するために使う。URLパスの一部として含まれる。

```
GET /api/users/123          → ID:123のユーザーを取得
GET /api/users/123/posts/45 → ユーザー123の投稿45を取得
```

### クエリパラメータ

リソースの**フィルタリング、ソート、ページネーション**に使う。`?key=value`の形式。

```
GET /api/users?role=admin           → 管理者ユーザーのみ取得
GET /api/users?sort=name&order=asc  → 名前昇順でソート
GET /api/users?page=2&limit=20      → 2ページ目、20件ずつ
GET /api/users?q=太郎              → 「太郎」で検索
```

### 使い分けの指針

| 種類             | 使い方                           | 例                  |
| ---------------- | -------------------------------- | ------------------- |
| パスパラメータ   | リソースの一意な識別に必須       | `/users/:id`        |
| クエリパラメータ | 任意のフィルタリング・オプション | `?page=1&sort=name` |

**パスパラメータ**はないとリソースが特定できないもの、**クエリパラメータ**はなくてもデフォルト値で動作するものに使う。

### ページネーションの実装パターン

```javascript
// オフセットベース（一般的）
// GET /api/users?page=3&limit=20
app.get('/api/users', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const offset = (page - 1) * limit

  // DBの場合: SELECT * FROM users LIMIT 20 OFFSET 40
  const paginatedData = allData.slice(offset, offset + limit)

  res.json({
    data: paginatedData,
    pagination: {
      page,
      limit,
      totalItems: allData.length,
      totalPages: Math.ceil(allData.length / limit),
      hasNext: offset + limit < allData.length,
      hasPrev: page > 1,
    },
  })
})

// カーソルベース（大量データ向け、SNSのフィードなど）
// GET /api/posts?cursor=abc123&limit=20
app.get('/api/posts', (req, res) => {
  const cursor = req.query.cursor // 最後に取得したアイテムのID等
  const limit = parseInt(req.query.limit) || 20

  let data
  if (cursor) {
    const cursorIndex = allData.findIndex((item) => item.id === cursor)
    data = allData.slice(cursorIndex + 1, cursorIndex + 1 + limit)
  } else {
    data = allData.slice(0, limit)
  }

  const nextCursor = data.length === limit ? data[data.length - 1].id : null

  res.json({
    data,
    pagination: {
      nextCursor,
      hasMore: nextCursor !== null,
    },
  })
})
```

## エラーハンドリング

### 統一的なエラーレスポンス形式

チーム全体で一貫したエラーレスポンス形式を決めておくと、フロントエンド開発者がエラー処理を書きやすくなる。

```javascript
// エラーレスポンスの統一形式
// {
//   "error": {
//     "code": "エラーコード（マシンリーダブル）",
//     "message": "エラーメッセージ（人が読む用）",
//     "details": [詳細情報（任意）]
//   }
// }

// カスタムエラークラス
class ApiError extends Error {
  constructor(statusCode, code, message, details = []) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

// よく使うエラーのファクトリ関数
const errors = {
  notFound: (resource) => new ApiError(404, 'NOT_FOUND', `${resource}が見つかりません`),
  badRequest: (message, details) => new ApiError(400, 'BAD_REQUEST', message, details),
  unauthorized: () => new ApiError(401, 'UNAUTHORIZED', '認証が必要です'),
  forbidden: () => new ApiError(403, 'FORBIDDEN', 'アクセス権限がありません'),
  conflict: (message) => new ApiError(409, 'CONFLICT', message),
  internal: () => new ApiError(500, 'INTERNAL_ERROR', 'サーバー内部エラーが発生しました'),
}

// 使用例
app.get('/api/users/:id', (req, res, next) => {
  const user = users.find((u) => u.id === parseInt(req.params.id))
  if (!user) {
    return next(errors.notFound('ユーザー'))
  }
  res.json(user)
})

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const response = {
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'サーバー内部エラーが発生しました',
    },
  }

  if (err.details && err.details.length > 0) {
    response.error.details = err.details
  }

  // 開発環境ではスタックトレースを含める
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack
  }

  console.error(`[${statusCode}] ${err.code}: ${err.message}`)
  res.status(statusCode).json(response)
})
```

## バリデーション

### zodを使ったバリデーション

zodはTypeScriptフレンドリーなバリデーションライブラリ。スキーマを定義すると、型推論も自動で行われる。

```bash
npm install zod
```

```javascript
const { z } = require('zod')

// ユーザー作成用のスキーマ定義
const createUserSchema = z.object({
  name: z
    .string({ required_error: '名前は必須です' })
    .min(2, '名前は2文字以上で入力してください')
    .max(50, '名前は50文字以内で入力してください'),
  email: z
    .string({ required_error: 'メールアドレスは必須です' })
    .email('有効なメールアドレスを入力してください'),
  age: z
    .number()
    .int('年齢は整数で入力してください')
    .min(0, '年齢は0以上で入力してください')
    .max(150, '年齢は150以下で入力してください')
    .optional(),
  role: z
    .enum(['user', 'admin', 'moderator'], {
      errorMap: () => ({ message: 'roleはuser, admin, moderatorのいずれかです' }),
    })
    .default('user'),
})

// ユーザー更新用（部分更新対応）
const updateUserSchema = createUserSchema.partial() // 全フィールドをoptionalにする

// バリデーションミドルウェア
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '入力値が不正です',
          details,
        },
      })
    }
    req.validatedBody = result.data // バリデーション済みのデータをreqに追加
    next()
  }
}

// ルートで使用
app.post('/api/users', validate(createUserSchema), (req, res) => {
  const userData = req.validatedBody // バリデーション済み
  // ユーザー作成処理...
  res.status(201).json({ id: nextId++, ...userData })
})

app.patch('/api/users/:id', validate(updateUserSchema), (req, res) => {
  const updateData = req.validatedBody
  // ユーザー更新処理...
  res.json({ id: parseInt(req.params.id), ...updateData })
})
```

## CORS（Cross-Origin Resource Sharing）

### なぜCORSが必要か

ブラウザには**同一オリジンポリシー（Same-Origin Policy）** というセキュリティ機能がある。異なるオリジン（ドメイン、ポート、プロトコルの組み合わせ）へのリクエストをデフォルトで制限する。

```
オリジン = プロトコル + ドメイン + ポート

https://myapp.com:443  → 1つのオリジン
http://myapp.com:80    → 別のオリジン（プロトコルが違う）
https://api.myapp.com  → 別のオリジン（ドメインが違う）
https://myapp.com:3000 → 別のオリジン（ポートが違う）
```

開発中によくあるケース:

- フロントエンド: `http://localhost:3000`（React等）
- バックエンド: `http://localhost:8080`（Express等）

ポートが異なるので「別オリジン」とみなされ、ブラウザがリクエストをブロックする。CORSはこの制限を適切に緩和する仕組み。

### CORSの設定方法

```bash
npm install cors
```

```javascript
const cors = require('cors')

// 開発環境: 全てのオリジンを許可（本番では使わない）
app.use(cors())

// 本番環境: 特定のオリジンのみ許可
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ['https://myapp.com', 'https://admin.myapp.com']
    // originがnullになるケース（同一オリジンのリクエスト等）も許可
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('CORSポリシーにより拒否されました'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Cookie送信を許可する場合
  maxAge: 86400, // プリフライトリクエストのキャッシュ（24時間）
}

app.use(cors(corsOptions))
```

### プリフライトリクエスト

「単純リクエスト」でない場合（カスタムヘッダーを使う、PUTやDELETEメソッドを使うなど）、ブラウザは本リクエストの前に**OPTIONSリクエスト（プリフライト）** を送信して許可を確認する。

```
ブラウザ                              サーバー
  |                                     |
  |--- OPTIONS /api/users (プリフライト)-->|  「PUT送ってもいい?」
  |<-- 200 + Access-Control-* ヘッダー ----|  「OKだよ」
  |                                     |
  |--- PUT /api/users/1 (本リクエスト) --->|  「では更新します」
  |<-- 200 + データ ----------------------|  「更新完了」
```

## APIドキュメント

### Swagger / OpenAPI

OpenAPI Specification（旧Swagger）は、REST APIの仕様を記述するための標準フォーマット。YAML/JSONでAPIの構造を定義すると、自動でドキュメントUIが生成される。

```bash
npm install swagger-ui-express swagger-jsdoc
```

```javascript
const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ユーザー管理API',
      version: '1.0.0',
      description: 'ユーザーのCRUD操作を提供するAPI',
    },
    servers: [{ url: 'http://localhost:3000', description: '開発サーバー' }],
  },
  apis: ['./routes/*.js'], // JSDocコメントからスキーマを読み取る
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
// http://localhost:3000/api-docs でドキュメントUIにアクセスできる
```

```javascript
// routes/users.js - JSDocでAPIを記述する例

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: ユーザー一覧の取得
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: ページ番号
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 1ページあたりの件数
 *     responses:
 *       200:
 *         description: ユーザー一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
```

### Postmanの使い方

Postmanは、APIのテスト・開発に使われるGUIツール。curlコマンドを打たなくても、視覚的にリクエストを送信しレスポンスを確認できる。

| 機能             | 説明                                               |
| ---------------- | -------------------------------------------------- |
| リクエスト送信   | GUIでメソッド、URL、ヘッダー、ボディを設定して送信 |
| コレクション     | APIリクエストをグループ化して管理                  |
| 環境変数         | 開発/本番でURLを切り替え                           |
| テスト           | レスポンスの自動テスト（JavaScriptで記述）         |
| モック           | APIがまだない状態でフロントエンド開発可能          |
| ドキュメント生成 | コレクションからAPIドキュメントを自動生成          |

## REST vs GraphQL vs gRPC

| 項目             | REST                   | GraphQL                              | gRPC                         |
| ---------------- | ---------------------- | ------------------------------------ | ---------------------------- |
| 開発者           | Roy Fielding（2000年） | Facebook（2015年）                   | Google（2015年）             |
| プロトコル       | HTTP                   | HTTP                                 | HTTP/2                       |
| データ形式       | JSON                   | JSON                                 | Protocol Buffers（バイナリ） |
| エンドポイント   | 複数（リソースごと）   | 単一（`/graphql`）                   | サービスごと                 |
| データ取得       | サーバーが決めた形式   | クライアントが必要なフィールドを指定 | スキーマで定義               |
| オーバーフェッチ | 起きやすい             | 起きにくい                           | 起きにくい                   |
| アンダーフェッチ | 起きやすい             | 起きにくい                           | 起きにくい                   |
| リアルタイム     | WebSocket等で対応      | Subscription                         | ストリーミング               |
| 型安全性         | なし（OpenAPIで補完）  | スキーマで保証                       | Protocol Buffersで保証       |
| 学習コスト       | 低い                   | 中程度                               | 高い                         |
| 向いている場面   | 汎用的なWeb API        | 複雑なデータ取得、モバイルアプリ     | マイクロサービス間通信       |
| ブラウザ対応     | ネイティブ対応         | ライブラリが必要                     | gRPC-Web経由                 |

**オーバーフェッチ**: 必要ないデータまで返ってくること。例えばユーザー名だけ欲しいのに全フィールドが返ってくる。

**アンダーフェッチ**: 1回のリクエストで必要なデータが取れず、複数回リクエストが必要になること。

```
【RESTの場合: ユーザーとその投稿を取得するには2回リクエストが必要】
GET /api/users/1          → ユーザー情報
GET /api/users/1/posts    → そのユーザーの投稿一覧

【GraphQLの場合: 1回のリクエストで必要なデータだけ取得できる】
POST /graphql
{
  user(id: 1) {
    name
    posts {
      title
      createdAt
    }
  }
}
```

最初に学ぶならRESTが推奨。RESTの概念を理解した上でGraphQLやgRPCに進むとスムーズに理解できる。

## レート制限（Rate Limiting）

### なぜ必要か

- **DDoS攻撃**の緩和（大量のリクエストでサーバーをダウンさせる攻撃）
- **スクレイピング**の防止
- **ブルートフォース攻撃**の防止（パスワードの総当たり）
- **APIの公平な使用**の保証（1人のユーザーがリソースを独占しない）

### 実装方法

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit')

// 一般的なAPI用
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 15分間に100リクエストまで
  standardHeaders: true, // RateLimit-* ヘッダーを返す
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'リクエスト回数の上限に達しました。15分後に再試行してください。',
    },
  },
})

// ログイン用（厳しめ）
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 5, // 1時間に5回まで
  message: {
    error: {
      code: 'LOGIN_RATE_LIMIT',
      message: 'ログイン試行回数の上限に達しました。1時間後に再試行してください。',
    },
  },
})

app.use('/api/', apiLimiter)
app.post('/api/login', loginLimiter, loginHandler)
```

レスポンスヘッダーに含まれるレート制限情報:

```
RateLimit-Limit: 100          ← 上限
RateLimit-Remaining: 95       ← 残り回数
RateLimit-Reset: 1711612800   ← リセット時刻（Unix timestamp）
```

## 実践例: ブログAPIの設計と実装

### API設計

```
POST   /api/v1/posts          → 記事の作成
GET    /api/v1/posts          → 記事一覧の取得（ページネーション、検索、フィルタ対応）
GET    /api/v1/posts/:id      → 記事の個別取得
PUT    /api/v1/posts/:id      → 記事の全体更新
PATCH  /api/v1/posts/:id      → 記事の部分更新
DELETE /api/v1/posts/:id      → 記事の削除
GET    /api/v1/posts/:id/comments → 記事のコメント一覧
POST   /api/v1/posts/:id/comments → 記事にコメント追加
```

### 全コード

```javascript
const express = require('express')
const { z } = require('zod')
const cors = require('cors')
const rateLimit = require('express-rate-limit')

const app = express()

// ミドルウェア
app.use(express.json())
app.use(cors())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

// 仮のデータベース
let posts = [
  {
    id: 1,
    title: 'Node.js入門',
    body: 'Node.jsはサーバーサイドJavaScriptのランタイム環境です。',
    author: '太郎',
    tags: ['Node.js', '入門'],
    published: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 2,
    title: 'Express.jsガイド',
    body: 'Express.jsはNode.jsの軽量Webフレームワークです。',
    author: '花子',
    tags: ['Express', 'Node.js'],
    published: true,
    createdAt: '2026-03-15T14:30:00Z',
    updatedAt: '2026-03-15T14:30:00Z',
  },
]
let comments = [
  {
    id: 1,
    postId: 1,
    author: '花子',
    body: 'とても参考になりました!',
    createdAt: '2026-03-02T09:00:00Z',
  },
]
let nextPostId = 3
let nextCommentId = 2

// バリデーションスキーマ
const createPostSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内です'),
  body: z.string().min(1, '本文は必須です'),
  author: z.string().min(1, '著者名は必須です'),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
})

const updatePostSchema = createPostSchema.partial()

const createCommentSchema = z.object({
  author: z.string().min(1, '名前は必須です'),
  body: z.string().min(1, 'コメントは必須です').max(1000, 'コメントは1000文字以内です'),
})

// バリデーションミドルウェア
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '入力値が不正です',
          details: result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      })
    }
    req.validatedBody = result.data
    next()
  }
}

// ルーター
const router = express.Router()

// 記事の作成
router.post('/posts', validate(createPostSchema), (req, res) => {
  const now = new Date().toISOString()
  const post = {
    id: nextPostId++,
    ...req.validatedBody,
    createdAt: now,
    updatedAt: now,
  }
  posts.push(post)
  res.status(201).json(post)
})

// 記事一覧の取得
router.get('/posts', (req, res) => {
  let result = [...posts]

  // 公開状態でフィルタ
  if (req.query.published !== undefined) {
    const isPublished = req.query.published === 'true'
    result = result.filter((p) => p.published === isPublished)
  }

  // タグでフィルタ
  if (req.query.tag) {
    result = result.filter((p) => p.tags.includes(req.query.tag))
  }

  // キーワード検索
  if (req.query.q) {
    const keyword = req.query.q.toLowerCase()
    result = result.filter(
      (p) => p.title.toLowerCase().includes(keyword) || p.body.toLowerCase().includes(keyword)
    )
  }

  // ソート
  const sortField = req.query.sort || 'createdAt'
  const sortOrder = req.query.order === 'asc' ? 1 : -1
  result.sort((a, b) => {
    if (a[sortField] < b[sortField]) return -1 * sortOrder
    if (a[sortField] > b[sortField]) return 1 * sortOrder
    return 0
  })

  // ページネーション
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit
  const paginatedData = result.slice(offset, offset + limit)

  res.json({
    data: paginatedData,
    pagination: {
      page,
      limit,
      totalItems: result.length,
      totalPages: Math.ceil(result.length / limit),
      hasNext: offset + limit < result.length,
      hasPrev: page > 1,
    },
  })
})

// 記事の個別取得
router.get('/posts/:id', (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id))
  if (!post) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: '記事が見つかりません' },
    })
  }
  res.json(post)
})

// 記事の全体更新
router.put('/posts/:id', validate(createPostSchema), (req, res) => {
  const index = posts.findIndex((p) => p.id === parseInt(req.params.id))
  if (index === -1) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: '記事が見つかりません' },
    })
  }
  posts[index] = {
    ...posts[index],
    ...req.validatedBody,
    id: posts[index].id,
    createdAt: posts[index].createdAt,
    updatedAt: new Date().toISOString(),
  }
  res.json(posts[index])
})

// 記事の部分更新
router.patch('/posts/:id', validate(updatePostSchema), (req, res) => {
  const index = posts.findIndex((p) => p.id === parseInt(req.params.id))
  if (index === -1) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: '記事が見つかりません' },
    })
  }
  posts[index] = {
    ...posts[index],
    ...req.validatedBody,
    id: posts[index].id,
    createdAt: posts[index].createdAt,
    updatedAt: new Date().toISOString(),
  }
  res.json(posts[index])
})

// 記事の削除
router.delete('/posts/:id', (req, res) => {
  const index = posts.findIndex((p) => p.id === parseInt(req.params.id))
  if (index === -1) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: '記事が見つかりません' },
    })
  }
  posts.splice(index, 1)
  // 関連コメントも削除
  comments = comments.filter((c) => c.postId !== parseInt(req.params.id))
  res.status(204).send()
})

// コメント一覧の取得
router.get('/posts/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id)
  const post = posts.find((p) => p.id === postId)
  if (!post) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: '記事が見つかりません' },
    })
  }
  const postComments = comments.filter((c) => c.postId === postId)
  res.json({ data: postComments })
})

// コメントの追加
router.post('/posts/:id/comments', validate(createCommentSchema), (req, res) => {
  const postId = parseInt(req.params.id)
  const post = posts.find((p) => p.id === postId)
  if (!post) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: '記事が見つかりません' },
    })
  }
  const comment = {
    id: nextCommentId++,
    postId,
    ...req.validatedBody,
    createdAt: new Date().toISOString(),
  }
  comments.push(comment)
  res.status(201).json(comment)
})

// ルーターをマウント
app.use('/api/v1', router)

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'エンドポイントが見つかりません' },
  })
})

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'サーバー内部エラーが発生しました' },
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`ブログAPIサーバーが http://localhost:${PORT} で起動しました`)
  console.log(`APIドキュメント: http://localhost:${PORT}/api-docs`)
})
```

## まとめ

RESTful APIの設計で押さえるべきポイント:

| カテゴリ         | ポイント                                              |
| ---------------- | ----------------------------------------------------- |
| URI設計          | リソースは名詞・複数形、階層は3段階まで               |
| HTTPメソッド     | CRUD操作を適切なメソッドで表現                        |
| ステータスコード | 意味に合ったコードを返す（200, 201, 400, 404, 500等） |
| レスポンス形式   | 統一されたJSON形式（特にエラーレスポンス）            |
| バリデーション   | サーバー側で必ず入力を検証                            |
| セキュリティ     | CORS, レート制限, 入力バリデーション                  |
| ドキュメント     | OpenAPI/Swaggerで仕様を記述                           |

REST APIの設計スキルは、バックエンド開発だけでなくフロントエンド開発においても重要。APIの仕組みを理解していれば、フロントエンドからのデータ取得やエラーハンドリングが格段にスムーズになる。

## 参考リンク

- [MDN Web Docs - HTTP](https://developer.mozilla.org/ja/docs/Web/HTTP) - HTTPの基礎知識（メソッド、ステータスコード、ヘッダー）
- [REST API Tutorial](https://restfulapi.net/) - REST APIの設計原則（英語）
- [Express.js公式ガイド - ルーティング](https://expressjs.com/ja/guide/routing.html) - Express.jsのルーティング解説
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html) - OpenAPI仕様の公式ドキュメント（英語）
- [Swagger公式サイト](https://swagger.io/) - Swaggerツール群（Editor, UI, Codegen）
- [Postman公式サイト](https://www.postman.com/) - APIテストツール
- [zod公式ドキュメント](https://zod.dev/) - TypeScriptファーストなバリデーションライブラリ
- [HTTP Status Codes](https://httpstatuses.io/) - ステータスコードの一覧と解説（英語）
- [cors npmパッケージ](https://github.com/expressjs/cors) - Express.jsのCORSミドルウェア
- [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) - レート制限ミドルウェア
