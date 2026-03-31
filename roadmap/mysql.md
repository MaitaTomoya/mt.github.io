---
title: 'MySQL'
order: 26
section: 'データベース'
---

# MySQL

## MySQLとは何か

MySQL（マイエスキューエル）は、**世界で最も人気のあるオープンソースのリレーショナルデータベース管理システム（RDBMS）**。現在はOracle Corporationが所有・開発している。

特徴:

- **オープンソース**（GPLv2ライセンス、商用ライセンスも存在）
- **高速な読み取り性能**で、Webアプリケーションに最適
- **豊富な導入実績**があり、世界中の企業で採用されている
- **レプリケーション機能**が充実しており、大規模システムに対応
- Facebook/Meta、Twitter/X、YouTube、WordPress.comなどが採用

### RDBMSとしてのMySQLの位置づけ

データベースの世界には多くの選択肢があるが、MySQLは特にWebアプリケーション開発において圧倒的なシェアを持つ。その理由は、セットアップの容易さ、十分な性能、そして膨大なコミュニティと情報量にある。

```
データベースの分類:

リレーショナルDB（RDBMS）        NoSQL
├── MySQL       <-- 本記事       ├── MongoDB（ドキュメント型）
├── PostgreSQL                    ├── Redis（キーバリュー型）
├── MariaDB                       ├── DynamoDB（キーバリュー型）
├── Oracle Database               └── Cassandra（カラム型）
└── SQL Server
```

## MySQLの歴史

MySQLの歴史を理解することは、現在の機能や方向性を理解するうえで役立つ。

### 年表

| 年     | 出来事                                                                   |
| ------ | ------------------------------------------------------------------------ |
| 1995年 | Michael Widenius（通称Monty）らがMySQL AB社を設立し、MySQL 1.0をリリース |
| 2000年 | GPLライセンスでオープンソース化。Webの爆発的成長とともに普及             |
| 2005年 | MySQL 5.0リリース。ストアドプロシージャ、トリガー、ビューを追加          |
| 2008年 | Sun MicrosystemsがMySQL ABを約10億ドルで買収                             |
| 2009年 | OracleがSun Microsystemsを約74億ドルで買収。MySQLもOracle傘下に          |
| 2009年 | MontyがMySQLをフォークし、MariaDBプロジェクトを開始                      |
| 2013年 | MySQL 5.6リリース。InnoDBの大幅改善、FULLTEXT検索対応                    |
| 2015年 | MySQL 5.7リリース。JSONデータ型サポート、パフォーマンス向上              |
| 2018年 | MySQL 8.0リリース。ウインドウ関数、CTE、ロールベースアクセス制御         |
| 2023年 | MySQL 8.1以降、Innovation Release（革新リリース）モデルを導入            |

### Oracle買収とMariaDBの誕生

Oracle買収後、MySQLの将来を危惧したオリジナル開発者のMontyがMariaDBを立ち上げた。この出来事はオープンソースコミュニティに大きな影響を与えた。

```
MySQL AB (1995)
    |
    v
Sun Microsystems が買収 (2008)
    |
    v
Oracle が Sun を買収 (2009)
    |
    +---> MySQL (Oracle が継続開発)
    |
    +---> MariaDB (Monty がフォーク、コミュニティ主導)
```

現在、多くのLinuxディストリビューション（Red Hat、Debian、Ubuntuなど）はデフォルトのRDBMSとしてMariaDBを採用している。ただし、MySQLは依然として企業での採用数が多く、AWSのRDSやGoogle Cloud SQLなどクラウドサービスでの対応も手厚い。

## PostgreSQL vs MySQL（詳細比較）

データベース選定において、PostgreSQLとMySQLの比較は最も頻繁に議論される話題の一つ。

### 機能比較表

| 比較項目             | MySQL                                  | PostgreSQL                                   |
| -------------------- | -------------------------------------- | -------------------------------------------- |
| ライセンス           | GPLv2 + 商用（デュアルライセンス）     | PostgreSQLライセンス（BSD系、非常に自由）    |
| 所有者               | Oracle Corporation                     | コミュニティ（特定企業に依存しない）         |
| 設計思想             | 速度と使いやすさ重視                   | 標準準拠と拡張性重視                         |
| SQL準拠度            | 中程度                                 | 非常に高い                                   |
| ストレージエンジン   | 選択可能（InnoDB、MyISAMなど）         | 単一（統合型）                               |
| JSONサポート         | JSON型あり                             | JSON/JSONB型（より高性能）                   |
| ACID準拠             | InnoDBエンジンで対応                   | 全面対応                                     |
| レプリケーション     | 非同期/半同期/グループレプリケーション | ストリーミング/論理レプリケーション          |
| 拡張性               | 制限あり                               | 非常に高い（独自型・関数・演算子を追加可能） |
| 全文検索             | FULLTEXT（組み込み）                   | tsvector/tsquery（より高機能）               |
| GIS/地理情報         | 基本的な空間機能                       | PostGIS（業界標準レベル）                    |
| 同時接続処理         | スレッドベース                         | プロセスベース                               |
| 読み取り性能         | 単純なクエリで高速                     | 複雑なクエリで高速                           |
| 書き込み性能         | 高速（特に大量INSERT）                 | MVCCにより安定                               |
| 学習コスト           | 低い                                   | やや高い                                     |
| コミュニティの大きさ | 非常に大きい                           | 大きい（近年急成長）                         |

### どちらを選ぶべきか

**MySQLが向いているケース**:

- Webアプリケーション（特にWordPress、Drupalなど）
- 読み取りが多いワークロード
- シンプルなスキーマ設計
- チームにMySQL経験者が多い場合
- AWSのAmazon Auroraを使いたい場合

**PostgreSQLが向いているケース**:

- 複雑なクエリや分析が多い場合
- 地理情報（GIS）を扱う場合
- JSONデータを頻繁に操作する場合
- 厳密なデータ整合性が必要な場合
- 独自の拡張機能が必要な場合

## ストレージエンジン

MySQLの大きな特徴の一つが、**ストレージエンジンを選択できる**ことだ。ストレージエンジンとは、データを実際にディスクに保存・取得する仕組みのこと。

### InnoDBとMyISAMの比較

| 機能               | InnoDB            | MyISAM               |
| ------------------ | ----------------- | -------------------- |
| トランザクション   | 対応              | 非対応               |
| 外部キー制約       | 対応              | 非対応               |
| 行レベルロック     | 対応              | テーブルレベルロック |
| クラッシュリカバリ | 自動（WAL）       | 手動修復が必要       |
| FULLTEXT検索       | MySQL 5.6以降対応 | 対応                 |
| データキャッシュ   | バッファプール    | OSキャッシュに依存   |
| 圧縮               | 対応              | 対応                 |
| デフォルト         | MySQL 5.5以降     | MySQL 5.5未満        |

### InnoDBがデフォルトである理由

MySQL 5.5以降、InnoDBがデフォルトのストレージエンジンになった。その理由は以下の通り。

1. **トランザクション対応**: ACID準拠でデータの整合性を保証
2. **行レベルロック**: 複数ユーザーの同時アクセスでもパフォーマンスが低下しにくい
3. **クラッシュリカバリ**: サーバーが異常終了してもデータが失われにくい
4. **外部キー制約**: データの参照整合性を自動的に維持

現在、MyISAMを使う理由はほとんどない。新規プロジェクトでは必ずInnoDBを使用すること。

```sql
-- ストレージエンジンの確認
SHOW ENGINES;

-- テーブル作成時にエンジンを指定（通常は不要、InnoDBがデフォルト）
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 既存テーブルのエンジン確認
SHOW TABLE STATUS WHERE Name = 'users';
```

## インストール

### Dockerを使う方法（推奨）

開発環境ではDockerを使うのが最も手軽で確実。

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: my-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: myapp
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppassword
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql
    command: --default-authentication-plugin=mysql_native_password

volumes:
  mysql_data:
```

```bash
# コンテナ起動
docker compose up -d

# MySQLに接続
docker exec -it my-mysql mysql -u appuser -p

# コンテナ停止
docker compose down
```

### macOSでのローカルインストール

```bash
# Homebrewでインストール
brew install mysql

# サービス起動
brew services start mysql

# 初期セキュリティ設定
mysql_secure_installation
```

### Ubuntuでのローカルインストール

```bash
# パッケージ更新
sudo apt update

# MySQLインストール
sudo apt install mysql-server

# セキュリティ設定
sudo mysql_secure_installation

# サービス状態確認
sudo systemctl status mysql
```

## mysqlコマンドラインツール

MySQLに接続して操作するための基本的なコマンドを覚える。

### 接続

```bash
# ローカル接続
mysql -u root -p

# ホスト指定で接続
mysql -h localhost -u appuser -p myapp

# ポート指定
mysql -h 127.0.0.1 -P 3306 -u appuser -p
```

### 基本操作

```sql
-- データベース一覧
SHOW DATABASES;

-- データベース作成
CREATE DATABASE myapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- データベース選択
USE myapp;

-- テーブル一覧
SHOW TABLES;

-- テーブル構造確認
DESCRIBE users;
-- または
SHOW CREATE TABLE users;

-- テーブル作成
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INT,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- データ挿入
INSERT INTO users (name, email, age) VALUES ('田中太郎', 'taro@example.com', 25);
INSERT INTO users (name, email, age) VALUES ('佐藤花子', 'hanako@example.com', 28);

-- データ取得
SELECT * FROM users;
SELECT name, email FROM users WHERE age >= 25;

-- データ更新
UPDATE users SET age = 26 WHERE email = 'taro@example.com';

-- データ削除
DELETE FROM users WHERE id = 1;

-- 現在の接続情報
SELECT USER(), DATABASE(), VERSION();
```

## MySQL固有の機能

### AUTO_INCREMENT

MySQLの`AUTO_INCREMENT`は、行を挿入するたびに自動的に値が増加するカラム属性。

```sql
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2)
);

-- idを指定しなくても自動で1, 2, 3...と振られる
INSERT INTO products (name, price) VALUES ('りんご', 150.00);
INSERT INTO products (name, price) VALUES ('バナナ', 100.00);
INSERT INTO products (name, price) VALUES ('みかん', 200.00);

-- 現在のAUTO_INCREMENTの値を確認
SELECT AUTO_INCREMENT FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'myapp' AND TABLE_NAME = 'products';

-- AUTO_INCREMENTの値をリセット
ALTER TABLE products AUTO_INCREMENT = 1;
```

**PostgreSQLとの違い**:

| 項目                 | MySQL (AUTO_INCREMENT) | PostgreSQL (SERIAL / IDENTITY)                     |
| -------------------- | ---------------------- | -------------------------------------------------- |
| 構文                 | `INT AUTO_INCREMENT`   | `SERIAL` または `INT GENERATED ALWAYS AS IDENTITY` |
| シーケンスの制御     | テーブル属性として管理 | 独立したシーケンスオブジェクト                     |
| 複数テーブルでの共有 | 不可                   | シーケンスを共有可能                               |
| 欠番の扱い           | 欠番が発生する         | 同様に欠番が発生する                               |

### ENUM型

MySQLのENUM型は、あらかじめ定義した値のリストからのみ選択できるデータ型。

```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled')
        DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium'
);

-- ENUMに定義された値のみ挿入可能
INSERT INTO orders (customer_name, status) VALUES ('田中', 'processing');

-- 定義にない値を挿入するとエラー（strictモードの場合）
-- INSERT INTO orders (customer_name, status) VALUES ('佐藤', 'unknown'); -- エラー
```

ENUM型は便利だが、値の追加にはALTER TABLEが必要なため、頻繁に変更される選択肢にはVARCHAR型とアプリケーション側のバリデーションを使う方が柔軟。

### FULLTEXT検索

MySQLは組み込みの全文検索機能を持っている。

```sql
-- FULLTEXTインデックスの作成
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    body TEXT,
    FULLTEXT(title, body)
);

-- テストデータ
INSERT INTO articles (title, body) VALUES
('MySQLの基礎', 'MySQLはオープンソースのリレーショナルデータベースです。'),
('データベース設計入門', 'テーブル設計はデータベースの性能に大きく影響します。'),
('インデックスの使い方', 'インデックスを適切に設定するとクエリが高速になります。');

-- FULLTEXT検索（自然言語モード）
SELECT * FROM articles
WHERE MATCH(title, body) AGAINST('データベース' IN NATURAL LANGUAGE MODE);

-- FULLTEXT検索（ブーリアンモード）
SELECT * FROM articles
WHERE MATCH(title, body) AGAINST('+MySQL -PostgreSQL' IN BOOLEAN MODE);

-- 関連度スコア付き
SELECT title, MATCH(title, body) AGAINST('データベース') AS relevance
FROM articles
WHERE MATCH(title, body) AGAINST('データベース')
ORDER BY relevance DESC;
```

### レプリケーション

MySQLのレプリケーションは、データを複数のサーバーに自動的にコピーする機能。以前は「マスター/スレーブ」と呼ばれていたが、現在は「ソース/レプリカ」という用語が使われる。

```
レプリケーションの基本構成:

[ソース (Source)]  -- バイナリログ -->  [レプリカ (Replica) 1]
    書き込み                               読み取り専用
                   -- バイナリログ -->  [レプリカ (Replica) 2]
                                           読み取り専用

アプリケーションは:
  - 書き込み → ソースへ
  - 読み取り → レプリカへ（負荷分散）
```

レプリケーションの種類:

| 種類                     | 説明                                          | 特徴                           |
| ------------------------ | --------------------------------------------- | ------------------------------ |
| 非同期レプリケーション   | ソースは書き込み後すぐに応答を返す            | 高速だが、レプリカとの遅延あり |
| 半同期レプリケーション   | 少なくとも1台のレプリカが受信確認してから応答 | データ損失リスクを軽減         |
| グループレプリケーション | 複数ノードで合意形成（Paxos系）               | 高可用性、自動フェイルオーバー |

### MySQL Router

MySQL Routerは、アプリケーションとMySQLサーバーの間に配置される軽量なミドルウェアで、接続のルーティングと負荷分散を行う。

```
[アプリケーション]
       |
[MySQL Router]  -- 書き込み -->  [ソース]
       |
       +------- 読み取り -->  [レプリカ 1]
       +------- 読み取り -->  [レプリカ 2]
```

### MySQL Shell

MySQL Shellは、MySQLの次世代コマンドラインクライアント。JavaScript、Python、SQLの3つのモードで操作できる。

```bash
# MySQL Shellで接続
mysqlsh root@localhost:3306

# SQLモード
\sql
SELECT * FROM myapp.users;

# JavaScriptモード
\js
var result = session.sql("SELECT * FROM myapp.users").execute();

# Pythonモード
\py
result = session.sql("SELECT * FROM myapp.users").execute()
```

## パフォーマンスチューニング

### Slow Query Log（スロークエリログ）

実行時間が長いクエリを記録する機能。パフォーマンス改善の第一歩。

```sql
-- スロークエリログの有効化
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- 1秒以上のクエリを記録
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow-query.log';

-- 現在の設定確認
SHOW VARIABLES LIKE 'slow_query%';
SHOW VARIABLES LIKE 'long_query_time';
```

### EXPLAIN（実行計画の確認）

クエリがどのように実行されるかを確認する最も重要なツール。

```sql
-- EXPLAINの基本使用
EXPLAIN SELECT * FROM users WHERE email = 'taro@example.com';

-- EXPLAIN ANALYZEで実際の実行時間を計測（MySQL 8.0.18以降）
EXPLAIN ANALYZE SELECT * FROM users WHERE age > 25 ORDER BY name;
```

EXPLAINの結果で注目すべき項目:

| 項目          | 意味                         | 改善が必要な値                           |
| ------------- | ---------------------------- | ---------------------------------------- |
| type          | アクセス方法                 | ALL（フルテーブルスキャン）は要注意      |
| possible_keys | 使用可能なインデックス       | NULLの場合、インデックスが不足           |
| key           | 実際に使用されたインデックス | NULLの場合、インデックスが使われていない |
| rows          | 検査される推定行数           | テーブルの行数に近い場合は要改善         |
| Extra         | 追加情報                     | Using filesort, Using temporaryは要注意  |

### インデックスの最適化

```sql
-- インデックスの作成
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_age_name ON users(age, name);  -- 複合インデックス

-- インデックスの確認
SHOW INDEX FROM users;

-- 不要なインデックスの削除
DROP INDEX idx_users_age_name ON users;

-- インデックスヒント（オプティマイザに対するヒント）
SELECT * FROM users USE INDEX (idx_users_email) WHERE email LIKE 'taro%';
SELECT * FROM users FORCE INDEX (idx_users_age_name) WHERE age > 25;
SELECT * FROM users IGNORE INDEX (idx_users_email) WHERE email = 'taro@example.com';
```

## 文字コード（utf8 vs utf8mb4）

MySQLの文字コード設定は、初心者がつまずきやすいポイントの一つ。

### なぜutf8mb4を使うべきか

MySQLの`utf8`は**本来のUTF-8ではない**。MySQLの`utf8`は最大3バイトまでしか扱えず、4バイト文字（絵文字など）を保存できない。

| 文字セット      | 最大バイト数 | 絵文字 | 一部の漢字 | 推奨   |
| --------------- | ------------ | ------ | ---------- | ------ |
| utf8（utf8mb3） | 3バイト      | 不可   | 一部不可   | 非推奨 |
| utf8mb4         | 4バイト      | 可     | 全て可     | 推奨   |

```sql
-- データベース作成時に文字コードを指定
CREATE DATABASE myapp
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- テーブル作成時の指定
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 既存データベースの文字コード確認
SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'myapp';

-- 既存テーブルの文字コード変更
ALTER TABLE posts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 照合順序（Collation）の選び方

照合順序は、文字列の比較・並び替えのルールを決める。

| 照合順序           | 説明                                | 用途                   |
| ------------------ | ----------------------------------- | ---------------------- |
| utf8mb4_general_ci | 高速だが精度がやや低い              | 一般的な用途           |
| utf8mb4_unicode_ci | 正確だがやや遅い                    | 多言語対応             |
| utf8mb4_0900_ai_ci | MySQL 8.0のデフォルト、高速かつ正確 | MySQL 8.0以降の推奨    |
| utf8mb4_bin        | バイナリ比較（大文字小文字を区別）  | パスワードハッシュなど |

## セキュリティ

### ユーザー権限管理

```sql
-- ユーザー作成
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'strong_password_here';
CREATE USER 'readonly'@'%' IDENTIFIED BY 'another_password';

-- 権限付与
GRANT SELECT, INSERT, UPDATE, DELETE ON myapp.* TO 'appuser'@'localhost';
GRANT SELECT ON myapp.* TO 'readonly'@'%';

-- 全権限の付与（本番では避ける）
GRANT ALL PRIVILEGES ON myapp.* TO 'admin'@'localhost';

-- 権限の確認
SHOW GRANTS FOR 'appuser'@'localhost';

-- 権限の取り消し
REVOKE DELETE ON myapp.* FROM 'appuser'@'localhost';

-- 権限の反映
FLUSH PRIVILEGES;

-- ユーザー削除
DROP USER 'readonly'@'%';
```

**権限管理のベストプラクティス**:

- アプリケーションには**最小限の権限**のみ付与する
- `root`ユーザーはアプリケーションから使わない
- 読み取り専用ユーザーを分けて作成する
- パスワードは十分に強力なものを使う

### SSL接続

```sql
-- SSL接続の強制
ALTER USER 'appuser'@'%' REQUIRE SSL;

-- SSL状態の確認
SHOW VARIABLES LIKE '%ssl%';
```

```bash
# SSL接続でのmysqlクライアント接続
mysql -u appuser -p --ssl-mode=REQUIRED --ssl-ca=ca.pem
```

## Node.js + MySQL

Node.jsからMySQLに接続するには、`mysql2`パッケージが推奨される。

### セットアップ

```bash
# mysql2のインストール
npm install mysql2
```

### 基本的な接続と操作

```javascript
// db.js - コネクションプールの設定
const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: 'localhost',
  user: 'appuser',
  password: 'apppassword',
  database: 'myapp',
  waitForConnections: true,
  connectionLimit: 10, // 最大接続数
  queueLimit: 0, // 待ちキューの制限（0は無制限）
  charset: 'utf8mb4',
})

module.exports = pool
```

```javascript
// users.js - CRUD操作の例
const pool = require('./db')

// ユーザー一覧取得
async function getUsers() {
  const [rows] = await pool.query('SELECT * FROM users ORDER BY id')
  return rows
}

// ユーザー取得（プリペアドステートメントでSQLインジェクション対策）
async function getUserByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email])
  return rows[0] || null
}

// ユーザー作成
async function createUser(name, email, age) {
  const [result] = await pool.execute('INSERT INTO users (name, email, age) VALUES (?, ?, ?)', [
    name,
    email,
    age,
  ])
  return { id: result.insertId, name, email, age }
}

// ユーザー更新
async function updateUser(id, name, age) {
  const [result] = await pool.execute('UPDATE users SET name = ?, age = ? WHERE id = ?', [
    name,
    age,
    id,
  ])
  return result.affectedRows > 0
}

// ユーザー削除
async function deleteUser(id) {
  const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id])
  return result.affectedRows > 0
}

// トランザクションの使用例
async function transferPoints(fromUserId, toUserId, points) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    await connection.execute('UPDATE users SET points = points - ? WHERE id = ? AND points >= ?', [
      points,
      fromUserId,
      points,
    ])

    await connection.execute('UPDATE users SET points = points + ? WHERE id = ?', [
      points,
      toUserId,
    ])

    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
```

## バックアップ

データベースのバックアップは、運用において最も重要な作業の一つ。

### mysqldump（論理バックアップ）

最も基本的なバックアップ方法。SQL文としてデータをエクスポートする。

```bash
# データベース全体のバックアップ
mysqldump -u root -p myapp > myapp_backup.sql

# 特定テーブルのみ
mysqldump -u root -p myapp users orders > tables_backup.sql

# 全データベース
mysqldump -u root -p --all-databases > all_backup.sql

# スキーマのみ（データなし）
mysqldump -u root -p --no-data myapp > schema_only.sql

# データのみ（スキーマなし）
mysqldump -u root -p --no-create-info myapp > data_only.sql

# 圧縮して保存
mysqldump -u root -p myapp | gzip > myapp_backup.sql.gz

# リストア
mysql -u root -p myapp < myapp_backup.sql

# 圧縮ファイルからリストア
gunzip < myapp_backup.sql.gz | mysql -u root -p myapp
```

### mysqlpump（並列バックアップ）

MySQL 5.7.8以降で利用可能。mysqldumpの改良版で、並列処理によりバックアップが高速。

```bash
# 並列バックアップ（4スレッド）
mysqlpump -u root -p --default-parallelism=4 myapp > myapp_backup.sql
```

### Percona XtraBackup（物理バックアップ）

大規模データベースには物理バックアップが適している。サーバーを停止せずにバックアップできる（ホットバックアップ）。

```bash
# フルバックアップ
xtrabackup --backup --target-dir=/backup/full -u root -p

# 増分バックアップ
xtrabackup --backup --target-dir=/backup/inc1 \
  --incremental-basedir=/backup/full -u root -p
```

### バックアップ方法の比較

| 方法       | 種類 | 速度   | サーバー停止 | 用途         |
| ---------- | ---- | ------ | ------------ | ------------ |
| mysqldump  | 論理 | 遅い   | 不要         | 小〜中規模DB |
| mysqlpump  | 論理 | 中程度 | 不要         | 中規模DB     |
| XtraBackup | 物理 | 速い   | 不要         | 大規模DB     |

## MariaDBとの違い

MariaDBはMySQLからフォークしたデータベースだが、バージョンが進むにつれて違いが増えている。

| 項目                  | MySQL                       | MariaDB                                  |
| --------------------- | --------------------------- | ---------------------------------------- |
| 開発主体              | Oracle Corporation          | MariaDB Foundation / MariaDB Corporation |
| ライセンス            | GPLv2 + 商用                | GPLv2（完全オープンソース）              |
| バージョン番号        | 8.0, 8.1...                 | 10.x, 11.x...                            |
| ストレージエンジン    | InnoDB, MyISAM等            | Aria, ColumnStore, Spider等を追加        |
| JSON型                | ネイティブJSON型            | LONGTEXT型のエイリアス                   |
| ウインドウ関数        | 8.0で追加                   | 10.2で先行対応                           |
| デフォルトのLinux採用 | 一部                        | Red Hat, Debian, Ubuntu等で採用          |
| クラウド対応          | AWS RDS, Google Cloud SQL等 | SkySQL（独自クラウド）                   |
| MySQL互換性           | -                           | 高い（ただし徐々に分岐中）               |

## 採用企業

MySQLは世界中の大規模サービスで使われている。

| 企業/サービス | 用途                                            |
| ------------- | ----------------------------------------------- |
| Facebook/Meta | ユーザーデータ、ソーシャルグラフの管理          |
| Twitter/X     | ツイートやユーザー情報の保存                    |
| YouTube       | 動画メタデータの管理                            |
| WordPress.com | 世界のWebサイトの約40%を支えるCMSのバックエンド |
| Netflix       | 一部のマイクロサービスで使用                    |
| Uber          | 旅行データやドライバー情報の管理                |
| GitHub        | リポジトリメタデータの管理                      |
| Shopify       | ECプラットフォームのデータベース                |

## まとめ

MySQLは、Webアプリケーション開発における最も実績のあるデータベースの一つ。以下のポイントを押さえておくことが重要。

1. **InnoDBを使う**: デフォルトのストレージエンジンで、トランザクション対応
2. **utf8mb4を使う**: MySQL独自のutf8は4バイト文字を扱えないため
3. **インデックスを適切に設計する**: EXPLAINで確認し、スロークエリログで問題を発見
4. **セキュリティを意識する**: 最小権限の原則、プリペアドステートメントの使用
5. **バックアップを忘れない**: mysqldumpで定期的にバックアップ

## 参考リンク

- [MySQL公式ドキュメント](https://dev.mysql.com/doc/)
- [MySQL 8.0 リファレンスマニュアル（日本語）](https://dev.mysql.com/doc/refman/8.0/ja/)
- [MySQL Tutorial](https://www.mysqltutorial.org/)
- [mysql2 (npm)](https://www.npmjs.com/package/mysql2)
- [Percona XtraBackup](https://www.percona.com/software/mysql-database/percona-xtrabackup)
- [MariaDB公式サイト](https://mariadb.org/)
- [MySQL vs PostgreSQL比較 (DB-Engines)](https://db-engines.com/en/system/MySQL%3BPostgreSQL)
