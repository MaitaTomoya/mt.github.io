---
title: 'Supabase'
order: 29
section: 'データベース'
---

# Supabase

## Supabaseとは何か

Supabase（スーパーベース）は、**オープンソースのFirebase代替**として注目されているBaaS（Backend as a Service）プラットフォーム。2020年に誕生し、急速に成長を続けている。

最大の特徴は、バックエンドの中核にGoogle独自のNoSQLではなく**PostgreSQL**を採用していること。これにより、SQLの知識がそのまま活かせる上、PostgreSQLの強力な機能（トランザクション、外部キー、ビュー、関数など）をすべて利用できる。

Supabaseが提供する主な機能:

- **Database**: PostgreSQLデータベース
- **Auth**: 認証・認可（メール、OAuth、Magic Linkなど）
- **Storage**: ファイルストレージ（画像、動画、ドキュメント）
- **Realtime**: WebSocketによるリアルタイムデータ同期
- **Edge Functions**: Deno ベースのサーバーレス関数
- **Vector**: AI/機械学習向けベクトル検索（pgvector）

一言でまとめると、「**PostgreSQLの力を、フロントエンドから簡単に使えるようにしたプラットフォーム**」。

---

## Firebase vs Supabase 詳細比較

Firebaseを使ったことがある人は多いだろう。Supabaseとの違いを理解するために、詳細な比較表を確認しよう。

### 基本的な違い

| 比較項目       | Firebase                  | Supabase                        |
| -------------- | ------------------------- | ------------------------------- |
| 提供元         | Google                    | Supabase Inc.（オープンソース） |
| データベース   | Firestore（NoSQL）        | PostgreSQL（RDBMS）             |
| クエリ言語     | 独自API                   | SQL + REST API + GraphQL        |
| データモデル   | ドキュメント/コレクション | テーブル/リレーション           |
| オープンソース | いいえ                    | はい（MIT/Apache 2.0）          |
| セルフホスト   | 不可                      | 可能（Docker）                  |

### 機能比較

| 機能             | Firebase                      | Supabase                             |
| ---------------- | ----------------------------- | ------------------------------------ |
| 認証             | Firebase Auth（充実）         | GoTrue（同等の機能）                 |
| ストレージ       | Cloud Storage for Firebase    | S3互換ストレージ                     |
| リアルタイム     | Firestoreリアルタイムリスナー | PostgreSQL LISTEN/NOTIFY + WebSocket |
| サーバーレス関数 | Cloud Functions（Node.js）    | Edge Functions（Deno/TypeScript）    |
| ホスティング     | Firebase Hosting              | なし（Vercel/Netlifyと連携）         |
| 機械学習         | Firebase ML                   | pgvector（ベクトル検索）             |
| アナリティクス   | Google Analytics連携          | なし（外部ツール連携）               |

### 料金比較（2024年時点）

| プラン         | Firebase                  | Supabase                                     |
| -------------- | ------------------------- | -------------------------------------------- |
| 無料枠         | Sparkプラン（読取5万/日） | Freeプラン（500MBストレージ、2プロジェクト） |
| 有料プラン開始 | 従量課金（Blazeプラン）   | $25/月（Proプラン）                          |
| 料金体系       | 従量課金（予測しにくい）  | 固定料金 + 従量課金（予測しやすい）          |

### ベンダーロックインの比較

これは非常に重要なポイント。

**Firebase**:

- Google Cloud Platformに完全に依存
- Firestoreのデータ構造は独自形式で、移行が困難
- Cloud Functionsの独自トリガーは他のプラットフォームで再現できない
- 「Googleがサービスを終了したら？」というリスク

**Supabase**:

- PostgreSQLなので、どのホスティングにも移行可能
- `pg_dump`でデータをエクスポートし、他のPostgreSQL環境にインポートできる
- オープンソースなのでセルフホストも可能
- 「Supabase社がなくなっても、PostgreSQLは残る」

```
ベンダーロックインの度合い

Firebase:  |==================| 高い
Supabase:  |=====|              低い
```

---

## なぜSupabaseが注目されているか

### 1. PostgreSQLの力

PostgreSQLは世界で最も先進的なオープンソースRDBMS。Supabaseを使うことで、以下のPostgreSQL機能がそのまま使える:

- **ACID準拠のトランザクション**: データの整合性を保証
- **外部キー制約**: データの関連性を強制
- **ビュー・マテリアライズドビュー**: 複雑なクエリを簡潔に
- **関数・トリガー**: サーバーサイドロジック
- **全文検索**: 日本語対応の検索機能
- **JSONB**: 半構造化データの格納

### 2. RLS（Row Level Security）

RLS（行レベルセキュリティ）は、PostgreSQLの組み込み機能。データベースレベルでアクセス制御を実現できる。

```
従来のアプローチ:
  クライアント → APIサーバー（ここでアクセス制御） → データベース

Supabase + RLSのアプローチ:
  クライアント → Supabase（データベースがアクセス制御） → データ
```

APIサーバーなしでも安全にデータにアクセスできるため、開発速度が大幅に向上する。

### 3. オープンソースであること

- ソースコードが公開されており、透明性が高い
- コミュニティによるバグ修正・機能追加
- セルフホストが可能（docker-compose一発）
- ベンダーロックインのリスクが極めて低い

---

## Supabaseの構成要素

### Database（PostgreSQL）

Supabaseの中核はPostgreSQLデータベース。各プロジェクトに専用のPostgreSQLインスタンスが割り当てられる。

```
Supabaseプロジェクト
+------------------------------------------+
|  PostgreSQL Database                      |
|  +------+  +------+  +------+           |
|  |users |  |posts |  |orders|  ...      |
|  +------+  +------+  +------+           |
|                                          |
|  Extensions:                             |
|  - pgvector (ベクトル検索)               |
|  - pg_cron (定期実行)                    |
|  - PostGIS (地理情報)                    |
|  - pg_stat_statements (クエリ分析)       |
+------------------------------------------+
```

Supabaseのダッシュボード（Table Editor）から、GUIでテーブルの作成・編集ができる。もちろん、SQL Editorで直接SQLを実行することも可能。

### Auth（認証）

Supabaseの認証システムはGoTrueという独立したサービスで動作する。

対応する認証方式:

| 認証方式         | 説明                                | 適したケース       |
| ---------------- | ----------------------------------- | ------------------ |
| Email + Password | メールとパスワードでの認証          | 一般的なWebアプリ  |
| Magic Link       | メールに送られるリンクでログイン    | パスワードレス認証 |
| OAuth            | Google, GitHub, Twitter等の外部認証 | SNS連携            |
| Phone (SMS)      | 電話番号認証                        | モバイルアプリ     |
| SAML SSO         | 企業向けシングルサインオン          | B2B SaaS           |

### Storage（ファイルストレージ）

S3互換のオブジェクトストレージ。画像、動画、ドキュメントなどのファイルを管理できる。

特徴:

- **バケット**単位でファイルを整理
- **RLSポリシー**でアクセス制御
- **画像変換**（リサイズ、フォーマット変換）が組み込み
- **署名付きURL**で期限付きアクセスを提供

### Realtime（リアルタイム）

PostgreSQLの変更をWebSocket経由でリアルタイムに配信する。

```
データベースの変更 → PostgreSQLのWAL → Realtimeサーバー → WebSocket → クライアント

例: ユーザーAが投稿を作成
  1. INSERT INTO posts ... → PostgreSQLに保存
  2. WAL（Write-Ahead Log）がキャプチャ
  3. Realtimeサーバーが検知
  4. 購読中の全クライアントにWebSocket通知
  5. ユーザーBの画面がリアルタイム更新
```

3つの機能がある:

- **Postgres Changes**: テーブルの変更（INSERT, UPDATE, DELETE）を購読
- **Broadcast**: 任意のメッセージをクライアント間で送受信
- **Presence**: オンライン状態の共有

### Edge Functions（サーバーレス関数）

Deno（TypeScript/JavaScript）で書かれたサーバーレス関数。クライアントから直接実行できないロジック（外部API呼び出し、Webhook処理、決済処理など）を実装する。

```typescript
// supabase/functions/hello/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { name } = await req.json()
  const data = {
    message: `Hello ${name}!`,
  }
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### Vector（AI/ベクトル検索）

pgvectorエクステンションにより、ベクトル（埋め込み）をデータベースに保存し、類似度検索ができる。

用途:

- セマンティック検索（意味に基づく検索）
- レコメンデーション
- RAG（Retrieval Augmented Generation）
- 画像の類似検索

---

## プロジェクト作成と初期設定

### Supabaseアカウントの作成

1. [https://supabase.com](https://supabase.com) にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインアップ
4. 「New Project」をクリック

### プロジェクトの設定

| 設定項目          | 説明                   | 推奨値                         |
| ----------------- | ---------------------- | ------------------------------ |
| Organization      | プロジェクトの組織     | 個人名または会社名             |
| Project name      | プロジェクト名         | my-app-name                    |
| Database Password | データベースパスワード | 強力なパスワード（必ず控える） |
| Region            | サーバーの地域         | Northeast Asia (Tokyo)         |
| Pricing Plan      | 料金プラン             | Free（学習用）                 |

### 接続情報の確認

プロジェクト作成後、Settings > API から以下の情報を確認できる:

- **Project URL**: `https://xxxxxxxxxxxx.supabase.co`
- **anon key**: フロントエンドで使用する公開キー
- **service_role key**: サーバーサイドで使用する秘密キー（絶対に公開しない）

```
重要: キーの使い分け

anon key（公開可能）
  - フロントエンドで使用
  - RLSポリシーが適用される
  - 安全にクライアントに露出できる

service_role key（絶対に非公開）
  - サーバーサイドのみで使用
  - RLSをバイパスする（全データにアクセス可能）
  - 環境変数で管理し、絶対にフロントエンドに含めない
```

---

## テーブル作成

### GUIでの作成（Table Editor）

Supabaseのダッシュボードには、視覚的にテーブルを作成できるTable Editorがある。

1. ダッシュボードの左メニューから「Table Editor」を選択
2. 「New Table」をクリック
3. テーブル名を入力（例: `profiles`）
4. 「Enable Row Level Security」にチェック（推奨）
5. カラムを追加（Name, Type, Default Valueを設定）
6. 「Save」をクリック

### SQLでの作成（SQL Editor）

より複雑なテーブルはSQLで作成する方が効率的。

```sql
-- ユーザープロフィールテーブル
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 記事テーブル
CREATE TABLE posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- コメントテーブル
CREATE TABLE comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- いいねテーブル
CREATE TABLE likes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- 同じ記事に2回いいねできないように
);

-- インデックスの作成
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_likes_post ON likes(post_id);
```

### 補足: UUIDとBIGINT

| 型     | 例                                     | 用途                               |
| ------ | -------------------------------------- | ---------------------------------- |
| UUID   | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` | ユーザーIDなど（auth.usersと連携） |
| BIGINT | `1`, `2`, `3`, ...                     | 自動採番のID（記事、コメントなど） |

Supabaseの認証システム（auth.users）はUUIDを使用するため、ユーザー関連のテーブルではUUIDを使うのが自然。

---

## CRUD操作（supabase-jsクライアント）

### セットアップ

```bash
npm install @supabase/supabase-js
```

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Create（作成）

```typescript
// 記事を作成
const { data, error } = await supabase
  .from('posts')
  .insert({
    author_id: userId,
    title: '初めてのSupabase記事',
    content: 'Supabaseは素晴らしい！',
    published: true,
  })
  .select() // 作成したデータを返す
  .single() // 単一のオブジェクトとして返す

if (error) {
  console.error('記事の作成に失敗:', error.message)
} else {
  console.log('作成された記事:', data)
}
```

### Read（読み取り）

```typescript
// 全記事を取得（公開済みのみ）
const { data: posts, error } = await supabase
  .from('posts')
  .select('*')
  .eq('published', true)
  .order('created_at', { ascending: false })

// 特定の記事を取得（コメント付き）
const { data: post, error } = await supabase
  .from('posts')
  .select(
    `
    *,
    profiles(username, avatar_url),
    comments(
      *,
      profiles(username, avatar_url)
    ),
    likes(count)
  `
  )
  .eq('id', postId)
  .single()

// ページネーション
const pageSize = 10
const page = 1
const { data, error, count } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })
  .eq('published', true)
  .range((page - 1) * pageSize, page * pageSize - 1)
  .order('created_at', { ascending: false })

// テキスト検索
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .textSearch('title', 'Supabase')
  .eq('published', true)
```

### Update（更新）

```typescript
// 記事を更新
const { data, error } = await supabase
  .from('posts')
  .update({
    title: '更新されたタイトル',
    content: '更新された内容',
    updated_at: new Date().toISOString(),
  })
  .eq('id', postId)
  .eq('author_id', userId) // 自分の記事のみ更新可能
  .select()
  .single()
```

### Delete（削除）

```typescript
// 記事を削除
const { error } = await supabase.from('posts').delete().eq('id', postId).eq('author_id', userId) // 自分の記事のみ削除可能

if (error) {
  console.error('削除に失敗:', error.message)
} else {
  console.log('記事が削除されました')
}
```

---

## RLS（Row Level Security）

### なぜRLSが重要か

RLSがなければ、anon keyを持つ誰でもデータベースの全データにアクセスできてしまう。

```
RLSなし:
  悪意のあるユーザー → anon key → 全ユーザーのデータを取得・変更・削除

RLSあり:
  悪意のあるユーザー → anon key → ポリシーで許可されたデータのみアクセス可能
```

RLSは「データベースレベルのファイアウォール」と考えるとわかりやすい。

### RLSの有効化

```sql
-- テーブルごとにRLSを有効化
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### ポリシーの書き方

ポリシーの基本構文:

```sql
CREATE POLICY "ポリシー名"
  ON テーブル名
  FOR 操作 (SELECT | INSERT | UPDATE | DELETE | ALL)
  TO ロール (anon | authenticated)
  USING (条件式)           -- SELECT, UPDATE, DELETEで評価
  WITH CHECK (条件式);      -- INSERT, UPDATEで評価
```

### よくあるRLSパターン

**パターン1: 公開データ（誰でも読み取り可能）**

```sql
-- 公開済み記事は誰でも閲覧可能
CREATE POLICY "公開記事は誰でも閲覧可能"
  ON posts
  FOR SELECT
  TO anon, authenticated
  USING (published = true);
```

**パターン2: 自分のデータのみ操作可能**

```sql
-- 自分の記事のみ作成可能
CREATE POLICY "認証済みユーザーは記事を作成可能"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- 自分の記事のみ更新可能
CREATE POLICY "自分の記事のみ更新可能"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- 自分の記事のみ削除可能
CREATE POLICY "自分の記事のみ削除可能"
  ON posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);
```

**パターン3: 管理者はすべて操作可能**

```sql
-- 管理者判定用の関数
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 管理者は全記事を操作可能
CREATE POLICY "管理者は全記事を操作可能"
  ON posts
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```

**パターン4: プロフィールの公開と編集**

```sql
-- プロフィールは誰でも閲覧可能
CREATE POLICY "プロフィールは公開"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 自分のプロフィールのみ編集可能
CREATE POLICY "自分のプロフィールのみ編集可能"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

---

## 認証の実装

### サインアップ（新規登録）

```typescript
// メール + パスワードで新規登録
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password-123',
  options: {
    data: {
      username: 'testuser',
      display_name: 'テストユーザー',
    },
  },
})

if (error) {
  console.error('登録エラー:', error.message)
} else {
  console.log('確認メールを送信しました')
}
```

### ログイン

```typescript
// メール + パスワードでログイン
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password-123',
})

if (error) {
  console.error('ログインエラー:', error.message)
} else {
  console.log('ログイン成功:', data.user)
  console.log('セッション:', data.session)
}
```

### OAuth（Google, GitHub等）

```typescript
// Googleでログイン
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'http://localhost:3000/auth/callback',
  },
})

// GitHubでログイン
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: 'http://localhost:3000/auth/callback',
  },
})
```

### Magic Link（パスワードレス）

```typescript
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'http://localhost:3000/auth/callback',
  },
})
```

### セッション管理

```typescript
// 現在のセッションを取得
const {
  data: { session },
} = await supabase.auth.getSession()

// 現在のユーザーを取得
const {
  data: { user },
} = await supabase.auth.getUser()

// 認証状態の変化を監視
supabase.auth.onAuthStateChange((event, session) => {
  console.log('認証イベント:', event)
  // event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | ...
})

// ログアウト
const { error } = await supabase.auth.signOut()
```

---

## リアルタイム購読

### テーブル変更の購読

```typescript
// postsテーブルの全変更を購読
const channel = supabase
  .channel('posts-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT | UPDATE | DELETE | *
      schema: 'public',
      table: 'posts',
    },
    (payload) => {
      console.log('変更検知:', payload)
      console.log('イベント:', payload.eventType) // INSERT, UPDATE, DELETE
      console.log('新しいデータ:', payload.new)
      console.log('古いデータ:', payload.old)
    }
  )
  .subscribe()
```

### 特定条件での購読

```typescript
// 特定のユーザーへのコメントのみ購読
const channel = supabase
  .channel('my-comments')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'comments',
      filter: `post_id=eq.${myPostId}`,
    },
    (payload) => {
      console.log('新しいコメント:', payload.new)
      // UIを更新
    }
  )
  .subscribe()
```

### 購読の解除

```typescript
// チャンネルの購読を解除
supabase.removeChannel(channel)

// 全チャンネルの購読を解除
supabase.removeAllChannels()
```

### Broadcastの活用（チャットなど）

```typescript
// メッセージの送信
const channel = supabase.channel('chat-room-1')

channel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    channel.send({
      type: 'broadcast',
      event: 'message',
      payload: {
        user: 'tanaka',
        text: 'こんにちは！',
        timestamp: new Date().toISOString(),
      },
    })
  }
})

// メッセージの受信
channel.on('broadcast', { event: 'message' }, (payload) => {
  console.log('受信:', payload.payload)
})
```

---

## ストレージ

### バケットの作成

ダッシュボードのStorage > New Bucketから作成するか、SQLで作成できる。

```typescript
// バケットの作成（サーバーサイド、service_role keyが必要）
const { data, error } = await supabase.storage.createBucket('avatars', {
  public: false, // 公開/非公開
  fileSizeLimit: 1048576, // 1MB
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
})
```

### ファイルアップロード

```typescript
// ファイルのアップロード
const file = event.target.files[0] // input[type="file"]から
const filePath = `${userId}/${Date.now()}_${file.name}`

const { data, error } = await supabase.storage.from('avatars').upload(filePath, file, {
  cacheControl: '3600',
  upsert: false, // 同名ファイルの上書きを許可するか
})

if (error) {
  console.error('アップロードエラー:', error.message)
} else {
  console.log('アップロード成功:', data.path)
}
```

### 公開URLの取得

```typescript
// 公開バケットのURL
const { data } = supabase.storage.from('avatars').getPublicUrl('user123/avatar.png')

console.log('公開URL:', data.publicUrl)

// 画像変換（リサイズ）付きURL
const { data } = supabase.storage.from('avatars').getPublicUrl('user123/avatar.png', {
  transform: {
    width: 200,
    height: 200,
    resize: 'cover',
  },
})
```

### 署名付きURL（期限付きアクセス）

```typescript
// 非公開バケットのファイルに一時的なアクセスを許可
const { data, error } = await supabase.storage
  .from('private-docs')
  .createSignedUrl('document.pdf', 3600) // 3600秒（1時間）有効

console.log('署名付きURL:', data.signedUrl)
```

---

## Next.js + Supabase（@supabase/ssr）

### セットアップ

```bash
npx create-next-app@latest my-supabase-app --typescript --tailwind --app
cd my-supabase-app
npm install @supabase/supabase-js @supabase/ssr
```

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabaseクライアントの設定

```typescript
// lib/supabase/client.ts（ブラウザ用）
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// lib/supabase/server.ts（サーバー用）
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Componentでの呼び出し時は無視
          }
        },
      },
    }
  )
}
```

### ミドルウェア（セッション管理）

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // セッションのリフレッシュ
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### Server Componentでのデータ取得

```typescript
// app/posts/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function PostsPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles(username, avatar_url)
    `)
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    return <div>エラーが発生しました</div>;
  }

  return (
    <div>
      <h1>記事一覧</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>著者: {post.profiles.username}</p>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
```

---

## 料金体系

### 各プランの比較（2024年時点）

| 項目           | Free         | Pro ($25/月) | Team ($599/月) | Enterprise   |
| -------------- | ------------ | ------------ | -------------- | ------------ |
| プロジェクト数 | 2            | 無制限       | 無制限         | 無制限       |
| DB容量         | 500MB        | 8GB          | 8GB            | カスタム     |
| ストレージ     | 1GB          | 100GB        | 100GB          | カスタム     |
| 帯域幅         | 5GB          | 250GB        | 250GB          | カスタム     |
| Edge Functions | 50万/月      | 200万/月     | 200万/月       | カスタム     |
| 同時接続       | 200          | 500          | 500            | カスタム     |
| サポート       | コミュニティ | メール       | 優先サポート   | 専任サポート |

### 無料枠の制限と注意点

- プロジェクトは2つまで
- 1週間アクティビティがないプロジェクトは一時停止される
- データベース容量は500MBまで
- 学習・開発用途には十分な枠

### 超過料金

Proプランでは基本料金に加え、超過分が従量課金される:

- DB容量: $0.125/GB
- ストレージ: $0.021/GB
- 帯域幅: $0.09/GB

---

## Supabaseのベストプラクティス

### 1. RLSは必ず有効にする

テーブルを作成したら、まずRLSを有効化し、必要なポリシーを設定する。RLSが無効だと、anon keyで全データにアクセスできてしまう。

### 2. service_role keyをフロントエンドに含めない

`service_role key`はRLSをバイパスするため、絶対にフロントエンドのコードに含めてはいけない。サーバーサイドの環境変数としてのみ管理する。

### 3. 型安全を確保する

Supabase CLIで型を自動生成できる:

```bash
npx supabase gen types typescript --project-id your-project-id > database.types.ts
```

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabase = createClient<Database>(url, key)
// これでsupabase.from('posts').select()の返り値に型が付く
```

### 4. マイグレーションを活用する

Supabase CLIでマイグレーションファイルを管理する:

```bash
npx supabase migration new create_posts_table
# supabase/migrations/20240101000000_create_posts_table.sql が生成される
```

### 5. Database Functions（RPC）を活用する

複雑なクエリはPostgreSQL関数として定義し、RPCで呼び出す:

```sql
-- 人気記事ランキングを取得する関数
CREATE OR REPLACE FUNCTION get_popular_posts(limit_count INT DEFAULT 10)
RETURNS TABLE (
  id BIGINT,
  title TEXT,
  like_count BIGINT,
  comment_count BIGINT
) AS $$
  SELECT
    p.id,
    p.title,
    COUNT(DISTINCT l.id) AS like_count,
    COUNT(DISTINCT c.id) AS comment_count
  FROM posts p
  LEFT JOIN likes l ON l.post_id = p.id
  LEFT JOIN comments c ON c.post_id = p.id
  WHERE p.published = true
  GROUP BY p.id, p.title
  ORDER BY like_count DESC
  LIMIT limit_count;
$$ LANGUAGE sql STABLE;
```

```typescript
// TypeScriptから呼び出し
const { data, error } = await supabase.rpc('get_popular_posts', {
  limit_count: 10,
})
```

---

## 採用企業とユースケース

| 企業/サービス | ユースケース                              |
| ------------- | ----------------------------------------- |
| Mozilla       | Hubs（VRプラットフォーム）のバックエンド  |
| Peerlist      | プロフェッショナルSNSのデータベース・認証 |
| Happeo        | 社内コミュニケーションプラットフォーム    |
| Chatbase      | AIチャットボットプラットフォーム          |
| Epsilon3      | 宇宙産業向けオペレーション管理            |

Supabaseは特に以下のユースケースに適している:

- **MVP（最小限の製品）の高速開発**: バックエンドの構築時間を大幅短縮
- **リアルタイムアプリ**: チャット、通知、共同編集
- **SaaS開発**: マルチテナント、認証、権限管理
- **AIアプリケーション**: pgvectorによるベクトル検索
- **モバイルアプリのバックエンド**: REST API + 認証 + ストレージ

---

## まとめ

Supabaseを学ぶ順序の目安:

```
1. プロジェクト作成・テーブル設計
   ↓
2. CRUD操作（supabase-js）
   ↓
3. RLS（セキュリティ）
   ↓
4. 認証（Auth）
   ↓
5. Next.js統合（SSR対応）
   ↓
6. リアルタイム・ストレージ
   ↓
7. Edge Functions・Vector
```

Supabaseの本質は「PostgreSQLを簡単に使うためのツールキット」。PostgreSQLの知識はSupabaseを離れても一生使える。まずは公式ドキュメントとチュートリアルに取り組み、小さなプロジェクトを作ってみることを推奨する。

---

## 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Supabase公式チュートリアル](https://supabase.com/docs/guides/getting-started)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [supabase-js リファレンス](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase + Next.js ガイド](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [RLS（Row Level Security）ガイド](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Auth ガイド](https://supabase.com/docs/guides/auth)
- [Supabase Storage ガイド](https://supabase.com/docs/guides/storage)
- [Supabase Realtime ガイド](https://supabase.com/docs/guides/realtime)
- [Supabase Edge Functions ガイド](https://supabase.com/docs/guides/functions)
- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)
