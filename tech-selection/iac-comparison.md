---
title: 'Terraform vs CloudFormation vs Pulumi vs CDK: IaCツール選定'
order: 39
category: 'devops-tools'
---

# Terraform vs CloudFormation vs Pulumi vs CDK: IaCツール選定

## はじめに

Infrastructure as Code（IaC）は、インフラ構成をコードで管理する手法です。手作業でのインフラ構築は再現性が低く、ミスが起きやすい。IaCを使えば、インフラの構築・変更・削除をコードベースで管理でき、バージョン管理やレビューも可能になります。

### 身近な例えで理解するIaC

IaCは「設計図」のようなものです。

手作業でインフラを構築する = 口頭の指示で家を建てるようなもの（毎回微妙に違う家ができる）
IaCでインフラを構築する = 詳細な設計図を元に家を建てるようなもの（何度建てても同じ家ができる）

各ツールの例え:

- **Terraform** = 汎用設計図。どの工務店（クラウド）でも使える標準的な書き方
- **CloudFormation** = AWS専用設計図。AWS純正で安心だが、AWS以外では使えない
- **Pulumi** = プログラミング言語で書ける設計図。TypeScriptやPythonでインフラを定義
- **CDK** = AWSの設計図をプログラミング言語で書けるようにしたもの。内部的にはCloudFormationに変換される

---

## 各ツールの概要

### Terraform

HashiCorp社が開発するオープンソースのIaCツール。HCL（HashiCorp Configuration Language）で記述。

**特徴:**

- マルチクラウド対応（AWS、GCP、Azure、その他多数）
- 宣言的な記述
- State管理（tfstate）
- 豊富なプロバイダーエコシステム
- Plan/Applyのワークフロー（変更の事前確認が可能）

### CloudFormation

AWS純正のIaCサービス。JSON/YAMLで記述。

**特徴:**

- AWS完全対応（新サービスに最も早く対応）
- 追加コストなし（AWS利用料のみ）
- スタック管理（リソースのグループ化）
- ドリフト検出（手動変更の検知）
- Change Sets（変更の事前確認）

### Pulumi

プログラミング言語でインフラを定義できるIaCツール。

**特徴:**

- TypeScript、Python、Go、C#、Java等で記述可能
- マルチクラウド対応
- 条件分岐やループなどプログラミングの機能をフル活用
- テストフレームワークとの統合
- Pulumi AI（自然言語からインフラコードを生成）

### AWS CDK（Cloud Development Kit）

AWSのインフラをプログラミング言語で定義し、CloudFormationテンプレートに変換するツール。

**特徴:**

- TypeScript、Python、Java、C#、Go対応
- 高レベルのコンストラクト（L2/L3）で簡潔な記述
- CloudFormationの全機能を利用可能
- AWS公式が提供するベストプラクティスパターン
- cdk diffで変更の事前確認

---

## 比較表

### 基本機能

| 項目           | Terraform             | CloudFormation   | Pulumi                | CDK                  |
| :------------- | :-------------------- | :--------------- | :-------------------- | :------------------- |
| 記述言語       | HCL                   | JSON/YAML        | TypeScript, Python等  | TypeScript, Python等 |
| マルチクラウド | 対応                  | AWSのみ          | 対応                  | AWSのみ              |
| State管理      | tfstate（S3等で管理） | AWSが管理        | Pulumi Cloud/自己管理 | AWSが管理（CFn）     |
| プレビュー     | terraform plan        | Change Sets      | pulumi preview        | cdk diff             |
| ドリフト検出   | terraform plan        | ドリフト検出機能 | pulumi refresh        | ドリフト検出（CFn）  |
| モジュール化   | Modules               | Nested Stacks    | コンポーネント        | Constructs           |
| 学習コスト     | 中（HCL習得）         | 低〜中（YAML）   | 低（既知の言語）      | 低（既知の言語）     |
| エコシステム   | 最大級                | AWS公式          | 成長中                | AWS公式              |

### 料金比較

| ツール           | 無料枠              | 有料プラン               |
| :--------------- | :------------------ | :----------------------- |
| Terraform（CLI） | 無料（OSS）         | ---                      |
| Terraform Cloud  | 500リソースまで無料 | $0.00014/リソース/時間〜 |
| CloudFormation   | 完全無料            | ---                      |
| Pulumi（CLI）    | 無料（OSS）         | ---                      |
| Pulumi Cloud     | 個人無料            | $1.10/リソース/月〜      |
| CDK              | 完全無料            | ---                      |

### コード量の比較（VPC + サブネット + EC2の作成例）

| ツール         | 概算行数 | 特徴                         |
| :------------- | :------- | :--------------------------- |
| Terraform      | 40-60行  | HCLで明示的に記述            |
| CloudFormation | 80-120行 | YAML/JSONで冗長になりがち    |
| Pulumi         | 30-50行  | プログラミング言語の簡潔さ   |
| CDK            | 20-40行  | L2コンストラクトで大幅に短縮 |

---

## コード例の比較

### S3バケットの作成

**Terraform:**

```hcl
resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-unique-bucket-name"
}

resource "aws_s3_bucket_versioning" "my_bucket" {
  bucket = aws_s3_bucket.my_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}
```

**CloudFormation:**

```yaml
Resources:
  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: my-unique-bucket-name
      VersioningConfiguration:
        Status: Enabled
```

**Pulumi (TypeScript):**

```typescript
import * as aws from '@pulumi/aws'

const bucket = new aws.s3.Bucket('my-bucket', {
  bucket: 'my-unique-bucket-name',
  versioning: {
    enabled: true,
  },
})
```

**CDK (TypeScript):**

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3'

const bucket = new s3.Bucket(this, 'MyBucket', {
  bucketName: 'my-unique-bucket-name',
  versioned: true,
})
```

---

## 判断フローチャート

```
[IaCツール選定]
    |
    v
[マルチクラウドが必要?]
    |
    +-- はい --> [チームのプログラミングスキルが高い?]
    |               |
    |               +-- はい --> Pulumi
    |               |           （TypeScript/Python等で記述）
    |               |
    |               +-- いいえ --> Terraform
    |                              （HCLは比較的学びやすい）
    |
    +-- いいえ（AWSのみ）
         |
         v
    [チームのプログラミングスキルが高い?]
         |
         +-- はい --> [既存のCloudFormation資産がある?]
         |               |
         |               +-- はい --> CDK（CloudFormationと共存可能）
         |               |
         |               +-- いいえ --> CDK or Pulumi
         |
         +-- いいえ
              |
              v
         [シンプルな構成?]
              |
              +-- はい --> CloudFormation（追加ツール不要）
              |
              +-- いいえ --> Terraform（モジュールエコシステム活用）
```

---

## State管理の重要性

### Stateとは

IaCツールが管理するインフラの「現在の状態」を記録したファイル。このファイルをもとに、コードの変更内容と実際のインフラの差分を計算する。

### Terraformのtfstate

Terraformでは`terraform.tfstate`ファイルにState情報が保存される。

**チーム開発でのState管理:**

| 方式                        | 説明                                | 推奨度       |
| :-------------------------- | :---------------------------------- | :----------- |
| ローカルファイル            | デフォルト。チーム開発には不向き    | 個人開発のみ |
| S3 + DynamoDB               | S3にState保存、DynamoDBでロック管理 | 推奨         |
| Terraform Cloud             | HashiCorp提供のマネージドサービス   | 推奨         |
| その他（GCS、Azure Blob等） | 各クラウドのストレージを利用        | 可           |

**S3バックエンドの設定例:**

```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "terraform-lock"
    encrypt        = true
  }
}
```

### CloudFormation/CDKのState管理

CloudFormationはAWSがStateを管理するため、開発者がState管理を気にする必要がない。これはCloudFormation/CDKの大きなメリットの一つ。

---

## ユースケース別の推奨

### スタートアップ（AWSのみ）

**推奨: CDK**

- TypeScriptで直感的に記述
- L2コンストラクトで簡潔
- AWS公式のベストプラクティスが組み込まれている

### マルチクラウド環境

**推奨: Terraform**

- AWS、GCP、Azure全てに対応
- プロバイダーエコシステムが最も充実
- 業界標準として最も普及

### エンタープライズ（AWS）

**推奨: CloudFormation or CDK**

- AWS公式サポート
- 追加コストなし
- AWSサービスへの対応が最速

### SaaS/PaaS管理も含む

**推奨: Terraform or Pulumi**

- Datadog、PagerDuty、GitHub等のSaaSリソースも管理可能
- 例: TerraformでAWSインフラ + Datadogモニタリング + GitHub設定を一元管理

---

## チーム規模別の運用パターン

### 1-3人チーム

| ツール    | 推奨構成                                 |
| :-------- | :--------------------------------------- |
| Terraform | ローカルState or Terraform Cloud（Free） |
| CDK       | デフォルト（CloudFormation管理）         |

### 5-20人チーム

| ツール    | 推奨構成                                             |
| :-------- | :--------------------------------------------------- |
| Terraform | S3 + DynamoDB State、モジュール化、CI/CDパイプライン |
| CDK       | スタック分割、CI/CDパイプライン、cdk pipelines       |

### 50人以上

| ツール    | 推奨構成                                                             |
| :-------- | :------------------------------------------------------------------- |
| Terraform | Terraform Cloud/Enterprise、Sentinel（ポリシー）、ワークスペース分割 |
| CDK       | マルチアカウント、cdk pipelines、Service Catalog                     |

---

## 実際の企業での採用事例

### Terraform

- **Uber**: マルチクラウド環境のインフラ管理にTerraformを採用
- **Slack**: AWSインフラの管理にTerraformを使用
- 多くのSaaS企業がTerraformをデファクトスタンダードとして採用

### CloudFormation

- **Amazon自身**: AWS内部のサービスもCloudFormationで管理
- エンタープライズのAWS環境で広く使用

### Pulumi

- **Snowflake**: クラウドインフラの管理にPulumiを採用
- **Mercedes-Benz**: 自動車関連のクラウドインフラ管理

### CDK

- **AWS内部チーム**: 多くのAWSサービスチームがCDKを利用
- **Liberty Mutual**: 保険業界のクラウドインフラにCDKを採用

---

## IaCのベストプラクティス

| プラクティス       | 説明                                     |
| :----------------- | :--------------------------------------- |
| 小さな変更を頻繁に | 大きな変更は事故のリスクが高い           |
| コードレビュー必須 | planの結果もレビューする                 |
| 環境を分離         | dev/staging/prodでState/スタックを分ける |
| モジュール化       | 再利用可能な単位に分割                   |
| シークレット管理   | コードにハードコードしない               |
| CI/CDパイプライン  | 手動適用を避ける                         |
| ドリフト検出       | 手動変更を定期的に検知                   |
| タグ付け           | 全リソースにコスト管理用のタグを付与     |

---

## 移行パスの考え方

### CloudFormation → CDK

CDKはCloudFormationに変換されるため、段階的な移行が可能。既存のCloudFormationテンプレートをCDKにインポートすることもできる。

### CloudFormation → Terraform

`cf2tf`などのツールで変換可能だが、完全な自動変換は難しい。段階的に新規リソースからTerraformで管理し、既存リソースは`terraform import`で取り込む方法が現実的。

### Terraform → Pulumi

Pulumiは`pulumi import`や`pulumi convert`でTerraformからの移行をサポートしている。HCLからPulumiコードへの変換ツールも提供されている。

---

## まとめ

| ツール         | こんな時に使う                        | 一言で言うと                |
| :------------- | :------------------------------------ | :-------------------------- |
| Terraform      | マルチクラウド、業界標準が欲しい      | IaCのデファクトスタンダード |
| CloudFormation | AWSのみ、シンプルに始めたい           | AWS純正で安心               |
| Pulumi         | プログラミング言語で書きたい          | 開発者フレンドリーなIaC     |
| CDK            | AWSのみ、プログラミング言語で書きたい | CloudFormationの進化版      |

2025年現在、**Terraform**がIaC全体のデファクトスタンダードであり、**CDK**がAWS限定のプロジェクトで急速にシェアを拡大している。チームのスキルセットとプロジェクトの要件に合わせて選択しよう。

---

## 参考リンク

- [Terraform公式ドキュメント](https://developer.hashicorp.com/terraform/docs)
- [AWS CloudFormation公式ドキュメント](https://docs.aws.amazon.com/cloudformation/)
- [Pulumi公式ドキュメント](https://www.pulumi.com/docs/)
- [AWS CDK公式ドキュメント](https://docs.aws.amazon.com/cdk/)
- [Terraform Registry](https://registry.terraform.io/)
