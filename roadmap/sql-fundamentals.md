---
title: 'SQL基礎'
order: 24
section: 'データベース'
---

# SQL基礎

## SQLとは何か

SQL（Structured Query Language）とは、リレーショナルデータベース（RDB）を操作するための標準言語。「エスキューエル」または「シークェル」と読む。

SQLは**宣言的言語**と呼ばれる。通常のプログラミング言語（JavaScript、Pythonなど）が「どうやるか（How）」を記述するのに対し、SQLは「何がほしいか（What）」を記述する。

```
プログラミング言語（手続き的）:
  1. usersテーブルを開く
  2. 1行目から順に読み込む
  3. ageが25以上か確認する
  4. 条件を満たしたらresultに追加する
  5. 全行を確認するまで繰り返す

SQL（宣言的）:
  SELECT * FROM users WHERE age >= 25;
  → 「usersテーブルからageが25以上の行をください」
  → どうやって探すかはデータベースが最適化して決める
```

## SQLの歴史

| 年   | 出来事                                                         |
| ---- | -------------------------------------------------------------- |
| 1970 | Edgar F. Coddがリレーショナルモデルを発表                      |
| 1974 | IBM研究所でSEQUEL（SQLの前身）が開発される                     |
| 1979 | Oracle（当時Relational Software社）が最初の商用RDBMSをリリース |
| 1986 | ANSI（米国国家規格協会）がSQL-86として標準化                   |
| 1992 | SQL-92（SQL2）が策定され、現在の基盤となる                     |
| 1999 | SQL:1999でオブジェクト指向機能、WITH句（CTE）、トリガーが追加  |
| 2003 | SQL:2003でWindow関数、XML対応が追加                            |
| 2011 | SQL:2011で時間軸データ（テンポラルデータ）が追加               |
| 2016 | SQL:2016でJSON対応が標準化                                     |
| 2023 | SQL:2023でJSON改善、プロパティグラフクエリが追加               |

50年以上の歴史があり、今も進化を続けている言語だ。

## SQL vs プログラミング言語

| 比較項目     | SQL                              | プログラミング言語（JavaScript等） |
| ------------ | -------------------------------- | ---------------------------------- |
| パラダイム   | 宣言的（何がほしいかを書く）     | 手続き的（どうやるかを書く）       |
| 実行の最適化 | データベースエンジンが自動最適化 | プログラマが自分で最適化する       |
| 対象         | データの操作に特化               | 汎用的な処理                       |
| 変数         | なし（セット指向）               | あり                               |
| ループ       | なし（集合演算で表現）           | for, while等                       |
| 型           | テーブル定義時に指定             | 変数宣言時に指定（または推論）     |

```javascript
// JavaScript: 手続き的にフィルタリング
const result = []
for (const user of users) {
  if (user.age >= 25) {
    result.push(user)
  }
}

// SQL: 宣言的にフィルタリング
// SELECT * FROM users WHERE age >= 25;
```

SQLは「データの操作」に特化した言語なので、データベースとのやり取りにはSQLを使い、それ以外のロジック（画面表示、API処理など）にはプログラミング言語を使う。

## SQLの分類

SQLは大きく以下の4つに分類される。

| 分類 | 正式名称                     | 役割                   | 主なコマンド                   |
| ---- | ---------------------------- | ---------------------- | ------------------------------ |
| DDL  | Data Definition Language     | データ構造の定義       | CREATE, ALTER, DROP, TRUNCATE  |
| DML  | Data Manipulation Language   | データの操作           | SELECT, INSERT, UPDATE, DELETE |
| DCL  | Data Control Language        | 権限の管理             | GRANT, REVOKE                  |
| TCL  | Transaction Control Language | トランザクションの制御 | BEGIN, COMMIT, ROLLBACK        |

初心者はまずDDLとDMLを覚えれば、ほとんどの作業ができる。

## DDL（Data Definition Language） - テーブルの定義

### CREATE TABLE - テーブルの作成

```sql
-- 基本構文
CREATE TABLE テーブル名 (
    カラム名 データ型 [制約],
    カラム名 データ型 [制約],
    ...
);

-- 実例: ユーザーテーブル
CREATE TABLE users (
    id SERIAL PRIMARY KEY,              -- 自動採番の主キー
    name VARCHAR(100) NOT NULL,         -- 最大100文字、NULL不可
    email VARCHAR(255) UNIQUE NOT NULL, -- ユニーク制約 + NULL不可
    age INTEGER CHECK (age >= 0),       -- 0以上の整数
    is_active BOOLEAN DEFAULT true,     -- デフォルト値あり
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 実例: 注文テーブル（外部キーあり）
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),  -- 外部キー
    item VARCHAR(200) NOT NULL,
    price INTEGER NOT NULL CHECK (price > 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- データベースの作成
CREATE DATABASE my_app;

-- テーブルが存在しない場合のみ作成
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);
```

### ALTER TABLE - テーブルの変更

```sql
-- カラムの追加
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- カラムの削除
ALTER TABLE users DROP COLUMN phone;

-- カラムのデータ型を変更
ALTER TABLE users ALTER COLUMN name TYPE VARCHAR(200);

-- カラム名の変更
ALTER TABLE users RENAME COLUMN name TO full_name;

-- NOT NULL制約の追加
ALTER TABLE users ALTER COLUMN name SET NOT NULL;

-- NOT NULL制約の削除
ALTER TABLE users ALTER COLUMN name DROP NOT NULL;

-- デフォルト値の設定
ALTER TABLE users ALTER COLUMN is_active SET DEFAULT true;

-- CHECK制約の追加
ALTER TABLE users ADD CONSTRAINT age_check CHECK (age >= 0 AND age <= 150);

-- ユニーク制約の追加
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);

-- テーブル名の変更
ALTER TABLE users RENAME TO members;
```

### DROP TABLE - テーブルの削除

```sql
-- テーブルの削除
DROP TABLE orders;

-- 存在する場合のみ削除（エラーを防ぐ）
DROP TABLE IF EXISTS orders;

-- 依存関係も含めて削除（外部キーで参照しているテーブルがある場合）
DROP TABLE users CASCADE;
```

### TRUNCATE - データの全削除

```sql
-- テーブルのデータを全て削除（構造は残る）
TRUNCATE TABLE users;

-- DELETEとの違い:
-- DELETE FROM users;    → 1行ずつ削除（遅い、WHERE句が使える、ロールバック可能）
-- TRUNCATE TABLE users; → 一括削除（高速、WHERE句は使えない）
```

## DML（Data Manipulation Language） - データの操作

### INSERT - データの挿入

```sql
-- 基本構文
INSERT INTO テーブル名 (カラム1, カラム2, ...) VALUES (値1, 値2, ...);

-- 1行の挿入
INSERT INTO users (name, email, age)
VALUES ('田中太郎', 'taro@example.com', 25);

-- 複数行の挿入
INSERT INTO users (name, email, age)
VALUES
    ('佐藤花子', 'hanako@example.com', 28),
    ('鈴木次郎', 'jiro@example.com', 32),
    ('高橋美咲', 'misaki@example.com', 22);

-- 全カラムに値を入れる場合（カラム名省略可、ただし非推奨）
INSERT INTO users VALUES (5, '山田一郎', 'ichiro@example.com', 30, true, CURRENT_TIMESTAMP);

-- 挿入した行を返す（PostgreSQL固有だがSQL標準でも規定されている）
INSERT INTO users (name, email, age)
VALUES ('田中太郎', 'taro@example.com', 25)
RETURNING *;

-- SELECTの結果を挿入
INSERT INTO archived_users (name, email, age)
SELECT name, email, age FROM users WHERE is_active = false;
```

### SELECT - データの取得

```sql
-- 全カラムの取得
SELECT * FROM users;

-- 特定のカラムだけ取得
SELECT name, email FROM users;

-- 別名（エイリアス）を付ける
SELECT
    name AS "名前",
    email AS "メールアドレス",
    age AS "年齢"
FROM users;

-- 計算結果を表示
SELECT
    name,
    price,
    quantity,
    price * quantity AS total
FROM orders;
```

### UPDATE - データの更新

```sql
-- 基本構文
UPDATE テーブル名 SET カラム = 値 WHERE 条件;

-- 1行の更新
UPDATE users SET age = 26 WHERE id = 1;

-- 複数カラムの更新
UPDATE users
SET name = '田中一郎', age = 30, is_active = false
WHERE id = 1;

-- 計算による更新
UPDATE products SET price = price * 1.1 WHERE category = 'food';

-- 全行の更新（WHERE句なし - 危険なので注意）
UPDATE users SET is_active = false;
-- → 全ユーザーが無効になる！本番では必ずWHERE句をつける
```

### DELETE - データの削除

```sql
-- 基本構文
DELETE FROM テーブル名 WHERE 条件;

-- 条件に合致する行を削除
DELETE FROM users WHERE id = 5;

-- 複数条件での削除
DELETE FROM users WHERE is_active = false AND created_at < '2024-01-01';

-- 全行の削除（WHERE句なし - 非常に危険）
DELETE FROM users;
-- → 全データが消える！本番では絶対にWHERE句をつける

-- サブクエリを使った削除
DELETE FROM orders
WHERE user_id IN (SELECT id FROM users WHERE is_active = false);
```

## データ型の基本

SQLで使える主要なデータ型を整理する。データベース製品によって多少の違いはあるが、基本的な型は共通している。

### 数値型

| データ型         | 説明                 | 値の範囲 / 精度             | 用途                     |
| ---------------- | -------------------- | --------------------------- | ------------------------ |
| INTEGER (INT)    | 整数                 | -21億 ~ 21億（4バイト）     | ID、年齢、個数           |
| SMALLINT         | 小さい整数           | -32,768 ~ 32,767（2バイト） | ステータスコード         |
| BIGINT           | 大きい整数           | -922京 ~ 922京（8バイト）   | 大きなID、金額（分単位） |
| DECIMAL(p,s)     | 固定小数点数         | 任意精度                    | 金額（正確な計算が必要） |
| NUMERIC(p,s)     | DECIMALと同じ        | 任意精度                    | 金額（正確な計算が必要） |
| REAL             | 浮動小数点（単精度） | 6桁精度（4バイト）          | 近似値でよい場合         |
| DOUBLE PRECISION | 浮動小数点（倍精度） | 15桁精度（8バイト）         | 科学計算                 |

```sql
-- 金額にはDECIMALを使う（REALやDOUBLE PRECISIONは誤差が出る）
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10, 2)  -- 10桁のうち小数点以下2桁（例: 12345678.99）
);
```

### 文字列型

| データ型   | 説明                    | 用途                         |
| ---------- | ----------------------- | ---------------------------- |
| VARCHAR(n) | 最大n文字の可変長文字列 | 名前、メールアドレス         |
| CHAR(n)    | 固定長n文字             | 国コード（JP, US）、郵便番号 |
| TEXT       | 長さ制限なしの文字列    | 本文、説明文、コメント       |

```sql
CREATE TABLE articles (
    id INTEGER PRIMARY KEY,
    title VARCHAR(200) NOT NULL,    -- タイトル（最大200文字）
    slug CHAR(50),                  -- URL用のスラグ（固定長）
    body TEXT NOT NULL               -- 記事本文（長さ制限なし）
);
```

### 論理型

| データ型 | 説明   | 値           |
| -------- | ------ | ------------ |
| BOOLEAN  | 真偽値 | TRUE / FALSE |

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE
);
```

### 日付・時刻型

| データ型  | 説明        | 例                       |
| --------- | ----------- | ------------------------ |
| DATE      | 日付のみ    | '2024-03-28'             |
| TIME      | 時刻のみ    | '14:30:00'               |
| TIMESTAMP | 日付 + 時刻 | '2024-03-28 14:30:00'    |
| INTERVAL  | 時間の間隔  | '1 year 2 months 3 days' |

```sql
CREATE TABLE events (
    id INTEGER PRIMARY KEY,
    title VARCHAR(200),
    event_date DATE,
    start_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 日付の計算
SELECT CURRENT_DATE + INTERVAL '7 days';     -- 7日後
SELECT CURRENT_TIMESTAMP - INTERVAL '1 hour'; -- 1時間前
```

## 制約（Constraints）

制約とは、テーブルに不正なデータが入るのを防ぐルール。データの品質を保証する。

### 各制約の一覧と解説

| 制約        | 説明                                         | 例                                     |
| ----------- | -------------------------------------------- | -------------------------------------- |
| PRIMARY KEY | 主キー（各行を一意に識別、NULLを許可しない） | `id INTEGER PRIMARY KEY`               |
| FOREIGN KEY | 外部キー（他テーブルとの参照整合性）         | `user_id INTEGER REFERENCES users(id)` |
| UNIQUE      | 値の重複を許可しない                         | `email VARCHAR(255) UNIQUE`            |
| NOT NULL    | NULLを許可しない                             | `name VARCHAR(100) NOT NULL`           |
| CHECK       | 条件を満たす値のみ許可                       | `age INTEGER CHECK (age >= 0)`         |
| DEFAULT     | 値が指定されなかった場合のデフォルト値       | `is_active BOOLEAN DEFAULT TRUE`       |

### 制約の実例

```sql
CREATE TABLE employees (
    -- PRIMARY KEY: 主キー
    id INTEGER PRIMARY KEY,

    -- NOT NULL: NULLを許可しない
    name VARCHAR(100) NOT NULL,

    -- UNIQUE: 重複不可
    employee_code VARCHAR(10) UNIQUE NOT NULL,

    -- CHECK: 条件付き
    age INTEGER CHECK (age >= 18 AND age <= 65),
    salary DECIMAL(10, 2) CHECK (salary > 0),

    -- DEFAULT: デフォルト値
    department VARCHAR(50) DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    hired_at DATE DEFAULT CURRENT_DATE,

    -- FOREIGN KEY: 外部キー
    manager_id INTEGER REFERENCES employees(id)
);

-- 複合主キー（2つ以上のカラムで主キーを構成）
CREATE TABLE order_items (
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (order_id, product_id)  -- 複合主キー
);

-- 複合ユニーク制約
CREATE TABLE enrollments (
    student_id INTEGER REFERENCES students(id),
    course_id INTEGER REFERENCES courses(id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, course_id)  -- 同じ学生が同じコースに2回登録できない
);
```

### 外部キーのON DELETE / ON UPDATE

参照先のデータが削除・更新されたときの動作を指定する。

| オプション  | 説明                                        |
| ----------- | ------------------------------------------- |
| CASCADE     | 参照先の操作に追従（削除/更新も連動）       |
| SET NULL    | 参照先が削除/更新されたらNULLに設定         |
| SET DEFAULT | 参照先が削除/更新されたらデフォルト値に設定 |
| RESTRICT    | 参照されている場合は削除/更新を拒否         |
| NO ACTION   | RESTRICTと同じ（デフォルト）                |

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id)
        ON DELETE CASCADE      -- ユーザーが削除されたら注文も削除
        ON UPDATE CASCADE,     -- ユーザーIDが変更されたら追従
    item VARCHAR(200) NOT NULL
);
```

## SELECT詳細

SELECT文は最も頻繁に使うSQL。さまざまな条件指定を理解しよう。

### WHERE句（条件指定）

```sql
-- 比較演算子
SELECT * FROM users WHERE age = 25;       -- 等しい
SELECT * FROM users WHERE age != 25;      -- 等しくない（<>でも可）
SELECT * FROM users WHERE age > 25;       -- より大きい
SELECT * FROM users WHERE age >= 25;      -- 以上
SELECT * FROM users WHERE age < 25;       -- より小さい
SELECT * FROM users WHERE age <= 25;      -- 以下
```

### AND / OR / NOT

```sql
-- AND: 全ての条件を満たす
SELECT * FROM users WHERE age >= 20 AND is_active = TRUE;

-- OR: いずれかの条件を満たす
SELECT * FROM users WHERE age < 20 OR age > 60;

-- NOT: 条件の否定
SELECT * FROM users WHERE NOT (age >= 25);

-- 組み合わせ（カッコで優先順位を明確にする）
SELECT * FROM users
WHERE (age >= 20 AND age <= 30) OR role = 'admin';
```

### IN（リストの中に含まれるか）

```sql
-- IN: リストの中のいずれかに一致
SELECT * FROM users WHERE role IN ('admin', 'moderator');

-- NOT IN: リストの中のいずれにも一致しない
SELECT * FROM users WHERE role NOT IN ('admin', 'moderator');

-- サブクエリと組み合わせ
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders WHERE price > 10000);
```

### BETWEEN（範囲指定）

```sql
-- BETWEEN: 指定範囲内（境界値を含む）
SELECT * FROM users WHERE age BETWEEN 20 AND 30;
-- 上記は以下と同じ
-- SELECT * FROM users WHERE age >= 20 AND age <= 30;

-- 日付の範囲指定
SELECT * FROM orders
WHERE ordered_at BETWEEN '2024-01-01' AND '2024-12-31';
```

### LIKE（パターンマッチング）

```sql
-- %: 任意の文字列（0文字以上）
SELECT * FROM users WHERE name LIKE '田中%';     -- 前方一致（田中で始まる）
SELECT * FROM users WHERE name LIKE '%太郎';     -- 後方一致（太郎で終わる）
SELECT * FROM users WHERE name LIKE '%中%';      -- 部分一致（中を含む）

-- _: 任意の1文字
SELECT * FROM users WHERE name LIKE '田_太郎';   -- 田○太郎

-- ILIKE: 大文字小文字を区別しない（PostgreSQL固有）
SELECT * FROM users WHERE email ILIKE '%example%';
```

### IS NULL / IS NOT NULL

```sql
-- NULLの判定（=では判定できない）
SELECT * FROM users WHERE phone IS NULL;
SELECT * FROM users WHERE phone IS NOT NULL;

-- 注意: 以下は期待通りに動作しない
-- SELECT * FROM users WHERE phone = NULL;  -- 常にFALSEになる
```

### ORDER BY（ソート）

```sql
-- 昇順（デフォルト）
SELECT * FROM users ORDER BY age ASC;

-- 降順
SELECT * FROM users ORDER BY age DESC;

-- 複数カラムでソート
SELECT * FROM users ORDER BY age DESC, name ASC;

-- NULLの位置を指定
SELECT * FROM users ORDER BY age ASC NULLS LAST;   -- NULLを最後に
SELECT * FROM users ORDER BY age ASC NULLS FIRST;  -- NULLを最初に
```

### LIMIT / OFFSET（結果の制限）

```sql
-- 最初の10件を取得
SELECT * FROM users ORDER BY id LIMIT 10;

-- 11件目から10件を取得（ページネーション）
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 10;

-- ページネーションの考え方
-- ページ1: LIMIT 10 OFFSET 0   (1-10件目)
-- ページ2: LIMIT 10 OFFSET 10  (11-20件目)
-- ページ3: LIMIT 10 OFFSET 20  (21-30件目)
-- ページN: LIMIT 10 OFFSET (N-1)*10
```

### DISTINCT（重複排除）

```sql
-- 重複なしの値一覧
SELECT DISTINCT city FROM users;

-- 複数カラムの組み合わせで重複排除
SELECT DISTINCT city, role FROM users;
```

### AS（別名 / エイリアス）

```sql
-- カラムに別名を付ける
SELECT
    name AS "名前",
    age AS "年齢",
    age * 12 AS "月齢"
FROM users;

-- テーブルに別名を付ける（JOINで頻繁に使う）
SELECT u.name, o.item
FROM users AS u
JOIN orders AS o ON u.id = o.user_id;

-- ASは省略可能
SELECT u.name, o.item
FROM users u
JOIN orders o ON u.id = o.user_id;
```

## 集約関数

集約関数は、複数の行から1つの値を計算する関数。

### 基本的な集約関数

```sql
-- COUNT: 行数を数える
SELECT COUNT(*) FROM users;                    -- 全行数
SELECT COUNT(email) FROM users;                -- NULLでない行数
SELECT COUNT(DISTINCT city) FROM users;        -- ユニークな値の数

-- SUM: 合計
SELECT SUM(price) FROM orders;

-- AVG: 平均
SELECT AVG(age) FROM users;

-- MAX: 最大値
SELECT MAX(age) FROM users;

-- MIN: 最小値
SELECT MIN(price) FROM orders;
```

### GROUP BY（グループ化）

```sql
-- 都市別のユーザー数
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

-- 月別の売上集計
SELECT
    DATE_TRUNC('month', ordered_at) AS month,
    COUNT(*) AS order_count,
    SUM(price * quantity) AS total_sales,
    AVG(price) AS avg_price
FROM orders
GROUP BY DATE_TRUNC('month', ordered_at)
ORDER BY month;
```

### HAVING（グループに対する条件）

```sql
-- 50人以上いる都市だけを表示
SELECT city, COUNT(*) AS user_count
FROM users
GROUP BY city
HAVING COUNT(*) >= 50
ORDER BY user_count DESC;

-- WHEREとHAVINGの違い:
-- WHERE  → グループ化の前に行をフィルタリング
-- HAVING → グループ化の後にグループをフィルタリング

-- 例: アクティブユーザーが100人以上いる都市
SELECT city, COUNT(*) AS active_count
FROM users
WHERE is_active = TRUE           -- まず行をフィルタ
GROUP BY city
HAVING COUNT(*) >= 100           -- 次にグループをフィルタ
ORDER BY active_count DESC;
```

## JOIN全種類

JOINは複数のテーブルを結合してデータを取得する。RDBの最も重要な機能の1つ。

### サンプルデータ

以降の例では、以下のデータを使う。

```sql
-- テーブルとデータの準備
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    item VARCHAR(100),
    price INTEGER
);

INSERT INTO users VALUES (1, '太郎'), (2, '花子'), (3, '次郎');
INSERT INTO orders VALUES (1, 1, '本', 1500), (2, 1, 'ペン', 200),
                          (3, 2, 'ノート', 300), (4, NULL, 'キーボード', 5000);
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

概念図:
  users         orders
 +------+    +----------+
 | 太郎 |----| 本       |  ← 一致するものだけ
 | 太郎 |----| ペン     |
 | 花子 |----| ノート   |
 | 次郎 |    |          |  ← 次郎は注文がないので除外
 +------+    | キーボード|  ← user_idがNULLなので除外
             +----------+
```

### LEFT JOIN（左外部結合）

左テーブルの全行を取得し、右テーブルに一致がない場合はNULLになる。最もよく使うJOIN。

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
 次郎 | NULL   | NULL    ← 注文がなくてもNULLで表示

概念図:
  users         orders
 +------+    +----------+
 | 太郎 |----| 本       |
 | 太郎 |----| ペン     |
 | 花子 |----| ノート   |
 | 次郎 |----| NULL     |  ← 左テーブルの全行を保持
 +------+    +----------+
```

### RIGHT JOIN（右外部結合）

右テーブルの全行を取得する。LEFT JOINの逆。実務ではLEFT JOINで代用できるため、あまり使われない。

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
 次郎 | NULL       | NULL    ← 注文がないユーザー
 NULL | キーボード | 5000    ← ユーザー不明の注文

概念図:
  users         orders
 +------+    +----------+
 | 太郎 |----| 本       |
 | 太郎 |----| ペン     |
 | 花子 |----| ノート   |
 | 次郎 |----| NULL     |  ← 左のみ
 | NULL |----| キーボード|  ← 右のみ
 +------+    +----------+
```

### CROSS JOIN（交差結合）

全ての組み合わせを生成する。結果の行数は「テーブルA x テーブルB」。

```sql
SELECT u.name, o.item
FROM users u
CROSS JOIN orders o;
-- 3ユーザー x 4注文 = 12行
```

用途は限定的だが、日付のカレンダー生成やテストデータ作成に使うことがある。

### SELF JOIN（自己結合）

同じテーブルを自分自身と結合する。階層構造を表現する際に使う。

```sql
-- 社員テーブル
CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    manager_id INTEGER REFERENCES employees(id)
);

-- 社員と上司の名前を表示
SELECT
    e.name AS "社員名",
    m.name AS "上司名"
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

### JOINの使い分け早見表

| JOIN種類        | いつ使う                                      | 頻度     |
| --------------- | --------------------------------------------- | -------- |
| INNER JOIN      | 両方にデータがある場合のみ必要                | よく使う |
| LEFT JOIN       | 左テーブルの全行が必要（最も汎用的）          | 最も多い |
| RIGHT JOIN      | 右テーブルの全行が必要（LEFT JOINで代用可能） | まれ     |
| FULL OUTER JOIN | 両テーブルの全データを確認したい              | まれ     |
| CROSS JOIN      | 全組み合わせが必要                            | まれ     |
| SELF JOIN       | 階層構造、自己参照のデータ                    | 時々     |

## サブクエリ

クエリの中にクエリを入れることができる。これをサブクエリ（副問い合わせ）と呼ぶ。

### WHERE INサブクエリ

```sql
-- 注文したことがあるユーザーを取得
SELECT * FROM users
WHERE id IN (SELECT DISTINCT user_id FROM orders WHERE user_id IS NOT NULL);
```

### EXISTSサブクエリ

```sql
-- 注文が存在するユーザー（大量データではINより効率的な場合が多い）
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- 注文がないユーザー
SELECT * FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);
```

### スカラサブクエリ

1つの値を返すサブクエリ。SELECT句やWHERE句で使える。

```sql
-- 全体平均との差を表示
SELECT
    name,
    age,
    age - (SELECT AVG(age) FROM users) AS "平均との差"
FROM users;

-- 平均より高い注文を取得
SELECT * FROM orders
WHERE price > (SELECT AVG(price) FROM orders);
```

### 相関サブクエリ

外側のクエリの値を参照するサブクエリ。行ごとにサブクエリが実行される。

```sql
-- 各ユーザーの最新注文を取得
SELECT * FROM orders o1
WHERE ordered_at = (
    SELECT MAX(ordered_at)
    FROM orders o2
    WHERE o2.user_id = o1.user_id  -- 外側のo1を参照
);
```

### FROM句のサブクエリ（派生テーブル）

```sql
-- 都市別のユーザー数を求め、10人以上の都市を表示
SELECT city, user_count
FROM (
    SELECT city, COUNT(*) AS user_count
    FROM users
    GROUP BY city
) AS city_stats
WHERE user_count >= 10;
```

## UNION / INTERSECT / EXCEPT

複数のSELECT結果を組み合わせる集合演算。

```sql
-- UNION: 和集合（重複を除外）
SELECT name FROM users_a
UNION
SELECT name FROM users_b;

-- UNION ALL: 和集合（重複を含む、高速）
SELECT name FROM users_a
UNION ALL
SELECT name FROM users_b;

-- INTERSECT: 積集合（両方に存在するもの）
SELECT email FROM users
INTERSECT
SELECT email FROM subscribers;

-- EXCEPT: 差集合（左にあって右にないもの）
SELECT email FROM users
EXCEPT
SELECT email FROM unsubscribed;
```

**注意**: UNION/INTERSECT/EXCEPTを使うには、両方のSELECTのカラム数とデータ型が一致している必要がある。

## ビュー（VIEW）

ビューは、SELECT文に名前を付けて保存したもの。仮想的なテーブルとして使える。

```sql
-- ビューの作成
CREATE VIEW active_users AS
SELECT id, name, email, role
FROM users
WHERE is_active = TRUE;

-- ビューの使用（通常のテーブルと同じように使える）
SELECT * FROM active_users WHERE role = 'admin';

-- ビューの更新
CREATE OR REPLACE VIEW active_users AS
SELECT id, name, email, role, created_at
FROM users
WHERE is_active = TRUE;

-- ビューの削除
DROP VIEW active_users;
DROP VIEW IF EXISTS active_users;
```

### ビューの用途と利点

| 利点                 | 説明                                                 |
| -------------------- | ---------------------------------------------------- |
| 複雑なクエリの簡略化 | 長いJOINやサブクエリを名前付きで保存できる           |
| セキュリティ         | 特定のカラムだけを公開し、機密情報を隠せる           |
| 一貫性               | 同じクエリを複数箇所で使う場合に定義を一元管理できる |
| 抽象化               | テーブル構造の変更をビューで吸収できる               |

## インデックス

インデックスは、検索を高速化する仕組み。本の索引と同じ原理。

```sql
-- 基本的なインデックスの作成
CREATE INDEX idx_users_email ON users (email);

-- ユニークインデックス
CREATE UNIQUE INDEX idx_users_email_unique ON users (email);

-- 複合インデックス（複数カラム）
CREATE INDEX idx_orders_user_date ON orders (user_id, ordered_at);

-- インデックスの削除
DROP INDEX idx_users_email;
```

### いつインデックスを作るか

| 作るべき場合               | 作らない方がよい場合                 |
| -------------------------- | ------------------------------------ |
| WHERE句で頻繁に使うカラム  | テーブルが小さい（数百行以下）       |
| JOINの結合条件に使うカラム | INSERT/UPDATEが非常に多いカラム      |
| ORDER BYに使うカラム       | 値の種類が少ないカラム（true/false） |
| 外部キーのカラム           | ほとんど検索に使わないカラム         |

## トランザクション

トランザクションとは、複数のSQL操作を1つのまとまりとして扱う仕組み。

```sql
-- トランザクションの基本
BEGIN;                      -- トランザクション開始
INSERT INTO users (name, email) VALUES ('太郎', 'taro@example.com');
INSERT INTO user_profiles (user_id, location) VALUES (1, '東京');
COMMIT;                     -- 成功したら確定

-- エラー時のロールバック
BEGIN;
UPDATE accounts SET balance = balance - 10000 WHERE user_id = 1;
UPDATE accounts SET balance = balance + 10000 WHERE user_id = 2;
-- エラーが発生した場合
ROLLBACK;                   -- 全ての変更を取り消し

-- SAVEPOINT（部分的なロールバック）
BEGIN;
INSERT INTO orders (user_id, item, price) VALUES (1, '本', 1500);
SAVEPOINT sp1;
INSERT INTO orders (user_id, item, price) VALUES (1, 'ペン', -100);  -- CHECK制約違反
ROLLBACK TO sp1;            -- SAVEPOINTまで戻す（本の挿入は残る）
COMMIT;                     -- 本の挿入だけが確定
```

## SQLアンチパターン

実務でよく見かける、避けるべきSQLの書き方を10個紹介する。

### 1. SELECT \*（全カラム取得）

```sql
-- 悪い例
SELECT * FROM users;

-- 良い例（必要なカラムだけ指定）
SELECT id, name, email FROM users;

-- 理由:
-- ・不要なデータを転送するため、ネットワーク帯域を無駄に消費する
-- ・テーブルにカラムが追加されると、予期しないデータが返る
-- ・インデックスオンリースキャンが使えなくなる場合がある
```

### 2. N+1問題

```sql
-- 悪い例: ユーザー一覧を取得し、各ユーザーの注文を個別に取得
SELECT * FROM users;  -- 1回目のクエリ
-- ユーザーごとにループ
SELECT * FROM orders WHERE user_id = 1;  -- 2回目
SELECT * FROM orders WHERE user_id = 2;  -- 3回目
SELECT * FROM orders WHERE user_id = 3;  -- 4回目
-- ...N回のクエリ

-- 良い例: JOINで一括取得
SELECT u.name, o.item, o.price
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
-- → 1回のクエリで完了
```

### 3. インデックスなしのWHERE句

```sql
-- 悪い例: 頻繁に検索するカラムにインデックスがない
SELECT * FROM users WHERE email = 'taro@example.com';
-- → 100万行を全件スキャン

-- 良い例: インデックスを作成する
CREATE INDEX idx_users_email ON users (email);
SELECT * FROM users WHERE email = 'taro@example.com';
-- → インデックスで高速検索
```

### 4. 文字列結合によるSQL組み立て（SQLインジェクション）

```javascript
// 悪い例（絶対にやってはいけない）
const query = `SELECT * FROM users WHERE name = '${userInput}'`
// userInputに「' OR '1'='1」と入力されると全データが漏洩する

// 良い例（パラメータバインディング）
const query = 'SELECT * FROM users WHERE name = $1'
const result = await pool.query(query, [userInput])
```

### 5. 不要なサブクエリ

```sql
-- 悪い例: JOINで書けるのにサブクエリを使う
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders);

-- 良い例: JOINを使う（多くの場合こちらが高速）
SELECT DISTINCT u.*
FROM users u
JOIN orders o ON u.id = o.user_id;
```

### 6. WHERE句での関数使用

```sql
-- 悪い例: カラムに関数を適用するとインデックスが使えない
SELECT * FROM users WHERE LOWER(email) = 'taro@example.com';

-- 良い例: 式インデックスを作るか、データを正規化して保存する
CREATE INDEX idx_users_email_lower ON users (LOWER(email));
SELECT * FROM users WHERE LOWER(email) = 'taro@example.com';
```

### 7. 暗黙的な型変換

```sql
-- 悪い例: 文字列型のカラムに数値を指定
SELECT * FROM users WHERE phone = 09012345678;
-- → 暗黙的な型変換が発生し、インデックスが使えない場合がある

-- 良い例: 正しい型で指定
SELECT * FROM users WHERE phone = '09012345678';
```

### 8. OFFSETによる大量ページングの使用

```sql
-- 悪い例: 大きなOFFSETは遅い
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 100000;
-- → 100,020行を読んで先頭100,000行を捨てる

-- 良い例: カーソルベースのページネーション
SELECT * FROM users WHERE id > 100000 ORDER BY id LIMIT 20;
-- → インデックスを使って直接100,001行目から取得
```

### 9. NULL比較の間違い

```sql
-- 悪い例: NULLを=で比較（常にFALSEになる）
SELECT * FROM users WHERE phone = NULL;

-- 良い例: IS NULLを使う
SELECT * FROM users WHERE phone IS NULL;
```

### 10. トランザクションの長時間保持

```sql
-- 悪い例: トランザクション内で長い処理を行う
BEGIN;
SELECT * FROM users;  -- ロック取得
-- ここで外部APIの呼び出しやファイル処理など長い処理
-- ...数秒～数分間ロックを保持
UPDATE users SET name = '更新' WHERE id = 1;
COMMIT;

-- 良い例: トランザクションは最小限に
-- 外部APIの呼び出しはトランザクションの外で行う
-- APIレスポンスを取得
BEGIN;
UPDATE users SET name = '更新' WHERE id = 1;
COMMIT;  -- すぐにロック解放
```

## SQLの実行順序

SQLの文は**書く順序と実行される順序が異なる**。デバッグの際に非常に重要な知識。

### 書く順序 vs 実行順序

```
書く順序:                  実行順序:
1. SELECT                  1. FROM        ← まずテーブルを決定
2. FROM                    2. JOIN        ← テーブルを結合
3. JOIN                    3. WHERE       ← 行をフィルタリング
4. WHERE                   4. GROUP BY    ← グループ化
5. GROUP BY                5. HAVING      ← グループをフィルタリング
6. HAVING                  6. SELECT      ← カラムを選択
7. ORDER BY                7. DISTINCT    ← 重複を排除
8. LIMIT / OFFSET          8. ORDER BY    ← ソート
                           9. LIMIT/OFFSET← 結果を制限
```

### 実行順序の図解

```
FROM users                      ← 1. usersテーブルを読み込む
  |
  v
JOIN orders ON ...              ← 2. ordersテーブルと結合
  |
  v
WHERE age >= 20                 ← 3. 条件に合う行だけ残す
  |
  v
GROUP BY city                   ← 4. cityでグループ化
  |
  v
HAVING COUNT(*) >= 10           ← 5. 10人以上のグループだけ残す
  |
  v
SELECT city, COUNT(*) AS cnt    ← 6. 表示するカラムを選択
  |
  v
DISTINCT                        ← 7. 重複を排除
  |
  v
ORDER BY cnt DESC               ← 8. cntで降順ソート
  |
  v
LIMIT 10                        ← 9. 先頭10件だけ返す
```

### 実行順序を理解すると分かること

```sql
-- なぜWHERE句でSELECTの別名を使えないのか
SELECT name, age * 12 AS age_months
FROM users
WHERE age_months > 300;  -- エラー！WHEREはSELECTより先に実行されるため

-- 正しい書き方
SELECT name, age * 12 AS age_months
FROM users
WHERE age * 12 > 300;  -- 元の式を使う

-- またはHAVINGで代用（GROUP BYが必要だが）

-- なぜORDER BY句ではSELECTの別名を使えるのか
SELECT name, age * 12 AS age_months
FROM users
ORDER BY age_months;  -- OK! ORDER BYはSELECTの後に実行されるため
```

## 実践課題

以下のテーブルを使って、クエリ問題に挑戦してみよう。

### テーブル定義

```sql
-- 学生テーブル
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 4),  -- 学年
    department VARCHAR(50) NOT NULL                          -- 学部
);

-- 科目テーブル
CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    credits INTEGER NOT NULL CHECK (credits > 0),  -- 単位数
    instructor VARCHAR(100) NOT NULL                -- 担当教員
);

-- 履修テーブル
CREATE TABLE enrollments (
    student_id INTEGER REFERENCES students(id),
    course_id INTEGER REFERENCES courses(id),
    score INTEGER CHECK (score BETWEEN 0 AND 100),  -- 点数
    PRIMARY KEY (student_id, course_id)
);

-- サンプルデータ
INSERT INTO students VALUES
    (1, '田中太郎', 2, '工学部'),
    (2, '佐藤花子', 3, '理学部'),
    (3, '鈴木次郎', 2, '工学部'),
    (4, '高橋美咲', 1, '文学部'),
    (5, '山田一郎', 4, '工学部');

INSERT INTO courses VALUES
    (1, 'データベース基礎', 2, '木村教授'),
    (2, 'プログラミング入門', 2, '田村教授'),
    (3, '線形代数', 3, '木村教授'),
    (4, '英語I', 2, '佐々木教授');

INSERT INTO enrollments VALUES
    (1, 1, 85), (1, 2, 92), (1, 3, 78),
    (2, 1, 90), (2, 3, 95),
    (3, 2, 70), (3, 4, 88),
    (4, 4, 65),
    (5, 1, 55), (5, 2, 80), (5, 3, 72), (5, 4, 90);
```

### 問題

**問題1**: 工学部の学生全員の名前と学年を表示せよ。

```sql
-- ヒント: WHERE句でdepartmentをフィルタリング
```

<details>
<summary>解答を見る</summary>

```sql
SELECT name, grade
FROM students
WHERE department = '工学部'
ORDER BY grade;
```

</details>

**問題2**: 各科目の平均点を求め、平均点が高い順に表示せよ。

```sql
-- ヒント: GROUP BY + AVG + ORDER BY
```

<details>
<summary>解答を見る</summary>

```sql
SELECT
    c.title AS "科目名",
    ROUND(AVG(e.score), 1) AS "平均点",
    COUNT(e.student_id) AS "履修者数"
FROM courses c
JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id, c.title
ORDER BY AVG(e.score) DESC;
```

</details>

**問題3**: 科目を1つも履修していない学生の名前を表示せよ。

```sql
-- ヒント: LEFT JOINまたはNOT EXISTS
```

<details>
<summary>解答を見る</summary>

```sql
-- 方法1: LEFT JOIN + IS NULL
SELECT s.name
FROM students s
LEFT JOIN enrollments e ON s.id = e.student_id
WHERE e.student_id IS NULL;

-- 方法2: NOT EXISTS
SELECT s.name
FROM students s
WHERE NOT EXISTS (
    SELECT 1 FROM enrollments e WHERE e.student_id = s.id
);
```

</details>

**問題4**: 学生ごとの合計単位数を計算し、6単位以上取得している学生を表示せよ。

```sql
-- ヒント: JOIN + GROUP BY + HAVING + SUM
```

<details>
<summary>解答を見る</summary>

```sql
SELECT
    s.name AS "学生名",
    SUM(c.credits) AS "合計単位数"
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN courses c ON e.course_id = c.id
GROUP BY s.id, s.name
HAVING SUM(c.credits) >= 6
ORDER BY SUM(c.credits) DESC;
```

</details>

**問題5**: 木村教授が担当する科目を履修している学生の名前と科目名、点数を表示せよ。点数が80点以上の行だけ表示し、点数の高い順にソートすること。

```sql
-- ヒント: 3テーブルのJOIN + WHERE + ORDER BY
```

<details>
<summary>解答を見る</summary>

```sql
SELECT
    s.name AS "学生名",
    c.title AS "科目名",
    e.score AS "点数"
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN courses c ON e.course_id = c.id
WHERE c.instructor = '木村教授'
  AND e.score >= 80
ORDER BY e.score DESC;
```

</details>

## まとめ

| 概念             | ポイント                                                            |
| ---------------- | ------------------------------------------------------------------- |
| SQLとは          | データベースを操作する宣言的言語（何がほしいかを書く）              |
| DDL              | テーブルの作成・変更・削除（CREATE, ALTER, DROP）                   |
| DML              | データの操作（SELECT, INSERT, UPDATE, DELETE）                      |
| データ型         | 数値、文字列、日付、論理型を適切に使い分ける                        |
| 制約             | PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECKでデータ品質を保証 |
| JOIN             | INNER, LEFT, RIGHT, FULL OUTER, CROSS, SELFの6種類                  |
| 集約関数         | COUNT, SUM, AVG, MAX, MINとGROUP BY/HAVINGの組み合わせ              |
| サブクエリ       | IN, EXISTS, スカラ、相関の4種類                                     |
| ビュー           | SELECT文を名前付きで保存し再利用する                                |
| トランザクション | BEGIN, COMMIT, ROLLBACKで一連の操作の原子性を保証                   |
| 実行順序         | FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT        |
| アンチパターン   | SELECT \*, N+1, SQLインジェクション等を避ける                       |

SQLは一度しっかり学べば、どのRDB（PostgreSQL、MySQL、Oracle等）でも応用が利く普遍的なスキルだ。まずはSELECT文をしっかり使いこなせるようになることを目指そう。

## 参考リンク

- [SQLBolt（インタラクティブなSQL学習サイト）](https://sqlbolt.com/)
- [pgExercises（PostgreSQLの練習問題）](https://pgexercises.com/)
- [DB Fiddle（ブラウザでSQLを試せる）](https://www.db-fiddle.com/)
- [SQL Tutorial - W3Schools](https://www.w3schools.com/sql/)
- [Mode Analytics SQL Tutorial](https://mode.com/sql-tutorial/)
- [PostgreSQL公式ドキュメント - SQL構文](https://www.postgresql.org/docs/current/sql.html)
- [MySQL公式ドキュメント - SQLリファレンス](https://dev.mysql.com/doc/refman/8.0/en/sql-statements.html)
- [Use The Index, Luke（インデックスの解説）](https://use-the-index-luke.com/ja)
- [SQLアンチパターン（書籍）](https://www.oreilly.co.jp/books/9784873115894/)
