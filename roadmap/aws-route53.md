---
title: 'AWS Route53'
order: 27
section: 'DevOps/インフラ'
---

# AWS Route 53

## Route 53とは

Route 53は、AWSが提供する高可用性・高スケーラビリティのDNS（Domain Name System）Webサービス。名前の由来は、DNSが使用するポート番号が**53番**であることから。

Route 53は主に3つの機能を持つ:

| 機能             | 説明                         |
| ---------------- | ---------------------------- |
| ドメイン登録     | ドメイン名の購入・管理       |
| DNS ルーティング | ドメイン名をIPアドレスに変換 |
| ヘルスチェック   | リソースの稼働状況を監視     |

---

## DNSの仕組み

### DNSを電話帳に例える

DNSは「インターネットの電話帳」。人間はドメイン名（`www.example.com`）を覚えるが、コンピュータはIPアドレス（`93.184.216.34`）で通信する。DNSがこの変換（名前解決）を行う。

```
人間:      「www.example.com にアクセスしたい」
    │
    ▼
DNSサーバー: 「www.example.com は 93.184.216.34 です」
    │
    ▼
ブラウザ:    93.184.216.34 に接続
```

### DNS解決の詳細な流れ

ブラウザに `www.example.com` と入力したときの流れ:

```
1. ブラウザのキャッシュを確認 → なければ次へ
2. OSのキャッシュを確認 → なければ次へ
3. リゾルバ（ISPのDNSサーバー）に問い合わせ
    │
    ▼
4. ルートDNSサーバー「.comの管理者は誰？」
    │ → 「.comのネームサーバーはこれです」
    ▼
5. TLDサーバー（.com）「example.comの管理者は誰？」
    │ → 「example.comのネームサーバーはこれです」
    ▼
6. 権威DNSサーバー（Route 53）「www.example.comのIPは？」
    │ → 「93.184.216.34です（TTL: 300秒）」
    ▼
7. リゾルバがキャッシュして、ブラウザに返答
    │
    ▼
8. ブラウザが 93.184.216.34 に接続
```

### 重要な用語

| 用語                 | 説明                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------- |
| ドメイン名           | example.com のような人間が読みやすい名前                                                |
| IPアドレス           | 93.184.216.34 のようなコンピュータのアドレス                                            |
| ネームサーバー（NS） | DNSレコードを管理するサーバー                                                           |
| リゾルバ             | DNSの問い合わせを代行するサーバー                                                       |
| TTL（Time to Live）  | DNSレコードのキャッシュ有効期限（秒）                                                   |
| FQDN                 | Fully Qualified Domain Name。末尾にドットを含む完全なドメイン名（例: www.example.com.） |

---

## DNSレコードタイプ

DNSレコードは、ドメイン名とIPアドレス（やその他の情報）の対応関係を定義するもの。複数のレコードタイプがあり、それぞれ異なる役割を持つ。

### レコードタイプ一覧表

| レコードタイプ | 名前                                  | 値の例                             | 用途                                |
| -------------- | ------------------------------------- | ---------------------------------- | ----------------------------------- |
| A              | Address                               | 93.184.216.34                      | ドメイン → IPv4アドレス             |
| AAAA           | Quad A                                | 2606:2800:220:1:248:1893:25c8:1946 | ドメイン → IPv6アドレス             |
| CNAME          | Canonical Name                        | www.example.com → example.com      | ドメインの別名（エイリアス）        |
| MX             | Mail Exchange                         | 10 mail.example.com                | メールサーバーの指定                |
| TXT            | Text                                  | "v=spf1 include:..."               | テキスト情報（SPF、ドメイン検証等） |
| NS             | Name Server                           | ns-1234.awsdns-56.org              | 権威ネームサーバーの指定            |
| SOA            | Start of Authority                    | ns-1234.awsdns-56.org. ...         | ゾーンの管理情報                    |
| ALIAS          | Alias（AWS独自）                      | d123456.cloudfront.net             | AWSリソースへのルーティング         |
| SRV            | Service                               | 10 5 5269 xmpp.example.com         | サービスの場所情報                  |
| CAA            | Certification Authority Authorization | 0 issue "letsencrypt.org"          | SSL証明書の発行元制限               |

### 各レコードの詳しい解説

**Aレコード（最も基本的）:**

ドメイン名をIPv4アドレスに変換する。最もよく使うレコード。

```
example.com    A    93.184.216.34
www.example.com A    93.184.216.34
api.example.com A    54.250.100.200
```

**CNAMEレコード:**

ドメインを別のドメインにマッピングする。「このドメインに聞いたら、あっちのドメインを見てください」という転送設定。

```
www.example.com    CNAME    example.com
blog.example.com   CNAME    example.github.io
```

CNAMEの制約:

- Zone Apex（example.com自体）にはCNAMEを設定できない
- CNAMEを設定すると、同じ名前のAレコードやMXレコードは設定できない

**MXレコード:**

メールの送信先サーバーを指定する。優先度の数値が小さいほど優先される。

```
example.com    MX    10 mail1.example.com
example.com    MX    20 mail2.example.com（バックアップ）
```

**TXTレコード:**

テキスト情報を格納する。主にドメインの所有権確認やメールのセキュリティ設定に使用。

```
example.com    TXT    "v=spf1 include:_spf.google.com ~all"
example.com    TXT    "google-site-verification=abcdef123456"
```

---

## ホストゾーン

ホストゾーンは、特定のドメイン（例: example.com）のDNSレコードを管理するコンテナ。

### パブリック vs プライベート

| 項目       | パブリックホストゾーン                   | プライベートホストゾーン      |
| ---------- | ---------------------------------------- | ----------------------------- |
| 用途       | インターネットからアクセスされるドメイン | VPC内部でのみ使用するドメイン |
| アクセス元 | 全世界のインターネット                   | 関連付けられたVPCのみ         |
| 料金       | $0.50/月/ゾーン                          | $0.50/月/ゾーン               |
| 例         | www.example.com                          | db.internal.example.com       |
| 使い方     | Webサイト、API                           | 内部サービス間の通信          |

### パブリックホストゾーンの作成

```
1. Route 53 コンソール → ホストゾーン → 「ホストゾーンの作成」
2. ドメイン名: example.com
3. タイプ: パブリックホストゾーン
4. 「ホストゾーンの作成」をクリック
```

作成後、自動的にNSレコードとSOAレコードが作成される。NSレコードに表示される4つのネームサーバーを、ドメインレジストラ（ドメインを購入した場所）に設定する必要がある。

### プライベートホストゾーンの使い方

VPC内のリソースを分かりやすい名前で管理する場合に使う。

```
例:
  api.internal.example.com   → 10.0.11.50（アプリサーバー）
  db.internal.example.com    → 10.0.21.100（データベース）
  cache.internal.example.com → 10.0.21.200（Redisキャッシュ）
```

プライベートホストゾーンを使えば、IPアドレスの変更があってもDNSレコードを更新するだけで済む。アプリケーションコードの変更は不要。

---

## ドメインの登録

### Route 53で直接購入

Route 53でドメインを直接購入できる。

```
1. Route 53 コンソール → ドメインの登録 → 「ドメインの登録」
2. ドメイン名を検索（例: my-awesome-site.com）
3. 利用可能なドメインを選択
4. 連絡先情報を入力
5. 確認して購入
```

主要なTLDの年間料金（参考値）:

| TLD    | 年間料金     |
| ------ | ------------ |
| .com   | $13          |
| .net   | $11          |
| .org   | $12          |
| .io    | $39          |
| .dev   | $14          |
| .jp    | $99          |
| .co.jp | 取り扱いなし |

Route 53で購入すると、ホストゾーンの設定やネームサーバーの紐付けが自動で行われるため、最も簡単。

### 外部ドメインの移管

他のレジストラ（お名前.com、ムームードメインなど）で購入したドメインをRoute 53で管理する方法:

**方法1: ネームサーバーの変更（推奨）**

ドメインは外部レジストラに残したまま、DNSの管理だけRoute 53に移す。

```
1. Route 53でホストゾーンを作成
2. 表示される4つのNSレコードをコピー
3. 外部レジストラの管理画面でネームサーバーを変更
4. DNSの反映を待つ（最大48時間）
```

**方法2: ドメインの完全移管**

ドメイン自体をRoute 53に移管する。移管にはドメインのロック解除と認証コードが必要。

---

## レコードの作成手順

### コンソールでの作成

```
1. Route 53 → ホストゾーン → ドメインを選択
2. 「レコードを作成」をクリック
3. 設定:
   - レコード名: www（サブドメイン部分。空欄ならZone Apex）
   - レコードタイプ: A
   - 値: EC2のパブリックIPアドレス
   - TTL: 300（秒）
   - ルーティングポリシー: シンプルルーティング
4. 「レコードを作成」をクリック
```

### TTL（Time to Live）の設定

TTLは、DNSレコードがキャッシュされる時間。

| TTL                    | メリット               | デメリット                      |
| ---------------------- | ---------------------- | ------------------------------- |
| 短い（60秒）           | 変更が素早く反映される | DNSクエリが増加、レイテンシ増加 |
| 長い（86400秒=24時間） | DNSクエリが減少、高速  | 変更の反映に時間がかかる        |

推奨値:

- 通常のレコード: 300秒（5分）
- 変更予定がないレコード: 86400秒（24時間）
- 切り替え直前: 60秒（事前にTTLを短くしておく）

DNS切り替え時の手順:

1. 数日前にTTLを60秒に短縮
2. 古いTTL時間が経過するのを待つ
3. レコードの値を変更
4. 正常を確認したらTTLを元に戻す

---

## ルーティングポリシー

Route 53はDNSクエリに対してどのように応答するかを制御する複数のルーティングポリシーを提供する。

### ルーティングポリシー比較表

| ポリシー         | 説明                           | ユースケース               | 複雑さ |
| ---------------- | ------------------------------ | -------------------------- | ------ |
| シンプル         | 単一のリソースにルーティング   | 基本的なWebサイト          | 低     |
| 加重（Weighted） | 重み付けで分散                 | A/Bテスト、段階的移行      | 低     |
| レイテンシベース | 最も遅延の少ないリージョンへ   | グローバルアプリケーション | 中     |
| フェイルオーバー | プライマリ障害時にセカンダリへ | 災害対策、高可用性         | 中     |
| 地理的位置       | ユーザーの地域に基づく         | コンテンツのローカライズ   | 中     |
| 地理的近接性     | リソースとの地理的距離         | トラフィックバイアスの調整 | 高     |
| マルチバリュー   | 複数の値をランダムに返す       | 簡易ロードバランシング     | 低     |

### シンプルルーティング

最も基本的なルーティング。1つのドメインに1つ（または複数）のIPアドレスを設定する。

```
www.example.com → 54.250.100.200
```

複数のIPを設定した場合、ランダムに返される（クライアント側でどちらを使うか決める）。

### 加重ルーティング（Weighted）

トラフィックを指定した割合で分散する。A/Bテストや新バージョンへの段階的な移行に便利。

```
www.example.com:
  → 54.250.100.200（旧バージョン） 重み: 90（90%のトラフィック）
  → 54.250.100.201（新バージョン） 重み: 10（10%のトラフィック）
```

新バージョンに問題がなければ、徐々に重みを増やしていく。

### レイテンシベースルーティング

複数のリージョンにリソースがある場合、ユーザーに最も近い（レイテンシが低い）リージョンにルーティングする。

```
日本のユーザー → 東京リージョン（ap-northeast-1）のEC2
アメリカのユーザー → バージニアリージョン（us-east-1）のEC2
ヨーロッパのユーザー → アイルランドリージョン（eu-west-1）のEC2
```

### フェイルオーバールーティング

プライマリリソースが障害の場合に、自動的にセカンダリリソースにルーティングする。ヘルスチェックと組み合わせて使用する。

```
通常時:
  www.example.com → プライマリ（EC2: 54.250.100.200）

プライマリ障害時:
  www.example.com → セカンダリ（S3: 静的な「メンテナンス中」ページ）
```

### マルチバリュールーティング

複数のリソースを返し、ヘルスチェックで正常なものだけを返す。シンプルルーティングとの違いは、ヘルスチェックと連携できる点。

```
www.example.com:
  → 54.250.100.200（正常 → 返す）
  → 54.250.100.201（障害 → 返さない）
  → 54.250.100.202（正常 → 返す）
```

---

## ヘルスチェック

ヘルスチェックは、Route 53がリソースの稼働状況を定期的に監視する機能。異常を検知するとDNSの応答から除外できる。

### ヘルスチェックの種類

| 種類               | 監視対象             | 説明                             |
| ------------------ | -------------------- | -------------------------------- |
| エンドポイント     | URL / IPアドレス     | HTTP/HTTPS/TCPで定期的にアクセス |
| 計算済み           | 他のヘルスチェック   | 複数のヘルスチェックの結果を集約 |
| CloudWatchアラーム | CloudWatchメトリクス | CloudWatchアラームの状態を監視   |

### エンドポイントヘルスチェックの設定

```
1. Route 53 → ヘルスチェック → 「ヘルスチェックの作成」
2. 設定:
   - 名前: my-web-server-health
   - 監視対象: エンドポイント
   - プロトコル: HTTPS
   - IPアドレス: 54.250.100.200（またはドメイン名）
   - ポート: 443
   - パス: /health
   - リクエスト間隔: 30秒（標準）または10秒（高速）
   - 失敗閾値: 3（3回連続失敗で異常判定）
3. 「ヘルスチェックの作成」をクリック
```

### ヘルスチェック用エンドポイントの実装例

```javascript
// Express.js のヘルスチェックエンドポイント
app.get('/health', async (req, res) => {
  try {
    // データベース接続の確認
    await db.query('SELECT 1')

    // Redis接続の確認
    await redis.ping()

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    })
  }
})
```

Route 53のヘルスチェックは、レスポンスのステータスコードが2xxまたは3xxであれば正常と判定する。また、レスポンスボディの最初の5,120バイトに特定の文字列が含まれるかを確認する設定も可能。

### ヘルスチェックの料金

| 種類                      | 料金（月額） |
| ------------------------- | ------------ |
| AWSエンドポイント（基本） | $0.50        |
| 非AWSエンドポイント       | $0.75        |
| HTTPS                     | +$1.00       |
| 文字列マッチング          | +$1.00       |
| 高速チェック（10秒間隔）  | +$1.00       |

---

## ALIASレコード

ALIASレコードは、Route 53独自のレコードタイプ。CNAMEと似ているが、重要な違いがある。

### CNAMEとALIASの比較

| 項目                           | CNAME            | ALIAS                   |
| ------------------------------ | ---------------- | ----------------------- |
| Zone Apex（example.com）で使用 | 不可             | 可能                    |
| 他レコードとの共存             | 不可             | 可能                    |
| DNSクエリ料金                  | 通常料金         | 無料（AWSリソース宛て） |
| 対象                           | 任意のドメイン   | AWSリソースのみ         |
| DNS応答                        | CNAME → Aの2段階 | 直接IPアドレスを返す    |

### ALIASレコードが使えるAWSリソース

- CloudFrontディストリビューション
- Elastic Load Balancer（ALB/NLB）
- S3バケット（静的Webサイトホスティング）
- Elastic Beanstalk環境
- API Gateway
- VPCインターフェースエンドポイント
- 同じホストゾーン内の別のRoute 53レコード

### ALIASレコードの設定例

```
example.com（Zone Apex）:
  タイプ: A - ALIASレコード
  ルーティング先: CloudFrontディストリビューション
  → d123456.cloudfront.net

www.example.com:
  タイプ: A - ALIASレコード
  ルーティング先: ALB
  → my-alb-1234567890.ap-northeast-1.elb.amazonaws.com
```

Zone Apex（example.comそのもの）にCNAMEは設定できないが、ALIASなら設定可能。これはRoute 53を使う大きなメリットの1つ。

---

## CloudFrontとの連携

Route 53とCloudFront（CDN）を連携させることで、カスタムドメインでWebサイトを高速に配信できる。

### 構成

```
ユーザー
  │
  ▼
Route 53（example.com → CloudFrontディストリビューション）
  │
  ▼
CloudFront（世界中のエッジロケーションにキャッシュ）
  │
  ▼
オリジン（S3バケット or EC2 or ALB）
```

### 設定手順

**ステップ1: CloudFrontディストリビューションの作成**

```
1. CloudFrontコンソール → 「ディストリビューションを作成」
2. オリジン:
   - オリジンドメイン: S3バケット or ALB
3. ビヘイビア:
   - ビューワープロトコルポリシー: Redirect HTTP to HTTPS
4. 設定:
   - 代替ドメイン名（CNAME）: example.com, www.example.com
   - カスタムSSL証明書: ACMで発行した証明書を選択
```

**ステップ2: Route 53でALIASレコードを作成**

```
レコード名: example.com
レコードタイプ: A
エイリアス: はい
ルーティング先: CloudFrontディストリビューション
```

---

## ACM（AWS Certificate Manager）でのSSL/TLS証明書

ACMは、SSL/TLS証明書を無料で発行・管理できるサービス。CloudFrontやALBと組み合わせてHTTPS通信を実現する。

### SSL/TLS証明書とは

SSL/TLS証明書は、Webサイトが「本物」であることを証明し、通信を暗号化するためのデジタル証明書。ブラウザのアドレスバーに表示される鍵マークがこれ。

```
HTTP:  暗号化なし → 通信内容が盗聴可能
HTTPS: 暗号化あり → 通信内容が保護される
```

### ACMでの証明書発行手順

```
1. ACMコンソール（us-east-1リージョン）→ 「リクエスト」
   ※ CloudFrontで使う場合は必ずus-east-1で発行する
2. 証明書のタイプ: パブリック証明書
3. ドメイン名:
   - example.com
   - *.example.com（ワイルドカード）
4. 検証方法: DNS検証（推奨）
5. 「リクエスト」をクリック
6. DNS検証:
   - ACMが表示するCNAMEレコードをRoute 53に追加
   - Route 53で管理している場合は「Route 53でレコードを作成」ボタンで自動追加
7. 数分〜数十分で検証完了
```

### 重要なポイント

- ACMの証明書は**無料**
- 自動更新される（手動での更新不要）
- CloudFrontで使う場合は**必ず us-east-1（バージニア北部）**で発行する
- ALBやAPI Gatewayで使う場合は、ALBと同じリージョンで発行する
- EC2に直接証明書をインストールすることはできない（EC2にはLet's Encrypt等を使用）

---

## サブドメインの設定

サブドメインは、メインドメインの前に文字列を追加したドメイン。用途ごとに異なるサーバーやサービスに振り分けるために使う。

### よくあるサブドメイン構成

| サブドメイン        | 用途             | ルーティング先          |
| ------------------- | ---------------- | ----------------------- |
| www.example.com     | Webサイト本体    | CloudFront → S3         |
| api.example.com     | APIサーバー      | ALB → EC2               |
| admin.example.com   | 管理画面         | ALB → EC2（IP制限付き） |
| staging.example.com | ステージング環境 | ALB → EC2               |
| dev.example.com     | 開発環境         | ALB → EC2               |
| mail.example.com    | メールサーバー   | メールサービス          |
| cdn.example.com     | CDN              | CloudFront              |

### サブドメインのレコード設定例

```
# Aレコード: 直接IPアドレスを指定
api.example.com    A    54.250.100.200

# ALIASレコード: AWSリソースを指定
api.example.com    A（ALIAS）→ my-api-alb-xxxxx.ap-northeast-1.elb.amazonaws.com

# CNAMEレコード: 外部サービスを指定
blog.example.com   CNAME    example.github.io
```

### ワイルドカードレコード

`*.example.com` のようにワイルドカードを使うと、明示的に定義されていない全てのサブドメインを1つのレコードでカバーできる。

```
*.example.com    A    54.250.100.200

→ abc.example.com, xyz.example.com など全てが 54.250.100.200 に解決される
```

ただし、明示的に定義されたレコード（例: api.example.com）がある場合は、そちらが優先される。

---

## 実践例: S3静的サイト + CloudFront + Route 53 + ACM

React/Next.jsなどで作った静的Webサイトを、カスタムドメインでHTTPS配信する実践的な構成を解説する。

### 全体構成図

```
ユーザー（ブラウザ）
    │
    │ HTTPS（example.com）
    ▼
Route 53
    │ ALIASレコード
    ▼
CloudFront（CDN）
    │ ACM証明書でHTTPS
    │ 世界中のエッジロケーションにキャッシュ
    ▼
S3バケット（静的ファイル）
    │ index.html, CSS, JS, 画像
    └── OAC（Origin Access Control）で
        CloudFrontからのみアクセス許可
```

### 構築手順

**ステップ1: S3バケットの作成**

```bash
# バケット名はドメイン名と一致させなくてもよい（CloudFront経由の場合）
aws s3 mb s3://my-website-origin-bucket --region ap-northeast-1
```

バケットの設定:

- ブロックパブリックアクセス: 全てブロック（CloudFront OAC経由でアクセスするため）
- 静的Webサイトホスティング: 有効にしなくてもよい（CloudFrontがオリジンとして直接アクセス）

**ステップ2: ACMで証明書を発行（us-east-1）**

```
リージョン: us-east-1（必須）
ドメイン名: example.com, *.example.com
検証方法: DNS検証
→ Route 53で検証用CNAMEレコードを作成
```

**ステップ3: CloudFrontディストリビューションの作成**

```
オリジン:
  - S3バケット（OACを使用）
ビヘイビア:
  - Redirect HTTP to HTTPS
  - キャッシュポリシー: CachingOptimized
デフォルトルートオブジェクト: index.html
代替ドメイン名: example.com, www.example.com
SSL証明書: ACMで発行した証明書
カスタムエラーページ:
  - 403/404 → /index.html（SPAの場合）
```

**ステップ4: S3バケットポリシーの設定**

CloudFrontのOACからのみアクセスを許可する。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-website-origin-bucket/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/EXXXXXXXXXX"
        }
      }
    }
  ]
}
```

**ステップ5: Route 53でレコードを作成**

```
example.com:
  タイプ: A（ALIAS）
  ルーティング先: CloudFrontディストリビューション

www.example.com:
  タイプ: A（ALIAS）
  ルーティング先: CloudFrontディストリビューション
```

**ステップ6: ビルドとデプロイ**

```bash
# Reactアプリのビルド
npm run build

# S3にデプロイ
aws s3 sync ./build/ s3://my-website-origin-bucket/ --delete

# CloudFrontのキャッシュ無効化（即座に反映させたい場合）
aws cloudfront create-invalidation \
  --distribution-id EXXXXXXXXXX \
  --paths "/*"
```

### CI/CDでの自動デプロイ（GitHub Actions例）

```yaml
# .github/workflows/deploy.yml
name: Deploy to S3 + CloudFront

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1

      - name: Deploy to S3
        run: aws s3 sync ./build/ s3://my-website-origin-bucket/ --delete

      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

---

## 料金体系

### Route 53の料金

| 項目                                | 料金                              |
| ----------------------------------- | --------------------------------- |
| ホストゾーン                        | $0.50/月/ゾーン（最初の25ゾーン） |
| DNSクエリ（標準）                   | $0.40/100万クエリ                 |
| DNSクエリ（ALIAS、AWSリソース宛て） | 無料                              |
| ドメイン登録                        | TLDにより異なる（.com: $13/年）   |
| ヘルスチェック（基本）              | $0.50/月                          |

### コスト試算例

小規模Webサイト（月間）:

- ホストゾーン: 1つ → $0.50
- DNSクエリ: 100万回 → $0.40
- ヘルスチェック: 1つ → $0.50
- **合計: 約$1.40/月**

ALIASレコードを使ってAWSリソース（CloudFront、ALB等）にルーティングする場合、DNSクエリ料金は無料になるため、積極的にALIASレコードを使うことでコストを抑えられる。

---

## 実践演習

### 演習1: DNSの基本

1. Route 53でホストゾーンを作成する
2. Aレコードを作成して、EC2のIPアドレスにルーティングする
3. `dig`コマンドや`nslookup`コマンドでDNS解決を確認する

```bash
# DNS解決の確認
dig example.com
nslookup example.com

# 特定のDNSサーバーに問い合わせ
dig @8.8.8.8 example.com

# レコードタイプを指定
dig example.com MX
dig example.com TXT
dig example.com NS
```

### 演習2: フェイルオーバー構成

1. 2つのEC2インスタンスを異なるAZに起動する
2. ヘルスチェックを設定する
3. フェイルオーバールーティングポリシーを設定する
4. プライマリのEC2を停止して、フェイルオーバーが動作することを確認する

### 演習3: 完全な静的サイトの構築

1. S3バケットに静的Webサイトをアップロードする
2. CloudFrontディストリビューションを作成する
3. ACMでSSL証明書を発行する
4. Route 53でカスタムドメインを設定する
5. HTTPS対応の静的Webサイトが公開されることを確認する

---

## 参考リンク

- [AWS Route 53 公式ドキュメント](https://docs.aws.amazon.com/route53/)
- [Route 53 料金](https://aws.amazon.com/route53/pricing/)
- [DNSレコードタイプの解説](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/ResourceRecordTypes.html)
- [ルーティングポリシーの選択](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html)
- [ACM 公式ドキュメント](https://docs.aws.amazon.com/acm/)
- [CloudFront + S3 の構成ガイド](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStartedS3.html)
- [DNSの仕組みを理解するための解説（AWS）](https://aws.amazon.com/route53/what-is-dns/)
