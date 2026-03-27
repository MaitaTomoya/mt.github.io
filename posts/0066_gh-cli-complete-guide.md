---
id: 66
title: "GitHub CLI（gh）入門 -- ターミナルからPR作成・Issue管理・認証まで全部できる"
tags: [GitHub, CLI, gh, PR, Issue, Git, 開発効率化]
create: "2026-03-27 22:45"
---

GitHub CLIを使えば、ブラウザを開かずにターミナルからPull Requestの作成、Issue管理、リポジトリ操作ができる。この記事では、インストールから実務で使うコマンドまで一通り解説する。

これまで自分は`git push`した時にターミナルに表示されるURLをクリックしてGitHubのページに飛び、そこからPRを作成していた。それでも十分便利だったが、`gh pr create`を使えばターミナルから離れずにPRを作成できる。ブラウザを開いてタイトルや本文を入力する手間がなくなり、コマンド一発で完結する。

特にClaude CodeやCopilotのようなAIエージェントと一緒に開発している場合、この差は大きい。AIエージェントはターミナル上で動作するため、ghコマンドとの相性が非常に良い。「ブランチを切って、コードを書いて、コミットして、PRを作成する」という一連の流れを全てターミナル内で完結できる。ブラウザへのコンテキストスイッチがゼロになるのは、思った以上に快適だった。

## GitHub CLI（gh）とは

**GitHub CLI（`gh`コマンド）** は、GitHubが公式に提供しているコマンドラインツール。ターミナルから直接GitHubの機能にアクセスできる。

「PRを作る」「Issueを見る」「CIの状態を確認する」といった作業で、いちいちブラウザに切り替える必要がなくなる。

### gitコマンドとの違い

| 項目 | `git` | `gh` |
| --- | --- | --- |
| 提供元 | Git公式 | GitHub公式 |
| 対象 | バージョン管理全般 | GitHub固有の機能 |
| できること | commit, push, branch, merge... | PR作成, Issue管理, CI確認... |
| 認証 | SSH鍵/HTTPS | OAuth/トークン |

**gitはバージョン管理ツール、ghはGitHubの操作ツール**。両者は補完関係にある。

## インストール

### macOS（Homebrew）

```bash
brew install gh
```

### Windows（winget）

```bash
winget install --id GitHub.cli
```

### Linux（apt）

```bash
# Debian/Ubuntu
sudo apt install gh
```

### バージョン確認

```bash
gh --version
# gh version 2.x.x (20xx-xx-xx)
```

インストールの詳細は [公式インストールガイド](https://github.com/cli/cli#installation) を参照。

### PATHを通してグローバルで使えるようにする

Homebrewやwingetでインストールした場合は通常PATHが自動で通る。しかし、手動インストールした場合や`gh: command not found`と表示される場合は、自分でPATHを設定する必要がある。

#### PATHとは

PATHは「コマンドを実行するとき、OSがそのコマンドの実行ファイルを探しに行くディレクトリの一覧」のこと。PATHに含まれていないディレクトリにあるコマンドは、フルパスを指定しないと実行できない。

```bash
# PATHに含まれている場合 → コマンド名だけで実行できる
gh --version

# PATHに含まれていない場合 → フルパスが必要
/usr/local/bin/gh --version
```

#### まず、ghがどこにあるか確認する

```bash
# インストール先を確認
which gh
# 例: /usr/local/bin/gh

# 見つからない場合、手動で探す
find / -name "gh" -type f 2>/dev/null
```

#### macOS / Linux（zsh）

`~/.zshrc`にPATHを追加する。

```bash
# ghのインストール先が /usr/local/bin の場合
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc

# 変更を反映
source ~/.zshrc
```

bashを使っている場合は`~/.bashrc`に同様に追加する。

```bash
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

#### macOS（Homebrew経由の場合）

Homebrewでインストールしたのに`gh: command not found`になるケースでは、Homebrew自体のPATHが通っていないことが多い。

```bash
# Apple Silicon Mac（M1/M2/M3）の場合
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc

# Intel Macの場合
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

`brew shellenv`はHomebrewが管理するディレクトリ（`/opt/homebrew/bin`等）をまとめてPATHに追加してくれるコマンド。ghに限らず、Homebrew経由でインストールした全てのツールが使えるようになる。

#### Windows

1. ghのインストール先を確認（例: `C:\Program Files\GitHub CLI`）
2. 「システム環境変数の編集」を開く（Windowsキー → 「環境変数」で検索）
3. 「Path」変数を選択 → 「編集」
4. 「新規」でghのインストール先ディレクトリを追加
5. 全てのウィンドウで「OK」をクリック
6. **ターミナル（PowerShell/コマンドプロンプト）を再起動**

PowerShellから一時的にPATHを追加する方法もある。

```powershell
# 現在のセッションだけ有効（ターミナルを閉じるとリセット）
$env:PATH += ";C:\Program Files\GitHub CLI"

# 永続的に設定する場合
[Environment]::SetEnvironmentVariable("Path", $env:PATH + ";C:\Program Files\GitHub CLI", "User")
```

#### 設定後の確認

```bash
# 新しいターミナルを開いて確認
gh --version
# gh version 2.x.x (20xx-xx-xx) と表示されればOK
```

PATHの設定を変更した後は、**必ず新しいターミナルを開く**か`source ~/.zshrc`を実行すること。既に開いているターミナルには反映されない。

## 認証（gh auth）

ghコマンドを使う前に、GitHubアカウントとの認証が必要。

### 初回ログイン（HTTPS + ブラウザ認証）

最もシンプルで推奨される方法。SSHキーの設定が不要で、ブラウザでGitHubにログインするだけで完了する。

```bash
gh auth login
```

対話形式で4つの質問が表示される。以下の通り選択する。

**ステップ1: アカウントの選択**

```
? What account do you want to log into?
> GitHub.com
  GitHub Enterprise Server
```

通常は`GitHub.com`を選択。会社のGitHub Enterpriseを使う場合は下を選ぶ。

**ステップ2: Git操作のプロトコル選択**

```
? What is your preferred protocol for Git operations on this host?
> HTTPS
  SSH
```

`HTTPS`を選択する。SSHキーの生成・登録が不要で、初心者でもすぐ使える。

> **HTTPSとSSHの違い**: HTTPSはユーザー名+トークンで認証する方式。SSHは公開鍵・秘密鍵のペアで認証する方式。どちらでもGitの操作（push/pull等）はできるが、HTTPSの方がセットアップが簡単。

**ステップ3: Git認証の設定**

```
? Authenticate Git with your GitHub credentials? (Y/n)
```

`Y`（Yes）を選択。これにより`git push`や`git pull`の際にもghの認証情報が自動で使われるようになり、毎回パスワードを入力する必要がなくなる。

**ステップ4: 認証方法の選択**

```
? How would you like to authenticate GitHub CLI?
> Login with a web browser
  Paste an authentication token
```

`Login with a web browser`を選択する。

**ステップ5: ワンタイムコードの入力**

ターミナルに8桁のコードが表示される。

```
! First copy your one-time code: XXXX-XXXX
Press Enter to open github.com in your browser...
```

1. Enterキーを押す → ブラウザが自動で開く
2. GitHubのログインページが表示される（未ログインの場合はログインする）
3. 「Device Activation」ページでターミナルに表示されたコード（`XXXX-XXXX`）を入力
4. 「Authorize GitHub CLI」ボタンをクリック
5. 「Congratulations, you're all set!」と表示されれば完了

ターミナルに戻ると、以下のように表示される。

```
✓ Authentication complete.
- gh config set -h github.com git_protocol https
✓ Configured git protocol
✓ Logged in as your-username
```

これでghコマンドが使えるようになった。

#### ブラウザが自動で開かない場合

WSL（Windows Subsystem for Linux）やリモートサーバーなど、ブラウザが直接開けない環境では、表示されたURLを手動でブラウザに貼り付ける。

```
! First copy your one-time code: XXXX-XXXX
Press Enter to open github.com in your browser...
! Failed opening a web browser at https://github.com/login/device
  exit status 1
Please try entering the URL in your browser manually
```

この場合は`https://github.com/login/device`をブラウザのアドレスバーに貼り付けて開き、同じ手順でコードを入力する。

### トークンで認証する方法

CI/CD環境やスクリプトなど、対話操作ができない環境では、Personal Access Token（PAT）を使って認証する。

#### Personal Access Token（PAT）の作成手順

1. GitHubにブラウザでログイン
2. 右上のアイコン → **Settings** → 左メニュー下部の **Developer settings**
3. **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**
4. 必要なスコープ（権限）を選択:

| スコープ | 説明 | 必要なケース |
| --- | --- | --- |
| `repo` | リポジトリへのフルアクセス | PR作成、Issue管理、コード操作 |
| `read:org` | 組織情報の読み取り | 所属組織のリポジトリを操作 |
| `workflow` | GitHub Actionsワークフローの操作 | ワークフローの実行 |
| `project` | プロジェクトボードの操作 | Projectsとの連携 |

5. **Generate token**をクリック
6. 表示されたトークン（`ghp_`で始まる文字列）をコピー

> **注意**: トークンはこのタイミングでしかコピーできない。ページを離れると二度と表示されないので、必ずコピーして安全な場所に保管する。

直接URLでアクセスする場合: [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new)

#### トークンをパイプで渡す

```bash
echo $GITHUB_TOKEN | gh auth login --with-token
```

#### 環境変数`GH_TOKEN`で設定する方法

**ghコマンドは`GH_TOKEN`（または`GITHUB_TOKEN`）環境変数が設定されていると、`gh auth login`をしなくても自動的にその値を認証トークンとして使用する。** これが最もシンプルな方法。

```bash
# 現在のターミナルセッションだけ有効
export GH_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 動作確認
gh auth status
# github.com
#   ✓ Logged in to github.com as your-username (keyring)
#   ✓ Token: ghp_****
```

#### 環境変数を永続化する

ターミナルを閉じても有効にするには、シェルの設定ファイルに書く。

**macOS / Linux（zsh）:**

```bash
echo 'export GH_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"' >> ~/.zshrc
source ~/.zshrc
```

**macOS / Linux（bash）:**

```bash
echo 'export GH_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"' >> ~/.bashrc
source ~/.bashrc
```

**Windows（PowerShell）:**

```powershell
# ユーザー環境変数として永続設定
[Environment]::SetEnvironmentVariable("GH_TOKEN", "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "User")
# PowerShellを再起動して反映
```

> **セキュリティ上の注意**: トークンは秘密情報なので、`.zshrc`や`.bashrc`に直接書く方法はローカル開発環境でのみ推奨。共有サーバーやCI/CD環境では、シークレット管理機能（GitHub Actions Secrets、AWS Secrets Manager等）を使うこと。`.zshrc`をGitで管理しているdotfilesリポジトリにpushしないよう注意。

#### `GH_TOKEN`と`GITHUB_TOKEN`の違い

| 環境変数 | 優先度 | 用途 |
| --- | --- | --- |
| `GH_TOKEN` | 高（優先） | ghコマンド専用。ローカル開発で推奨 |
| `GITHUB_TOKEN` | 低 | GitHub Actionsが自動で設定する変数。CIでは自動的に使える |

両方設定されている場合は`GH_TOKEN`が優先される。ローカル環境では`GH_TOKEN`を使うのが慣例。

#### GitHub Actionsでの使い方

GitHub Actionsのワークフロー内では、`GITHUB_TOKEN`が自動で利用可能。特別な設定は不要。

```yaml
# .github/workflows/example.yml
jobs:
  create-issue:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Issueを作成
        run: gh issue create --title "自動生成Issue" --body "CIから作成"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 認証状態の確認

```bash
gh auth status
```

出力例:

```
github.com
  ✓ Logged in to github.com as your-username (oauth_token)
  ✓ Git operations for github.com configured to use https protocol.
  ✓ Token: *******************
```

### その他の認証コマンド

| コマンド | 説明 |
| --- | --- |
| `gh auth login` | 認証する |
| `gh auth status` | 認証状態を確認 |
| `gh auth token` | 現在のトークンを表示（スクリプト用） |
| `gh auth refresh -s project,read:org` | スコープを追加して再認証 |
| `gh auth logout` | ログアウト |
| `gh auth switch` | 複数アカウント切り替え |
| `gh auth setup-git` | Git認証ヘルパーを設定 |

## Pull Request操作（gh pr）

**実務で最も使う機能**。ブラウザを開かずにPRの作成からマージまで完結できる。

### PRの作成

最も基本的な使い方:

```bash
gh pr create --title "機能Aを追加" --body "## 概要
機能Aの実装です。

## テスト
- [x] ユニットテスト追加済み"
```

#### よく使うオプション

```bash
# コミットメッセージからタイトルと本文を自動入力
gh pr create --fill

# ドラフトPRとして作成
gh pr create --draft

# ベースブランチとヘッドブランチを明示
gh pr create --base main --head feature/my-feature

# レビュアーとラベルを指定
gh pr create --reviewer user1,user2 --label "enhancement"
```

#### HEREDOCで長い本文を書く

本文が長い場合、シェルのHEREDOCを使うと便利:

```bash
gh pr create --title "機能Aを追加" --body "$(cat <<'EOF'
## 概要
機能Aの実装

## 主な変更点
- XXXコンポーネントの追加
- YYYのリファクタリング

## テスト
- [x] ユニットテスト追加済み
- [x] E2Eテスト通過
EOF
)"
```

`'EOF'`（シングルクォートで囲む）にすると、本文中の`$`や`!`がシェルに解釈されず、そのまま文字列として扱われる。

### PRの一覧を見る

```bash
# 自分に関連するオープンPRを表示
gh pr list

# 自分がアサインされたPR
gh pr list --assignee @me

# ラベルで絞り込み
gh pr list --label "bug"

# 状態で絞り込み（open / closed / merged / all）
gh pr list --state all
```

### PRの詳細を見る

```bash
# PR番号を指定
gh pr view 123

# JSON形式で特定のフィールドを取得
gh pr view 123 --json state,reviews,checks

# ブラウザで開く
gh pr view 123 --web

# 現在のブランチのPRを表示
gh pr view
```

### PRのチェックアウト（ローカルで確認）

他の人が作ったPRをローカルに取り込んで確認する:

```bash
gh pr checkout 123
```

これだけで、対象PRのブランチに切り替わる。`git fetch` + `git checkout`を手動でやる必要がない。

### PRのレビュー

```bash
# 承認
gh pr review 123 --approve

# 修正依頼
gh pr review 123 --request-changes --body "テストを追加してください"

# コメントのみ
gh pr review 123 --comment --body "全体的に良いですね"
```

### CIの状態を確認

```bash
# CIチェックの結果を表示
gh pr checks 123

# CIが終わるまでリアルタイムで監視
gh pr checks 123 --watch
```

`--watch`をつけると、CIが全て完了するまでターミナルに張り付いて状態を表示してくれる。

### PRのマージ

```bash
# 対話形式でマージ
gh pr merge 123

# スカッシュマージ + ブランチ削除
gh pr merge 123 --squash --delete-branch

# リベースマージ
gh pr merge 123 --rebase

# 通常マージ
gh pr merge 123 --merge
```

#### マージ方式の違い

| 方式 | コマンド | 特徴 |
| --- | --- | --- |
| マージコミット | `--merge` | コミット履歴をそのまま残す |
| スカッシュ | `--squash` | PRの全コミットを1つにまとめる |
| リベース | `--rebase` | ベースブランチの先頭にコミットを並べ直す |

チーム開発では `--squash --delete-branch` が最もよく使われる。コミット履歴がきれいになり、マージ後のブランチも自動で削除される。

### その他のPR操作

```bash
# PRにコメント
gh pr comment 123 --body "対応ありがとうございます"

# PRのクローズ/再オープン
gh pr close 123
gh pr reopen 123

# PRのメタデータ編集
gh pr edit 123 --title "新しいタイトル"
gh pr edit 123 --add-label "priority:high" --add-reviewer user1

# PRの差分を見る
gh pr diff 123

# ドラフトをレビュー可能にする
gh pr ready 123

# PRブランチをベースブランチで更新
gh pr update-branch 123
```

## Issue操作（gh issue）

### Issueの作成

```bash
# 基本的な作成
gh issue create --title "バグ報告: ログイン画面でエラー" --body "ログインボタンを押すと500エラーになる"

# ラベルとアサインを指定
gh issue create --title "機能追加" --label "enhancement" --assignee "@me"

# テンプレートを使用
gh issue create --template "Bug Report"
```

### Issueの一覧と確認

```bash
# 一覧表示
gh issue list

# 自分にアサインされたもの
gh issue list --assignee @me

# クローズ済み+バグラベル
gh issue list --state closed --label bug

# 詳細表示
gh issue view 123

# ブラウザで開く
gh issue view 123 --web
```

### Issueの編集・管理

```bash
# クローズ
gh issue close 123
gh issue close 123 --reason "not planned"

# 再オープン
gh issue reopen 123

# 編集
gh issue edit 123 --title "更新されたタイトル"
gh issue edit 123 --add-label "priority:high"

# コメント
gh issue comment 123 --body "対応を開始しました"

# Issueからブランチを作成
gh issue develop 123 --name feature/fix-login
```

`gh issue develop`は便利なコマンドで、Issueに紐づいたブランチを自動で作成してくれる。

## リポジトリ操作（gh repo）

### リポジトリの作成

```bash
# 対話形式で作成
gh repo create

# パブリックリポジトリを作成
gh repo create my-project --public

# テンプレートから作成
gh repo create my-project --template owner/template-repo --private
```

### クローンとフォーク

```bash
# クローン
gh repo clone owner/repo

# フォーク+クローン
gh repo fork owner/repo --clone
```

### リポジトリ情報の確認

```bash
# ターミナルで表示
gh repo view owner/repo

# ブラウザで開く
gh repo view --web

# リポジトリ一覧
gh repo list --limit 50
```

## スクリプティングとJSON出力

ghコマンドの真価はスクリプティングで発揮される。`--json`オプションでJSON形式の出力が得られ、`--jq`で加工できる。

### JSON出力の基本

```bash
# PRの番号、タイトル、作者をJSON形式で取得
gh pr list --json number,title,author
```

出力:

```json
[
  {
    "number": 123,
    "title": "機能Aを追加",
    "author": {"login": "your-username"}
  }
]
```

### jqフィルタで加工

```bash
# オープンなIssueだけ抽出
gh issue list --json number,state,labels \
  --jq '.[] | select(.state=="OPEN")'

# タブ区切りで出力（Excelに貼り付けしやすい）
gh pr list --json number,title \
  --jq '.[] | [.number, .title] | @tsv'
```

### テンプレート出力

```bash
gh pr list --template '{{range .}}#{{.number}}: {{.title}}{{"\n"}}{{end}}'
```

出力:

```
#123: 機能Aを追加
#124: バグ修正
```

### 実用例: PRレビュー待ちリストをSlackに投稿

```bash
# レビュー待ちのPR一覧をMarkdown形式で取得
gh pr list --search "review:required" --json number,title,url \
  --jq '.[] | "- [#\(.number) \(.title)](\(.url))"'
```

## GitHub APIへの直接アクセス（gh api）

ghコマンドはGitHub APIのラッパーとしても使える。認証を自動で処理してくれるので、curlで手動トークンを設定する必要がない。

```bash
# PRのコメントを取得
gh api repos/owner/repo/pulls/123/comments

# 自分のプロフィール情報
gh api user

# GraphQL APIも使える
gh api graphql -f query='
  query {
    viewer {
      login
      repositories(first: 5) {
        nodes { name }
      }
    }
  }
'
```

## 実務でよくある使い方

### ケース1: featureブランチからPR作成までの一連の流れ

```bash
# 1. featureブランチを作成
git checkout -b feature/add-search

# 2. コーディング...

# 3. コミット
git add src/search.ts
git commit -m "feat: 検索機能を追加"

# 4. リモートにプッシュ
git push -u origin feature/add-search

# 5. PRを作成
gh pr create --title "feat: 検索機能を追加" --body "$(cat <<'EOF'
## 概要
検索機能の実装

## テスト
- [x] ユニットテスト追加
EOF
)"

# 6. CIの結果を監視
gh pr checks --watch

# 7. レビュー後、スカッシュマージ
gh pr merge --squash --delete-branch
```

### ケース2: 他の人のPRをローカルで確認してレビュー

```bash
# PRをチェックアウト
gh pr checkout 456

# 動作確認...
npm run dev

# 承認
gh pr review 456 --approve --body "LGTM!"

# 元のブランチに戻る
git checkout main
```

### ケース3: Issueからブランチを作って作業開始

```bash
# Issueの詳細を確認
gh issue view 789

# Issueから作業ブランチを作成
gh issue develop 789 --name fix/login-error

# 修正してPR作成（Issueを自動クローズするキーワード付き）
gh pr create --title "fix: ログインエラーを修正" --body "Closes #789"
```

PRの本文に`Closes #789`と書くと、PRがマージされた時にIssue #789が自動的にクローズされる。

### ケース4: CI失敗時のデバッグ

```bash
# CIの状態を確認
gh pr checks

# 失敗したチェックの詳細をブラウザで確認
gh pr checks --web

# GitHub Actionsのログを直接取得
gh run list --limit 5
gh run view <run-id> --log-failed
```

## エイリアス設定

よく使うコマンドにエイリアスを設定できる。

```bash
# PRをスカッシュマージ+ブランチ削除するエイリアス
gh alias set prsm 'pr merge --squash --delete-branch'

# 使用
gh prsm 123

# 自分のPR一覧を表示するエイリアス
gh alias set mypr 'pr list --author @me'

# エイリアス一覧
gh alias list
```

## よくあるエラーと対処法

### 「gh: not found」

ghがインストールされていない。`brew install gh`等でインストールする。

### 「authentication required」

未認証。`gh auth login`を実行する。

### 「pull request create failed: GraphQL: No commits between main and feature-branch」

ベースブランチとの差分がない状態でPRを作ろうとしている。コミットしてからPRを作成する。

### 「pull request already exists」

同じブランチから既にPRが作られている。`gh pr view`で既存のPRを確認する。

## まとめ

| やりたいこと | コマンド |
| --- | --- |
| 認証 | `gh auth login` |
| PR作成 | `gh pr create --title "..." --body "..."` |
| PR一覧 | `gh pr list` |
| PRレビュー | `gh pr review 123 --approve` |
| PRマージ | `gh pr merge 123 --squash --delete-branch` |
| CIの監視 | `gh pr checks --watch` |
| Issue作成 | `gh issue create --title "..."` |
| ブラウザで開く | `gh pr view --web` |
| JSON出力 | `gh pr list --json number,title` |
| API直接呼び出し | `gh api repos/owner/repo/pulls/123/comments` |

ghコマンドを使いこなすと、ブラウザとターミナルの往復が激減する。特にPR操作は毎日使うので、`gh pr create`と`gh pr merge`だけでも覚えておくと開発効率が上がる。

## 参考リンク

- [GitHub CLI公式サイト](https://cli.github.com/)
- [GitHub CLI公式リポジトリ](https://github.com/cli/cli)
- [GitHub CLI マニュアル](https://cli.github.com/manual/)
