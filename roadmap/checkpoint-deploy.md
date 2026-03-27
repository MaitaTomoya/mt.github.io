---
title: 'チェックポイント: デプロイ/CI/CD/監視'
order: 32
section: 'DevOps/インフラ'
---

# チェックポイント: デプロイ/CI/CD/監視

このチェックポイントでは、フルスタックアプリケーションをAWSにデプロイし、CI/CDパイプラインと監視を構築します。Terraform、Ansible、GitHub Actions、CloudWatchを使って、本番環境に近いインフラを構築します。

---

## 要件リスト

- [ ] Terraformでインフラをコードとして定義する
- [ ] VPC、サブネット、セキュリティグループを構築する
- [ ] EC2、RDS、S3を作成する
- [ ] Ansibleでサーバー設定を自動化する
- [ ] GitHub Actionsでテストとデプロイを自動化する
- [ ] CloudWatchで監視アラームとダッシュボードを設定する
- [ ] Route 53とCloudFrontでドメインとSSLを設定する

### 進め方のガイド

この記事は内容が多いため、以下の順序で段階的に進めることを推奨します。

1. **まずTerraformの基礎**（ステップ1）: VPCとEC2だけを作成して動作確認
2. **RDSとS3を追加**（ステップ1の続き）: データベースとストレージを構築
3. **Ansibleでサーバー設定**（ステップ2）: アプリケーションのデプロイ自動化
4. **CI/CDパイプライン**（ステップ3）: GitHub Actionsで自動テスト/デプロイ
5. **監視とドメイン設定**（ステップ4-6）: CloudWatch、Route 53、SSL/TLS

---

## 全体構成図

```
                          +-------------------+
                          |  Route 53         |
                          |  (DNS)            |
                          +--------+----------+
                                   |
                          +--------v----------+
                          |  CloudFront       |
                          |  + ACM (SSL/TLS)  |
                          +--------+----------+
                                   |
                     +-------------+-------------+
                     |                           |
            +--------v----------+       +--------v----------+
            |  S3               |       |  ALB              |
            |  (フロントエンド)   |       |  (ロードバランサー)  |
            +-------------------+       +--------+----------+
                                                 |
                                        +--------v----------+
                                        |  EC2              |
                                        |  (バックエンド)     |
                                        +--------+----------+
                                                 |
                                   +-------------+-------------+
                                   |                           |
                          +--------v----------+       +--------v----------+
                          |  RDS              |       |  ElastiCache      |
                          |  (PostgreSQL)     |       |  (Redis)          |
                          +-------------------+       +-------------------+

              +-------------------+
              |  CloudWatch       |
              |  (監視/アラート)    |
              +-------------------+
```

| サービス    | 役割                                     |
| ----------- | ---------------------------------------- |
| Route 53    | ドメイン名のDNS管理                      |
| CloudFront  | CDN（コンテンツ配信）+ SSL/TLS終端       |
| ACM         | SSL/TLS証明書の管理                      |
| S3          | フロントエンドの静的ファイルホスティング |
| ALB         | バックエンドへのトラフィック分散         |
| EC2         | バックエンドアプリケーションの実行       |
| RDS         | PostgreSQLデータベース                   |
| ElastiCache | Redisキャッシュ                          |
| CloudWatch  | ログ収集、メトリクス監視、アラート       |

---

## ステップ1: Terraformでインフラを構築する

**Terraformとは**: インフラをコード（HCL言語）で定義し、バージョン管理できるツールです。手動でAWSコンソールを操作する代わりに、コードでインフラの状態を宣言的に記述します。

### プロジェクト構成

```
infrastructure/
├── main.tf           # プロバイダー設定
├── variables.tf      # 変数定義
├── outputs.tf        # 出力定義
├── vpc.tf            # VPCとネットワーク
├── ec2.tf            # EC2インスタンス
├── rds.tf            # RDSデータベース
├── s3.tf             # S3バケット
├── cloudfront.tf     # CloudFront設定
├── route53.tf        # DNS設定
├── cloudwatch.tf     # 監視設定
├── security_groups.tf # セキュリティグループ
└── terraform.tfvars  # 変数の値（Git管理外）
```

### プロバイダー設定

`main.tf`

```hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # tfstateをS3で管理する（チーム開発では必須）
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "fullstack-app/terraform.tfstate"
    region = "ap-northeast-1"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "fullstack-app"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
```

### 変数定義

`variables.tf`

```hcl
variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "environment" {
  description = "環境名（production, staging）"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "アプリケーション名"
  type        = string
  default     = "fullstack-app"
}

variable "domain_name" {
  description = "ドメイン名"
  type        = string
}

variable "db_username" {
  description = "データベースのユーザー名"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "データベースのパスワード"
  type        = string
  sensitive   = true
}
```

### VPCとネットワーク

`vpc.tf`

```hcl
# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.app_name}-vpc"
  }
}

# パブリックサブネット（ALB用）
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.app_name}-public-1"
  }
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}c"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.app_name}-public-2"
  }
}

# プライベートサブネット（EC2, RDS用）
resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "${var.app_name}-private-1"
  }
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "${var.aws_region}c"

  tags = {
    Name = "${var.app_name}-private-2"
  }
}

# インターネットゲートウェイ
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.app_name}-igw"
  }
}

# NATゲートウェイ（プライベートサブネットからインターネットへのアクセス用）
resource "aws_eip" "nat" {
  domain = "vpc"
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_1.id

  tags = {
    Name = "${var.app_name}-nat"
  }
}

# ルートテーブル（パブリック）
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.app_name}-public-rt"
  }
}

resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

# ルートテーブル（プライベート）
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name = "${var.app_name}-private-rt"
  }
}

resource "aws_route_table_association" "private_1" {
  subnet_id      = aws_subnet.private_1.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_2" {
  subnet_id      = aws_subnet.private_2.id
  route_table_id = aws_route_table.private.id
}
```

**VPCの解説**: VPC（Virtual Private Cloud）はAWS上に作成する仮想ネットワークです。パブリックサブネット（インターネットからアクセス可能）とプライベートサブネット（内部通信のみ）を分けることで、データベースなどの重要なリソースを外部から直接アクセスできないようにします。

### セキュリティグループ

`security_groups.tf`

```hcl
# ALB用セキュリティグループ
resource "aws_security_group" "alb" {
  name   = "${var.app_name}-alb-sg"
  vpc_id = aws_vpc.main.id

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

  tags = {
    Name = "${var.app_name}-alb-sg"
  }
}

# EC2用セキュリティグループ
resource "aws_security_group" "ec2" {
  name   = "${var.app_name}-ec2-sg"
  vpc_id = aws_vpc.main.id

  # ALBからのアクセスのみ許可
  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # SSH（デバッグ用）
  # 重要: 本番環境では "0.0.0.0/0" を自分のIPアドレスに変更すること
  # 全世界からSSH接続を許可するのはセキュリティ上非常に危険です
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # 本番では "xxx.xxx.xxx.xxx/32" に変更
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-ec2-sg"
  }
}

# RDS用セキュリティグループ
resource "aws_security_group" "rds" {
  name   = "${var.app_name}-rds-sg"
  vpc_id = aws_vpc.main.id

  # EC2からのアクセスのみ許可
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }

  tags = {
    Name = "${var.app_name}-rds-sg"
  }
}
```

### EC2インスタンス

`ec2.tf`

```hcl
# 最新のAmazon Linux 2023 AMIを取得
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.small"
  subnet_id              = aws_subnet.private_1.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = "your-key-pair"

  user_data = <<-EOF
    #!/bin/bash
    dnf update -y
    dnf install -y docker
    systemctl start docker
    systemctl enable docker
    usermod -a -G docker ec2-user

    # CloudWatch Agentのインストール
    dnf install -y amazon-cloudwatch-agent
  EOF

  tags = {
    Name = "${var.app_name}-server"
  }
}
```

### RDS（PostgreSQL）

`rds.tf`

```hcl
resource "aws_db_subnet_group" "main" {
  name       = "${var.app_name}-db-subnet"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

resource "aws_db_instance" "main" {
  identifier     = "${var.app_name}-db"
  engine         = "postgres"
  engine_version = "16.3"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"

  db_name  = "fullstack_app"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # バックアップ設定
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  # 削除保護
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "${var.app_name}-final-snapshot"

  tags = {
    Name = "${var.app_name}-db"
  }
}
```

### S3（フロントエンド）

`s3.tf`

```hcl
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.app_name}-frontend"
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

### Terraformの実行

```bash
# 初期化
terraform init

# 実行計画を確認（実際には何も変更しない）
terraform plan

# インフラを構築
terraform apply

# インフラを削除（注意: 全てのリソースが削除される）
terraform destroy
```

---

## ステップ2: Ansibleでサーバー設定

**Ansibleとは**: サーバーの設定を自動化するツールです。YAMLファイル（Playbook）にサーバーの「あるべき状態」を記述し、自動的にその状態にします。

### ディレクトリ構成

```
ansible/
├── inventory.yml     # 対象サーバーの一覧
├── playbook.yml      # メインのPlaybook
└── roles/
    └── app/
        ├── tasks/
        │   └── main.yml
        ├── templates/
        │   └── docker-compose.yml.j2
        └── handlers/
            └── main.yml
```

### インベントリファイル

`inventory.yml`

```yaml
all:
  hosts:
    app_server:
      ansible_host: <EC2のIPアドレス>
      ansible_user: ec2-user
      ansible_ssh_private_key_file: ~/.ssh/your-key.pem
```

### Playbook

`playbook.yml`

```yaml
---
- name: アプリケーションサーバーの設定
  hosts: app_server
  become: true

  vars:
    app_name: fullstack-app
    app_dir: /opt/app

  tasks:
    - name: Docker Composeプラグインをインストール
      dnf:
        name: docker-compose-plugin
        state: present

    - name: アプリケーションディレクトリを作成
      file:
        path: '{{ app_dir }}'
        state: directory
        owner: ec2-user
        group: ec2-user
        mode: '0755'

    - name: docker-compose.ymlを配置
      template:
        src: docker-compose.yml.j2
        dest: '{{ app_dir }}/docker-compose.yml'
        owner: ec2-user
        group: ec2-user
      notify: restart app

    - name: 環境変数ファイルを配置
      template:
        src: env.j2
        dest: '{{ app_dir }}/.env'
        owner: ec2-user
        group: ec2-user
        mode: '0600'
      notify: restart app

  handlers:
    - name: restart app
      community.docker.docker_compose_v2:
        project_src: '{{ app_dir }}'
        state: present
        pull: always
```

### 実行

```bash
# Playbookを実行
ansible-playbook -i inventory.yml playbook.yml

# ドライラン（実際には変更しない）
ansible-playbook -i inventory.yml playbook.yml --check
```

---

## ステップ3: GitHub Actionsで自動テスト+デプロイ

`.github/workflows/deploy.yml`

```yaml
name: テストとデプロイ

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: ap-northeast-1

jobs:
  # テストジョブ
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U testuser"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Node.jsをセットアップ
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: バックエンドの依存関係をインストール
        working-directory: backend
        run: npm ci

      - name: バックエンドのテストを実行
        working-directory: backend
        run: npm test
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/test_db
          JWT_SECRET: test-secret
          NODE_ENV: test

      - name: フロントエンドの依存関係をインストール
        working-directory: frontend
        run: npm ci

      - name: フロントエンドのビルドテスト
        working-directory: frontend
        run: npm run build

  # デプロイジョブ（mainブランチへのpush時のみ）
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v4

      - name: AWS認証情報を設定
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      # フロントエンドのデプロイ
      - name: フロントエンドをビルド
        working-directory: frontend
        run: |
          npm ci
          npm run build

      - name: S3にアップロード
        run: |
          aws s3 sync frontend/dist/ s3://${{ secrets.S3_BUCKET_NAME }}/ \
            --delete \
            --cache-control "public, max-age=31536000"

      - name: CloudFrontのキャッシュを無効化
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"

      # バックエンドのデプロイ
      - name: Dockerイメージをビルドしてプッシュ
        working-directory: backend
        run: |
          aws ecr get-login-password --region ${{ env.AWS_REGION }} | \
            docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
          docker build -t ${{ secrets.ECR_REGISTRY }}/fullstack-app:${{ github.sha }} .
          docker push ${{ secrets.ECR_REGISTRY }}/fullstack-app:${{ github.sha }}

      - name: EC2にデプロイ
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /opt/app
            docker compose pull
            docker compose up -d --no-deps backend
            docker image prune -f
```

**GitHub Actionsの解説**: GitHub Actionsはリポジトリに組み込まれたCI/CDサービスです。`on`セクションでトリガーを定義し、`jobs`セクションで実行する処理を記述します。`secrets`にはAWSの認証情報などを安全に保存できます。

### GitHub Secretsに設定する値

GitHubリポジトリの「Settings」>「Secrets and variables」>「Actions」から以下を設定します。

| Secret名                   | 値                                   |
| -------------------------- | ------------------------------------ |
| AWS_ACCESS_KEY_ID          | AWSのアクセスキーID                  |
| AWS_SECRET_ACCESS_KEY      | AWSのシークレットアクセスキー        |
| S3_BUCKET_NAME             | フロントエンド用S3バケット名         |
| CLOUDFRONT_DISTRIBUTION_ID | CloudFrontのディストリビューションID |
| ECR_REGISTRY               | ECRのレジストリURL                   |
| EC2_HOST                   | EC2のIPアドレス                      |
| EC2_SSH_KEY                | EC2への接続用SSH秘密鍵               |

---

## ステップ4: CloudWatchでの監視設定

`cloudwatch.tf`

```hcl
# EC2のCPU使用率アラーム
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "${var.app_name}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "EC2のCPU使用率が80%を超えています"

  dimensions = {
    InstanceId = aws_instance.app.id
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}

# RDSの接続数アラーム
resource "aws_cloudwatch_metric_alarm" "db_connections" {
  alarm_name          = "${var.app_name}-db-connections-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 50
  alarm_description   = "RDSの接続数が50を超えています"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.identifier
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

# RDSの空きストレージ容量アラーム
resource "aws_cloudwatch_metric_alarm" "db_storage_low" {
  alarm_name          = "${var.app_name}-db-storage-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 5368709120  # 5GB
  alarm_description   = "RDSの空き容量が5GB未満です"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.identifier
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

# SNSトピック（アラート通知先）
resource "aws_sns_topic" "alerts" {
  name = "${var.app_name}-alerts"
}

# メール通知のサブスクリプション
resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = "your-email@example.com"
}

# CloudWatchダッシュボード
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.app_name}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "InstanceId", aws_instance.app.id]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "EC2 CPU使用率"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", aws_db_instance.main.identifier]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS接続数"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/RDS", "FreeStorageSpace", "DBInstanceIdentifier", aws_db_instance.main.identifier]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS空き容量"
        }
      }
    ]
  })
}
```

---

## ステップ5: Route 53でのドメイン設定

`route53.tf`

```hcl
# ホストゾーン（既存のドメインを使用する場合はdata sourceで参照）
resource "aws_route53_zone" "main" {
  name = var.domain_name
}

# フロントエンド用（CloudFrontへのエイリアス）
resource "aws_route53_record" "frontend" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

# API用サブドメイン
resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}
```

---

## ステップ6: SSL/TLS設定（ACM + CloudFront）

`cloudfront.tf`

```hcl
# ACM証明書（us-east-1リージョンで作成する必要がある）
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

resource "aws_acm_certificate" "frontend" {
  provider          = aws.us_east_1
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# DNS検証レコード
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.frontend.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "frontend" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.frontend.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# CloudFrontディストリビューション
resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.frontend.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = [var.domain_name]

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.frontend.id}"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
    compress    = true
  }

  # SPAのルーティング対応（404を index.html にリダイレクト）
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.frontend.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_cloudfront_origin_access_identity" "frontend" {
  comment = "${var.app_name} frontend OAI"
}
```

**SSL/TLSの解説**: SSL/TLSはWebサイトの通信を暗号化する仕組みです。ACM（AWS Certificate Manager）で無料のSSL証明書を取得し、CloudFrontに設定することで、`https://`での安全な通信が可能になります。`viewer_protocol_policy: "redirect-to-https"`でHTTPアクセスを自動的にHTTPSにリダイレクトします。

---

## デプロイチェックリスト

### インフラ構築

| チェック項目                               | 確認 |
| ------------------------------------------ | ---- |
| `terraform plan`がエラーなく完了する       |      |
| VPCとサブネットが作成されている            |      |
| セキュリティグループが適切に設定されている |      |
| EC2インスタンスが起動している              |      |
| RDSが起動しアプリケーションから接続できる  |      |
| S3バケットが作成されている                 |      |

### CI/CD

| チェック項目                             | 確認 |
| ---------------------------------------- | ---- |
| GitHub Secretsが全て設定されている       |      |
| テストジョブが正常に完了する             |      |
| PRへのプッシュでテストが自動実行される   |      |
| mainへのマージでデプロイが自動実行される |      |
| フロントエンドがS3にアップロードされる   |      |
| バックエンドがEC2にデプロイされる        |      |

### 監視

| チェック項目                         | 確認 |
| ------------------------------------ | ---- |
| CloudWatchダッシュボードが表示される |      |
| CPU使用率のアラームが設定されている  |      |
| RDS接続数のアラームが設定されている  |      |
| SNSでメール通知が届く                |      |

### ドメインとSSL

| チェック項目                       | 確認 |
| ---------------------------------- | ---- |
| Route 53にドメインが設定されている |      |
| ACM証明書が発行されている          |      |
| HTTPSでアクセスできる              |      |
| HTTPがHTTPSにリダイレクトされる    |      |

---

## 費用の目安

開発/学習用の最小構成での月額費用の目安です（東京リージョン、2026年3月時点の参考値）。

| サービス          | 月額目安                     |
| ----------------- | ---------------------------- |
| EC2 (t3.small)    | 約$15                        |
| RDS (db.t3.micro) | 約$15                        |
| S3                | 約$1未満                     |
| CloudFront        | 約$1未満（低トラフィック時） |
| Route 53          | 約$0.5/ゾーン                |
| NAT Gateway       | 約$32                        |

**注意**: NAT Gatewayは比較的高額です。学習目的であれば、EC2をパブリックサブネットに配置してNAT Gatewayを省略する構成も検討してください。使わないときは`terraform destroy`でリソースを削除し、不要な課金を防ぎましょう。

---

## 発展課題（任意）

- ECSまたはEKSでコンテナオーケストレーションを導入する
- Auto Scalingで負荷に応じてEC2を増減させる
- AWS WAFでWebアプリケーションファイアウォールを追加する
- Datadogなどの外部監視ツールを導入する
- ブルー/グリーンデプロイを実装する
- Terraformのモジュール化とワークスペース分離を行う

## 参考リンク

- [Terraform公式ドキュメント](https://developer.hashicorp.com/terraform/docs) - Terraformの公式リファレンス
- [Ansible公式ドキュメント](https://docs.ansible.com/ansible/latest/index.html) - Ansibleの公式リファレンス
- [GitHub Actions公式ドキュメント](https://docs.github.com/ja/actions) - CI/CDワークフローの設定ガイド
- [AWS CloudWatch ユーザーガイド](https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) - AWS監視サービスの公式ガイド
- [AWS EC2 公式ドキュメント](https://docs.aws.amazon.com/ec2/) - EC2の公式リファレンス
- [AWS VPC 公式ドキュメント](https://docs.aws.amazon.com/vpc/) - VPCの公式リファレンス
