---
title: 'チェックポイント: データベース設計と運用'
order: 31
section: 'データベース'
---

# チェックポイント: データベース設計と運用

## このチェックポイントの目標

このチェックポイントでは、**ブログプラットフォーム**のデータベースを一から設計・実装する。要件定義からER図の作成、テーブル作成、クエリの最適化、そしてNode.js + PrismaでのCRUD API実装まで、実務で必要な一連のスキルを身につける。

### 完成後にできるようになること

| スキル       | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| DB設計       | 要件からER図を描き、テーブル構造を決定できる                    |
| SQL          | CREATE TABLE, INSERT, 複雑なSELECT（JOIN, サブクエリ）を書ける  |
| インデックス | EXPLAIN ANALYZEで実行計画を読み、適切なインデックスを設計できる |
| ORM          | Prismaを使ってCRUD APIを実装できる                              |
| 最適化       | N+1問題を理解し、効率的なクエリを書ける                         |

---

## 要件: ブログプラットフォーム

以下の機能を持つブログプラットフォームを構築する。

### 機能一覧

**ユーザー管理**:

- ユーザー登録（メールアドレス、パスワード、ユーザー名）
- ログイン
- プロフィール（表示名、自己紹介、アバター画像URL）

**記事管理**:

- 記事のCRUD（作成、一覧、詳細、更新、削除）
- 記事にカテゴリを設定（1記事に1カテゴリ）
- 記事にタグを設定（1記事に複数タグ）
- 記事の公開/下書き切り替え

**コメント機能**:

- 記事へのコメント投稿
- コメントの削除（投稿者のみ）

**いいね機能**:

- 記事への「いいね」
- 同じ記事に2回いいねできない
- いいねの取り消し

**フォロー機能**:

- 他のユーザーをフォロー
- フォロー解除
- フォロー中のユーザーの記事一覧

---

## Step 1: 要件からER図を作成

まず、要件からエンティティ（テーブル）とリレーション（関連）を整理する。

### エンティティの洗い出し

| エンティティ | 説明                  | 主な属性                                 |
| ------------ | --------------------- | ---------------------------------------- |
| users        | ユーザー              | id, email, password_hash, username       |
| profiles     | プロフィール          | user_id, display_name, bio, avatar_url   |
| posts        | 記事                  | id, author_id, title, content, published |
| categories   | カテゴリ              | id, name, slug                           |
| tags         | タグ                  | id, name                                 |
| post_tags    | 記事-タグ中間テーブル | post_id, tag_id                          |
| comments     | コメント              | id, post_id, author_id, content          |
| likes        | いいね                | post_id, user_id                         |
| follows      | フォロー              | follower_id, following_id                |

### リレーションの整理

```
users ──── profiles        (1:1)  1人のユーザーに1つのプロフィール
users ───< posts           (1:N)  1人のユーザーが複数の記事を投稿
categories ───< posts      (1:N)  1つのカテゴリに複数の記事
posts >───< tags           (M:N)  記事とタグは多対多（中間テーブル: post_tags）
users ───< comments        (1:N)  1人のユーザーが複数のコメント
posts ───< comments        (1:N)  1つの記事に複数のコメント
users ───< likes           (1:N)  1人のユーザーが複数のいいね
posts ───< likes           (1:N)  1つの記事に複数のいいね
users ───< follows         (M:N)  フォロー関係（自己参照M:N）
```

### ER図

```
+------------------+     +------------------+
| users            |     | profiles         |
+------------------+     +------------------+
| PK id: UUID      |----<| PK/FK user_id    |
| email: TEXT       |     | display_name     |
| password_hash    |     | bio: TEXT         |
| username: TEXT    |     | avatar_url: TEXT  |
| created_at       |     +------------------+
| updated_at       |
+------------------+
    |           |
    |           +-----------------------------+
    |                                         |
    v                                         v
+------------------+     +------------------+ +------------------+
| posts            |     | comments         | | follows          |
+------------------+     +------------------+ +------------------+
| PK id: BIGINT    |----<| PK id: BIGINT    | | PK/FK follower_id|
| FK author_id     |     | FK post_id       | | PK/FK following_id|
| FK category_id   |     | FK author_id     | | created_at       |
| title: TEXT      |     | content: TEXT    | +------------------+
| content: TEXT    |     | created_at       |
| published: BOOL  |     +------------------+
| created_at       |
| updated_at       |
+------------------+
    |           |
    |           +-----------------------------+
    v                                         v
+------------------+     +------------------+ +------------------+
| post_tags        |     | likes            | | categories       |
+------------------+     +------------------+ +------------------+
| PK/FK post_id    |     | PK/FK post_id    | | PK id: BIGINT    |
| PK/FK tag_id     |     | PK/FK user_id    | | name: TEXT       |
+------------------+     | created_at       | | slug: TEXT       |
    |                     +------------------+ +------------------+
    v
+------------------+
| tags             |
+------------------+
| PK id: BIGINT    |
| name: TEXT       |
+------------------+
```

---

## Step 2: PostgreSQLでテーブル作成

以下のSQLをPostgreSQL（またはSupabaseのSQL Editor）で実行する。

```sql
-- ===========================================
-- ブログプラットフォーム テーブル定義
-- ===========================================

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------
-- 1. usersテーブル（認証情報）
-- -------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- メールアドレスを小文字に統一するための制約
ALTER TABLE users ADD CONSTRAINT users_email_lowercase
  CHECK (email = LOWER(email));

-- ユーザー名の文字数制限
ALTER TABLE users ADD CONSTRAINT users_username_length
  CHECK (LENGTH(username) BETWEEN 3 AND 30);

-- -------------------------------------------
-- 2. profilesテーブル（公開情報）
-- -------------------------------------------
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------
-- 3. categoriesテーブル
-- -------------------------------------------
CREATE TABLE categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------
-- 4. postsテーブル
-- -------------------------------------------
CREATE TABLE posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- タイトルの文字数制限
ALTER TABLE posts ADD CONSTRAINT posts_title_length
  CHECK (LENGTH(title) BETWEEN 1 AND 200);

-- -------------------------------------------
-- 5. tagsテーブル
-- -------------------------------------------
CREATE TABLE tags (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- -------------------------------------------
-- 6. post_tagsテーブル（中間テーブル）
-- -------------------------------------------
CREATE TABLE post_tags (
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- -------------------------------------------
-- 7. commentsテーブル
-- -------------------------------------------
CREATE TABLE comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- コメントの文字数制限
ALTER TABLE comments ADD CONSTRAINT comments_content_length
  CHECK (LENGTH(content) BETWEEN 1 AND 2000);

-- -------------------------------------------
-- 8. likesテーブル
-- -------------------------------------------
CREATE TABLE likes (
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- -------------------------------------------
-- 9. followsテーブル
-- -------------------------------------------
CREATE TABLE follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)  -- 自分自身のフォローを防止
);

-- -------------------------------------------
-- インデックスの作成
-- -------------------------------------------
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_published ON posts(published) WHERE published = true;
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

-- -------------------------------------------
-- updated_atを自動更新するトリガー
-- -------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Step 3: サンプルデータ投入

```sql
-- ===========================================
-- サンプルデータの投入
-- ===========================================

-- ユーザー（パスワードは 'password123' のbcryptハッシュ）
INSERT INTO users (id, email, password_hash, username) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'tanaka@example.com',
   '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012', 'tanaka'),
  ('b1ffcd00-0d1c-5f09-cc7e-7cc0ce491b22', 'sato@example.com',
   '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012', 'sato'),
  ('c2aade11-1e2d-6a10-dd8f-8dd1df502c33', 'suzuki@example.com',
   '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012', 'suzuki');

-- プロフィール
INSERT INTO profiles (user_id, display_name, bio) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '田中太郎', 'Webエンジニア。React/Next.jsが得意です。'),
  ('b1ffcd00-0d1c-5f09-cc7e-7cc0ce491b22', '佐藤花子', 'バックエンドエンジニア。Go言語とPostgreSQLが好き。'),
  ('c2aade11-1e2d-6a10-dd8f-8dd1df502c33', '鈴木次郎', 'フルスタックエンジニア見習い。');

-- カテゴリ
INSERT INTO categories (name, slug) VALUES
  ('プログラミング', 'programming'),
  ('インフラ', 'infrastructure'),
  ('キャリア', 'career'),
  ('書籍レビュー', 'book-review');

-- 記事
INSERT INTO posts (author_id, category_id, title, content, published) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1,
   'Next.js入門 - App Routerの基本',
   'Next.jsのApp Routerについて解説します。Server ComponentsとClient Componentsの違い...',
   true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1,
   'TypeScriptの型パズル入門',
   'TypeScriptの高度な型機能について紹介します。ジェネリクス、条件型、テンプレートリテラル型...',
   true),
  ('b1ffcd00-0d1c-5f09-cc7e-7cc0ce491b22', 2,
   'Docker入門 - コンテナの基本概念',
   'Dockerの基本概念を解説します。イメージ、コンテナ、ボリューム、ネットワーク...',
   true),
  ('b1ffcd00-0d1c-5f09-cc7e-7cc0ce491b22', 1,
   'PostgreSQLのインデックス設計',
   'PostgreSQLのインデックスについて詳しく解説します。B-Tree、GIN、GiST...',
   true),
  ('c2aade11-1e2d-6a10-dd8f-8dd1df502c33', 3,
   'エンジニア1年目の振り返り',
   '未経験からエンジニアになって1年が経ちました。学んだこと、苦労したこと...',
   true),
  ('c2aade11-1e2d-6a10-dd8f-8dd1df502c33', 1,
   '下書き: Rust入門記事',
   'Rustの所有権システムについて...',
   false);  -- 下書き

-- タグ
INSERT INTO tags (name) VALUES
  ('JavaScript'), ('TypeScript'), ('React'), ('Next.js'),
  ('Docker'), ('PostgreSQL'), ('Go'), ('Rust'), ('キャリア');

-- 記事とタグの関連
INSERT INTO post_tags (post_id, tag_id) VALUES
  (1, 3), (1, 4),       -- Next.js記事: React, Next.js
  (2, 1), (2, 2),       -- TypeScript記事: JavaScript, TypeScript
  (3, 5),               -- Docker記事: Docker
  (4, 6),               -- PostgreSQL記事: PostgreSQL
  (5, 9);               -- キャリア記事: キャリア

-- コメント
INSERT INTO comments (post_id, author_id, content) VALUES
  (1, 'b1ffcd00-0d1c-5f09-cc7e-7cc0ce491b22', 'とても分かりやすい記事でした！App Routerの理解が深まりました。'),
  (1, 'c2aade11-1e2d-6a10-dd8f-8dd1df502c33', '初心者の私でも理解できました。ありがとうございます！'),
  (3, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Docker Composeの記事も書いてほしいです！'),
  (4, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'GINインデックスの部分、実務で役立ちました。'),
  (5, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1年目でここまでできるのはすごいですね！');

-- いいね
INSERT INTO likes (post_id, user_id) VALUES
  (1, 'b1ffcd00-0d1c-5f09-cc7e-7cc0ce491b22'),
  (1, 'c2aade11-1e2d-6a10-dd8f-8dd1df502c33'),
  (2, 'b1ffcd00-0d1c-5f09-cc7e-7cc0ce491b22'),
  (3, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (3, 'c2aade11-1e2d-6a10-dd8f-8dd1df502c33'),
  (4, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (5, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (5, 'b1ffcd00-0d1c-5f09-cc7e-7cc0ce491b22');

-- フォロー関係
INSERT INTO follows (follower_id, following_id) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1ffcd00-0d1c-5f09-cc7e-7cc0ce491b22'),  -- 田中 → 佐藤
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2aade11-1e2d-6a10-dd8f-8dd1df502c33'),  -- 田中 → 鈴木
  ('b1ffcd00-0d1c-5f09-cc7e-7cc0ce491b22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),  -- 佐藤 → 田中
  ('c2aade11-1e2d-6a10-dd8f-8dd1df502c33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');  -- 鈴木 → 田中
```

---

## Step 4: 主要クエリの作成

### クエリ1: 記事一覧（著者情報、いいね数、コメント数付き）

```sql
SELECT
  p.id,
  p.title,
  p.created_at,
  pr.display_name AS author_name,
  pr.avatar_url AS author_avatar,
  c.name AS category_name,
  COALESCE(like_counts.count, 0) AS like_count,
  COALESCE(comment_counts.count, 0) AS comment_count
FROM posts p
JOIN profiles pr ON pr.user_id = p.author_id
LEFT JOIN categories c ON c.id = p.category_id
LEFT JOIN (
  SELECT post_id, COUNT(*) AS count
  FROM likes
  GROUP BY post_id
) like_counts ON like_counts.post_id = p.id
LEFT JOIN (
  SELECT post_id, COUNT(*) AS count
  FROM comments
  GROUP BY post_id
) comment_counts ON comment_counts.post_id = p.id
WHERE p.published = true
ORDER BY p.created_at DESC;
```

**実行結果のイメージ**:

| id  | title                        | author_name | category_name  | like_count | comment_count |
| --- | ---------------------------- | ----------- | -------------- | ---------- | ------------- |
| 5   | エンジニア1年目の振り返り    | 鈴木次郎    | キャリア       | 2          | 1             |
| 4   | PostgreSQLのインデックス設計 | 佐藤花子    | プログラミング | 1          | 1             |
| 3   | Docker入門                   | 佐藤花子    | インフラ       | 2          | 1             |
| 2   | TypeScriptの型パズル入門     | 田中太郎    | プログラミング | 1          | 0             |
| 1   | Next.js入門                  | 田中太郎    | プログラミング | 2          | 2             |

### クエリ2: コメント付き記事詳細

```sql
SELECT
  p.id AS post_id,
  p.title,
  p.content,
  p.created_at,
  p.updated_at,
  pr.display_name AS author_name,
  pr.avatar_url AS author_avatar,
  c.name AS category_name,
  -- タグをJSON配列で取得
  COALESCE(
    (SELECT JSON_AGG(t.name)
     FROM post_tags pt
     JOIN tags t ON t.id = pt.tag_id
     WHERE pt.post_id = p.id),
    '[]'
  ) AS tags,
  -- いいね数
  (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count
FROM posts p
JOIN profiles pr ON pr.user_id = p.author_id
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.id = 1 AND p.published = true;
```

コメント一覧は別クエリで取得する（ページネーション対応のため）:

```sql
SELECT
  cm.id,
  cm.content,
  cm.created_at,
  pr.display_name AS author_name,
  pr.avatar_url AS author_avatar
FROM comments cm
JOIN profiles pr ON pr.user_id = cm.author_id
WHERE cm.post_id = 1
ORDER BY cm.created_at ASC;
```

### クエリ3: 人気記事ランキング（いいね数順）

```sql
SELECT
  p.id,
  p.title,
  pr.display_name AS author_name,
  COUNT(l.user_id) AS like_count,
  p.created_at
FROM posts p
JOIN profiles pr ON pr.user_id = p.author_id
LEFT JOIN likes l ON l.post_id = p.id
WHERE p.published = true
GROUP BY p.id, p.title, pr.display_name, p.created_at
ORDER BY like_count DESC, p.created_at DESC
LIMIT 10;
```

### クエリ4: フォロー中のユーザーの記事（タイムライン）

```sql
-- 田中太郎(a0eebc99...)がフォロー中のユーザーの記事を取得
SELECT
  p.id,
  p.title,
  p.content,
  p.created_at,
  pr.display_name AS author_name,
  pr.avatar_url AS author_avatar
FROM posts p
JOIN profiles pr ON pr.user_id = p.author_id
WHERE p.published = true
  AND p.author_id IN (
    SELECT following_id
    FROM follows
    WHERE follower_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  )
ORDER BY p.created_at DESC
LIMIT 20;
```

---

## Step 5: インデックスの設計と効果検証

### EXPLAIN ANALYZEの使い方

EXPLAIN ANALYZEは、クエリの実行計画と実際の実行時間を表示するコマンド。

```sql
EXPLAIN ANALYZE
SELECT * FROM posts
WHERE author_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  AND published = true
ORDER BY created_at DESC;
```

**出力の読み方**:

```
Sort  (cost=... rows=... width=...) (actual time=0.05..0.05 rows=2 loops=1)
  Sort Key: created_at DESC
  ->  Index Scan using idx_posts_author_id on posts  (cost=... rows=... width=...)
        Index Cond: (author_id = 'a0eebc99...'::uuid)
        Filter: published
Planning Time: 0.150 ms
Execution Time: 0.080 ms
```

| 項目            | 意味                                   |
| --------------- | -------------------------------------- |
| Seq Scan        | テーブル全体を走査（インデックスなし） |
| Index Scan      | インデックスを使用した走査             |
| Index Only Scan | インデックスのみで完結（最速）         |
| cost            | 推定コスト（小さいほど良い）           |
| actual time     | 実際の実行時間（ms）                   |
| rows            | 処理した行数                           |

### インデックスの効果を検証する

```sql
-- インデックスなしの場合
DROP INDEX IF EXISTS idx_posts_author_id;

EXPLAIN ANALYZE
SELECT * FROM posts WHERE author_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
-- 結果: Seq Scan（全行走査）

-- インデックスありの場合
CREATE INDEX idx_posts_author_id ON posts(author_id);

EXPLAIN ANALYZE
SELECT * FROM posts WHERE author_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
-- 結果: Index Scan（インデックス使用）
```

### 部分インデックス（Partial Index）の活用

公開済み記事のみを対象にしたインデックス:

```sql
-- 通常のインデックス（全行が対象）
CREATE INDEX idx_posts_published_all ON posts(published);

-- 部分インデックス（published = trueの行のみ）
CREATE INDEX idx_posts_published_true ON posts(created_at DESC) WHERE published = true;

-- 部分インデックスの方がサイズが小さく効率的
-- （下書き記事が多い場合に特に効果的）
```

### タイムラインクエリの最適化

```sql
-- フォロー中ユーザーの記事取得を最適化するための複合インデックス
CREATE INDEX idx_posts_author_published_created
  ON posts(author_id, created_at DESC)
  WHERE published = true;

-- followsテーブルの検索を高速化
CREATE INDEX idx_follows_follower ON follows(follower_id);

-- 最適化後の実行計画を確認
EXPLAIN ANALYZE
SELECT p.id, p.title, p.created_at
FROM posts p
WHERE p.published = true
  AND p.author_id IN (
    SELECT following_id FROM follows
    WHERE follower_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  )
ORDER BY p.created_at DESC
LIMIT 20;
```

---

## Step 6: Node.js + PrismaでCRUD API実装

### プロジェクトのセットアップ

```bash
mkdir blog-platform
cd blog-platform
npm init -y
npm install express @prisma/client bcryptjs jsonwebtoken zod cors dotenv
npm install -D typescript ts-node @types/express @types/bcryptjs @types/jsonwebtoken @types/cors prisma nodemon
npx tsc --init
npx prisma init
```

### Prismaスキーマの定義

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String    @map("password_hash")
  username     String    @unique
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  profile   Profile?
  posts     Post[]
  comments  Comment[]
  likes     Like[]
  followers Follow[]  @relation("following")
  following Follow[]  @relation("follower")

  @@map("users")
}

model Profile {
  userId      String  @id @map("user_id")
  displayName String? @map("display_name")
  bio         String?
  avatarUrl   String? @map("avatar_url")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  slug      String   @unique
  createdAt DateTime @default(now()) @map("created_at")

  posts Post[]

  @@map("categories")
}

model Post {
  id         Int      @id @default(autoincrement())
  authorId   String   @map("author_id")
  categoryId Int?     @map("category_id")
  title      String
  content    String
  published  Boolean  @default(false)
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  author   User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  tags     PostTag[]
  comments Comment[]
  likes    Like[]

  @@index([authorId])
  @@index([categoryId])
  @@map("posts")
}

model Tag {
  id   Int    @id @default(autoincrement())
  name String @unique

  posts PostTag[]

  @@map("tags")
}

model PostTag {
  postId Int @map("post_id")
  tagId  Int @map("tag_id")

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@map("post_tags")
}

model Comment {
  id        Int      @id @default(autoincrement())
  postId    Int      @map("post_id")
  authorId  String   @map("author_id")
  content   String
  createdAt DateTime @default(now()) @map("created_at")

  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@map("comments")
}

model Like {
  postId    Int      @map("post_id")
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([postId, userId])
  @@map("likes")
}

model Follow {
  followerId  String   @map("follower_id")
  followingId String   @map("following_id")
  createdAt   DateTime @default(now()) @map("created_at")

  follower  User @relation("follower", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("following", fields: [followingId], references: [id], onDelete: Cascade)

  @@id([followerId, followingId])
  @@map("follows")
}
```

### CRUD APIの実装

```typescript
// src/routes/posts.ts
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// バリデーションスキーマ
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  categoryId: z.number().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
})

// 記事一覧（公開済みのみ）
router.get('/', async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          include: { profile: true },
        },
        category: true,
        tags: { include: { tag: true } },
        _count: {
          select: { likes: true, comments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where: { published: true } }),
  ])

  res.json({
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content.substring(0, 200) + '...',
      author: {
        username: post.author.username,
        displayName: post.author.profile?.displayName,
        avatarUrl: post.author.profile?.avatarUrl,
      },
      category: post.category?.name,
      tags: post.tags.map((pt) => pt.tag.name),
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      createdAt: post.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
})

// 記事作成（認証必須）
router.post('/', authMiddleware, async (req, res) => {
  const result = createPostSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues })
  }

  const { title, content, categoryId, tags, published } = result.data
  const userId = req.user.id

  const post = await prisma.post.create({
    data: {
      title,
      content,
      published: published ?? false,
      authorId: userId,
      categoryId,
      tags: tags
        ? {
            create: await Promise.all(
              tags.map(async (tagName) => {
                const tag = await prisma.tag.upsert({
                  where: { name: tagName },
                  update: {},
                  create: { name: tagName },
                })
                return { tagId: tag.id }
              })
            ),
          }
        : undefined,
    },
    include: {
      tags: { include: { tag: true } },
      category: true,
    },
  })

  res.status(201).json(post)
})

// 記事詳細
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const post = await prisma.post.findFirst({
    where: { id, published: true },
    include: {
      author: { include: { profile: true } },
      category: true,
      tags: { include: { tag: true } },
      comments: {
        include: {
          author: { include: { profile: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      _count: { select: { likes: true } },
    },
  })

  if (!post) {
    return res.status(404).json({ error: '記事が見つかりません' })
  }

  res.json(post)
})

// 記事更新（認証必須、自分の記事のみ）
router.put('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id)
  const userId = req.user.id

  const existing = await prisma.post.findFirst({
    where: { id, authorId: userId },
  })

  if (!existing) {
    return res.status(404).json({ error: '記事が見つからないか、権限がありません' })
  }

  const post = await prisma.post.update({
    where: { id },
    data: req.body,
  })

  res.json(post)
})

// 記事削除（認証必須、自分の記事のみ）
router.delete('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id)
  const userId = req.user.id

  const existing = await prisma.post.findFirst({
    where: { id, authorId: userId },
  })

  if (!existing) {
    return res.status(404).json({ error: '記事が見つからないか、権限がありません' })
  }

  await prisma.post.delete({ where: { id } })
  res.status(204).send()
})

export default router
```

---

## 完了チェックリスト

以下の項目をすべて達成できたか確認しよう。

### 設計

- [ ] 要件からエンティティを洗い出せた
- [ ] エンティティ間のリレーション（1:1, 1:N, M:N）を正しく定義できた
- [ ] ER図を作成できた
- [ ] 正規化（少なくとも第3正規形）を適用した

### SQL

- [ ] CREATE TABLEで全テーブルを作成できた
- [ ] 適切な制約（NOT NULL, UNIQUE, CHECK, FOREIGN KEY）を設定した
- [ ] サンプルデータを投入できた
- [ ] 記事一覧クエリ（JOIN, 集計関数）を書けた
- [ ] 人気記事ランキングクエリを書けた
- [ ] タイムラインクエリ（サブクエリ）を書けた

### パフォーマンス

- [ ] EXPLAIN ANALYZEの出力を読めた
- [ ] 適切なインデックスを設計できた
- [ ] 部分インデックスの効果を理解した
- [ ] Seq ScanとIndex Scanの違いを説明できる

### API実装

- [ ] Prismaスキーマを定義できた
- [ ] マイグレーションを実行できた
- [ ] CRUD APIを実装できた
- [ ] zodでバリデーションを実装した
- [ ] 認証ミドルウェアで権限制御した

---

## 発展課題

基本のチェックポイントが完了したら、以下の課題に挑戦してみよう。

### 1. 全文検索の実装

PostgreSQLの全文検索機能を使って、記事のタイトルと本文を横断検索する。

```sql
-- 全文検索用のカラムを追加
ALTER TABLE posts ADD COLUMN search_vector TSVECTOR;

-- インデックスの作成
CREATE INDEX idx_posts_search ON posts USING GIN(search_vector);

-- トリガーで自動更新
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    TO_TSVECTOR('simple', COALESCE(NEW.title, '')) ||
    TO_TSVECTOR('simple', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_search_vector
  BEFORE INSERT OR UPDATE OF title, content ON posts
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- 検索クエリ
SELECT id, title,
  TS_RANK(search_vector, TO_TSQUERY('simple', 'PostgreSQL')) AS rank
FROM posts
WHERE search_vector @@ TO_TSQUERY('simple', 'PostgreSQL')
  AND published = true
ORDER BY rank DESC;
```

### 2. レコメンド機能

「この記事を読んだ人はこんな記事も読んでいます」を実装する。同じタグを持つ記事を推薦する方式。

```sql
-- 指定記事と同じタグを持つ他の記事を、共通タグ数でスコアリング
SELECT
  p.id,
  p.title,
  COUNT(*) AS shared_tag_count
FROM posts p
JOIN post_tags pt ON pt.post_id = p.id
WHERE pt.tag_id IN (
  SELECT tag_id FROM post_tags WHERE post_id = 1  -- 対象記事のID
)
  AND p.id != 1
  AND p.published = true
GROUP BY p.id, p.title
ORDER BY shared_tag_count DESC
LIMIT 5;
```

### 3. 通知機能

いいね、コメント、フォローの通知テーブルを設計・実装する。

```sql
CREATE TABLE notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow')),
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);
```

---

## 参考リンク

- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)
- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [Prisma - リレーションの定義](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)
- [Zod公式ドキュメント](https://zod.dev/)
- [Express.js公式ドキュメント](https://expressjs.com/)
- [PostgreSQL EXPLAIN ANALYZEガイド](https://www.postgresql.org/docs/current/using-explain.html)
- [SQLアンチパターン（書籍）](https://www.oreilly.co.jp/books/9784873115894/)
