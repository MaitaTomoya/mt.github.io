---
title: 'MongoDB'
order: 27
section: 'データベース'
---

# MongoDB

## MongoDBとは何か

MongoDB（モンゴディービー）は、**ドキュメント指向のNoSQLデータベース**。データをJSON（正確にはBSON: Binary JSON）形式で保存する。2009年にMongoDB Inc.（旧10gen）によってリリースされた。

特徴:

- **スキーマレス**: テーブル定義なしでデータを保存できる
- **JSONライクなドキュメント**: 開発者にとって直感的なデータ構造
- **水平スケーリング**: シャーディングによるデータ分散が容易
- **高い柔軟性**: スキーマの変更にALTER TABLEのような操作が不要
- eBay、Forbes、SAP、Electronic Artsなどが採用

### BSONとは

MongoDBはデータをBSON（Binary JSON）形式で保存する。BSONはJSONをバイナリ形式にエンコードしたもので、JSONにはないデータ型（Date、ObjectId、Decimal128など）をサポートする。

```
JSON（人間が読める形式）:
{
  "name": "田中太郎",
  "age": 25,
  "email": "taro@example.com"
}

BSON（MongoDBの内部保存形式）:
JSONをバイナリにエンコードしたもの
→ より多くのデータ型をサポート
→ 高速なパース（解析）が可能
```

## なぜNoSQLが必要か

リレーショナルデータベース（RDB）は長年にわたりデータ管理の主流だったが、現代のアプリケーション開発ではRDBだけでは対応しきれないケースがある。

### RDBの限界

| 課題                     | 説明                                                                    |
| ------------------------ | ----------------------------------------------------------------------- |
| スキーマの硬直性         | テーブル構造の変更にALTER TABLEが必要。大規模テーブルでは時間がかかる   |
| 水平スケーリングの困難さ | RDBは垂直スケーリング（サーバーのスペックアップ）が基本。水平分散は複雑 |
| 非構造化データの扱い     | ログ、センサーデータ、SNS投稿など、構造が定まらないデータの保存が困難   |
| JOIN操作のコスト         | テーブルが増えるほどJOINが多くなり、パフォーマンスが低下                |
| 高速な書き込み           | 大量のデータを高速に書き込む必要がある場合、RDBのACIDがボトルネックに   |

### NoSQLが解決する問題

```
RDBのアプローチ:
テーブルA ←JOIN→ テーブルB ←JOIN→ テーブルC
  正規化されたデータ（重複なし、整合性が高い）
  → しかしJOINが増えると遅くなる

MongoDBのアプローチ:
ドキュメント = { 必要なデータを1つにまとめる }
  非正規化されたデータ（一部重複あり、読み取りが高速）
  → JOINなしで必要なデータを取得できる
```

## RDB vs MongoDB（用語対応表）

RDBの経験がある人は、以下の対応表を参考にするとMongoDBの概念が理解しやすい。

| RDB（SQLの用語） | MongoDB（NoSQLの用語）     | 説明                             |
| ---------------- | -------------------------- | -------------------------------- |
| データベース     | データベース               | データの入れ物全体（同じ）       |
| テーブル         | コレクション（Collection） | データの種類ごとのまとまり       |
| 行（レコード）   | ドキュメント（Document）   | 1件のデータ                      |
| 列（カラム）     | フィールド（Field）        | データの項目                     |
| 主キー           | \_id                       | 各ドキュメントを一意に識別する値 |
| 外部キー         | $ref / 参照                | 他のコレクションとの関連付け     |
| JOIN             | $lookup / 埋め込み         | データの結合                     |
| ALTER TABLE      | 不要                       | スキーマの変更が不要             |
| INDEX            | INDEX                      | 検索高速化（同じ概念）           |

### 実際の違いを見てみる

**RDB（MySQL/PostgreSQL）の場合**:

```sql
-- テーブル定義が必要
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255)
);

-- データ挿入
INSERT INTO users (id, name, email) VALUES (1, '田中太郎', 'taro@example.com');
```

**MongoDBの場合**:

```javascript
// テーブル定義不要。そのままデータを挿入できる
db.users.insertOne({
  name: '田中太郎',
  email: 'taro@example.com',
  hobbies: ['読書', 'プログラミング'], // 配列もそのまま保存
  address: {
    // ネストしたオブジェクトもOK
    city: '東京',
    zipCode: '100-0001',
  },
})
```

## インストール

### Dockerを使う方法（推奨）

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    container_name: my-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: rootpassword
      MONGO_INITDB_DATABASE: myapp
    ports:
      - '27017:27017'
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

```bash
# コンテナ起動
docker compose up -d

# MongoDBシェルで接続
docker exec -it my-mongodb mongosh -u root -p rootpassword

# コンテナ停止
docker compose down
```

### MongoDB Atlas（クラウド、推奨）

MongoDB Atlasは、MongoDBの公式クラウドサービス。無料枠（M0クラスタ）があり、学習や小規模プロジェクトに最適。

セットアップ手順:

1. [MongoDB Atlas](https://www.mongodb.com/atlas)にアカウント登録
2. 「Create a Cluster」でM0（無料枠）を選択
3. データベースユーザーを作成
4. IPアクセスリストに自分のIPを追加
5. 「Connect」ボタンから接続文字列を取得

```
# 接続文字列の例
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/myapp
```

### macOSでのローカルインストール

```bash
# Homebrewでインストール
brew tap mongodb/brew
brew install mongodb-community@7.0

# サービス起動
brew services start mongodb-community@7.0

# mongoshで接続
mongosh
```

## mongoshコマンドラインツール

mongosh（MongoDB Shell）は、MongoDBを操作するための対話型シェル。JavaScriptベースで操作する。

```javascript
// データベース一覧
show dbs

// データベース選択（存在しなければ自動作成）
use myapp

// 現在のデータベース確認
db

// コレクション一覧
show collections

// コレクション作成（明示的に作成しなくても、データ挿入時に自動作成される）
db.createCollection("users")

// ヘルプ
db.help()
db.users.help()

// 終了
exit
```

## CRUD操作

MongoDBにおけるデータの作成（Create）、読み取り（Read）、更新（Update）、削除（Delete）操作を学ぶ。

### Create（作成）

```javascript
// 1件挿入
db.users.insertOne({
  name: '田中太郎',
  email: 'taro@example.com',
  age: 25,
  hobbies: ['読書', 'プログラミング'],
  address: {
    city: '東京',
    zipCode: '100-0001',
  },
  createdAt: new Date(),
})

// 複数件挿入
db.users.insertMany([
  {
    name: '佐藤花子',
    email: 'hanako@example.com',
    age: 28,
    hobbies: ['料理', '旅行'],
    address: { city: '大阪', zipCode: '530-0001' },
    createdAt: new Date(),
  },
  {
    name: '鈴木次郎',
    email: 'jiro@example.com',
    age: 32,
    hobbies: ['スポーツ'],
    address: { city: '名古屋', zipCode: '450-0001' },
    createdAt: new Date(),
  },
])
```

### Read（読み取り）

```javascript
// 全件取得
db.users.find()

// 整形して表示
db.users.find().pretty()

// 条件指定（ageが25のユーザー）
db.users.findOne({ age: 25 })

// クエリ演算子

// $eq: 等しい
db.users.find({ age: { $eq: 25 } })

// $gt: より大きい、$gte: 以上
db.users.find({ age: { $gt: 25 } })
db.users.find({ age: { $gte: 25 } })

// $lt: より小さい、$lte: 以下
db.users.find({ age: { $lt: 30 } })

// $in: いずれかに一致
db.users.find({ age: { $in: [25, 28, 32] } })

// $and: かつ
db.users.find({ $and: [{ age: { $gte: 25 } }, { age: { $lte: 30 } }] })

// $or: または
db.users.find({ $or: [{ age: 25 }, { age: 32 }] })

// $regex: 正規表現
db.users.find({ name: { $regex: /^田中/ } })

// ネストしたフィールドの検索
db.users.find({ 'address.city': '東京' })

// 配列内の要素を検索
db.users.find({ hobbies: '読書' })

// 特定フィールドのみ取得（プロジェクション）
db.users.find({}, { name: 1, email: 1, _id: 0 })

// ソート（1: 昇順、-1: 降順）
db.users.find().sort({ age: 1 })

// 件数制限とスキップ（ページネーション）
db.users.find().skip(0).limit(10) // 1ページ目
db.users.find().skip(10).limit(10) // 2ページ目

// 件数カウント
db.users.countDocuments({ age: { $gte: 25 } })
```

### Update（更新）

```javascript
// 1件更新
db.users.updateOne(
  { email: 'taro@example.com' }, // フィルタ条件
  { $set: { age: 26 } } // 更新内容
)

// 複数件更新
db.users.updateMany({ age: { $lt: 30 } }, { $set: { status: 'young' } })

// $set: フィールドの値を設定（存在しなければ追加）
db.users.updateOne({ email: 'taro@example.com' }, { $set: { phone: '090-1234-5678' } })

// $inc: 数値を増減
db.users.updateOne(
  { email: 'taro@example.com' },
  { $inc: { age: 1 } } // ageを1増やす
)

// $push: 配列に要素を追加
db.users.updateOne({ email: 'taro@example.com' }, { $push: { hobbies: '映画鑑賞' } })

// $pull: 配列から要素を削除
db.users.updateOne({ email: 'taro@example.com' }, { $pull: { hobbies: '読書' } })

// $unset: フィールドを削除
db.users.updateOne({ email: 'taro@example.com' }, { $unset: { phone: '' } })

// upsert: 存在しなければ挿入、存在すれば更新
db.users.updateOne(
  { email: 'new@example.com' },
  { $set: { name: '新規ユーザー', age: 20 } },
  { upsert: true }
)
```

### Delete（削除）

```javascript
// 1件削除
db.users.deleteOne({ email: 'taro@example.com' })

// 複数件削除
db.users.deleteMany({ age: { $lt: 20 } })

// 全件削除（注意して使用すること）
db.users.deleteMany({})

// コレクション自体を削除
db.users.drop()
```

## ドキュメント設計パターン

MongoDBのドキュメント設計は、RDBの正規化とは異なるアプローチを取る。

### 埋め込み（Embedding）vs 参照（Referencing）

```javascript
// --- 埋め込みパターン ---
// 関連データをドキュメント内に直接含める
{
  _id: ObjectId("..."),
  name: "田中太郎",
  email: "taro@example.com",
  orders: [
    { productId: 1, productName: "りんご", quantity: 3, price: 150 },
    { productId: 2, productName: "バナナ", quantity: 5, price: 100 }
  ]
}

// --- 参照パターン ---
// 別コレクションのドキュメントを参照
// usersコレクション
{
  _id: ObjectId("user1"),
  name: "田中太郎",
  email: "taro@example.com"
}

// ordersコレクション
{
  _id: ObjectId("order1"),
  userId: ObjectId("user1"),  // usersコレクションへの参照
  productName: "りんご",
  quantity: 3,
  price: 150
}
```

### 判断基準

| 基準                   | 埋め込み             | 参照                  |
| ---------------------- | -------------------- | --------------------- |
| データの読み取り頻度   | 一緒に読むことが多い | 別々に読むことが多い  |
| データの更新頻度       | 更新が少ない         | 更新が頻繁            |
| データサイズ           | 小〜中程度           | 大きい                |
| 関連の種類             | 1対1、1対少          | 1対多（大量）、多対多 |
| ドキュメントサイズ制限 | 16MBの制限に注意     | 制限の心配なし        |

### 1対1の設計

```javascript
// 埋め込み（推奨）
{
  _id: ObjectId("..."),
  name: "田中太郎",
  profile: {
    bio: "Webエンジニアです",
    website: "https://example.com",
    socialLinks: {
      twitter: "@tanaka",
      github: "tanaka-taro"
    }
  }
}
```

### 1対多の設計

```javascript
// 少数の場合: 埋め込み
{
  _id: ObjectId("..."),
  title: "MongoDBの基礎",
  comments: [
    { author: "佐藤", text: "分かりやすい!", createdAt: ISODate("2024-01-01") },
    { author: "鈴木", text: "参考になりました", createdAt: ISODate("2024-01-02") }
  ]
}

// 多数の場合: 参照
// postsコレクション
{
  _id: ObjectId("post1"),
  title: "MongoDBの基礎"
}

// commentsコレクション（数千件になりうる場合）
{
  _id: ObjectId("comment1"),
  postId: ObjectId("post1"),
  author: "佐藤",
  text: "分かりやすい!",
  createdAt: ISODate("2024-01-01")
}
```

### 多対多の設計

```javascript
// studentsコレクション
{
  _id: ObjectId("student1"),
  name: "田中太郎",
  courseIds: [ObjectId("course1"), ObjectId("course2")]
}

// coursesコレクション
{
  _id: ObjectId("course1"),
  title: "データベース入門",
  studentIds: [ObjectId("student1"), ObjectId("student2")]
}
```

### スキーマ設計のベストプラクティス

1. **アクセスパターンを先に考える**: どのようなクエリが多いかを分析してから設計する
2. **一緒に読むデータは一緒に保存する**: JOINを避け、1回のクエリで必要なデータを取得
3. **16MBのドキュメントサイズ制限を意識する**: 無限に増えるデータは参照パターンを使う
4. **書き込み頻度を考慮する**: 埋め込みデータの更新が多い場合は参照パターンを検討

## インデックス

インデックスはクエリの実行速度を大幅に向上させる。

### インデックスの種類

```javascript
// 単一フィールドインデックス
db.users.createIndex({ email: 1 }) // 1: 昇順、-1: 降順

// 複合インデックス（複数フィールド）
db.users.createIndex({ age: 1, name: 1 })

// ユニークインデックス
db.users.createIndex({ email: 1 }, { unique: true })

// テキストインデックス（全文検索用）
db.articles.createIndex({ title: 'text', body: 'text' })

// テキスト検索の実行
db.articles.find({ $text: { $search: 'MongoDB データベース' } })

// TTLインデックス（一定時間後に自動削除）
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 } // 1時間後に自動削除
)

// インデックス一覧確認
db.users.getIndexes()

// インデックス削除
db.users.dropIndex('email_1')

// 実行計画の確認（EXPLAINに相当）
db.users.find({ email: 'taro@example.com' }).explain('executionStats')
```

## Aggregation Pipeline

Aggregation Pipelineは、MongoDBにおけるデータ集計・変換の仕組み。SQLのGROUP BY、HAVING、JOINに相当する機能を提供する。

```
データの流れ:

コレクション
    |
    v
[$match]     → 条件でフィルタ（WHERE句に相当）
    |
    v
[$group]     → グループ化と集計（GROUP BY句に相当）
    |
    v
[$sort]      → ソート（ORDER BY句に相当）
    |
    v
[$project]   → 出力フィールドの選択（SELECT句に相当）
    |
    v
結果
```

### 主要なステージ

```javascript
// テストデータ
db.orders.insertMany([
  { customer: '田中', product: 'りんご', quantity: 3, price: 150, date: ISODate('2024-01-15') },
  { customer: '佐藤', product: 'バナナ', quantity: 5, price: 100, date: ISODate('2024-01-15') },
  { customer: '田中', product: 'みかん', quantity: 2, price: 200, date: ISODate('2024-01-16') },
  { customer: '鈴木', product: 'りんご', quantity: 1, price: 150, date: ISODate('2024-01-16') },
  { customer: '佐藤', product: 'りんご', quantity: 4, price: 150, date: ISODate('2024-01-17') },
])

// $match: 条件フィルタ
db.orders.aggregate([{ $match: { product: 'りんご' } }])

// $group: グループ化と集計
db.orders.aggregate([
  {
    $group: {
      _id: '$customer', // グループ化のキー
      totalSpent: { $sum: { $multiply: ['$quantity', '$price'] } }, // 合計金額
      orderCount: { $sum: 1 }, // 注文回数
      avgQuantity: { $avg: '$quantity' }, // 平均数量
    },
  },
])

// $sort: ソート
db.orders.aggregate([
  { $group: { _id: '$customer', totalSpent: { $sum: { $multiply: ['$quantity', '$price'] } } } },
  { $sort: { totalSpent: -1 } }, // 合計金額の降順
])

// $project: 出力フィールドの選択と変換
db.orders.aggregate([
  {
    $project: {
      customer: 1,
      product: 1,
      totalPrice: { $multiply: ['$quantity', '$price'] },
      _id: 0,
    },
  },
])

// $lookup: 他のコレクションとのJOIN
db.orders.aggregate([
  {
    $lookup: {
      from: 'users', // 結合するコレクション
      localField: 'customer', // ordersコレクションのフィールド
      foreignField: 'name', // usersコレクションのフィールド
      as: 'customerInfo', // 結果を格納するフィールド名
    },
  },
])

// $unwind: 配列をフラットに展開
db.users.aggregate([
  { $unwind: '$hobbies' },
  { $group: { _id: '$hobbies', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
])

// 実用例: 日別売上レポート
db.orders.aggregate([
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
      totalSales: { $sum: { $multiply: ['$quantity', '$price'] } },
      orderCount: { $sum: 1 },
    },
  },
  { $sort: { _id: 1 } },
  {
    $project: {
      date: '$_id',
      totalSales: 1,
      orderCount: 1,
      _id: 0,
    },
  },
])
```

## MongoDB Atlas

MongoDB Atlasは、MongoDBの公式クラウドサービス。インフラの管理をMongoDB社に任せることができる。

### 料金プラン

| プラン     | 月額             | 特徴                          |
| ---------- | ---------------- | ----------------------------- |
| M0（無料） | 0円              | 512MBストレージ、共有クラスタ |
| M2 / M5    | 約1,000〜3,000円 | 小規模本番環境向け            |
| M10以上    | 約8,000円〜      | 専用クラスタ、本番環境推奨    |

### 主な機能

- **自動バックアップ**: 定期的にスナップショットを取得
- **監視ダッシュボード**: パフォーマンスメトリクスをリアルタイムで確認
- **アラート**: 異常を検知して通知
- **全文検索（Atlas Search）**: Luceneベースの高度な検索機能
- **Data Explorer**: ブラウザからデータを閲覧・編集

## レプリケーションとシャーディング

### レプリカセット

レプリカセットは、同じデータのコピーを複数のサーバーに持つ構成。高可用性とデータ保護を実現する。

```
レプリカセットの構成:

[プライマリ]  ←→  [セカンダリ 1]
                ←→  [セカンダリ 2]

- プライマリ: 読み書き可能（1台のみ）
- セカンダリ: 読み取り可能（プライマリからデータを複製）
- プライマリがダウン → セカンダリが自動的にプライマリに昇格（フェイルオーバー）
```

### シャーディング

シャーディングは、データを複数のサーバーに分散して保存する仕組み。大量のデータを扱う場合に使用する。

```
シャーディングの構成:

[mongosルーター]
    |
    +---→ [シャード1] (ユーザーID: 1-1000)
    +---→ [シャード2] (ユーザーID: 1001-2000)
    +---→ [シャード3] (ユーザーID: 2001-3000)

アプリケーションはmongosに接続するだけ。
データの分散は自動的に行われる。
```

## トランザクション

MongoDB 4.0以降、マルチドキュメントトランザクションがサポートされている。

```javascript
// mongoshでのトランザクション例
const session = db.getMongo().startSession()
session.startTransaction()

try {
  const usersCol = session.getDatabase('myapp').users
  const ordersCol = session.getDatabase('myapp').orders

  // ユーザーの残高を減らす
  usersCol.updateOne(
    { _id: ObjectId('user1'), balance: { $gte: 1000 } },
    { $inc: { balance: -1000 } },
    { session }
  )

  // 注文を作成
  ordersCol.insertOne(
    {
      userId: ObjectId('user1'),
      product: '商品A',
      amount: 1000,
      createdAt: new Date(),
    },
    { session }
  )

  session.commitTransaction()
} catch (error) {
  session.abortTransaction()
  throw error
} finally {
  session.endSession()
}
```

**注意**: MongoDBのトランザクションはRDBに比べてオーバーヘッドが大きい。ドキュメント設計を工夫して、トランザクションの必要性を減らすことが推奨される。

## Node.js + MongoDB（Mongoose）

MongooseはNode.js向けの最も人気のあるMongoDB ODM（Object Document Mapper）。スキーマ定義、バリデーション、ミドルウェアなどの機能を提供する。

### セットアップ

```bash
npm install mongoose
```

### 基本的な使い方

```javascript
// db.js - 接続設定
const mongoose = require('mongoose')

async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/myapp', {
      // MongoDB Atlasの場合:
      // 'mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/myapp'
    })
    console.log('MongoDBに接続しました')
  } catch (error) {
    console.error('MongoDB接続エラー:', error)
    process.exit(1)
  }
}

module.exports = connectDB
```

```javascript
// models/User.js - スキーマ定義
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '名前は必須です'],
      trim: true,
      maxlength: [100, '名前は100文字以内で入力してください'],
    },
    email: {
      type: String,
      required: [true, 'メールアドレスは必須です'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, '有効なメールアドレスを入力してください'],
    },
    age: {
      type: Number,
      min: [0, '年齢は0以上で入力してください'],
      max: [150, '年齢は150以下で入力してください'],
    },
    hobbies: [String],
    address: {
      city: String,
      zipCode: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
  },
  {
    timestamps: true, // createdAt, updatedAtを自動管理
  }
)

// インデックスの定義
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ age: 1, name: 1 })

// インスタンスメソッド
userSchema.methods.getFullInfo = function () {
  return `${this.name} (${this.email}) - ${this.age}歳`
}

// 静的メソッド
userSchema.statics.findByAge = function (minAge, maxAge) {
  return this.find({ age: { $gte: minAge, $lte: maxAge } })
}

const User = mongoose.model('User', userSchema)
module.exports = User
```

```javascript
// controllers/userController.js - CRUD操作
const User = require('../models/User')

// ユーザー一覧取得
async function getUsers() {
  const users = await User.find()
    .select('name email age') // 必要なフィールドのみ
    .sort({ createdAt: -1 })
    .limit(20)
  return users
}

// ユーザー作成
async function createUser(data) {
  const user = new User(data)
  await user.save()
  return user
}

// ユーザー検索
async function searchUsers(query) {
  const users = await User.find({
    $or: [{ name: { $regex: query, $options: 'i' } }, { email: { $regex: query, $options: 'i' } }],
  })
  return users
}

// ユーザー更新
async function updateUser(id, data) {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true } // 更新後のドキュメントを返す
  )
  return user
}

// ユーザー削除
async function deleteUser(id) {
  const result = await User.findByIdAndDelete(id)
  return result
}
```

## いつMongoDBを選ぶべきか / 選ばないべきか

### MongoDBが向いているケース

- **スキーマが頻繁に変わるプロジェクト**: スタートアップや新規サービスの初期段階
- **非構造化・半構造化データ**: ログ、IoTセンサーデータ、CMSコンテンツ
- **高速な読み書き**: キャッシュ的な使い方、リアルタイムアプリケーション
- **水平スケーリングが必要**: 大量のデータを複数サーバーに分散
- **プロトタイプ開発**: 素早くデータモデルを試したい場合
- **JSONベースのAPI**: フロントエンドとのデータ受け渡しが簡単

### MongoDBが向いていないケース

- **複雑なJOINが多い**: RDBの方が効率的
- **厳密なトランザクションが必要**: 銀行の送金処理など
- **厳格なスキーマが必要**: データの整合性が最優先の場合
- **集計・分析が主な用途**: PostgreSQLやデータウェアハウスの方が適切
- **チームにRDB経験者が多い**: 学習コストを考慮

## 採用企業

| 企業/サービス        | 用途                               |
| -------------------- | ---------------------------------- |
| eBay                 | 商品検索、レコメンデーション       |
| Forbes               | コンテンツ管理システム             |
| SAP                  | エンタープライズアプリケーション   |
| Electronic Arts (EA) | ゲームデータの管理                 |
| Adobe                | クリエイティブツールのバックエンド |
| Uber                 | 位置情報データの管理               |
| Cisco                | ネットワーク管理プラットフォーム   |

## まとめ

MongoDBは、柔軟なスキーマと高いスケーラビリティを持つNoSQLデータベース。以下のポイントを押さえておくことが重要。

1. **ドキュメント設計を先に考える**: アクセスパターンに基づいて埋め込みか参照かを決める
2. **インデックスを適切に設定する**: explain()で実行計画を確認する
3. **Aggregation Pipelineを活用する**: 複雑な集計も柔軟に対応
4. **16MBのドキュメントサイズ制限を意識する**: 無限に増えるデータは参照パターンを使う
5. **トランザクションは必要最小限に**: ドキュメント設計でトランザクションの必要性を減らす
6. **MongoDB Atlasを活用する**: 運用の手間を大幅に削減できる

## 参考リンク

- [MongoDB公式ドキュメント](https://www.mongodb.com/docs/)
- [MongoDB University（無料学習コース）](https://learn.mongodb.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Mongoose公式ドキュメント](https://mongoosejs.com/docs/)
- [MongoDB Manual - CRUD Operations](https://www.mongodb.com/docs/manual/crud/)
- [MongoDB Manual - Aggregation](https://www.mongodb.com/docs/manual/aggregation/)
- [MongoDB Manual - Data Modeling](https://www.mongodb.com/docs/manual/data-modeling/)
