---
title: 'データベース設計'
order: 30
section: 'データベース'
---

# データベース設計

## データベース設計とは何か

データベース設計とは、アプリケーションで扱うデータの**構造**、**関連性**、**制約**を定義する作業のこと。

建築に例えると、データベース設計は**建物の設計図**にあたる。設計図なしに建物を建て始めると、後から「壁の位置を変えたい」「階段の幅が足りない」といった問題が発生する。データベースも同じで、設計なしにテーブルを作り始めると、後から修正するのが非常に困難になる。

```
良い設計:
  要件定義 → 概念設計 → 論理設計 → 物理設計 → 実装
  (しっかり考えてから作る)

悪い設計:
  とりあえずテーブル作る → カラム追加 → また追加 → カオス
  (後から修正が困難)
```

---

## なぜ設計が重要か

### 1. 後からの変更コスト

データベースの変更コストは、開発の進行とともに指数関数的に増大する。

```
設計段階での変更コスト:     |=|          小
開発初期での変更コスト:     |====|       中
本番運用中の変更コスト:     |================| 極大
```

本番環境でテーブル構造を変更するには:

- マイグレーションスクリプトの作成
- データの移行
- アプリケーションコードの修正
- テストの修正
- ダウンタイムの考慮

設計段階なら、テキストファイルを書き換えるだけ。

### 2. パフォーマンス

適切に設計されたデータベースは、数百万件のデータでも高速に応答する。逆に、設計が悪いとデータが増えるたびに遅くなる。

| 設計の良さ | 100万件の検索時間 | 原因                       |
| ---------- | ----------------- | -------------------------- |
| 良い設計   | 10ms              | 適切なインデックスと正規化 |
| 悪い設計   | 5,000ms           | フルスキャン、不適切な結合 |

### 3. 保守性

- テーブルの命名が統一されているか
- リレーションが適切に定義されているか
- データの整合性が保たれているか

これらが設計時に決まっていないと、半年後に自分のコードを読んで「何のテーブルだ？」となる。

---

## 設計プロセス

データベース設計は4つの段階を踏む。

```
1. 要件定義     何のデータが必要か？
      ↓
2. 概念設計     ER図でエンティティと関連を整理
      ↓
3. 論理設計     正規化してテーブル構造を決定
      ↓
4. 物理設計     インデックス、パーティション、データ型を決定
```

### 1. 要件定義（ビジネス要件からデータ要件へ）

ビジネス要件をデータの観点で整理する作業。

**例: ECサイトの要件**

ビジネス要件:

- ユーザーが商品を閲覧できる
- ユーザーが商品をカートに入れて注文できる
- 管理者が商品の在庫を管理できる
- ユーザーが注文履歴を確認できる

データ要件に変換:

- ユーザー情報（名前、メール、住所、パスワード）
- 商品情報（名前、説明、価格、画像、カテゴリ、在庫数）
- 注文情報（注文者、注文日、合計金額、ステータス）
- 注文明細（どの注文にどの商品がいくつ含まれるか）
- カテゴリ情報（名前、階層構造）

### 2. 概念設計（ER図）

エンティティ（データの実体）とその関連をER図で表現する。詳しくは次のセクションで解説する。

### 3. 論理設計（正規化）

ER図をもとに、データの重複を排除し、整合性を保つようにテーブル構造を決める。正規化の詳細は後述する。

### 4. 物理設計（インデックス、パーティション）

実際のデータベース製品（PostgreSQL、MySQL等）に合わせて、パフォーマンスを考慮した設計を行う。

- インデックスの配置
- パーティショニング
- データ型の選択
- ストレージエンジンの選択

---

## ER図の読み方・書き方

### ER図とは

ER図（Entity-Relationship Diagram）は、データベースの構造を視覚的に表現する図。設計段階で最も重要なツールの一つ。

### 構成要素

| 要素               | 意味                               | ER図での表現       |
| ------------------ | ---------------------------------- | ------------------ |
| エンティティ       | データの実体（テーブルになる）     | 四角形             |
| 属性               | エンティティの特性（カラムになる） | 四角形の中にリスト |
| リレーションシップ | エンティティ間の関連               | 線（実線/破線）    |
| カーディナリティ   | 関連の数量関係                     | 線の端の記号       |

### カーディナリティ（数量関係）

カーディナリティは、2つのエンティティ間の関係が「何対何」であるかを示す。

```
1:1（一対一）
  ユーザー ──── プロフィール
  1人のユーザーは1つのプロフィールを持つ

1:N（一対多）
  ユーザー ───< 記事
  1人のユーザーは複数の記事を持つ

M:N（多対多）
  記事 >───< タグ
  1つの記事に複数のタグ、1つのタグに複数の記事
```

**1:1の実装例**:

```sql
-- ユーザーとプロフィールが1:1
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id), -- usersのidをそのまま主キーに
  display_name TEXT,
  bio TEXT
);
```

**1:Nの実装例**:

```sql
-- ユーザーと記事が1:N
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  author_id UUID REFERENCES users(id) NOT NULL, -- 外部キー
  title TEXT NOT NULL,
  content TEXT NOT NULL
);
```

**M:Nの実装例**:

```sql
-- 記事とタグがM:N → 中間テーブルが必要
CREATE TABLE posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL
);

CREATE TABLE tags (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- 中間テーブル
CREATE TABLE post_tags (
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id) -- 複合主キー
);
```

### draw.ioでの描き方の手順

draw.io（diagrams.net）は無料で使えるER図作成ツール。

1. [https://app.diagrams.net/](https://app.diagrams.net/) にアクセス
2. 左パネルの検索で「Entity Relation」を検索
3. エンティティを配置（四角形のブロック）
4. 各エンティティに属性（カラム名と型）を記入
5. エンティティ間に線を引く
6. カーディナリティの記号を設定
7. エクスポート（PNG, SVG, PDFなど）

### 実例: ECサイトのER図

```
+-------------------+     +--------------------+     +------------------+
| users             |     | orders             |     | order_items      |
+-------------------+     +--------------------+     +------------------+
| PK id: UUID       |---->| PK id: BIGINT      |---->| PK id: BIGINT    |
| email: TEXT        |     | FK user_id: UUID   |     | FK order_id      |
| password_hash: TEXT|     | status: TEXT        |     | FK product_id    |
| name: TEXT         |     | total_amount: INT   |     | quantity: INT    |
| created_at: TIMESTAMPTZ| | shipping_address   |     | unit_price: INT  |
+-------------------+     | created_at         |     +------------------+
                          +--------------------+            |
                                                            |
+-------------------+     +--------------------+            |
| categories        |     | products           |<-----------+
+-------------------+     +--------------------+
| PK id: BIGINT     |---->| PK id: BIGINT      |
| name: TEXT         |     | FK category_id     |
| parent_id: BIGINT |     | name: TEXT          |
| (自己参照)         |     | description: TEXT   |
+-------------------+     | price: INT          |
                          | stock: INT          |
                          | image_url: TEXT     |
                          +--------------------+
```

リレーションの読み方:

- users → orders: 1人のユーザーが複数の注文を持つ（1:N）
- orders → order_items: 1つの注文に複数の商品が含まれる（1:N）
- products → order_items: 1つの商品が複数の注文明細に現れる（1:N）
- categories → products: 1つのカテゴリに複数の商品が属する（1:N）
- categories → categories: カテゴリは親カテゴリを持てる（自己参照1:N）

---

## 正規化の段階

正規化とは、データの**重複を排除**し、**整合性を保つ**ためにテーブル構造を整理する作業。段階的に進める。

### 正規化前の状態（非正規形）

以下のような「注文管理表」があるとする:

| 注文ID | 顧客名   | 顧客メール         | 商品1  | 単価1 | 個数1 | 商品2  | 単価2 | 個数2 |
| ------ | -------- | ------------------ | ------ | ----- | ----- | ------ | ----- | ----- |
| 1      | 田中太郎 | taro@example.com   | りんご | 100   | 3     | みかん | 80    | 5     |
| 2      | 佐藤花子 | hanako@example.com | りんご | 100   | 1     |        |       |       |

問題点:

- 商品が3つ以上あるとカラムを追加する必要がある
- 顧客情報が重複している
- 商品の単価が変わると全行を更新する必要がある

### 第1正規形（1NF）: 繰り返しグループの排除

**ルール**: 各セルには1つの値のみ。繰り返しグループ（商品1, 商品2...）を排除する。

**変換後**:

| 注文ID | 顧客名   | 顧客メール         | 商品名 | 単価 | 個数 |
| ------ | -------- | ------------------ | ------ | ---- | ---- |
| 1      | 田中太郎 | taro@example.com   | りんご | 100  | 3    |
| 1      | 田中太郎 | taro@example.com   | みかん | 80   | 5    |
| 2      | 佐藤花子 | hanako@example.com | りんご | 100  | 1    |

繰り返しグループがなくなったが、まだ問題がある:

- 顧客情報が重複している（田中太郎が2行）
- 主キーが{注文ID, 商品名}の複合キーになる

### 第2正規形（2NF）: 部分関数従属の排除

**ルール**: 複合主キーの一部にのみ依存する属性を別テーブルに分離する。

「顧客名」「顧客メール」は「注文ID」のみに依存し、「商品名」には依存しない。これを**部分関数従属**という。

**変換後**:

**ordersテーブル**:

| 注文ID (PK) | 顧客名   | 顧客メール         |
| ----------- | -------- | ------------------ |
| 1           | 田中太郎 | taro@example.com   |
| 2           | 佐藤花子 | hanako@example.com |

**order_itemsテーブル**:

| 注文ID (FK) | 商品名 | 単価 | 個数 |
| ----------- | ------ | ---- | ---- |
| 1           | りんご | 100  | 3    |
| 1           | みかん | 80   | 5    |
| 2           | りんご | 100  | 1    |

顧客情報の重複は解消された。だが、まだ問題がある:

- 「りんご」の単価100が2行に存在する
- 「単価」は「商品名」に依存している（注文IDではない）

### 第3正規形（3NF）: 推移関数従属の排除

**ルール**: 非キー属性が他の非キー属性に依存する関係（推移関数従属）を排除する。

order_itemsで「単価」は「商品名」に依存している。これを別テーブルに分離する。

**変換後**:

**ordersテーブル**:

| 注文ID (PK) | 顧客名   | 顧客メール         |
| ----------- | -------- | ------------------ |
| 1           | 田中太郎 | taro@example.com   |
| 2           | 佐藤花子 | hanako@example.com |

**productsテーブル**:

| 商品ID (PK) | 商品名 | 単価 |
| ----------- | ------ | ---- |
| 1           | りんご | 100  |
| 2           | みかん | 80   |

**order_itemsテーブル**:

| 注文ID (FK) | 商品ID (FK) | 個数 |
| ----------- | ----------- | ---- |
| 1           | 1           | 3    |
| 1           | 2           | 5    |
| 2           | 1           | 1    |

これで第3正規形の完成。データの重複が完全に排除された。

### BCNF（ボイスコッド正規形）

第3正規形をさらに厳密にしたもの。実務では第3正規形まで行えば十分なケースが多い。

BCNFの追加ルール: すべての関数従属の決定項が候補キーである。

```
3NF → BCNFの違い:

3NF:  非キー属性が非キー属性に依存しない
BCNF: すべての決定項がスーパーキーである（より厳密）
```

BCNFが必要になるのは、複合キーを持つテーブルで、キーの一部が非キー属性から決まるような特殊なケース。

### 正規化の段階まとめ

| 正規形 | 排除する問題           | 簡単な判定基準                                 |
| ------ | ---------------------- | ---------------------------------------------- |
| 1NF    | 繰り返しグループ       | 各セルに1つの値のみか？                        |
| 2NF    | 部分関数従属           | 複合キーの一部だけに依存する属性はないか？     |
| 3NF    | 推移関数従属           | 非キー属性が他の非キー属性に依存していないか？ |
| BCNF   | すべての決定項がキーか | 通常は3NFで十分                                |

---

## 非正規化

### いつ非正規化するか

正規化は「正しさ」を追求するが、パフォーマンスとのトレードオフが存在する。

```
正規化のメリット:     データの整合性が高い、更新が簡単
正規化のデメリット:   JOINが多くなり、読み取りが遅くなる可能性

非正規化のメリット:   読み取りが高速（JOINを減らせる）
非正規化のデメリット: データの整合性維持が難しい、更新が複雑
```

**非正規化を検討すべきケース**:

- 読み取りが書き込みの100倍以上多い場合
- JOINの結果を毎回計算するコストが高い場合
- レスポンスタイムの要件が厳しい場合（例: 100ms以内）

**非正規化してはいけないケース**:

- 設計段階（まず正規化から始める）
- ボトルネックがDB以外にある場合
- インデックスで解決できる場合

### 安全な非正規化パターン

**パターン1: サマリーテーブル**

```sql
-- いいね数を毎回COUNTするのではなく、サマリーとして持つ
ALTER TABLE posts ADD COLUMN like_count INT DEFAULT 0;

-- いいねが追加されたらトリガーでカウントを更新
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_like_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_like_count();
```

**パターン2: マテリアライズドビュー**

```sql
-- 人気記事ランキングをマテリアライズドビューで事前計算
CREATE MATERIALIZED VIEW popular_posts AS
SELECT
  p.id,
  p.title,
  p.author_id,
  COUNT(DISTINCT l.id) AS like_count,
  COUNT(DISTINCT c.id) AS comment_count,
  COUNT(DISTINCT l.id) + COUNT(DISTINCT c.id) * 2 AS score
FROM posts p
LEFT JOIN likes l ON l.post_id = p.id
LEFT JOIN comments c ON c.post_id = p.id
WHERE p.published = true
GROUP BY p.id, p.title, p.author_id
ORDER BY score DESC;

-- インデックスを追加
CREATE UNIQUE INDEX idx_popular_posts_id ON popular_posts(id);

-- 定期的にリフレッシュ（pg_cronなどで）
REFRESH MATERIALIZED VIEW CONCURRENTLY popular_posts;
```

**パターン3: キャッシュカラム**

```sql
-- ユーザーの最新の投稿タイトルをキャッシュ
ALTER TABLE profiles ADD COLUMN latest_post_title TEXT;

-- 投稿時にキャッシュを更新
-- アプリケーション側で更新するか、トリガーで更新する
```

---

## 設計パターン集

### ユーザー管理パターン

```sql
-- 認証テーブル（パスワードハッシュなど秘匿情報）
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- プロフィールテーブル（公開情報）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT
);

-- ロール管理テーブル
CREATE TABLE roles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT UNIQUE NOT NULL  -- 'admin', 'editor', 'viewer'
);

-- ユーザーとロールの中間テーブル（M:N）
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);
```

**設計のポイント**:

- 認証情報と公開情報を分離する（profilesはAPIで公開可能）
- ロールはM:Nで柔軟に（1人が複数ロールを持てる）
- パスワードは必ずハッシュ化して保存

### ECサイトパターン

```sql
-- カテゴリ（自己参照で階層構造）
CREATE TABLE categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id BIGINT REFERENCES categories(id),
  sort_order INT DEFAULT 0
);

-- 商品
CREATE TABLE products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id BIGINT REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price INT NOT NULL CHECK (price >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 注文
CREATE TABLE orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  total_amount INT NOT NULL CHECK (total_amount >= 0),
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 注文明細
CREATE TABLE order_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id BIGINT REFERENCES products(id) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price INT NOT NULL CHECK (unit_price >= 0)
  -- unit_priceは注文時点の価格を記録（商品の価格変更に影響されない）
);
```

**設計のポイント**:

- 注文明細にunit_priceを持たせる（商品の価格が後で変更されても注文金額は変わらない）
- statusにCHECK制約を設定（不正な値を防ぐ）
- 在庫数にCHECK制約（マイナス在庫を防ぐ）

### SNSパターン

```sql
-- 投稿
CREATE TABLE posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- フォロー関係
CREATE TABLE follows (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)  -- 自分自身をフォローできない
);

-- いいね
CREATE TABLE likes (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- コメント
CREATE TABLE comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE, -- 返信対応
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**設計のポイント**:

- フォロー関係はfollower_id/following_idの複合主キー
- 自分をフォローできないようにCHECK制約
- コメントの返信はparent_comment_idで自己参照

### マルチテナントパターン

マルチテナントとは、1つのシステムを複数の組織（テナント）が共有する構成のこと。SaaSでよく使われる。

| 方式         | 説明                     | メリット           | デメリット             |
| ------------ | ------------------------ | ------------------ | ---------------------- |
| DB分離       | テナントごとに別DB       | 完全なデータ分離   | コスト高、管理が大変   |
| スキーマ分離 | テナントごとに別スキーマ | 良好なデータ分離   | マイグレーションが複雑 |
| 行レベル分離 | 全テナントが同じテーブル | シンプル、低コスト | RLSの設定が重要        |

**行レベル分離の実装例（最もよく使われる）**:

```sql
-- 全テーブルにtenant_idを追加
CREATE TABLE projects (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSで自動的にテナント分離
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "テナント分離"
  ON projects
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

---

## アンチパターン

データベース設計でよくある「やってはいけないパターン」を解説する。

### 1. EAV（Entity-Attribute-Value）パターン

```sql
-- アンチパターン: 何でも入る魔法のテーブル
CREATE TABLE attributes (
  entity_id BIGINT,
  attribute_name TEXT,
  attribute_value TEXT
);

-- データ例:
-- | entity_id | attribute_name | attribute_value |
-- | 1         | color          | red             |
-- | 1         | size           | large           |
-- | 1         | weight         | 500             |
```

**問題点**:

- 型安全性がない（weightが数値なのにTEXT型）
- 外部キー制約が使えない
- クエリが複雑になる（属性ごとにJOINが必要）
- インデックスが効きにくい

**解決策**: JSONBカラムを使うか、適切にテーブルを分割する。

```sql
-- 解決策1: JSONBカラム
CREATE TABLE products (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  attributes JSONB DEFAULT '{}'
  -- {"color": "red", "size": "large", "weight": 500}
);

-- 解決策2: テーブル分割
CREATE TABLE products (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  size TEXT,
  weight INT
);
```

### 2. ポリモーフィック関連

```sql
-- アンチパターン: 1つの外部キーで複数テーブルを参照
CREATE TABLE comments (
  id BIGINT PRIMARY KEY,
  commentable_type TEXT,  -- 'post' or 'photo'
  commentable_id BIGINT,  -- postsまたはphotosのid
  content TEXT
);
```

**問題点**:

- 外部キー制約が使えない（どのテーブルを参照するかDBが判断できない）
- データの整合性を保証できない

**解決策**: テーブルごとに外部キーを持つか、中間テーブルを使う。

```sql
-- 解決策: テーブルごとに外部キーを明示
CREATE TABLE post_comments (
  id BIGINT PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL
);

CREATE TABLE photo_comments (
  id BIGINT PRIMARY KEY,
  photo_id BIGINT REFERENCES photos(id) ON DELETE CASCADE,
  content TEXT NOT NULL
);
```

### 3. カンマ区切りでの多値格納

```sql
-- アンチパターン: カンマ区切りでタグを格納
CREATE TABLE posts (
  id BIGINT PRIMARY KEY,
  title TEXT,
  tags TEXT  -- 'javascript,react,nextjs'
);
```

**問題点**:

- 特定のタグで検索するのが困難（LIKE '%react%'はパフォーマンスが悪い）
- タグの一意性を保証できない
- タグの総数を数えられない

**解決策**: 中間テーブルを使う（M:N関係）。

```sql
CREATE TABLE tags (
  id BIGINT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE post_tags (
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

### 4. 外部キー未設定

```sql
-- アンチパターン: 外部キーを設定しない
CREATE TABLE comments (
  id BIGINT PRIMARY KEY,
  post_id BIGINT,  -- 外部キー制約なし
  content TEXT
);
-- post_id = 999999 を入れても、該当する記事がなくてもエラーにならない
```

**問題点**:

- 存在しない記事へのコメントが作成できてしまう
- 記事を削除してもコメントが残る（孤立データ）

**解決策**: 必ず外部キー制約を設定する。

```sql
CREATE TABLE comments (
  id BIGINT PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  content TEXT
);
```

### 5. 適切でないデータ型選択

| ケース | 悪い例            | 良い例              | 理由                             |
| ------ | ----------------- | ------------------- | -------------------------------- |
| 日時   | TEXT '2024-01-01' | TIMESTAMPTZ         | 日時計算、タイムゾーン対応       |
| 金額   | FLOAT 100.50      | INT 10050（円単位） | 浮動小数点の丸め誤差             |
| 真偽値 | INT 0/1           | BOOLEAN             | 意味が明確、型安全               |
| UUID   | TEXT              | UUID型              | バリデーション、インデックス効率 |
| IP     | TEXT              | INET                | ネットワーク演算が可能           |

---

## マイグレーション戦略

マイグレーションとは、データベースのスキーマ（構造）を安全に変更するための仕組み。

### なぜマイグレーションが必要か

```
手動でALTER TABLE → 誰が何を変更したか追跡できない
                   → チーム開発で競合が起きる
                   → 本番環境で同じ変更を再現できない

マイグレーションツール → 変更履歴がコードとして管理される
                      → git管理でチーム共有
                      → 環境ごとに同じ変更を適用
```

### Prisma（TypeScript向け）

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
}
```

```bash
# マイグレーション生成・適用
npx prisma migrate dev --name add_posts_table

# 本番環境への適用
npx prisma migrate deploy
```

### Drizzle ORM（TypeScript向け、軽量）

```typescript
// schema.ts
import { pgTable, uuid, text, boolean, timestamp, integer, serial } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  published: boolean('published').default(false),
  authorId: uuid('author_id')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})
```

```bash
# マイグレーション生成
npx drizzle-kit generate

# マイグレーション適用
npx drizzle-kit migrate
```

---

## インデックス設計

### インデックスとは

インデックスは、本の「索引」のようなもの。全ページを読まなくても目的のページを素早く見つけられる。

```
インデックスなし（フルスキャン）:
  100万行を1行ずつ確認 → 遅い

インデックスあり:
  B-Treeで対象行を直接特定 → 高速
```

### どのカラムにインデックスを張るか

| 張るべき                  | 張らないべき                              |
| ------------------------- | ----------------------------------------- |
| WHERE句で頻繁に使うカラム | カーディナリティが低いカラム（boolean等） |
| JOIN条件のカラム          | めったに検索しないカラム                  |
| ORDER BY句のカラム        | 頻繁にUPDATEされるカラム                  |
| 外部キー                  | 小さいテーブル（数百行以下）              |

### 複合インデックスの順序

複合インデックスのカラム順序は非常に重要。

```sql
-- インデックスの作成
CREATE INDEX idx_posts_author_published ON posts(author_id, published);

-- このインデックスが使えるクエリ:
SELECT * FROM posts WHERE author_id = 'xxx';                    -- 使える
SELECT * FROM posts WHERE author_id = 'xxx' AND published = true; -- 使える
SELECT * FROM posts WHERE published = true;                      -- 使えない！

-- 理由: 複合インデックスは左端のカラムから順に使われる（左端プレフィックスルール）
```

**覚え方**: 電話帳は「姓→名」の順で並んでいる。姓で検索できるが、名だけでは検索できない。

---

## パフォーマンスを考えた設計

### N+1問題

```
N+1問題:
  1回目: SELECT * FROM posts LIMIT 10;     -- 10件の記事を取得
  2回目: SELECT * FROM users WHERE id = 1;  -- 1件目の著者
  3回目: SELECT * FROM users WHERE id = 2;  -- 2件目の著者
  ...
  11回目: SELECT * FROM users WHERE id = 10; -- 10件目の著者

合計: 1 + 10 = 11回のクエリ（N+1回）
```

**解決策**:

```sql
-- JOINで1回のクエリにまとめる
SELECT p.*, u.name AS author_name
FROM posts p
JOIN users u ON u.id = p.author_id
LIMIT 10;

-- または IN句で2回に抑える
SELECT * FROM posts LIMIT 10;
SELECT * FROM users WHERE id IN (1, 2, 3, ...);  -- 取得したauthor_idのリスト
```

### JOINの最適化

```sql
-- 大きなテーブル同士のJOIN → インデックスが重要
-- JOIN条件のカラムには必ずインデックスを張る

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);

-- EXPLAIN ANALYZEで実行計画を確認
EXPLAIN ANALYZE
SELECT p.title, COUNT(c.id) AS comment_count
FROM posts p
LEFT JOIN comments c ON c.post_id = p.id
GROUP BY p.id, p.title;
```

### デッドロック回避

デッドロックとは、2つのトランザクションが互いのロックを待ち合う状態。

```
トランザクションA: users の id=1 をロック → posts の id=1 をロック待ち
トランザクションB: posts の id=1 をロック → users の id=1 をロック待ち
→ お互いが相手を待ち続ける（デッドロック）
```

**回避策**:

- テーブルのロック順序を統一する（常にusers → postsの順でロック）
- トランザクションを短く保つ
- 必要のない行はロックしない
- タイムアウトを設定する

---

## 実践課題: SNSアプリのDB設計

以下の要件でSNSアプリのデータベースを一から設計してみよう。

### 要件

1. ユーザーはアカウント登録、ログインができる
2. ユーザーはプロフィール（表示名、自己紹介、アバター）を設定できる
3. ユーザーは投稿（テキスト+画像）を作成できる
4. ユーザーは他のユーザーをフォローできる
5. ユーザーは投稿に「いいね」「コメント」ができる
6. タイムラインにはフォロー中のユーザーの投稿が表示される
7. 投稿にはハッシュタグを付けられる
8. ダイレクトメッセージ機能がある

### 設計のヒント

まず以下を考える:

1. どんなエンティティが必要か？（users, profiles, posts, ...）
2. エンティティ間の関連は？（1:1, 1:N, M:N）
3. 各エンティティにどんな属性が必要か？
4. どこにインデックスを張るか？
5. タイムラインクエリをどう最適化するか？

この課題に正解は一つではない。要件をどう解釈するかで設計が変わる。まずは自分で考えてからER図を書いてみよう。

---

## 参考リンク

- [データベース設計の基礎（IPA）](https://www.ipa.go.jp/security/vuln/websecurity/)
- [PostgreSQL公式ドキュメント - テーブル](https://www.postgresql.org/docs/current/ddl.html)
- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [Drizzle ORM公式ドキュメント](https://orm.drizzle.team/)
- [draw.io（ER図作成ツール）](https://app.diagrams.net/)
- [SQLアンチパターン（書籍）](https://www.oreilly.co.jp/books/9784873115894/)
- [達人に学ぶDB設計徹底指南書（書籍）](https://gihyo.jp/book/2012/978-4-7741-5387-5)
- [Use The Index, Luke（インデックス設計ガイド）](https://use-the-index-luke.com/ja)
