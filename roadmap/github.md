---
title: 'GitHub'
order: 13
section: 'バージョン管理'
---

# GitHub

## GitHubとは

GitHubは、Gitリポジトリの**ホスティングサービス**であり、世界最大の**ソフトウェア開発プラットフォーム**。2008年に設立され、2018年にMicrosoftが買収した。2024年時点で1億人以上の開発者が利用している。

「ホスティングサービス」とは、Gitリポジトリ（コードと変更履歴）をインターネット上に保管し、どこからでもアクセスできるようにするサービスのこと。ただしGitHubはそれだけでなく、Pull Request、Issue、Actions、Pagesなど、ソフトウェア開発に必要な機能を統合的に提供している。

たとえるなら、Gitが「ファイルの変更を記録するためのノート」だとすると、GitHubは「そのノートを保管し、チームで共有し、レビューし、自動テストまで行える大きなオフィス」のようなもの。

---

## GitとGitHubの違い

「Git」と「GitHub」は名前が似ているが、全く別のもの。混同しやすいので表で整理する。

| 比較項目       | Git                                    | GitHub                                         |
| -------------- | -------------------------------------- | ---------------------------------------------- |
| 種類           | ソフトウェア（バージョン管理システム） | Webサービス（開発プラットフォーム）            |
| 開発者         | Linus Torvalds                         | Chris Wanstrath, Tom Preston-Werner他          |
| 動作場所       | ローカルPC                             | インターネット上（クラウド）                   |
| 費用           | 無料（オープンソース）                 | 無料プランあり（有料プランも）                 |
| 主な機能       | 変更履歴の管理                         | リポジトリのホスティング、PR、Issue、Actions等 |
| 代替品         | Mercurial, SVN                         | GitLab, Bitbucket, Azure DevOps                |
| インターネット | 不要（オフラインで使える）             | 必要                                           |
| GUI            | なし（CLIが基本）                      | Webブラウザでの操作                            |

**ポイント**: GitなしでGitHubは使えないが、GitHubなしでGitは使える。GitはローカルPCで動くツール、GitHubはそれをチームで共有するためのサービス。

---

## アカウント作成とSSH鍵/HTTPS設定

### アカウント作成

1. https://github.com にアクセス
2. メールアドレス、パスワード、ユーザー名を入力
3. メール認証を完了

ユーザー名は後から変更できるが、URLにも使われるため慎重に決めよう。実名またはハンドルネームで、覚えやすく入力しやすいものが良い。

### 認証方法の選択

GitHubとの接続にはHTTPSとSSHの2つの方法がある。

| 方式  | 設定の手間 | セキュリティ                | URL形式                            |
| ----- | ---------- | --------------------------- | ---------------------------------- |
| HTTPS | 低い       | Personal Access Tokenが必要 | `https://github.com/user/repo.git` |
| SSH   | やや高い   | 公開鍵暗号方式で安全        | `git@github.com:user/repo.git`     |

### HTTPS接続の設定

2021年8月以降、パスワード認証は廃止され、**Personal Access Token（PAT）**が必要になった。

**PATの作成手順:**

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new tokenをクリック
3. Note（メモ）を入力、有効期限を設定
4. スコープは最低限`repo`にチェック
5. Generate tokenでトークンを生成
6. 表示されたトークンをコピー（**この画面を閉じると二度と表示されない**）

```bash
# clone時にユーザー名とPATを入力
git clone https://github.com/username/repository.git
# Username: username
# Password: ghp_xxxxxxxxxxxxxxxxxxxx（PATを貼り付け）
```

### SSH接続の設定（推奨）

SSH鍵を使う方法。一度設定すれば毎回認証情報を入力する必要がない。

**手順1: SSH鍵の生成**

```bash
# ED25519アルゴリズムで鍵を生成（推奨）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 保存場所を聞かれるのでEnter（デフォルトの~/.ssh/id_ed25519）
# パスフレーズを設定（推奨）
```

**手順2: ssh-agentに鍵を登録**

```bash
# ssh-agentを起動
eval "$(ssh-agent -s)"

# 鍵を登録
ssh-add ~/.ssh/id_ed25519
```

**手順3: 公開鍵をGitHubに登録**

```bash
# 公開鍵の内容をコピー
# macOS
pbcopy < ~/.ssh/id_ed25519.pub
# Linux
cat ~/.ssh/id_ed25519.pub
# 表示された内容をコピー
```

1. GitHub → Settings → SSH and GPG keys → New SSH key
2. Titleに分かりやすい名前（例: "My MacBook"）を入力
3. Key欄にコピーした公開鍵を貼り付け
4. Add SSH keyで保存

**手順4: 接続テスト**

```bash
ssh -T git@github.com
# Hi username! You've successfully authenticated, but GitHub does not provide shell access.
# ↑ このメッセージが出れば成功
```

**SSH設定ファイル（~/.ssh/config）の作成（推奨）:**

```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  AddKeysToAgent yes
```

---

## リポジトリの作成

### GitHubでの新規リポジトリ作成

1. GitHubの右上の「+」→ New repositoryをクリック
2. 以下の情報を入力:

| 項目              | 説明                            |
| ----------------- | ------------------------------- |
| Repository name   | リポジトリ名（URLの一部になる） |
| Description       | リポジトリの説明（任意）        |
| Public / Private  | 公開/非公開の選択               |
| Add a README file | README.mdを自動生成するか       |
| Add .gitignore    | .gitignoreテンプレートの選択    |
| Choose a license  | ライセンスの選択                |

### Public vs Private

| 種類    | 見える人         | 用途                                       |
| ------- | ---------------- | ------------------------------------------ |
| Public  | 誰でも           | OSSプロジェクト、ポートフォリオ、学習記録  |
| Private | 招待された人のみ | 業務プロジェクト、個人の非公開プロジェクト |

無料プランでもPrivateリポジトリは無制限に作成できる。

### README.md

リポジトリのトップページに表示されるドキュメント。プロジェクトの説明書のようなもの。作成時に「Add a README file」にチェックを入れると自動生成される。

### .gitignore

リポジトリ作成時に言語やフレームワークを選択すると、適切なテンプレートが自動的に適用される。Node、Python、Java、Rubyなど多くの選択肢がある。

### ライセンス

OSSとして公開する場合、ライセンスの選択が重要。よく使われるライセンス:

| ライセンス         | 特徴                         | 使う場面                |
| ------------------ | ---------------------------- | ----------------------- |
| MIT License        | 最もシンプルで寛容           | 自由に使ってほしいとき  |
| Apache License 2.0 | 特許に関する条項あり         | 企業での利用を想定      |
| GPL v3             | 派生物も同じライセンスが必要 | OSSとして維持したいとき |

迷ったらMIT Licenseが無難。業務プロジェクトの場合はライセンスなし（All Rights Reserved）でよい。

### ローカルからリポジトリを作成する場合

```bash
# ローカルでプロジェクトを初期化
mkdir my-project && cd my-project
git init
echo "# My Project" > README.md
git add README.md
git commit -m "initial commit"

# GitHubで空のリポジトリを作成後、リモートを追加
git remote add origin git@github.com:username/my-project.git
git branch -M main
git push -u origin main
```

---

## リモートリポジトリとの連携

### リモートの確認と設定

```bash
# リモートリポジトリの一覧を表示
git remote -v
# origin  git@github.com:username/repo.git (fetch)
# origin  git@github.com:username/repo.git (push)

# リモートを追加
git remote add origin git@github.com:username/repo.git

# リモートのURLを変更
git remote set-url origin git@github.com:username/new-repo.git

# リモートを削除
git remote remove origin

# リモートの詳細情報を表示
git remote show origin
```

### 基本的なワークフロー

```bash
# 1. リモートの最新を取得
git fetch origin

# 2. リモートの変更をローカルに統合
git pull origin main

# 3. ローカルで作業してコミット
git add .
git commit -m "feat: 新機能実装"

# 4. リモートにプッシュ
git push origin main
```

### push（ローカル → リモート）

```bash
# 現在のブランチをリモートにプッシュ
git push

# 初めてプッシュするブランチ（上流ブランチを設定）
git push -u origin feature/login
# -u は --set-upstream の短縮形
# 以降は git push だけでOK

# 全てのブランチをプッシュ
git push --all origin

# タグもプッシュ
git push --tags
```

### pull（リモート → ローカル）

```bash
# リモートの変更を取得してマージ
git pull

# 特定のリモートブランチからpull
git pull origin main

# リベースモードでpull（マージコミットを作らない）
git pull --rebase origin main
```

### fetch（リモートの変更を確認だけする）

```bash
# リモートの変更をダウンロード（ローカルのコードは変わらない）
git fetch origin

# リモートとの差分を確認
git diff main origin/main

# 問題なければマージ
git merge origin/main
```

`fetch` → 確認 → `merge`の流れは、`pull`よりも安全。

---

## Pull Request（PR）

### Pull Requestとは

Pull Request（プルリクエスト、通称PR）は、GitHubの最も重要な機能の1つ。「自分のブランチの変更をmainブランチにマージしてほしい」という**リクエスト（お願い）**。

PRを通じて:

- コードレビューを受けられる
- 変更の差分が見やすく表示される
- コメントでディスカッションできる
- CI/CD（自動テスト）を実行できる
- マージ前の最終確認ができる

### PRの作成手順

**手順1: フィーチャーブランチで作業する**

```bash
# mainブランチから新しいブランチを作成
git switch main
git pull origin main
git switch -c feature/login

# 作業してコミット
git add .
git commit -m "feat: ログインフォームを実装"
git commit -m "feat: ログインバリデーションを追加"

# リモートにプッシュ
git push -u origin feature/login
```

**手順2: GitHubでPRを作成する**

1. GitHubリポジトリページに「Compare & pull request」ボタンが表示される
2. または、Pull requestsタブ → New pull requestをクリック
3. base（マージ先）とcompare（マージ元）のブランチを選択
4. タイトルと説明を入力
5. Reviewers（レビュアー）を指定
6. Create pull requestをクリック

**PRの説明に含めるべき内容:**

```markdown
## 概要

ログイン機能を実装した。

## 変更内容

- ログインフォームのUIを実装
- メールアドレスとパスワードのバリデーションを追加
- ログインAPIとの連携を実装

## テスト方法

1. /loginにアクセスする
2. メールアドレスとパスワードを入力してログインボタンを押す
3. 正しい認証情報でログインできることを確認する
4. 不正な認証情報でエラーメッセージが表示されることを確認する

## スクリーンショット

（該当する場合はUIの画面キャプチャを貼る）

## 関連Issue

Closes #42
```

### レビューのフロー

```
1. PR作成者がPRを作成
   ↓
2. レビュアーがコードを確認
   ↓
3. コメントや修正リクエストを出す
   ├── Approve（承認）→ マージ可能
   ├── Request changes（修正要求）→ 修正が必要
   └── Comment（コメント）→ 意見だけ
   ↓
4. PR作成者が修正を反映（必要な場合）
   ↓
5. 再レビュー → Approve
   ↓
6. マージ
```

### マージ方式の違い

PRをマージする際、3つの方式を選択できる。

| 方式                  | 説明                            | 履歴                         | 適した場面                               |
| --------------------- | ------------------------------- | ---------------------------- | ---------------------------------------- |
| Create a merge commit | マージコミットを作成            | ブランチの履歴がそのまま残る | デフォルト。ブランチの経緯を残したい場合 |
| Squash and merge      | 全コミットを1つにまとめてマージ | PRが1コミットになる          | 細かいコミットを整理したい場合（推奨）   |
| Rebase and merge      | コミットをmainの先端に付け替え  | 一直線の履歴になる           | 履歴を綺麗に保ちたい場合                 |

```
元のブランチ:
  main:     A --- B
                   \
  feature:          C --- D --- E

Merge commit:
  main:     A --- B --------- M
                   \         /
  feature:          C --- D --- E

Squash and merge:
  main:     A --- B --- CDE    ← C,D,Eが1つのコミットに

Rebase and merge:
  main:     A --- B --- C' --- D' --- E'
```

実務では**Squash and merge**を採用しているチームが多い。PRごとに1コミットになるため、mainの履歴が綺麗になる。

### PRのベストプラクティス

| 項目           | 推奨                                               |
| -------------- | -------------------------------------------------- |
| PRのサイズ     | 小さく保つ（300行以内が理想）                      |
| タイトル       | 変更内容を簡潔に（例: "feat: ログイン機能を実装"） |
| 説明           | 背景、変更内容、テスト方法を記載                   |
| レビュアー     | 1-2人を指定                                        |
| セルフレビュー | PR作成後、まず自分で差分を確認                     |
| ドラフトPR     | 作業途中でもフィードバックが欲しい場合に活用       |

---

## Issue

### Issueとは

Issueは、バグ報告、機能要望、タスクなどを管理するためのチケットシステム。プロジェクトの「やること」を一元管理できる。

### Issueの基本的な使い方

**バグ報告のIssue例:**

```markdown
## バグの概要

ログインページでメールアドレス欄が空のまま送信するとアプリがクラッシュする。

## 再現手順

1. /loginにアクセスする
2. メールアドレス欄を空にする
3. パスワードを入力する
4. ログインボタンを押す
5. → 画面が白くなり、コンソールにTypeErrorが表示される

## 期待する動作

「メールアドレスを入力してください」というエラーメッセージが表示される。

## 環境

- OS: macOS 14.2
- ブラウザ: Chrome 120
- アプリバージョン: v1.2.0

## スクリーンショット

（エラー画面のスクリーンショット）
```

**機能要望のIssue例:**

```markdown
## 概要

ダークモードに対応してほしい。

## 背景・理由

夜間に使用する際、画面が明るすぎて目が疲れる。

## 提案する仕様

- ヘッダーにダークモード切り替えトグルを追加
- OS設定に連動するオプション
- 選択した設定はローカルストレージに保存

## 参考

- https://tailwindcss.com/docs/dark-mode
```

### Issueテンプレート

リポジトリに`.github/ISSUE_TEMPLATE/`ディレクトリを作成し、テンプレートを配置すると、Issue作成時にテンプレートを選択できるようになる。

```yaml
# .github/ISSUE_TEMPLATE/bug_report.yml
name: バグ報告
description: バグを報告する
title: '[Bug]: '
labels: ['bug']
body:
  - type: textarea
    id: description
    attributes:
      label: バグの概要
      description: 何が起きているか説明してください
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: 再現手順
      description: バグを再現する手順を記載してください
      value: |
        1.
        2.
        3.
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: 期待する動作
    validations:
      required: true
```

### ラベル

Issueにラベル（タグ）を付けて分類できる。デフォルトで用意されているラベル:

| ラベル           | 色     | 用途                     |
| ---------------- | ------ | ------------------------ |
| bug              | 赤     | バグ報告                 |
| enhancement      | 青     | 機能改善・新機能         |
| documentation    | 緑     | ドキュメントに関する変更 |
| good first issue | 紫     | 初心者向けのIssue        |
| help wanted      | 黄     | 助けが必要               |
| duplicate        | グレー | 重複Issue                |
| wontfix          | 白     | 対応しないIssue          |

カスタムラベルも自由に作成できる。

### マイルストーン

マイルストーンはリリースや期限に紐づくIssueのグループ。例えば「v2.0.0リリース」というマイルストーンを作り、そこに関連するIssueを紐づけることで、リリースまでの進捗を管理できる。

### IssueとPRの連携

コミットメッセージやPRの説明に特定のキーワードとIssue番号を含めると、PRのマージ時にIssueが自動的にクローズされる。

```
# 以下のキーワードが使える
Closes #42
Fixes #42
Resolves #42

# PR説明の例
## 概要
ログインフォームのバリデーションを修正した。

Fixes #42
```

---

## GitHub CLI（ghコマンド）

### GitHub CLIとは

GitHubの操作をコマンドラインから行えるツール。ブラウザを開かずにPRの作成やIssueの管理ができる。

### インストール

```bash
# macOS
brew install gh

# Windows
winget install --id GitHub.cli

# Linux (Debian/Ubuntu)
sudo apt install gh
```

### 認証

```bash
# GitHubにログイン
gh auth login
# ブラウザが開くので認証を完了する

# 認証状態の確認
gh auth status
```

### PR関連のコマンド

```bash
# PRを作成
gh pr create --title "feat: ログイン機能を実装" --body "ログイン画面のUIとバリデーションを実装しました"

# 対話形式でPRを作成
gh pr create

# PRの一覧を表示
gh pr list

# 特定のPRの詳細を表示
gh pr view 42

# PRをブラウザで開く
gh pr view 42 --web

# PRをチェックアウト（レビュー時に便利）
gh pr checkout 42

# PRのレビューステータスを確認
gh pr checks 42

# PRをマージ
gh pr merge 42

# Squash mergeでマージ
gh pr merge 42 --squash

# ドラフトPRを作成
gh pr create --draft
```

### Issue関連のコマンド

```bash
# Issueを作成
gh issue create --title "バグ: ログイン時にクラッシュ" --body "詳細な説明"

# 対話形式でIssueを作成
gh issue create

# Issueの一覧を表示
gh issue list

# 特定のラベルでフィルタリング
gh issue list --label "bug"

# Issueの詳細を表示
gh issue view 42

# Issueをクローズ
gh issue close 42

# Issueにコメントを追加
gh issue comment 42 --body "対応中です"
```

### その他の便利なコマンド

```bash
# リポジトリをブラウザで開く
gh repo view --web

# リポジトリをクローン
gh repo clone username/repository

# リポジトリを作成
gh repo create my-new-repo --public

# ワークフローの実行状況を確認
gh run list

# 特定のワークフローの詳細
gh run view 12345
```

---

## GitHub Actions

### GitHub Actionsとは

GitHub Actionsは、GitHub上でCI/CD（継続的インテグレーション/継続的デリバリー）を実行するための機能。コードのプッシュやPR作成などのイベントをトリガーに、テスト実行、ビルド、デプロイなどを自動化できる。

CI/CDとは:

- **CI（Continuous Integration）**: コードの変更を頻繁に統合し、自動テストで品質を担保すること
- **CD（Continuous Delivery/Deployment）**: テストに通ったコードを自動的にデプロイ（本番環境へ反映）すること

### ワークフローファイルの構造

GitHub Actionsの設定はYAMLファイルで記述する。`.github/workflows/`ディレクトリに配置する。

```yaml
# .github/workflows/ci.yml
name: CI # ワークフロー名

on: # トリガー（いつ実行するか）
  push:
    branches: [main] # mainへのプッシュ時
  pull_request:
    branches: [main] # mainへのPR時

jobs: # ジョブの定義
  test: # ジョブ名
    runs-on: ubuntu-latest # 実行環境

    steps: # ステップ（実行する処理）
      - name: チェックアウト
        uses: actions/checkout@v4

      - name: Node.jsのセットアップ
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: 依存パッケージのインストール
        run: npm ci

      - name: リントの実行
        run: npm run lint

      - name: テストの実行
        run: npm test

      - name: ビルドの実行
        run: npm run build
```

### ワークフローの構成要素

| 要素      | 説明                                                            |
| --------- | --------------------------------------------------------------- |
| `name`    | ワークフローの名前（GitHub上で表示される）                      |
| `on`      | トリガー（push, pull_request, schedule, workflow_dispatchなど） |
| `jobs`    | 実行するジョブの定義（並列実行可能）                            |
| `runs-on` | 実行環境（ubuntu-latest, windows-latest, macos-latest）         |
| `steps`   | ジョブ内の各処理ステップ                                        |
| `uses`    | 再利用可能なアクション（他の人が作ったもの）                    |
| `run`     | シェルコマンドの実行                                            |
| `with`    | アクションへのパラメータ                                        |
| `env`     | 環境変数の設定                                                  |

### よく使うトリガー

```yaml
on:
  # プッシュ時
  push:
    branches: [main, develop]
    paths:
      - 'src/**' # srcディレクトリの変更時のみ

  # PR時
  pull_request:
    branches: [main]

  # スケジュール実行（cron形式）
  schedule:
    - cron: '0 9 * * 1' # 毎週月曜9時（UTC）

  # 手動実行
  workflow_dispatch:

  # リリース時
  release:
    types: [published]
```

### よく使うアクション

| アクション                   | 用途                               |
| ---------------------------- | ---------------------------------- |
| `actions/checkout@v4`        | リポジトリのコードをチェックアウト |
| `actions/setup-node@v4`      | Node.jsのセットアップ              |
| `actions/setup-python@v5`    | Pythonのセットアップ               |
| `actions/cache@v4`           | 依存パッケージのキャッシュ         |
| `actions/upload-artifact@v4` | ビルド成果物のアップロード         |

### 実践的なワークフロー例: テスト + デプロイ

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test # testジョブが成功した後に実行
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: デプロイ
        run: |
          # デプロイコマンド
          echo "Deploying to production..."
```

### シークレットの管理

APIキーやトークンなどの秘密情報はGitHub Secretsで管理する。

1. リポジトリ → Settings → Secrets and variables → Actions
2. New repository secretで追加
3. ワークフロー内で`${{ secrets.SECRET_NAME }}`で参照

```yaml
steps:
  - name: デプロイ
    env:
      API_KEY: ${{ secrets.API_KEY }}
    run: |
      curl -H "Authorization: Bearer $API_KEY" https://api.example.com/deploy
```

---

## GitHub Pages

### GitHub Pagesとは

リポジトリのコードから**静的なWebサイト**を無料でホスティングできる機能。ポートフォリオ、技術ブログ、プロジェクトのドキュメントサイトなどに最適。

### 公開方法

**方法1: リポジトリの設定から（最もシンプル）**

1. リポジトリ → Settings → Pages
2. Source: "Deploy from a branch"を選択
3. Branch: `main`を選択、ディレクトリは`/ (root)`または`/docs`
4. Saveをクリック

数分後に`https://username.github.io/repository-name/`でサイトが公開される。

**方法2: GitHub Actionsでデプロイ**

```yaml
# .github/workflows/pages.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - id: deployment
        uses: actions/deploy-pages@v4
```

### ユーザーサイトとプロジェクトサイト

| 種類               | リポジトリ名         | URL                                     |
| ------------------ | -------------------- | --------------------------------------- |
| ユーザーサイト     | `username.github.io` | `https://username.github.io/`           |
| プロジェクトサイト | 任意の名前           | `https://username.github.io/repo-name/` |

ユーザーサイトは1アカウントにつき1つだけ作成できる。ポートフォリオサイトとして使うのが一般的。

### カスタムドメイン

独自ドメインを設定することもできる。

1. ドメインのDNS設定でCNAMEレコードを追加: `username.github.io`
2. リポジトリのSettings → Pages → Custom domainにドメインを入力
3. Enforce HTTPSにチェック

---

## フォーク（Fork）とコントリビューション

### フォークとは

他人のリポジトリを自分のアカウントにコピーすること。OSSにコントリビュート（貢献）する際の基本的な手順で使う。

**クローンとフォークの違い:**

| 操作  | 場所                                    | 用途                                       |
| ----- | --------------------------------------- | ------------------------------------------ |
| Clone | リモート → ローカル                     | 自分のリポジトリをローカルに持ってくる     |
| Fork  | リモート → リモート（自分のアカウント） | 他人のリポジトリを自分のアカウントにコピー |

### OSSへのコントリビューション手順

```
1. Fork: 元リポジトリを自分のアカウントにフォーク
   ↓
2. Clone: フォークしたリポジトリをローカルにクローン
   ↓
3. Branch: フィーチャーブランチを作成
   ↓
4. Commit: 変更を加えてコミット
   ↓
5. Push: 自分のフォークにプッシュ
   ↓
6. Pull Request: 元リポジトリにPRを送る
```

```bash
# 1. フォーク（GitHub上でForkボタンをクリック）

# 2. フォークしたリポジトリをクローン
git clone git@github.com:your-username/original-repo.git
cd original-repo

# 3. 元リポジトリをupstreamとして追加
git remote add upstream git@github.com:original-owner/original-repo.git

# 4. 最新の変更を取得
git fetch upstream
git merge upstream/main

# 5. フィーチャーブランチを作成
git switch -c fix/typo-in-readme

# 6. 変更を加えてコミット
git add .
git commit -m "fix: READMEのタイポを修正"

# 7. 自分のフォークにプッシュ
git push origin fix/typo-in-readme

# 8. GitHub上で元リポジトリに対してPRを作成
```

### upstreamの同期

フォーク元の最新の変更を自分のフォークに反映する方法:

```bash
# upstreamの最新を取得
git fetch upstream

# mainブランチに切り替え
git switch main

# upstreamのmainをマージ
git merge upstream/main

# 自分のフォークにプッシュ
git push origin main
```

---

## Branch Protection Rules

### ブランチ保護とは

mainブランチなどの重要なブランチに対して、直接プッシュや不正なマージを防ぐルールを設定できる。

### 設定方法

1. リポジトリ → Settings → Branches → Branch protection rules
2. Add ruleをクリック
3. Branch name patternに`main`を入力
4. 必要なルールにチェックを入れる

### 主な保護ルール

| ルール                                     | 説明                                       | 推奨             |
| ------------------------------------------ | ------------------------------------------ | ---------------- |
| Require a pull request before merging      | PRなしで直接プッシュを禁止                 | はい             |
| Require approvals                          | 指定人数のレビュー承認が必要               | はい（1人以上）  |
| Dismiss stale pull request approvals       | 新しいコミットが追加されたら承認を取り消す | はい             |
| Require status checks to pass              | CI/CDが成功していないとマージできない      | はい             |
| Require branches to be up to date          | マージ前にブランチが最新であることを要求   | 任意             |
| Include administrators                     | 管理者にもルールを適用                     | 推奨             |
| Restrict who can push to matching branches | プッシュできる人を制限                     | 大規模チーム向け |

### 推奨設定（チーム開発の場合）

```
main ブランチの保護設定:
  [x] Require a pull request before merging
      [x] Require approvals: 1
      [x] Dismiss stale pull request approvals when new commits are pushed
  [x] Require status checks to pass before merging
      [x] Require branches to be up to date before merging
      検索してCIのジョブ名を追加: "test", "lint"
  [x] Include administrators
```

---

## GitHub Projects

### GitHub Projectsとは

GitHubに組み込まれたプロジェクト管理ツール。IssueやPRをカード形式で管理し、カンバンボードやテーブルビューで進捗を可視化できる。

### ビューの種類

| ビュー                  | 説明                 | 適した用途                   |
| ----------------------- | -------------------- | ---------------------------- |
| Board（ボード）         | カンバン形式のカード | タスクの進捗管理             |
| Table（テーブル）       | スプレッドシート形式 | データの一覧・フィルタリング |
| Roadmap（ロードマップ） | ガントチャート形式   | スケジュール管理             |

### カンバンボードの例

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Backlog    │  │  In Progress │  │   Review     │  │    Done      │
│              │  │              │  │              │  │              │
│ #15 ダーク   │  │ #12 ログイン │  │ #10 ユーザー │  │ #8 初期設定  │
│ モード対応   │  │ 機能実装     │  │ 登録機能     │  │              │
│              │  │              │  │              │  │ #9 DB設計    │
│ #16 通知機能 │  │ #14 API設計  │  │              │  │              │
│              │  │              │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

### プロジェクトの作成

1. GitHubのプロフィール → Projects → New project
2. テンプレートを選択（Board, Table, Roadmapなど）
3. プロジェクト名を入力
4. Issueを追加していく

### カスタムフィールド

デフォルトのStatus以外にも、カスタムフィールドを追加できる:

- **Priority**（優先度）: High, Medium, Low
- **Sprint**（スプリント）: Sprint 1, Sprint 2
- **Estimate**（見積もり）: 1, 2, 3, 5, 8（ストーリーポイント）
- **Assignee**（担当者）

### Automations（自動化）

| 自動化ルール          | 動作                                     |
| --------------------- | ---------------------------------------- |
| Item added to project | 自動的にStatusを"Backlog"に設定          |
| Item closed           | 自動的にStatusを"Done"に移動             |
| Pull request merged   | 自動的にStatusを"Done"に移動             |
| Code review approved  | 自動的にStatusを"Review"から"Done"に移動 |

---

## Codespaces

### Codespacesとは

GitHub上でブラウザベースの開発環境（VS Code）を起動できるサービス。環境構築なしで、リポジトリのコードをすぐに編集・実行できる。

### メリット

| メリット             | 説明                                 |
| -------------------- | ------------------------------------ |
| 環境構築不要         | ブラウザだけで開発を始められる       |
| 統一環境             | チーム全員が同じ開発環境を使える     |
| どこからでもアクセス | インターネットがあればどのPCからでも |
| 高スペック           | ローカルPCのスペックに依存しない     |

### 使い方

1. リポジトリページの「Code」ボタン → Codespaces タブ
2. 「Create codespace on main」をクリック
3. ブラウザ上でVS Codeが起動する

### devcontainer.jsonによるカスタマイズ

`.devcontainer/devcontainer.json`で開発環境を定義できる:

```json
{
  "name": "Node.js Development",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/git:1": {}
  },
  "postCreateCommand": "npm install",
  "customizations": {
    "vscode": {
      "extensions": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode"]
    }
  },
  "forwardPorts": [3000]
}
```

### 料金

| プラン | 無料枠                                 |
| ------ | -------------------------------------- |
| Free   | 月120コアアワー（2コアマシンで60時間） |
| Pro    | 月180コアアワー                        |

無料プランでも十分な量の利用が可能。

---

## セキュリティ機能

### Dependabot

依存パッケージの脆弱性を自動的に検出し、修正PRを作成してくれる機能。

**Dependabot Alerts**: 脆弱性のあるパッケージが検出されると通知される。

**Dependabot Security Updates**: 脆弱性を修正するバージョンへのアップデートPRを自動作成。

**Dependabot Version Updates**: セキュリティに関わらず、依存パッケージを最新版に保つPRを自動作成。

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
    labels:
      - 'dependencies'
    reviewers:
      - 'username'
```

### Secret Scanning

リポジトリ内にAPIキー、トークン、パスワードなどの秘密情報がコミットされていないかをスキャンする機能。

検出対象の例:

- AWS Access Key
- GitHub Personal Access Token
- Slack Token
- Google Cloud API Key
- その他多数のサービスのトークン

誤って秘密情報をコミットしてしまった場合、GitHubが自動的に検出して通知してくれる。一部のサービス（GitHub、AWSなど）では、検出されたトークンを自動で無効化してくれる。

### Code Scanning

コードの脆弱性をスキャンする機能。CodeQL（GitHubが開発したセマンティックコード解析エンジン）を使用する。

```yaml
# .github/workflows/codeql.yml
name: 'CodeQL'

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 1' # 毎週月曜日に実行

jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    strategy:
      matrix:
        language: ['javascript']
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
      - uses: github/codeql-action/analyze@v3
```

### セキュリティ機能のまとめ

| 機能                        | 対象                   | 自動化             |
| --------------------------- | ---------------------- | ------------------ |
| Dependabot Alerts           | 依存パッケージの脆弱性 | 検出は自動         |
| Dependabot Security Updates | 脆弱性の修正           | 修正PRを自動作成   |
| Dependabot Version Updates  | パッケージの更新       | 更新PRを自動作成   |
| Secret Scanning             | コード内の秘密情報     | 検出・通知は自動   |
| Code Scanning               | コードの脆弱性         | CodeQLの設定が必要 |

---

## README.mdの書き方

### 良いREADMEの構成

READMEはリポジトリの「顔」。初めてリポジトリを訪れた人が最初に読むドキュメントであり、プロジェクトの第一印象を決める。

### 推奨する構成

```markdown
# プロジェクト名

プロジェクトの簡潔な説明（1-2文）。

## 特徴

- 特徴1
- 特徴2
- 特徴3

## デモ

スクリーンショットやGIF、デモサイトのリンク。

## 必要条件

- Node.js 20以上
- npm 10以上

## インストール

プロジェクトのセットアップ手順をコマンド付きで記載。

## 使い方

基本的な使い方をコード例付きで記載。

## 開発

開発環境のセットアップ手順を記載。

## テスト

テストの実行方法を記載。

## 技術スタック

使用している技術の一覧。

## コントリビューション

コントリビューションの方法を記載。

## ライセンス

ライセンス情報。
```

### 実践的なREADME例

```markdown
# TaskManager

シンプルで高機能なタスク管理アプリケーション。

## 特徴

- ドラッグ&ドロップでタスクの順序変更
- カテゴリ別のフィルタリング
- 期限通知機能
- レスポンシブデザイン

## デモ

https://taskmanager-demo.example.com

## 必要条件

- Node.js 20以上
- PostgreSQL 15以上

## セットアップ

リポジトリをクローンして依存パッケージをインストール:

    git clone git@github.com:username/taskmanager.git
    cd taskmanager
    npm install

環境変数を設定:

    cp .env.example .env

開発サーバーを起動:

    npm run dev

http://localhost:3000 でアクセスできる。

## テスト

    npm test

## 技術スタック

| カテゴリ       | 技術                            |
| -------------- | ------------------------------- |
| フロントエンド | React, TypeScript, Tailwind CSS |
| バックエンド   | Node.js, Express                |
| データベース   | PostgreSQL                      |
| テスト         | Vitest, Playwright              |
| CI/CD          | GitHub Actions                  |

## ライセンス

MIT License
```

### バッジの活用

READMEの冒頭にバッジ（ステータスアイコン）を配置することで、プロジェクトの状態を一目で伝えられる。

```markdown
![CI](https://github.com/username/repo/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/github/license/username/repo)
![npm version](https://img.shields.io/npm/v/package-name)
```

---

## コードレビューのベストプラクティス

### レビュアー（レビューする側）のベストプラクティス

| 項目             | 説明                                                         |
| ---------------- | ------------------------------------------------------------ |
| 目的を理解する   | PRの説明をまず読み、変更の目的を理解する                     |
| 全体像を把握する | 変更ファイル一覧を確認し、全体の影響範囲を把握する           |
| 建設的なコメント | 「ここがダメ」ではなく「こうするともっと良くなる」と提案する |
| 質問形式         | 分からない点は「なぜこうしたのですか？」と質問する           |
| 良い点も伝える   | 良いコードには「このアプローチは素晴らしい」と伝える         |
| 重要度を明示する | [must] 必ず修正、[nit] 細かい指摘、[question] 質問と分ける   |
| 迅速に対応する   | PRが放置されないよう、24時間以内にレビューを開始する         |

### レビューコメントの例

```
# 良いコメントの例
[must] この部分でSQLインジェクションの可能性があります。
プレースホルダーを使うことを推奨します。

[nit] 変数名を`d`から`duration`に変更するとより読みやすくなります。

[question] ここでキャッシュを使っている理由を教えてください。
パフォーマンスの問題がありましたか？

素晴らしいリファクタリングです。可読性が大幅に向上しています。

# 悪いコメントの例
これは間違っている。
なぜこんな書き方をするのか。
自分ならこうは書かない。
```

### レビューイ（レビューされる側）のベストプラクティス

| 項目               | 説明                                            |
| ------------------ | ----------------------------------------------- |
| PRを小さく保つ     | 300行以内が理想。大きいPRはレビューの質が下がる |
| セルフレビューする | PR作成後、まず自分で差分を確認する              |
| 説明を丁寧に書く   | 変更の背景、理由、テスト方法を記載する          |
| 感謝の気持ち       | フィードバックに感謝する                        |
| 素早く対応する     | 修正要求があったら早めに対応する                |

### レビューチェックリスト

レビュー時に確認すべきポイント:

| カテゴリ       | チェック項目                                                   |
| -------------- | -------------------------------------------------------------- |
| 機能           | 要件を満たしているか                                           |
| バグ           | エッジケース（空文字、null、大量データなど）は考慮されているか |
| セキュリティ   | SQLインジェクション、XSS、秘密情報の露出はないか               |
| パフォーマンス | N+1問題、不要なループ、メモリリークはないか                    |
| 可読性         | 変数名・関数名は適切か、コメントは必要十分か                   |
| テスト         | テストは十分か、エッジケースのテストはあるか                   |
| 設計           | 既存のアーキテクチャやパターンに沿っているか                   |

---

## 練習問題

### 演習1: リポジトリの作成とPR

```bash
# 1. GitHubで新しいリポジトリを作成（github-practice という名前で）
# 2. ローカルにクローン
gh repo clone username/github-practice
cd github-practice

# 3. フィーチャーブランチを作成
git switch -c feature/hello-world

# 4. index.htmlを作成してコミット
echo "<h1>Hello World</h1>" > index.html
git add index.html
git commit -m "feat: Hello Worldページを作成"

# 5. プッシュ
git push -u origin feature/hello-world

# 6. PRを作成
gh pr create --title "feat: Hello Worldページを追加" --body "初めてのPRです。"

# 7. PRをブラウザで確認
gh pr view --web
```

### 演習2: Issueの作成と紐づけ

```bash
# 1. Issueを作成
gh issue create --title "About ページを作成する" --body "会社概要ページを追加する" --label "enhancement"

# 2. Issueの番号を確認（例: #1）
gh issue list

# 3. フィーチャーブランチを作成
git switch main
git pull
git switch -c feature/about-page

# 4. about.htmlを作成
echo "<h1>About Us</h1>" > about.html
git add about.html
git commit -m "feat: Aboutページを作成

Closes #1"

# 5. プッシュしてPRを作成
git push -u origin feature/about-page
gh pr create --title "feat: Aboutページを追加" --body "Closes #1"
```

### 演習3: GitHub Actionsの設定

```bash
# 1. ワークフローファイルを作成
mkdir -p .github/workflows

cat > .github/workflows/ci.yml << 'WORKFLOW_EOF'
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: HTMLの検証
        run: |
          echo "Checking HTML files..."
          for file in *.html; do
            if [ -f "$file" ]; then
              echo "Found: $file"
            fi
          done
          echo "Check complete!"
WORKFLOW_EOF

# 2. コミットしてプッシュ
git add .github/workflows/ci.yml
git commit -m "ci: GitHub Actionsのワークフローを追加"
git push
```

---

## 参考リンク

- [GitHub公式ドキュメント](https://docs.github.com/ja) - GitHub全般の公式ガイド
- [GitHub Skills](https://skills.github.com/) - 対話形式でGitHubの使い方を学べるチュートリアル
- [GitHub CLI公式ドキュメント](https://cli.github.com/manual/) - ghコマンドの使い方リファレンス
- [GitHub Actions公式ドキュメント](https://docs.github.com/ja/actions) - CI/CDワークフローの設定ガイド
- [GitHub Pages公式ドキュメント](https://docs.github.com/ja/pages) - 静的サイトホスティングの設定ガイド
- [Understanding the GitHub flow](https://docs.github.com/ja/get-started/using-github/github-flow) - GitHub Flowの解説
- [GitHub Dependabot](https://docs.github.com/ja/code-security/dependabot) - 依存パッケージの脆弱性管理
- [Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) - コミットメッセージの標準フォーマット
- [Choose a License](https://choosealicense.com/) - OSSライセンスの選び方ガイド
