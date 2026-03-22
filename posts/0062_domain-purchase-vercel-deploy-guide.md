---
id: 62
title: "独自ドメインの購入からVercelデプロイまで完全ガイド：Cloudflare + Vercelで本番公開する方法"
tags: ["ドメイン", "Cloudflare", "Vercel", "DNS", "SSL", "デプロイ", "Next.js"]
create: "2026-03-22 10:23"
---

## この記事でやること

VercelとSupabaseを使ったWebサービスを本番公開するために、独自ドメインの取得からデプロイまでの設定を行いました。具体的には以下の構成です:

| 技術 | 役割 |
|------|------|
| **Next.js** | フロントエンド + APIルート |
| **Supabase** | データベース + 認証 |
| **Vercel** | ホスティング + デプロイ |
| **Cloudflare** | ドメイン購入 + DNS管理 |

この記事では「独自ドメインの取得」「DNS設定」「デプロイ」「SSL証明書」について、実際にCloudflare RegistrarとVercelを使って設定した手順をまとめました。初心者エンジニアにも分かりやすく解説します。

## 目次

- [ドメインとは？なぜ必要なのか](#ドメインとはなぜ必要なのか)
- [ドメインレジストラの選び方](#ドメインレジストラの選び方)
- [Cloudflare Registrarでドメインを購入する](#cloudflare-registrarでドメインを購入する)
- [Vercelにデプロイする](#vercelにデプロイする)
- [DNS設定：ドメインとVercelを接続する](#dns設定ドメインとvercelを接続する)
- [SSL証明書とは？なぜhttpsが必要なのか](#ssl証明書とはなぜhttpsが必要なのか)
- [Cloudflareのプロキシ設定に注意](#cloudflareのプロキシ設定に注意)
- [設定後の確認方法](#設定後の確認方法)
- [まとめ](#まとめ)
- [参考リンク](#参考リンク)

## ドメインとは？なぜ必要なのか

ドメインとは、Webサイトの「住所」のようなものです。

```
例：my-and-service.com
```

Vercelにデプロイすると、デフォルトでは `プロジェクト名.vercel.app` というURLが割り当てられます。しかし、サービスとして公開するなら独自ドメインが必要です。

### 独自ドメインが必要な理由

| 理由 | 説明 |
|------|------|
| 信頼性 | `example.vercel.app` より `example.com` の方がユーザーに信頼される |
| ブランディング | サービス名のドメインを持つことでブランドイメージが向上 |
| SEO | 独自ドメインの方がSEO評価が高い |
| メール | 独自ドメインでメールアドレスを作成できる（例：info@example.com） |

### ドメインの構成

```
my-and-service.com
     ↑          ↑
  ドメイン名    TLD（トップレベルドメイン）
```

TLDにはいくつかの種類があります:

| TLD | 特徴 | 年額目安 |
|-----|------|---------|
| `.com` | 最も一般的。商用サイト向け | $10-12 |
| `.jp` | 日本のドメイン。日本のサービスであることを示す | $40-50 |
| `.app` | アプリ・Webサービス向け。https必須 | $14 |
| `.io` | テック系サービスで人気 | $30-40 |

## ドメインレジストラの選び方

ドメインを購入するサービスを「レジストラ」と呼びます。

### 主要なレジストラの比較

| レジストラ | 特徴 | おすすめ度 |
|-----------|------|----------|
| Cloudflare Registrar | **原価販売**（マークアップなし）。最安。Whoisプライバシー無料 | 最もおすすめ |
| Namecheap | 安い。初年度の割引が大きい。Whoisプライバシー無料 | コスパが良い |
| Google Domains | Googleアカウントで管理。シンプルなUI | 手軽さ重視 |

### Whoisプライバシーとは？

ドメインを購入すると、所有者の名前・住所・メールアドレスなどが「Whois」というデータベースに公開されます。**Whoisプライバシー**を有効にすると、これらの個人情報がレジストラの情報に置き換えられ、プライバシーが守られます。

Cloudflareでは**Whoisプライバシーが無料**で含まれているため、追加費用なしで個人情報を保護できます。

### なぜCloudflare Registrarがおすすめなのか

Cloudflare Registrarは「At Cost」（原価）でドメインを販売しています。他のレジストラは初年度は安くても、2年目以降に値上がりすることが多いですが、Cloudflareは常に原価のため、**長期的に最も安い**です。

## Cloudflare Registrarでドメインを購入する

### 手順

1. [Cloudflare](https://www.cloudflare.com/)にアカウントを作成
2. ダッシュボードで「**Domain Registration**」を選択
3. 購入したいドメイン名を検索（例：`my-and-service`）
4. 希望のTLDを選択（例：`.com`）
5. 支払い情報を入力して購入

購入すると、CloudflareがそのままDNSサーバーとしても機能します。

## Vercelにデプロイする

### 前提条件

- Next.jsプロジェクトがGitHubリポジトリにあること
- Vercelアカウントがあること

### 手順

#### 1. Vercel CLIのインストール

```bash
npm install -g vercel
```

#### 2. Vercelにログイン

```bash
vercel login
```

ブラウザが開くのでVercelアカウントで認証します。

#### 3. プロジェクトをリンク

プロジェクトのディレクトリで以下を実行します:

```bash
vercel link
```

GitHubリポジトリと自動で連携されます。

#### 4. 環境変数の設定

Vercelダッシュボード（Settings > Environment Variables）で、`.env.local`に設定しているのと同じ環境変数を追加します。

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
STRIPE_SECRET_KEY=sk_live_...
RESEND_API_KEY=re_...
```

**注意**: 環境変数の値はVercelダッシュボード上で直接入力してください。コードやチャットに貼り付けないこと。

#### 5. 本番デプロイ

```bash
vercel --prod
```

これでVercelの自動生成URLでサイトが公開されます。

## DNS設定：ドメインとVercelを接続する

ドメインを購入しただけでは、そのドメインにアクセスしてもサイトは表示されません。**ドメイン名をVercelのサーバーに紐づける「DNS設定」**が必要です。

### DNSとは？

DNS（Domain Name System）は、人間が読めるドメイン名を、コンピュータが理解できるIPアドレスに変換する仕組みです。いわば「インターネットの電話帳」です。

```
ユーザーがブラウザで example.com にアクセス
  ↓
DNSに問い合わせ：「example.comのIPアドレスは？」
  ↓
DNSが回答：「76.76.21.21 です」
  ↓
ブラウザがそのIPアドレスのサーバー（Vercel）に接続
  ↓
Webサイトが表示される
```

### 設定手順

#### 1. Vercelにドメインを追加

```bash
vercel domains add example.com
```

実行すると、Vercel側が求めるDNSレコードが表示されます:

```
Set the following record on your DNS provider:
A example.com 76.76.21.21
```

#### 2. CloudflareでDNSレコードを追加

Cloudflareダッシュボードで:

1. 対象ドメインを選択
2. **DNS** > **記録** を開く
3. 「レコードを追加」をクリック
4. 以下を入力:

| 項目 | 値 |
|------|-----|
| タイプ | A |
| 名前 | `@`（ドメインそのもの） |
| IPv4アドレス | `76.76.21.21`（VercelのIP） |
| プロキシ | **OFF**（灰色の雲にする） |

5. 「保存」をクリック

### Aレコードとは？

DNSレコードにはいくつかの種類があります:

| レコードタイプ | 用途 | 例 |
|--------------|------|-----|
| **A** | ドメインをIPv4アドレスに紐づける | `example.com → 76.76.21.21` |
| **AAAA** | ドメインをIPv6アドレスに紐づける | IPv6版のAレコード |
| **CNAME** | ドメインを別のドメインに紐づける | `www.example.com → example.com` |
| **MX** | メールサーバーを指定する | メール受信用 |
| **TXT** | テキスト情報を追加する | ドメイン所有確認など |

今回は**Aレコード**で、ドメインをVercelのサーバーIPアドレスに直接紐づけています。

## SSL証明書とは？なぜhttpsが必要なのか

### httpとhttpsの違い

```
http://example.com   ← 暗号化されていない通信
https://example.com  ← 暗号化された通信（SSL/TLS）
```

`https`の「s」は **Secure**（安全）の略です。

### SSL証明書を分かりやすく解説

SSL証明書は「**このWebサイトは本物で、通信は暗号化されています**」ということを証明するデジタルな証明書です。

#### 日常に例えると

```
【httpの場合（暗号化なし）】
あなたがカフェでハガキを書いて送るようなもの。
→ 配達途中で誰でも内容を読める。書き換えもできる。

【httpsの場合（暗号化あり）】
あなたが封筒に入れて封蝋（ふうろう）を押して送るようなもの。
→ 途中で誰かが開けたら分かる。内容は読めない。
```

#### SSL証明書が必要な理由

| 理由 | 説明 |
|------|------|
| **通信の暗号化** | パスワード、クレジットカード情報などが盗み見されない |
| **なりすまし防止** | アクセスしているサイトが本物であることを証明 |
| **改ざん防止** | 通信途中でデータが書き換えられていないことを保証 |
| **SEO** | Googleはhttpsのサイトを検索順位で優遇する |
| **ブラウザ警告** | httpのサイトはブラウザに「安全ではありません」と表示される |

#### SSL/TLSの仕組み（簡略版）

```
1. ブラウザが「https://example.com」にアクセス
     ↓
2. サーバーがSSL証明書を返す
   「私はexample.comです。この証明書で確認してください」
     ↓
3. ブラウザが証明書を検証
   「認証局（CA）が発行した正規の証明書だ。信頼できる」
     ↓
4. 暗号化通信を開始
   ブラウザとサーバーだけが解読できる暗号キーを共有
     ↓
5. 暗号化された通信でデータをやり取り
   途中で誰かが見ても暗号化されているので読めない
```

#### 認証局（CA）とは？

SSL証明書を発行する信頼できる第三者機関です。ブラウザは主要な認証局のリストを持っており、そこが発行した証明書だけを信頼します。

主な認証局:
- Let's Encrypt（無料。Vercelが使用）
- DigiCert（有料。大企業向け）
- GlobalSign（有料）

### Vercelの自動SSL

Vercelでは、ドメインを設定すると**Let's Encryptの証明書を自動で取得・更新**してくれます。つまり:

- 手動でSSL証明書を購入する必要なし
- 証明書の更新も自動（通常90日ごと）
- 設定不要でhttpsが有効になる

これがVercelの大きなメリットの一つです。

## Cloudflareのプロキシ設定に注意

### プロキシとは？

Cloudflareには「プロキシ」機能があり、ユーザーとサーバーの間にCloudflareが入って通信を中継できます。

```
【プロキシOFF（灰色の雲）】
ユーザー → Vercel（直接接続）

【プロキシON（オレンジの雲）】
ユーザー → Cloudflare → Vercel（Cloudflareが中継）
```

### なぜプロキシをOFFにするのか

VercelとCloudflare両方がSSL証明書を発行しようとすると、**証明書が競合**してエラーになる場合があります。

| 設定 | SSL発行者 | 問題 |
|------|----------|------|
| プロキシOFF | Vercelが発行 | 問題なし |
| プロキシON | CloudflareとVercel両方が発行 | 競合する可能性がある |

Vercelを使う場合は、CloudflareのプロキシをOFFにして、Vercelに直接接続させるのがシンプルで安全です。

## 設定後の確認方法

### 1. DNS反映の確認

ターミナルで以下を実行:

```bash
dig example.com +short
```

VercelのIP（`76.76.21.21`）が表示されればDNSが反映されています。

### 2. サイトへのアクセス

ブラウザで `https://example.com` にアクセスして、サイトが表示されることを確認します。

### 3. SSL証明書の確認

ブラウザのアドレスバーの鍵アイコンをクリックすると、SSL証明書の詳細が確認できます。

### DNS反映にかかる時間

DNSの変更が世界中に反映されるまで、通常**数分〜最大48時間**かかります（TTLの設定による）。Cloudflareの場合は通常**数分以内**に反映されます。

## まとめ

| ステップ | やること | かかる時間 |
|---------|---------|-----------|
| 1 | Cloudflareでドメインを購入 | 5分 |
| 2 | Vercelにプロジェクトをデプロイ | 5分 |
| 3 | Vercelにドメインを追加 | 1分 |
| 4 | CloudflareでAレコードを追加（プロキシOFF） | 2分 |
| 5 | DNS反映を待つ | 数分 |
| 6 | httpsでアクセスできることを確認 | 1分 |

全体で**15分程度**で独自ドメインでの本番公開が完了します。

SSL証明書はVercelが自動で発行・更新してくれるため、特別な設定は不要です。Cloudflareでドメインを購入し、Aレコードを設定するだけで、安全なhttps通信が可能なWebサイトを公開できます。

## 参考リンク

- [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)
- [Vercel Custom Domains](https://vercel.com/docs/projects/domains)
- [Let's Encrypt](https://letsencrypt.org/) - Vercelが使用する無料SSL認証局
- [DNSの仕組み - Cloudflare](https://www.cloudflare.com/ja-jp/learning/dns/what-is-dns/)
- [SSL/TLSとは - Cloudflare](https://www.cloudflare.com/ja-jp/learning/ssl/what-is-ssl/)
