---
id: 70
title: "【緊急解説】npmパッケージ axios がサプライチェーン攻撃を受けた件を詳しくまとめる"
tags: [セキュリティ, npm, サプライチェーン攻撃, JavaScript, Node.js]
create: "2026-04-01 12:00"
---

# 【緊急解説】npmパッケージ axios がサプライチェーン攻撃を受けた件を詳しくまとめる

2026年3月31日、npmで週間約1億ダウンロードを誇るHTTPクライアントライブラリ **axios** がサプライチェーン攻撃を受けました。

メンテナのnpmアカウントが乗っ取られ、マルウェア（RAT: 遠隔操作型トロイの木馬）を含むバージョンが約2〜3時間にわたって公開されていました。

この記事では、**何が起きたのか**、**自分が影響を受けているかの確認方法**、**なぜこの攻撃が成立したのか**を、できるだけわかりやすく解説します。

## この記事のゴール

- axiosサプライチェーン攻撃の全体像を理解できる
- 自分の環境が影響を受けているか確認できる
- 影響を受けていた場合の対応手順がわかる
- 今後同様の攻撃から身を守る方法を知る

## 目次

1. [何が起きたのか（3行まとめ）](#1-何が起きたのか3行まとめ)
2. [攻撃のタイムライン](#2-攻撃のタイムライン)
3. [攻撃の仕組みを図解する](#3-攻撃の仕組みを図解する)
4. [マルウェアは何をするのか](#4-マルウェアは何をするのか)
5. [自分が影響を受けているか確認する](#5-自分が影響を受けているか確認する)
6. [影響を受けていた場合の対応](#6-影響を受けていた場合の対応)
7. [なぜこの攻撃は成立したのか](#7-なぜこの攻撃は成立したのか)
8. [今後の対策](#8-今後の対策)
9. [まとめ](#9-まとめ)

---

## 1. 何が起きたのか（3行まとめ）

1. axiosメンテナのnpmアカウントが乗っ取られた
2. マルウェアを仕込んだ偽バージョン（`1.14.1` / `0.30.4`）がnpmに公開された
3. `npm install` するだけで、遠隔操作マルウェア（RAT）が自動インストールされた

影響を受けたバージョンは約2〜3時間で削除されましたが、この間に `npm install` を実行した環境はマルウェアに感染している可能性があります。

---

## 2. 攻撃のタイムライン

| 日時（UTC） | 日時（JST） | 出来事 |
| --- | --- | --- |
| 3/30 05:57 | 3/30 14:57 | 攻撃者が `plain-crypto-js@4.2.0`（無害版）をnpmに公開。信頼構築のための布石 |
| 3/30 23:59 | 3/31 08:59 | `plain-crypto-js@4.2.1`（マルウェア入り）を公開 |
| 3/31 00:21 | 3/31 09:21 | **`axios@1.14.1`（悪性版）を公開** |
| 3/31 01:00 | 3/31 10:00 | **`axios@0.30.4`（悪性版）を公開** |
| 3/31 ~03:15 | 3/31 ~12:15 | npmが悪性バージョンを削除 |
| 3/31 03:25 | 3/31 12:25 | npmが `plain-crypto-js` をセキュリティホールド（公開停止） |

**影響を受けた時間帯: JST 3/31 09:21 〜 12:15（約3時間）**

この間に `npm install`、`npm ci`、`npm update` などを実行した環境が対象です。

---

## 3. 攻撃の仕組みを図解する

### ステップ1: メンテナアカウントの乗っ取り

```
攻撃者
  ↓ npm アクセストークンを窃取
  ↓ （長期有効なクラシックトークン）
jasonsaayman の npm アカウント
  ↓ メールアドレスを ifstap@proton.me に変更
  ↓ 悪性パッケージを CLI から直接 publish
npm レジストリ
```

axios の v1.x 系は本来 **GitHub Actions の OIDC認証** で自動公開する設定でしたが、ワークフローに `NODE_AUTH_TOKEN` 環境変数も併用されていました。npmはトークンを優先するため、**トークンを盗めばOIDCをバイパスできる**状態でした。

### ステップ2: 「見えない依存関係」の注入

攻撃者は axios のソースコード自体には一切手を加えていません。やったことは**たった一つ**です。

```json
// axios@1.14.1 の package.json（差分）
{
  "dependencies": {
    "follow-redirects": "^1.15.6",
    "form-data": "^4.0.0",
    "proxy-from-env": "^1.1.0",
+   "plain-crypto-js": "^4.2.1"  // ← これだけ追加
  }
}
```

**`plain-crypto-js` は axios のコード内で一切 import されていません。** しかし `npm install` の仕組み上、`dependencies` に書かれたパッケージは自動的にインストールされ、その `postinstall` スクリプトが実行されます。

### ステップ3: postinstall でマルウェア配布

```
npm install axios@1.14.1
  ↓
plain-crypto-js@4.2.1 もインストール
  ↓
postinstall スクリプト（setup.js）が実行
  ↓
C2サーバー（sfrclak[.]com:8000）から
OS別のマルウェアをダウンロード＆実行
  ↓
setup.js が自身を削除（証拠隠滅）
  ↓
package.json をクリーンな 4.2.0 に差し替え
```

この攻撃の巧みな点は以下の通りです:

- **axios のコード自体は無改変** → コードレビューでは見つからない
- **`plain-crypto-js` は正規の `crypto-js` のコピー** → ファイル内容は正規品とビット単位で同一
- **実行後に自己削除** → 後から調べても痕跡が残りにくい

---

## 4. マルウェアは何をするのか

インストールされるマルウェアは **RAT（Remote Access Trojan）** で、攻撃者があなたのPCを遠隔操作できるようになります。

### OS別の動作

| OS | 偽装名 | 保存先 | 手法 |
| --- | --- | --- | --- |
| **macOS** | Apple キャッシュデーモン | `/Library/Caches/com.apple.act.mond` | AppleScript経由でダウンロード・実行 |
| **Windows** | Windows Terminal | `%PROGRAMDATA%\wt.exe` | PowerShellのコピーを作成、VBScript経由で実行 |
| **Linux** | Python スクリプト | `/tmp/ld.py` | curl でダウンロード、nohup でバックグラウンド実行 |

### RATの主な機能

- **リモートシェル実行** — 攻撃者がコマンドを送信して実行させる
- **ファイル閲覧** — ディレクトリ構造やファイル内容を取得
- **プロセス一覧取得** — 実行中のプログラムを確認
- **システム偵察** — OS情報、ネットワーク情報を収集
- **60秒ごとにC2サーバーに通信** — 攻撃者の指示を待機

### 通信の偽装

C2サーバーへのPOST通信では、以下のようにnpmの通信に偽装します:

| OS | POSTボディ |
| --- | --- |
| macOS | `packages.npm.org/product0` |
| Windows | `packages.npm.org/product1` |
| Linux | `packages.npm.org/product2` |

一見するとnpmへの正規通信に見えるため、ネットワーク監視で見逃される可能性があります。

---

## 5. 自分が影響を受けているか確認する

### 最優先: PC全体で一括検索（推奨）

プロジェクトごとに `npm ls` するのは漏れが出ます。**PC全体を一括検索**してください。

**Mac / Linux:**

```bash
find ~ -type d -name "plain-crypto-js" 2>/dev/null
```

**Windows（PowerShell）:**

```powershell
Get-ChildItem -Path ~ -Recurse -Directory -Filter "plain-crypto-js" -ErrorAction SilentlyContinue
```

**何も表示されなければOKです。**

### 補助チェック: バックドアファイルの確認

マルウェアが実行されていた場合、以下のファイルが存在する可能性があります。

**Mac:**

```bash
ls -la /Library/Caches/com.apple.act.mond
```

**Windows（PowerShell）:**

```powershell
Test-Path "$env:PROGRAMDATA\wt.exe"
Test-Path "$env:TEMP\6202033.vbs"
```

**Linux:**

```bash
ls -la /tmp/ld.py
```

### 補助チェック: ネットワーク通信の確認

C2サーバーへの通信がないか確認します。

```bash
# 現在の通信を確認
netstat -an | grep "142.11.206.73"

# DNS履歴があるか確認（Macの場合）
log show --predicate 'process == "mDNSResponder"' --last 24h | grep "sfrclak"
```

### プロジェクト単位での確認

特定のプロジェクトについて確認する場合:

```bash
# axiosのバージョン確認
npm ls axios

# package-lock.json に悪性パッケージがないか確認
grep "plain-crypto-js" package-lock.json
```

---

## 6. 影響を受けていた場合の対応

### 緊急度: 高

以下の手順を**上から順に**実施してください。

#### 1. ネットワークを遮断する

マルウェアは60秒ごとにC2サーバーと通信しています。まず通信を止めましょう。

#### 2. バックドアファイルを削除する

```bash
# macOS
sudo rm -f /Library/Caches/com.apple.act.mond

# Linux
rm -f /tmp/ld.py

# Windows（PowerShell）
Remove-Item "$env:PROGRAMDATA\wt.exe" -Force
Remove-Item "$env:TEMP\6202033.vbs" -Force
```

#### 3. 悪性パッケージを削除し、安全なバージョンに戻す

```bash
# node_modules を丸ごと削除して再インストール
rm -rf node_modules package-lock.json

# package.json の axios バージョンを安全なものに指定
# 1.x系: 1.14.0
# 0.x系: 0.30.3
npm install
```

#### 4. すべての認証情報をローテーション（変更）する

マルウェアに遠隔操作されていた場合、**PCに保存されていたすべての認証情報が漏洩した前提**で行動してください。

- npmアクセストークン
- SSH秘密鍵
- AWSアクセスキー / GCPサービスアカウントキー
- GitHubのPersonal Access Token
- `.env` ファイル内のすべてのシークレット
- ブラウザに保存されたパスワード（重要なもの）

#### 5. CI/CDパイプラインを監査する

CI/CD環境でも `npm install` が実行されていた場合、ビルドサーバーも感染している可能性があります。

---

## 7. なぜこの攻撃は成立したのか

この事件には、npmエコシステムの構造的な問題がいくつか浮き彫りになっています。

### 問題1: `postinstall` スクリプトの自動実行

npmはデフォルトで、パッケージの `postinstall` スクリプトを**自動実行**します。これは「インストールしただけで任意のコードが実行される」ことを意味します。

```bash
# この一行で、依存パッケージの postinstall が全て実行される
npm install
```

### 問題2: 長期有効なアクセストークン

npmのクラシックトークンは**有効期限なし**で発行できます。一度窃取されると、無効化されるまで永遠に使えます。

### 問題3: OIDC とトークンの併用

axios は GitHub Actions OIDC（短命トークン）を設定していましたが、長命のクラシックトークンも残存。npmはクラシックトークンを優先するため、OIDCの保護が無効化されていました。

### 問題4: 依存関係の信頼モデル

`npm install axios` すると、axios が依存するパッケージも全て自動インストールされます。**ユーザーが明示的にインストールしていないパッケージ**のコードが実行される仕組みです。

---

## 8. 今後の対策

### すぐにできること

#### `--ignore-scripts` の活用

```bash
# postinstall スクリプトを実行させない
npm install --ignore-scripts

# グローバル設定にする場合
npm config set ignore-scripts true
```

ただし、一部のパッケージ（ネイティブモジュールなど）は `postinstall` が必要なため、プロジェクトによっては問題が出る場合があります。

#### lockfile の固定と監視

```bash
# package-lock.json を厳密に使う
npm ci  # （npm install ではなく）
```

`npm ci` は `package-lock.json` に記載されたバージョンを厳密にインストールするため、意図しないバージョン更新を防げます。

#### npm の Minimum Release Age を活用

npm v11 で導入された **Minimum Release Age** は、パッケージ公開から一定時間が経過するまでインストールをブロックする機能です。

```bash
# 公開後72時間未満のバージョンをブロック
npm config set minReleaseAge 72h
```

今回のように公開から数時間で削除されるような攻撃には効果的です。

#### 依存関係の定期監査

```bash
# 既知の脆弱性を確認
npm audit

# 依存ツリーを可視化して把握
npm ls --all
```

### 組織で取り組むべきこと

- **npmアカウントの2FA（二要素認証）を必須化**
- **クラシックトークンの棚卸しと廃止**（Granular Access Token に移行）
- **CI/CDのシークレットを定期ローテーション**
- **`npm publish` の権限を最小限に制限**（organization scopeの活用）
- **依存パッケージの異常検知**（Aikido、Socket.dev、Snykなどのツール導入）

---

## 9. まとめ

| 項目 | 内容 |
| --- | --- |
| **影響パッケージ** | `axios@1.14.1`、`axios@0.30.4` |
| **影響期間（JST）** | 2026/3/31 09:21 〜 12:15（約3時間） |
| **攻撃手法** | メンテナアカウント乗っ取り → 悪性依存の注入 → postinstall でRAT配布 |
| **マルウェア** | クロスプラットフォーム対応RAT（遠隔操作） |
| **確認方法** | `find ~ -type d -name "plain-crypto-js"` で全検索 |
| **安全なバージョン** | 1.x 系: `1.14.0` / 0.x 系: `0.30.3` |

axiosは「自分でインストールした覚えがなくても」、他のライブラリの間接依存で入っている可能性があります。影響期間中に `npm install` を実行した方は、必ず確認してください。

## 参考リンク

- [axios ソフトウェアサプライチェーン攻撃の概要と対応指針 - Flatt Security](https://blog.flatt.tech/entry/axios_compromise)
- [Axios npm compromised: maintainer hijacked, RAT deployed - Aikido Security](https://www.aikido.dev/blog/axios-npm-compromised-maintainer-hijacked-rat)
- [Axios NPM Compromised in Supply Chain Attack - Wiz](https://www.wiz.io/blog/axios-npm-compromised-in-supply-chain-attack)
- [Axios Compromised on npm: Malicious Versions Drop Remote Access Trojan - StepSecurity](https://www.stepsecurity.io/blog/axios-compromised-on-npm-malicious-versions-drop-remote-access-trojan)
