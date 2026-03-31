---
title: 'Redis'
order: 20
section: 'キャッシュ/システム'
---

# Redis

## Redisとは何か

Redisは **Remote Dictionary Server** の略で、オープンソースの**インメモリデータストア**。データをメモリ（RAM）上に保持するため、ディスクベースのデータベースと比べて圧倒的に高速にデータの読み書きができる。

「キャッシュの王様」と呼ばれるほど、Webアプリケーションのキャッシュ用途で世界中で使われている。Twitter、GitHub、Stack Overflow、Instagramなど、大規模サービスの裏側で動いている。

### インメモリデータストアとは

通常のデータベース（MySQL、PostgreSQLなど）はデータをハードディスクやSSDに保存する。一方、Redisはデータを**コンピュータのメモリ（RAM）に保存**する。

身近な例えで説明すると:

| 場所         | コンピュータでの対応 | 速さ                   | 容量     |
| ------------ | -------------------- | ---------------------- | -------- |
| 机の上のメモ | メモリ（RAM）        | すぐに見られる         | 少ない   |
| 本棚の本     | SSD                  | 取りに行く時間がかかる | そこそこ |
| 倉庫の資料   | HDD                  | かなり時間がかかる     | たくさん |

Redisは「机の上のメモ」に相当する。必要な情報をすぐに取り出せるが、机の広さ（メモリ容量）には限りがある。だからこそ、**よく使うデータだけをRedisに置く**という使い方が基本になる。

## なぜキャッシュが必要か

### レイテンシの比較

Webアプリケーションでは、ユーザーがページを開くたびにデータベースへアクセスする。このアクセスにかかる時間（レイテンシ）を減らすことが、ユーザー体験の向上に直結する。

| アクセス先                | 所要時間（目安） | 例え                   |
| ------------------------- | ---------------- | ---------------------- |
| L1キャッシュ（CPU内）     | 約1ナノ秒        | まばたきする間         |
| L2キャッシュ（CPU内）     | 約4ナノ秒        | 息を吸う間             |
| メモリ（RAM）             | 約100ナノ秒      | 壁のスイッチを押す     |
| SSD（ランダム読み取り）   | 約16マイクロ秒   | 隣の部屋に行く         |
| HDD（ランダム読み取り）   | 約2ミリ秒        | 隣の建物に行く         |
| ネットワーク（同一DC内）  | 約0.5ミリ秒      | 隣の部屋に電話する     |
| ネットワーク（東京-大阪） | 約10ミリ秒       | 大阪に電話する         |
| ネットワーク（東京-NY）   | 約200ミリ秒      | ニューヨークに電話する |

Redisはメモリ上で動作するため、**1秒間に数十万回のリクエスト**を処理できる。データベースに毎回問い合わせる代わりに、Redisに結果をキャッシュしておけば、レスポンス時間を劇的に短縮できる。

### キャッシュなしの場合の問題

```
ユーザー → Webサーバー → データベース → Webサーバー → ユーザー
                          （100ms）
```

1000人が同時にアクセスすると、データベースに1000回クエリが飛ぶ。同じデータを返すだけなのに、毎回データベースに問い合わせるのは無駄。

### キャッシュありの場合

```
ユーザー → Webサーバー → Redis（キャッシュヒット） → ユーザー
                          （1ms）

ユーザー → Webサーバー → Redis（キャッシュミス） → データベース → Redis に保存 → ユーザー
```

最初の1回だけデータベースにアクセスし、結果をRedisに保存。以降のアクセスはRedisから返す。これで**100倍以上の高速化**が実現できる。

## インストールと起動

### Docker（推奨）

Dockerを使えば、OSに関係なく簡単にRedisを起動できる。

```bash
# Redisコンテナを起動
docker run --name my-redis -p 6379:6379 -d redis:7-alpine

# 起動確認
docker ps

# ログ確認
docker logs my-redis
```

`-p 6379:6379`はホストのポート6379をコンテナのポート6379にマッピングしている。Redisのデフォルトポートは6379。

### Docker Composeを使う場合

プロジェクトで使う場合はDocker Composeが便利。`docker-compose.yml`を作成する:

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

volumes:
  redis-data:
```

```bash
# 起動
docker compose up -d

# 停止
docker compose down
```

`--appendonly yes`はAOF（Append Only File）永続化を有効にするオプション。後のセクションで詳しく説明する。

### macOS（Homebrew）

```bash
brew install redis
brew services start redis
```

### redis-cliで接続

redis-cliはRedisに接続するためのコマンドラインツール。

```bash
# Dockerの場合
docker exec -it my-redis redis-cli

# ローカルインストールの場合
redis-cli

# 接続確認
127.0.0.1:6379> PING
PONG
```

`PONG`と返ってくれば接続成功。これがRedisの「ヘルスチェック」コマンドでもある。

## データ型

Redisは単なるキーバリューストアではない。豊富なデータ型をサポートしており、用途に応じて最適な型を選べる。

### データ型一覧と使いどころ

| データ型   | 概要                                       | 使いどころの例                                 |
| ---------- | ------------------------------------------ | ---------------------------------------------- |
| String     | 最もシンプル。文字列・数値・バイナリを格納 | セッション、カウンター、単純なキャッシュ       |
| List       | 順序付きの文字列リスト                     | タイムライン、メッセージキュー、最新N件の履歴  |
| Set        | 重複なしの文字列集合                       | タグ、ユニークユーザー追跡、共通の友達         |
| Sorted Set | スコア付きのSet                            | ランキング、スコアボード、優先度キュー         |
| Hash       | フィールド-値のペアを持つ構造体            | ユーザー情報、設定値、オブジェクトのキャッシュ |
| Stream     | ログのようなデータ構造（追記専用）         | イベントログ、メッセージブローカー             |

### String（文字列型）

最も基本的なデータ型。最大512MBまで格納できる。

```bash
# 値をセット
SET greeting "Hello, Redis!"

# 値を取得
GET greeting
# "Hello, Redis!"

# 数値として扱う
SET counter 10
INCR counter      # 11（1増加）
INCRBY counter 5  # 16（5増加）
DECR counter      # 15（1減少）
DECRBY counter 3  # 12（3減少）

# 複数のキーを一度にセット/取得
MSET name "Taro" age "25" city "Tokyo"
MGET name age city
# 1) "Taro"
# 2) "25"
# 3) "Tokyo"
```

### List（リスト型）

順序付きの文字列リスト。先頭・末尾への追加/削除が高速（O(1)）。

```bash
# 左（先頭）から追加
LPUSH tasks "task3"
LPUSH tasks "task2"
LPUSH tasks "task1"

# 右（末尾）から追加
RPUSH tasks "task4"

# リストの内容を確認（0から-1で全件）
LRANGE tasks 0 -1
# 1) "task1"
# 2) "task2"
# 3) "task3"
# 4) "task4"

# 先頭から取り出す（キューとして使用）
LPOP tasks
# "task1"

# 末尾から取り出す（スタックとして使用）
RPOP tasks
# "task4"

# リストの長さ
LLEN tasks
# 2
```

**実務での使い方**: 「最新の通知5件」のようなデータは、LPUSHで先頭に追加し、LTRIMで5件に制限すると効率的。

```bash
LPUSH notifications "新しい通知"
LTRIM notifications 0 4  # 最新5件だけ残す
```

### Set（集合型）

重複しない文字列の集合。要素の追加・削除・存在確認がO(1)。

```bash
# 要素を追加
SADD fruits "apple"
SADD fruits "banana"
SADD fruits "cherry"
SADD fruits "apple"  # 重複は無視される

# 全要素を取得
SMEMBERS fruits
# 1) "apple"
# 2) "banana"
# 3) "cherry"

# 要素が存在するか確認
SISMEMBER fruits "apple"   # 1（存在する）
SISMEMBER fruits "grape"   # 0（存在しない）

# 要素数
SCARD fruits
# 3

# 集合演算
SADD fruits2 "banana" "date" "elderberry"

# 和集合（両方に含まれる全要素）
SUNION fruits fruits2
# apple, banana, cherry, date, elderberry

# 積集合（両方に含まれる要素）
SINTER fruits fruits2
# banana

# 差集合（fruits にあって fruits2 にない要素）
SDIFF fruits fruits2
# apple, cherry
```

**実務での使い方**: 「今日ログインしたユーザーのID」をSetで管理すれば、重複なくユニークユーザー数を数えられる。

### Sorted Set（ソート済み集合）

各要素にスコア（数値）が紐づいたSet。スコア順に自動的にソートされる。

```bash
# スコア付きで要素を追加
ZADD ranking 100 "Alice"
ZADD ranking 85 "Bob"
ZADD ranking 92 "Charlie"
ZADD ranking 78 "Dave"

# スコアの低い順（昇順）で取得
ZRANGE ranking 0 -1 WITHSCORES
# 1) "Dave"    - 78
# 2) "Bob"     - 85
# 3) "Charlie" - 92
# 4) "Alice"   - 100

# スコアの高い順（降順）で取得
ZREVRANGE ranking 0 -1 WITHSCORES
# 1) "Alice"   - 100
# 2) "Charlie" - 92
# 3) "Bob"     - 85
# 4) "Dave"    - 78

# 上位3名を取得
ZREVRANGE ranking 0 2 WITHSCORES

# 特定メンバーの順位（0始まり、降順）
ZREVRANK ranking "Alice"
# 0（1位）

# スコアを増加
ZINCRBY ranking 20 "Bob"
# "105"（85 + 20）
```

**実務での使い方**: ゲームのランキング、記事の人気順、リアルタイムのスコアボードなどに最適。

### Hash（ハッシュ型）

フィールドと値のペアを持つ構造体。1つのキーの中に複数のフィールドを持てる。

```bash
# ユーザー情報をハッシュで保存
HSET user:1001 name "Taro"
HSET user:1001 email "taro@example.com"
HSET user:1001 age "25"

# 一度に複数フィールドをセット
HSET user:1002 name "Hanako" email "hanako@example.com" age "28"

# 特定フィールドを取得
HGET user:1001 name
# "Taro"

# 全フィールドと値を取得
HGETALL user:1001
# 1) "name"
# 2) "Taro"
# 3) "email"
# 4) "taro@example.com"
# 5) "age"
# 6) "25"

# フィールドが存在するか確認
HEXISTS user:1001 name   # 1
HEXISTS user:1001 phone  # 0

# フィールドを削除
HDEL user:1001 age

# フィールド数
HLEN user:1001
# 2
```

**実務での使い方**: ユーザーのプロフィール情報やセッションデータのように、関連する複数のフィールドを1つのキーにまとめたい場合に使う。JSON文字列をStringに入れるよりも、個別のフィールドを更新できる分効率的。

### Stream（ストリーム型）

Redis 5.0で追加された、ログのようなデータ構造。追記専用で、コンシューマーグループをサポートする。Apache Kafkaのようなメッセージブローカーの機能を持つ。

```bash
# メッセージを追加（*は自動ID生成）
XADD events * action "login" user "Taro"
XADD events * action "purchase" user "Hanako" item "book"

# メッセージを読み取り（最初から2件）
XRANGE events - + COUNT 2

# ストリームの長さ
XLEN events

# 新しいメッセージだけを待ち受ける（ブロッキング）
XREAD BLOCK 0 STREAMS events $
```

**Pub/Subとの違い**: Pub/Subはメッセージを永続化しないが、Streamはメッセージを保持する。Subscriberがオフラインでもメッセージを後から読み取れるため、信頼性が求められるメッセージングにはStreamを使う。

**実務での使い方**: マイクロサービス間のイベント連携、監査ログ、リアルタイムデータパイプラインなどに使われる。Apache Kafkaほどの規模は不要だが、Pub/Subよりも信頼性が必要な場合に最適。

## 基本コマンド一覧

### キー操作コマンド

| コマンド             | 説明                         | 使用例                 |
| -------------------- | ---------------------------- | ---------------------- |
| `SET key value`      | キーに値をセット             | `SET name "Taro"`      |
| `GET key`            | キーの値を取得               | `GET name`             |
| `DEL key`            | キーを削除                   | `DEL name`             |
| `EXISTS key`         | キーが存在するか確認         | `EXISTS name` → 1 or 0 |
| `EXPIRE key seconds` | 有効期限を設定（秒）         | `EXPIRE session 3600`  |
| `TTL key`            | 残り有効期限を確認（秒）     | `TTL session`          |
| `PTTL key`           | 残り有効期限を確認（ミリ秒） | `PTTL session`         |
| `PERSIST key`        | 有効期限を解除               | `PERSIST session`      |
| `KEYS pattern`       | パターンに一致するキーを検索 | `KEYS user:*`          |
| `SCAN cursor`        | キーを安全にスキャン         | `SCAN 0 MATCH user:*`  |
| `TYPE key`           | キーのデータ型を確認         | `TYPE name`            |
| `RENAME key newkey`  | キー名を変更                 | `RENAME name username` |
| `INCR key`           | 数値を1増加                  | `INCR counter`         |
| `DECR key`           | 数値を1減少                  | `DECR counter`         |

### 実行例

```bash
# 基本的なSET/GET
SET user:name "Taro Yamada"
GET user:name
# "Taro Yamada"

# 有効期限付きでセット（EXオプション: 秒単位）
SET session:abc123 "user_data_here" EX 3600

# 有効期限を確認
TTL session:abc123
# 3597（残り約3597秒）

# キーが存在するか
EXISTS session:abc123
# 1

# キーを削除
DEL session:abc123
EXISTS session:abc123
# 0

# カウンター
SET page_views 0
INCR page_views  # 1
INCR page_views  # 2
INCR page_views  # 3
GET page_views
# "3"

# ハッシュ操作
HSET product:100 name "Tシャツ" price "2980" stock "50"
HGET product:100 name
# "Tシャツ"
HGETALL product:100

# リスト操作
LPUSH queue:emails "email1@example.com"
LPUSH queue:emails "email2@example.com"
RPOP queue:emails
# "email1@example.com"（先に入れたものが先に出る = FIFO）

# Set操作
SADD online_users "user:1" "user:2" "user:3"
SCARD online_users
# 3
SISMEMBER online_users "user:2"
# 1

# Sorted Set操作
ZADD leaderboard 1500 "player_a" 2300 "player_b" 1800 "player_c"
ZREVRANGE leaderboard 0 2 WITHSCORES
```

**注意**: `KEYS`コマンドは全キーをスキャンするため、本番環境では使わないこと。代わりに`SCAN`コマンドを使う。`KEYS`はデバッグ目的でのみ使用する。

## TTL（Time To Live）とキャッシュの有効期限

TTLはキーの「寿命」を設定する仕組み。設定した時間が経過すると、Redisが自動的にキーを削除する。

### なぜTTLが必要か

キャッシュに永遠にデータを残しておくと問題が起きる:

1. **メモリが枯渇する**: Redisはメモリ上にデータを持つため、古いデータが溜まるとメモリが足りなくなる
2. **データが古くなる**: データベースの値が変わったのに、キャッシュが古い値を返し続ける（ステール状態）
3. **整合性が崩れる**: ユーザーに間違った情報を表示してしまう

### TTLの設定方法

```bash
# 方法1: SETと同時に設定（推奨）
SET cache:user:1001 '{"name":"Taro","age":25}' EX 300   # 300秒（5分）
SET cache:user:1001 '{"name":"Taro","age":25}' PX 5000  # 5000ミリ秒（5秒）

# 方法2: 後からTTLを設定
SET cache:user:1001 '{"name":"Taro","age":25}'
EXPIRE cache:user:1001 300   # 300秒後に期限切れ

# TTLを確認
TTL cache:user:1001
# 297（残り297秒）

# TTLを解除（永続化）
PERSIST cache:user:1001
TTL cache:user:1001
# -1（TTLなし = 永続）

# 存在しないキーのTTL
TTL nonexistent_key
# -2（キーが存在しない）
```

### TTLの目安

| データの種類            | 推奨TTL        | 理由                                   |
| ----------------------- | -------------- | -------------------------------------- |
| APIレスポンスキャッシュ | 5分 - 1時間    | データの鮮度とパフォーマンスのバランス |
| セッションデータ        | 30分 - 24時間  | ユーザーのログイン維持期間             |
| ワンタイムトークン      | 5分 - 15分     | セキュリティのため短く                 |
| ランキングデータ        | 1分 - 5分      | リアルタイム性が重要                   |
| マスタデータキャッシュ  | 1時間 - 24時間 | 変更頻度が低い                         |
| レート制限カウンター    | 1分 - 1時間    | ウィンドウサイズに合わせる             |

## キャッシュ戦略

キャッシュをどのタイミングで読み書きするかには、いくつかのパターンがある。アプリケーションの特性に応じて使い分ける。

### Cache-Aside（キャッシュアサイド）

最も一般的な戦略。アプリケーションがキャッシュの読み書きを制御する。

```
[読み取り]
1. アプリ → Redis に問い合わせ
2. キャッシュヒット → データを返す
3. キャッシュミス → DB に問い合わせ → Redis に保存 → データを返す

[書き込み]
1. アプリ → DB に書き込み
2. Redis のキャッシュを削除（または更新）
```

```javascript
// Cache-Aside パターンの実装例
async function getUser(userId) {
  // 1. まずRedisを確認
  const cached = await redis.get(`user:${userId}`)
  if (cached) {
    return JSON.parse(cached) // キャッシュヒット
  }

  // 2. キャッシュミス → DBから取得
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId])

  // 3. Redisに保存（5分間）
  await redis.set(`user:${userId}`, JSON.stringify(user), 'EX', 300)

  return user
}
```

**メリット**: シンプルで理解しやすい。必要なデータだけがキャッシュされる。

**デメリット**: キャッシュミス時は遅い。キャッシュとDBの整合性を自分で管理する必要がある。

### Write-Through（ライトスルー）

書き込み時にキャッシュとDBの両方に同時に書き込む。

```
[書き込み]
1. アプリ → Redis に書き込み
2. Redis → DB に書き込み（同期的）

[読み取り]
1. アプリ → Redis から読み取り（常にキャッシュにある）
```

**メリット**: キャッシュとDBが常に一致。読み取りが確実に速い。

**デメリット**: 書き込みが遅い（2か所に書くため）。読まれないデータもキャッシュされる。

### Write-Behind / Write-Back（ライトビハインド）

書き込み時はキャッシュだけに書き込み、DBへの書き込みは非同期で行う。

```
[書き込み]
1. アプリ → Redis に書き込み（即座に完了）
2. バックグラウンドで Redis → DB に書き込み（非同期）

[読み取り]
1. アプリ → Redis から読み取り
```

**メリット**: 書き込みが非常に速い。DBへの書き込み回数を減らせる（バッチ処理可能）。

**デメリット**: Redisがダウンするとデータを失うリスクがある。実装が複雑。

### Read-Through（リードスルー）

キャッシュライブラリ/プロキシがDB読み取りを自動的に行う。Cache-Asideに似ているが、アプリはキャッシュだけを意識すればよい。

```
[読み取り]
1. アプリ → キャッシュに問い合わせ
2. キャッシュミス → キャッシュが自動的にDBから取得して保存
3. アプリにデータを返す
```

**メリット**: アプリケーションコードがシンプル。キャッシュの管理をライブラリに委譲できる。

**デメリット**: 初回アクセスは遅い。カスタムロジックを入れにくい。

### キャッシュ戦略の比較表

| 戦略          | 読み取り速度                | 書き込み速度 | データ整合性 | 実装の複雑さ | 主な用途                   |
| ------------- | --------------------------- | ------------ | ------------ | ------------ | -------------------------- |
| Cache-Aside   | ヒット時:速い / ミス時:遅い | 普通         | 中           | 低           | 一般的なWebアプリ          |
| Write-Through | 常に速い                    | 遅い         | 高           | 中           | データの一貫性が重要な場合 |
| Write-Behind  | 常に速い                    | 非常に速い   | 低           | 高           | 書き込みが多い場合         |
| Read-Through  | ヒット時:速い / ミス時:遅い | -            | 中           | 低           | 読み取りが多い場合         |

**実務でのアドバイス**: 初めてキャッシュを導入する場合は**Cache-Aside**パターンから始めること。シンプルで理解しやすく、ほとんどのケースで十分。

## Node.js + Redisの接続

### ioredisパッケージ

Node.jsからRedisを操作するには`ioredis`パッケージが最も人気がある。公式の`redis`パッケージよりも機能が豊富で、TypeScriptサポートも充実している。

```bash
npm install ioredis
```

### 基本的な接続と操作

```javascript
const Redis = require('ioredis')

// 接続（デフォルト: localhost:6379）
const redis = new Redis()

// オプション付き接続（実際はどちらか一方を使う）
const redisWithOptions = new Redis({
  host: '127.0.0.1',
  port: 6379,
  password: 'your_password', // パスワード認証が必要な場合
  db: 0, // データベース番号（0-15）
  retryStrategy(times) {
    // 再接続の戦略
    const delay = Math.min(times * 50, 2000)
    return delay
  },
})

// 接続イベント
redis.on('connect', () => {
  console.log('Redisに接続しました')
})

redis.on('error', (err) => {
  console.error('Redis接続エラー:', err)
})
```

### 基本操作

```javascript
// String操作
await redis.set('name', 'Taro')
const name = await redis.get('name')
console.log(name) // "Taro"

// TTL付きでセット
await redis.set('session:abc', 'user_data', 'EX', 3600)

// 存在しない場合のみセット（NX = Not eXists）
await redis.set('lock:resource', '1', 'NX', 'EX', 30)

// Hash操作
await redis.hset('user:1001', 'name', 'Taro', 'email', 'taro@example.com')
const userName = await redis.hget('user:1001', 'name')
const allFields = await redis.hgetall('user:1001')
// { name: 'Taro', email: 'taro@example.com' }

// List操作
await redis.lpush('tasks', 'task1', 'task2', 'task3')
const tasks = await redis.lrange('tasks', 0, -1)
// ['task3', 'task2', 'task1']

// Set操作
await redis.sadd('tags:article:1', 'javascript', 'redis', 'cache')
const tags = await redis.smembers('tags:article:1')

// Sorted Set操作
await redis.zadd('leaderboard', 100, 'Alice', 85, 'Bob', 92, 'Charlie')
const top3 = await redis.zrevrange('leaderboard', 0, 2, 'WITHSCORES')
```

### Cache-Asideパターンの実装

```javascript
const Redis = require('ioredis')
const redis = new Redis()

/**
 * キャッシュ付きデータ取得関数
 * @param {string} key - キャッシュキー
 * @param {number} ttl - 有効期限（秒）
 * @param {Function} fetchFn - キャッシュミス時にデータを取得する関数
 */
async function getWithCache(key, ttl, fetchFn) {
  // 1. キャッシュを確認
  const cached = await redis.get(key)
  if (cached !== null) {
    console.log(`キャッシュヒット: ${key}`)
    return JSON.parse(cached)
  }

  // 2. キャッシュミス → データを取得
  console.log(`キャッシュミス: ${key}`)
  const data = await fetchFn()

  // 3. キャッシュに保存
  if (data !== null && data !== undefined) {
    await redis.set(key, JSON.stringify(data), 'EX', ttl)
  }

  return data
}

// 使用例
async function getUserProfile(userId) {
  return getWithCache(
    `cache:user:${userId}`,
    300, // 5分
    async () => {
      // この部分が実際のDB問い合わせ
      const result = await db.query('SELECT * FROM users WHERE id = $1', [userId])
      return result.rows[0]
    }
  )
}
```

## セッション管理での活用

### express-session + connect-redis

Expressアプリケーションでセッションデータをredisに保存する方法。デフォルトのメモリストアはサーバー再起動でセッションが消えるため、本番環境ではRedisを使う。

```bash
npm install express express-session connect-redis ioredis
```

```javascript
const express = require('express')
const session = require('express-session')
const RedisStore = require('connect-redis').default
const Redis = require('ioredis')

const app = express()
const redisClient = new Redis()

// セッション設定
app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: 'sess:', // Redisキーのプレフィックス
    }),
    secret: 'your-secret-key', // 本番環境では環境変数から取得すること
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // 本番環境ではtrue（HTTPS必須）
      httpOnly: true, // JavaScriptからアクセス不可
      maxAge: 1000 * 60 * 60 * 24, // 24時間
    },
  })
)

// ログインAPI
app.post('/login', (req, res) => {
  // 認証処理（省略）
  req.session.userId = 'user_1001'
  req.session.userName = 'Taro'
  res.json({ message: 'ログインしました' })
})

// セッション確認API
app.get('/profile', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: '未ログイン' })
  }
  res.json({
    userId: req.session.userId,
    userName: req.session.userName,
  })
})

// ログアウトAPI
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'ログアウトに失敗しました' })
    }
    res.json({ message: 'ログアウトしました' })
  })
})

app.listen(3000, () => {
  console.log('サーバー起動: http://localhost:3000')
})
```

Redisにセッションがどう保存されているか確認:

```bash
redis-cli
KEYS sess:*
# 1) "sess:xxxxxxxxxxxxxxxxxxxxxx"

GET "sess:xxxxxxxxxxxxxxxxxxxxxx"
# {"cookie":{"originalMaxAge":86400000,...},"userId":"user_1001","userName":"Taro"}
```

### なぜセッションにRedisを使うのか

| 保存先               | メリット                                 | デメリット                               |
| -------------------- | ---------------------------------------- | ---------------------------------------- |
| メモリ（デフォルト） | 設定不要、高速                           | サーバー再起動で消える、スケールできない |
| データベース         | 永続化、堅牢                             | 遅い、DBに負荷がかかる                   |
| Redis                | 高速、永続化可能、複数サーバーで共有可能 | 別途Redisの運用が必要                    |

複数のWebサーバーを並べてロードバランシングしている場合、メモリに保存するとユーザーのリクエストが別のサーバーに振り分けられた時にセッションが見つからない。Redisを使えば全サーバーが同じセッションデータにアクセスできる。

## Pub/Sub（リアルタイム通信パターン）

Pub/Sub（Publish/Subscribe）は、メッセージの送信者（Publisher）と受信者（Subscriber）を分離する通信パターン。チャットアプリやリアルタイム通知に使える。

### 仕組み

```
Publisher → チャンネル → Subscriber 1
                      → Subscriber 2
                      → Subscriber 3
```

新聞の定期購読に似ている。出版社（Publisher）が新聞（メッセージ）を発行し、購読者（Subscriber）がそれを受け取る。出版社は購読者が誰かを知らなくてよい。

### redis-cliでの実行例

ターミナルを2つ開いて試す。

**ターミナル1（Subscriber）**:

```bash
redis-cli
SUBSCRIBE chat:room:1
# Reading messages...
```

**ターミナル2（Publisher）**:

```bash
redis-cli
PUBLISH chat:room:1 "Hello, everyone!"
PUBLISH chat:room:1 "How are you?"
```

ターミナル1に「Hello, everyone!」「How are you?」が表示される。

### Node.jsでの実装例

```javascript
const Redis = require('ioredis')

// Subscriber（受信側）
const subscriber = new Redis()
subscriber.subscribe('notifications', (err) => {
  if (err) {
    console.error('購読に失敗:', err)
    return
  }
  console.log('notifications チャンネルを購読開始')
})

subscriber.on('message', (channel, message) => {
  console.log(`[${channel}] ${message}`)
  const data = JSON.parse(message)
  // 通知の処理...
})

// Publisher（送信側）
const publisher = new Redis()
publisher.publish(
  'notifications',
  JSON.stringify({
    type: 'new_comment',
    userId: 'user_1001',
    message: '新しいコメントがあります',
    timestamp: Date.now(),
  })
)
```

**注意**: Redis Pub/Subはメッセージを永続化しない。Subscriberがオフラインの間に送られたメッセージは失われる。永続化が必要な場合はRedis Streamsを使うこと。

## キャッシュの注意点

キャッシュは強力だが、正しく設計しないと重大な問題を引き起こす。以下の3つの問題パターンを理解しておくこと。

### キャッシュ穿孔（Cache Penetration）

**問題**: 存在しないデータへのリクエストが大量に来ると、毎回キャッシュミスになりDBに負荷がかかる。

例: `user:99999999`のような存在しないユーザーIDへの問い合わせ。キャッシュにもDBにもデータがないため、毎回DBまでアクセスしてしまう。悪意のある攻撃で利用されることもある。

**対策**:

```javascript
// 対策1: 空の結果もキャッシュする（短いTTLで）
async function getUser(userId) {
  const cached = await redis.get(`user:${userId}`)
  if (cached !== null) {
    if (cached === 'NULL') return null // 空キャッシュ
    return JSON.parse(cached)
  }

  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId])
  if (user) {
    await redis.set(`user:${userId}`, JSON.stringify(user), 'EX', 300)
  } else {
    // 存在しないことをキャッシュ（短いTTLで）
    await redis.set(`user:${userId}`, 'NULL', 'EX', 60)
  }
  return user
}

// 対策2: ブルームフィルターで存在チェック
// 存在しないキーへのアクセスをDBに到達させない
```

### キャッシュ雪崩（Cache Avalanche）

**問題**: 大量のキャッシュが同時に期限切れになり、一斉にDBへリクエストが殺到する。

例: 深夜0時にキャッシュを一括で設定し、TTLを全て同じ1時間にすると、深夜1時に全キャッシュが同時に切れる。

**対策**:

```javascript
// 対策: TTLにランダムなジッターを追加
function getRandomTTL(baseTTL) {
  // 基本TTLの +/- 20%のランダム値を返す
  const jitter = Math.floor(baseTTL * 0.2 * Math.random())
  return baseTTL + jitter
}

// 使用例: 基本300秒 + 0-60秒のランダム
await redis.set(key, value, 'EX', getRandomTTL(300))
```

### キャッシュ無効化（Cache Invalidation）

「コンピュータサイエンスで最も難しい2つのこと: キャッシュの無効化と名前付け」という有名な格言がある。

**問題**: データが更新されたとき、キャッシュをどうやって最新に保つか。

**対策パターン**:

```javascript
// パターン1: 更新時にキャッシュを削除
async function updateUser(userId, data) {
  await db.query('UPDATE users SET name = $1 WHERE id = $2', [data.name, userId])
  await redis.del(`user:${userId}`) // キャッシュを削除
}

// パターン2: 更新時にキャッシュも更新
async function updateUser(userId, data) {
  const updatedUser = await db.query('UPDATE users SET name = $1 WHERE id = $2 RETURNING *', [
    data.name,
    userId,
  ])
  await redis.set(`user:${userId}`, JSON.stringify(updatedUser), 'EX', 300)
}

// パターン3: TTLを短くして自然に期限切れを待つ（結果整合性）
// 多少古いデータが表示されても問題ないケースで使う
```

**実務でのアドバイス**: 迷ったら「更新時にキャッシュを削除」（パターン1）を使う。シンプルで安全。次に読まれたときに自動的にDBから最新データが取得される。

## 永続化（RDB, AOF）

Redisはインメモリデータストアだが、データをディスクに保存する永続化の仕組みも持っている。サーバーが再起動してもデータを復元できる。

### RDB（Redis Database Backup）

一定間隔でメモリの内容をスナップショットとしてディスクに保存する方式。

```
# redis.conf の設定例
save 900 1     # 900秒（15分）の間に1回以上の書き込みがあれば保存
save 300 10    # 300秒（5分）の間に10回以上の書き込みがあれば保存
save 60 10000  # 60秒の間に10000回以上の書き込みがあれば保存
```

**メリット**: コンパクトなバイナリファイル。バックアップが簡単。復旧が高速。

**デメリット**: スナップショット間のデータは失われる可能性がある（最大で設定間隔分のデータロス）。

### AOF（Append Only File）

全ての書き込み操作をログとしてファイルに追記する方式。

```
# redis.conf の設定例
appendonly yes
appendfsync everysec  # 1秒ごとにディスクに書き込み
# appendfsync always  # 毎回ディスクに書き込み（最も安全だが遅い）
# appendfsync no      # OSに任せる（最も速いが安全性は低い）
```

**メリット**: データの損失が最小限（最大1秒分）。ファイルが人間に読める形式。

**デメリット**: RDBよりファイルが大きくなる。復旧がRDBより遅い。

### RDB vs AOF 比較表

| 特徴                 | RDB                            | AOF                         |
| -------------------- | ------------------------------ | --------------------------- |
| データ安全性         | 低い（間隔分のデータロス）     | 高い（最大1秒のデータロス） |
| ファイルサイズ       | 小さい                         | 大きい                      |
| 復旧速度             | 速い                           | 遅い                        |
| パフォーマンス       | 高い                           | やや低い                    |
| バックアップの容易さ | 簡単（1ファイルコピー）        | やや面倒                    |
| 推奨用途             | バックアップ、レプリケーション | データの耐久性が重要な場合  |

**実務でのアドバイス**: RDBとAOFの両方を有効にするのが推奨。AOFでデータの安全性を確保し、RDBでバックアップを取る。

## Redis vs Memcached

RedisとMemcachedはどちらもインメモリキャッシュだが、機能に大きな違いがある。

| 比較項目         | Redis                                              | Memcached            |
| ---------------- | -------------------------------------------------- | -------------------- |
| データ型         | String, List, Set, Sorted Set, Hash, Stream等      | Stringのみ           |
| 永続化           | RDB, AOF                                           | なし                 |
| レプリケーション | 対応                                               | なし                 |
| クラスタリング   | Redis Cluster対応                                  | クライアント側で実装 |
| Pub/Sub          | 対応                                               | なし                 |
| Lua スクリプト   | 対応                                               | なし                 |
| トランザクション | MULTI/EXEC対応                                     | なし                 |
| メモリ効率       | やや低い（構造体のオーバーヘッド）                 | 高い                 |
| マルチスレッド   | シングルスレッド（Redis 6以降はI/Oマルチスレッド） | マルチスレッド       |
| 最大キーサイズ   | 512MB                                              | 1MB                  |
| 学習コスト       | やや高い                                           | 低い                 |

**結論**: ほとんどの場合、Redisを選択すること。Memcachedが適しているのは、シンプルなキーバリューキャッシュだけが必要で、メモリ効率を極限まで追求したい場合のみ。

## 実務での使用例

### 1. APIレスポンスキャッシュ

外部APIの結果や、計算コストの高いクエリ結果をキャッシュする。

```javascript
const express = require('express')
const Redis = require('ioredis')
const redis = new Redis()
const app = express()

// キャッシュミドルウェア
function cacheMiddleware(ttl) {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`
    const cached = await redis.get(key)

    if (cached) {
      return res.json(JSON.parse(cached))
    }

    // レスポンスをインターセプトしてキャッシュに保存
    const originalJson = res.json.bind(res)
    res.json = async (data) => {
      await redis.set(key, JSON.stringify(data), 'EX', ttl)
      return originalJson(data)
    }

    next()
  }
}

// 使用例: 記事一覧を5分間キャッシュ
app.get('/api/articles', cacheMiddleware(300), async (req, res) => {
  const articles = await db.query('SELECT * FROM articles ORDER BY created_at DESC')
  res.json(articles)
})
```

### 2. ランキングボード

Sorted Setを使ったリアルタイムランキング。

```javascript
// スコアを登録
async function addScore(gameId, playerId, score) {
  await redis.zadd(`ranking:${gameId}`, score, playerId)
}

// 上位N名を取得
async function getTopRanking(gameId, count = 10) {
  const results = await redis.zrevrange(`ranking:${gameId}`, 0, count - 1, 'WITHSCORES')

  // [player1, score1, player2, score2, ...] を整形
  const ranking = []
  for (let i = 0; i < results.length; i += 2) {
    ranking.push({
      rank: i / 2 + 1,
      playerId: results[i],
      score: parseInt(results[i + 1]),
    })
  }
  return ranking
}

// 特定プレイヤーの順位を取得
async function getPlayerRank(gameId, playerId) {
  const rank = await redis.zrevrank(`ranking:${gameId}`, playerId)
  return rank !== null ? rank + 1 : null // 0始まりを1始まりに変換
}
```

### 3. レート制限（Rate Limiting）

APIの呼び出し回数を制限する。DoS攻撃の緩和にも有効。

```javascript
/**
 * 固定ウィンドウ方式のレート制限
 * @param {string} identifier - ユーザーIDやIPアドレス
 * @param {number} limit - ウィンドウあたりの最大リクエスト数
 * @param {number} windowSeconds - ウィンドウサイズ（秒）
 */
async function rateLimit(identifier, limit, windowSeconds) {
  const key = `ratelimit:${identifier}:${Math.floor(Date.now() / 1000 / windowSeconds)}`

  const current = await redis.incr(key)
  if (current === 1) {
    await redis.expire(key, windowSeconds)
  }

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
    limit,
  }
}

// Expressミドルウェアとして使用
app.use(async (req, res, next) => {
  const result = await rateLimit(req.ip, 100, 60) // 1分間に100リクエストまで
  res.set('X-RateLimit-Limit', result.limit)
  res.set('X-RateLimit-Remaining', result.remaining)

  if (!result.allowed) {
    return res.status(429).json({ message: 'リクエストが多すぎます。しばらく待ってください。' })
  }
  next()
})
```

### 4. 分散ロック

複数のサーバーで同じリソースへの同時アクセスを防ぐ。

```javascript
/**
 * 分散ロックの取得
 * @param {string} resource - ロック対象のリソース名
 * @param {number} ttl - ロックの有効期限（秒）
 */
async function acquireLock(resource, ttl = 30) {
  const lockKey = `lock:${resource}`
  const lockValue = `${Date.now()}-${Math.random()}`

  // NXオプション: キーが存在しない場合のみセット
  const result = await redis.set(lockKey, lockValue, 'NX', 'EX', ttl)

  if (result === 'OK') {
    return lockValue // ロック取得成功
  }
  return null // ロック取得失敗（他のプロセスがロック中）
}

/**
 * 分散ロックの解放
 */
async function releaseLock(resource, lockValue) {
  const lockKey = `lock:${resource}`

  // Luaスクリプトで安全にロックを解放（自分のロックだけ解放する）
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `
  return redis.eval(script, 1, lockKey, lockValue)
}

// 使用例
async function processPayment(orderId) {
  const lockValue = await acquireLock(`order:${orderId}`, 30)
  if (!lockValue) {
    throw new Error('別のプロセスが処理中です')
  }

  try {
    // 決済処理（この間、他のプロセスは同じ注文を処理できない）
    await executePayment(orderId)
  } finally {
    await releaseLock(`order:${orderId}`, lockValue)
  }
}
```

## 実践演習

### 演習1: 基本操作の練習

redis-cliで以下の操作を行ってみよう。

```bash
# 1. 自分のプロフィールをHashで保存
HSET myprofile name "自分の名前" age "25" language "JavaScript"

# 2. プロフィールを取得
HGETALL myprofile

# 3. ページビューカウンターを作成
SET pageviews:top 0
INCR pageviews:top
INCR pageviews:top
INCR pageviews:top
GET pageviews:top

# 4. タスクリストを作成
RPUSH tasks "コードレビュー"
RPUSH tasks "テスト作成"
RPUSH tasks "デプロイ"
LRANGE tasks 0 -1

# 5. TTLの動作確認
SET temp "この値は10秒で消える" EX 10
TTL temp
# 10秒待つ
GET temp
# (nil)
```

### 演習2: Node.jsアプリケーション

簡単なAPIサーバーを作成し、Redis キャッシュの効果を体感する。

```javascript
const express = require('express')
const Redis = require('ioredis')

const app = express()
const redis = new Redis()

// 重い処理をシミュレート（2秒かかる）
async function heavyComputation(id) {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return { id, data: `Item ${id}のデータ`, timestamp: new Date().toISOString() }
}

// キャッシュなし
app.get('/api/slow/:id', async (req, res) => {
  const start = Date.now()
  const data = await heavyComputation(req.params.id)
  const elapsed = Date.now() - start
  res.json({ ...data, elapsed: `${elapsed}ms`, cached: false })
})

// キャッシュあり
app.get('/api/fast/:id', async (req, res) => {
  const start = Date.now()
  const key = `cache:item:${req.params.id}`

  const cached = await redis.get(key)
  if (cached) {
    const elapsed = Date.now() - start
    return res.json({ ...JSON.parse(cached), elapsed: `${elapsed}ms`, cached: true })
  }

  const data = await heavyComputation(req.params.id)
  await redis.set(key, JSON.stringify(data), 'EX', 60)
  const elapsed = Date.now() - start
  res.json({ ...data, elapsed: `${elapsed}ms`, cached: false })
})

app.listen(3000, () => {
  console.log('http://localhost:3000 で起動')
  console.log('試してみよう:')
  console.log('  遅い: curl http://localhost:3000/api/slow/1')
  console.log('  速い: curl http://localhost:3000/api/fast/1 (2回目以降)')
})
```

## 参考リンク

- [Redis公式サイト](https://redis.io/) - Redis公式のトップページ
- [Redis公式ドキュメント - コマンドリファレンス](https://redis.io/commands/) - 全コマンドの解説
- [Redis公式ドキュメント - データ型](https://redis.io/docs/data-types/) - データ構造ごとの使い方ガイド
- [ioredis GitHubリポジトリ](https://github.com/redis/ioredis) - Node.js用の高機能Redisクライアント
- [connect-redis GitHubリポジトリ](https://github.com/tj/connect-redis) - Express.jsのセッションストアアダプタ
- [Redis University（無料学習コース）](https://university.redis.io/) - Redis公式の無料オンライン学習
- [Redis Insight（Redis公式GUI管理ツール）](https://redis.io/insight/) - データの可視化と管理ツール
