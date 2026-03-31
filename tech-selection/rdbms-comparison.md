---
title: 'PostgreSQL vs MySQL 徹底比較'
order: 27
category: 'databases'
---

# PostgreSQL vs MySQL 徹底比較

## 概要と歴史

### PostgreSQLとは

PostgreSQL（通称Postgres）は、1996年にリリースされたオープンソースのオブジェクトリレーショナルデータベース管理システム（ORDBMS）である。その起源は1986年にカリフォルニア大学バークレー校で始まったPOSTGRESプロジェクトまで遡る。

PostgreSQLは「世界で最も先進的なオープンソースデータベース」を標榜しており、SQL標準への準拠度の高さ、拡張性、データの整合性に重点を置いている。

### MySQLとは

MySQLは、1995年にMichael WideniusとDavid Axmarkによって開発されたオープンソースのリレーショナルデータベース管理システム（RDBMS）である。2008年にSun Microsystemsに買収され、2010年にOracleに買収された。

MySQLは「世界で最も人気のあるオープンソースデータベース」を掲げ、高速な読み取り性能とシンプルさで、特にWebアプリケーションのバックエンドとして広く採用されている。

### MariaDBについて

MariaDBは、MySQLの創設者Michael WideniusがOracle買収に対する懸念から2009年にフォークしたデータベースである。MySQLとの互換性を維持しながら、独自の拡張を加えている。

### 主要なマイルストーン

| 年     | PostgreSQL                                            | MySQL                                  |
| ------ | ----------------------------------------------------- | -------------------------------------- |
| 1986年 | POSTGRESプロジェクト開始                              | -                                      |
| 1995年 | -                                                     | MySQL v1.0リリース                     |
| 1996年 | PostgreSQL v6.0リリース                               | -                                      |
| 2005年 | v8.0（Windows対応、PITR）                             | v5.0（ストアドプロシージャ、トリガー） |
| 2010年 | v9.0（ストリーミングレプリケーション）                | Oracle買収完了                         |
| 2016年 | v9.6（パラレルクエリ）                                | v8.0開発開始                           |
| 2017年 | v10（宣言的パーティショニング、論理レプリケーション） | -                                      |
| 2018年 | -                                                     | v8.0（CTEs、Window関数）               |
| 2020年 | v13（パラレル処理改善）                               | v8.0系の成熟                           |
| 2022年 | v15（MERGE文、JSON改善）                              | v8.0.31                                |
| 2023年 | v16（論理レプリケーション改善）                       | v8.2（予定）                           |
| 2024年 | v17                                                   | v9.0（予定）                           |

---

## 強みと弱み

### PostgreSQLの強みと弱み

| 観点             | 強み                                | 弱み                                    |
| ---------------- | ----------------------------------- | --------------------------------------- |
| SQL標準準拠      | 最も標準準拠度が高い                | 独自拡張が少ない（逆に言えば強み）      |
| データ型         | JSON/JSONB、配列、hstore、範囲型等  | 豊富なデータ型の学習コスト              |
| 拡張性           | PostGIS、TimescaleDB等の強力な拡張  | 拡張のインストール・管理                |
| ACID準拠         | 完全なACID準拠、MVCC                | 厳格なACIDはオーバーヘッドになることも  |
| 同時実行制御     | MVCCによるロックの最小化            | VACUUMプロセスが必要                    |
| 全文検索         | 標準搭載（tsvector/tsquery）        | Elasticsearchほどの高度な検索には不向き |
| パフォーマンス   | 複雑なクエリに強い                  | シンプルな読み取りはMySQLが速い場合も   |
| レプリケーション | 論理/ストリーミングレプリケーション | セットアップがMySQLより複雑             |

### MySQLの強みと弱み

| 観点               | 強み                               | 弱み                                     |
| ------------------ | ---------------------------------- | ---------------------------------------- |
| 読み取り性能       | シンプルなSELECTが高速             | 複雑なクエリはPostgreSQLが優位           |
| シンプルさ         | 設定・運用がシンプル               | 機能がPostgreSQLより限定的               |
| レプリケーション   | 成熟したレプリケーション機能       | 非同期レプリケーションのデータ損失リスク |
| エコシステム       | LAMP stack、WordPress等            | Oracle所有への懸念                       |
| ホスティング       | 多くのホスティングでデフォルト対応 | PostgreSQLも追いつきつつある             |
| ストレージエンジン | InnoDB、MyISAM等から選択可         | エンジン選択の複雑さ                     |
| JSON対応           | v5.7以降で対応                     | PostgreSQLのJSONB程の性能は出ない        |
| クラウド対応       | Amazon RDS、Cloud SQL等            | Aurora（MySQL互換）が人気                |

---

## 技術的比較

### ACID特性

| 項目                 | PostgreSQL                 | MySQL（InnoDB）        |
| -------------------- | -------------------------- | ---------------------- |
| Atomicity            | 完全対応                   | 完全対応               |
| Consistency          | 完全対応                   | 完全対応               |
| Isolation            | すべての分離レベル対応     | すべての分離レベル対応 |
| Durability           | WAL（Write-Ahead Logging） | redo log               |
| デフォルト分離レベル | Read Committed             | Repeatable Read        |

### データ型の比較

| データ型     | PostgreSQL                              | MySQL                           |
| ------------ | --------------------------------------- | ------------------------------- |
| 整数         | INTEGER, BIGINT, SMALLINT               | INT, BIGINT, SMALLINT, TINYINT  |
| 浮動小数点   | REAL, DOUBLE PRECISION                  | FLOAT, DOUBLE                   |
| 正確な数値   | NUMERIC/DECIMAL                         | DECIMAL                         |
| 文字列       | VARCHAR, TEXT, CHAR                     | VARCHAR, TEXT, CHAR             |
| 日付・時刻   | TIMESTAMP, DATE, TIME, INTERVAL         | DATETIME, TIMESTAMP, DATE, TIME |
| ブーリアン   | BOOLEAN（真のブーリアン）               | BOOLEAN（TINYINTのエイリアス）  |
| JSON         | JSON, JSONB（バイナリ、インデックス可） | JSON                            |
| 配列         | ARRAY型（ネイティブ）                   | 非対応（JSONで代替）            |
| UUID         | UUID型（ネイティブ）                    | CHAR(36)またはBINARY(16)        |
| ネットワーク | INET, CIDR, MACADDR                     | 非対応                          |
| 地理空間     | PostGIS拡張                             | Spatial Data Type               |
| 範囲型       | INT4RANGE, TSRANGE等                    | 非対応                          |
| 列挙型       | ENUM（型として定義）                    | ENUM（カラム定義に含む）        |

### JSON対応の比較

| 機能           | PostgreSQL                          | MySQL                    |
| -------------- | ----------------------------------- | ------------------------ |
| JSONデータ型   | JSON（テキスト）、JSONB（バイナリ） | JSON                     |
| インデックス   | JSONB用GINインデックス              | 生成列 + インデックス    |
| パス演算子     | ->>, #>>, @>等の豊富な演算子        | ->>, JSON_EXTRACT等      |
| パフォーマンス | JSONBはインデックス検索が高速       | JSONの検索はやや遅い     |
| 部分更新       | jsonb_set()で部分更新可能           | JSON_SET()で部分更新可能 |

### インデックスの種類

| インデックス型 | PostgreSQL                       | MySQL（InnoDB）      |
| -------------- | -------------------------------- | -------------------- |
| B-tree         | 対応                             | 対応（デフォルト）   |
| Hash           | 対応                             | 対応（メモリ最適化） |
| GIN            | 対応（全文検索、JSONB、配列）    | 非対応               |
| GiST           | 対応（地理空間、範囲型）         | 非対応               |
| BRIN           | 対応（大規模テーブルの範囲検索） | 非対応               |
| Full-text      | 対応（tsvector）                 | 対応（FULLTEXT）     |
| Spatial        | PostGIS経由                      | 対応（R-tree）       |

---

## パフォーマンス比較

### 一般的な傾向

| ワークロード     | PostgreSQL              | MySQL                  |
| ---------------- | ----------------------- | ---------------------- |
| シンプルなSELECT | 良好                    | やや優位               |
| 複雑なJOIN       | 優位                    | 良好                   |
| 集計クエリ       | 優位（パラレルクエリ）  | 良好                   |
| 大量INSERT       | 良好                    | 良好                   |
| 大量UPDATE       | 優位（HOTアップデート） | 良好                   |
| 同時接続数       | 良好（PgBouncerで改善） | 良好（スレッドベース） |
| JSONB検索        | 優位                    | 限定的                 |
| 全文検索         | 良好                    | 良好                   |

### コネクションプーリング

| 方法     | PostgreSQL              | MySQL                  |
| -------- | ----------------------- | ---------------------- |
| 標準     | 接続ごとにプロセス      | 接続ごとにスレッド     |
| プーラー | PgBouncer、Pgpool-II    | ProxySQL、MySQL Router |
| クラウド | Supabase Pooler、Neon等 | Amazon RDS Proxy等     |

---

## 適しているユースケース

### PostgreSQLが適しているケース

- **複雑なクエリが多いアプリケーション**: 分析系、レポート生成
- **地理空間データ**: PostGISを使った位置情報サービス
- **JSON/ドキュメントストア**: JSONBによる柔軟なデータ構造
- **データの整合性が最重要**: 金融、医療、行政システム
- **拡張が必要**: TimescaleDB（時系列）、pgvector（ベクトル検索）
- **クラウドネイティブ**: Supabase、Neon、CockroachDB（互換）

### MySQLが適しているケース

- **読み取り重視のWebアプリ**: ブログ、CMS、SNS
- **LAMP/LEMPスタック**: PHP/WordPressとの組み合わせ
- **シンプルなCRUD**: 標準的なWebアプリケーション
- **既存のMySQLインフラ**: 移行コストを避けたい場合
- **Amazon Aurora**: MySQL互換の高性能データベース
- **レプリケーション重視**: 読み取りスケーラビリティ

### 選択基準の早見表

| 判断基準               | PostgreSQL          | MySQL    |
| ---------------------- | ------------------- | -------- |
| SQL標準準拠が重要      | 推奨                | -        |
| 高度なデータ型が必要   | 推奨                | -        |
| 地理空間データ         | 推奨（PostGIS）     | 限定的   |
| シンプルな読み取り性能 | -                   | やや有利 |
| WordPressを使う        | -                   | 推奨     |
| Supabaseを使う         | 推奨                | -        |
| ベクトル検索（AI）     | 推奨（pgvector）    | -        |
| 時系列データ           | 推奨（TimescaleDB） | -        |

---

## 採用企業の実例

### PostgreSQL

| 企業      | 用途                           |
| --------- | ------------------------------ |
| Apple     | iCloud、その他サービス         |
| Instagram | メインデータベース             |
| Spotify   | 音楽メタデータ                 |
| Reddit    | メインデータベース             |
| Twitch    | ストリーミングプラットフォーム |
| Supabase  | BaaS（PostgreSQLベース）       |

### MySQL

| 企業          | 用途               |
| ------------- | ------------------ |
| Facebook/Meta | メインデータベース |
| Twitter/X     | タイムラインデータ |
| YouTube       | メタデータ管理     |
| Netflix       | 一部のサービス     |
| Uber          | Trip データ        |
| Airbnb        | 予約データ         |
| Booking.com   | 予約システム       |

---

## クラウドサービスでの対応

| クラウド | PostgreSQL                            | MySQL                       |
| -------- | ------------------------------------- | --------------------------- |
| AWS      | RDS for PostgreSQL, Aurora PostgreSQL | RDS for MySQL, Aurora MySQL |
| GCP      | Cloud SQL for PostgreSQL, AlloyDB     | Cloud SQL for MySQL         |
| Azure    | Azure Database for PostgreSQL         | Azure Database for MySQL    |
| その他   | Supabase, Neon, CockroachDB           | PlanetScale, Vitess         |

---

## マイグレーション

### MySQLからPostgreSQLへの移行

主な注意点:

- **AUTO_INCREMENT → SERIAL/IDENTITY**: 自動採番の構文が異なる
- **ENUM**: PostgreSQLはCREATE TYPEで別途定義
- **GROUP BY**: PostgreSQLはSELECTの非集約カラムをGROUP BYに含める必要がある
- **文字列比較**: デフォルトの照合順序が異なる
- **LIMIT構文**: 同じ（両方LIMIT/OFFSET対応）
- **ブーリアン**: MySQLのTINYINT(1)をPostgreSQLのBOOLEANに変換

ツール: pgloader、AWS DMS、手動スクリプト

---

## 学習リソース

### PostgreSQL

- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)
- [PostgreSQLチュートリアル](https://www.postgresqltutorial.com/)

### MySQL

- [MySQL公式ドキュメント](https://dev.mysql.com/doc/)
- [MySQLチュートリアル](https://www.mysqltutorial.org/)

---

## まとめ

PostgreSQLとMySQLは、どちらも優れたオープンソースRDBMSであり、多くのユースケースで互いに代替可能である。しかし、以下の指針に基づいて選択することを推奨する。

**PostgreSQLを選ぶべき場合**:

- データの整合性と正確性が最重要
- 複雑なクエリや分析処理が多い
- JSON、地理空間、ベクトル検索などの高度な機能が必要
- クラウドネイティブな開発（Supabase、Neon等）

**MySQLを選ぶべき場合**:

- シンプルな読み取り重視のWebアプリケーション
- LAMP/LEMPスタックでの開発
- WordPress等のPHPアプリケーション
- Amazon Aurora（MySQL互換）を使いたい

2026年現在のトレンドとしては、新規プロジェクトではPostgreSQLの採用が増加傾向にある。pgvectorによるAI/ベクトル検索対応、SupabaseのBaaS、NeonのサーバーレスPostgreSQLなど、モダンなユースケースでPostgreSQLが選ばれることが多い。

---

## 参考リンク

- [PostgreSQL公式サイト](https://www.postgresql.org/)
- [MySQL公式サイト](https://www.mysql.com/)
- [MariaDB公式サイト](https://mariadb.org/)
- [PostGIS公式サイト](https://postgis.net/)
- [pgvector](https://github.com/pgvector/pgvector)
