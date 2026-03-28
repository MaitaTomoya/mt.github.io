---
title: 'DynamoDB'
order: 28
section: 'データベース'
---

# DynamoDB

## DynamoDBとは何か

Amazon DynamoDB（ダイナモディービー）は、**AWSが提供するフルマネージドのNoSQLデータベースサービス**。キーバリュー型とドキュメント型の両方の特性を持ち、あらゆる規模のワークロードに対応できる。

特徴:

- **フルマネージド**: サーバーの管理、パッチ適用、バックアップが不要
- **自動スケーリング**: トラフィックに応じて自動的に処理能力を調整
- **低レイテンシ**: 1桁ミリ秒のレスポンスタイムを実現
- **従量課金**: 使った分だけ支払う料金モデル
- **高可用性**: 3つのアベイラビリティゾーンに自動複製
- Amazon、Netflix、Lyft、Samsung、Airbnbなどが大規模に採用

### サーバーレスデータベースとは

従来のデータベースとDynamoDBの違いを比較する。

```
従来のデータベース（MySQL、PostgreSQLなど）:
  [アプリケーション] → [DBサーバー]
  - サーバーのプロビジョニングが必要
  - OSのパッチ適用が必要
  - ディスク容量の管理が必要
  - スケーリングは手動（または半自動）
  - 月額固定費が発生

DynamoDB:
  [アプリケーション] → [DynamoDB API]
  - サーバーの概念がない
  - インフラ管理は全てAWSが担当
  - ストレージは自動拡張
  - スケーリングは完全自動
  - 使った分だけ課金
```

### サーバーレスDBの利点

| 利点             | 説明                                             |
| ---------------- | ------------------------------------------------ |
| インフラ管理不要 | サーバーの構築・保守・監視をAWSに任せられる      |
| 自動スケーリング | アクセス数の増減に自動で対応                     |
| 高可用性         | 複数のAZにデータを自動複製。SLA 99.999%          |
| 従量課金         | アクセスが少ない時期はコストも低い               |
| セキュリティ     | 保存時・通信時の暗号化がデフォルト               |
| バックアップ     | Point-in-Time Recovery（PITR）で自動バックアップ |

## DynamoDBの基本概念

DynamoDBの概念はRDBとは大きく異なる。まず用語を整理する。

### 用語の対応

| RDBの用語      | DynamoDBの用語                  | 説明                     |
| -------------- | ------------------------------- | ------------------------ |
| テーブル       | テーブル                        | データの入れ物（同じ）   |
| 行（レコード） | アイテム（Item）                | 1件のデータ              |
| 列（カラム）   | 属性（Attribute）               | データの項目             |
| 主キー         | パーティションキー + ソートキー | データを一意に識別       |
| スキーマ       | キー属性のみ定義                | 非キー属性はスキーマレス |
| インデックス   | GSI / LSI                       | セカンダリインデックス   |

### テーブル、アイテム、属性

```
テーブル: Users
+-------------------+-------------------+--------+------------------+
| userId (PK)       | name              | age    | email            |
+-------------------+-------------------+--------+------------------+
| user-001          | 田中太郎          | 25     | taro@example.com |
| user-002          | 佐藤花子          | 28     | hanako@example.com|
| user-003          | 鈴木次郎          | 32     | --（属性なし）-- |
+-------------------+-------------------+--------+------------------+

PK = パーティションキー（必須）
- 各アイテムの属性は異なっていてもよい（スキーマレス）
- user-003にはemailがなくてもエラーにならない
```

### パーティションキーとソートキー

DynamoDBのキー設計は、パフォーマンスに直結する最も重要な要素。

**パーティションキー（Partition Key / Hash Key）**:

- テーブルの各アイテムを一意に識別するための主要なキー
- DynamoDBはこの値のハッシュ値に基づいてデータを物理的に分散配置する

**ソートキー（Sort Key / Range Key）**:

- パーティションキーと組み合わせて使うオプションのキー
- 同じパーティションキーを持つアイテムを、ソートキーの順序で保存する

```
--- パーティションキーのみの場合 ---
テーブル: Users
パーティションキー: userId

| userId (PK) | name     | email              |
| ----------- | -------- | ------------------ |
| user-001    | 田中太郎 | taro@example.com   |
| user-002    | 佐藤花子 | hanako@example.com |

→ userIdだけでアイテムを一意に特定できる

--- パーティションキー + ソートキーの場合 ---
テーブル: Orders
パーティションキー: userId
ソートキー: orderDate

| userId (PK) | orderDate (SK)  | product  | amount |
| ----------- | --------------- | -------- | ------ |
| user-001    | 2024-01-15      | りんご   | 450    |
| user-001    | 2024-01-16      | バナナ   | 500    |
| user-001    | 2024-01-17      | みかん   | 400    |
| user-002    | 2024-01-15      | りんご   | 150    |
| user-002    | 2024-01-17      | ぶどう   | 800    |

→ userId + orderDateの組み合わせでアイテムを一意に特定
→ 同じuserIdのアイテムはorderDateの順序で保存される
→ 「user-001の1月の注文を全て取得」のようなクエリが効率的
```

### プライマリキー設計の重要性

DynamoDBにおいてプライマリキーの設計は**最も重要な意思決定**。後から変更することが非常に困難なため、事前に十分な検討が必要。

良いパーティションキーの条件:

1. **カーディナリティが高い**: 多くの異なる値を持つ（ユーザーID、注文IDなど）
2. **アクセスが均等に分散する**: 特定の値にアクセスが集中しない
3. **アクセスパターンに合っている**: よく使うクエリに直接対応する

```
悪い例:
パーティションキー: status（"active" / "inactive"の2値のみ）
→ ほとんどのアイテムが"active"に集中し、ホットパーティションが発生

良い例:
パーティションキー: userId（ユーザーごとにユニーク）
→ アクセスが均等に分散する
```

## 読み書き操作

### PutItem（アイテムの作成・上書き）

```javascript
// AWS SDK v3を使用
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({ region: 'ap-northeast-1' })
const docClient = DynamoDBDocumentClient.from(client)

// アイテムの作成
async function createUser(userId, name, email) {
  const command = new PutCommand({
    TableName: 'Users',
    Item: {
      userId: userId,
      name: name,
      email: email,
      createdAt: new Date().toISOString(),
    },
    // 同じキーのアイテムが既に存在する場合はエラーにする
    ConditionExpression: 'attribute_not_exists(userId)',
  })

  await docClient.send(command)
}
```

### GetItem（アイテムの取得）

```javascript
const { GetCommand } = require('@aws-sdk/lib-dynamodb')

// アイテムの取得（プライマリキーで指定）
async function getUser(userId) {
  const command = new GetCommand({
    TableName: 'Users',
    Key: {
      userId: userId,
    },
  })

  const response = await docClient.send(command)
  return response.Item
}
```

### UpdateItem（アイテムの更新）

```javascript
const { UpdateCommand } = require('@aws-sdk/lib-dynamodb')

// アイテムの更新
async function updateUserEmail(userId, newEmail) {
  const command = new UpdateCommand({
    TableName: 'Users',
    Key: {
      userId: userId,
    },
    UpdateExpression: 'SET email = :email, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':email': newEmail,
      ':updatedAt': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW', // 更新後のアイテムを返す
  })

  const response = await docClient.send(command)
  return response.Attributes
}
```

### DeleteItem（アイテムの削除）

```javascript
const { DeleteCommand } = require('@aws-sdk/lib-dynamodb')

// アイテムの削除
async function deleteUser(userId) {
  const command = new DeleteCommand({
    TableName: 'Users',
    Key: {
      userId: userId,
    },
    // 削除前にアイテムの存在を確認
    ConditionExpression: 'attribute_exists(userId)',
  })

  await docClient.send(command)
}
```

### Query vs Scan

DynamoDBでデータを検索する方法は2つあるが、パフォーマンスに大きな違いがある。

| 操作  | 説明                             | パフォーマンス | コスト |
| ----- | -------------------------------- | -------------- | ------ |
| Query | パーティションキーを指定して検索 | 高速           | 低い   |
| Scan  | テーブル全体をスキャン           | 遅い           | 高い   |

```javascript
const { QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb')

// Query: パーティションキーを指定（推奨）
async function getUserOrders(userId, startDate, endDate) {
  const command = new QueryCommand({
    TableName: 'Orders',
    KeyConditionExpression: 'userId = :userId AND orderDate BETWEEN :start AND :end',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':start': startDate,
      ':end': endDate,
    },
  })

  const response = await docClient.send(command)
  return response.Items
}

// Scan: テーブル全体を検索（可能な限り避ける）
async function findExpensiveOrders(minAmount) {
  const command = new ScanCommand({
    TableName: 'Orders',
    FilterExpression: 'amount > :minAmount',
    ExpressionAttributeValues: {
      ':minAmount': minAmount,
    },
  })

  const response = await docClient.send(command)
  return response.Items
}
```

**Scanを避けるべき理由**:

- テーブル全体を読み取るため、データ量に比例してコストが増加
- 読み取りキャパシティユニットを大量に消費
- テーブルが大きくなるほどレスポンスが遅くなる

### BatchWriteItem / BatchGetItem

```javascript
const { BatchWriteCommand, BatchGetCommand } = require('@aws-sdk/lib-dynamodb')

// バッチ書き込み（最大25アイテム）
async function batchCreateUsers(users) {
  const command = new BatchWriteCommand({
    RequestItems: {
      Users: users.map((user) => ({
        PutRequest: {
          Item: user,
        },
      })),
    },
  })

  await docClient.send(command)
}

// バッチ読み取り（最大100アイテム）
async function batchGetUsers(userIds) {
  const command = new BatchGetCommand({
    RequestItems: {
      Users: {
        Keys: userIds.map((id) => ({ userId: id })),
      },
    },
  })

  const response = await docClient.send(command)
  return response.Responses.Users
}
```

## キー設計パターン

### シングルテーブルデザイン

DynamoDBでは、複数のエンティティ（ユーザー、注文、商品など）を**1つのテーブルに格納する**設計パターンが推奨されている。

```
テーブル: MyApp
パーティションキー: PK
ソートキー: SK

| PK            | SK               | データ                        |
| ------------- | ---------------- | ----------------------------- |
| USER#001      | PROFILE          | { name: "田中", age: 25 }     |
| USER#001      | ORDER#2024-01-15 | { product: "りんご", amount: 450 } |
| USER#001      | ORDER#2024-01-16 | { product: "バナナ", amount: 500 } |
| USER#002      | PROFILE          | { name: "佐藤", age: 28 }     |
| USER#002      | ORDER#2024-01-15 | { product: "りんご", amount: 150 } |
| PRODUCT#001   | INFO             | { name: "りんご", price: 150 } |
| PRODUCT#002   | INFO             | { name: "バナナ", price: 100 } |

アクセスパターン:
1. ユーザーのプロフィール取得:   PK = "USER#001", SK = "PROFILE"
2. ユーザーの注文一覧:          PK = "USER#001", SK begins_with "ORDER#"
3. 特定期間の注文:              PK = "USER#001", SK BETWEEN "ORDER#2024-01-15" AND "ORDER#2024-01-16"
4. 商品情報の取得:              PK = "PRODUCT#001", SK = "INFO"
```

シングルテーブルデザインの利点:

- 1回のQueryで関連データを取得できる
- テーブル管理が簡単
- コスト効率が良い

### GSI（グローバルセカンダリインデックス）

GSIは、元のテーブルとは異なるパーティションキーとソートキーで検索するためのインデックス。

```
元のテーブル:
PK: userId, SK: orderDate

GSI (EmailIndex):
PK: email（元テーブルでは通常の属性）

→ emailでユーザーを検索できるようになる

GSI (ProductIndex):
PK: product, SK: orderDate

→ 「りんごの注文を日付順に取得」のようなクエリが可能に
```

```javascript
// GSIを使ったクエリ
async function getUserByEmail(email) {
  const command = new QueryCommand({
    TableName: 'Users',
    IndexName: 'EmailIndex', // GSI名を指定
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
  })

  const response = await docClient.send(command)
  return response.Items[0]
}
```

### LSI（ローカルセカンダリインデックス）

LSIは、パーティションキーは同じだが、異なるソートキーで検索するためのインデックス。テーブル作成時にのみ定義可能（後から追加できない）。

```
元のテーブル:
PK: userId, SK: orderDate

LSI (AmountIndex):
PK: userId, SK: amount

→ 「user-001の注文を金額順に取得」のようなクエリが可能に
```

### GSI vs LSIの比較

| 項目               | GSI                  | LSI                  |
| ------------------ | -------------------- | -------------------- |
| パーティションキー | 任意の属性を指定可能 | 元テーブルと同じ     |
| ソートキー         | 任意の属性を指定可能 | 任意の属性を指定可能 |
| 作成タイミング     | いつでも追加可能     | テーブル作成時のみ   |
| 最大数             | 20個                 | 5個                  |
| 読み取り整合性     | 結果整合性のみ       | 強い整合性も選択可能 |
| 別途キャパシティ   | 必要                 | 元テーブルと共有     |

### アクセスパターンに基づく設計

DynamoDBの設計は、まずアクセスパターン（どのようなクエリが必要か）を洗い出すことから始める。

```
ステップ1: アクセスパターンの洗い出し

ECサイトの例:
1. ユーザーIDでプロフィールを取得
2. ユーザーIDで注文履歴を取得（日付順）
3. メールアドレスでユーザーを検索
4. 商品IDで商品情報を取得
5. 商品IDでレビュー一覧を取得（日付順）
6. 特定日の全注文を取得

ステップ2: テーブル設計

テーブル: ECApp
PK: entityId
SK: sortKey

GSI1: EmailIndex (PK: email)
GSI2: DateIndex (PK: date, SK: entityId)

ステップ3: データの格納パターン

| PK            | SK              | email              | date       | ... |
| ------------- | --------------- | ------------------ | ---------- | --- |
| USER#001      | PROFILE         | taro@example.com   |            | ... |
| USER#001      | ORDER#2024-0115 |                    | 2024-01-15 | ... |
| PRODUCT#001   | INFO            |                    |            | ... |
| PRODUCT#001   | REVIEW#2024-01  |                    | 2024-01-15 | ... |
```

## キャパシティモード

DynamoDBには2つの課金モデルがある。

### オンデマンドモード vs プロビジョンドモード

| 項目               | オンデマンド                       | プロビジョンド                 |
| ------------------ | ---------------------------------- | ------------------------------ |
| 課金方式           | リクエスト単位                     | 事前に設定した容量分           |
| スケーリング       | 完全自動                           | Auto Scalingで半自動           |
| 予測可能性         | トラフィックが予測不能な場合に最適 | 安定したトラフィックに最適     |
| コスト（読み取り） | $1.25 / 100万リクエスト            | $0.00065 / RCU時間             |
| コスト（書き込み） | $6.25 / 100万リクエスト            | $0.00065 / WCU時間             |
| 初期費用           | なし                               | なし                           |
| 最適な用途         | 開発環境、予測不能なワークロード   | 本番環境、安定したトラフィック |

### コスト計算の例

```
シナリオ: 1日あたり100万回の読み取り + 10万回の書き込み

--- オンデマンドモード ---
読み取り: 1,000,000 / 1,000,000 * $1.25 = $1.25/日
書き込み: 100,000 / 1,000,000 * $6.25 = $0.625/日
合計: $1.875/日 = 約$56.25/月

--- プロビジョンドモード ---
読み取り: 12 RCU * $0.00065 * 720時間 = $5.62/月
書き込み: 2 WCU * $0.00065 * 720時間 = $0.94/月
合計: 約$6.56/月

→ 安定したトラフィックなら、プロビジョンドモードの方が大幅に安い
→ 予測不能なトラフィックなら、オンデマンドモードが安全
```

## DynamoDB Streams

DynamoDB Streamsは、テーブルのデータ変更をリアルタイムにキャプチャする機能。変更データキャプチャ（CDC: Change Data Capture）とも呼ばれる。

```
データ変更の流れ:

[アプリケーション]
    |
    v
[DynamoDBテーブル] → [DynamoDB Streams] → [AWS Lambda]
                                          → [Kinesis Data Streams]

ユースケース:
- データ変更時にメール通知を送る
- 変更ログを別のテーブルに保存する
- データの変更をElasticsearchに同期する
- マイクロサービス間のイベント連携
```

```javascript
// Lambda関数でStreamイベントを処理する例
exports.handler = async (event) => {
  for (const record of event.Records) {
    console.log('イベントタイプ:', record.eventName) // INSERT, MODIFY, REMOVE

    if (record.eventName === 'INSERT') {
      const newItem = record.dynamodb.NewImage
      console.log('新規アイテム:', JSON.stringify(newItem))
      // 新規ユーザー登録時のウェルカムメール送信など
    }

    if (record.eventName === 'MODIFY') {
      const oldItem = record.dynamodb.OldImage
      const newItem = record.dynamodb.NewImage
      console.log('変更前:', JSON.stringify(oldItem))
      console.log('変更後:', JSON.stringify(newItem))
    }

    if (record.eventName === 'REMOVE') {
      const deletedItem = record.dynamodb.OldImage
      console.log('削除されたアイテム:', JSON.stringify(deletedItem))
    }
  }
}
```

## TTL（Time To Live）

TTLは、アイテムに有効期限を設定し、期限切れのアイテムを自動的に削除する機能。追加コストなしで利用可能。

```javascript
// TTLの設定例: セッションデータ
async function createSession(sessionId, userId) {
  const now = Math.floor(Date.now() / 1000) // UNIXタイムスタンプ（秒）
  const ttl = now + 3600 // 1時間後に自動削除

  const command = new PutCommand({
    TableName: 'Sessions',
    Item: {
      sessionId: sessionId,
      userId: userId,
      createdAt: new Date().toISOString(),
      expiresAt: ttl, // TTL属性（UNIXタイムスタンプ）
    },
  })

  await docClient.send(command)
}
```

TTLの活用例:

| ユースケース         | TTL値                |
| -------------------- | -------------------- |
| セッションデータ     | 1〜24時間            |
| ワンタイムパスワード | 5〜10分              |
| キャッシュデータ     | 数分〜数時間         |
| 一時的なログ         | 7〜30日              |
| 期限付きクーポン     | クーポン有効期限まで |

## DAX（DynamoDB Accelerator）

DAXは、DynamoDB専用のインメモリキャッシュサービス。読み取りパフォーマンスを最大10倍向上させる。

```
通常のアクセス:
[アプリケーション] → [DynamoDB]
レスポンス: 1〜10ミリ秒

DAXを使ったアクセス:
[アプリケーション] → [DAXクラスタ] → [DynamoDB]
キャッシュヒット時: マイクロ秒レベル
キャッシュミス時: DAXがDynamoDBから取得してキャッシュ

→ コードの変更はエンドポイントの変更のみ
→ DynamoDB APIとの完全互換
```

DAXが有効なケース:

- 同じデータの読み取りが頻繁に発生する
- 読み取りが多く、書き込みが少ないワークロード
- マイクロ秒レベルのレスポンスが必要

DAXが不要なケース:

- 書き込みが多いワークロード
- 読み取りが少ないアプリケーション
- 強い整合性の読み取りが必要な場合（DAXは結果整合性のみ）

## Node.js + AWS SDK v3

### セットアップ

```bash
# AWS SDK v3のインストール
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

### 完全な実装例

```javascript
// dynamodb.js - DynamoDBクライアントの設定
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({
  region: 'ap-northeast-1',
  // ローカル開発時（DynamoDB Local使用時）
  // endpoint: "http://localhost:8000",
})

// DocumentClientはマーシャリング（型変換）を自動で行う
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
})

module.exports = { docClient }
```

```javascript
// userRepository.js - ユーザーデータの操作
const {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} = require('@aws-sdk/lib-dynamodb')
const { docClient } = require('./dynamodb')

const TABLE_NAME = 'MyApp'

// ユーザー作成
async function createUser(userId, name, email) {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
      userId,
      name,
      email,
      createdAt: new Date().toISOString(),
    },
    ConditionExpression: 'attribute_not_exists(PK)',
  })

  try {
    await docClient.send(command)
    return { userId, name, email }
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new Error('ユーザーは既に存在します')
    }
    throw error
  }
}

// ユーザー取得
async function getUser(userId) {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
    },
  })

  const response = await docClient.send(command)
  return response.Item || null
}

// ユーザー更新
async function updateUser(userId, updates) {
  const expressionParts = []
  const expressionValues = {}
  const expressionNames = {}

  Object.entries(updates).forEach(([key, value], index) => {
    expressionParts.push(`#field${index} = :value${index}`)
    expressionNames[`#field${index}`] = key
    expressionValues[`:value${index}`] = value
  })

  expressionParts.push('#updatedAt = :updatedAt')
  expressionNames['#updatedAt'] = 'updatedAt'
  expressionValues[':updatedAt'] = new Date().toISOString()

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
    },
    UpdateExpression: `SET ${expressionParts.join(', ')}`,
    ExpressionAttributeNames: expressionNames,
    ExpressionAttributeValues: expressionValues,
    ReturnValues: 'ALL_NEW',
  })

  const response = await docClient.send(command)
  return response.Attributes
}

// 注文作成
async function createOrder(userId, orderId, product, amount) {
  const orderDate = new Date().toISOString().split('T')[0]

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${userId}`,
      SK: `ORDER#${orderDate}#${orderId}`,
      userId,
      orderId,
      product,
      amount,
      orderDate,
      createdAt: new Date().toISOString(),
    },
  })

  await docClient.send(command)
}

// ユーザーの注文一覧取得
async function getUserOrders(userId, limit = 20) {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':skPrefix': 'ORDER#',
    },
    ScanIndexForward: false, // 降順（最新の注文から）
    Limit: limit,
  })

  const response = await docClient.send(command)
  return response.Items
}

// 使用例
async function main() {
  // ユーザー作成
  await createUser('001', '田中太郎', 'taro@example.com')

  // 注文作成
  await createOrder('001', 'ord-001', 'りんご', 450)
  await createOrder('001', 'ord-002', 'バナナ', 500)

  // ユーザー取得
  const user = await getUser('001')
  console.log('ユーザー:', user)

  // 注文一覧取得
  const orders = await getUserOrders('001')
  console.log('注文一覧:', orders)
}

main().catch(console.error)
```

## DynamoDB vs MongoDB vs PostgreSQL

| 比較項目           | DynamoDB                    | MongoDB                              | PostgreSQL                         |
| ------------------ | --------------------------- | ------------------------------------ | ---------------------------------- |
| タイプ             | キーバリュー + ドキュメント | ドキュメント                         | リレーショナル                     |
| 管理方式           | フルマネージド（AWSのみ）   | セルフホスト or Atlas                | セルフホスト or マネージド         |
| スキーマ           | キー属性のみ定義            | スキーマレス（Mongoose等で定義可能） | 厳密なスキーマ                     |
| クエリ             | キーベースの検索が基本      | 柔軟なクエリ                         | SQL（最も柔軟）                    |
| JOIN               | 不可（設計で回避）          | $lookup（制限あり）                  | 完全対応                           |
| トランザクション   | 対応（25アイテムまで）      | 対応（4.0以降）                      | 完全対応                           |
| スケーリング       | 自動水平スケーリング        | シャーディング（手動設定）           | 垂直スケーリングが基本             |
| レイテンシ         | 1桁ミリ秒（一定）           | 数ミリ秒                             | 数ミリ秒〜（クエリ依存）           |
| 料金モデル         | 従量課金 or プロビジョンド  | Atlas: 従量課金 / セルフ: サーバー費 | サーバー費 or マネージドサービス費 |
| 学習コスト         | 中（キー設計が独特）        | 低〜中                               | 中〜高（SQL知識が必要）            |
| ベンダーロックイン | 高い（AWS専用）             | 低い                                 | 非常に低い                         |

## いつDynamoDBを選ぶべきか

### DynamoDBが最適なケース

- **高スループット・低レイテンシが必要**: ゲーム、広告、IoTなど
- **サーバーレスアーキテクチャ**: Lambda + API Gateway + DynamoDBの構成
- **AWSエコシステムを活用**: 他のAWSサービスとの統合が容易
- **予測可能なアクセスパターン**: キー設計で全てのクエリに対応できる場合
- **自動スケーリングが必要**: トラフィックの変動が大きいサービス
- **運用コストを最小化したい**: インフラ管理の手間を減らしたい

### DynamoDBが不向きなケース

- **複雑なクエリやJOINが必要**: RDBの方が適切
- **アドホック（即席）なクエリが多い**: 分析用途にはRDBやデータウェアハウスが適切
- **マルチクラウド戦略**: DynamoDBはAWS専用のため、ベンダーロックインが発生
- **既存のRDBスキルを活かしたい**: SQLの知識がそのまま使えない

## 料金体系

### オンデマンドモードの料金例（東京リージョン、2024年時点の参考値）

| 項目               | 単価                   |
| ------------------ | ---------------------- |
| 書き込みリクエスト | $1.4269 / 100万WRU     |
| 読み取りリクエスト | $0.2854 / 100万RRU     |
| ストレージ         | $0.285 / GB/月         |
| DynamoDB Streams   | $0.0228 / 10万読み取り |

### 月額コスト計算例

```
小規模Webアプリ（ブログサイト）:
- 1日の読み取り: 10万回
- 1日の書き込み: 1万回
- ストレージ: 1GB

月額コスト:
- 読み取り: 3,000,000 / 1,000,000 * $0.2854 = $0.86
- 書き込み: 300,000 / 1,000,000 * $1.4269 = $0.43
- ストレージ: 1 * $0.285 = $0.285
合計: 約$1.58/月 (約240円)

→ 小規模なら非常に安価
```

## 採用企業

| 企業/サービス | 用途                                       |
| ------------- | ------------------------------------------ |
| Amazon.com    | ショッピングカート、注文管理、推薦エンジン |
| Netflix       | ユーザープロフィール、視聴履歴、A/Bテスト  |
| Lyft          | リアルタイムの配車データ管理               |
| Samsung       | IoTデバイスのデータ管理                    |
| Airbnb        | 検索インデックス、予約管理                 |
| Capital One   | 金融取引データの処理                       |
| Duolingo      | ユーザーの学習進捗管理                     |
| Nike          | ECサイトの商品カタログ、注文管理           |

## まとめ

DynamoDBは、AWSエコシステム内で高いパフォーマンスとスケーラビリティを実現するフルマネージドNoSQL。以下のポイントを押さえておくことが重要。

1. **キー設計が最も重要**: パーティションキーとソートキーの設計がパフォーマンスを決定する
2. **Scanを避け、Queryを使う**: アクセスパターンに基づいてキーとGSIを設計する
3. **シングルテーブルデザインを検討する**: 1つのテーブルに複数のエンティティを格納
4. **キャパシティモードを適切に選ぶ**: 開発環境はオンデマンド、本番環境は状況に応じて選択
5. **DynamoDB StreamsとLambdaの連携**: イベント駆動アーキテクチャの構築に活用
6. **コストを意識する**: 読み書きの量とストレージで料金が決まる

## 参考リンク

- [Amazon DynamoDB公式ドキュメント](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/)
- [AWS SDK for JavaScript v3 - DynamoDB](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/)
- [DynamoDB Guide（Alex DeBrie）](https://www.dynamodbguide.com/)
- [The DynamoDB Book（Alex DeBrie著）](https://www.dynamodbbook.com/)
- [AWS DynamoDB料金ページ](https://aws.amazon.com/dynamodb/pricing/)
- [DynamoDB Local（ローカル開発用）](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
- [AWS re:Invent - DynamoDB関連セッション](https://www.youtube.com/results?search_query=aws+reinvent+dynamodb)
