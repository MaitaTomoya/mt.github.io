---
title: 'GitHub Actions'
order: 28
section: 'DevOps/インフラ'
---

# GitHub Actions

## CI/CDとは

ソフトウェア開発において、コードを書いてから本番環境にリリースするまでには多くの工程がある。CI/CDはこれらの工程を自動化する仕組みの総称だ。

### CI（継続的インテグレーション: Continuous Integration）

開発者がコードを共有リポジトリにマージするたびに、自動でビルドとテストを実行する手法。「インテグレーション」とは「統合」を意味し、複数の開発者のコードを頻繁に統合することで、問題を早期に発見する。

### CD（継続的デリバリー/デプロイ: Continuous Delivery / Continuous Deployment）

CIの次のステップとして、テストを通過したコードを自動でステージング環境や本番環境に配信する手法。

| 用語                           | 意味                                           | 自動化の範囲                     |
| ------------------------------ | ---------------------------------------------- | -------------------------------- |
| CI（継続的インテグレーション） | コードの統合・ビルド・テストを自動化           | コード変更 → ビルド → テスト     |
| CD（継続的デリバリー）         | リリース準備までを自動化（本番反映は手動承認） | テスト → ステージング → 承認待ち |
| CD（継続的デプロイ）           | 本番環境への反映まで全て自動化                 | テスト → ステージング → 本番反映 |

身近な例で理解すると、CI/CDは「工場の品質管理ライン」のようなもの。製品（コード）が作られるたびに、自動で検査（テスト）が行われ、合格品だけが出荷（デプロイ）される仕組みだ。

## なぜCI/CDが必要か

### 手動デプロイの問題点

CI/CDを導入していないプロジェクトでは、以下のような問題が頻繁に発生する。

| 問題               | 具体的な状況                 | 影響                             |
| ------------------ | ---------------------------- | -------------------------------- |
| ヒューマンエラー   | 手動でコマンドを打ち間違える | 本番環境の障害                   |
| 属人化             | 特定の人しかデプロイできない | その人が休むとリリースできない   |
| 時間の浪費         | 毎回同じ手順を手動で実行     | 開発に使える時間が減る           |
| テスト漏れ         | テストを実行し忘れる         | バグが本番に混入                 |
| 環境差異           | 「自分の環境では動いた」     | 本番で動かない                   |
| リリース頻度の低下 | デプロイが面倒で頻度が下がる | フィードバックサイクルが遅くなる |

### 自動化のメリット

- コードをpushするだけで自動的にテストが走る
- テストが通ったコードだけがデプロイされる
- 誰がやっても同じ手順でデプロイされる
- リリース頻度を上げられる（1日に何度もリリース可能）
- 問題があった場合、どのコミットで壊れたか特定しやすい

## GitHub Actionsとは

GitHub Actionsは、GitHubに組み込まれたCI/CDサービス。リポジトリ上でコードの変更が発生したとき（pushやPR作成など）、自動的にビルド、テスト、デプロイなどの処理を実行できる。

他のCI/CDサービス（Jenkins、CircleCI、Travis CIなど）と違い、GitHubと完全に統合されているため、別途サービスの設定やアカウント作成が不要。

| CI/CDサービス  | 特徴                       | GitHubとの統合       | 料金（個人）             |
| -------------- | -------------------------- | -------------------- | ------------------------ |
| GitHub Actions | GitHub組み込み、設定が簡単 | 完全統合             | 無料枠が充実             |
| Jenkins        | オープンソース、高い拡張性 | プラグインが必要     | 無料（サーバー費用は別） |
| CircleCI       | 高速、Docker対応が強力     | 連携が必要           | 無料枠あり               |
| Travis CI      | オープンソースに強い       | 連携が必要           | 有料化が進んでいる       |
| GitLab CI/CD   | GitLabに統合               | GitLabリポジトリ向け | 無料枠あり               |

## 基本概念

GitHub Actionsを理解するには、以下の6つの概念を把握する必要がある。

### 概念の関係図

```
[Event] → トリガー
    ↓
[Workflow] (.github/workflows/*.yml)
    ↓
[Job 1]  ←→  [Job 2]  （並列実行 or 直列実行）
  ↓               ↓
[Step 1]        [Step 1]
[Step 2]        [Step 2]
  ↓               ↓
[Action]        [Action]   ←  再利用可能な処理単位
    ↓
[Runner] （実行環境: ubuntu-latest等）
```

### 各概念の詳細

| 概念         | 説明                                            | 例え                                         |
| ------------ | ----------------------------------------------- | -------------------------------------------- |
| **Workflow** | 自動化プロセス全体の定義。YAMLファイルで記述。  | レシピ全体                                   |
| **Event**    | Workflowを起動するきっかけ。                    | 「注文が入ったら」というトリガー             |
| **Job**      | Workflow内の実行単位。1つ以上のStepで構成。     | レシピの「下ごしらえ」「調理」「盛り付け」   |
| **Step**     | Job内の個別の処理。コマンドまたはActionを実行。 | 「野菜を切る」「炒める」などの手順           |
| **Action**   | 再利用可能な処理の部品。Marketplaceで共有。     | 「皮むき器」「フードプロセッサー」などの道具 |
| **Runner**   | Workflowを実行するサーバー環境。                | 調理場（キッチン）                           |

## ワークフローファイルの構造

ワークフローはリポジトリの `.github/workflows/` ディレクトリにYAMLファイルとして配置する。

### 最小構成のワークフロー

```yaml
# .github/workflows/hello.yml
name: Hello World # ワークフロー名（GitHub UIに表示される）

on: push # トリガー: pushされたら実行

jobs:
  greet: # ジョブID（任意の名前）
    runs-on: ubuntu-latest # 実行環境
    steps:
      - name: Say Hello # ステップ名
        run: echo "Hello, World!" # 実行するコマンド
```

### 詳細な構文解説

```yaml
# ワークフロー名
name: CI Pipeline

# トリガー設定
on:
  push:
    branches: [main, develop] # mainとdevelopへのpush時に実行
    paths:
      - 'src/**' # srcディレクトリ内の変更時のみ
      - '!src/**/*.md' # ただしmdファイルは除外
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]

# 環境変数（ワークフロー全体で使用可能）
env:
  NODE_VERSION: '20'
  CI: true

# ジョブ定義
jobs:
  # 1つ目のジョブ: テスト
  test:
    name: Run Tests # UIに表示されるジョブ名
    runs-on: ubuntu-latest
    timeout-minutes: 10 # タイムアウト設定

    steps:
      # リポジトリのコードをチェックアウト
      - name: Checkout code
        uses: actions/checkout@v4 # 公式Actionを使用

      # Node.jsのセットアップ
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm' # npm依存関係のキャッシュ

      # 依存関係のインストール
      - name: Install dependencies
        run: npm ci # ci はクリーンインストール

      # テスト実行
      - name: Run tests
        run: npm test

  # 2つ目のジョブ: ビルド
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test # testジョブの成功後に実行
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

各セクションの役割をまとめると以下の通り。

| セクション | 役割                              | 必須   |
| ---------- | --------------------------------- | ------ |
| `name`     | ワークフロー名。GitHub UIに表示。 | いいえ |
| `on`       | トリガーイベントの設定。          | はい   |
| `env`      | 環境変数の定義。                  | いいえ |
| `jobs`     | 実行するジョブの定義。            | はい   |
| `runs-on`  | 実行環境（ランナー）の指定。      | はい   |
| `steps`    | ジョブ内の処理手順。              | はい   |
| `uses`     | 外部のActionを利用。              | いいえ |
| `run`      | シェルコマンドを直接実行。        | いいえ |
| `with`     | Actionに渡すパラメータ。          | いいえ |
| `needs`    | 依存するジョブの指定。            | いいえ |

## トリガーイベント

Workflowをいつ実行するかを決める設定。よく使うものを紹介する。

### push / pull_request

最も基本的なトリガー。

```yaml
on:
  push:
    branches:
      - main
      - 'release/**' # release/で始まるブランチ全て
    tags:
      - 'v*' # vで始まるタグ（v1.0.0など）
    paths:
      - 'src/**'
      - 'package.json'
    paths-ignore:
      - '**.md'
      - 'docs/**'

  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened, ready_for_review]
```

### schedule（定期実行）

cron式でスケジュール実行。UTCで指定する点に注意。

```yaml
on:
  schedule:
    # 毎日午前9時（JST）= UTC 0:00 に実行
    - cron: '0 0 * * *'
    # 毎週月曜日の午前9時（JST）に実行
    - cron: '0 0 * * 1'
```

cron式の読み方:

```
┌───────────── 分 (0 - 59)
│ ┌───────────── 時 (0 - 23)
│ │ ┌───────────── 日 (1 - 31)
│ │ │ ┌───────────── 月 (1 - 12)
│ │ │ │ ┌───────────── 曜日 (0 - 6、0=日曜)
│ │ │ │ │
* * * * *
```

### workflow_dispatch（手動実行）

GitHub UIから手動でワークフローを実行できる。入力パラメータも設定可能。

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'デプロイ先環境'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
      dry_run:
        description: 'ドライラン（実際にはデプロイしない）'
        required: false
        type: boolean
        default: false
```

### release（リリース時）

```yaml
on:
  release:
    types: [published] # リリースが公開されたとき
```

### トリガーイベント一覧

| イベント            | 発火タイミング               | 主な用途                 |
| ------------------- | ---------------------------- | ------------------------ |
| `push`              | ブランチへのpush             | CI（テスト、ビルド）     |
| `pull_request`      | PRの作成・更新               | PRのチェック             |
| `schedule`          | cron式で定期実行             | 定期メンテナンス         |
| `workflow_dispatch` | 手動実行                     | オンデマンドデプロイ     |
| `release`           | リリースの作成               | リリースパイプライン     |
| `issues`            | Issueの作成・変更            | Issue自動処理            |
| `workflow_call`     | 他のワークフローから呼び出し | 再利用可能なワークフロー |

## ランナー（Runner）

ランナーはワークフローを実行するサーバー環境のこと。

| ランナー         | OS             | 用途                               |
| ---------------- | -------------- | ---------------------------------- |
| `ubuntu-latest`  | Ubuntu Linux   | 最も一般的。ほとんどの用途に対応。 |
| `ubuntu-22.04`   | Ubuntu 22.04   | 特定バージョンを指定したい場合。   |
| `windows-latest` | Windows Server | Windows固有のビルド・テスト。      |
| `macos-latest`   | macOS          | iOS/macOSアプリのビルド。          |
| `self-hosted`    | 自前サーバー   | 特殊な要件がある場合。             |

料金面で注意が必要。Linux以外は実行時間の消費が大きい。

| ランナー | 1分あたりの消費（無料枠） |
| -------- | ------------------------- |
| Linux    | 1分                       |
| Windows  | 2分                       |
| macOS    | 10分                      |

## よく使うアクション

GitHub Actionsには公式やコミュニティが提供する再利用可能なアクションが数多く存在する。

### actions/checkout

リポジトリのコードを取得する。ほぼ全てのワークフローで使用する。

```yaml
- name: Checkout
  uses: actions/checkout@v4
  with:
    fetch-depth: 0 # 全履歴を取得（デフォルトは1=最新コミットのみ）
    ref: develop # 特定のブランチを指定
```

### actions/setup-node

Node.jsの環境をセットアップする。

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    # node-version-file: '.node-version'  # ファイルからバージョンを読み取り
    cache: 'npm' # 依存関係のキャッシュ有効化
    registry-url: 'https://npm.pkg.github.com' # npm公開時
```

### actions/cache

ビルド時間を短縮するためのキャッシュ機能。

```yaml
- name: Cache node_modules
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### actions/upload-artifact / actions/download-artifact

ジョブ間でファイルを受け渡すために使用する。

```yaml
# ビルド成果物のアップロード
- name: Upload build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/
    retention-days: 7 # 保持日数

# 別のジョブでダウンロード
- name: Download build artifacts
  uses: actions/download-artifact@v4
  with:
    name: build-output
    path: dist/
```

### よく使うアクション一覧

| アクション                           | 用途                          |
| ------------------------------------ | ----------------------------- |
| `actions/checkout@v4`                | リポジトリのチェックアウト    |
| `actions/setup-node@v4`              | Node.js環境のセットアップ     |
| `actions/setup-python@v5`            | Python環境のセットアップ      |
| `actions/cache@v4`                   | 依存関係のキャッシュ          |
| `actions/upload-artifact@v4`         | ビルド成果物のアップロード    |
| `actions/download-artifact@v4`       | ビルド成果物のダウンロード    |
| `actions/github-script@v7`           | JavaScript でGitHub APIを操作 |
| `peter-evans/create-pull-request@v6` | PR自動作成                    |
| `slackapi/slack-github-action@v1`    | Slack通知                     |

## 環境変数とシークレット

### 環境変数

```yaml
# ワークフローレベル
env:
  NODE_ENV: production

jobs:
  build:
    runs-on: ubuntu-latest
    # ジョブレベル
    env:
      DATABASE_URL: localhost:5432
    steps:
      - name: Build
        # ステップレベル
        env:
          API_KEY: ${{ secrets.API_KEY }}
        run: npm run build
```

### デフォルト環境変数

GitHub Actionsが自動で設定する環境変数がある。

| 変数名              | 内容                                     |
| ------------------- | ---------------------------------------- |
| `GITHUB_SHA`        | トリガーしたコミットのSHA                |
| `GITHUB_REF`        | トリガーしたブランチやタグの参照         |
| `GITHUB_REPOSITORY` | リポジトリ名（owner/repo）               |
| `GITHUB_ACTOR`      | ワークフローをトリガーしたユーザー       |
| `GITHUB_RUN_ID`     | ワークフロー実行のユニークID             |
| `GITHUB_RUN_NUMBER` | ワークフロー実行の番号（インクリメント） |
| `RUNNER_OS`         | ランナーのOS名                           |

### シークレット（Secrets）

APIキーやパスワードなどの機密情報は、リポジトリの Settings → Secrets and variables → Actions で登録する。

```yaml
steps:
  - name: Deploy
    env:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    run: aws s3 sync dist/ s3://my-bucket

  - name: Use GITHUB_TOKEN
    env:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }} # 自動生成される
    run: gh pr comment --body "Build succeeded!"
```

`GITHUB_TOKEN`はGitHub Actionsが自動で生成するトークン。リポジトリに対する操作（PR作成、コメント投稿など）に使用できる。

### シークレットの注意点

- ログに出力されると自動でマスク（`***`）される
- フォークからのPRではシークレットにアクセスできない（セキュリティ対策）
- Organization全体で共有するシークレットも設定可能
- Environments（環境）ごとに異なるシークレットを設定可能

## マトリックスビルド

複数のバージョンや環境の組み合わせでテストを実行する仕組み。

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 22]
        # 3 OS x 3 バージョン = 9パターンが並列実行される
      fail-fast: false # 1つ失敗しても残りは継続

    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test
```

### マトリックスの除外と追加

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [18, 20]
    exclude:
      # Windows + Node 18 の組み合わせを除外
      - os: windows-latest
        node-version: 18
    include:
      # 追加の組み合わせ
      - os: ubuntu-latest
        node-version: 22
        experimental: true # カスタム変数も設定可能
```

## キャッシュ

依存関係のキャッシュによりビルド時間を大幅に短縮できる。

### npmのキャッシュ

```yaml
- name: Cache npm dependencies
  uses: actions/cache@v4
  id: npm-cache
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-

- name: Install dependencies
  if: steps.npm-cache.outputs.cache-hit != 'true'
  run: npm ci
```

### setup-nodeの組み込みキャッシュ

`actions/setup-node`にはキャッシュ機能が組み込まれている。上記のように手動でキャッシュを設定する代わりに、以下のように1行で設定できる。

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm' # これだけでnpm依存関係がキャッシュされる
```

### キャッシュの仕組み

| 要素           | 説明                                                |
| -------------- | --------------------------------------------------- |
| `path`         | キャッシュするディレクトリ                          |
| `key`          | キャッシュのキー。一致するキャッシュがあれば復元。  |
| `restore-keys` | keyに完全一致しない場合、前方一致でフォールバック。 |
| `cache-hit`    | キャッシュが見つかったかどうかの出力。              |

キャッシュなしの場合、`npm ci`に毎回30秒以上かかることがある。キャッシュを使うと数秒で完了する。

## 条件分岐

`if`文を使って、条件に応じてステップやジョブの実行を制御できる。

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    # mainブランチへのpush時のみ実行
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to production
        run: npm run deploy

      # 前のステップが失敗しても実行
      - name: Notify on failure
        if: failure()
        run: echo "Deployment failed!"

      # 常に実行（成功・失敗に関わらず）
      - name: Cleanup
        if: always()
        run: npm run cleanup

      # 特定の条件
      - name: Only on tag push
        if: startsWith(github.ref, 'refs/tags/')
        run: echo "This is a tag push"
```

### よく使う条件式

| 条件式                                                    | 意味                                          |
| --------------------------------------------------------- | --------------------------------------------- |
| `success()`                                               | 前のステップが成功した場合（デフォルト）      |
| `failure()`                                               | 前のステップが失敗した場合                    |
| `always()`                                                | 常に実行                                      |
| `cancelled()`                                             | ワークフローがキャンセルされた場合            |
| `github.ref == 'refs/heads/main'`                         | mainブランチの場合                            |
| `github.event_name == 'push'`                             | pushイベントの場合                            |
| `contains(github.event.head_commit.message, '[skip ci]')` | コミットメッセージに`[skip ci]`が含まれる場合 |

## 依存ジョブ（needs）

ジョブ間の実行順序を制御する。デフォルトではジョブは並列実行される。

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test

  # lint と test の両方が成功した後に実行
  build:
    runs-on: ubuntu-latest
    needs: [lint, test] # 並列に実行されるlintとtestの後に実行
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build

  # buildが成功した後に実行
  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: npm run deploy
```

上記の実行フローを図で表すと:

```
lint ─────┐
          ├──→ build ──→ deploy
test ─────┘
（並列実行）    （直列実行）
```

## 自作アクション（Composite Action）

よく使う処理をまとめて再利用可能なアクションとして定義できる。

### ディレクトリ構成

```
.github/
  actions/
    setup-project/
      action.yml
  workflows/
    ci.yml
```

### Composite Actionの定義

```yaml
# .github/actions/setup-project/action.yml
name: 'Setup Project'
description: 'プロジェクトのセットアップ（Node.js + 依存関係インストール）'

inputs:
  node-version:
    description: 'Node.jsのバージョン'
    required: false
    default: '20'

runs:
  using: 'composite'
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'npm'

    - name: Install dependencies
      shell: bash
      run: npm ci

    - name: Show versions
      shell: bash
      run: |
        echo "Node: $(node --version)"
        echo "npm: $(npm --version)"
```

### Composite Actionの使用

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 自作アクションを使用
      - name: Setup
        uses: ./.github/actions/setup-project
        with:
          node-version: '20'

      - run: npm test
```

Composite Actionを使うメリットは、複数のワークフローで共通のセットアップ処理を使い回せること。修正が1箇所で済むようになる。

## 実践例1: Node.jsプロジェクトのCI

実際のプロジェクトで使えるCIパイプラインの完全なコード。

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

# 同じブランチで新しいpushがあったら、前の実行をキャンセル
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ===== リント =====
  lint:
    name: Lint
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting (Prettier)
        run: npx prettier --check .

      - name: Type check
        run: npx tsc --noEmit

  # ===== テスト =====
  test:
    name: Test
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7

  # ===== ビルド =====
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - run: npm ci

      - name: Build
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
          retention-days: 3
```

## 実践例2: 自動デプロイ（Vercelへのデプロイ）

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy:
    name: Deploy Production
    runs-on: ubuntu-latest
    timeout-minutes: 15

    # デプロイ環境の定義（GitHub UIでデプロイ履歴を確認可能）
    environment:
      name: production
      url: ${{ steps.deploy.outputs.url }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel
        id: deploy
        run: |
          url=$(vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }})
          echo "url=$url" >> $GITHUB_OUTPUT

      - name: Comment deploy URL on commit
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.repos.createCommitComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              commit_sha: context.sha,
              body: `Deployed to production: ${{ steps.deploy.outputs.url }}`
            })
```

### AWSへのデプロイ（S3 + CloudFront）

```yaml
# .github/workflows/deploy-aws.yml
name: Deploy to AWS

on:
  push:
    branches: [main]

permissions:
  id-token: write # OIDC認証に必要
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      # OIDC認証でAWSにアクセス（シークレットキー不要）
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions-role # 自分のAWSアカウントIDに置き換える
          aws-region: ap-northeast-1

      - name: Deploy to S3
        run: aws s3 sync dist/ s3://my-bucket --delete

      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

## 実践例3: PRへの自動コメント

PRに自動でコメントを追加するワークフロー。コードレビューの補助やビルド結果の報告に使える。

```yaml
# .github/workflows/pr-comment.yml
name: PR Comment

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  pull-requests: write

jobs:
  comment:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      # バンドルサイズを計測
      - name: Build and measure bundle size
        id: bundle
        run: |
          npm run build
          size=$(du -sh dist/ | cut -f1)
          echo "size=$size" >> $GITHUB_OUTPUT

      # テスト実行とカバレッジ取得
      - name: Run tests with coverage
        id: test
        run: |
          npm test -- --coverage --coverageReporters=text-summary 2>&1 | tee test-output.txt
          coverage=$(grep "Statements" test-output.txt | awk '{print $3}')
          echo "coverage=$coverage" >> $GITHUB_OUTPUT

      # PRにコメント
      - name: Comment on PR
        uses: actions/github-script@v7
        with:
          script: |
            const body = `## Build Report

            | Item | Value |
            | --- | --- |
            | Bundle Size | ${{ steps.bundle.outputs.size }} |
            | Test Coverage | ${{ steps.test.outputs.coverage }} |
            | Node.js | 20 |
            | Status | Passed |

            *Automatically generated by GitHub Actions*`;

            // 既存のコメントを探す
            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });

            const botComment = comments.find(c =>
              c.user.type === 'Bot' && c.body.includes('## Build Report')
            );

            if (botComment) {
              // 既存コメントを更新
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: botComment.id,
                body: body,
              });
            } else {
              // 新規コメントを作成
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: body,
              });
            }
```

## セキュリティベストプラクティス

GitHub Actionsを安全に運用するための重要なポイント。

### 1. サードパーティアクションのバージョン固定

```yaml
# 悪い例: タグの指定（書き換えられる可能性がある）
- uses: actions/checkout@v4

# 良い例: コミットSHAで固定（改ざんを防止）
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
```

Dependabotを設定すると、アクションの更新を自動でPRとして提案してくれる。

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'weekly'
```

### 2. 最小権限の原則

```yaml
# ワークフローレベルで権限を最小化
permissions:
  contents: read # リポジトリの読み取りのみ

jobs:
  deploy:
    permissions:
      contents: read
      deployments: write # デプロイに必要な権限のみ追加
```

### 3. シークレットの安全な取り扱い

```yaml
# 悪い例: シークレットを直接コマンドに渡す（ログに残る可能性）
- run: curl -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" https://api.example.com

# 良い例: 環境変数経由で渡す
- name: Call API
  env:
    API_TOKEN: ${{ secrets.API_TOKEN }}
  run: curl -H "Authorization: Bearer $API_TOKEN" https://api.example.com
```

### 4. フォークからのPRの注意

フォークされたリポジトリからのPRは、シークレットにアクセスできない。これはセキュリティ上の重要な仕様。悪意のあるコードがシークレットを盗むことを防いでいる。

## 料金体系

### 無料枠（2025年時点）

| プラン     | 無料の実行時間（月あたり） | ストレージ |
| ---------- | -------------------------- | ---------- |
| Free       | 2,000分                    | 500MB      |
| Team       | 3,000分                    | 2GB        |
| Enterprise | 50,000分                   | 50GB       |

### 注意点

- パブリックリポジトリは無料（無制限）
- プライベートリポジトリのみ無料枠が適用される
- macOSランナーは1分あたり10分として計算される（高コスト）
- 不要な実行を防ぐために、`paths`フィルタやconcurrencyを活用する

## デバッグ方法

### ランナー診断ログの有効化

リポジトリの Settings → Secrets and variables → Actions で以下のシークレットを追加する。

| シークレット名         | 値     | 効果                       |
| ---------------------- | ------ | -------------------------- |
| `ACTIONS_RUNNER_DEBUG` | `true` | ランナーの詳細ログを有効化 |
| `ACTIONS_STEP_DEBUG`   | `true` | ステップの詳細ログを有効化 |

### ワークフロー内でのデバッグ

```yaml
steps:
  - name: Debug information
    run: |
      echo "Event name: ${{ github.event_name }}"
      echo "Ref: ${{ github.ref }}"
      echo "SHA: ${{ github.sha }}"
      echo "Actor: ${{ github.actor }}"
      echo "Repository: ${{ github.repository }}"

  - name: Debug context
    env:
      GITHUB_CONTEXT: ${{ toJson(github) }}
    run: echo "$GITHUB_CONTEXT"
```

### actを使ったローカルテスト

[act](https://github.com/nektos/act) はGitHub Actionsをローカルで実行できるツール。pushしなくてもワークフローをテストできる。

```bash
# インストール（macOS）
brew install act

# ワークフローを実行
act push

# 特定のジョブを実行
act -j test

# ドライラン（実行せずに内容を確認）
act -n
```

## まとめ

GitHub Actionsの学習ステップ:

1. まずは簡単な「push時にHello Worldを出力する」ワークフローから始める
2. lint、test、buildの基本的なCIパイプラインを構築する
3. キャッシュやマトリックスビルドで最適化する
4. デプロイの自動化に挑戦する
5. セキュリティベストプラクティスを適用する

| 学習段階 | 習得すべき内容                                                   |
| -------- | ---------------------------------------------------------------- |
| 初級     | ワークフローの作成、push/PRトリガー、基本的なステップ            |
| 中級     | キャッシュ、マトリックス、シークレット、アーティファクト         |
| 上級     | Composite Action、OIDC認証、セキュリティ対策、ワークフロー最適化 |

## 参考リンク

- [GitHub Actions公式ドキュメント](https://docs.github.com/ja/actions)
- [GitHub Actions ワークフロー構文](https://docs.github.com/ja/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub Marketplace - Actions](https://github.com/marketplace?type=actions)
- [act - ローカルでGitHub Actionsを実行](https://github.com/nektos/act)
- [GitHub Actions セキュリティガイド](https://docs.github.com/ja/actions/security-guides/security-hardening-for-github-actions)
