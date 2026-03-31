---
title: 'AWS S3'
order: 25
section: 'DevOps/インフラ'
---

# AWS S3

## S3とは

S3は **Simple Storage Service** の略で、AWSが提供するオブジェクトストレージサービス。インターネット上にファイルを保存・取得するための仕組みで、事実上無限の容量を持つ。

日常生活で例えると、S3は「容量無制限のクラウドストレージ（Google DriveやDropboxのようなもの）」。ただし、S3はエンジニア向けのサービスで、APIやCLIからプログラム的にアクセスすることを前提に設計されている。

### S3の特徴

| 特徴                  | 説明                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------- |
| 容量制限なし          | 1つのオブジェクトは最大5TBまで。オブジェクト数は無制限                                  |
| 99.999999999%の耐久性 | イレブンナイン。10億個のオブジェクトを保存しても、年間で1個失われるかどうかという信頼性 |
| 99.99%の可用性        | 年間で約52分のダウンタイム                                                              |
| 従量課金              | 保存した容量と使った分だけ支払い                                                        |
| グローバルサービス    | 世界中のリージョンに配置可能                                                            |

### S3の代表的な用途

- Webアプリケーションの静的ファイル（画像、CSS、JavaScript）のホスティング
- ログファイルの保存と分析
- データベースのバックアップ
- 動画や音声ファイルの配信
- 静的Webサイトのホスティング
- データレイク（大量データの蓄積・分析基盤）
- アプリケーション間のデータ共有

---

## ファイルシステム vs オブジェクトストレージ

S3を理解するには、普段使っているファイルシステムとの違いを理解することが重要。

### ファイルシステム（パソコンのハードディスク）

```
/
├── home/
│   └── user/
│       ├── documents/
│       │   ├── report.pdf
│       │   └── notes.txt
│       └── photos/
│           ├── vacation.jpg
│           └── family.jpg
└── var/
    └── log/
        └── app.log
```

ファイルシステムは「フォルダ（ディレクトリ）」の階層構造でファイルを管理する。フォルダの中にフォルダを作れる。ファイルを開くには、パスを辿っていく必要がある。

### オブジェクトストレージ（S3）

```
バケット: my-website-bucket
├── documents/report.pdf     ← これが1つの「オブジェクト」
├── documents/notes.txt      ← キー名にスラッシュが含まれているだけ
├── photos/vacation.jpg
├── photos/family.jpg
└── logs/app.log
```

S3にはフォルダという概念が実際には存在しない。全てのファイルは「フラット」に保存されており、`documents/report.pdf`というのは「documentsフォルダの中のreport.pdf」ではなく、`documents/report.pdf`という名前の1つのオブジェクト。コンソール上ではフォルダのように見えるが、内部的にはスラッシュを含むキー名として扱われている。

### 比較表

| 観点             | ファイルシステム                   | オブジェクトストレージ（S3）       |
| ---------------- | ---------------------------------- | ---------------------------------- |
| 構造             | 階層型（ツリー構造）               | フラット（キーと値）               |
| データ単位       | ファイル                           | オブジェクト                       |
| 識別方法         | パス（/home/user/file.txt）        | キー（user/file.txt）              |
| メタデータ       | ファイル属性（作成日時、サイズ等） | カスタムメタデータを自由に設定可能 |
| 変更方法         | ファイルの一部を書き換え可能       | オブジェクト全体を置き換える       |
| スケーラビリティ | ディスク容量に制限                 | 事実上無制限                       |
| アクセス方法     | OS経由（ファイルパス）             | HTTP API                           |

---

## バケットとオブジェクト

S3の2つの基本概念を理解する。

### バケット（Bucket）

バケットは、オブジェクトを保存するためのコンテナ（入れ物）。S3の最上位の名前空間。

| 項目       | 説明                                                  |
| ---------- | ----------------------------------------------------- |
| 命名規則   | 3〜63文字、小文字英数字・ハイフン・ピリオドのみ       |
| ユニーク性 | 全世界で一意（他のAWSアカウントを含む全S3で重複不可） |
| リージョン | バケットは特定のリージョンに作成                      |
| 上限       | 1アカウントあたり100個（申請で増加可能）              |

良いバケット名の例:

- `my-company-website-assets`
- `project-x-logs-2024`
- `my-app-user-uploads`

悪いバケット名の例:

- `MyBucket`（大文字不可）
- `my bucket`（スペース不可）
- `test`（短すぎるし、既に他人が使っている可能性大）

### オブジェクト

オブジェクトは、S3に保存するデータの単位。以下の要素で構成される。

| 要素         | 説明                                           | 例                      |
| ------------ | ---------------------------------------------- | ----------------------- |
| キー（Key）  | オブジェクトの一意な識別子（ファイル名に相当） | `images/logo.png`       |
| 値（Value）  | データそのもの（ファイルの中身）               | 画像のバイナリデータ    |
| メタデータ   | オブジェクトの付加情報                         | Content-Type: image/png |
| バージョンID | バージョニング有効時の識別子                   | `3HL4kqtJvjVBH40Nrjfkd` |

---

## バケットの作成

### コンソールでの作成手順

```
1. AWSマネジメントコンソールにログイン
2. S3サービスに移動
3. 「バケットを作成」をクリック
4. 以下を設定:
   - バケット名: my-unique-bucket-name-2024（グローバルに一意）
   - リージョン: アジアパシフィック（東京）ap-northeast-1
   - オブジェクト所有者: ACL無効（推奨）
   - パブリックアクセスをすべてブロック: 有効（デフォルト、推奨）
   - バケットのバージョニング: 無効（必要に応じて有効化）
   - デフォルトの暗号化: SSE-S3（Amazon S3マネージドキー）
5. 「バケットを作成」をクリック
```

### リージョンの選択基準

| 基準             | 説明                                             |
| ---------------- | ------------------------------------------------ |
| ユーザーとの距離 | ユーザーに近いリージョンを選ぶとレイテンシが低い |
| コスト           | リージョンによって料金が異なる。東京は比較的高い |
| コンプライアンス | データの保管場所に法的要件がある場合             |
| サービス可用性   | 一部のサービスは特定のリージョンでのみ利用可能   |

日本のユーザー向けサービスなら `ap-northeast-1`（東京）を選ぶのが基本。

### ブロックパブリックアクセスとは

S3のバケットをうっかり全世界に公開してしまう事故を防ぐための安全機構。デフォルトで全てブロックされており、以下の4つの設定がある。

| 設定                  | 説明                                       |
| --------------------- | ------------------------------------------ |
| BlockPublicAcls       | 新しいパブリックACLの設定をブロック        |
| IgnorePublicAcls      | 既存のパブリックACLを無視                  |
| BlockPublicPolicy     | パブリックバケットポリシーの設定をブロック |
| RestrictPublicBuckets | パブリックバケットへのアクセスを制限       |

特に理由がない限り、全てブロックしておくのが安全。静的Webサイトホスティング等で公開が必要な場合のみ、必要最小限の設定を変更する。

---

## ファイルのアップロード/ダウンロード

S3へのファイル操作は、コンソール、AWS CLI、SDKの3つの方法がある。

### コンソールでの操作

最も簡単だが、大量のファイルや自動化には向かない。

```
アップロード:
1. S3コンソールでバケットを開く
2. 「アップロード」をクリック
3. ファイルをドラッグ&ドロップまたは「ファイルを追加」
4. 必要に応じて権限やメタデータを設定
5. 「アップロード」をクリック

ダウンロード:
1. S3コンソールでオブジェクトを選択
2. 「ダウンロード」をクリック
```

### AWS CLIでの操作

開発者が最もよく使う方法。まずAWS CLIのインストールと設定が必要。

```bash
# AWS CLIのインストール（macOS）
brew install awscli

# 設定（アクセスキーIDとシークレットアクセスキーを入力）
aws configure
# AWS Access Key ID: AKIAIOSFODNN7EXAMPLE        ← ダミー値。自分のアクセスキーIDを入力する
# AWS Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY  ← ダミー値。自分のシークレットキーを入力する
# Default region name: ap-northeast-1
# Default output format: json
```

### 主要なAWS CLI S3コマンド

```bash
# バケットの一覧表示
aws s3 ls

# バケット内のオブジェクト一覧
aws s3 ls s3://my-bucket/
aws s3 ls s3://my-bucket/images/  # 特定プレフィックス以下

# ファイルのアップロード（単一ファイル）
aws s3 cp local-file.txt s3://my-bucket/
aws s3 cp local-file.txt s3://my-bucket/path/to/file.txt

# ファイルのダウンロード
aws s3 cp s3://my-bucket/file.txt ./local-file.txt

# ディレクトリの同期（ローカル → S3）
aws s3 sync ./build/ s3://my-bucket/
# --delete オプションで、S3側にしかないファイルを削除
aws s3 sync ./build/ s3://my-bucket/ --delete

# ディレクトリの同期（S3 → ローカル）
aws s3 sync s3://my-bucket/ ./local-dir/

# ファイルの移動
aws s3 mv s3://my-bucket/old-name.txt s3://my-bucket/new-name.txt

# ファイルの削除
aws s3 rm s3://my-bucket/file.txt

# ディレクトリの再帰削除
aws s3 rm s3://my-bucket/logs/ --recursive

# バケットの作成
aws s3 mb s3://my-new-bucket --region ap-northeast-1

# バケットの削除（空の場合のみ）
aws s3 rb s3://my-empty-bucket

# バケットの強制削除（中身ごと削除）
aws s3 rb s3://my-bucket --force
```

### syncとcpの使い分け

| コマンド      | 動作                 | 用途                             |
| ------------- | -------------------- | -------------------------------- |
| `aws s3 cp`   | 指定ファイルをコピー | 単一ファイルの転送               |
| `aws s3 sync` | 差分のみ転送         | ディレクトリの同期（デプロイ等） |

`sync`は差分のみを転送するので、大量のファイルがあっても2回目以降は高速。静的サイトのデプロイに最適。

---

## Node.js + AWS SDK v3

Node.jsアプリケーションからS3を操作するには、AWS SDK for JavaScript v3を使用する。

### インストール

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 基本的な操作

```javascript
// s3-operations.js
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3')
const fs = require('fs')

// S3クライアントの初期化
const s3Client = new S3Client({
  region: 'ap-northeast-1',
  // 本番環境ではIAMロールを使用するため、
  // アクセスキーの直接指定は避ける
})

const BUCKET_NAME = 'my-app-bucket'

// ファイルのアップロード
async function uploadFile(filePath, key) {
  const fileContent = fs.readFileSync(filePath)

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: 'image/png', // ファイルに応じて変更
  })

  const response = await s3Client.send(command)
  console.log('アップロード成功:', response)
  return response
}

// ファイルのダウンロード
async function downloadFile(key) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  const response = await s3Client.send(command)
  // レスポンスボディをストリームとして取得
  const bodyString = await response.Body.transformToString()
  return bodyString
}

// オブジェクト一覧の取得
async function listObjects(prefix = '') {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: prefix,
    MaxKeys: 100,
  })

  const response = await s3Client.send(command)
  if (response.Contents) {
    response.Contents.forEach((obj) => {
      console.log(`${obj.Key} - ${obj.Size} bytes - ${obj.LastModified}`)
    })
  }
  return response.Contents || []
}

// オブジェクトの削除
async function deleteObject(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  const response = await s3Client.send(command)
  console.log('削除成功:', key)
  return response
}

// 使用例
async function main() {
  try {
    // アップロード
    await uploadFile('./photo.png', 'images/photo.png')

    // 一覧取得
    await listObjects('images/')

    // ダウンロード
    const content = await downloadFile('images/photo.png')

    // 削除
    await deleteObject('images/photo.png')
  } catch (error) {
    console.error('エラー:', error)
  }
}

main()
```

### 署名付きURLの生成

```javascript
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')

// ダウンロード用の署名付きURL（有効期限: 1時間）
async function getDownloadUrl(key) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 秒単位
  })

  console.log('ダウンロードURL:', url)
  return url
}

// アップロード用の署名付きURL（フロントエンドから直接S3にアップロード）
async function getUploadUrl(key, contentType) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  })

  console.log('アップロードURL:', url)
  return url
}
```

署名付きURLは、S3に直接アクセスする権限がないユーザーに対して、一時的にアクセスを許可するための仕組み。例えば、ユーザーがプロフィール画像をアップロードする場合、バックエンドで署名付きURLを生成し、フロントエンドからそのURLに対してファイルをPUTすることで、サーバーを経由せずに直接S3にアップロードできる。

---

## アクセス制御

S3のアクセス制御には複数の仕組みがある。正しく理解して適切に使い分けることが重要。

### アクセス制御の種類

| 方法                       | 対象                | 説明                                   | 推奨   |
| -------------------------- | ------------------- | -------------------------------------- | ------ |
| バケットポリシー           | バケット単位        | JSON形式のポリシーでアクセスを制御     | 推奨   |
| IAMポリシー                | ユーザー/ロール単位 | IAMユーザーやロールに付与              | 推奨   |
| ACL                        | オブジェクト単位    | レガシーな方法。個別オブジェクトの権限 | 非推奨 |
| ブロックパブリックアクセス | バケット/アカウント | パブリックアクセスの一括ブロック       | 必須   |

### バケットポリシーの例

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-website-bucket/*"
    }
  ]
}
```

このポリシーは、全てのユーザー（`Principal: "*"`）に対して、`my-website-bucket`内の全オブジェクトの読み取り（`s3:GetObject`）を許可している。静的Webサイトホスティングで使う典型的なポリシー。

### IAMポリシーの例

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::my-app-bucket/uploads/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::my-app-bucket",
      "Condition": {
        "StringLike": {
          "s3:prefix": "uploads/*"
        }
      }
    }
  ]
}
```

このポリシーは、`my-app-bucket`の`uploads/`プレフィックス以下に限定して、読み取り、書き込み、削除、一覧取得を許可している。最小権限の原則に従った設計。

---

## 静的Webサイトホスティング

S3を使って、サーバーなしで静的Webサイト（HTML、CSS、JavaScript）を公開できる。

### 手順

**ステップ1: バケットの作成**

バケット名をドメイン名と一致させる（例: `www.example.com`）。

**ステップ2: 静的Webサイトホスティングの有効化**

```
バケットのプロパティ → 静的ウェブサイトホスティング → 編集
- 静的ウェブサイトホスティング: 有効
- インデックスドキュメント: index.html
- エラードキュメント: error.html（404ページ）
```

**ステップ3: ブロックパブリックアクセスの解除**

静的Webサイトとして公開するには、パブリックアクセスを許可する必要がある。

```
バケットの権限 → ブロックパブリックアクセス → 編集
- 「パブリックアクセスをすべてブロック」のチェックを外す
```

**ステップ4: バケットポリシーの設定**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::www.example.com/*"
    }
  ]
}
```

**ステップ5: ファイルのアップロード**

```bash
# Reactアプリのビルドとデプロイ例
npm run build
aws s3 sync ./build/ s3://www.example.com/ --delete
```

### S3 + CloudFrontの構成

S3単体でのホスティングはHTTPのみ。HTTPS対応や高速配信にはCloudFront（CDN）と組み合わせる。

```
ユーザー → CloudFront（CDN、HTTPS） → S3バケット（静的ファイル）
              │
              └── ACM（SSL/TLS証明書）
```

CloudFrontを使うメリット:

- HTTPS対応
- 世界中のエッジロケーションからの高速配信
- キャッシュによるS3への直接アクセスの削減
- DDoS対策（AWS Shield）

---

## ストレージクラス

S3にはデータのアクセス頻度に応じた複数のストレージクラスがあり、適切に使い分けることでコストを大幅に削減できる。

### ストレージクラスの比較

| ストレージクラス              | アクセス頻度 | 最小保存期間 | 取り出し時間 | ストレージ料金（GB/月） | 用途                   |
| ----------------------------- | ------------ | ------------ | ------------ | ----------------------- | ---------------------- |
| S3 Standard                   | 頻繁         | なし         | ミリ秒       | $0.025                  | アクティブデータ       |
| S3 Standard-IA                | 低頻度       | 30日         | ミリ秒       | $0.0138                 | バックアップ           |
| S3 One Zone-IA                | 低頻度       | 30日         | ミリ秒       | $0.011                  | 再作成可能なデータ     |
| S3 Intelligent-Tiering        | 変動         | なし         | ミリ秒       | 自動最適化              | パターン不明           |
| S3 Glacier Instant Retrieval  | めったにない | 90日         | ミリ秒       | $0.005                  | アーカイブ（即時取得） |
| S3 Glacier Flexible Retrieval | めったにない | 90日         | 分〜時間     | $0.0045                 | アーカイブ             |
| S3 Glacier Deep Archive       | ほぼなし     | 180日        | 12〜48時間   | $0.002                  | 長期保存               |

※料金は東京リージョンの参考値。最新の料金はAWS公式サイトを確認すること。

### 選び方の目安

```
毎日アクセスする      → S3 Standard
月に1〜2回アクセス    → S3 Standard-IA
パターンが読めない    → S3 Intelligent-Tiering
年に1〜2回アクセス    → S3 Glacier Instant Retrieval
ほぼアクセスしない    → S3 Glacier Flexible Retrieval
法令遵守で保存義務    → S3 Glacier Deep Archive
```

### S3 Intelligent-Tiering

アクセスパターンがわからない場合に最適。S3が自動的にアクセス頻度を分析し、最もコスト効率の良いストレージ層にデータを移動してくれる。月額の監視料金（1,000オブジェクトあたり$0.0025）がかかるが、手動管理の手間が省ける。

---

## ライフサイクルポリシー

ライフサイクルポリシーを使うと、オブジェクトの保存期間やアクセス頻度に基づいて、ストレージクラスの変更や削除を自動化できる。

### 設定例

```json
{
  "Rules": [
    {
      "ID": "ログファイルのライフサイクル",
      "Filter": {
        "Prefix": "logs/"
      },
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
```

この設定の動作:

```
作成 → 30日後: Standard-IA → 90日後: Glacier → 365日後: 自動削除
```

### よくある設定パターン

| パターン             | 説明                                     |
| -------------------- | ---------------------------------------- |
| ログファイル         | 30日後にIA、90日後にGlacier、1年後に削除 |
| ユーザーアップロード | 60日後にIA、未使用なら180日後に削除      |
| バックアップ         | 即座にGlacier Deep Archive、7年後に削除  |
| 一時ファイル         | 7日後に削除                              |

---

## バージョニング

バージョニングを有効にすると、オブジェクトの全てのバージョン（過去の状態）が保持される。誤って上書きしたり削除したりした場合に、以前のバージョンに戻せる。

### バージョニングの動作

```
1回目のアップロード: index.html (Version: v1)
2回目のアップロード: index.html (Version: v2) ← 最新
                                 (Version: v1) ← 保持

削除操作: index.html に「削除マーカー」が付く
                     (Version: v2) ← 保持
                     (Version: v1) ← 保持

復元: 削除マーカーを削除 → v2が最新に戻る
```

### バージョニングの注意点

- 全てのバージョンが保存されるため、ストレージ料金が増加する
- 不要な古いバージョンはライフサイクルポリシーで自動削除できる
- 一度有効にしたバージョニングは無効にはできない（「一時停止」は可能）

---

## CORS設定

CORS（Cross-Origin Resource Sharing）は、ブラウザからS3に直接アクセスする場合に必要な設定。例えば、`https://my-app.com`から`https://my-bucket.s3.amazonaws.com`のファイルを取得する場合に必要。

### CORS設定の例

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["https://my-app.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

| 項目           | 説明                                     |
| -------------- | ---------------------------------------- |
| AllowedHeaders | 許可するリクエストヘッダー               |
| AllowedMethods | 許可するHTTPメソッド                     |
| AllowedOrigins | 許可するオリジン（ドメイン）             |
| ExposeHeaders  | クライアントに公開するレスポンスヘッダー |
| MaxAgeSeconds  | プリフライトリクエストのキャッシュ時間   |

開発環境では`AllowedOrigins`に`http://localhost:3000`を追加しておくと便利。ただし本番環境では必要なオリジンのみを指定すること。

---

## 署名付きURL（Pre-signed URL）

署名付きURLは、S3オブジェクトへの一時的なアクセス権を付与するURL。有効期限付きで、URLを知っている人だけがアクセスできる。

### ユースケース

| ケース                     | 説明                                    |
| -------------------------- | --------------------------------------- |
| プライベートファイルの共有 | 特定ユーザーにのみダウンロードを許可    |
| ダイレクトアップロード     | フロントエンドからS3に直接アップロード  |
| 課金コンテンツ             | 購入済みユーザーにダウンロードURLを発行 |

### フロントエンドからのダイレクトアップロードの流れ

```
1. フロントエンド → バックエンド: 「画像をアップロードしたい」
2. バックエンド → S3: 署名付きURLを生成
3. バックエンド → フロントエンド: 署名付きURLを返却
4. フロントエンド → S3: 署名付きURLに対してPUTリクエスト（画像をアップロード）
```

```javascript
// バックエンド側（Express）
const express = require('express')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { v4: uuidv4 } = require('uuid')

const app = express()
const s3Client = new S3Client({ region: 'ap-northeast-1' })

app.post('/api/upload-url', async (req, res) => {
  const { contentType } = req.body
  const key = `uploads/${uuidv4()}.${contentType.split('/')[1]}`

  const command = new PutObjectCommand({
    Bucket: 'my-app-bucket',
    Key: key,
    ContentType: contentType,
  })

  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 })

  res.json({ uploadUrl: url, key })
})
```

```javascript
// フロントエンド側
async function uploadImage(file) {
  // 1. バックエンドから署名付きURLを取得
  const response = await fetch('/api/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType: file.type }),
  })
  const { uploadUrl, key } = await response.json()

  // 2. S3に直接アップロード
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  console.log('アップロード完了。キー:', key)
  return key
}
```

---

## S3イベント通知

S3バケットでイベント（オブジェクトの作成、削除など）が発生した際に、Lambda関数やSQSキューなどに通知を送ることができる。

### 代表的なユースケース

| ユースケース       | イベント         | 通知先 | 処理内容                             |
| ------------------ | ---------------- | ------ | ------------------------------------ |
| 画像のリサイズ     | オブジェクト作成 | Lambda | アップロード画像のサムネイル自動生成 |
| ログの解析         | オブジェクト作成 | Lambda | ログファイルの自動解析・集計         |
| ファイル処理キュー | オブジェクト作成 | SQS    | 非同期での大量ファイル処理           |
| 削除通知           | オブジェクト削除 | SNS    | 管理者への通知メール                 |

### 設定例（画像アップロード → Lambda → リサイズ）

```
S3バケット（uploads/）
    │
    ├── 画像アップロード
    │
    ▼
Lambda関数（image-resizer）
    │
    ├── 画像を取得
    ├── リサイズ処理
    │
    ▼
S3バケット（thumbnails/）
    └── リサイズ済み画像を保存
```

---

## セキュリティベストプラクティス

### 暗号化

| 暗号化方式         | 説明                     | 管理者          |
| ------------------ | ------------------------ | --------------- |
| SSE-S3             | S3マネージドキーで暗号化 | AWS             |
| SSE-KMS            | AWS KMSキーで暗号化      | ユーザー（KMS） |
| SSE-C              | 顧客提供キーで暗号化     | ユーザー        |
| クライアントサイド | アップロード前に暗号化   | ユーザー        |

ほとんどの場合、SSE-S3（デフォルト）で十分。コンプライアンス要件がある場合はSSE-KMSを使用する。

### セキュリティチェックリスト

- ブロックパブリックアクセスを有効にする
- バケットポリシーとIAMポリシーで最小権限を設定する
- デフォルト暗号化を有効にする
- バージョニングを有効にする（誤削除対策）
- アクセスログを有効にする
- MFA Delete（削除時の多要素認証）を検討する
- S3 Access Analyzerでパブリックアクセスを監視する

---

## 料金体系

S3の料金は、以下の3つの要素で構成される。

### 料金の構成

| 要素       | 説明                           | 料金例（東京リージョン、Standard） |
| ---------- | ------------------------------ | ---------------------------------- |
| ストレージ | 保存したデータ量               | 最初の50TB: $0.025/GB/月           |
| リクエスト | API呼び出し回数                | PUT/POST: $0.0047/1,000リクエスト  |
| データ転送 | S3からインターネットへの転送量 | 最初の10TB: $0.114/GB              |

### 無料枠（新規アカウント、12ヶ月間）

- ストレージ: 5 GB（S3 Standard）
- リクエスト: PUT 2,000回、GET 20,000回
- データ転送: 100 GB/月（全AWSサービス合計）

### コスト試算例

小規模なWebアプリケーション（月間）:

- ストレージ: 10 GB → $0.25
- PUTリクエスト: 10,000回 → $0.047
- GETリクエスト: 100,000回 → $0.037
- データ転送: 50 GB → $5.70
- **合計: 約$6/月**

---

## 実践演習

### 演習1: S3の基本操作

1. AWS CLIでバケットを作成する
2. ファイルをアップロード・ダウンロードする
3. バケットポリシーを設定する
4. バージョニングを有効にして、ファイルの上書きと復元を試す

### 演習2: 静的Webサイトのホスティング

1. ReactまたはHTMLで簡単なWebサイトを作成する
2. S3バケットを作成し、静的Webサイトホスティングを有効にする
3. ファイルをアップロードしてWebサイトを公開する
4. （発展）CloudFrontを設定してHTTPS対応する

### 演習3: Node.jsからのS3操作

1. AWS SDK v3を使ってファイルのアップロード/ダウンロードを実装する
2. 署名付きURLを生成してブラウザからアクセスする
3. S3イベント通知とLambdaで画像のリサイズを自動化する

---

## 参考リンク

- [AWS S3 公式ドキュメント](https://docs.aws.amazon.com/s3/)
- [AWS S3 料金](https://aws.amazon.com/s3/pricing/)
- [AWS SDK for JavaScript v3 - S3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/)
- [S3 セキュリティベストプラクティス](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [S3 静的Webサイトホスティング](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [AWS CLI S3コマンドリファレンス](https://docs.aws.amazon.com/cli/latest/reference/s3/)
- [S3 ストレージクラス](https://aws.amazon.com/s3/storage-classes/)
