---
title: 'Docker vs Podman, ECS vs EKS vs Fargate: コンテナオーケストレーション選定'
order: 38
category: 'devops-tools'
---

# Docker vs Podman, ECS vs EKS vs Fargate: コンテナオーケストレーション選定

## はじめに

コンテナ技術は現代のソフトウェア開発とデプロイに欠かせないものとなりました。本記事では、コンテナランタイムの選定からオーケストレーションサービスの比較まで、包括的に解説します。

### 身近な例えで理解するコンテナ

- **コンテナ** = 引越し用の段ボール箱。アプリケーションと必要なものを全て箱に詰めれば、どこに持っていっても同じように使える
- **Docker** = 段ボール箱の規格を作った会社。最も普及している
- **Podman** = 同じ規格の段ボール箱を作る別の会社。管理人（rootデーモン）がいなくても使える
- **オーケストレーション** = 大量の段ボール箱を効率的に管理する倉庫システム

オーケストレーションサービスの例え:

- **ECS** = AWSが運営する物流倉庫。AWS専用だが使いやすい
- **EKS** = 国際標準（Kubernetes）に準拠した物流倉庫。どのクラウドでも同じ操作方法
- **Fargate** = 倉庫の管理をAWSに完全委託。自分はコンテナの中身だけに集中

---

## コンテナランタイム: Docker vs Podman

### 基本比較

| 項目            | Docker                                   | Podman                          |
| :-------------- | :--------------------------------------- | :------------------------------ |
| アーキテクチャ  | クライアント-デーモン型                  | デーモンレス                    |
| ルート権限      | デフォルトでroot必要（rootless対応あり） | デフォルトでrootless            |
| Docker Compose  | docker compose                           | podman-compose / podman compose |
| イメージ形式    | OCI準拠                                  | OCI準拠                         |
| Pod対応         | なし                                     | あり（Kubernetes Pod概念）      |
| Systemd統合     | 別途設定                                 | ネイティブ対応                  |
| Windows/Mac対応 | Docker Desktop                           | Podman Desktop                  |
| ライセンス      | 商用利用に制限あり（Docker Desktop）     | 完全無料（Apache 2.0）          |
| 普及率          | 圧倒的シェア                             | 成長中                          |
| エコシステム    | 最大                                     | 発展中                          |

### Docker Desktopのライセンス問題

2021年にDocker社はDocker Desktopの利用規約を変更し、従業員250人以上または年間収益1000万ドル以上の企業は有料サブスクリプション（月$5〜）が必要となった。これを受けてPodmanへの移行を検討する企業が増えている。

### どちらを選ぶべきか

| 状況                           | 推奨                             |
| :----------------------------- | :------------------------------- |
| 個人開発/学習                  | Docker（情報が豊富）             |
| 小規模チーム                   | Docker（チームの経験を重視）     |
| 大企業（ライセンスコスト削減） | Podman                           |
| セキュリティ重視               | Podman（デーモンレス、rootless） |
| CI/CD環境                      | どちらでも（OCI互換）            |
| Kubernetes移行を見据える       | Podman（Pod概念がある）          |

---

## AWSコンテナオーケストレーション: ECS vs EKS vs Fargate

### サービスの関係性

```
+----------------------------------+
|        コンテナ実行方法          |
|                                  |
|  +----------+    +----------+    |
|  | ECS      |    | EKS      |    |
|  | (AWS独自) |    |(Kubernetes)|   |
|  +----+-----+    +----+-----+    |
|       |               |          |
|  +----v-----+    +----v-----+    |
|  |実行環境の選択              |   |
|  |                            |   |
|  | +--------+ +--------+     |   |
|  | |EC2     | |Fargate |     |   |
|  | |(自分で  | |(AWSに  |     |   |
|  | | 管理)  | | お任せ)|     |   |
|  | +--------+ +--------+     |   |
|  +----------------------------+  |
+----------------------------------+
```

- **ECS**: AWS独自のコンテナオーケストレーションサービス
- **EKS**: AWSが提供するマネージドKubernetes
- **Fargate**: ECSまたはEKSで使えるサーバーレスコンテナ実行環境

### 詳細比較

| 項目               | ECS on EC2                | ECS on Fargate | EKS on EC2           | EKS on Fargate |
| :----------------- | :------------------------ | :------------- | :------------------- | :------------- |
| 管理対象           | EC2 + コンテナ            | コンテナのみ   | EC2 + K8s + コンテナ | K8s + コンテナ |
| 学習コスト         | 低い                      | 最も低い       | 高い                 | 高い           |
| 柔軟性             | 高い                      | 中             | 最も高い             | 高い           |
| スケーリング       | Auto Scaling設定          | 自動           | HPA/VPA/CA           | 自動           |
| コスト             | 低い（EC2管理コスト含む） | 中             | 高い（K8s + EC2）    | 高い           |
| GPU対応            | 対応                      | 非対応         | 対応                 | 非対応         |
| DaemonSet          | 非対応                    | 非対応         | 対応                 | 制限あり       |
| マルチクラウド     | AWS固定                   | AWS固定        | K8s互換              | AWS固定        |
| ベンダーロックイン | 高い                      | 高い           | 低い                 | 中             |

### 料金比較

| サービス       | 基本料金             | コンピュート | 月額概算（2vCPU, 4GB x 3タスク） |
| :------------- | :------------------- | :----------- | :------------------------------- |
| ECS on EC2     | 無料                 | EC2料金      | $90〜（t3.medium x 3）           |
| ECS on Fargate | 無料                 | Fargate料金  | $108〜                           |
| EKS on EC2     | $73/月（クラスター） | EC2料金      | $163〜                           |
| EKS on Fargate | $73/月（クラスター） | Fargate料金  | $181〜                           |

※ EKSのクラスター料金（$0.10/時間=$73/月）が追加でかかることに注意。

---

## 判断フローチャート

```
[コンテナオーケストレーション選定]
    |
    v
[Kubernetesの知識がチームにある? or マルチクラウドが必要?]
    |
    +-- はい --> EKS
    |           |
    |           v
    |       [インフラ管理を最小化したい?]
    |           |
    |           +-- はい --> EKS on Fargate
    |           |
    |           +-- いいえ --> EKS on EC2
    |                          （GPU利用、DaemonSet、コスト最適化）
    |
    +-- いいえ
         |
         v
    [AWSに最適化された簡単な運用がしたい?]
         |
         +-- はい --> ECS
         |           |
         |           v
         |       [インフラ管理を最小化したい?]
         |           |
         |           +-- はい --> ECS on Fargate
         |           |           （最もシンプル）
         |           |
         |           +-- いいえ --> ECS on EC2
         |                          （コスト最適化、GPU利用）
         |
         +-- いいえ --> [小規模で設定を最小限にしたい?]
                          |
                          +-- はい --> App Runner
                          |           （コンテナオーケストレーション不要）
                          |
                          +-- いいえ --> ECS on Fargate
```

---

## ECSの実践

### タスク定義の例

ECSでは「タスク定義」でコンテナの設定を行う。

```json
{
  "family": "web-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "web",
      "image": "123456789.dkr.ecr.ap-northeast-1.amazonaws.com/web-app:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/web-app",
          "awslogs-region": "ap-northeast-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### ECSのアーキテクチャパターン

```
[ユーザー]
    |
    v
[ALB (Application Load Balancer)]
    |
    +------+------+
    |      |      |
    v      v      v
[Task1] [Task2] [Task3]   <-- ECS Service (Fargate)
    |      |      |
    v      v      v
[RDS Aurora]  [ElastiCache]
```

---

## EKSの実践

### Kubernetesの基本概念

| 概念       | 説明                           | ECSでの対応           |
| :--------- | :----------------------------- | :-------------------- |
| Pod        | コンテナのグループ（最小単位） | タスク                |
| Deployment | Podの管理（レプリカ数等）      | サービス              |
| Service    | Podへのネットワークアクセス    | ALBターゲットグループ |
| Ingress    | 外部からのHTTPルーティング     | ALB                   |
| Namespace  | リソースの論理的な分離         | クラスター分離        |
| ConfigMap  | 設定データ                     | タスク定義の環境変数  |
| Secret     | 秘匿情報                       | Secrets Manager連携   |

### Kubernetesのメリット・デメリット

**メリット:**

- マルチクラウド対応（AWS、GCP、Azure、オンプレミス）
- 巨大なエコシステム（Helm、Istio、ArgoCD等）
- 宣言的な設定管理
- 自動復旧、ローリングアップデート
- カスタムリソースによる拡張性

**デメリット:**

- 学習コストが非常に高い
- 運用が複雑
- 小規模プロジェクトにはオーバースペック
- EKSのクラスター料金が月$73かかる

---

## ユースケース別の推奨

### Webアプリケーション（小〜中規模）

**推奨: ECS on Fargate**

```
[ALB] --> [ECS/Fargate Service]
              |-- web-container (Next.js)
              +-- [RDS Aurora]
```

理由:

- 管理が簡単
- 自動スケーリング
- AWS統合が容易

### マイクロサービスアーキテクチャ（大規模）

**推奨: EKS**

```
[Ingress Controller (ALB)]
    |
    +-- [Service A] (Namespace: frontend)
    +-- [Service B] (Namespace: backend)
    +-- [Service C] (Namespace: backend)
    +-- [Service D] (Namespace: data)

[Istio Service Mesh] -- サービス間通信の管理
[ArgoCD] -- GitOpsによるデプロイ管理
```

理由:

- サービスメッシュ（Istio等）でマイクロサービス間の通信を管理
- Helmでアプリケーションのパッケージ管理
- GitOpsで宣言的なデプロイ管理

### バッチ処理

**推奨: ECS on Fargate（タスク起動）**

```
[EventBridge (スケジュール)] --> [ECS RunTask]
                                      |
                                      v
                                [Fargate Task]
                                      |
                                      v
                                [S3 / RDS]
```

理由:

- 実行時のみ課金
- スケジュール実行が簡単
- 長時間実行も可能

---

## 実際の企業での採用事例

### ECS

- **Duolingo**: 言語学習アプリのバックエンドをECS on Fargateで運用
- **Samsung**: IoTプラットフォームのマイクロサービスをECSで管理

### EKS

- **Airbnb**: 数千のマイクロサービスをKubernetes上で運用
- **Spotify**: GKE（Google版）を大規模に利用
- **LINE**: Kubernetesベースのプラットフォームで大量のサービスを管理

---

## コンテナセキュリティのベストプラクティス

| プラクティス         | 説明                                            |
| :------------------- | :---------------------------------------------- |
| 最小ベースイメージ   | Alpine LinuxやDistrolessイメージを使用          |
| rootユーザー回避     | コンテナ内でnon-rootユーザーで実行              |
| イメージスキャン     | ECRのイメージスキャン機能を有効化               |
| シークレット管理     | 環境変数にハードコードせず、Secrets Manager利用 |
| ネットワークポリシー | 不要な通信を制限                                |
| リソース制限         | CPU/メモリの上限を設定                          |
| イメージタグ         | latestタグを避け、具体的なバージョンを指定      |

---

## 移行パスの考え方

```
[開発初期] App Runner or Lambda
    ↓ コンテナが必要になった
[成長期] ECS on Fargate
    ↓ より細かい制御が必要
[成熟期 - AWS専用] ECS on EC2
[成熟期 - マルチクラウド] EKS
    ↓ 大規模マイクロサービス
[エンタープライズ] EKS + サービスメッシュ
```

---

## まとめ

### コンテナランタイム

| ツール | こんな時に使う                                           |
| :----- | :------------------------------------------------------- |
| Docker | 開発環境、学習、小規模チーム                             |
| Podman | エンタープライズ、セキュリティ重視、ライセンスコスト削減 |

### オーケストレーション

| サービス       | こんな時に使う                                             |
| :------------- | :--------------------------------------------------------- |
| ECS on Fargate | とにかくシンプルにしたい                                   |
| ECS on EC2     | コスト最適化、GPUが必要                                    |
| EKS            | Kubernetes経験あり、マルチクラウド、大規模マイクロサービス |
| App Runner     | オーケストレーション不要な小規模アプリ                     |

多くのプロジェクトでは**ECS on Fargate**から始めるのが最も合理的。Kubernetes の必要性が明確になったときにEKSに移行するアプローチを推奨する。

---

## 参考リンク

- [Amazon ECS公式ドキュメント](https://docs.aws.amazon.com/ecs/)
- [Amazon EKS公式ドキュメント](https://docs.aws.amazon.com/eks/)
- [Docker公式ドキュメント](https://docs.docker.com/)
- [Podman公式ドキュメント](https://podman.io/docs)
- [Kubernetes公式ドキュメント](https://kubernetes.io/ja/docs/home/)
