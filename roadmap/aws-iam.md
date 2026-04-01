---
title: 'AWS IAM'
order: 5
section: 'DevOps/インフラ'
---

# AWS IAM

## IAMとは

IAM（Identity and Access Management）は、AWSリソースへのアクセスを安全に管理するためのサービス。「誰が」「何に」「何をできるか」を制御する、AWSセキュリティの根幹を担うサービス。

IAMは無料で利用できる。IAM自体に料金は発生せず、IAMで制御されたAWSリソースの利用に対してのみ課金される。

### なぜIAMが重要か

| リスク | 対策 |
| --- | --- |
| 不正アクセス | 認証（Authentication）で身元確認 |
| 過剰な権限 | 認可（Authorization）で最小権限を付与 |
| 認証情報の漏洩 | 一時認証情報（STS）の活用 |
| 操作の追跡不能 | CloudTrailとの連携で全操作を記録 |
| 複数アカウントの管理困難 | クロスアカウントロールで統合管理 |

---

## IAMの基本構成要素

### 全体像

```mermaid
graph TD
    A[AWSアカウント] --> B[ルートユーザー]
    A --> C[IAMユーザー]
    A --> D[IAMグループ]
    A --> E[IAMロール]
    A --> F[IAMポリシー]

    D -->|所属| C
    F -->|アタッチ| C
    F -->|アタッチ| D
    F -->|アタッチ| E

    E -->|引き受け| G[AWSサービス]
    E -->|引き受け| H[他アカウントのユーザー]
    E -->|引き受け| I[フェデレーションユーザー]
```

### ルートユーザー

AWSアカウント作成時に生成される、全ての権限を持つユーザー。メールアドレスとパスワードでログインする。

**ルートユーザーのルール:**

- 日常業務では絶対に使わない
- MFA（多要素認証）を必ず有効にする
- アクセスキーを作成しない
- ルートユーザーが必要な操作（アカウント設定変更、請求情報のアクセス設定等）のみで使用

### IAMユーザー

AWSを利用する個人やアプリケーションを表すエンティティ。ユーザー名とパスワード（コンソールアクセス用）、またはアクセスキー（API/CLIアクセス用）で認証する。

| 認証方式 | 用途 | セキュリティ |
| --- | --- | --- |
| パスワード | AWSマネジメントコンソール | MFA必須にする |
| アクセスキー | AWS CLI / SDK | 定期ローテーション、可能なら使用しない |

**推奨事項**: IAMユーザーの代わりにIAM Identity Center（旧AWS SSO）を使い、フェデレーション認証を導入する。長期的な認証情報（パスワードやアクセスキー）の管理が不要になる。

### IAMグループ

IAMユーザーの集合。グループにポリシーをアタッチすると、所属する全ユーザーにそのポリシーが適用される。

```
開発者グループ → 開発者ポリシー
  ├── ユーザーA
  ├── ユーザーB
  └── ユーザーC

管理者グループ → 管理者ポリシー
  ├── ユーザーD
  └── ユーザーE
```

- ユーザーは複数のグループに所属可能
- グループのネスト（グループの中にグループ）は不可
- ユーザーに直接ポリシーをアタッチするのではなく、グループを経由するのがベストプラクティス

### IAMロール

AWSサービスや他のAWSアカウント、フェデレーションユーザーが一時的に引き受ける（Assume）ことで権限を取得するエンティティ。ロール自体は認証情報を持たない。

| ロールの種類 | 説明 | 例 |
| --- | --- | --- |
| AWSサービスロール | AWSサービスが引き受ける | EC2がS3にアクセス、LambdaがDynamoDBにアクセス |
| クロスアカウントロール | 他のAWSアカウントが引き受ける | 本番アカウントのS3を開発アカウントから参照 |
| フェデレーションロール | 外部IdP認証ユーザーが引き受ける | SAML/OIDC連携 |
| サービスリンクドロール | AWSサービスに紐づく自動作成ロール | Auto Scaling、ELBなど |

**ロールを使うべき場面:**

- EC2上のアプリからAWSサービスにアクセスする場合（アクセスキーを使わない）
- Lambda関数からDynamoDBにアクセスする場合
- 別アカウントのリソースにアクセスする場合

---

## IAMポリシー

### ポリシーの種類

| 種類 | 説明 | 管理主体 |
| --- | --- | --- |
| AWS管理ポリシー | AWSが事前定義したポリシー | AWS |
| カスタマー管理ポリシー | ユーザーが自分で作成したポリシー | ユーザー |
| インラインポリシー | ユーザー/グループ/ロールに直接埋め込むポリシー | ユーザー |

**推奨**: カスタマー管理ポリシーを使用する。再利用性が高く、変更管理がしやすい。インラインポリシーは特殊なケースを除き使用しない。

### ポリシーの構造（JSON）

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3ReadAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-bucket",
        "arn:aws:s3:::my-bucket/*"
      ],
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": "203.0.113.0/24"
        }
      }
    }
  ]
}
```

### ポリシー要素の詳細

| 要素 | 必須 | 説明 |
| --- | --- | --- |
| Version | はい | ポリシー言語のバージョン（`"2012-10-17"`を使用） |
| Statement | はい | 1つ以上のステートメントの配列 |
| Sid | いいえ | ステートメントの識別子（任意の文字列） |
| Effect | はい | `Allow`または`Deny` |
| Action | はい | 許可/拒否するアクション（`s3:GetObject`等） |
| Resource | はい | 対象リソースのARN |
| Condition | いいえ | 条件（IPアドレス、時間帯、MFA有無等） |
| Principal | 場合による | リソースベースポリシーで必須。対象のエンティティ |

### ポリシーの評価ロジック

```mermaid
graph TD
    A[リクエスト] --> B{明示的なDenyがあるか?}
    B -->|はい| C[拒否]
    B -->|いいえ| D{SCPで許可されているか?}
    D -->|いいえ| C
    D -->|はい| E{リソースベースポリシーで許可?}
    E -->|はい| F[許可]
    E -->|いいえ| G{アイデンティティベースポリシーで許可?}
    G -->|はい| H{Permissions Boundaryで許可?}
    H -->|はい| F
    H -->|いいえ| C
    G -->|いいえ| C
```

**重要な原則:**

1. デフォルトは全て拒否（暗黙的Deny）
2. 明示的なAllowがあれば許可
3. 明示的なDenyは全てに優先する（Allow + Deny → Deny）

### 条件（Condition）の活用

```json
{
  "Condition": {
    "StringEquals": {
      "aws:RequestedRegion": "ap-northeast-1"
    },
    "Bool": {
      "aws:MultiFactorAuthPresent": "true"
    },
    "DateGreaterThan": {
      "aws:CurrentTime": "2026-01-01T00:00:00Z"
    },
    "IpAddress": {
      "aws:SourceIp": ["203.0.113.0/24", "198.51.100.0/24"]
    }
  }
}
```

| 条件キー | 説明 |
| --- | --- |
| aws:SourceIp | リクエスト元のIPアドレス |
| aws:CurrentTime | 現在時刻 |
| aws:MultiFactorAuthPresent | MFA認証済みか |
| aws:RequestedRegion | リクエスト先のリージョン |
| aws:PrincipalTag/xxx | プリンシパルのタグ値 |
| aws:ResourceTag/xxx | リソースのタグ値 |

---

## 最小権限の原則

### 原則

「必要な権限だけを、必要なリソースに、必要な期間だけ付与する。」

これはIAMの最も重要な原則であり、セキュリティインシデントの被害を最小限に抑えるための基本。

### 実践方法

| ステップ | 説明 | ツール |
| --- | --- | --- |
| 1. 広い権限で開始 | 開発初期は動作確認のために広めの権限を付与 | AWS管理ポリシー |
| 2. アクセス分析 | 実際に使用された権限を分析 | IAM Access Analyzer |
| 3. 権限の絞り込み | 未使用の権限を削除 | 最終アクセス情報 |
| 4. 継続的な監視 | 定期的に権限を見直す | Access Analyzer + CloudTrail |

### IAM Access Analyzer

IAM Access Analyzerは、外部エンティティと共有されているリソースを検出し、ポリシーの検証を行うツール。

主な機能:

- **外部アクセス分析**: S3バケット、IAMロール、KMSキーなどが外部と共有されていないか検出
- **未使用アクセス分析**: 未使用のロール、アクセスキー、パスワード、権限を検出
- **ポリシー生成**: CloudTrailのアクティビティログから最小権限のポリシーを自動生成
- **ポリシー検証**: ポリシーのベストプラクティス違反をチェック

### 悪い例と良い例

**悪い例（過剰な権限）:**

```json
{
  "Effect": "Allow",
  "Action": "s3:*",
  "Resource": "*"
}
```

**良い例（最小権限）:**

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:PutObject"
  ],
  "Resource": "arn:aws:s3:::my-app-uploads/*"
}
```

---

## AWS STS（Security Token Service）

STSは、一時的な認証情報を発行するサービス。IAMロールを引き受ける（AssumeRole）際に使用される。

### 一時認証情報のメリット

| 項目 | 長期認証情報（アクセスキー） | 一時認証情報（STS） |
| --- | --- | --- |
| 有効期限 | 手動で削除するまで有効 | 自動的に失効（15分〜12時間） |
| ローテーション | 手動で行う必要がある | 自動的に更新 |
| 漏洩リスク | 高い（永久に使える） | 低い（有効期限切れで無効化） |
| 管理コスト | ローテーション運用が必要 | ほぼ不要 |

### AssumeRole

```javascript
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';

const stsClient = new STSClient({ region: 'ap-northeast-1' });

const response = await stsClient.send(
  new AssumeRoleCommand({
    RoleArn: 'arn:aws:iam::987654321098:role/CrossAccountRole',
    RoleSessionName: 'my-session',
    DurationSeconds: 3600,
  })
);

// 取得した一時認証情報を使って他のAWSサービスにアクセス
const { AccessKeyId, SecretAccessKey, SessionToken } = response.Credentials;
```

### フェデレーション

外部のIDプロバイダー（IdP）で認証されたユーザーに、AWSの一時認証情報を付与する仕組み。

| 方式 | 説明 | ユースケース |
| --- | --- | --- |
| SAML 2.0 | エンタープライズIdP連携 | Active Directory、Okta |
| OIDC | OpenID Connect連携 | Google、GitHub Actions |
| IAM Identity Center | AWS統合SSO | 組織内の全AWSアカウントへのSSO |

### GitHub Actions での OIDC連携例

```yaml
# .github/workflows/deploy.yml
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
          aws-region: ap-northeast-1

      - run: aws s3 sync ./dist s3://my-bucket/
```

---

## クロスアカウントアクセス

複数のAWSアカウント間でリソースにアクセスする仕組み。

### クロスアカウントロールの設定

```mermaid
sequenceDiagram
    participant U as 開発アカウントのユーザー
    participant STS as AWS STS
    participant R as 本番アカウントのロール
    participant S3 as 本番アカウントのS3

    U->>STS: AssumeRole（本番ロールのARN）
    STS->>STS: 信頼ポリシーの検証
    STS->>U: 一時認証情報の返却
    U->>S3: 一時認証情報でS3アクセス
    S3->>U: データ返却
```

### 本番アカウント側の信頼ポリシー

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::111111111111:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "Bool": {
          "aws:MultiFactorAuthPresent": "true"
        },
        "StringEquals": {
          "sts:ExternalId": "unique-external-id"
        }
      }
    }
  ]
}
```

### 開発アカウント側のポリシー

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": "arn:aws:iam::999999999999:role/ProductionReadOnlyRole"
    }
  ]
}
```

---

## サービスロール

AWSサービスがユーザーに代わって他のAWSサービスにアクセスするためのロール。

### 主なサービスロール

| サービス | ロールの用途 | 信頼ポリシーのPrincipal |
| --- | --- | --- |
| EC2 | S3やDynamoDBへのアクセス | `ec2.amazonaws.com` |
| Lambda | DynamoDB、S3、SQSへのアクセス | `lambda.amazonaws.com` |
| ECS | ECRからのイメージ取得 | `ecs-tasks.amazonaws.com` |
| Step Functions | Lambda呼び出し | `states.amazonaws.com` |
| CloudFormation | スタック内リソースの作成 | `cloudformation.amazonaws.com` |

### Lambda実行ロールの例

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

権限ポリシー:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:ap-northeast-1:123456789:table/Orders"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:ap-northeast-1:123456789:*"
    }
  ]
}
```

---

## Permissions Boundary

Permissions Boundary（権限の境界）は、IAMユーザーやロールに設定できる権限の上限。管理者が「この範囲内で自由にポリシーを作成してよい」という枠組みを定義できる。

### 仕組み

```
有効な権限 = アイデンティティベースポリシー ∩ Permissions Boundary
```

両方で許可されている場合のみアクセスが許可される。

### ユースケース

開発者にIAMロールの作成を許可しつつ、権限エスカレーション（自分より強い権限のロールを作成すること）を防ぐ。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "dynamodb:*",
        "lambda:*",
        "logs:*",
        "sqs:*",
        "sns:*"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Deny",
      "Action": [
        "iam:*",
        "organizations:*",
        "account:*"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## AWS Organizations と SCP

### SCP（Service Control Policy）

AWS Organizationsのメンバーアカウントに適用する権限の上限。Permissions Boundaryがユーザー/ロール単位なのに対し、SCPはアカウント単位。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyNonTokyoRegion",
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": ["ap-northeast-1", "us-east-1"]
        }
      }
    }
  ]
}
```

この例では、東京リージョンとバージニア北部（グローバルサービス用）以外のリージョンでの操作を全て拒否する。

---

## ベストプラクティス

### 認証

- ルートユーザーにMFAを設定し、日常業務では使用しない
- IAMユーザーにもMFAを強制する
- IAM Identity Center（SSO）によるフェデレーション認証を導入する
- 長期アクセスキーの使用を最小限にし、可能ならロールベースに移行する
- パスワードポリシーを強化する（最小長、複雑性要件）

### 認可

- 最小権限の原則を徹底する
- IAM Access Analyzerを活用してポリシーを最適化する
- グループまたはロール経由でポリシーをアタッチする（ユーザー直接アタッチを避ける）
- Permissions Boundaryで権限エスカレーションを防止する
- 条件キーを活用して細かいアクセス制御を実装する

### 監査

- AWS CloudTrailを有効にして全API呼び出しを記録する
- IAMの「最終アクセス情報」を定期的に確認する
- 未使用のユーザー、ロール、アクセスキーを削除する
- IAM Access Analyzerの定期レポートを確認する
- AWS Configルールでポリシーのコンプライアンスを監視する

### マルチアカウント

- AWS Organizationsで組織構造を管理する
- SCPでアカウントレベルの権限上限を設定する
- クロスアカウントアクセスにはロールベースの委任を使用する
- 外部IDを使用してクロスアカウントロールのセキュリティを強化する

---

## MFA（多要素認証）

### MFAとは

MFA（Multi-Factor Authentication）は、パスワードに加えて追加の認証要素を求める仕組みである。IAMユーザーやルートアカウントに対して設定でき、不正アクセスのリスクを大幅に低減する。

### MFAの種類

| 種類 | デバイス | 特徴 |
|:---|:---|:---|
| **仮想MFA** | スマートフォンアプリ（Google Authenticator, Authy等） | 無料、最も一般的 |
| **FIDO2セキュリティキー** | YubiKey等のハードウェアキー | フィッシング耐性が高い |
| **ハードウェアMFA** | AWS提供の物理トークン | オフライン環境でも使用可能 |

### MFAの強制

IAMポリシーで「MFAを有効にしていないユーザーの操作を拒否」するパターンが一般的。

```json
{
  "Sid": "DenyAllExceptMFAManagement",
  "Effect": "Deny",
  "NotAction": [
    "iam:CreateVirtualMFADevice",
    "iam:EnableMFADevice",
    "iam:GetUser",
    "iam:ListMFADevices",
    "sts:GetSessionToken"
  ],
  "Resource": "*",
  "Condition": {
    "BoolIfExists": {
      "aws:MultiFactorAuthPresent": "false"
    }
  }
}
```

**ベストプラクティス**: ルートアカウントには必ずMFAを設定する。IAMユーザーにもMFAを必須とするポリシーを適用する。

---

## IAM Identity Center（旧AWS SSO）

### IAM Identity Centerとは

IAM Identity Center（旧AWS Single Sign-On）は、複数のAWSアカウントやビジネスアプリケーションへのシングルサインオンを提供するサービス。AWS Organizationsと統合して、組織全体のアクセス管理を一元化する。

```mermaid
graph TD
    USER[ユーザー] -->|SSO| IC[IAM Identity Center]
    IC --> A1[AWSアカウント: 開発]
    IC --> A2[AWSアカウント: ステージング]
    IC --> A3[AWSアカウント: 本番]
    IC --> APP[ビジネスアプリ<br/>Slack, GitHub等]

    subgraph "ID ソース"
        IDP[外部IdP<br/>Okta, Azure AD]
        DIR[Identity Center<br/>ディレクトリ]
        AD[Active Directory]
    end
    IDP --> IC
    DIR --> IC
    AD --> IC
    style IC fill:#ff9900,color:#fff
```

### IAMユーザー vs IAM Identity Center

| | IAMユーザー | IAM Identity Center |
|:---|:---|:---|
| アクセスキー | 長期的（ローテーション必要） | 一時的（自動ローテーション） |
| マルチアカウント | アカウントごとにユーザー作成 | 一元管理 |
| SSO | なし | あり |
| 推奨用途 | 自動化・CI/CD（サービスアカウント） | 人間のユーザー |

**現在のベストプラクティス**: 人間のユーザーにはIAM Identity Centerを使い、IAMユーザーの作成は最小限にする。

---

## よくあるIAMのミスと対策

### 1. ルートアカウントの日常使用

**ミス**: ルートアカウントで日常の開発作業を行う。

**対策**: ルートアカウントにはMFAを設定し、アクセスキーを作成しない。日常業務はIAMユーザーまたはIAM Identity Center経由で行う。

### 2. AdministratorAccessの乱用

**ミス**: 全員に`AdministratorAccess`ポリシーを付与する。

**対策**: 最小権限の原則に従い、業務に必要な権限だけを付与する。まずReadOnlyAccessから始め、必要に応じて権限を追加する。

### 3. アクセスキーの放置

**ミス**: 退職者や使われなくなったアクセスキーがアクティブなまま残っている。

**対策**: IAM Access Analyzerで未使用のアクセスキーを定期的に確認する。90日以上未使用のキーは無効化する。

### 4. ポリシーのResource: "*"

**ミス**: すべてのリソースに対して権限を付与する `"Resource": "*"` を安易に使う。

**対策**: 可能な限りリソースARNを具体的に指定する。特にS3バケットやDynamoDBテーブルは名前で限定する。

### 5. インラインポリシーの多用

**ミス**: 管理ポリシーを使わず、各ユーザー/ロールにインラインポリシーを直接記述する。

**対策**: 管理ポリシー（カスタマーマネージド）を作成して再利用する。インラインポリシーは例外的なケースのみ。

### 6. クロスアカウントで外部IDを使わない

**ミス**: サードパーティにロールを委任する際、外部IDなしで信頼ポリシーを設定する。

**対策**: 外部IDを`Condition`に含めることで、混乱した代理（Confused Deputy）問題を防ぐ。

```mermaid
graph TD
    subgraph "よくあるミス TOP 6"
        M1[ルートアカウント<br/>日常使用] -->|対策| S1[MFA設定<br/>アクセスキー削除]
        M2[Admin権限<br/>全員に付与] -->|対策| S2[最小権限<br/>ReadOnlyから開始]
        M3[アクセスキー<br/>放置] -->|対策| S3[定期監査<br/>90日ルール]
        M4[Resource: *<br/>全リソース許可] -->|対策| S4[ARN指定<br/>リソース限定]
        M5[インラインポリシー<br/>多用] -->|対策| S5[管理ポリシー<br/>再利用]
        M6[外部IDなし<br/>クロスアカウント] -->|対策| S6[外部ID必須<br/>Condition追加]
    end
    style M1 fill:#d93025,color:#fff
    style M2 fill:#d93025,color:#fff
    style M3 fill:#d93025,color:#fff
    style M4 fill:#d93025,color:#fff
    style M5 fill:#d93025,color:#fff
    style M6 fill:#d93025,color:#fff
    style S1 fill:#2ea44f,color:#fff
    style S2 fill:#2ea44f,color:#fff
    style S3 fill:#2ea44f,color:#fff
    style S4 fill:#2ea44f,color:#fff
    style S5 fill:#2ea44f,color:#fff
    style S6 fill:#2ea44f,color:#fff
```

---

## 参考文献

- [AWS IAM 公式ドキュメント](https://docs.aws.amazon.com/iam/)
- [IAM ベストプラクティス](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [IAM ポリシーリファレンス](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies.html)
- [AWS STS ドキュメント](https://docs.aws.amazon.com/STS/latest/APIReference/)
- [IAM Access Analyzer](https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html)
- [AWS IAM Identity Center](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html)
- [AWS Organizations SCP](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html)
- [IAM ポリシー評価ロジック](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
