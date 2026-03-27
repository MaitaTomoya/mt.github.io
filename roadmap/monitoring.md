---
title: '監視ツール'
order: 31
section: 'DevOps/インフラ'
---

# 監視ツール

## なぜ監視が必要か

Webアプリケーションやインフラを運用していると、さまざまな問題が発生する。

- サーバーのCPU使用率が100%に達してレスポンスが返らなくなる
- メモリリークによりアプリケーションがクラッシュする
- ディスク容量が不足してデータベースが書き込みエラーを起こす
- ネットワーク障害でサービスにアクセスできなくなる
- デプロイ後にエラー率が急増する

これらの問題は、監視していなければユーザーからの報告で初めて気づくことになる。ユーザーが気づくということは、既にサービスに影響が出ているということ。

監視の目的をまとめると以下の通り。

| 目的                     | 説明                               | 例                               |
| ------------------------ | ---------------------------------- | -------------------------------- |
| 障害の早期検知           | 問題が大きくなる前に検知する       | CPU使用率が80%を超えたらアラート |
| パフォーマンス改善       | ボトルネックを特定し改善する       | レスポンスタイムが遅いAPIを特定  |
| SLAの維持                | サービスレベル契約を守る           | 可用性99.9%を維持                |
| キャパシティプランニング | 将来の需要を予測する               | トラフィック増加に備えてスケール |
| セキュリティ             | 不正アクセスや異常な挙動を検知する | ログイン失敗の急増を検知         |

身近な例で言えば、監視は「健康診断」のようなもの。体（サーバー）に問題がないか定期的にチェックし、異常があれば早めに対処する。病気（障害）になってから気づくのではなく、予兆の段階で発見することが重要。

## 監視の4つの柱

現代の監視は以下の4つの柱で構成される。

### 1. メトリクス（Metrics）

数値データの時系列記録。CPU使用率、メモリ使用量、リクエスト数など。

```
例: CPU使用率の時系列データ
時刻        CPU使用率
10:00       25%
10:01       28%
10:02       45%
10:03       82%  ← 異常な上昇を検知
10:04       95%  ← アラート発報
```

### 2. ログ（Logs）

アプリケーションやシステムが出力するテキスト形式の記録。

```
[2024-01-15 10:03:15] ERROR: Database connection timeout after 30s
[2024-01-15 10:03:15] ERROR: Failed to process request /api/users - 500 Internal Server Error
[2024-01-15 10:03:16] WARN: Connection pool exhausted, waiting for available connection
```

### 3. トレース（Traces）

1つのリクエストがシステム内でどのように処理されたかの追跡記録。マイクロサービス環境で特に重要。

```
リクエスト: GET /api/orders/123
  ├── API Gateway (2ms)
  ├── 認証サービス (15ms)
  ├── 注文サービス (45ms)
  │   ├── DBクエリ (30ms)  ← ここがボトルネック
  │   └── キャッシュ確認 (2ms)
  └── レスポンス生成 (3ms)
合計: 67ms
```

### 4. アラート（Alerts）

異常を検知したとき、担当者に通知する仕組み。

```
[Critical] web-server-01: CPU使用率が95%を超えました
発生時刻: 2024-01-15 10:04:00 JST
持続時間: 2分
対応: オンコール担当者に通知済み
```

### 4つの柱の関係

| 柱         | 答えられる問い       | データの特徴                     |
| ---------- | -------------------- | -------------------------------- |
| メトリクス | 「何が起きているか」 | 数値、集約しやすい、長期保存向き |
| ログ       | 「なぜ起きたか」     | テキスト、詳細、データ量が多い   |
| トレース   | 「どこで起きたか」   | リクエストの流れ、因果関係       |
| アラート   | 「誰に知らせるか」   | 通知、エスカレーション           |

障害対応の流れ: アラートで気づき → メトリクスで影響範囲を把握 → トレースでボトルネックを特定 → ログで原因を調査

## 可観測性（Observability）とは

可観測性（Observability、略してo11y）は、「システムの外部出力から内部の状態を理解できる度合い」を指す概念。

「監視（Monitoring）」が「既知の問題を検知する」のに対し、「可観測性」は「未知の問題も含めてシステムの状態を理解できる」という、より広い概念。

| 比較項目   | 監視（Monitoring）                | 可観測性（Observability）                |
| ---------- | --------------------------------- | ---------------------------------------- |
| 対象       | 既知の問題                        | 未知の問題も含む                         |
| アプローチ | 事前に「何を監視するか」定義      | データから「何が起きているか」探索       |
| 問い       | 「この値は正常か？」              | 「なぜこの状態になったか？」             |
| 例         | CPU使用率が閾値を超えたらアラート | 任意の条件でデータを掘り下げて原因を調査 |

可観測性を高めるには、メトリクス・ログ・トレースの3つのデータ（テレメトリデータ）を統合的に収集・分析できる仕組みが必要。

## 監視の対象

### インフラ監視

| 監視項目         | 閾値の目安                   | ツール例                 |
| ---------------- | ---------------------------- | ------------------------ |
| CPU使用率        | 80%以上で警告、95%以上で緊急 | CloudWatch, Prometheus   |
| メモリ使用率     | 85%以上で警告                | CloudWatch, Prometheus   |
| ディスク使用率   | 80%以上で警告、90%以上で緊急 | CloudWatch, Prometheus   |
| ネットワーク帯域 | 通常時の3倍以上で警告        | CloudWatch               |
| サーバー死活     | 応答なしで即座にアラート     | Ping監視, ヘルスチェック |

### アプリケーション監視

| 監視項目             | 閾値の目安                   | ツール例                 |
| -------------------- | ---------------------------- | ------------------------ |
| レスポンスタイム     | P95が1秒以上で警告           | New Relic, Datadog       |
| エラーレート         | 1%以上で警告、5%以上で緊急   | Sentry, Datadog          |
| スループット         | 通常の50%以下で警告          | Prometheus, Grafana      |
| HTTPステータスコード | 5xx系が増加したら警告        | CloudWatch, Prometheus   |
| データベースクエリ   | スロークエリが増加したら警告 | RDS Performance Insights |

### ネットワーク監視

| 監視項目          | 説明                         |
| ----------------- | ---------------------------- |
| レイテンシ        | 通信の遅延時間               |
| パケットロス      | 通信の損失率                 |
| DNS解決時間       | ドメイン名の解決にかかる時間 |
| SSL証明書有効期限 | 期限切れの30日前にアラート   |

### セキュリティ監視

| 監視項目           | 説明                         |
| ------------------ | ---------------------------- |
| 不正ログイン試行   | 短時間に多数のログイン失敗   |
| 権限昇格           | 不正なsudoアクセス           |
| 異常なトラフィック | DDoS攻撃の兆候               |
| 脆弱性             | 既知の脆弱性を持つパッケージ |

## 主要な監視ツール一覧

| ツール         | 種類               | 特徴                          | コスト        | 適したケース                            |
| -------------- | ------------------ | ----------------------------- | ------------- | --------------------------------------- |
| AWS CloudWatch | クラウドネイティブ | AWS完全統合                   | 従量課金      | AWSインフラの監視                       |
| Datadog        | SaaS               | 統合監視プラットフォーム      | 高め          | 大規模な本番環境                        |
| Grafana        | OSS                | ダッシュボード/可視化         | 無料（OSS版） | メトリクスの可視化                      |
| Prometheus     | OSS                | メトリクス収集/アラート       | 無料          | コンテナ/Kubernetes環境                 |
| New Relic      | SaaS               | APM中心の統合プラットフォーム | 無料枠あり    | アプリケーション性能監視                |
| PagerDuty      | SaaS               | インシデント管理/オンコール   | 有料          | アラート管理/エスカレーション           |
| Sentry         | SaaS/OSS           | エラー追跡                    | 無料枠あり    | フロントエンド/バックエンドのエラー監視 |
| ELK Stack      | OSS                | ログ収集/分析/可視化          | 無料（OSS版） | 大量ログの分析                          |

### 組み合わせパターン

| パターン     | 構成                                      | コスト                 | 適したケース              |
| ------------ | ----------------------------------------- | ---------------------- | ------------------------- |
| AWS中心      | CloudWatch + X-Ray + SNS                  | 低〜中                 | AWSのみの小〜中規模       |
| OSS中心      | Prometheus + Grafana + Loki               | 低（サーバー費用のみ） | コスト重視/Kubernetes環境 |
| SaaS中心     | Datadog + PagerDuty                       | 高                     | 大規模/運用負荷を下げたい |
| ハイブリッド | Prometheus + Grafana + Sentry + PagerDuty | 中                     | バランス重視              |

## AWS CloudWatch

AWS CloudWatchはAWSに組み込まれた監視サービス。AWSのリソースを使っていれば、追加設定なしで基本的なメトリクスが自動収集される。

### 主な機能

| 機能               | 説明                                       |
| ------------------ | ------------------------------------------ |
| メトリクス         | AWSリソースの数値データ（CPU、メモリ等）   |
| ログ               | アプリケーションやシステムのログ収集・検索 |
| アラーム           | メトリクスの閾値に基づくアラート           |
| ダッシュボード     | メトリクスの可視化                         |
| Events/EventBridge | AWSリソースの状態変化をトリガーに自動処理  |

### メトリクスの設定例（Terraformで設定）

```hcl
# CPU使用率のアラーム
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "high-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2              # 2回連続で閾値を超えたら
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300            # 5分間隔
  statistic           = "Average"
  threshold           = 80             # 80%以上
  alarm_description   = "CPU使用率が80%を超えました"

  dimensions = {
    InstanceId = aws_instance.web.id
  }

  alarm_actions = [aws_sns_topic.alerts.arn]  # SNSトピックに通知
  ok_actions    = [aws_sns_topic.alerts.arn]  # 回復時にも通知
}

# SNSトピック（通知先）
resource "aws_sns_topic" "alerts" {
  name = "monitoring-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = "oncall@example.com"
}
```

### CloudWatch Logsの設定

```hcl
# ロググループ
resource "aws_cloudwatch_log_group" "app" {
  name              = "/app/myapp"
  retention_in_days = 30  # 30日間保持
}

# メトリクスフィルター（ログからメトリクスを作成）
resource "aws_cloudwatch_log_metric_filter" "error_count" {
  name           = "error-count"
  pattern        = "ERROR"
  log_group_name = aws_cloudwatch_log_group.app.name

  metric_transformation {
    name      = "ErrorCount"
    namespace = "MyApp"
    value     = "1"
  }
}
```

### カスタムメトリクスの送信（Node.js）

```javascript
// AWS SDKを使ってカスタムメトリクスを送信
const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch')

const client = new CloudWatchClient({ region: 'ap-northeast-1' })

async function sendMetric(metricName, value, unit = 'Count') {
  const command = new PutMetricDataCommand({
    Namespace: 'MyApp',
    MetricData: [
      {
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date(),
        Dimensions: [
          {
            Name: 'Environment',
            Value: 'production',
          },
        ],
      },
    ],
  })

  await client.send(command)
}

// 使用例
sendMetric('ActiveUsers', 150, 'Count')
sendMetric('ResponseTime', 245, 'Milliseconds')
```

## Prometheus + Grafana

Prometheus + Grafanaは、オープンソースの監視スタックとして最も広く使われている組み合わせ。特にKubernetes環境での監視に強い。

### Prometheusの仕組み

```
[アプリケーション] ←─ スクレイプ ─── [Prometheus Server] ──→ [Grafana]
    /metrics                           ↓                    （可視化）
    エンドポイント              [時系列データベース]
                                       ↓
                               [Alertmanager] ──→ Slack/Email/PagerDuty
                                （アラート管理）
```

Prometheusの特徴的な点は「プル型」であること。監視対象のアプリケーションが `/metrics` エンドポイントでメトリクスを公開し、Prometheusが定期的にそのデータを取りに行く（スクレイプする）。

### Prometheus設定ファイル

```yaml
# prometheus.yml
global:
  scrape_interval: 15s # 15秒ごとにメトリクスを収集
  evaluation_interval: 15s # 15秒ごとにアラートルールを評価

# アラートルール
rule_files:
  - 'alert_rules.yml'

# Alertmanagerの設定
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

# スクレイプ対象の設定
scrape_configs:
  # Prometheus自身のメトリクス
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter（サーバーメトリクス）
  - job_name: 'node'
    static_configs:
      - targets:
          - 'web1:9100'
          - 'web2:9100'
          - 'db1:9100'

  # アプリケーション
  - job_name: 'myapp'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['app1:3000', 'app2:3000']
```

### PromQL基礎

PromQLはPrometheusのクエリ言語。メトリクスの検索・集計に使用する。

```promql
# 現在のCPU使用率
100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# HTTPリクエストのレート（1秒あたりのリクエスト数）
rate(http_requests_total[5m])

# HTTPエラー率
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100

# レスポンスタイムの95パーセンタイル
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# メモリ使用率
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# ディスク使用率
100 - ((node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100)
```

### PromQLの基本構文

| 構文                   | 説明                       | 例                                 |
| ---------------------- | -------------------------- | ---------------------------------- |
| メトリクス名           | メトリクスを直接指定       | `http_requests_total`              |
| ラベル                 | フィルタリング             | `{status="200"}`                   |
| `rate()`               | 増加率（カウンターに使う） | `rate(metric[5m])`                 |
| `sum()`                | 合計                       | `sum(metric)`                      |
| `avg()`                | 平均                       | `avg(metric)`                      |
| `by()`                 | グルーピング               | `sum by(instance)(metric)`         |
| `histogram_quantile()` | パーセンタイル             | `histogram_quantile(0.95, metric)` |

### アラートルール

```yaml
# alert_rules.yml
groups:
  - name: instance_alerts
    rules:
      # サーバーダウン
      - alert: InstanceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: 'インスタンス {{ $labels.instance }} がダウンしています'
          description: '{{ $labels.instance }} が1分以上応答していません。'

      # CPU使用率が高い
      - alert: HighCpuUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'CPU使用率が80%を超えています'
          description: '{{ $labels.instance }} のCPU使用率が {{ $value }}% です。'

      # メモリ使用率が高い
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'メモリ使用率が85%を超えています'

  - name: application_alerts
    rules:
      # エラー率が高い
      - alert: HighErrorRate
        expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100 > 5
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: 'HTTPエラー率が5%を超えています'

      # レスポンスタイムが遅い
      - alert: HighLatency
        expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'P95レスポンスタイムが1秒を超えています'
```

### Node.jsアプリケーションでPrometheusメトリクスを公開

```javascript
// metrics.js
const promClient = require('prom-client')

// デフォルトメトリクス（Node.jsのメモリ使用量等）を収集
promClient.collectDefaultMetrics({ prefix: 'myapp_' })

// カスタムメトリクス: HTTPリクエスト数
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'HTTPリクエストの総数',
  labelNames: ['method', 'path', 'status'],
})

// カスタムメトリクス: レスポンスタイム
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTPリクエストの処理時間（秒）',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
})

// カスタムメトリクス: アクティブな接続数
const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: '現在のアクティブな接続数',
})

module.exports = {
  httpRequestsTotal,
  httpRequestDuration,
  activeConnections,
  register: promClient.register,
}
```

```javascript
// server.js
const express = require('express')
const { httpRequestsTotal, httpRequestDuration, activeConnections, register } = require('./metrics')

const app = express()

// メトリクス計測ミドルウェア
app.use((req, res, next) => {
  activeConnections.inc()
  const end = httpRequestDuration.startTimer()

  res.on('finish', () => {
    activeConnections.dec()
    const labels = {
      method: req.method,
      path: req.route ? req.route.path : req.path,
      status: res.statusCode,
    }
    httpRequestsTotal.inc(labels)
    end(labels)
  })

  next()
})

// メトリクスエンドポイント
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})

// アプリケーションのエンドポイント
app.get('/api/users', (req, res) => {
  res.json({ users: [] })
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

## ログ管理

### ELK Stack

ELK Stack（Elastic Stack）は、ログの収集・保存・検索・可視化を行うオープンソースツール群。

```
[アプリケーション] → [Filebeat/Logstash] → [Elasticsearch] → [Kibana]
    ログ出力            ログ収集/変換          ログ保存/検索      可視化
```

| コンポーネント | 役割                       | 例え                     |
| -------------- | -------------------------- | ------------------------ |
| Elasticsearch  | ログの保存と全文検索       | 図書館の蔵書検索システム |
| Logstash       | ログの収集・変換・転送     | 郵便局の仕分け           |
| Kibana         | ログの可視化・分析         | 統計グラフを作るツール   |
| Filebeat       | 軽量なログ収集エージェント | 各家庭のポスト           |

### 構造化ログ

ログは構造化（JSON形式）にすることで、検索や分析が格段に容易になる。

```javascript
// 悪い例: 非構造化ログ
console.log('User 123 logged in from 192.168.1.100')

// 良い例: 構造化ログ（JSON）
const logger = require('pino')()

logger.info({
  event: 'user_login',
  userId: 123,
  ip: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
  timestamp: new Date().toISOString(),
})
// 出力: {"level":30,"event":"user_login","userId":123,"ip":"192.168.1.100",...}
```

### ログレベル

| レベル | 用途                         | 例                           |
| ------ | ---------------------------- | ---------------------------- |
| FATAL  | アプリケーションが動作不能   | データベース接続が完全に失敗 |
| ERROR  | エラーが発生したが動作は継続 | APIリクエストが失敗          |
| WARN   | 注意が必要な状態             | メモリ使用率が高い           |
| INFO   | 正常な動作の記録             | ユーザーがログイン           |
| DEBUG  | 開発時のデバッグ情報         | クエリの実行内容             |
| TRACE  | 最も詳細な情報               | 関数の引数と戻り値           |

本番環境ではINFO以上、開発環境ではDEBUG以上を出力するのが一般的。

### CloudWatch Logsへのログ送信（Node.js）

```javascript
const winston = require('winston')
const WinstonCloudWatch = require('winston-cloudwatch')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    // コンソール出力
    new winston.transports.Console(),
    // CloudWatch Logsに送信
    new WinstonCloudWatch({
      logGroupName: '/app/myapp',
      logStreamName: `${process.env.HOSTNAME}-${new Date().toISOString().split('T')[0]}`,
      awsRegion: 'ap-northeast-1',
      jsonMessage: true,
    }),
  ],
})

// 使用例
logger.info('Application started', { port: 3000, env: 'production' })
logger.error('Database query failed', { query: 'SELECT...', error: 'timeout' })
```

## アラート設計

### アラート設計の原則

良いアラートは「対応が必要なこと」だけを通知する。対応不要な通知が多いと、重要なアラートが埋もれてしまう（アラート疲れ）。

| 原則               | 説明                                           |
| ------------------ | ---------------------------------------------- |
| 対応可能           | アラートを受けた人が何かしらの対応ができること |
| 緊急性がある       | すぐに対応が必要なものだけアラートにする       |
| 明確               | 何が起きているか、何をすべきか明確にする       |
| 適切なルーティング | 適切なチーム/担当者に通知する                  |

### 重要度レベル

| レベル   | 基準                             | 対応時間        | 通知方法              |
| -------- | -------------------------------- | --------------- | --------------------- |
| Critical | サービスダウン、データ損失の危険 | 即時（5分以内） | 電話 + Slack + メール |
| Warning  | パフォーマンス低下、閾値超過     | 30分以内        | Slack + メール        |
| Info     | 注意が必要だが緊急ではない       | 営業時間内      | メール                |

### アラート疲れの防止

| 対策             | 説明                                   |
| ---------------- | -------------------------------------- |
| 閾値の適切な設定 | 厳しすぎる閾値は緩和する               |
| 集約             | 同じ原因のアラートをグループ化         |
| 抑制             | メンテナンス中はアラートを一時停止     |
| 自動復旧         | 自動で復旧できるものはアラートにしない |
| 定期的な見直し   | 無視されがちなアラートは閾値を見直す   |

### Alertmanagerの設定例

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'instance']
  group_wait: 30s # グループ化の待機時間
  group_interval: 5m # 同じグループのアラート間隔
  repeat_interval: 4h # 同じアラートの再通知間隔
  receiver: 'default'

  routes:
    # Criticalアラートはオンコールチームへ
    - match:
        severity: critical
      receiver: 'oncall'
      continue: true

    # Warningアラートはエンジニアリングチームへ
    - match:
        severity: warning
      receiver: 'engineering'

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#alerts-general'
        send_resolved: true

  - name: 'oncall'
    slack_configs:
      - channel: '#alerts-critical'
        send_resolved: true
    pagerduty_configs:
      - service_key: 'your-pagerduty-key'

  - name: 'engineering'
    slack_configs:
      - channel: '#alerts-engineering'
        send_resolved: true
```

## メトリクスの種類

### システムメトリクス

| メトリクス       | 説明                            | 警告閾値の目安  | 緊急閾値の目安 |
| ---------------- | ------------------------------- | --------------- | -------------- |
| CPU使用率        | プロセッサの使用率              | 80%             | 95%            |
| メモリ使用率     | RAMの使用率                     | 85%             | 95%            |
| ディスク使用率   | ストレージの使用率              | 80%             | 90%            |
| ディスクI/O      | 読み書きの速度                  | 通常の3倍       | 通常の5倍      |
| ネットワークI/O  | 送受信の帯域幅                  | 通常の3倍       | 通常の5倍      |
| ロードアベレージ | CPUの負荷（実行待ちプロセス数） | CPUコア数と同じ | CPUコア数の2倍 |

### アプリケーションメトリクス

| メトリクス       | 説明                   | 計算方法                     |
| ---------------- | ---------------------- | ---------------------------- |
| レスポンスタイム | リクエストの処理時間   | P50, P95, P99で評価          |
| エラーレート     | エラーの発生率         | 5xxレスポンス / 全リクエスト |
| スループット     | 単位時間あたりの処理量 | リクエスト数/秒（RPS）       |
| Apdex            | ユーザー満足度スコア   | (満足+許容/2) / 全体         |
| サチュレーション | リソースの飽和度       | キュー長、待機スレッド数     |

### USE/REDメソッド

メトリクスを体系的に収集するためのフレームワーク。

**USEメソッド（インフラ向け）:**

| 項目                  | 意味               | 例                    |
| --------------------- | ------------------ | --------------------- |
| Utilization（使用率） | リソースの使用割合 | CPU 75%               |
| Saturation（飽和度）  | リソースの待ち行列 | ロードアベレージ 4.0  |
| Errors（エラー）      | エラーの発生数     | ディスクI/Oエラー 3回 |

**REDメソッド（アプリケーション向け）:**

| 項目                 | 意味                         | 例         |
| -------------------- | ---------------------------- | ---------- |
| Rate（レート）       | 1秒あたりのリクエスト数      | 500 RPS    |
| Errors（エラー）     | 失敗したリクエストの割合     | 0.5%       |
| Duration（処理時間） | リクエストの処理にかかる時間 | P95: 200ms |

## APM（Application Performance Monitoring）

APMはアプリケーションのパフォーマンスを詳細に監視する仕組み。コードレベルでのボトルネック特定が可能。

### APMが提供する情報

| 機能                   | 説明                               |
| ---------------------- | ---------------------------------- |
| トランザクション追跡   | リクエストの処理フロー全体を可視化 |
| データベースクエリ分析 | 遅いクエリの特定                   |
| 外部API呼び出し        | 外部サービスへの通信時間           |
| エラー分析             | エラーの発生箇所とスタックトレース |
| リアルタイムマップ     | サービス間の依存関係を可視化       |

### 主要なAPMツール

| ツール      | 特徴                  | 対応言語                    |
| ----------- | --------------------- | --------------------------- |
| New Relic   | 包括的なAPM           | Node.js, Python, Java, Go等 |
| Datadog APM | インフラ監視と統合    | 多数                        |
| Elastic APM | ELK Stackと統合       | 多数                        |
| AWS X-Ray   | AWSサービスと統合     | Node.js, Python, Java等     |
| Jaeger      | OSSの分散トレーシング | 多数                        |

## ヘルスチェック

ヘルスチェックはアプリケーションの死活監視のためのエンドポイント。ロードバランサーやオーケストレーターがアプリケーションの状態を確認するために使用する。

### ヘルスチェックエンドポイントの設計

```javascript
const express = require('express')
const app = express()

// シンプルなヘルスチェック（Liveness）
// アプリケーションが起動しているかどうか
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// 詳細なヘルスチェック（Readiness）
// アプリケーションがリクエストを処理できる状態かどうか
app.get('/readiness', async (req, res) => {
  const checks = {}
  let isHealthy = true

  // データベース接続チェック
  try {
    await db.query('SELECT 1')
    checks.database = { status: 'ok' }
  } catch (error) {
    checks.database = { status: 'error', message: error.message }
    isHealthy = false
  }

  // Redis接続チェック
  try {
    await redis.ping()
    checks.redis = { status: 'ok' }
  } catch (error) {
    checks.redis = { status: 'error', message: error.message }
    isHealthy = false
  }

  // 外部API接続チェック
  try {
    const response = await fetch('https://api.external-service.com/health')
    checks.externalApi = { status: response.ok ? 'ok' : 'error' }
    if (!response.ok) isHealthy = false
  } catch (error) {
    checks.externalApi = { status: 'error', message: error.message }
    isHealthy = false
  }

  const statusCode = isHealthy ? 200 : 503
  res.status(statusCode).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  })
})
```

### Liveness vs Readiness

| チェック                  | 目的                           | 失敗時の対応             |
| ------------------------- | ------------------------------ | ------------------------ |
| Liveness（`/health`）     | アプリケーションが生きているか | コンテナを再起動         |
| Readiness（`/readiness`） | リクエストを受けられる状態か   | ロードバランサーから外す |

## SLI / SLO / SLA

### 概念の違い

| 概念 | 正式名称                | 意味                         | 決める人                          |
| ---- | ----------------------- | ---------------------------- | --------------------------------- |
| SLI  | Service Level Indicator | サービスの品質を測定する指標 | エンジニアリングチーム            |
| SLO  | Service Level Objective | SLIの目標値                  | エンジニアリング + ビジネスチーム |
| SLA  | Service Level Agreement | 顧客との契約上の保証値       | ビジネスチーム + 法務             |

### 具体例

```
SLI（指標）: Webサイトのレスポンスタイム（P95）
SLO（目標）: P95レスポンスタイムが500ms以下を99.9%の時間維持する
SLA（契約）: 月間の可用性99.9%を保証。違反時はクレジット返金。
```

### 可用性の計算

| 可用性                    | 月間の許容ダウンタイム | 年間の許容ダウンタイム |
| ------------------------- | ---------------------- | ---------------------- |
| 99%（ツーナイン）         | 約7.3時間              | 約3.65日               |
| 99.9%（スリーナイン）     | 約43.8分               | 約8.77時間             |
| 99.95%                    | 約21.9分               | 約4.38時間             |
| 99.99%（フォーナイン）    | 約4.38分               | 約52.6分               |
| 99.999%（ファイブナイン） | 約26.3秒               | 約5.26分               |

99.9%から99.99%への改善は、数字上は0.09%しか違わないが、許容されるダウンタイムは約10分の1になる。高い可用性を実現するにはインフラ・アーキテクチャ・運用の全てを高度に設計する必要があり、コストも大幅に増加する。

### エラーバジェット

SLOの目標値と実際の達成率の差分を「エラーバジェット」と呼ぶ。

```
SLO: 可用性 99.9%（月間）
実績: 可用性 99.95%

エラーバジェット残り:
  月間の許容ダウンタイム: 43.8分
  実際のダウンタイム: 21.9分
  残りバジェット: 21.9分

→ まだバジェットがあるので、新機能のリリースや実験が可能
→ バジェットを使い切ったら、安定化作業を優先する
```

## インシデント対応

### インシデント対応フロー

```
検知（Detection）
  ↓ アラートの受信、またはユーザー報告
対応（Response）
  ↓ 影響範囲の把握、一次対応
復旧（Recovery）
  ↓ サービスの正常化
振り返り（Postmortem）
  ↓ 原因分析、再発防止策
改善（Improvement）
  → 防止策の実装
```

### インシデントの重要度

| 重要度       | 基準                 | 対応体制         | 例               |
| ------------ | -------------------- | ---------------- | ---------------- |
| SEV1（重大） | サービス全体がダウン | 全チーム招集     | データベース障害 |
| SEV2（高）   | 主要機能が利用不可   | 関連チーム       | 決済処理の失敗   |
| SEV3（中）   | 一部機能に影響       | 担当チーム       | 検索が遅い       |
| SEV4（低）   | 軽微な影響           | 通常の営業時間内 | UIの表示崩れ     |

### ポストモーテム（振り返り）のテンプレート

```markdown
# インシデントレポート: [タイトル]

## 概要

- 発生日時: 2024-01-15 10:03 JST
- 検知日時: 2024-01-15 10:05 JST
- 復旧日時: 2024-01-15 10:45 JST
- 影響時間: 42分
- 重要度: SEV2
- 影響範囲: API全体のレスポンスが10秒以上に悪化

## タイムライン

- 10:03 - データベースのCPU使用率が急上昇
- 10:05 - CloudWatchアラートが発報
- 10:08 - オンコール担当者がSlackで確認
- 10:15 - スロークエリが原因と特定
- 10:30 - 問題のクエリを停止
- 10:45 - レスポンスタイムが正常に復帰

## 根本原因

バッチ処理のクエリがインデックスなしのフルテーブルスキャンを実行し、
データベースのCPUを占有した。

## 対策

- [完了] 問題のクエリにインデックスを追加
- [TODO] バッチ処理をリードレプリカで実行するように変更
- [TODO] データベースのスロークエリ監視を強化
```

## ダッシュボード設計のベストプラクティス

### ダッシュボードの種類

| 種類                           | 目的                             | 更新頻度     | 対象者         |
| ------------------------------ | -------------------------------- | ------------ | -------------- |
| 概要ダッシュボード             | サービス全体の健全性を一目で確認 | リアルタイム | 全チーム       |
| インフラダッシュボード         | サーバーリソースの詳細           | リアルタイム | インフラチーム |
| アプリケーションダッシュボード | アプリの性能詳細                 | リアルタイム | 開発チーム     |
| ビジネスダッシュボード         | ビジネスKPI                      | 日次/週次    | マネジメント   |

### 概要ダッシュボードに含めるべき項目

```
+-------------------------------------------+
|  サービス概要ダッシュボード                 |
+-------------------------------------------+
|                                           |
|  [リクエスト数/秒]  [エラーレート]  [P95]  |
|   1,234 RPS         0.1%          120ms   |
|                                           |
|  [レスポンスタイム推移]                    |
|  ┌─────────────────────┐                  |
|  │  ─── P50            │                  |
|  │  ─── P95            │                  |
|  │  ─── P99            │                  |
|  └─────────────────────┘                  |
|                                           |
|  [HTTPステータスコード割合]                |
|  200: 98.5% | 400: 0.8% | 500: 0.1%     |
|                                           |
|  [インフラ概要]                            |
|  CPU: 45%  Memory: 62%  Disk: 55%        |
|                                           |
+-------------------------------------------+
```

### ダッシュボード設計のルール

| ルール                 | 説明                                             |
| ---------------------- | ------------------------------------------------ |
| 最も重要な情報を上部に | 一目で状況がわかるように                         |
| 色でステータスを表現   | 緑=正常、黄=警告、赤=異常                        |
| 時間範囲を統一         | 全パネルの時間軸を合わせる                       |
| コンテキストを追加     | 閾値ラインやアノテーション（デプロイマーカー等） |
| 情報過多を避ける       | 1つのダッシュボードに詰め込みすぎない            |

## 実践例: Node.jsアプリにPrometheus + Grafanaで監視を導入

Docker Composeを使って、監視環境を構築する完全な例。

### docker-compose.yml

```yaml
services:
  # Node.jsアプリケーション
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
    networks:
      - monitoring

  # Prometheus（メトリクス収集）
  prometheus:
    image: prom/prometheus:v2.48.0
    ports:
      - '9090:9090'
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./monitoring/alert_rules.yml:/etc/prometheus/alert_rules.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=15d'
    networks:
      - monitoring

  # Grafana（可視化）
  grafana:
    image: grafana/grafana:10.2.0
    ports:
      - '3001:3000'
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    networks:
      - monitoring

  # Node Exporter（サーバーメトリクス）
  node-exporter:
    image: prom/node-exporter:v1.7.0
    ports:
      - '9100:9100'
    networks:
      - monitoring

  # Alertmanager（アラート管理）
  alertmanager:
    image: prom/alertmanager:v0.26.0
    ports:
      - '9093:9093'
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:

networks:
  monitoring:
    driver: bridge
```

### monitoring/prometheus.yml

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - 'alert_rules.yml'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'myapp'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['app:3000']
```

### monitoring/alertmanager.yml

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'slack'

receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#alerts'
        send_resolved: true
        title: '{{ if eq .Status "firing" }}[FIRING]{{ else }}[RESOLVED]{{ end }} {{ .CommonLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
```

### 起動と確認

```bash
# 起動
docker-compose up -d

# 確認
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin / admin)
# アプリケーション: http://localhost:3000
# Node Exporter: http://localhost:9100/metrics
# Alertmanager: http://localhost:9093
```

### Grafanaの初期設定

1. ブラウザで `http://localhost:3001` にアクセス
2. admin / admin でログイン
3. データソースの追加: Configuration → Data Sources → Add data source → Prometheus
   - URL: `http://prometheus:9090`
   - Save & Test
4. ダッシュボードの作成: Create → Dashboard → Add panel
5. コミュニティダッシュボードのインポート: Create → Import → 1860（Node Exporter Full）

## まとめ

監視の学習ステップ:

| 段階 | 習得すべき内容                                                |
| ---- | ------------------------------------------------------------- |
| 初級 | ヘルスチェックエンドポイントの実装、CloudWatchの基本          |
| 中級 | Prometheus + Grafanaの構築、アラート設計、ログの構造化        |
| 上級 | SLI/SLO設計、分散トレーシング、インシデント対応プロセスの構築 |

監視は「設定して終わり」ではなく、継続的に改善していくもの。アラートの閾値は定期的に見直し、ダッシュボードはチームの成長に合わせて進化させる必要がある。

## 参考リンク

- [Prometheus公式ドキュメント](https://prometheus.io/docs/introduction/overview/)
- [Grafana公式ドキュメント](https://grafana.com/docs/grafana/latest/)
- [AWS CloudWatch ユーザーガイド](https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html)
- [Google SRE Book（無料）](https://sre.google/sre-book/table-of-contents/)
- [prom-client（Node.js用Prometheusクライアント）](https://github.com/siimon/prom-client)
- [Elastic Stack公式ドキュメント](https://www.elastic.co/guide/index.html)
- [PagerDuty インシデント対応ガイド](https://response.pagerduty.com/)
