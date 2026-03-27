---
title: 'Terraform'
order: 29
section: 'DevOps/インフラ'
---

# Terraform

## IaC（Infrastructure as Code）とは

IaCとは、サーバーやネットワークなどのインフラ構成を、手動で管理するのではなく「コード」として記述・管理する考え方のこと。

従来のインフラ構築では、管理画面（AWSコンソールなど）をポチポチとクリックしてサーバーを立てていた。この方法には以下のような問題がある。

| 問題                   | 具体的な状況                                            | 影響                               |
| ---------------------- | ------------------------------------------------------- | ---------------------------------- |
| 再現性がない           | 同じ環境をもう1つ作りたいとき、手順を正確に再現できない | 開発環境と本番環境で差異が生まれる |
| バージョン管理できない | いつ誰が何を変更したか追跡できない                      | 問題発生時に原因特定が困難         |
| 属人化                 | 構築手順を知っている人しか操作できない                  | チームのスケールが難しい           |
| ヒューマンエラー       | 手動操作で設定を間違える                                | セキュリティホールやサービス障害   |
| ドキュメントの陳腐化   | 手順書が実際の環境と乖離する                            | 手順書を信頼できなくなる           |

IaCでは、これらの問題を「コード化」によって解決する。コードであれば、Gitで管理でき、レビューでき、何度でも同じ環境を再現できる。

身近な例で考えると、IaCは「レシピ」のようなもの。料理を作るとき、レシピがあれば誰でも同じ料理を再現できる。レシピがなければ、作った人の記憶に頼るしかない。

## なぜIaCが必要か

### 手動構築の問題

```
手動構築の流れ:
1. AWSコンソールにログイン
2. EC2の画面を開く
3. 「インスタンスを起動」をクリック
4. AMIを選択
5. インスタンスタイプを選択
6. ネットワーク設定...
7. セキュリティグループ設定...
8. 起動！

→ これを開発・ステージング・本番の3環境分、手動で繰り返す
→ 設定ミスが発生しやすい
→ 手順を忘れたら再現できない
```

### IaCの利点

```
IaCでの構築:
1. コードを書く（1回だけ）
2. terraform apply（コマンド1つで環境構築）
3. 別環境も同じコードで構築可能

→ 何度でも同じ環境を再現可能
→ コードレビューで設定ミスを防止
→ Gitで変更履歴を管理
```

## Terraformとは

TerraformはHashiCorp社が開発したオープンソースのIaCツール。最大の特徴は、AWS、Azure、GCPなど複数のクラウドプロバイダに対応している点。

### IaCツール比較

| 特徴         | Terraform                  | CloudFormation  | Pulumi                     |
| ------------ | -------------------------- | --------------- | -------------------------- |
| 開発元       | HashiCorp                  | AWS             | Pulumi Inc.                |
| 対応クラウド | マルチクラウド             | AWSのみ         | マルチクラウド             |
| 記述言語     | HCL                        | JSON/YAML       | TypeScript/Python/Go等     |
| 状態管理     | tfstateファイル            | AWSが自動管理   | Pulumi Cloudまたはファイル |
| 学習コスト   | 中程度                     | 低（AWS利用者） | 低（プログラマ向け）       |
| エコシステム | 非常に豊富                 | AWS限定だが充実 | 成長中                     |
| 料金         | 無料（Enterprise版は有料） | 無料            | 無料（Team版は有料）       |
| 採用企業     | 非常に多い                 | AWS利用企業     | 増加中                     |

Terraformが最も広く使われている理由:

- マルチクラウド対応で、AWSからGCPへの移行なども柔軟に対応可能
- コミュニティが非常に大きく、情報が豊富
- 宣言的なHCLが直感的で読みやすい
- Moduleエコシステムが充実しており、よく使う構成を再利用しやすい

## インストール方法

### macOS

```bash
# Homebrewでインストール
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# バージョン確認
terraform version
```

### tfenvでバージョン管理（推奨）

プロジェクトごとに異なるTerraformバージョンを使い分けたい場合は、tfenvが便利。Node.jsにおけるnvmのようなもの。

```bash
# tfenvのインストール
brew install tfenv

# 利用可能なバージョンの一覧
tfenv list-remote

# 特定のバージョンをインストール
tfenv install 1.7.0

# バージョンを切り替え
tfenv use 1.7.0

# プロジェクトごとにバージョンを固定
echo "1.7.0" > .terraform-version
```

### Windows

```powershell
# Chocolateyでインストール
choco install terraform

# または Scoopでインストール
scoop install terraform
```

## HCL（HashiCorp Configuration Language）の基本構文

HCLはTerraformの設定を記述するための言語。JSONやYAMLに似ているが、より人間にとって読みやすい構文になっている。

### 基本的な書き方

```hcl
# コメント（1行）

/*
  コメント（複数行）
*/

# ブロック構文
resource "aws_instance" "web" {
  ami           = "ami-0123456789abcdef0"
  instance_type = "t3.micro"

  tags = {
    Name = "web-server"
  }
}
```

### データ型

| 型     | 例                  | 説明             |
| ------ | ------------------- | ---------------- |
| string | `"hello"`           | 文字列           |
| number | `42`, `3.14`        | 数値             |
| bool   | `true`, `false`     | 真偽値           |
| list   | `["a", "b", "c"]`   | 順序付きリスト   |
| map    | `{ key = "value" }` | キーと値のペア   |
| set    | `toset(["a", "b"])` | 重複なしのリスト |

### 文字列の補間

```hcl
variable "project_name" {
  default = "myapp"
}

resource "aws_instance" "web" {
  tags = {
    Name = "${var.project_name}-web-server"  # 変数の埋め込み
  }
}
```

### 条件式と繰り返し

```hcl
# 条件式（三項演算子）
instance_type = var.environment == "production" ? "t3.large" : "t3.micro"

# count による繰り返し
resource "aws_instance" "web" {
  count         = 3
  ami           = "ami-0123456789abcdef0"
  instance_type = "t3.micro"

  tags = {
    Name = "web-server-${count.index}"  # web-server-0, web-server-1, web-server-2
  }
}

# for_each による繰り返し
resource "aws_instance" "web" {
  for_each = {
    web1 = "t3.micro"
    web2 = "t3.small"
    web3 = "t3.medium"
  }

  ami           = "ami-0123456789abcdef0"
  instance_type = each.value

  tags = {
    Name = each.key
  }
}
```

## 基本概念

Terraformを使いこなすために理解すべき概念を1つずつ解説する。

### 概念の全体像

```
[Provider] ── どのクラウドを使うか（AWS, GCP, Azure等）
    |
[Resource] ── 作りたいインフラ（EC2, S3, VPC等）
    |
[Data Source] ── 既存リソースの参照
    |
[Variable] ── 変数（環境ごとに変えたい値）
    |
[Output] ── 出力値（作成後に知りたい情報）
    |
[Module] ── 再利用可能なコードのまとまり
    |
[State] ── 現在のインフラの状態を記録するファイル
```

### Provider

Providerは「どのクラウドサービスを操作するか」を定義する。Terraformが各クラウドのAPIと通信するためのプラグイン。

```hcl
# AWS Providerの設定
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"  # 5.x系の最新を使用
    }
  }
  required_version = ">= 1.7.0"
}

provider "aws" {
  region = "ap-northeast-1"  # 東京リージョン
}
```

バージョン制約の記号:

| 記号       | 意味           | 例                          |
| ---------- | -------------- | --------------------------- |
| `= 5.0.0`  | 完全一致       | 5.0.0のみ                   |
| `>= 5.0.0` | 以上           | 5.0.0以上の任意のバージョン |
| `~> 5.0`   | 互換性あり     | 5.x系（5.0以上6.0未満）     |
| `~> 5.0.0` | パッチのみ許可 | 5.0.x（5.0.0以上5.1.0未満） |

### Resource

Resourceは「作りたいインフラリソース」を定義する。

```hcl
# 構文: resource "<プロバイダ>_<リソース種類>" "<名前>" { ... }
resource "aws_instance" "web" {
  ami           = "ami-0123456789abcdef0"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id  # 他のリソースを参照

  tags = {
    Name        = "web-server"
    Environment = "production"
  }
}
```

リソースの属性は、作成後に他のリソースから参照できる。例えば `aws_instance.web.id` でインスタンスIDを取得できる。

### Data Source

Data Sourceは「既に存在するリソースの情報を読み取る」ための機能。新しいリソースを作るのではなく、既存のものを参照する。

```hcl
# 最新のAmazon Linux 2のAMI IDを取得
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# 参照して使用
resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux.id  # Data Sourceから取得
  instance_type = "t3.micro"
}
```

### Variable

Variableは「外部から値を注入する」ための仕組み。環境ごとに異なる設定値を管理するのに使う。

```hcl
# 変数の定義
variable "instance_type" {
  description = "EC2インスタンスのタイプ"
  type        = string
  default     = "t3.micro"
}

variable "allowed_cidr_blocks" {
  description = "許可するCIDRブロックのリスト"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "tags" {
  description = "リソースに付与するタグ"
  type        = map(string)
  default = {
    Project     = "myapp"
    Environment = "development"
  }
}

# バリデーション付き変数
variable "environment" {
  description = "デプロイ環境"
  type        = string

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "environmentはdevelopment、staging、productionのいずれかを指定してください。"
  }
}

# 機密情報の変数
variable "db_password" {
  description = "データベースのパスワード"
  type        = string
  sensitive   = true  # ログに出力されない
}
```

変数の値を設定する方法:

| 方法                | 優先度 | 用途                       |
| ------------------- | ------ | -------------------------- |
| `default`           | 最低   | デフォルト値               |
| `terraform.tfvars`  | 中     | プロジェクト共通の値       |
| `*.auto.tfvars`     | 中     | 自動読み込みされるファイル |
| `-var-file`         | 高     | 環境別のファイル           |
| `-var`              | 高     | コマンドラインで直接指定   |
| `TF_VAR_*` 環境変数 | 高     | CI/CD環境での指定          |

```bash
# terraform.tfvars（自動で読み込まれる）
instance_type = "t3.small"
environment   = "production"

# 環境別ファイル
terraform apply -var-file="environments/production.tfvars"

# 環境変数
export TF_VAR_db_password="my-secret-password"

# コマンドラインで直接指定
terraform apply -var="instance_type=t3.large"
```

### Output

Outputは「Terraformが作成したリソースの情報を出力する」ための仕組み。

```hcl
output "instance_id" {
  description = "EC2インスタンスのID"
  value       = aws_instance.web.id
}

output "instance_public_ip" {
  description = "EC2インスタンスのパブリックIP"
  value       = aws_instance.web.public_ip
}

output "db_endpoint" {
  description = "RDSのエンドポイント"
  value       = aws_db_instance.main.endpoint
  sensitive   = true  # 機密情報としてマスク
}
```

`terraform apply` 後に以下のように出力される:

```
Outputs:

instance_id = "i-0123456789abcdef0"
instance_public_ip = "54.238.123.45"
db_endpoint = <sensitive>
```

### Module

Moduleは「再利用可能なTerraformコードのパッケージ」。コードの重複を避け、組織全体で一貫したインフラを構築するために使う。

```hcl
# モジュールの呼び出し
module "vpc" {
  source = "./modules/vpc"  # ローカルモジュール

  vpc_cidr     = "10.0.0.0/16"
  project_name = "myapp"
  environment  = "production"
}

module "web_server" {
  source = "./modules/ec2"

  instance_type = "t3.micro"
  subnet_id     = module.vpc.public_subnet_id  # VPCモジュールの出力を参照
  vpc_id        = module.vpc.vpc_id
}

# Terraform Registryのモジュールを使用
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "my-vpc"
  cidr = "10.0.0.0/16"
}
```

### State

Stateは「Terraformが管理するインフラの現在の状態」を記録するファイル。`terraform.tfstate`というJSONファイルに保存される。

なぜStateが必要か: Terraformはコード（理想の状態）とState（現在の状態）を比較して、「何を作る/変更する/削除するか」を判断する。

```
コード（理想の状態） ←→ State（現在の状態） ←→ 実際のインフラ
       |                      |                      |
  EC2: t3.micro          EC2: t3.micro          EC2: t3.micro
  ↓ 変更                      ↓                      ↓
  EC2: t3.small    差分を検出 → EC2: t3.micro →  更新が必要！
```

## Terraformのワークフロー

Terraformの基本的な操作は4つのコマンドで構成される。

### ワークフロー図

```
terraform init    初期化（プロバイダのダウンロード等）
     ↓
terraform plan    実行計画の確認（何が変更されるか）
     ↓
terraform apply   実行（インフラを構築・変更）
     ↓
terraform destroy 削除（インフラを破棄）
```

### terraform init

プロジェクトの初期化。プロバイダのダウンロードやモジュールの取得を行う。新しいプロジェクトを始めるとき、またはプロバイダやモジュールを追加・変更したときに実行する。

```bash
$ terraform init

Initializing the backend...
Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
- Installing hashicorp/aws v5.31.0...
- Installed hashicorp/aws v5.31.0 (signed by HashiCorp)

Terraform has been successfully initialized!
```

### terraform plan

実行計画を表示する。実際にインフラを変更する前に、何が作られ、何が変更され、何が削除されるかを確認できる。

```bash
$ terraform plan

Terraform will perform the following actions:

  # aws_instance.web will be created
  + resource "aws_instance" "web" {
      + ami                          = "ami-0123456789abcdef0"
      + instance_type                = "t3.micro"
      + id                           = (known after apply)
      + public_ip                    = (known after apply)
      + tags                         = {
          + "Name" = "web-server"
        }
    }

Plan: 1 to add, 0 to change, 0 to destroy.
```

記号の意味:

| 記号  | 意味                     | 色    |
| ----- | ------------------------ | ----- |
| `+`   | 新規作成                 | 緑    |
| `~`   | 変更（インプレース更新） | 黄    |
| `-`   | 削除                     | 赤    |
| `-/+` | 削除して再作成           | 赤/緑 |

### terraform apply

planの内容を実行し、実際にインフラを構築・変更する。

```bash
$ terraform apply

# planの内容が表示された後
Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

aws_instance.web: Creating...
aws_instance.web: Creation complete after 32s [id=i-0123456789abcdef0]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

`-auto-approve`オプションで確認をスキップできるが、本番環境では使わないこと。

### terraform destroy

管理しているインフラを全て削除する。

```bash
$ terraform destroy

# 削除されるリソースの一覧が表示される
Plan: 0 to add, 0 to change, 1 to destroy.

Do you really want to destroy all resources?
  Enter a value: yes
```

## AWS Providerの設定

### 認証情報の管理方法

AWS Providerの認証方法は複数あり、セキュリティ面で推奨される方法がある。

| 方法                                       | セキュリティ     | 用途                      |
| ------------------------------------------ | ---------------- | ------------------------- |
| 環境変数                                   | 中               | ローカル開発              |
| 共有認証情報ファイル（~/.aws/credentials） | 中               | ローカル開発              |
| IAMロール                                  | 高               | EC2上での実行             |
| OIDC                                       | 高               | CI/CD（GitHub Actions等） |
| ハードコーディング                         | 危険（絶対禁止） | 使ってはいけない          |

```hcl
# 方法1: 環境変数（推奨：ローカル開発時）
# export AWS_ACCESS_KEY_ID="..."
# export AWS_SECRET_ACCESS_KEY="..."
provider "aws" {
  region = "ap-northeast-1"
  # 認証情報は環境変数から自動で読み取られる
}

# 方法2: プロファイル指定
provider "aws" {
  region  = "ap-northeast-1"
  profile = "my-project"  # ~/.aws/credentialsのプロファイル名
}

# 絶対にやってはいけない例
provider "aws" {
  region     = "ap-northeast-1"
  access_key = "AKIAIOSFODNN7EXAMPLE"      # 危険！
  secret_key = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"  # 危険！
}
```

## リソースの定義

### VPC（仮想ネットワーク）

```hcl
# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "main-vpc"
  }
}

# パブリックサブネット
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-northeast-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-1a"
  }
}

# プライベートサブネット
resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "ap-northeast-1a"

  tags = {
    Name = "private-subnet-1a"
  }
}

# インターネットゲートウェイ
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "main-igw"
  }
}

# ルートテーブル
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "public-rt"
  }
}

# サブネットとルートテーブルの関連付け
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}
```

### EC2インスタンス

```hcl
# セキュリティグループ
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Security group for web server"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["YOUR_IP/32"]  # 自分のIPのみ許可
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "web-sg"
  }
}

# EC2インスタンス
resource "aws_instance" "web" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = "my-key-pair"

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y httpd
    systemctl start httpd
    systemctl enable httpd
    echo "<h1>Hello from Terraform!</h1>" > /var/www/html/index.html
  EOF

  tags = {
    Name = "web-server"
  }
}
```

### S3バケット

```hcl
resource "aws_s3_bucket" "static" {
  bucket = "my-app-static-files-20240101"

  tags = {
    Name = "static-files"
  }
}

resource "aws_s3_bucket_versioning" "static" {
  bucket = aws_s3_bucket.static.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "static" {
  bucket = aws_s3_bucket.static.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

### RDS（データベース）

```hcl
resource "aws_db_subnet_group" "main" {
  name       = "main-db-subnet-group"
  subnet_ids = [aws_subnet.private_1a.id, aws_subnet.private_1c.id]

  tags = {
    Name = "main-db-subnet-group"
  }
}

resource "aws_security_group" "db" {
  name        = "db-sg"
  description = "Security group for RDS"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "MySQL from web servers"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]  # Webサーバーからのみ許可
  }

  tags = {
    Name = "db-sg"
  }
}

resource "aws_db_instance" "main" {
  identifier             = "myapp-db"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  max_allocated_storage  = 100  # オートスケーリング

  db_name  = "myapp"
  username = "admin"
  password = var.db_password  # sensitive変数から取得

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]

  backup_retention_period = 7
  skip_final_snapshot     = false
  final_snapshot_identifier = "myapp-db-final-snapshot"

  tags = {
    Name = "myapp-db"
  }
}
```

## ステートファイル（terraform.tfstate）

### ステートの重要性

ステートファイルはTerraformが「何を管理しているか」を記録するJSON形式のファイル。このファイルが壊れたり失われたりすると、Terraformはインフラの状態を把握できなくなる。

### ローカルステートの問題点

| 問題               | 説明                                       |
| ------------------ | ------------------------------------------ |
| チーム開発できない | 各メンバーが別々のステートを持つことになる |
| バックアップがない | PCが壊れたらステートが失われる             |
| 同時操作の競合     | 2人が同時にapplyすると状態が壊れる         |

### リモートバックエンド（S3 + DynamoDB）

チーム開発では、ステートをS3に保存し、DynamoDBでロックを管理するのが定番。

```hcl
# バックエンド設定
terraform {
  backend "s3" {
    bucket         = "my-terraform-state-bucket"
    key            = "production/terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
```

バックエンド用のS3バケットとDynamoDBテーブルは、Terraformで管理する前に手動で作成する（またはCloudFormationで作成する）必要がある。

```hcl
# バックエンド用リソース（別プロジェクトで管理）
resource "aws_s3_bucket" "terraform_state" {
  bucket = "my-terraform-state-bucket"

  lifecycle {
    prevent_destroy = true  # 誤って削除されないようにする
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"  # バージョニングで履歴を保持
  }
}

resource "aws_dynamodb_table" "terraform_lock" {
  name         = "terraform-state-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
```

## モジュール

### モジュールのディレクトリ構成

```
modules/
  vpc/
    main.tf        # リソース定義
    variables.tf   # 入力変数
    outputs.tf     # 出力値
  ec2/
    main.tf
    variables.tf
    outputs.tf
```

### モジュールの定義例（VPC）

```hcl
# modules/vpc/variables.tf
variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "vpc_cidr" {
  description = "VPCのCIDRブロック"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "パブリックサブネットのCIDRブロック"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

# modules/vpc/main.tf
resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-${count.index}"
  }
}

# modules/vpc/outputs.tf
output "vpc_id" {
  description = "VPCのID"
  value       = aws_vpc.this.id
}

output "public_subnet_ids" {
  description = "パブリックサブネットのID一覧"
  value       = aws_subnet.public[*].id
}
```

### モジュールの使用

```hcl
# main.tf（ルートモジュール）
module "vpc" {
  source = "./modules/vpc"

  project_name        = "myapp"
  vpc_cidr            = "10.0.0.0/16"
  public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
}

module "web_server" {
  source = "./modules/ec2"

  instance_type = "t3.micro"
  subnet_id     = module.vpc.public_subnet_ids[0]
  vpc_id        = module.vpc.vpc_id
}
```

## データソース

既存リソースを参照する例を追加で紹介する。

```hcl
# 現在のAWSアカウント情報を取得
data "aws_caller_identity" "current" {}

# 現在のリージョン情報を取得
data "aws_region" "current" {}

# 既存のVPCを参照
data "aws_vpc" "existing" {
  filter {
    name   = "tag:Name"
    values = ["existing-vpc"]
  }
}

# 使用例
resource "aws_subnet" "new" {
  vpc_id     = data.aws_vpc.existing.id
  cidr_block = "10.0.100.0/24"
}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}
```

## ライフサイクル

リソースの作成・更新・削除の挙動を制御する設定。

```hcl
resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"

  lifecycle {
    # 新しいリソースを作成してから古いリソースを削除する
    # ダウンタイムなしの更新に使う
    create_before_destroy = true

    # 誤って削除されないようにする
    # destroy時にエラーになる
    prevent_destroy = true

    # 特定の属性の変更を無視する
    # 外部から変更されるタグなどに使う
    ignore_changes = [
      tags,
      user_data,
    ]
  }
}
```

| 設定                    | 用途                         |
| ----------------------- | ---------------------------- |
| `create_before_destroy` | ダウンタイムなしの更新       |
| `prevent_destroy`       | 重要なリソースの削除防止     |
| `ignore_changes`        | 外部からの変更を無視         |
| `replace_triggered_by`  | 特定のリソース変更時に再作成 |

## Terraformのベストプラクティス

### ディレクトリ構成

```
terraform/
  environments/
    production/
      main.tf
      variables.tf
      terraform.tfvars
      backend.tf
    staging/
      main.tf
      variables.tf
      terraform.tfvars
      backend.tf
  modules/
    vpc/
    ec2/
    rds/
    s3/
```

### 命名規則

| 対象       | 規則                     | 例                                      |
| ---------- | ------------------------ | --------------------------------------- |
| リソース名 | スネークケース           | `aws_instance.web_server`               |
| 変数名     | スネークケース           | `instance_type`                         |
| ファイル名 | 役割がわかる名前         | `main.tf`, `variables.tf`, `outputs.tf` |
| タグ       | プロジェクトと環境を含む | `Name = "myapp-prod-web"`               |

### ステート管理のルール

- ステートファイルをGitにコミットしてはいけない（機密情報が含まれるため）
- リモートバックエンドを必ず使う
- ステートのロック機能を有効にする
- 環境ごとにステートを分離する

### .gitignoreの設定

```
# .gitignore
*.tfstate
*.tfstate.*
.terraform/
*.tfvars    # 機密情報を含む可能性があるため
!example.tfvars  # サンプルは含める
```

## 実践例: VPC + EC2 + RDS構成

完全なコードで、Webアプリケーション向けのインフラを構築する。

### ファイル構成

```
production/
  main.tf          # メインの設定
  variables.tf     # 変数定義
  outputs.tf       # 出力値
  terraform.tfvars # 変数の値
  backend.tf       # バックエンド設定
```

### main.tf

```hcl
terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# --- VPC ---
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "${var.project}-vpc" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project}-igw" }
}

# パブリックサブネット（2つのAZ）
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "${var.project}-public-${count.index}" }
}

# プライベートサブネット（2つのAZ）
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]
  tags = { Name = "${var.project}-private-${count.index}" }
}

# ルートテーブル
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "${var.project}-public-rt" }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# --- セキュリティグループ ---
resource "aws_security_group" "web" {
  name        = "${var.project}-web-sg"
  description = "Web server security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project}-web-sg" }
}

resource "aws_security_group" "db" {
  name        = "${var.project}-db-sg"
  description = "Database security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }

  tags = { Name = "${var.project}-db-sg" }
}

# --- EC2 ---
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_instance" "web" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.web.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    amazon-linux-extras install nginx1 -y
    systemctl start nginx
    systemctl enable nginx
  EOF

  tags = { Name = "${var.project}-web" }
}

# --- RDS ---
resource "aws_db_subnet_group" "main" {
  name       = "${var.project}-db-subnet"
  subnet_ids = aws_subnet.private[*].id
  tags       = { Name = "${var.project}-db-subnet" }
}

resource "aws_db_instance" "main" {
  identifier     = "${var.project}-db"
  engine         = "mysql"
  engine_version = "8.0"
  instance_class = var.db_instance_class

  allocated_storage     = 20
  max_allocated_storage = 100

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]

  backup_retention_period = 7
  multi_az                = var.environment == "production" ? true : false
  skip_final_snapshot     = var.environment != "production"

  tags = { Name = "${var.project}-db" }
}
```

### variables.tf

```hcl
variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "project" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名"
  type        = string
}

variable "vpc_cidr" {
  description = "VPCのCIDR"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "パブリックサブネットのCIDR"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "プライベートサブネットのCIDR"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "availability_zones" {
  description = "使用するAZ"
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c"]
}

variable "instance_type" {
  description = "EC2インスタンスタイプ"
  type        = string
  default     = "t3.micro"
}

variable "db_instance_class" {
  description = "RDSインスタンスクラス"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "データベース名"
  type        = string
}

variable "db_username" {
  description = "データベースユーザー名"
  type        = string
}

variable "db_password" {
  description = "データベースパスワード"
  type        = string
  sensitive   = true
}
```

### outputs.tf

```hcl
output "vpc_id" {
  description = "VPCのID"
  value       = aws_vpc.main.id
}

output "web_server_public_ip" {
  description = "WebサーバーのパブリックIP"
  value       = aws_instance.web.public_ip
}

output "rds_endpoint" {
  description = "RDSのエンドポイント"
  value       = aws_db_instance.main.endpoint
}
```

### terraform.tfvars

```hcl
project           = "myapp"
environment       = "production"
instance_type     = "t3.small"
db_instance_class = "db.t3.small"
db_name           = "myapp"
db_username       = "admin"
# db_password は環境変数 TF_VAR_db_password で設定する
```

## 参考リンク

- [Terraform公式ドキュメント](https://developer.hashicorp.com/terraform/docs) - Terraformの公式リファレンス
- [Terraform入門チュートリアル](https://developer.hashicorp.com/terraform/tutorials) - HashiCorp公式のハンズオンチュートリアル
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) - AWSリソースの全設定リファレンス
- [Terraform Registry（モジュール）](https://registry.terraform.io/) - 公開モジュールの検索・利用
- [Terraform ベストプラクティス](https://developer.hashicorp.com/terraform/cloud-docs/recommended-practices) - 本番運用のための推奨パターン
- [Terraform Language Documentation](https://developer.hashicorp.com/terraform/language) - HCL構文の詳細リファレンス
- [tfenv - Terraformバージョン管理](https://github.com/tfutils/tfenv) - Terraformのバージョン切り替えツール
