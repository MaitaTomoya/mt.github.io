---
title: 'チェックポイント: 本格的なアプリを作る'
order: 22
section: 'キャッシュ/システム'
---

# チェックポイント: 本格的なアプリを作る

このチェックポイントでは、React + Express + PostgreSQL + Redisを組み合わせたフルスタックアプリケーションを構築します。Docker Composeで開発環境を構築し、認証、キャッシュ、セッション管理を実装します。

---

## アーキテクチャ図

```
+------------------+       +------------------+       +------------------+
|                  |       |                  |       |                  |
|  React           | ----> |  Express API     | ----> |  PostgreSQL      |
|  (フロントエンド)  | <---- |  (バックエンド)    | <---- |  (データベース)    |
|  :5173           |       |  :3000           |       |  :5432           |
|                  |       |                  |       |                  |
+------------------+       +--------+---------+       +------------------+
                                    |
                                    v
                           +------------------+
                           |                  |
                           |  Redis           |
                           |  (キャッシュ/     |
                           |   セッション)     |
                           |  :6379           |
                           |                  |
                           +------------------+
```

| コンポーネント | 技術           | 役割                                 |
| -------------- | -------------- | ------------------------------------ |
| フロントエンド | React + Vite   | ユーザーインターフェース             |
| バックエンド   | Express.js     | REST API、ビジネスロジック           |
| データベース   | PostgreSQL     | データの永続化                       |
| キャッシュ     | Redis          | セッション管理、レスポンスキャッシュ |
| 開発環境       | Docker Compose | 全サービスの一括管理                 |

---

## 要件リスト

- [ ] Docker Composeで全サービス（PostgreSQL、Redis、バックエンド、フロントエンド）を起動する
- [ ] PostgreSQLにテーブルを作成してデータを永続化する
- [ ] ユーザー登録/ログインの認証機能を実装する
- [ ] ブログ記事のCRUD操作を実装する
- [ ] RedisでAPIレスポンスをキャッシュする
- [ ] Redisでセッション管理を実装する（即座のログアウトに対応）
- [ ] フロントエンドからバックエンドAPIにアクセスする
- [ ] エラー時に適切なメッセージを表示する

---

## ステップ1: プロジェクト構成

```
fullstack-app/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── config/
│       │   ├── database.js
│       │   └── redis.js
│       ├── middleware/
│       │   ├── auth.js
│       │   └── cache.js
│       ├── routes/
│       │   ├── auth.js
│       │   └── posts.js
│       └── models/
│           ├── user.js
│           └── post.js
└── .env
```

### バックエンドのセットアップ

```bash
mkdir -p fullstack-app/backend/src/{config,middleware,routes,models}
cd fullstack-app/backend
npm init -y
npm install express pg redis jsonwebtoken bcryptjs cors
npm install -D nodemon
```

`backend/package.json`に以下を設定します。

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

### フロントエンドのセットアップ

```bash
cd ../
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss @tailwindcss/vite
```

---

## ステップ2: Docker Composeで環境構築

`docker-compose.yml`

```yaml
services:
  # PostgreSQLデータベース
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppassword
      POSTGRES_DB: fullstack_app
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U appuser -d fullstack_app']
      interval: 5s
      timeout: 5s
      retries: 5

  # Redisキャッシュ
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5

  # バックエンドAPI
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgresql://appuser:apppassword@db:5432/fullstack_app
      REDIS_URL: redis://redis:6379
      JWT_SECRET: your-secret-key-change-in-production
      NODE_ENV: development
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src

  # フロントエンド
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - '5173:5173'
    environment:
      VITE_API_URL: http://localhost:3000
    depends_on:
      - backend
    volumes:
      - ./frontend/src:/app/src

volumes:
  postgres_data:
  redis_data:
```

**Docker Composeの解説**: Docker Composeは複数のDockerコンテナをまとめて管理するツールです。`docker-compose.yml`に各サービスの設定を記述し、`docker compose up`で全てのサービスを一括で起動できます。`depends_on`でサービスの起動順序を制御し、`healthcheck`でサービスの準備完了を確認してから依存サービスを起動します。

### バックエンドのDockerfile

`backend/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

### フロントエンドのDockerfile

`frontend/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### 起動コマンド

```bash
# 全サービスを起動
docker compose up -d

# ログを確認
docker compose logs -f backend

# 停止
docker compose down

# データも含めて完全に削除
docker compose down -v
```

---

## ステップ3: データベースの初期化

`backend/init.sql`

```sql
-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 記事テーブル
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 更新日時を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- インデックス
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
```

---

## ステップ4: データベース接続設定

`backend/src/config/database.js`

```javascript
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

/**
 * データベース接続をテストする
 */
pool.on('connect', () => {
  console.log('PostgreSQLに接続しました')
})

pool.on('error', (err) => {
  console.error('PostgreSQL接続エラー:', err)
})

export default pool
```

---

## ステップ5: Redis接続とキャッシュミドルウェア

### Redis接続設定

`backend/src/config/redis.js`

```javascript
import { createClient } from 'redis'

const redisClient = createClient({
  url: process.env.REDIS_URL,
})

redisClient.on('connect', () => {
  console.log('Redisに接続しました')
})

redisClient.on('error', (err) => {
  console.error('Redis接続エラー:', err)
})

await redisClient.connect()

export default redisClient
```

### キャッシュミドルウェア

`backend/src/middleware/cache.js`

```javascript
import redisClient from '../config/redis.js'

/**
 * レスポンスをRedisにキャッシュするミドルウェアを生成する
 * キャッシュが存在する場合はキャッシュから返し、
 * 存在しない場合は通常のレスポンスをキャッシュに保存する
 *
 * @param {number} ttl - キャッシュの有効期限（秒）
 * @returns {Function} Expressミドルウェア
 */
export function cacheMiddleware(ttl = 60) {
  return async (req, res, next) => {
    // GETリクエストのみキャッシュする
    if (req.method !== 'GET') {
      return next()
    }

    const cacheKey = `cache:${req.originalUrl}`

    try {
      const cached = await redisClient.get(cacheKey)

      if (cached) {
        console.log(`キャッシュヒット: ${cacheKey}`)
        return res.json(JSON.parse(cached))
      }

      // レスポンスのjsonメソッドをオーバーライドしてキャッシュに保存する
      const originalJson = res.json.bind(res)
      res.json = async (data) => {
        await redisClient.setEx(cacheKey, ttl, JSON.stringify(data))
        console.log(`キャッシュ保存: ${cacheKey} (TTL: ${ttl}秒)`)
        return originalJson(data)
      }

      next()
    } catch (err) {
      console.error('キャッシュエラー:', err)
      next()
    }
  }
}

/**
 * 指定パターンのキャッシュを無効化する
 * 記事の作成/更新/削除時に呼び出す
 * @param {string} pattern - 無効化するキャッシュキーのパターン
 */
export async function invalidateCache(pattern) {
  try {
    const keys = []
    for await (const key of redisClient.scanIterator({ MATCH: pattern })) {
      keys.push(key)
    }
    if (keys.length > 0) {
      await redisClient.del(keys)
      console.log(`キャッシュ無効化: ${keys.length}件`)
    }
  } catch (err) {
    console.error('キャッシュ無効化エラー:', err)
  }
}
```

**Redisの解説**: Redisはインメモリのデータストアです。データをメモリ上に保持するため、ディスクベースのデータベースよりも高速にデータを読み書きできます。主な用途は以下の通りです。

| 用途           | 説明                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| キャッシュ     | データベースへのクエリ結果を一時保存し、同じリクエストに高速に応答する |
| セッション管理 | ユーザーのログイン状態をサーバー間で共有する                           |
| レート制限     | APIの呼び出し回数を制限する                                            |

`TTL（Time To Live）`はキャッシュの有効期限です。期限が切れると自動的に削除されるため、古いデータが残り続ける心配がありません。

---

## ステップ6: セッション管理

`backend/src/middleware/session.js`

```javascript
import redisClient from '../config/redis.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
const SESSION_TTL = 86400 // 24時間

/**
 * セッションベースの認証ミドルウェア
 * JWTトークンの検証に加え、Redisでセッションの有効性を確認する
 * これにより、トークンの即座の無効化（ログアウト）が可能になる
 */
export async function sessionAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '認証が必要です。' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const sessionKey = `session:${decoded.id}:${token.slice(-10)}`

    // Redisでセッションの有効性を確認
    const session = await redisClient.get(sessionKey)
    if (!session) {
      return res.status(401).json({ error: 'セッションが無効です。再度ログインしてください。' })
    }

    req.user = decoded
    req.sessionKey = sessionKey

    // セッションのTTLを延長（アクティブなユーザーのセッションを維持）
    await redisClient.expire(sessionKey, SESSION_TTL)

    next()
  } catch {
    return res.status(401).json({ error: 'トークンが無効です。' })
  }
}

/**
 * ログイン時にセッションをRedisに保存する
 * @param {number} userId - ユーザーID
 * @param {string} token - JWTトークン
 */
export async function createSession(userId, token) {
  const sessionKey = `session:${userId}:${token.slice(-10)}`
  await redisClient.setEx(
    sessionKey,
    SESSION_TTL,
    JSON.stringify({
      userId,
      createdAt: new Date().toISOString(),
    })
  )
}

/**
 * ログアウト時にセッションを削除する
 * @param {string} sessionKey - セッションキー
 */
export async function destroySession(sessionKey) {
  await redisClient.del(sessionKey)
}
```

**セッション管理の解説**: JWTだけでは発行済みトークンを即座に無効化できません（有効期限まで使い続けられる）。Redisでセッション情報を管理することで、ログアウト時にセッションを即座に無効化できます。

---

## ステップ7: フロントエンドの主要コンポーネント

### APIクライアント

`frontend/src/api/client.js`

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * 認証トークン付きでAPIリクエストを送信する
 * @param {string} endpoint - APIエンドポイント
 * @param {object} options - fetchオプション
 * @returns {Promise<object>} レスポンスデータ
 */
export async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_URL}${endpoint}`, config)

  if (response.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new Error('認証が切れました。再度ログインしてください。')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'リクエストに失敗しました。')
  }

  return data
}
```

### 記事一覧コンポーネント

`frontend/src/components/PostList.jsx`

```jsx
import { useState, useEffect } from 'react'
import { apiClient } from '../api/client'

/**
 * 記事一覧を表示するコンポーネント
 */
export function PostList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await apiClient('/api/posts')
        setPosts(data.posts)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  if (loading) return <p className="text-center py-8">読み込み中...</p>
  if (error) return <p className="text-center py-8 text-red-500">{error}</p>

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">記事一覧</h1>

      {posts.length === 0 ? (
        <p className="text-gray-500">記事はまだありません。</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-gray-600 mt-2 line-clamp-2">{post.body}</p>
              <div className="flex justify-between mt-4 text-sm text-gray-400">
                <span>{post.author}</span>
                <span>{new Date(post.created_at).toLocaleDateString('ja-JP')}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

---

## 次のステップ: デプロイ

このアプリケーションのデプロイについては、次のチェックポイント「デプロイ/CI/CD/監視」で詳しく解説します。まずはDocker Composeでのローカル開発環境で全ての機能が動作することを確認してください。

---

## 完了チェックリスト

| チェック項目                                         | 確認 |
| ---------------------------------------------------- | ---- |
| Docker Composeで全サービスが起動する                 |      |
| PostgreSQLにテーブルが作成されている                 |      |
| ユーザー登録/ログインが動作する                      |      |
| CRUD操作が正しく動作する                             |      |
| Redisでレスポンスがキャッシュされる                  |      |
| キャッシュヒット時にログが出力される                 |      |
| データ変更時にキャッシュが無効化される               |      |
| セッション管理が動作する（ログアウトで即座に無効化） |      |
| フロントエンドからAPIにアクセスできる                |      |
| エラー時に適切なメッセージが表示される               |      |

---

## 発展課題（任意）

- Redisでレート制限を実装する
- WebSocketでリアルタイム通知を追加する
- S3互換ストレージ（MinIO）で画像アップロードを実装する
- Prometheusでメトリクスを収集する
- GitHub Actionsでテストを自動実行する

## 参考リンク

- [React 公式ドキュメント](https://react.dev/) - Reactの公式リファレンス
- [Express.js公式サイト](https://expressjs.com/ja/) - Express.jsの公式ガイド
- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/) - PostgreSQLの公式リファレンス
- [Redis公式サイト](https://redis.io/) - Redisの公式ドキュメント
- [Docker Compose公式ドキュメント](https://docs.docker.com/compose/) - Docker Composeの使い方ガイド
- [Prisma公式ドキュメント](https://www.prisma.io/docs) - Node.js向けORMの公式ガイド
