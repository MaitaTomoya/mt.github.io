---
title: 'PostgreSQL'
order: 25
section: 'データベース'
---

# PostgreSQL

## 前提知識

この記事ではPostgreSQL固有の機能に焦点を当てる。SQLの基本やデータベースの概念については以下の記事を参照してほしい。

- [データベース基礎](/roadmap/database-fundamentals) - データベースの概念、ACID特性、CAP定理、RDB vs NoSQLなど
- [SQL基礎](/roadmap/sql-fundamentals) - SELECT、INSERT、UPDATE、DELETE、JOIN、サブクエリ、トランザクションなど

## PostgreSQLとは何か

PostgreSQL（ポストグレスキューエル、通称: ポスグレ）は、**世界で最も先進的なオープンソースのリレーショナルデータベース管理システム（RDBMS）**。1986年にカリフォルニア大学バークレー校で誕生し、30年以上の歴史を持つ。

特徴:

- **完全にオープンソース**で、ライセンス費用がかからない
- **ACID準拠**で、データの信頼性が高い
- **JSON/JSONB**をネイティブサポートし、NoSQLのような使い方もできる
- **拡張性**が非常に高く、独自のデータ型や関数を追加できる
- Instagram、Spotify、Reddit、Apple、Microsoftなど世界中の企業が採用

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

## PostgreSQL固有のデータ型

PostgreSQLはSQL標準のデータ型に加えて、豊富な独自データ型をサポートしている。基本的なデータ型（INTEGER、VARCHAR、BOOLEAN、DATE、TIMESTAMPなど）については[SQL基礎](/roadmap/sql-fundamentals)を参照。

### 数値型（PostgreSQL固有）

| データ型    | サイズ  | 説明                      |
| ----------- | ------- | ------------------------- |
| `SERIAL`    | 4バイト | 自動採番（INTEGERベース） |
| `BIGSERIAL` | 8バイト | 自動採番（BIGINTベース）  |

**注意**: 新しいプロジェクトでは`SERIAL`の代わりに`GENERATED ALWAYS AS IDENTITY`の使用が推奨されている。

```sql
-- SERIALの代わり（SQL標準準拠）
CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);
```

### 日時型（PostgreSQL推奨）

| データ型      | 説明                          | 例                       |
| ------------- | ----------------------------- | ------------------------ |
| `TIMESTAMPTZ` | 日付+時刻（タイムゾーン付き） | `2024-03-28 14:30:00+09` |
| `INTERVAL`    | 時間の間隔                    | `1 year 2 months 3 days` |

**実務でのアドバイス**: 日時は常に`TIMESTAMPTZ`（タイムゾーン付き）を使うこと。タイムゾーンなしだと、サーバーの場所が変わった時に問題が起きる。

### その他のPostgreSQL固有型

| データ型   | 説明                                       | 用途                     |
| ---------- | ------------------------------------------ | ------------------------ |
| `UUID`     | 一意識別子                                 | 分散システムでのID       |
| `JSON`     | JSONデータ（テキスト保存）                 | 構造化されていないデータ |
| `JSONB`    | JSONデータ（バイナリ保存、インデックス可） | 検索が必要なJSONデータ   |
| `ARRAY`    | 配列型                                     | タグ、カテゴリ           |
| `INET`     | IPアドレス                                 | ネットワーク管理         |
| `BYTEA`    | バイナリデータ                             | 小さなファイル           |
| `TSVECTOR` | 全文検索用テキスト                         | 全文検索                 |
| `TSQUERY`  | 全文検索クエリ                             | 全文検索条件             |

## JSONB操作（詳細）

JSONBはPostgreSQLの強力な機能の1つ。JSONデータをバイナリ形式で保存し、高速な検索とインデックスを可能にする。

### JSON vs JSONB

| 比較項目     | JSON                     | JSONB                    |
| ------------ | ------------------------ | ------------------------ |
| 保存形式     | テキスト（入力そのまま） | バイナリ（解析済み）     |
| 挿入速度     | 速い                     | やや遅い（変換コスト）   |
| 検索速度     | 遅い（毎回パース）       | 速い（バイナリで即検索） |
| インデックス | 不可                     | GINインデックス可能      |
| キーの順序   | 保持される               | 保持されない             |
| 重複キー     | 許可                     | 最後の値が残る           |

**結論**: 特別な理由がない限り**JSONB**を使うこと。

### JSONB演算子一覧

| 演算子 | 説明                   | 例                                  |
| ------ | ---------------------- | ----------------------------------- | ---------------- | ---------------------- | --- | ------------- |
| `->`   | キーでJSON値を取得     | `data->'name'` → `"太郎"`（JSON型） |
| `->>`  | キーでテキスト値を取得 | `data->>'name'` → `太郎`（TEXT型）  |
| `#>`   | パスでJSON値を取得     | `data#>'{address,city}'` → `"東京"` |
| `#>>`  | パスでテキスト値を取得 | `data#>>'{address,city}'` → `東京`  |
| `@>`   | 左が右を含むか         | `data @> '{"role":"admin"}'`        |
| `<@`   | 左が右に含まれるか     | `'{"role":"admin"}' <@ data`        |
| `?`    | キーが存在するか       | `data ? 'name'`                     |
| `?     | `                      | いずれかのキーが存在するか          | `data ?          | array['name','email']` |
| `?&`   | 全てのキーが存在するか | `data ?& array['name','email']`     |
| `      |                        | `                                   | JSON同士をマージ | `data                  |     | '{"age":30}'` |
| `-`    | キーを削除             | `data - 'name'`                     |
| `#-`   | パスで要素を削除       | `data #- '{address,zip}'`           |

### JSONB実用パターン

```sql
-- テーブル作成
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    attributes JSONB DEFAULT '{}'
);

-- データ挿入
INSERT INTO products (name, attributes) VALUES
('Tシャツ', '{
    "color": "red",
    "size": "M",
    "tags": ["casual", "summer"],
    "price": {"regular": 3000, "sale": 2400},
    "stock": 150
}'),
('ジーンズ', '{
    "color": "blue",
    "size": "L",
    "tags": ["casual", "denim"],
    "price": {"regular": 8000, "sale": 6400},
    "stock": 80
}');

-- 基本的な値の取得
SELECT
    name,
    attributes->>'color' AS color,            -- テキストで取得
    attributes->'price'->>'regular' AS price,  -- ネストしたキー
    attributes->'tags' AS tags                 -- JSON配列として取得
FROM products;

-- 含まれるかのチェック（@>）
SELECT name FROM products
WHERE attributes @> '{"color": "red"}';

-- 配列内の要素を検索
SELECT name FROM products
WHERE attributes @> '{"tags": ["summer"]}';

-- キーの存在チェック
SELECT name FROM products
WHERE attributes ? 'stock';

-- JSONBの更新（特定のキーだけ更新）
UPDATE products
SET attributes = attributes || '{"stock": 120}'
WHERE name = 'Tシャツ';

-- ネストしたキーの更新
UPDATE products
SET attributes = jsonb_set(attributes, '{price,sale}', '2200')
WHERE name = 'Tシャツ';

-- キーの削除
UPDATE products
SET attributes = attributes - 'stock'
WHERE name = 'Tシャツ';

-- JSONB配列の操作
UPDATE products
SET attributes = jsonb_set(
    attributes,
    '{tags}',
    (attributes->'tags') || '"winter"'::jsonb  -- タグを追加
)
WHERE name = 'Tシャツ';
```

### GINインデックスによるJSONB高速検索

```sql
-- GINインデックスの作成（JSONB全体に対して）
CREATE INDEX idx_products_attrs ON products USING GIN (attributes);
-- → @>, ?, ?|, ?& 演算子の検索が高速化される

-- 特定のパスに対するGINインデックス
CREATE INDEX idx_products_color ON products USING GIN ((attributes->'color'));

-- jsonb_path_opsオプション（@>演算子のみに最適化、サイズが小さい）
CREATE INDEX idx_products_attrs_ops ON products USING GIN (attributes jsonb_path_ops);

-- インデックスが使われているか確認
EXPLAIN ANALYZE SELECT * FROM products WHERE attributes @> '{"color": "red"}';
```

### JSONB集約関数

```sql
-- 行をJSONオブジェクトに変換
SELECT jsonb_build_object(
    'id', id,
    'name', name,
    'color', attributes->>'color'
) FROM products;

-- 複数行をJSON配列に集約
SELECT jsonb_agg(
    jsonb_build_object('name', name, 'color', attributes->>'color')
) AS products_json
FROM products;

-- JSONBのキーと値を展開
SELECT key, value
FROM products, jsonb_each(attributes)
WHERE id = 1;

-- JSONBの配列を展開
SELECT name, tag
FROM products, jsonb_array_elements_text(attributes->'tags') AS tag;
```

## ARRAY型の使い方

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

-- 配列から要素を削除
UPDATE articles
SET tags = array_remove(tags, 'sql')
WHERE id = 1;

-- 配列の長さ
SELECT title, array_length(tags, 1) AS tag_count FROM articles;

-- 配列の結合
SELECT title, array_to_string(tags, ', ') AS tags_str FROM articles;

-- GINインデックス（配列検索の高速化）
CREATE INDEX idx_articles_tags ON articles USING GIN (tags);
```

## CTE（Common Table Expression / WITH句）

CTEは、クエリ内で名前付きの一時テーブルを定義する機能。複雑なクエリを読みやすくする。

### 基本的なCTE

```sql
-- サブクエリを名前付きで定義
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

### 複数のCTEを連結

```sql
WITH
-- CTE 1: ユーザーごとの注文統計
user_stats AS (
    SELECT
        user_id,
        COUNT(*) AS order_count,
        SUM(price) AS total_spent,
        AVG(price) AS avg_price
    FROM orders
    GROUP BY user_id
),
-- CTE 2: 上位顧客（合計1万円以上）
top_customers AS (
    SELECT user_id, total_spent
    FROM user_stats
    WHERE total_spent >= 10000
)
SELECT
    u.name,
    us.order_count,
    us.total_spent,
    us.avg_price
FROM users u
JOIN top_customers tc ON u.id = tc.user_id
JOIN user_stats us ON u.id = us.user_id
ORDER BY us.total_spent DESC;
```

### 再帰CTE

自分自身を参照するCTE。階層構造のデータ（組織図、カテゴリツリーなど）を扱う際に強力。

```sql
-- 組織図の全階層を取得
WITH RECURSIVE org_tree AS (
    -- 基底ケース: ルート（上司がいない社員）
    SELECT id, name, manager_id, 1 AS depth, name::TEXT AS path
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- 再帰ケース: 部下を辿る
    SELECT e.id, e.name, e.manager_id, t.depth + 1, t.path || ' > ' || e.name
    FROM employees e
    JOIN org_tree t ON e.manager_id = t.id
)
SELECT
    REPEAT('  ', depth - 1) || name AS "組織図",
    depth AS "階層",
    path AS "パス"
FROM org_tree
ORDER BY path;

-- 結果例:
-- 組織図          | 階層 | パス
-- ----------------+------+-------------------
-- 社長            | 1    | 社長
--   部長A         | 2    | 社長 > 部長A
--     課長        | 3    | 社長 > 部長A > 課長
--       一般社員  | 4    | 社長 > 部長A > 課長 > 一般社員
--   部長B         | 2    | 社長 > 部長B
```

### 連番の生成

```sql
-- 1から100までの連番を生成
WITH RECURSIVE numbers AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM numbers WHERE n < 100
)
SELECT n FROM numbers;

-- 日付の連番（カレンダー生成）
WITH RECURSIVE dates AS (
    SELECT '2024-01-01'::DATE AS d
    UNION ALL
    SELECT d + 1 FROM dates WHERE d < '2024-12-31'
)
SELECT d AS "日付", EXTRACT(DOW FROM d) AS "曜日" FROM dates;
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

## テーブル設計

### 正規化

正規化の基本概念については[データベース基礎](/roadmap/database-fundamentals)を参照。ここではPostgreSQLでの実装例を示す。

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

## LISTEN / NOTIFY（リアルタイム通知）

PostgreSQL独自のリアルタイム通知機能。テーブルの変更をアプリケーションにプッシュ通知できる。WebSocketやポーリングの代わりに使える。

### 基本的な使い方

```sql
-- セッション1: チャンネルをリッスン
LISTEN order_created;

-- セッション2: 通知を送信
NOTIFY order_created, '{"order_id": 123, "user_id": 1, "total": 5000}';

-- セッション1に通知が届く:
-- Asynchronous notification "order_created" with payload
-- "{"order_id": 123, "user_id": 1, "total": 5000}" received from server process with PID 12345.
```

### トリガーと組み合わせた自動通知

```sql
-- 注文が作成されたら自動で通知する関数
CREATE OR REPLACE FUNCTION notify_order_created()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'order_created',
        json_build_object(
            'order_id', NEW.id,
            'user_id', NEW.user_id,
            'total', NEW.total_price
        )::TEXT
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成
CREATE TRIGGER trigger_order_notify
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION notify_order_created();
```

### Node.jsでのLISTEN/NOTIFY

```javascript
const { Client } = require('pg')

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

// チャンネルをリッスン
await client.query('LISTEN order_created')

// 通知を受信
client.on('notification', (msg) => {
  const payload = JSON.parse(msg.payload)
  console.log('新しい注文:', payload)
  // WebSocketでフロントエンドに通知するなどの処理
})
```

### 用途

- リアルタイムダッシュボードの更新
- チャットメッセージの配信
- 在庫変動の通知
- キャッシュの無効化

## パーティショニング（テーブル分割）

大量のデータを持つテーブルを、条件に基づいて物理的に分割する機能。パフォーマンスとメンテナンスが向上する。

### レンジパーティショニング（範囲）

```sql
-- 日付でパーティショニングされた注文テーブル
CREATE TABLE orders (
    id BIGSERIAL,
    user_id INTEGER NOT NULL,
    item VARCHAR(200),
    price INTEGER,
    ordered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (ordered_at);

-- 月別のパーティションを作成
CREATE TABLE orders_2024_01 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE orders_2024_02 PARTITION OF orders
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE orders_2024_03 PARTITION OF orders
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

-- デフォルトパーティション（どの範囲にも合わない行をキャッチ）
CREATE TABLE orders_default PARTITION OF orders DEFAULT;

-- クエリは通常のテーブルと同じ
SELECT * FROM orders WHERE ordered_at >= '2024-02-01' AND ordered_at < '2024-03-01';
-- → PostgreSQLが自動的にorders_2024_02パーティションだけを検索する（パーティションプルーニング）
```

### リストパーティショニング

```sql
-- 地域でパーティショニング
CREATE TABLE users (
    id BIGSERIAL,
    name VARCHAR(100),
    region VARCHAR(20) NOT NULL
) PARTITION BY LIST (region);

CREATE TABLE users_asia PARTITION OF users FOR VALUES IN ('japan', 'korea', 'china');
CREATE TABLE users_europe PARTITION OF users FOR VALUES IN ('uk', 'france', 'germany');
CREATE TABLE users_americas PARTITION OF users FOR VALUES IN ('us', 'canada', 'brazil');
```

### ハッシュパーティショニング

```sql
-- IDのハッシュで均等に4分割
CREATE TABLE logs (
    id BIGSERIAL,
    message TEXT,
    created_at TIMESTAMPTZ
) PARTITION BY HASH (id);

CREATE TABLE logs_0 PARTITION OF logs FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE logs_1 PARTITION OF logs FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE logs_2 PARTITION OF logs FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE logs_3 PARTITION OF logs FOR VALUES WITH (MODULUS 4, REMAINDER 3);
```

### パーティショニングの効果

| メリット             | 説明                                                   |
| -------------------- | ------------------------------------------------------ |
| クエリ高速化         | パーティションプルーニングで検索対象を絞れる           |
| メンテナンスの効率化 | 古いパーティションをDROPするだけで大量データを削除可能 |
| VACUUMの効率化       | パーティション単位でVACUUMできる                       |
| パラレルクエリ       | 複数パーティションを並列に検索できる                   |

## レプリケーション（ストリーミングレプリカ）

レプリケーションとは、データベースのコピーを別のサーバーに作成し、同期を維持する仕組み。

### レプリケーションの種類

| 種類                   | 説明                              | 用途                     |
| ---------------------- | --------------------------------- | ------------------------ |
| ストリーミングレプリカ | WALログをリアルタイムで転送・適用 | 読み取りスケーリング、HA |
| 論理レプリケーション   | テーブル単位でデータを複製        | 部分的なデータ共有       |

### ストリーミングレプリケーションの構成

```
            書き込み
クライアント -------> プライマリ（マスター）
                        |
                 WALログ転送
                        |
                        v
                    レプリカ（スタンバイ）
                        |
            読み取り <----
クライアント
```

### 基本的な設定

```bash
# プライマリ（postgresql.conf）
wal_level = replica
max_wal_senders = 3
synchronous_standby_names = ''  # 非同期レプリケーション

# レプリカの作成（ベースバックアップ）
pg_basebackup -h primary_host -D /var/lib/postgresql/data -U replication_user -P -R

# レプリカ（postgresql.conf に自動設定される）
# primary_conninfo = 'host=primary_host user=replication_user'
```

### 読み取りスケーリング

```
                    +--- レプリカ1（読み取り専用）
                    |
プライマリ ---------+--- レプリカ2（読み取り専用）
（書き込み）        |
                    +--- レプリカ3（読み取り専用）

→ 読み取りクエリをレプリカに分散させて負荷を軽減
```

## VACUUM / ANALYZE（メンテナンス）

PostgreSQLはMVCC（Multi-Version Concurrency Control）を採用しており、UPDATE/DELETEした行は物理的に削除されず、不可視のまま残る。VACUUMはこの「死んだ行」を回収する。

### VACUUMの種類

| 種類           | 説明                                       | ロック       |
| -------------- | ------------------------------------------ | ------------ |
| VACUUM         | 死んだ行を回収し、再利用可能にする         | 読み書き可能 |
| VACUUM FULL    | テーブルを完全に再構築（サイズが縮小する） | 排他ロック   |
| VACUUM ANALYZE | VACUUMとANALYZEを同時に実行                | 読み書き可能 |
| autovacuum     | 自動的にVACUUMとANALYZEを実行する          | 読み書き可能 |

### 基本コマンド

```sql
-- 特定テーブルのVACUUM
VACUUM users;

-- VACUUM + ANALYZE（統計情報も更新）
VACUUM ANALYZE users;

-- VACUUM FULL（テーブルを再構築、排他ロックがかかるので注意）
VACUUM FULL users;

-- 全テーブルのVACUUM
VACUUM;

-- ANALYZEのみ（統計情報の更新）
ANALYZE users;
```

### テーブルの肥大化を確認

```sql
-- テーブルサイズと死んだ行の確認
SELECT
    relname AS table_name,
    n_live_tup AS live_rows,
    n_dead_tup AS dead_rows,
    ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_ratio,
    last_vacuum,
    last_autovacuum,
    last_analyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

### autovacuumの設定

```sql
-- autovacuumの状態確認
SHOW autovacuum;

-- テーブル単位でautovacuumの閾値を変更
ALTER TABLE orders SET (
    autovacuum_vacuum_threshold = 50,           -- 最低50行の変更で発動
    autovacuum_vacuum_scale_factor = 0.1,       -- テーブルの10%が変更で発動
    autovacuum_analyze_threshold = 50,
    autovacuum_analyze_scale_factor = 0.05
);
```

## pg_stat_statements（クエリ分析）

実行されたSQLの統計情報を収集する拡張機能。スロークエリの特定やパフォーマンスチューニングに必須。

### 有効化

```sql
-- 拡張機能のインストール
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- postgresql.confに追加（再起動が必要）
-- shared_preload_libraries = 'pg_stat_statements'
-- pg_stat_statements.track = all
```

### よく使うクエリ

```sql
-- 実行時間が長いクエリのトップ10
SELECT
    ROUND(total_exec_time::numeric, 2) AS total_time_ms,
    calls,
    ROUND(mean_exec_time::numeric, 2) AS avg_time_ms,
    ROUND(max_exec_time::numeric, 2) AS max_time_ms,
    LEFT(query, 100) AS query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- 呼び出し回数が多いクエリのトップ10
SELECT
    calls,
    ROUND(total_exec_time::numeric, 2) AS total_time_ms,
    ROUND(mean_exec_time::numeric, 2) AS avg_time_ms,
    LEFT(query, 100) AS query
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;

-- 統計情報のリセット
SELECT pg_stat_statements_reset();
```

## 拡張機能（Extensions）

PostgreSQLの強力な拡張システム。サードパーティ製の機能を簡単に追加できる。

### 主要な拡張機能

| 拡張機能           | 説明                         | 用途                     |
| ------------------ | ---------------------------- | ------------------------ |
| PostGIS            | 地理空間データ型と関数       | 地図、位置情報           |
| pg_trgm            | トライグラムベースの類似検索 | あいまい検索、タイポ補正 |
| uuid-ossp          | UUID生成関数                 | 分散ID生成               |
| pgcrypto           | 暗号化関数                   | パスワードハッシュ       |
| pg_stat_statements | クエリ統計情報の収集         | パフォーマンス分析       |
| hstore             | キーバリュー型データ         | 簡易的なKVストア         |

### PostGIS（地理空間データ）

```sql
-- インストール
CREATE EXTENSION IF NOT EXISTS postgis;

-- 位置情報付きの店舗テーブル
CREATE TABLE shops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    location GEOGRAPHY(POINT, 4326)  -- 緯度経度のポイント
);

-- データ挿入（経度, 緯度の順）
INSERT INTO shops (name, location) VALUES
('東京駅店', ST_GeographyFromText('POINT(139.7671 35.6812)')),
('新宿店', ST_GeographyFromText('POINT(139.7003 35.6938)'));

-- 指定地点から半径1km以内の店舗を検索
SELECT name,
    ST_Distance(location, ST_GeographyFromText('POINT(139.7671 35.6812)')) AS distance_m
FROM shops
WHERE ST_DWithin(location, ST_GeographyFromText('POINT(139.7671 35.6812)'), 1000)
ORDER BY distance_m;
```

### pg_trgm（あいまい検索）

```sql
-- インストール
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 類似度インデックスの作成
CREATE INDEX idx_users_name_trgm ON users USING GIN (name gin_trgm_ops);

-- 類似検索（タイポを許容）
SELECT name, similarity(name, 'たなか') AS sim
FROM users
WHERE name % 'たなか'   -- 類似度が閾値以上
ORDER BY sim DESC;

-- 類似度の閾値設定
SET pg_trgm.similarity_threshold = 0.3;
```

### uuid-ossp

```sql
-- インストール
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- UUIDの生成
SELECT uuid_generate_v4();  -- ランダムなUUID

-- テーブルでの使用
CREATE TABLE sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    expires_at TIMESTAMPTZ NOT NULL
);
```

### pgcrypto

```sql
-- インストール
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- パスワードのハッシュ化
INSERT INTO users (name, email, password_hash)
VALUES ('太郎', 'taro@example.com', crypt('my_password', gen_salt('bf')));

-- パスワードの検証
SELECT * FROM users
WHERE email = 'taro@example.com'
  AND password_hash = crypt('my_password', password_hash);
```

## インデックス

インデックスの基本概念については[SQL基礎](/roadmap/sql-fundamentals)を参照。ここではPostgreSQL固有のインデックス機能を解説する。

### インデックスの種類

| インデックス | アルゴリズム               | 主な用途                         |
| ------------ | -------------------------- | -------------------------------- |
| B-tree       | バランスツリー             | 等値検索、範囲検索（デフォルト） |
| Hash         | ハッシュテーブル           | 等値検索のみ（=）                |
| GIN          | Generalized Inverted Index | 全文検索、JSONB、配列            |
| GiST         | Generalized Search Tree    | 地理情報、範囲型                 |
| BRIN         | Block Range Index          | 大きなテーブルの範囲検索         |

### PostgreSQL固有のインデックス機能

```sql
-- 部分インデックス（条件付き）
CREATE INDEX idx_users_active ON users (email) WHERE is_active = true;
-- → is_active = true の行だけインデックスに含まれる（小さくて高速）

-- 式インデックス
CREATE INDEX idx_users_lower_email ON users (LOWER(email));
-- → LOWER(email) で検索する場合に使われる

-- カバリングインデックス（INCLUDE句）
CREATE INDEX idx_orders_user ON orders (user_id) INCLUDE (item, price);
-- → user_idで検索した際、テーブルにアクセスせずにitem, priceも取得できる

-- 並行インデックス作成（テーブルロックなし）
CREATE INDEX CONCURRENTLY idx_users_name ON users (name);
-- → テーブルへの書き込みをブロックしない（本番環境で推奨）
```

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

## ビュー

ビューの基本概念については[SQL基礎](/roadmap/sql-fundamentals)を参照。

### マテリアライズドビュー

通常のビューは使うたびにクエリを実行する。マテリアライズドビューは結果をキャッシュするため、高速に読み取れる。PostgreSQL固有の機能。

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
- [PostGIS公式ドキュメント](https://postgis.net/documentation/)
