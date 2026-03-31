---
title: 'チェックポイント: CRUDアプリを作る'
order: 19
section: 'API/認証'
---

# チェックポイント: CRUDアプリを作る

このチェックポイントでは、Express.js + SQLite + JWTで認証付きのCRUD REST APIを構築します。ブログ記事の作成/読取/更新/削除ができるAPIサーバーを作り、Postmanでテストします。

---

## 完成イメージ

| エンドポイント     | メソッド | 説明         | 認証 |
| ------------------ | -------- | ------------ | ---- |
| /api/auth/register | POST     | ユーザー登録 | 不要 |
| /api/auth/login    | POST     | ログイン     | 不要 |
| /api/posts         | GET      | 記事一覧取得 | 不要 |
| /api/posts/:id     | GET      | 記事詳細取得 | 不要 |
| /api/posts         | POST     | 記事作成     | 必要 |
| /api/posts/:id     | PUT      | 記事更新     | 必要 |
| /api/posts/:id     | DELETE   | 記事削除     | 必要 |

---

## 要件リスト

- [ ] Express.jsでREST APIを構築する
- [ ] SQLiteでデータを永続化する
- [ ] JWTで認証を実装する
- [ ] zodでリクエストのバリデーションを行う
- [ ] 適切なエラーハンドリングを実装する
- [ ] Postmanでテストする

---

## ステップ1: プロジェクトのセットアップ

```bash
mkdir blog-api
cd blog-api
npm init -y
npm install express better-sqlite3 bcryptjs jsonwebtoken zod cors dotenv
npm install -D nodemon
```

| パッケージ     | 説明                                        |
| -------------- | ------------------------------------------- |
| express        | Webフレームワーク                           |
| better-sqlite3 | SQLiteデータベースドライバ（同期API）       |
| bcryptjs       | パスワードのハッシュ化                      |
| jsonwebtoken   | JWT（JSON Web Token）の生成と検証           |
| zod            | スキーマバリデーション                      |
| cors           | CORS（Cross-Origin Resource Sharing）の設定 |
| dotenv         | 環境変数を.envファイルから読み込む          |
| nodemon        | ファイル変更時の自動再起動（開発用）        |

`package.json`にスクリプトを追加します。

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}
```

### .gitignoreの作成

`.gitignore`ファイルを作成し、Gitにコミットすべきでないファイルを指定します。

```
node_modules/
.env
blog.db
```

### 環境変数ファイルの作成

`.env`ファイルを作成します（上記の`.gitignore`により、Gitにコミットされません）。

```
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production
```

---

## ステップ2: データベースのセットアップ

`db.js`

```javascript
import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const db = new Database(path.join(__dirname, 'blog.db'))

/**
 * WALモードを有効にして並行アクセス時のパフォーマンスを改善する
 */
db.pragma('journal_mode = WAL')

/**
 * テーブルを作成する（存在しない場合のみ）
 */
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`)

export default db
```

**SQLiteの解説**: SQLiteはファイルベースの軽量データベースです。PostgreSQLのようにサーバーを別途起動する必要がなく、学習やプロトタイピングに最適です。`better-sqlite3`は同期APIを提供するため、async/awaitを使わずにシンプルに書けます。

**JWTの解説**: JWT（JSON Web Token）はユーザー認証に使われるトークン形式です。ログイン時にサーバーがトークンを発行し、クライアントはそのトークンをリクエストヘッダーに含めて送信します。サーバーはトークンを検証してユーザーを特定します。

---

## ステップ3: バリデーションスキーマを定義する

`validation.js`

```javascript
import { z } from 'zod'

/**
 * ユーザー登録のバリデーションスキーマ
 */
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'ユーザー名は3文字以上で入力してください')
    .max(20, 'ユーザー名は20文字以下で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
})

/**
 * ログインのバリデーションスキーマ
 */
export const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

/**
 * 記事作成/更新のバリデーションスキーマ
 */
export const postSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(200, 'タイトルは200文字以下で入力してください'),
  body: z.string().min(1, '本文を入力してください'),
})
```

**zodの解説**: zodはTypeScript/JavaScriptのスキーマバリデーションライブラリです。リクエストボディの形式を定義し、不正なデータが処理されるのを防ぎます。`.min()`や`.email()`などのメソッドチェーンで直感的にルールを定義できます。

---

## ステップ4: 認証ミドルウェアを作る

`middleware/auth.js`

```javascript
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-for-development'

/**
 * JWTトークンを検証する認証ミドルウェア
 * Authorizationヘッダーからトークンを取得し、検証する
 * 検証成功時はreq.userにユーザー情報を格納する
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: '認証が必要です。Authorizationヘッダーにトークンを含めてください。',
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({
      error: 'トークンが無効または期限切れです。再度ログインしてください。',
    })
  }
}
```

**ミドルウェアの解説**: Express.jsのミドルウェアは、リクエストとレスポンスの間に処理を挟む仕組みです。`next()`を呼ぶと次の処理に進み、呼ばなければそこでレスポンスを返して終了します。認証ミドルウェアはトークンを検証し、有効なら次の処理に進めます。

---

## ステップ5: バリデーションミドルウェア

`middleware/validate.js`

```javascript
/**
 * zodスキーマでリクエストボディをバリデーションするミドルウェアを生成する
 * @param {import('zod').ZodSchema} schema - zodスキーマ
 * @returns {Function} Expressミドルウェア
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))

      return res.status(400).json({
        error: 'バリデーションエラー',
        details: errors,
      })
    }

    req.body = result.data
    next()
  }
}
```

---

## ステップ6: ルートを定義する

### 認証ルート

`routes/auth.js`

```javascript
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'
import { validate } from '../middleware/validate.js'
import { registerSchema, loginSchema } from '../validation.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-for-development'

/**
 * POST /api/auth/register
 * ユーザー登録
 */
router.post('/register', validate(registerSchema), (req, res) => {
  const { username, email, password } = req.body

  // 既存ユーザーの確認
  const existing = db
    .prepare('SELECT id FROM users WHERE email = ? OR username = ?')
    .get(email, username)
  if (existing) {
    return res.status(409).json({
      error: 'そのメールアドレスまたはユーザー名は既に使用されています。',
    })
  }

  // パスワードをハッシュ化
  const hashedPassword = bcrypt.hashSync(password, 10)

  // ユーザーを作成
  const result = db
    .prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)')
    .run(username, email, hashedPassword)

  // トークンを生成
  const token = jwt.sign({ id: result.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '24h' })

  res.status(201).json({
    message: 'ユーザー登録が完了しました',
    token,
    user: { id: result.lastInsertRowid, username, email },
  })
})

/**
 * POST /api/auth/login
 * ログイン
 */
router.post('/login', validate(loginSchema), (req, res) => {
  const { email, password } = req.body

  // ユーザーを検索
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user) {
    return res.status(401).json({
      error: 'メールアドレスまたはパスワードが正しくありません。',
    })
  }

  // パスワードを照合
  const isValid = bcrypt.compareSync(password, user.password)
  if (!isValid) {
    return res.status(401).json({
      error: 'メールアドレスまたはパスワードが正しくありません。',
    })
  }

  // トークンを生成
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' })

  res.json({
    message: 'ログインに成功しました',
    token,
    user: { id: user.id, username: user.username, email: user.email },
  })
})

export default router
```

**bcryptの解説**: パスワードをそのままデータベースに保存すると、データが漏洩した際に全てのパスワードが流出します。bcryptはパスワードをハッシュ（不可逆な変換）して保存し、ログイン時はハッシュ同士を比較します。第2引数の`10`はソルトラウンド（ハッシュの計算回数）です。

### 記事ルート

`routes/posts.js`

```javascript
import { Router } from 'express'
import db from '../db.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { postSchema } from '../validation.js'

const router = Router()

/**
 * GET /api/posts
 * 記事一覧を取得する（認証不要）
 */
router.get('/', (req, res) => {
  const posts = db
    .prepare(
      `
    SELECT
      posts.id,
      posts.title,
      posts.body,
      posts.created_at,
      posts.updated_at,
      users.username AS author
    FROM posts
    JOIN users ON posts.user_id = users.id
    ORDER BY posts.created_at DESC
  `
    )
    .all()

  res.json({ posts })
})

/**
 * GET /api/posts/:id
 * 記事の詳細を取得する（認証不要）
 */
router.get('/:id', (req, res) => {
  const post = db
    .prepare(
      `
    SELECT
      posts.id,
      posts.title,
      posts.body,
      posts.created_at,
      posts.updated_at,
      posts.user_id,
      users.username AS author
    FROM posts
    JOIN users ON posts.user_id = users.id
    WHERE posts.id = ?
  `
    )
    .get(req.params.id)

  if (!post) {
    return res.status(404).json({ error: '記事が見つかりません。' })
  }

  res.json({ post })
})

/**
 * POST /api/posts
 * 記事を作成する（認証必要）
 */
router.post('/', authenticate, validate(postSchema), (req, res) => {
  const { title, body } = req.body
  const userId = req.user.id

  const result = db
    .prepare('INSERT INTO posts (title, body, user_id) VALUES (?, ?, ?)')
    .run(title, body, userId)

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid)

  res.status(201).json({
    message: '記事を作成しました',
    post,
  })
})

/**
 * PUT /api/posts/:id
 * 記事を更新する（認証必要、自分の記事のみ）
 */
router.put('/:id', authenticate, validate(postSchema), (req, res) => {
  const { title, body } = req.body
  const postId = req.params.id
  const userId = req.user.id

  // 記事の存在と所有者を確認
  const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId)
  if (!existing) {
    return res.status(404).json({ error: '記事が見つかりません。' })
  }

  if (existing.user_id !== userId) {
    return res.status(403).json({ error: '他のユーザーの記事は編集できません。' })
  }

  db.prepare(
    'UPDATE posts SET title = ?, body = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(title, body, postId)

  const updated = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId)

  res.json({
    message: '記事を更新しました',
    post: updated,
  })
})

/**
 * DELETE /api/posts/:id
 * 記事を削除する（認証必要、自分の記事のみ）
 */
router.delete('/:id', authenticate, (req, res) => {
  const postId = req.params.id
  const userId = req.user.id

  const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId)
  if (!existing) {
    return res.status(404).json({ error: '記事が見つかりません。' })
  }

  if (existing.user_id !== userId) {
    return res.status(403).json({ error: '他のユーザーの記事は削除できません。' })
  }

  db.prepare('DELETE FROM posts WHERE id = ?').run(postId)

  res.json({ message: '記事を削除しました' })
})

export default router
```

---

## ステップ7: サーバーのエントリーポイント

`server.js`

```javascript
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import postRoutes from './routes/posts.js'

const app = express()
const PORT = process.env.PORT || 3000

// ミドルウェア
app.use(cors())
app.use(express.json())

// ルート
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({ error: 'エンドポイントが見つかりません。' })
})

// エラーハンドラー
app.use((err, req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'サーバー内部エラーが発生しました。' })
})

app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`)
})
```

---

## ステップ8: Postmanでテストする

### テスト手順

Postmanを起動し、以下の順番でAPIをテストします。

#### 1. ユーザー登録

- **メソッド**: POST
- **URL**: `http://localhost:3000/api/auth/register`
- **Body** (JSON):

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

レスポンスの`token`をコピーしておきます。

#### 2. ログイン

- **メソッド**: POST
- **URL**: `http://localhost:3000/api/auth/login`
- **Body** (JSON):

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### 3. 記事作成（認証あり）

- **メソッド**: POST
- **URL**: `http://localhost:3000/api/posts`
- **Headers**: `Authorization: Bearer <コピーしたトークン>`
- **Body** (JSON):

```json
{
  "title": "はじめてのブログ記事",
  "body": "Express.jsでAPIを作りました。"
}
```

#### 4. 記事一覧取得

- **メソッド**: GET
- **URL**: `http://localhost:3000/api/posts`

#### 5. 記事更新（認証あり）

- **メソッド**: PUT
- **URL**: `http://localhost:3000/api/posts/1`
- **Headers**: `Authorization: Bearer <トークン>`
- **Body** (JSON):

```json
{
  "title": "更新されたタイトル",
  "body": "内容を更新しました。"
}
```

#### 6. 記事削除（認証あり）

- **メソッド**: DELETE
- **URL**: `http://localhost:3000/api/posts/1`
- **Headers**: `Authorization: Bearer <トークン>`

#### 7. エラーケースの確認

- トークンなしで記事を作成 → 401
- 存在しないIDの記事を取得 → 404
- バリデーションエラー（タイトルなし） → 400

---

## ファイル構成のまとめ

```
blog-api/
├── server.js           # エントリーポイント
├── db.js               # データベース接続とテーブル作成
├── validation.js        # zodバリデーションスキーマ
├── middleware/
│   ├── auth.js          # JWT認証ミドルウェア
│   └── validate.js      # バリデーションミドルウェア
├── routes/
│   ├── auth.js          # 認証ルート（登録/ログイン）
│   └── posts.js         # 記事CRUDルート
├── .env                 # 環境変数（Git管理外）
├── .gitignore
├── package.json
└── blog.db              # SQLiteデータベースファイル（自動生成）
```

---

## 完了チェックリスト

| チェック項目                         | 確認 |
| ------------------------------------ | ---- |
| ユーザー登録ができる                 |      |
| ログインしてトークンを取得できる     |      |
| 認証付きで記事を作成できる           |      |
| 記事一覧と詳細を取得できる           |      |
| 自分の記事を更新できる               |      |
| 自分の記事を削除できる               |      |
| 他人の記事は更新/削除できない        |      |
| バリデーションエラーが適切に返される |      |
| 認証なしのリクエストが拒否される     |      |
| .envがGitにコミットされていない      |      |

---

## 発展課題（任意）

- ページネーション（limit/offset）を実装する
- 記事の検索機能を追加する
- リフレッシュトークンを実装する
- PostgreSQLに移行する
- テストコードを書く（supertest + Vitest）
- Swagger/OpenAPIでAPIドキュメントを自動生成する

## 参考リンク

- [Express.js公式サイト](https://expressjs.com/ja/) - Express.jsの公式ガイドとAPIリファレンス
- [MDN Web Docs - HTTP](https://developer.mozilla.org/ja/docs/Web/HTTP) - HTTPメソッドとステータスコードの解説
- [JWT公式サイト（jwt.io）](https://jwt.io/) - JWTのデバッグツールと解説
- [better-sqlite3 GitHub](https://github.com/WiseLibs/better-sqlite3) - Node.js用の高速SQLiteライブラリ
- [Postman公式サイト](https://www.postman.com/) - APIテストツール
- [zod公式ドキュメント](https://zod.dev/) - バリデーションライブラリ
