---
title: 'PostgreSQL'
order: 23
section: 'データベース'
---

# PostgreSQL

## PostgreSQLとは何か

PostgreSQL（ポストグレスキューエル、通称: ポスグレ）は、**世界で最も先進的なオープンソースのリレーショナルデータベース管理システム（RDBMS）**。1986年にカリフォルニア大学バークレー校で誕生し、30年以上の歴史を持つ。

特徴:

- **完全にオープンソース**で、ライセンス費用がかからない
- **ACID準拠**（後述）で、データの信頼性が高い
- **JSON/JSONB**をネイティブサポートし、NoSQLのような使い方もできる
- **拡張性**が非常に高く、独自のデータ型や関数を追加できる
- Instagram、Spotify、Reddit、Apple、Microsoftなど世界中の企業が採用

### RDBMSの基本概念

RDBMSを理解するために、まず基本用語を整理する。

Excelのスプレッドシートに例えると分かりやすい:

| RDBMS用語               | Excelでの対応                 | 説明                     |
| ----------------------- | ----------------------------- | ------------------------ |
| データベース            | ワークブック（.xlsxファイル） | データの入れ物全体       |
| テーブル                | ワークシート                  | データの種類ごとの表     |
| 行（レコード/タプル）   | 行                            | 1件のデータ              |
| 列（カラム/フィールド） | 列                            | データの項目             |
| 主キー（Primary Key）   | -                             | 各行を一意に識別するID   |
| 外部キー（Foreign Key） | -                             | 他のテーブルとの関連付け |

**テーブルの例（usersテーブル）**:

| id (主キー) | name     | email              | age |
| ----------- | -------- | ------------------ | --- |
| 1           | 田中太郎 | taro@example.com   | 25  |
| 2           | 佐藤花子 | hanako@example.com | 28  |
| 3           | 鈴木次郎 | jiro@example.com   | 32  |

### リレーション（関連付け）

テーブル同士を関連付けることで、データの重複を避け、整合性を保つ。これがリレーショナルデータベースの核心。

```
users テーブル                    orders テーブル
+----+--------+                  +----+---------+--------+-------+
| id | name   |                  | id | user_id | item   | price |
+----+--------+                  +----+---------+--------+-------+
| 1  | 太郎   | ←────────────── | 1  | 1       | 本     | 1500  |
| 2  | 花子   | ←────────────── | 2  | 1       | ペン   | 200   |
+----+--------+   外部キーで     | 3  | 2       | ノート | 300   |
                  関連付け       +----+---------+--------+-------+
```

`orders`テーブルの`user_id`が外部キー。`users`テーブルの`id`を参照している。これにより「太郎が買った商品一覧」のようなクエリが可能になる。

## MySQL vs PostgreSQLの違い

| 比較項目             | MySQL                       | PostgreSQL                                    |
| -------------------- | --------------------------- | --------------------------------------------- |
| ライセンス           | GPL（Oracle所有）           | PostgreSQLライセンス（BSDに近い、非常に自由） |
| ACID準拠             | InnoDB使用時のみ            | 常に完全準拠                                  |
| JSON対応             | JSON型あり                  | JSON/JSONB型（インデックス可能、高速）        |
| 配列型               | なし                        | ネイティブサポート                            |
| 全文検索             | FULLTEXT INDEX              | tsvector/tsquery（より高機能）                |
| ストアドプロシージャ | SQL/PSM                     | PL/pgSQL（より強力）                          |
| レプリケーション     | 非同期/半同期               | 同期/非同期（ストリーミング）                 |
| UPSERT               | INSERT ... ON DUPLICATE KEY | INSERT ... ON CONFLICT（より柔軟）            |
| Window関数           | 8.0以降で対応               | 古くから完全対応                              |
| CTE（WITH句）        | 8.0以降で対応               | 古くから完全対応                              |
| パフォーマンス       | 読み取り重視で高速          | 複雑なクエリに強い                            |
| 学習コスト           | やや低い                    | やや高い                                      |
| 人気度               | 非常に高い（特にPHP界隈）   | 急速に成長中（特にモダン開発）                |

**どちらを選ぶべきか**: 新規プロジェクトでは**PostgreSQL**を推奨する。JSON対応、配列型、Window関数など、モダンなアプリケーション開発に必要な機能が充実している。ORMを使う場合はどちらでも大差ないが、PostgreSQLの方が将来の拡張性が高い。

## インストール

### Docker（推奨）

```bash
# PostgreSQLコンテナを起動
docker run --name my-postgres \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  -d postgres:16-alpine

# 起動確認
docker ps

# ログ確認
docker logs my-postgres
```

### Docker Compose

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydb
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
docker compose up -d
```

### macOS（Homebrew）

```bash
brew install postgresql@16
brew services start postgresql@16

# データベースの初期化（初回のみ）
initdb /usr/local/var/postgresql@16

# ユーザーとデータベースの作成
createuser myuser
createdb -O myuser mydb
```

## psqlコマンドラインツール

psqlはPostgreSQLに接続するための公式コマンドラインクライアント。

### 接続方法

```bash
# Dockerの場合
docker exec -it my-postgres psql -U myuser -d mydb

# ローカルの場合
psql -U myuser -d mydb

# ホスト・ポート指定
psql -h localhost -p 5432 -U myuser -d mydb

# 接続URL形式
psql "postgresql://myuser:mypassword@localhost:5432/mydb"
```

### psqlのメタコマンド

psql内で使える特殊コマンド。バックスラッシュ（`\`）で始まる。

| コマンド        | 説明                               |
| --------------- | ---------------------------------- |
| `\l`            | データベースの一覧を表示           |
| `\c dbname`     | データベースを切り替え             |
| `\dt`           | テーブルの一覧を表示               |
| `\d tablename`  | テーブルの構造を表示               |
| `\d+ tablename` | テーブルの詳細構造を表示           |
| `\di`           | インデックスの一覧                 |
| `\dv`           | ビューの一覧                       |
| `\df`           | 関数の一覧                         |
| `\du`           | ユーザー/ロールの一覧              |
| `\dn`           | スキーマの一覧                     |
| `\timing`       | クエリの実行時間を表示/非表示      |
| `\x`            | 拡張表示モードの切り替え（縦表示） |
| `\i filename`   | SQLファイルを実行                  |
| `\e`            | エディタでクエリを編集             |
| `\q`            | psqlを終了                         |

```sql
-- 実際の使用例
mydb=# \l
                              List of databases
   Name    | Owner  | Encoding | Collate | Ctype |
-----------+--------+----------+---------+-------+
 mydb      | myuser | UTF8     | C       | C     |
 postgres  | myuser | UTF8     | C       | C     |
 template0 | myuser | UTF8     | C       | C     |
 template1 | myuser | UTF8     | C       | C     |

mydb=# \dt
         List of relations
 Schema | Name   | Type  | Owner
--------+--------+-------+--------
 public | users  | table | myuser
 public | orders | table | myuser
```

## SQLの基本

SQLは**Structured Query Language**の略で、データベースを操作するための言語。大きく2種類に分けられる。

### DDL（Data Definition Language） - テーブルの定義

```sql
-- データベースの作成
CREATE DATABASE shop;

-- テーブルの作成
CREATE TABLE users (
    id SERIAL PRIMARY KEY,          -- 自動採番の主キー
    name VARCHAR(100) NOT NULL,     -- 最大100文字、NULL不可
    email VARCHAR(255) UNIQUE NOT NULL,  -- ユニーク制約
    age INTEGER CHECK (age >= 0),   -- 0以上の整数
    is_active BOOLEAN DEFAULT true, -- デフォルト値
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- テーブルの変更
ALTER TABLE users ADD COLUMN phone VARCHAR(20);         -- 列の追加
ALTER TABLE users DROP COLUMN phone;                     -- 列の削除
ALTER TABLE users ALTER COLUMN name TYPE VARCHAR(200);   -- 型の変更
ALTER TABLE users RENAME COLUMN name TO full_name;       -- 列名の変更
ALTER TABLE users ADD CONSTRAINT age_check CHECK (age >= 0 AND age <= 150);

-- テーブルの削除
DROP TABLE users;                   -- テーブルを削除
DROP TABLE IF EXISTS users;         -- 存在する場合のみ削除

-- テーブルのデータだけ削除（構造は残す）
TRUNCATE TABLE users;
```

### DML（Data Manipulation Language） - データの操作

```sql
-- データの挿入（INSERT）
INSERT INTO users (name, email, age)
VALUES ('田中太郎', 'taro@example.com', 25);

-- 複数行を一度に挿入
INSERT INTO users (name, email, age)
VALUES
    ('佐藤花子', 'hanako@example.com', 28),
    ('鈴木次郎', 'jiro@example.com', 32),
    ('高橋美咲', 'misaki@example.com', 22);

-- データの取得（SELECT）
SELECT * FROM users;                   -- 全列取得
SELECT name, email FROM users;         -- 特定の列だけ取得
SELECT name AS "名前", age AS "年齢" FROM users;  -- 別名を付ける

-- データの更新（UPDATE）
UPDATE users
SET age = 26, updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- データの削除（DELETE）
DELETE FROM users WHERE id = 4;

-- 全データの削除（WHERE句なし - 危険）
DELETE FROM users;  -- 全行削除。本番では絶対にWHERE句をつける
```

## データ型

PostgreSQLは非常に豊富なデータ型をサポートしている。

### 数値型

| データ型           | サイズ  | 範囲             | 用途                               |
| ------------------ | ------- | ---------------- | ---------------------------------- |
| `SMALLINT`         | 2バイト | -32,768 ~ 32,767 | 小さな整数（年齢、個数など）       |
| `INTEGER`          | 4バイト | -21億 ~ 21億     | 一般的な整数                       |
| `BIGINT`           | 8バイト | -922京 ~ 922京   | 大きな整数（ID、金額の分単位など） |
| `SERIAL`           | 4バイト | 1 ~ 21億         | 自動採番（INTEGERベース）          |
| `BIGSERIAL`        | 8バイト | 1 ~ 922京        | 自動採番（BIGINTベース）           |
| `NUMERIC(p,s)`     | 可変    | 任意精度         | 金額など正確な計算が必要な場合     |
| `REAL`             | 4バイト | 6桁精度          | 浮動小数点（近似値）               |
| `DOUBLE PRECISION` | 8バイト | 15桁精度         | 浮動小数点（近似値）               |

**注意**: 金額は`NUMERIC`を使うこと。`REAL`や`DOUBLE PRECISION`は近似値のため、金額計算で誤差が出る。

### 文字列型

| データ型     | 説明                                | 用途                         |
| ------------ | ----------------------------------- | ---------------------------- |
| `VARCHAR(n)` | 最大n文字の可変長文字列             | 名前、メールアドレスなど     |
| `CHAR(n)`    | 固定長n文字（不足分はスペース埋め） | 固定長コード（郵便番号など） |
| `TEXT`       | 長さ制限なしの文字列                | 本文、説明文など             |

**実務でのアドバイス**: PostgreSQLでは`VARCHAR`と`TEXT`のパフォーマンスに差はない。長さ制限が必要な場合は`VARCHAR(n)`、不要な場合は`TEXT`を使う。

### 日付・時刻型

| データ型      | 説明                          | 例                       |
| ------------- | ----------------------------- | ------------------------ |
| `DATE`        | 日付のみ                      | `2024-03-28`             |
| `TIME`        | 時刻のみ                      | `14:30:00`               |
| `TIMESTAMP`   | 日付+時刻（タイムゾーンなし） | `2024-03-28 14:30:00`    |
| `TIMESTAMPTZ` | 日付+時刻（タイムゾーン付き） | `2024-03-28 14:30:00+09` |
| `INTERVAL`    | 時間の間隔                    | `1 year 2 months 3 days` |

**実務でのアドバイス**: 日時は常に`TIMESTAMPTZ`（タイムゾーン付き）を使うこと。タイムゾーンなしだと、サーバーの場所が変わった時に問題が起きる。

### その他の重要な型

| データ型  | 説明                                       | 用途                     |
| --------- | ------------------------------------------ | ------------------------ |
| `BOOLEAN` | true/false                                 | フラグ、有効/無効        |
| `UUID`    | 一意識別子                                 | 分散システムでのID       |
| `JSON`    | JSONデータ（テキスト保存）                 | 構造化されていないデータ |
| `JSONB`   | JSONデータ（バイナリ保存、インデックス可） | 検索が必要なJSONデータ   |
| `ARRAY`   | 配列型                                     | タグ、カテゴリ           |
| `INET`    | IPアドレス                                 | ネットワーク管理         |
| `BYTEA`   | バイナリデータ                             | 小さなファイル           |

### JSON/JSONB型の使い方

```sql
-- JSONB型のカラムを持つテーブル
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    attributes JSONB DEFAULT '{}'
);

-- JSONBデータの挿入
INSERT INTO products (name, attributes)
VALUES (
    'Tシャツ',
    '{"color": "red", "size": "M", "tags": ["casual", "summer"]}'
);

-- JSONBの検索
SELECT name, attributes->>'color' AS color     -- テキストとして取得
FROM products
WHERE attributes->>'color' = 'red';

SELECT name
FROM products
WHERE attributes @> '{"tags": ["summer"]}';    -- 含まれているか

-- JSONBのインデックス
CREATE INDEX idx_products_attributes ON products USING GIN (attributes);
```

### ARRAY型の使い方

```sql
-- 配列型のカラム
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    tags TEXT[] DEFAULT '{}'
);

-- 配列データの挿入
INSERT INTO articles (title, tags)
VALUES ('PostgreSQL入門', ARRAY['database', 'postgresql', 'sql']);

-- 配列の検索
SELECT * FROM articles WHERE 'postgresql' = ANY(tags);

-- 配列に要素を追加
UPDATE articles
SET tags = array_append(tags, 'beginner')
WHERE id = 1;
```

## テーブル設計

### 正規化

正規化とは、データの重複を排除してテーブルを効率的に設計する手法。

#### 正規化前（非正規形）

```
注文テーブル（全部入り）:
+--------+----------+----------+--------+---------+-------+
| 注文ID | 顧客名   | 顧客住所  | 商品名 | 単価    | 数量  |
+--------+----------+----------+--------+---------+-------+
| 1      | 田中太郎 | 東京都   | 本A    | 1500    | 2     |
| 1      | 田中太郎 | 東京都   | ペンB  | 200     | 3     |
| 2      | 佐藤花子 | 大阪府   | 本A    | 1500    | 1     |
+--------+----------+----------+--------+---------+-------+

問題点:
- 「田中太郎」「東京都」が重複している
- 田中太郎が引っ越したら全行を更新する必要がある
- 顧客名を間違えて「田中太朗」と入力するリスク
```

#### 第1正規形（1NF）

ルール: **1つのセルに1つの値だけ**。繰り返しグループを排除する。

上の例では既に1NFを満たしている。

#### 第2正規形（2NF）

ルール: 1NFを満たし、**主キーの一部にだけ依存するカラムを分離**する。

```
顧客テーブル:
+--------+----------+----------+
| 顧客ID | 顧客名   | 顧客住所 |
+--------+----------+----------+
| 1      | 田中太郎 | 東京都   |
| 2      | 佐藤花子 | 大阪府   |
+--------+----------+----------+

商品テーブル:
+--------+--------+------+
| 商品ID | 商品名 | 単価 |
+--------+--------+------+
| 1      | 本A    | 1500 |
| 2      | ペンB  | 200  |
+--------+--------+------+

注文テーブル:
+--------+--------+
| 注文ID | 顧客ID |
+--------+--------+
| 1      | 1      |
| 2      | 2      |
+--------+--------+

注文明細テーブル:
+--------+--------+------+
| 注文ID | 商品ID | 数量 |
+--------+--------+------+
| 1      | 1      | 2    |
| 1      | 2      | 3    |
| 2      | 1      | 1    |
+--------+--------+------+
```

#### 第3正規形（3NF）

ルール: 2NFを満たし、**主キー以外のカラムに依存するカラムを分離**する。

上の例では既に3NFを満たしている。もし顧客テーブルに「都道府県コード」と「都道府県名」の両方があったら、都道府県名は都道府県コードに依存するため、別テーブルに分離する。

### ER図の読み方

ER図（Entity-Relationship Diagram）は、テーブル間の関係を視覚的に表す図。

```
リレーションの種類:

1対1（1:1）  users ──── profiles
  1人のユーザーに1つのプロフィール

1対多（1:N）  users ──┤< orders
  1人のユーザーが複数の注文を持つ

多対多（M:N）  students >┤──┤< courses
  1人の学生が複数のコースを受講し、1つのコースに複数の学生がいる
  → 中間テーブル（enrollments）で実装する
```

## SELECT詳細

### 基本的な絞り込み

```sql
-- WHERE句（条件指定）
SELECT * FROM users WHERE age >= 25;
SELECT * FROM users WHERE name = '田中太郎';
SELECT * FROM users WHERE age BETWEEN 20 AND 30;
SELECT * FROM users WHERE name IN ('田中太郎', '佐藤花子');
SELECT * FROM users WHERE name LIKE '田中%';        -- 前方一致
SELECT * FROM users WHERE name LIKE '%太郎';        -- 後方一致
SELECT * FROM users WHERE name LIKE '%中%';         -- 部分一致
SELECT * FROM users WHERE email IS NULL;
SELECT * FROM users WHERE email IS NOT NULL;

-- 複数条件
SELECT * FROM users WHERE age >= 25 AND is_active = true;
SELECT * FROM users WHERE age < 20 OR age > 60;
SELECT * FROM users WHERE NOT (age >= 25);

-- ORDER BY（ソート）
SELECT * FROM users ORDER BY age ASC;              -- 昇順（デフォルト）
SELECT * FROM users ORDER BY age DESC;             -- 降順
SELECT * FROM users ORDER BY age DESC, name ASC;   -- 複数条件

-- LIMIT / OFFSET（ページネーション）
SELECT * FROM users ORDER BY id LIMIT 10;           -- 最初の10件
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 20; -- 21件目から10件

-- DISTINCT（重複排除）
SELECT DISTINCT city FROM users;                     -- 重複なしの都市一覧

-- AS（別名）
SELECT
    name AS "名前",
    age AS "年齢",
    age * 12 AS "年齢（月）"
FROM users;
```

### ページネーションの注意点

```sql
-- OFFSETベースのページネーション（一般的だが大量データでは遅い）
-- ページ1
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 0;
-- ページ2
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 20;
-- ページ100（OFFSET 1980行をスキップする必要がある = 遅い）
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 1980;

-- カーソルベースのページネーション（大量データ向け、高速）
-- ページ1
SELECT * FROM users ORDER BY id LIMIT 20;
-- ページ2（前ページの最後のIDを使う）
SELECT * FROM users WHERE id > 20 ORDER BY id LIMIT 20;
-- これなら何ページ目でも高速
```

## 集約関数

```sql
-- 基本的な集約関数
SELECT COUNT(*) FROM users;                    -- 全行数
SELECT COUNT(email) FROM users;                -- NULLでない行数
SELECT COUNT(DISTINCT city) FROM users;        -- ユニークな値の数
SELECT SUM(price) FROM orders;                 -- 合計
SELECT AVG(age) FROM users;                    -- 平均
SELECT MAX(age) FROM users;                    -- 最大値
SELECT MIN(age) FROM users;                    -- 最小値

-- GROUP BY（グループ化）
SELECT city, COUNT(*) AS user_count
FROM users
GROUP BY city
ORDER BY user_count DESC;
-- 結果:
-- city    | user_count
-- --------+-----------
-- 東京都  | 150
-- 大阪府  | 80
-- 愛知県  | 45

-- HAVING（グループに対する条件）
SELECT city, COUNT(*) AS user_count
FROM users
GROUP BY city
HAVING COUNT(*) >= 50              -- 50人以上の都市だけ
ORDER BY user_count DESC;

-- GROUP BYの実用例: 月別の売上
SELECT
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS order_count,
    SUM(total_price) AS total_sales,
    AVG(total_price) AS avg_order_value
FROM orders
WHERE created_at >= '2024-01-01'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;
```

### SQLの実行順序

SQLの文は書く順序と実行される順序が異なる。デバッグの際に重要。

| 順番 | 句             | 説明               |
| ---- | -------------- | ------------------ |
| 1    | FROM           | テーブルを指定     |
| 2    | WHERE          | 行の絞り込み       |
| 3    | GROUP BY       | グループ化         |
| 4    | HAVING         | グループの絞り込み |
| 5    | SELECT         | 列の選択           |
| 6    | DISTINCT       | 重複の排除         |
| 7    | ORDER BY       | ソート             |
| 8    | LIMIT / OFFSET | 行数の制限         |

だから`WHERE`でSELECTの別名を使えない（WHEREの方が先に実行されるため）。

## JOIN（テーブルの結合）

JOINは複数のテーブルを結合してデータを取得する。RDBの最も重要な機能の1つ。

### サンプルデータ

```sql
-- テーブル作成
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    item VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL
);

-- データ挿入
INSERT INTO users (name) VALUES ('太郎'), ('花子'), ('次郎');
INSERT INTO orders (user_id, item, price) VALUES
    (1, '本', 1500),
    (1, 'ペン', 200),
    (2, 'ノート', 300),
    (NULL, 'キーボード', 5000);  -- user_idがNULL（誰の注文か不明）
```

### INNER JOIN（内部結合）

両方のテーブルに一致するデータだけを取得する。

```sql
SELECT u.name, o.item, o.price
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
```

```
結果:
 name | item   | price
------+--------+-------
 太郎 | 本     | 1500
 太郎 | ペン   | 200
 花子 | ノート | 300
```

次郎（注文がない）とキーボード（user_idがNULL）は表示されない。

### LEFT JOIN（左外部結合）

左テーブル（FROM側）の全行を取得し、右テーブルに一致がない場合はNULLになる。

```sql
SELECT u.name, o.item, o.price
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

```
結果:
 name | item   | price
------+--------+-------
 太郎 | 本     | 1500
 太郎 | ペン   | 200
 花子 | ノート | 300
 次郎 | NULL   | NULL    ← 注文がないユーザーもNULLで表示
```

### RIGHT JOIN（右外部結合）

右テーブル（JOIN側）の全行を取得する。LEFT JOINの逆。

```sql
SELECT u.name, o.item, o.price
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;
```

```
結果:
 name | item       | price
------+------------+-------
 太郎 | 本         | 1500
 太郎 | ペン       | 200
 花子 | ノート     | 300
 NULL | キーボード | 5000    ← ユーザー不明の注文も表示
```

### FULL OUTER JOIN（完全外部結合）

両方のテーブルの全行を取得する。一致がない場合はNULL。

```sql
SELECT u.name, o.item, o.price
FROM users u
FULL OUTER JOIN orders o ON u.id = o.user_id;
```

```
結果:
 name | item       | price
------+------------+-------
 太郎 | 本         | 1500
 太郎 | ペン       | 200
 花子 | ノート     | 300
 次郎 | NULL       | NULL
 NULL | キーボード | 5000
```

### CROSS JOIN（交差結合）

全ての組み合わせを生成する。結果の行数は「テーブルAの行数 x テーブルBの行数」。

```sql
SELECT u.name, o.item
FROM users u
CROSS JOIN orders o;
-- 3ユーザー x 4注文 = 12行
```

実務ではあまり使わないが、テストデータ生成や日付のカレンダー生成に役立つことがある。

### SELF JOIN（自己結合）

同じテーブルを自分自身と結合する。階層構造（上司-部下など）を表現する際に使う。

```sql
-- 社員テーブル（上司のIDを持つ）
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    manager_id INTEGER REFERENCES employees(id)
);

INSERT INTO employees (name, manager_id) VALUES
    ('社長', NULL),
    ('部長A', 1),
    ('部長B', 1),
    ('課長', 2),
    ('一般社員', 4);

-- 社員と上司の名前を表示
SELECT
    e.name AS "社員名",
    m.name AS "上司名"
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

```
結果:
 社員名   | 上司名
----------+--------
 社長     | NULL
 部長A    | 社長
 部長B    | 社長
 課長     | 部長A
 一般社員 | 課長
```

### JOINの使い分け早見表

| JOIN種類        | いつ使う                                         |
| --------------- | ------------------------------------------------ |
| INNER JOIN      | 両方のテーブルに確実にデータがある場合           |
| LEFT JOIN       | 主テーブルの全行を表示したい場合（最もよく使う） |
| RIGHT JOIN      | ほとんど使わない（LEFT JOINで代用可能）          |
| FULL OUTER JOIN | 両テーブルの全データを確認したい場合             |
| CROSS JOIN      | 全組み合わせが必要な場合（稀）                   |
| SELF JOIN       | 階層構造、自己参照の場合                         |

## サブクエリ

クエリの中にクエリを入れる。ネスト（入れ子）のSQLを書ける。

```sql
-- WHERE IN サブクエリ: 注文したことがあるユーザーを取得
SELECT * FROM users
WHERE id IN (SELECT DISTINCT user_id FROM orders WHERE user_id IS NOT NULL);

-- EXISTS サブクエリ: 注文が存在するユーザー（INより効率的な場合がある）
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- NOT EXISTS: 注文がないユーザー
SELECT * FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- スカラサブクエリ: 1つの値を返すサブクエリ
SELECT
    name,
    age,
    age - (SELECT AVG(age) FROM users) AS "平均との差"
FROM users;

-- FROM句のサブクエリ（派生テーブル）
SELECT city, user_count
FROM (
    SELECT city, COUNT(*) AS user_count
    FROM users
    GROUP BY city
) AS city_stats
WHERE user_count >= 10;

-- WITH句（CTE: Common Table Expression）
-- サブクエリを名前付きで定義。可読性が高い
WITH order_summary AS (
    SELECT
        user_id,
        COUNT(*) AS order_count,
        SUM(price) AS total_spent
    FROM orders
    GROUP BY user_id
)
SELECT
    u.name,
    os.order_count,
    os.total_spent
FROM users u
JOIN order_summary os ON u.id = os.user_id
ORDER BY os.total_spent DESC;
```

## Window関数

Window関数は、GROUP BYのようにグループ化して集計しつつも、元の行を保持したまま結果を返す機能。PostgreSQLが古くから得意としている分野。

### 基本構文

```sql
-- 関数名() OVER (PARTITION BY 区分カラム ORDER BY 並び替えカラム)
SELECT
    name,
    age,
    city,
    AVG(age) OVER () AS "全体平均",
    AVG(age) OVER (PARTITION BY city) AS "都市別平均"
FROM users;
```

`OVER()`の中が空だと全行に対して計算、`PARTITION BY`を指定するとグループごとに計算される。GROUP BYとの違いは、**元の行がそのまま残る**こと。

### よく使うWindow関数

| 関数           | 説明                                         | 使用例               |
| -------------- | -------------------------------------------- | -------------------- |
| `ROW_NUMBER()` | 行番号を振る（重複なし）                     | ランキング、重複排除 |
| `RANK()`       | 順位を振る（同率あり、次の順位を飛ばす）     | 同点ありのランキング |
| `DENSE_RANK()` | 順位を振る（同率あり、次の順位を飛ばさない） | 連番ランキング       |
| `LAG(col, n)`  | n行前の値を取得                              | 前月比の計算         |
| `LEAD(col, n)` | n行後の値を取得                              | 翌月の値との比較     |
| `SUM() OVER()` | 累計合計                                     | 累計売上             |
| `NTILE(n)`     | n個のグループに均等分割                      | 四分位数の計算       |

### 実用例

```sql
-- 各ユーザーの注文に順位をつける（金額降順）
SELECT
    u.name,
    o.item,
    o.price,
    ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY o.price DESC) AS rank
FROM users u
JOIN orders o ON u.id = o.user_id;

-- 累計売上の計算
SELECT
    created_at::DATE AS order_date,
    price,
    SUM(price) OVER (ORDER BY created_at) AS running_total
FROM orders;

-- 前回注文との金額差を計算
SELECT
    item,
    price,
    LAG(price) OVER (ORDER BY created_at) AS prev_price,
    price - LAG(price) OVER (ORDER BY created_at) AS diff
FROM orders;
```

**GROUP BYとWindow関数の使い分け**: 集計結果だけが必要ならGROUP BY、個々の行に集計値を添えたいならWindow関数を使う。

## インデックス

インデックスは、データベースの検索を高速化する仕組み。本の索引に相当する。

### インデックスの仕組み

本で特定のキーワードを探すとき、最初のページから順に読む（全文スキャン）のは非効率。索引を使えば、キーワードからページ番号を素早く見つけられる。

データベースのインデックスも同じ原理。

| 操作                 | インデックスなし    | インデックスあり       |
| -------------------- | ------------------- | ---------------------- |
| 100万行から1行を検索 | 最大100万行スキャン | 数十回の比較で見つかる |
| 時間計算量           | O(n)                | O(log n)               |

### インデックスの種類

| インデックス | アルゴリズム               | 主な用途                         |
| ------------ | -------------------------- | -------------------------------- |
| B-tree       | バランスツリー             | 等値検索、範囲検索（デフォルト） |
| Hash         | ハッシュテーブル           | 等値検索のみ（=）                |
| GIN          | Generalized Inverted Index | 全文検索、JSONB、配列            |
| GiST         | Generalized Search Tree    | 地理情報、範囲型                 |

### インデックスの作成と管理

```sql
-- 基本的なインデックスの作成（B-tree）
CREATE INDEX idx_users_email ON users (email);

-- ユニークインデックス
CREATE UNIQUE INDEX idx_users_email_unique ON users (email);

-- 複合インデックス（複数カラム）
CREATE INDEX idx_orders_user_date ON orders (user_id, created_at);

-- 部分インデックス（条件付き）
CREATE INDEX idx_users_active ON users (email) WHERE is_active = true;

-- JSONBインデックス（GIN）
CREATE INDEX idx_products_attrs ON products USING GIN (attributes);

-- インデックスの確認
\di                            -- psqlで一覧表示
SELECT * FROM pg_indexes WHERE tablename = 'users';

-- インデックスの削除
DROP INDEX idx_users_email;
```

### いつインデックスを作るべきか

| 作るべき場合                    | 作らない方がよい場合                                                      |
| ------------------------------- | ------------------------------------------------------------------------- |
| WHERE句で頻繁に検索されるカラム | テーブルが小さい（数百行以下）                                            |
| JOINの結合条件に使われるカラム  | 頻繁にINSERT/UPDATEが行われるカラム（インデックスの更新コストが高くなる） |
| ORDER BYに使われるカラム        | カーディナリティが低いカラム（true/falseなど）                            |
| 外部キー                        |                                                                           |

**注意**: インデックスは検索を速くするが、INSERT/UPDATE/DELETEを遅くする。インデックスも更新する必要があるため。むやみに作らないこと。

## トランザクション

トランザクションとは、複数のSQL操作を1つのまとまりとして扱う仕組み。「全て成功するか、全て失敗するか」を保証する。

### 銀行振込の例

太郎の口座から花子の口座に1万円を送金する場合:

```sql
-- トランザクションなし（危険）
UPDATE accounts SET balance = balance - 10000 WHERE user_id = 1;  -- 太郎から引く
-- ここでサーバーがクラッシュしたら？
-- 太郎のお金は減ったのに、花子には入金されない！
UPDATE accounts SET balance = balance + 10000 WHERE user_id = 2;  -- 花子に足す

-- トランザクションあり（安全）
BEGIN;  -- トランザクション開始
UPDATE accounts SET balance = balance - 10000 WHERE user_id = 1;
UPDATE accounts SET balance = balance + 10000 WHERE user_id = 2;
COMMIT;  -- 両方成功したら確定

-- エラーが発生した場合
BEGIN;
UPDATE accounts SET balance = balance - 10000 WHERE user_id = 1;
-- エラー発生！
ROLLBACK;  -- 全ての変更を取り消し。太郎の残高も元に戻る
```

### ACID特性

トランザクションが満たすべき4つの特性:

| 特性   | 英語        | 説明                                             | 例                                          |
| ------ | ----------- | ------------------------------------------------ | ------------------------------------------- |
| 原子性 | Atomicity   | 全て成功するか、全て失敗するか                   | 振込の途中で止まらない                      |
| 一貫性 | Consistency | トランザクション前後でデータの整合性が保たれる   | 送金前後で合計金額が変わらない              |
| 独立性 | Isolation   | 同時実行されるトランザクションが互いに干渉しない | 2人が同時に同じ商品を買おうとしても問題ない |
| 永続性 | Durability  | COMMITされたデータは失われない                   | サーバーが落ちてもデータは残る              |

## 制約

制約は、テーブルに不正なデータが入るのを防ぐルール。

```sql
CREATE TABLE products (
    -- PRIMARY KEY: 主キー（一意 + NOT NULL）
    id SERIAL PRIMARY KEY,

    -- NOT NULL: NULLを許可しない
    name VARCHAR(100) NOT NULL,

    -- UNIQUE: 重複を許可しない
    sku VARCHAR(50) UNIQUE,

    -- CHECK: 条件を満たす値のみ許可
    price INTEGER CHECK (price > 0),
    stock INTEGER CHECK (stock >= 0) DEFAULT 0,

    -- FOREIGN KEY: 外部キー（他テーブルとの参照整合性）
    category_id INTEGER REFERENCES categories(id)
        ON DELETE SET NULL       -- 参照先が削除されたらNULLに
        ON UPDATE CASCADE,       -- 参照先が更新されたら追従

    -- DEFAULT: デフォルト値
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### 外部キーのON DELETE/ON UPDATE

| オプション  | 説明                                              |
| ----------- | ------------------------------------------------- |
| CASCADE     | 参照先の操作に追従（削除/更新も連動）             |
| SET NULL    | 参照先が削除/更新されたらNULLに設定               |
| SET DEFAULT | 参照先が削除/更新されたらデフォルト値に設定       |
| RESTRICT    | 参照されている場合は削除/更新を拒否（デフォルト） |
| NO ACTION   | RESTRICTと同じだが、チェックのタイミングが異なる  |

## ビュー

ビューは、SELECT文に名前を付けて保存したもの。仮想テーブルとして使える。

```sql
-- ビューの作成
CREATE VIEW user_order_summary AS
SELECT
    u.id,
    u.name,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.price), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;

-- ビューの使用（通常のテーブルと同じように使える）
SELECT * FROM user_order_summary WHERE total_spent > 10000;

-- ビューの削除
DROP VIEW user_order_summary;
```

### マテリアライズドビュー

通常のビューは使うたびにクエリを実行する。マテリアライズドビューは結果をキャッシュするため、高速に読み取れる。

```sql
-- マテリアライズドビューの作成
CREATE MATERIALIZED VIEW monthly_sales AS
SELECT
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS order_count,
    SUM(total_price) AS total_sales
FROM orders
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;

-- 使用
SELECT * FROM monthly_sales;

-- データを最新に更新（手動で実行する必要がある）
REFRESH MATERIALIZED VIEW monthly_sales;

-- データの更新中もSELECTできるようにする
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_sales;
-- CONCURRENTLYを使うにはユニークインデックスが必要
CREATE UNIQUE INDEX idx_monthly_sales ON monthly_sales (month);
```

**使いどころ**: ダッシュボードの集計表示、レポート、頻繁に実行される重いクエリの結果キャッシュ。

## 関数とトリガー

### 関数（PL/pgSQL）

```sql
-- 税込み価格を計算する関数
CREATE OR REPLACE FUNCTION calc_tax_included(price INTEGER, tax_rate NUMERIC DEFAULT 0.10)
RETURNS INTEGER AS $$
BEGIN
    RETURN ROUND(price * (1 + tax_rate));
END;
$$ LANGUAGE plpgsql;

-- 使用
SELECT name, price, calc_tax_included(price) AS tax_included
FROM products;

-- ユーザーの注文合計を取得する関数
CREATE OR REPLACE FUNCTION get_user_total_spent(target_user_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    total INTEGER;
BEGIN
    SELECT COALESCE(SUM(price), 0) INTO total
    FROM orders
    WHERE user_id = target_user_id;
    RETURN total;
END;
$$ LANGUAGE plpgsql;

SELECT name, get_user_total_spent(id) AS total_spent FROM users;
```

### トリガー

テーブルにINSERT/UPDATE/DELETEが行われた時に自動的に実行される関数。

```sql
-- updated_atを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- これで、usersテーブルのUPDATEが実行されるたびに、
-- updated_atが自動的に現在時刻に更新される
```

## パフォーマンスチューニング

### EXPLAIN ANALYZE

クエリの実行計画を確認するコマンド。どのようにデータを検索しているかが分かる。

```sql
-- 実行計画の確認
EXPLAIN SELECT * FROM users WHERE email = 'taro@example.com';

-- 実行計画 + 実際の実行時間
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'taro@example.com';
```

```
-- インデックスなしの場合（遅い）
Seq Scan on users  (cost=0.00..25.00 rows=1 width=100) (actual time=0.500..2.300 rows=1 loops=1)
  Filter: (email = 'taro@example.com'::text)
  Rows Removed by Filter: 999
Planning Time: 0.100 ms
Execution Time: 2.400 ms

-- インデックスありの場合（速い）
Index Scan using idx_users_email on users  (cost=0.28..8.29 rows=1 width=100) (actual time=0.030..0.031 rows=1 loops=1)
  Index Cond: (email = 'taro@example.com'::text)
Planning Time: 0.100 ms
Execution Time: 0.050 ms
```

| 用語        | 説明                               |
| ----------- | ---------------------------------- |
| Seq Scan    | テーブルの全行を順番に読む（遅い） |
| Index Scan  | インデックスを使って検索（速い）   |
| cost        | 推定コスト（開始..合計）           |
| rows        | 推定行数                           |
| actual time | 実際の実行時間（ミリ秒）           |
| loops       | 実行回数                           |

### スロークエリの特定

```sql
-- PostgreSQLの設定でスロークエリをログに記録
-- postgresql.conf に以下を追加:
-- log_min_duration_statement = 1000  -- 1秒以上のクエリをログに記録

-- 実行中のクエリを確認
SELECT
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;

-- テーブルの統計情報を確認
SELECT
    relname AS table_name,
    seq_scan,          -- シーケンシャルスキャンの回数
    idx_scan,          -- インデックススキャンの回数
    n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;
```

### パフォーマンス改善のチェックリスト

| チェック項目                              | 対応                         |
| ----------------------------------------- | ---------------------------- |
| WHERE句のカラムにインデックスがあるか     | `CREATE INDEX`で追加         |
| JOIN条件のカラムにインデックスがあるか    | 外部キーにインデックスを追加 |
| `SELECT *`を使っていないか                | 必要なカラムだけを指定       |
| N+1問題が発生していないか                 | JOINやサブクエリで一括取得   |
| 不要なサブクエリがないか                  | JOINに書き換え               |
| EXPLAIN ANALYZEでSeq Scanになっていないか | インデックスを追加           |
| テーブルの統計情報が古くないか            | `ANALYZE table_name`で更新   |

## バックアップとリストア

### pg_dump（バックアップ）

```bash
# データベース全体をバックアップ（SQLフォーマット）
pg_dump -U myuser -d mydb > backup.sql

# カスタムフォーマット（圧縮される、推奨）
pg_dump -U myuser -d mydb -Fc > backup.dump

# 特定のテーブルだけ
pg_dump -U myuser -d mydb -t users -t orders > tables_backup.sql

# データだけ（テーブル構造を含まない）
pg_dump -U myuser -d mydb --data-only > data_only.sql

# テーブル構造だけ（データを含まない）
pg_dump -U myuser -d mydb --schema-only > schema_only.sql

# Docker環境の場合
docker exec my-postgres pg_dump -U myuser mydb > backup.sql
```

### pg_restore（リストア）

```bash
# SQLフォーマットからリストア
psql -U myuser -d mydb < backup.sql

# カスタムフォーマットからリストア
pg_restore -U myuser -d mydb backup.dump

# データベースを作り直してリストア
dropdb -U myuser mydb
createdb -U myuser mydb
pg_restore -U myuser -d mydb backup.dump
```

### 自動バックアップスクリプト

```bash
#!/bin/bash
# daily_backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/postgresql"
DB_NAME="mydb"
DB_USER="myuser"

mkdir -p "$BACKUP_DIR"

# バックアップ実行
pg_dump -U "$DB_USER" -Fc "$DB_NAME" > "$BACKUP_DIR/${DB_NAME}_${DATE}.dump"

# 30日より古いバックアップを削除
find "$BACKUP_DIR" -name "*.dump" -mtime +30 -delete

echo "バックアップ完了: ${DB_NAME}_${DATE}.dump"
```

cronに登録:

```bash
# 毎日午前3時にバックアップ
0 3 * * * /home/taro/scripts/daily_backup.sh >> /var/log/backup.log 2>&1
```

## Node.js + PostgreSQL

### pgパッケージ（低レベル）

最もシンプルなPostgreSQLクライアント。

```bash
npm install pg
```

```javascript
const { Pool } = require('pg')

// コネクションプールの作成
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'myuser',
  password: 'mypassword',
  database: 'mydb',
  max: 20, // 最大接続数
})

// クエリの実行
async function getUsers() {
  const result = await pool.query('SELECT * FROM users ORDER BY id')
  return result.rows
}

// パラメータ付きクエリ（SQLインジェクション対策）
async function getUserById(id) {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id] // $1にバインド
  )
  return result.rows[0]
}

// INSERT
async function createUser(name, email, age) {
  const result = await pool.query(
    'INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING *',
    [name, email, age]
  )
  return result.rows[0]
}

// トランザクション
async function transferMoney(fromId, toId, amount) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('UPDATE accounts SET balance = balance - $1 WHERE user_id = $2', [
      amount,
      fromId,
    ])
    await client.query('UPDATE accounts SET balance = balance + $1 WHERE user_id = $2', [
      amount,
      toId,
    ])
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
```

**重要**: SQLを直接文字列結合で組み立てるのは**絶対にやってはいけない**。SQLインジェクション攻撃の原因になる。必ずパラメータバインディング（`$1`, `$2`）を使うこと。

```javascript
// 危険な例（絶対にやらない）
const query = `SELECT * FROM users WHERE name = '${userInput}'`

// 安全な例
const query = 'SELECT * FROM users WHERE name = $1'
const result = await pool.query(query, [userInput])
```

### Prisma ORM

モダンなTypeScript/JavaScript向けORM。型安全で、マイグレーション機能も充実。

```bash
npm install prisma @prisma/client
npx prisma init
```

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
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  age       Int?
  orders    Order[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}

model Order {
  id        Int      @id @default(autoincrement())
  item      String
  price     Int
  user      User     @relation(fields: [userId], references: [id])
  userId    Int      @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("orders")
}
```

```bash
# マイグレーションの実行
npx prisma migrate dev --name init

# Prisma Clientの生成
npx prisma generate

# Prisma Studioの起動（GUIでデータを閲覧・編集）
npx prisma studio
```

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// 全ユーザーを取得
const users = await prisma.user.findMany()

// 条件付き取得
const activeUsers = await prisma.user.findMany({
  where: { age: { gte: 20 } },
  orderBy: { name: 'asc' },
})

// リレーション付き取得
const userWithOrders = await prisma.user.findUnique({
  where: { id: 1 },
  include: { orders: true },
})

// 作成
const newUser = await prisma.user.create({
  data: {
    name: '田中太郎',
    email: 'taro@example.com',
    age: 25,
  },
})

// 更新
const updated = await prisma.user.update({
  where: { id: 1 },
  data: { name: '田中一郎' },
})

// 削除
await prisma.user.delete({ where: { id: 1 } })

// トランザクション
const result = await prisma.$transaction(async (tx) => {
  const from = await tx.account.update({
    where: { userId: 1 },
    data: { balance: { decrement: 10000 } },
  })
  const to = await tx.account.update({
    where: { userId: 2 },
    data: { balance: { increment: 10000 } },
  })
  return { from, to }
})
```

### Drizzle ORM

軽量でSQL寄りのORM。TypeScript完全対応。

```bash
npm install drizzle-orm pg
npm install -D drizzle-kit
```

```typescript
// src/db/schema.ts
import { pgTable, serial, varchar, integer, timestamp, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  age: integer('age'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  item: varchar('item', { length: 100 }).notNull(),
  price: integer('price').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})
```

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool, { schema })

// 全ユーザーを取得
const allUsers = await db.select().from(schema.users)

// 条件付き取得
import { eq, gte } from 'drizzle-orm'
const adults = await db.select().from(schema.users).where(gte(schema.users.age, 20))

// JOIN
const usersWithOrders = await db
  .select()
  .from(schema.users)
  .leftJoin(schema.orders, eq(schema.users.id, schema.orders.userId))

// INSERT
await db.insert(schema.users).values({
  name: '田中太郎',
  email: 'taro@example.com',
  age: 25,
})
```

### ORM比較表

| 特徴             | pg（生SQL）          | Prisma               | Drizzle         |
| ---------------- | -------------------- | -------------------- | --------------- |
| 学習コスト       | SQLの知識が必要      | やや高い（独自構文） | 低い（SQL寄り） |
| 型安全性         | なし                 | 強い                 | 強い            |
| マイグレーション | 手動                 | 自動生成             | 自動生成        |
| パフォーマンス   | 最速                 | やや遅い             | 速い            |
| 柔軟性           | 最高（何でもできる） | 中程度               | 高い            |
| GUI              | なし                 | Prisma Studio        | Drizzle Studio  |
| バンドルサイズ   | 小さい               | 大きい               | 小さい          |

## 実践例: ユーザー管理テーブルの設計と全SQL操作

実際のアプリケーションで使う、ユーザー管理機能のテーブル設計と操作を一通り実践する。

### テーブル設計

```sql
-- ユーザーテーブル
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- プロフィールテーブル（1対1）
CREATE TABLE user_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    website VARCHAR(500),
    location VARCHAR(100),
    birth_date DATE,
    phone VARCHAR(20),
    social_links JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ログインログテーブル
CREATE TABLE login_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role) WHERE is_active = true;
CREATE INDEX idx_login_logs_user_id ON login_logs (user_id);
CREATE INDEX idx_login_logs_created_at ON login_logs (created_at);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_profiles_updated
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

### データの挿入

```sql
-- ユーザーの作成
INSERT INTO users (username, email, password_hash, display_name, role)
VALUES
    ('admin', 'admin@example.com', '$2b$10$hash1...', '管理者', 'admin'),
    ('taro', 'taro@example.com', '$2b$10$hash2...', '田中太郎', 'user'),
    ('hanako', 'hanako@example.com', '$2b$10$hash3...', '佐藤花子', 'user'),
    ('jiro', 'jiro@example.com', '$2b$10$hash4...', '鈴木次郎', 'moderator'),
    ('misaki', 'misaki@example.com', '$2b$10$hash5...', '高橋美咲', 'user');

-- プロフィールの作成
INSERT INTO user_profiles (user_id, website, location, social_links)
VALUES
    (2, 'https://taro.dev', '東京都', '{"twitter": "@taro_dev", "github": "taro"}'),
    (3, NULL, '大阪府', '{"twitter": "@hanako"}');

-- ログイン記録
INSERT INTO login_logs (user_id, ip_address, user_agent, success)
VALUES
    (2, '192.168.1.1', 'Mozilla/5.0...', true),
    (2, '192.168.1.1', 'Mozilla/5.0...', true),
    (3, '10.0.0.1', 'Chrome/120...', true),
    (2, '203.0.113.1', 'curl/7.68', false);
```

### データの取得（様々なパターン）

```sql
-- ユーザー一覧（基本）
SELECT id, username, display_name, email, role, is_active
FROM users
ORDER BY created_at DESC;

-- アクティブユーザーのみ
SELECT id, username, display_name
FROM users
WHERE is_active = true
ORDER BY username;

-- プロフィール付きでユーザーを取得
SELECT
    u.id,
    u.username,
    u.display_name,
    u.email,
    p.website,
    p.location,
    p.social_links->>'twitter' AS twitter
FROM users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE u.is_active = true;

-- ロール別のユーザー数
SELECT role, COUNT(*) AS user_count
FROM users
WHERE is_active = true
GROUP BY role
ORDER BY user_count DESC;

-- 最近ログインしたユーザー（直近7日間）
SELECT
    u.username,
    u.display_name,
    MAX(l.created_at) AS last_login
FROM users u
JOIN login_logs l ON u.id = l.user_id
WHERE l.success = true
  AND l.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY u.id, u.username, u.display_name
ORDER BY last_login DESC;

-- ログイン失敗が多いユーザー（セキュリティ監視）
SELECT
    u.username,
    u.email,
    COUNT(*) AS failed_attempts,
    MAX(l.created_at) AS last_attempt
FROM users u
JOIN login_logs l ON u.id = l.user_id
WHERE l.success = false
  AND l.created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
GROUP BY u.id, u.username, u.email
HAVING COUNT(*) >= 5
ORDER BY failed_attempts DESC;

-- ページネーション付きユーザー検索
SELECT id, username, display_name, email
FROM users
WHERE is_active = true
  AND (display_name ILIKE '%太郎%' OR username ILIKE '%taro%')
ORDER BY id
LIMIT 20
OFFSET 0;
```

### データの更新

```sql
-- ユーザー情報の更新
UPDATE users
SET display_name = '田中太郎（更新済み）', email_verified = true
WHERE id = 2;

-- プロフィールの更新（UPSERT: あれば更新、なければ挿入）
INSERT INTO user_profiles (user_id, website, location)
VALUES (4, 'https://jiro.dev', '名古屋市')
ON CONFLICT (user_id) DO UPDATE
SET website = EXCLUDED.website, location = EXCLUDED.location;

-- 最終ログイン日時の更新
UPDATE users
SET last_login_at = CURRENT_TIMESTAMP
WHERE id = 2;

-- 一括更新（30日以上ログインしていないユーザーを無効化）
UPDATE users
SET is_active = false
WHERE last_login_at < CURRENT_TIMESTAMP - INTERVAL '30 days'
  AND role = 'user';
```

### データの削除

```sql
-- 特定ユーザーの削除（CASCADE設定により関連データも自動削除）
DELETE FROM users WHERE id = 5;

-- 古いログインログの削除
DELETE FROM login_logs
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
```

## 参考リンク

- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)
- [PostgreSQL公式チュートリアル](https://www.postgresql.org/docs/current/tutorial.html)
- [PostgreSQL日本語ドキュメント](https://www.postgresql.jp/document/)
- [pgExercises（SQLの練習問題）](https://pgexercises.com/)
- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [Drizzle ORM公式ドキュメント](https://orm.drizzle.team/)
- [Use The Index, Luke（インデックスの解説、日本語あり）](https://use-the-index-luke.com/ja)
- [SQLBolt（インタラクティブなSQL学習）](https://sqlbolt.com/)
- [DB Fiddle（ブラウザでSQLを試せる）](https://www.db-fiddle.com/)
