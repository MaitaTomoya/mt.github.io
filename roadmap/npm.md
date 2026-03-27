---
title: 'npm'
order: 4
section: 'フロントエンド基礎'
---

# npm

## npmとは

npmは **Node Package Manager** の略で、JavaScriptのパッケージ（ライブラリやツール）を管理するためのツール。

「パッケージ」とは、誰かが作って公開してくれたコードの集まり。例えば「日付のフォーマットを簡単にする関数」「HTTPリクエストを簡単に送る関数」などが1つのパッケージとして公開されている。

npmは3つの側面を持っている:

| 側面                 | 説明                                               |
| -------------------- | -------------------------------------------------- |
| コマンドラインツール | ターミナルで`npm install`等のコマンドを実行する    |
| レジストリ           | パッケージが公開されているオンラインのデータベース |
| Webサイト            | パッケージの検索・ドキュメント閲覧ができるサイト   |

npmレジストリには**200万以上のパッケージ**が公開されており、世界最大のソフトウェアレジストリとなっている。

## なぜnpmが必要なのか

### 車輪の再発明を避ける

「日付を`YYYY-MM-DD`形式に変換する」「バリデーションを行う」など、多くの開発者が必要とする機能を毎回自分で書くのは非効率。npmを使えば、既に十分にテストされた高品質なパッケージをインストールするだけで使える。

### チーム開発での環境統一

`package.json`というファイルに「どのパッケージのどのバージョンを使っているか」を記録するため、チーム全員が同じ環境で開発できる。

```
npm installを実行するだけで、必要なパッケージが全て自動的にインストールされる
```

### エコシステムの力

1つのパッケージが別のパッケージに依存し、さらに別のパッケージに依存する...という形で、巨大なエコシステムが形成されている。この依存関係をnpmが自動的に管理してくれる。

## Node.jsとnpmの関係

**Node.js**はJavaScriptをブラウザの外（サーバーやローカルPC）で実行するための実行環境。

**npm**はNode.jsをインストールすると**一緒に付いてくる**パッケージマネージャ。

```
Node.jsをインストール → npmも自動でインストールされる
```

```bash
# バージョンの確認
node -v   # Node.jsのバージョン（例: v20.11.0）
npm -v    # npmのバージョン（例: 10.2.4）
```

Node.jsのインストールは公式サイト（https://nodejs.org/）から。LTS（Long Term Support）版を選ぶのが推奨。

## package.json

`package.json`はプロジェクトの設定ファイル。プロジェクトの名前、バージョン、使用するパッケージなどが記録されている。**全てのNode.jsプロジェクトの根幹となるファイル。**

### 作成方法

```bash
# 対話形式で作成（いくつかの質問に答える）
npm init

# 全てデフォルト値で作成（素早く始めたい場合）
npm init -y
```

### 構造の詳細

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "プロジェクトの説明",
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --fix",
    "format": "prettier --write .",
    "test": "vitest"
  },
  "keywords": ["web", "app"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0",
    "vitest": "^1.2.0"
  }
}
```

### 各フィールドの解説

| フィールド      | 必須   | 説明                                               |
| --------------- | ------ | -------------------------------------------------- |
| name            | はい   | プロジェクト名（小文字、ハイフン区切り推奨）       |
| version         | はい   | プロジェクトのバージョン                           |
| description     | いいえ | プロジェクトの説明                                 |
| main            | いいえ | エントリーポイント（パッケージとして公開する場合） |
| scripts         | いいえ | カスタムコマンドの定義（後述）                     |
| keywords        | いいえ | npm検索用のキーワード                              |
| author          | いいえ | 作者名                                             |
| license         | いいえ | ライセンス                                         |
| dependencies    | いいえ | 本番環境で必要なパッケージ                         |
| devDependencies | いいえ | 開発時のみ必要なパッケージ                         |
| engines         | いいえ | 必要なNode.jsやnpmのバージョン                     |
| private         | いいえ | trueにするとnpm publishを防止                      |

## npmの基本コマンド

### コマンド一覧表

| コマンド                      | 説明                                     | 例                               |
| ----------------------------- | ---------------------------------------- | -------------------------------- |
| `npm init`                    | package.jsonを作成                       | `npm init -y`                    |
| `npm install`                 | package.jsonの依存関係を全てインストール | `npm install`（`npm i`と省略可） |
| `npm install パッケージ名`    | パッケージをインストール                 | `npm install axios`              |
| `npm install -D パッケージ名` | 開発用パッケージをインストール           | `npm install -D vitest`          |
| `npm uninstall パッケージ名`  | パッケージを削除                         | `npm uninstall axios`            |
| `npm update`                  | パッケージを更新                         | `npm update`                     |
| `npm run スクリプト名`        | カスタムスクリプトを実行                 | `npm run dev`                    |
| `npm test`                    | テストを実行                             | `npm test`（`npm t`と省略可）    |
| `npm start`                   | アプリを起動                             | `npm start`                      |
| `npm list`                    | インストール済みパッケージを一覧表示     | `npm list --depth=0`             |
| `npm outdated`                | 更新可能なパッケージを表示               | `npm outdated`                   |
| `npm audit`                   | セキュリティの脆弱性をチェック           | `npm audit`                      |
| `npm cache clean --force`     | npmのキャッシュを削除                    | `npm cache clean --force`        |
| `npm config list`             | npmの設定を表示                          | `npm config list`                |
| `npm info パッケージ名`       | パッケージの詳細情報を表示               | `npm info react`                 |

### インストールの実例

```bash
# パッケージのインストール（dependenciesに追加）
npm install react react-dom

# 開発用パッケージのインストール（devDependenciesに追加）
npm install -D typescript @types/react eslint prettier

# 特定のバージョンをインストール
npm install react@18.2.0

# package.jsonの全依存関係をインストール（プロジェクトを初めてセットアップするとき）
npm install
```

## dependencies vs devDependencies

| 種類            | 追加方法         | 用途                             | 例                         |
| --------------- | ---------------- | -------------------------------- | -------------------------- |
| dependencies    | `npm install`    | 本番環境で動作に必要なパッケージ | react, axios, express      |
| devDependencies | `npm install -D` | 開発時のみ必要なパッケージ       | vitest, eslint, typescript |

### 判断基準

「このパッケージがなくても、ビルド後のアプリは動くか?」と考える。

- **動かない** → `dependencies`（react, express, axiosなど）
- **動く** → `devDependencies`（eslint, prettier, typescriptなど）

```bash
# dependencies（本番で必要）
npm install react           # UIライブラリ
npm install axios           # HTTPクライアント
npm install express         # Webフレームワーク
npm install zod             # バリデーション

# devDependencies（開発時のみ）
npm install -D typescript   # 型チェック（ビルド時に変換される）
npm install -D eslint       # コードの静的解析
npm install -D prettier     # コードフォーマット
npm install -D vitest       # テストフレームワーク
npm install -D @types/react # 型定義ファイル
```

**注意:** TypeScriptは`devDependencies`に入れる。なぜなら、TypeScriptのコードはビルド時にJavaScriptに変換されるため、本番環境ではTypeScript自体は不要だから。

## package-lock.json

`package-lock.json`は、インストールされた全パッケージの**正確なバージョン**を記録するファイル。`npm install`を実行すると自動的に生成・更新される。

### なぜ必要か

`package.json`には`"react": "^18.2.0"`のように**範囲指定**でバージョンが書かれている。この場合、18.2.0以上18.x.xの範囲の最新バージョンがインストールされる。

問題は、開発者Aが`npm install`した時と、開発者Bが`npm install`した時で、インストールされるバージョンが異なる可能性があること。

`package-lock.json`があれば、**全員が全く同じバージョン**のパッケージをインストールできる。

```
開発者A: npm install → react 18.2.0がインストール、package-lock.jsonに記録
（2週間後にreact 18.2.1がリリース）
開発者B: npm install → package-lock.jsonがあるので、react 18.2.0がインストールされる
```

### コミットすべきか

**必ずGitにコミットする。** `package-lock.json`はプロジェクトに不可欠なファイル。

```
package.json        → コミットする
package-lock.json   → コミットする
node_modules/       → コミットしない（.gitignoreに追加）
```

### npm ciコマンド

CI/CD環境（GitHub Actions等）では、`npm install`の代わりに`npm ci`を使うのが推奨される。

```bash
# npm install: package-lock.jsonを「参考に」インストール（更新される場合がある）
npm install

# npm ci: package-lock.jsonに「厳密に従って」インストール（より確実）
npm ci
```

`npm ci`の特徴:

- `package-lock.json`と完全に一致するバージョンをインストール
- `node_modules`を一旦削除してからクリーンインストール
- `package-lock.json`を変更しない
- `npm install`より高速

## node_modules

`node_modules`は、インストールされた全パッケージのソースコードが格納されるディレクトリ。

### .gitignoreに入れる理由

1. **巨大になる:** 小さなプロジェクトでも数百MB、大きなプロジェクトでは1GB以上になることがある
2. **復元可能:** `npm install`を実行すれば`package.json`と`package-lock.json`から完全に復元できる
3. **OS依存:** パッケージの一部はOS固有のバイナリを含むため、異なるOSでは再インストールが必要

```bash
# .gitignoreに追加
echo "node_modules/" >> .gitignore
```

### なぜ巨大になるのか

パッケージAがパッケージBに依存し、パッケージBがパッケージCとDに依存し...という**依存の連鎖**により、インストールされるパッケージが雪だるま式に増える。

```
あなたが入れたパッケージ: 5個
↓
それらが依存するパッケージ: 50個
↓
さらにその依存: 500個
↓
node_modulesの中: 555個のパッケージ
```

これは開発者コミュニティで有名な「heaviest objects in the universe（宇宙で最も重い物体）」というミーム（インターネット上で広まったジョーク）のネタにもなるほど。node_modulesの肥大化はJavaScriptエコシステムの特徴的な課題として広く認知されている。

## npx

`npx`は **npm exec** の省略形で、パッケージをインストールせずに一時的に実行するコマンド。npm 5.2以降に付属している。

### 使い所

```bash
# プロジェクトの初期化（一度だけ使うツール）
npx create-react-app my-app
npx create-vite my-app
npx create-next-app my-app

# ローカルにインストールされたパッケージの実行
npx eslint .
npx prettier --write .
npx vitest

# 一時的な実行（インストールしない）
npx cowsay "Hello"    # 遊び用のコマンド（一度だけ実行）
```

### npmとの違い

```bash
# npm: パッケージをインストールする
npm install -g create-vite   # グローバルにインストール
create-vite my-app            # 実行

# npx: インストールせずに実行（推奨）
npx create-vite my-app        # 一時的にダウンロードして実行
```

npxの利点:

- 常に最新バージョンが使われる
- グローバル環境を汚さない
- ディスク容量を節約できる

## セマンティックバージョニング

npmのパッケージはセマンティックバージョニング（SemVer）というルールに従ってバージョンを管理する。

### バージョン番号の構造

```
MAJOR.MINOR.PATCH
例: 18.2.1

MAJOR: 破壊的変更（既存のコードが動かなくなる可能性がある）
MINOR: 後方互換性のある機能追加
PATCH: 後方互換性のあるバグ修正
```

### バージョン指定記号

| 記号     | 意味                    | 例         | インストールされる範囲  |
| -------- | ----------------------- | ---------- | ----------------------- |
| なし     | 完全一致                | `18.2.1`   | 18.2.1のみ              |
| `^`      | MINOR/PATCHの更新を許可 | `^18.2.1`  | 18.2.1 以上 19.0.0 未満 |
| `~`      | PATCHの更新のみ許可     | `~18.2.1`  | 18.2.1 以上 18.3.0 未満 |
| `>=`     | 指定以上                | `>=18.0.0` | 18.0.0以上の全て        |
| `*`      | 全バージョン            | `*`        | 全て                    |
| `latest` | 最新版                  | `latest`   | 最新リリース            |

### 使い分けの指針

```json
{
  "dependencies": {
    "react": "^18.2.0", // ^（キャレット）: 最も一般的。npmデフォルト
    "express": "~4.18.0", // ~（チルダ）: パッチのみ更新。慎重に使いたい場合
    "lodash": "4.17.21" // 固定: 絶対にバージョンを変えたくない場合
  }
}
```

**実務では`^`（キャレット）がデフォルト。** `npm install`で追加すると自動的に`^`が付く。

## スクリプト（npm scripts）

`package.json`の`scripts`フィールドにカスタムコマンドを定義し、`npm run`で実行できる。

### 基本的な使い方

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --fix",
    "format": "prettier --write .",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "type-check": "tsc --noEmit",
    "prepare": "husky"
  }
}
```

```bash
# 実行方法
npm run dev          # 開発サーバーを起動
npm run build        # 本番用ビルド
npm run lint         # コードの静的解析 + 自動修正
npm run format       # コードフォーマット
npm test             # テスト実行（npm run testの省略形）
npm run test:coverage # テストカバレッジ付きで実行
```

### 特別なスクリプト名

以下のスクリプト名は`npm run`なしで実行できる。

| スクリプト名 | 実行方法    | 用途                     |
| ------------ | ----------- | ------------------------ |
| start        | `npm start` | アプリの起動             |
| test         | `npm test`  | テストの実行             |
| prepare      | 自動実行    | インストール後に自動実行 |
| preinstall   | 自動実行    | インストール前に自動実行 |
| postinstall  | 自動実行    | インストール後に自動実行 |

### pre / postフック

スクリプト名の前に`pre`や`post`を付けると、メインのスクリプトの前後に自動実行される。

```json
{
  "scripts": {
    "prebuild": "echo 'ビルド前の処理'",
    "build": "vite build",
    "postbuild": "echo 'ビルド後の処理'"
  }
}
```

```bash
npm run build
# 1. prebuildが実行される
# 2. buildが実行される
# 3. postbuildが実行される
```

### スクリプトの連結

```json
{
  "scripts": {
    "check": "npm run lint && npm run type-check && npm test",
    "ci": "npm ci && npm run check && npm run build"
  }
}
```

- `&&`: 前のコマンドが成功した場合のみ次を実行
- `||`: 前のコマンドが失敗した場合に次を実行
- `;`: 前のコマンドの成否に関わらず次を実行

## グローバルインストール vs ローカルインストール

| 種類             | コマンド                      | インストール先 | 用途                 |
| ---------------- | ----------------------------- | -------------- | -------------------- |
| ローカル（推奨） | `npm install パッケージ名`    | ./node_modules | プロジェクト固有     |
| グローバル       | `npm install -g パッケージ名` | システム全体   | コマンドラインツール |

### ローカルインストールが推奨される理由

1. **プロジェクトごとにバージョンを変えられる**: プロジェクトAではv1、プロジェクトBではv2を使うことが可能
2. **依存関係が明示される**: `package.json`に記録されるため、他の開発者も同じ環境を再現できる
3. **バージョン競合を避けられる**: グローバルに入れると、全プロジェクトで同じバージョンを強制されてしまう

```bash
# ローカルインストール（推奨）
npm install eslint
npx eslint .        # npxでローカルのパッケージを実行

# グローバルインストール（限定的に使う）
npm install -g npm   # npm自体の更新
npm install -g vercel # デプロイツール等、プロジェクトに依存しないCLIツール
```

### グローバルインストールが適している場合

- npm自体の更新（`npm install -g npm`）
- プロジェクトに依存しないCLIツール（`vercel`, `netlify-cli`等）
- 頻繁に使うスキャフォールディングツール（ただし`npx`を使う方が推奨）

## npm vs yarn vs pnpm

JavaScriptのパッケージマネージャは3つある。

| 特徴           | npm                 | yarn               | pnpm                   |
| -------------- | ------------------- | ------------------ | ---------------------- |
| 開発元         | npm Inc（GitHub社） | Facebook（Meta）   | コミュニティ           |
| 付属           | Node.jsに標準付属   | 別途インストール   | 別途インストール       |
| ロックファイル | package-lock.json   | yarn.lock          | pnpm-lock.yaml         |
| 速度           | 普通                | 速い               | 最速                   |
| ディスク使用量 | 多い                | 多い               | 少ない（ハードリンク） |
| Workspaces     | 対応                | 対応               | 対応                   |
| Plug'n'Play    | 非対応              | 対応（yarn berry） | 非対応                 |
| 厳格さ         | 緩い                | 緩い               | 厳格（幽霊依存を防止） |
| 学習コスト     | 低い（標準）        | 低い               | やや高い               |

### コマンドの対応表

| 操作                 | npm                  | yarn                  | pnpm              |
| -------------------- | -------------------- | --------------------- | ----------------- |
| インストール         | `npm install`        | `yarn`                | `pnpm install`    |
| パッケージ追加       | `npm install pkg`    | `yarn add pkg`        | `pnpm add pkg`    |
| 開発用パッケージ追加 | `npm install -D pkg` | `yarn add -D pkg`     | `pnpm add -D pkg` |
| パッケージ削除       | `npm uninstall pkg`  | `yarn remove pkg`     | `pnpm remove pkg` |
| スクリプト実行       | `npm run dev`        | `yarn dev`            | `pnpm dev`        |
| グローバル追加       | `npm install -g pkg` | `yarn global add pkg` | `pnpm add -g pkg` |

### どれを選ぶべきか

- **npm**: 初心者はまずこれで学ぶ。Node.js標準で追加インストール不要
- **yarn**: Facebookが開発。大規模プロジェクトでの実績が豊富
- **pnpm**: ディスク効率が良く、厳格な依存関係管理。モノレポに強い

プロジェクトに参加する際は、そのプロジェクトが使っているパッケージマネージャに合わせる。ロックファイルの種類で判断できる。

```
package-lock.json → npm
yarn.lock         → yarn
pnpm-lock.yaml    → pnpm
```

## セキュリティ

### npm audit

プロジェクトの依存パッケージに既知の脆弱性がないかチェックするコマンド。

```bash
# 脆弱性のチェック
npm audit

# 出力例:
# found 3 vulnerabilities (1 low, 1 moderate, 1 high)
#   info  - https://github.com/advisories/GHSA-xxxx
#   moderate - パッケージ名@バージョン
#   high - パッケージ名@バージョン

# 自動修正を試みる
npm audit fix

# 破壊的変更を伴う修正も含める（注意して使う）
npm audit fix --force
```

### セキュリティのベストプラクティス

1. **定期的に`npm audit`を実行する**: CI/CDパイプラインに組み込むのが理想
2. **不要なパッケージは削除する**: 使っていないパッケージは脆弱性のリスクを不必要に増やす
3. **パッケージの人気度と信頼性を確認する**: ダウンロード数、GitHubのスター数、最終更新日を確認
4. **ロックファイルをコミットする**: 想定外のバージョンがインストールされるのを防ぐ
5. **Dependabot / Renovateを活用する**: GitHubのDependabotは脆弱性を検知してPRを自動作成してくれる

### 怪しいパッケージの見分け方

```bash
# パッケージの情報を確認
npm info パッケージ名

# 確認すべきポイント:
# - 最終更新日（長期間更新がないものは注意）
# - 週間ダウンロード数（少なすぎるものは注意）
# - ライセンス（商用利用可能か）
# - 依存パッケージの数（多すぎるものは注意）
```

## .npmrc

`.npmrc`はnpmの設定ファイル。プロジェクトルートに配置する。

```ini
# レジストリの設定（プライベートレジストリを使う場合）
registry=https://registry.npmjs.org/

# パッケージのインストール時にpackage-lock.jsonを常に生成
package-lock=true

# npm installの進行状況表示を抑制
progress=false

# エンジンの不一致を厳格にチェック
engine-strict=true

# Node.jsのバージョン指定（チーム全員が同じバージョンを使うよう強制）
# package.jsonのenginesフィールドと併用
```

package.jsonでのengines指定:

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

## 実務でよく使うパッケージ10選

### フロントエンド

| パッケージ | 説明                              | インストール                  |
| ---------- | --------------------------------- | ----------------------------- |
| react      | UIライブラリ                      | `npm install react react-dom` |
| next       | React用フルスタックフレームワーク | `npx create-next-app`         |
| axios      | HTTPクライアント                  | `npm install axios`           |
| zod        | スキーマバリデーション            | `npm install zod`             |
| date-fns   | 日付操作ライブラリ                | `npm install date-fns`        |

### 開発ツール

| パッケージ | 説明                 | インストール                |
| ---------- | -------------------- | --------------------------- |
| typescript | 型付きJavaScript     | `npm install -D typescript` |
| eslint     | コードの静的解析     | `npm install -D eslint`     |
| prettier   | コードフォーマッター | `npm install -D prettier`   |
| vitest     | テストフレームワーク | `npm install -D vitest`     |
| husky      | Gitフック管理        | `npm install -D husky`      |

### 各パッケージの簡単な使用例

```bash
# Axiosの例
npm install axios
```

```javascript
import axios from 'axios'

const fetchUsers = async () => {
  try {
    const response = await axios.get('https://api.example.com/users')
    return response.data
  } catch (error) {
    console.error('エラー:', error.message)
  }
}
```

```bash
# Zodの例
npm install zod
```

```javascript
import { z } from 'zod'

// スキーマの定義
const userSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('メールアドレスが無効です'),
  age: z.number().min(0).max(150),
})

// バリデーション
try {
  const user = userSchema.parse({
    name: '太郎',
    email: 'taro@example.com',
    age: 25,
  })
  console.log('有効なデータ:', user)
} catch (error) {
  console.error('バリデーションエラー:', error.errors)
}
```

```bash
# date-fnsの例
npm install date-fns
```

```javascript
import { format, addDays, differenceInDays } from 'date-fns'
import { ja } from 'date-fns/locale'

const now = new Date()
console.log(format(now, 'yyyy年MM月dd日(E)', { locale: ja }))
// 例: 2026年3月28日(土)

const nextWeek = addDays(now, 7)
console.log(differenceInDays(nextWeek, now)) // 7
```

## npmのよくあるトラブルと対処法

### 1. npm installが失敗する

```bash
# キャッシュをクリアしてやり直す
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

### 2. permission denied（権限エラー）

```bash
# グローバルインストールで権限エラーが出る場合
# NG: sudo npm install -g package（sudoは使わない）

# OK: npmのデフォルトディレクトリを変更
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
# シェルの設定ファイル（.zshrc等）にPATHを追加
# export PATH=~/.npm-global/bin:$PATH
```

### 3. peer dependency警告

```bash
# 警告例: npm WARN peer dep required react@^17.0.0

# 対処: 互換性のあるバージョンをインストール
npm install react@17
# または: 警告を無視して強制インストール（注意して使う）
npm install --legacy-peer-deps
```

### 4. node_modulesが壊れた

```bash
# 完全にリセット
rm -rf node_modules
rm package-lock.json
npm install
```

## 参考リンク

- [npm公式ドキュメント](https://docs.npmjs.com/) - npmの公式リファレンス
- [npmjs.com](https://www.npmjs.com/) - パッケージの検索サイト
- [Node.js公式サイト](https://nodejs.org/ja) - Node.jsのダウンロードとドキュメント
- [セマンティックバージョニング](https://semver.org/lang/ja/) - SemVerの公式仕様（日本語）
- [npm Docs - package.json](https://docs.npmjs.com/cli/v10/configuring-npm/package-json) - package.jsonの全フィールド解説
- [pnpm公式サイト](https://pnpm.io/ja/) - pnpmの公式ドキュメント（日本語）
- [yarn公式サイト](https://yarnpkg.com/) - yarnの公式ドキュメント
