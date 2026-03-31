---
title: 'Git'
order: 12
section: 'バージョン管理'
---

# Git

## Gitとは

Gitは**分散バージョン管理システム（DVCS: Distributed Version Control System）**。2005年にLinuxカーネルの開発者である**Linus Torvalds**が、Linux開発のために作った。

「バージョン管理システム」とは、ファイルの変更履歴を記録し、過去の状態に戻したり、変更の経緯を追跡したりするための仕組み。Gitはその中でも「分散型」と呼ばれるタイプで、各開発者のPC上にリポジトリ（履歴を含む完全なコピー）を持つのが特徴。

| 種類   | 例             | 特徴                                                              |
| ------ | -------------- | ----------------------------------------------------------------- |
| 集中型 | SVN, CVS       | サーバーに1つだけリポジトリがある。サーバーが落ちると作業できない |
| 分散型 | Git, Mercurial | 各開発者がリポジトリの完全なコピーを持つ。オフラインでも作業可能  |

身近な例で言えば、Googleドキュメントの「変更履歴」機能に近い。ただしGitはそれをはるかに高機能にしたもので、複数人が同時に別々の機能を開発し、後からそれを統合するといった複雑な作業を安全に行える。

---

## なぜバージョン管理が必要か

バージョン管理がない世界を想像してみよう。

```
project/
  index.html
  index_backup.html
  index_backup2.html
  index_最終版.html
  index_最終版_修正.html
  index_本当の最終版.html     ← どれが最新？
```

こうなった経験はないだろうか。バージョン管理システムを使えば、こんな混乱は起きない。

### バージョン管理が解決する問題

| 問題           | バージョン管理なし                     | Gitを使った場合                      |
| -------------- | -------------------------------------- | ------------------------------------ |
| 変更履歴の追跡 | ファイル名で管理（破綻する）           | 全ての変更が自動記録される           |
| 元に戻す       | バックアップファイルを探す             | コマンド1つで任意の時点に戻せる      |
| チーム開発     | 「今このファイル触ってる？」と口頭確認 | 各自が独立して作業し、後で統合できる |
| 変更の理由     | 覚えていない                           | コミットメッセージに記録される       |
| 責任の所在     | 「誰がこの行を変えた？」が分からない   | `git blame`で行単位で特定できる      |
| 並行開発       | 不可能に近い                           | ブランチで複数の機能を同時開発できる |

### 実務での具体的なメリット

1. **元に戻せる安心感**: 「この変更、やっぱりダメだった」となっても、いつでも以前の状態に戻せる
2. **変更の透明性**: 「いつ」「誰が」「何を」「なぜ」変えたかが全て記録される
3. **並行開発**: 新機能開発とバグ修正を同時に進められる
4. **コードレビュー**: 変更箇所だけを確認できるので、レビューが効率的になる
5. **デプロイ管理**: リリース済みのバージョンを正確に把握できる

---

## Gitの3つのエリア

Gitを理解する上で最も重要な概念が**3つのエリア**。ファイルの変更は、この3つのエリアを段階的に移動していく。

```
  ワーキングツリー          ステージングエリア          リポジトリ
  (Working Tree)           (Staging Area/Index)       (Repository)
 ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
 │                 │      │                 │      │                 │
 │  ファイルを     │ git  │  コミットする   │ git  │  変更履歴が     │
 │  編集する場所   │ add  │  変更を選ぶ場所 │commit│  保存される場所 │
 │                 │ ───> │                 │ ───> │                 │
 │  (実際の        │      │  (次のコミット  │      │  (.git/         │
 │   ファイル群)   │      │   の準備エリア) │      │   ディレクトリ) │
 │                 │      │                 │      │                 │
 └─────────────────┘      └─────────────────┘      └─────────────────┘
```

### 各エリアの説明

| エリア             | 別名             | 役割                                   | たとえ                         |
| ------------------ | ---------------- | -------------------------------------- | ------------------------------ |
| ワーキングツリー   | 作業ディレクトリ | 実際にファイルを編集する場所           | 作業机の上                     |
| ステージングエリア | インデックス     | 次のコミットに含める変更を選ぶ場所     | 「提出する書類」を入れるトレイ |
| リポジトリ         | .gitディレクトリ | コミットされた変更履歴が保存される場所 | 書類保管庫                     |

### なぜステージングエリアが必要なのか

「編集したら直接コミットすればいいのでは？」と思うかもしれない。ステージングエリアがあることで、**1回の作業で複数のファイルを変更しても、関連する変更だけをまとめてコミットできる**。

例えば、「ログイン機能の実装」と「ヘッダーのデザイン修正」を同時にやっていた場合:

```bash
# ログイン機能に関するファイルだけをステージ
git add src/login.js src/auth.js

# ログイン機能としてコミット
git commit -m "feat: ログイン機能を実装"

# ヘッダーのデザイン修正をステージ
git add src/header.css

# デザイン修正としてコミット
git commit -m "fix: ヘッダーのデザインを修正"
```

このように、変更を論理的な単位でまとめてコミットできるのがステージングエリアの利点。

### ファイルの状態遷移

```
  Untracked ──── git add ────> Staged ──── git commit ────> Committed
  (未追跡)                     (ステージ済み)                (コミット済み)
       ^                           ^
       │                           │
  新規ファイル作成            Modified(変更あり)から
                              git add で再ステージ
```

| 状態      | 意味                                     |
| --------- | ---------------------------------------- |
| Untracked | Gitが追跡していない新規ファイル          |
| Modified  | 追跡中のファイルが変更された状態         |
| Staged    | 次のコミットに含まれる準備が完了した状態 |
| Committed | リポジトリに安全に保存された状態         |

---

## インストールと初期設定

### インストール

**macOS:**

```bash
# Homebrewを使う場合（推奨）
brew install git

# Xcodeのコマンドラインツールに含まれるGitを使う場合
xcode-select --install
```

**Windows:**

公式サイト（https://git-scm.com/download/win）からインストーラーをダウンロードして実行する。Git Bashというターミナルも一緒にインストールされる。

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install git
```

### バージョン確認

```bash
git --version
# 出力例: git version 2.44.0
```

### 初期設定（必須）

Gitを使い始める前に、**必ず**名前とメールアドレスを設定する。これはコミット（変更の記録）に「誰が変更したか」を記録するために必要。

```bash
# ユーザー名の設定
git config --global user.name "Taro Yamada"

# メールアドレスの設定
git config --global user.email "taro@example.com"
```

`--global`は「このPCの全てのリポジトリに適用」という意味。特定のプロジェクトだけ別の設定にしたい場合は、そのプロジェクトのディレクトリ内で`--global`を外して実行する。

### 推奨の追加設定

```bash
# デフォルトブランチ名をmainに設定
git config --global init.defaultBranch main

# エディタの設定（VS Codeを使う場合）
git config --global core.editor "code --wait"

# 改行コードの自動変換（macOS/Linux）
git config --global core.autocrlf input

# 改行コードの自動変換（Windows）
git config --global core.autocrlf true

# カラー出力を有効にする
git config --global color.ui auto

# プッシュ時のデフォルト動作を設定
git config --global push.default current
```

### 設定の確認

```bash
# 全ての設定を表示
git config --list

# 特定の設定を確認
git config user.name
git config user.email
```

---

## 基本コマンド一覧

以下がGitで最もよく使うコマンドの一覧。実務ではこの表のコマンドを覚えれば日常業務の大半をカバーできる。

| コマンド       | 用途                                   | 使用頻度       |
| -------------- | -------------------------------------- | -------------- |
| `git init`     | 新しいリポジトリを作成                 | 低（最初だけ） |
| `git clone`    | リモートリポジトリをコピー             | 低（最初だけ） |
| `git add`      | 変更をステージングエリアに追加         | 高             |
| `git commit`   | ステージした変更を記録                 | 高             |
| `git status`   | 現在の状態を確認                       | 非常に高       |
| `git log`      | コミット履歴を表示                     | 高             |
| `git diff`     | 変更差分を表示                         | 高             |
| `git branch`   | ブランチの作成・一覧表示               | 高             |
| `git checkout` | ブランチの切り替え                     | 高             |
| `git switch`   | ブランチの切り替え（新しいコマンド）   | 高             |
| `git merge`    | ブランチを統合                         | 中             |
| `git pull`     | リモートの変更を取得して統合           | 高             |
| `git push`     | ローカルの変更をリモートに送信         | 高             |
| `git fetch`    | リモートの変更を取得（統合はしない）   | 中             |
| `git stash`    | 作業中の変更を一時退避                 | 中             |
| `git reset`    | コミットやステージを取り消す           | 低             |
| `git revert`   | コミットを打ち消す新しいコミットを作成 | 低             |

---

### git init - リポジトリの初期化

新しいプロジェクトでGitの管理を開始するコマンド。

```bash
# 新しいプロジェクトを作成してGitを初期化
mkdir my-project
cd my-project
git init
```

実行すると`.git`という隠しディレクトリが作成される。ここにGitの全ての管理情報が保存される。

```bash
# .gitディレクトリの確認
ls -la .git/
# config, HEAD, hooks/, objects/, refs/ などが入っている
```

### git clone - リモートリポジトリのコピー

既存のリモートリポジトリ（GitHubなど）をローカルにコピーするコマンド。

```bash
# HTTPS経由でクローン
git clone https://github.com/username/repository.git

# SSH経由でクローン（SSHキー設定済みの場合）
git clone git@github.com:username/repository.git

# ディレクトリ名を指定してクローン
git clone https://github.com/username/repository.git my-local-name
```

`clone`は`init` + リモートからの全履歴のダウンロード + リモート設定を一度に行ってくれる便利コマンド。実務ではプロジェクトに参加する際、まず`clone`するのが一般的。

### git add - ステージングエリアへの追加

変更したファイルをステージングエリア（次のコミットの準備エリア）に追加するコマンド。

```bash
# 特定のファイルをステージ
git add index.html

# 複数のファイルを指定
git add index.html style.css app.js

# 特定のディレクトリ以下を全てステージ
git add src/

# 変更のある全ファイルをステージ（新規ファイルも含む）
git add .

# 追跡済みファイルの変更のみステージ（新規ファイルは含まない）
git add -u

# 変更の一部だけをステージ（対話的に選択）
git add -p
```

**注意**: `git add .`は便利だが、意図しないファイル（ログファイル、設定ファイルなど）も追加してしまう可能性がある。`.gitignore`を適切に設定するか、ファイルを個別に指定する習慣をつけよう。

### git commit - 変更の記録

ステージした変更をリポジトリに記録するコマンド。

```bash
# コミットメッセージを指定してコミット
git commit -m "feat: ログイン機能を実装"

# エディタでコミットメッセージを編集（長いメッセージの場合）
git commit

# 追跡済みファイルのaddとcommitを同時に実行（新規ファイルは対象外）
git commit -am "fix: ヘッダーの表示崩れを修正"
```

コミットすると一意なハッシュ値（例: `a1b2c3d`）が割り当てられる。このハッシュ値で各コミットを識別できる。

### git status - 状態の確認

現在のリポジトリの状態を確認するコマンド。最もよく使うコマンドの1つ。

```bash
git status
```

出力例:

```
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   index.html          ← ステージ済み

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
        modified:   style.css           ← 変更あり（未ステージ）

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        new-file.js                     ← 未追跡の新規ファイル
```

```bash
# 短い形式で表示
git status -s
#  M style.css     （赤のM = 変更あり未ステージ）
# M  index.html    （緑のM = ステージ済み）
# ?? new-file.js   （?? = 未追跡）
```

### git log - コミット履歴の表示

コミットの履歴を表示するコマンド。

```bash
# 基本のログ表示
git log

# 1行表示（ハッシュとメッセージのみ）
git log --oneline

# グラフ付き表示（ブランチの分岐・統合が視覚的に分かる）
git log --oneline --graph

# 全ブランチのログを表示
git log --oneline --graph --all

# 直近5件のみ表示
git log -5

# 特定のファイルの変更履歴
git log -- src/index.js

# コミット内容（差分）も表示
git log -p

# 統計情報（変更行数）も表示
git log --stat

# 日付を指定して絞り込み
git log --after="2024-01-01" --before="2024-03-31"

# 特定の著者で絞り込み
git log --author="Taro"

# コミットメッセージで検索
git log --grep="ログイン"
```

実務で最もよく使う組み合わせ:

```bash
git log --oneline --graph --all
```

出力例:

```
* a1b2c3d (HEAD -> feature/login) feat: ログイン画面のバリデーション追加
* e4f5g6h feat: ログインフォームのUI実装
| * h7i8j9k (main) fix: トップページのタイポ修正
|/
* k0l1m2n feat: トップページ実装
* n3o4p5q initial commit
```

### git diff - 差分の表示

ファイルの変更差分を確認するコマンド。

```bash
# ワーキングツリーとステージングエリアの差分（まだaddしていない変更）
git diff

# ステージングエリアとリポジトリの差分（addしたがcommitしていない変更）
git diff --staged
# または
git diff --cached

# 特定のファイルの差分
git diff index.html

# 2つのコミット間の差分
git diff a1b2c3d e4f5g6h

# 2つのブランチ間の差分
git diff main feature/login

# 変更のあるファイル名だけ表示
git diff --name-only

# 統計情報だけ表示
git diff --stat
```

差分の読み方:

```diff
diff --git a/index.html b/index.html
index 1234567..abcdefg 100644
--- a/index.html        ← 変更前のファイル
+++ b/index.html        ← 変更後のファイル
@@ -10,6 +10,8 @@      ← 変更箇所の位置情報
 <body>
   <h1>Welcome</h1>
-  <p>古いテキスト</p>   ← 削除された行（赤色で表示）
+  <p>新しいテキスト</p> ← 追加された行（緑色で表示）
+  <p>追加された段落</p> ← 追加された行（緑色で表示）
   <footer>
 </body>
```

### git branch - ブランチの管理

ブランチの作成、一覧表示、削除を行うコマンド。

```bash
# ブランチ一覧を表示
git branch

# リモートブランチも含めて一覧表示
git branch -a

# 新しいブランチを作成（切り替えはしない）
git branch feature/login

# ブランチの削除（マージ済みのみ）
git branch -d feature/login

# ブランチの強制削除（マージしていなくても削除）
git branch -D feature/login

# ブランチ名の変更
git branch -m old-name new-name

# 各ブランチの最新コミットを表示
git branch -v
```

### git checkout / git switch - ブランチの切り替え

```bash
# ブランチの切り替え（従来のコマンド）
git checkout feature/login

# ブランチの作成と切り替えを同時に行う
git checkout -b feature/new-feature

# ブランチの切り替え（Git 2.23以降の新しいコマンド、推奨）
git switch feature/login

# ブランチの作成と切り替えを同時に行う
git switch -c feature/new-feature
```

`checkout`は「ブランチの切り替え」と「ファイルの復元」の2つの役割を持っていたため、Git 2.23から`switch`（ブランチ切り替え）と`restore`（ファイル復元）に分離された。新しいコマンドを使うことを推奨する。

### git merge - ブランチの統合

あるブランチの変更を現在のブランチに統合するコマンド。

```bash
# mainブランチに移動
git switch main

# feature/loginブランチの変更をmainに統合
git merge feature/login

# マージコミットを必ず作成する（--no-ff）
git merge --no-ff feature/login

# マージを中止する
git merge --abort
```

マージの種類:

```
Fast-forward マージ（分岐がない場合）:

  main:     A --- B --- C
                         \
  feature:                D --- E
                                ↓
  結果:     A --- B --- C --- D --- E  (mainのポインタが進むだけ)


Non-fast-forward マージ（分岐がある場合）:

  main:     A --- B --- C --- F
                         \   /
  feature:                D --- E
                          (マージコミットFが作成される)
```

### git pull - リモートの変更を取得して統合

リモートリポジトリの変更をローカルに反映するコマンド。`git fetch` + `git merge`を一度に行う。

```bash
# リモートの変更を取得してマージ
git pull

# 特定のリモートとブランチを指定
git pull origin main

# リベースで統合（マージコミットを作らない）
git pull --rebase
```

### git push - ローカルの変更をリモートに送信

ローカルのコミットをリモートリポジトリに送信するコマンド。

```bash
# 現在のブランチをリモートにプッシュ
git push

# リモートとブランチを指定してプッシュ
git push origin main

# 上流ブランチを設定してプッシュ（初回プッシュ時）
git push -u origin feature/login

# タグもプッシュ
git push --tags
```

**注意**: `git push --force`（強制プッシュ）は他の開発者の作業を破壊する可能性があるため、共有ブランチでは絶対に使わない。自分だけが使っているブランチで、リベース後などに限定して使う。

### git fetch - リモートの変更を取得

リモートリポジトリの変更をダウンロードするが、ローカルのブランチには統合しないコマンド。

```bash
# リモートの変更を取得
git fetch

# 特定のリモートから取得
git fetch origin

# リモートで削除されたブランチの参照をローカルからも削除
git fetch --prune
```

`fetch`と`pull`の違い:

| コマンド    | 動作                                 | 安全性                                   |
| ----------- | ------------------------------------ | ---------------------------------------- |
| `git fetch` | リモートの変更をダウンロードするだけ | 安全（ローカルのコードは変わらない）     |
| `git pull`  | ダウンロード + 自動マージ            | マージコンフリクトが発生する可能性がある |

実務では「まず`fetch`して確認してから`merge`」という慎重なやり方もある。

### git stash - 一時退避

作業中の変更を一時的に退避させるコマンド。「今の作業を中断して別のブランチで作業したい」ときに使う。

```bash
# 変更を一時退避
git stash

# メッセージ付きで退避（Git 2.16以降はpushが推奨）
git stash push -m "ログイン機能の途中"

# 退避リストを表示
git stash list
# stash@{0}: On feature/login: ログイン機能の途中
# stash@{1}: WIP on main: a1b2c3d fix header

# 最新の退避を復元（stashリストからは削除される）
git stash pop

# 最新の退避を復元（stashリストに残す）
git stash apply

# 特定の退避を復元
git stash apply stash@{1}

# 退避を削除
git stash drop stash@{0}

# 全ての退避を削除
git stash clear

# 退避した内容の差分を確認
git stash show -p stash@{0}
```

実務でよくある使い方:

```bash
# feature/loginブランチで作業中に、緊急のバグ修正が必要になった
git stash push -m "ログイン機能の途中"

# mainブランチに切り替えてバグ修正
git switch main
git switch -c fix/urgent-bug
# ... バグ修正の作業 ...
git commit -am "fix: 緊急バグを修正"

# 元のブランチに戻って作業を再開
git switch feature/login
git stash pop
```

### git reset - コミットやステージの取り消し

コミットの取り消しやステージの解除を行うコマンド。**注意**: 使い方を間違えるとデータを失う可能性がある。

```bash
# ステージングエリアからファイルを取り除く（ワーキングツリーは変更しない）
git reset HEAD index.html
# Git 2.23以降の推奨コマンド
git restore --staged index.html

# 直前のコミットを取り消す（変更はステージに残る）
git reset --soft HEAD~1

# 直前のコミットを取り消す（変更はワーキングツリーに残る）
git reset --mixed HEAD~1  # --mixedはデフォルト
git reset HEAD~1          # --mixedと同じ

# 直前のコミットを取り消す（変更も全て消える。危険）
git reset --hard HEAD~1
```

resetの3つのモード:

| モード                  | ステージ | ワーキングツリー | 用途                         | 危険度 |
| ----------------------- | -------- | ---------------- | ---------------------------- | ------ |
| `--soft`                | 残る     | 残る             | コミットだけやり直したい     | 低     |
| `--mixed`（デフォルト） | 消える   | 残る             | ステージングからやり直したい | 低     |
| `--hard`                | 消える   | 消える           | 変更を完全に破棄したい       | 高     |

```
HEAD~1 の意味:
  HEAD   = 現在のコミット
  HEAD~1 = 1つ前のコミット
  HEAD~2 = 2つ前のコミット
  HEAD~3 = 3つ前のコミット
```

### git revert - コミットの打ち消し

指定したコミットの変更を打ち消す**新しいコミットを作成**するコマンド。`reset`と違い、履歴は改変されない。

```bash
# 直前のコミットを打ち消す
git revert HEAD

# 特定のコミットを打ち消す
git revert a1b2c3d

# 複数のコミットを打ち消す
git revert a1b2c3d..e4f5g6h

# コミットせずに打ち消し変更をステージに留める
git revert --no-commit a1b2c3d
```

---

## git reset vs git revert

この2つは「変更を元に戻す」という点では似ているが、仕組みが根本的に異なる。

```
git reset --hard HEAD~1 の場合:

  Before:  A --- B --- C (HEAD)
  After:   A --- B (HEAD)           ← Cが履歴から消える


git revert HEAD の場合:

  Before:  A --- B --- C (HEAD)
  After:   A --- B --- C --- C' (HEAD)  ← Cの変更を打ち消すC'が追加される
```

| 比較項目             | git reset                            | git revert                               |
| -------------------- | ------------------------------------ | ---------------------------------------- |
| 履歴                 | 改変する（コミットが消える）         | 改変しない（新しいコミットが追加される） |
| 共有ブランチでの使用 | 危険（他の人の作業に影響する）       | 安全                                     |
| 取り消せるか         | `git reflog`で復元可能（一定期間）   | revertをrevertすれば元に戻せる           |
| 主な用途             | ローカルの未プッシュの変更を取り消す | プッシュ済みの変更を取り消す             |

**経験則**: プッシュ済みの変更を取り消すなら`revert`、ローカルのみの変更なら`reset`を使う。

---

## ブランチ戦略

ブランチ戦略とは、チームでGitを使う際に「どのようにブランチを作り、どのタイミングでマージするか」を定めたルール。

### 1. Feature Branch（フィーチャーブランチ）

最もシンプルな戦略。`main`ブランチから機能ごとにブランチを作り、完成したらマージする。

```
main:     A --- B --------- M --- N
                \           /
feature/login:   C --- D ---
```

```bash
# mainからフィーチャーブランチを作成
git switch main
git switch -c feature/login

# 作業してコミット
git add .
git commit -m "feat: ログインフォーム実装"

# mainにマージ
git switch main
git merge feature/login

# マージ済みのブランチを削除
git branch -d feature/login
```

### 2. Git Flow

Vincent Driessenが提唱した、リリースサイクルが明確なプロジェクト向けの戦略。ブランチの種類が多く、やや複雑。

```
main:       A ─────────────────── R1 ─────────── R2
             \                   /               /
develop:      B ── C ── D ── E ── F ── G ── H ──
               \       /         \       /
feature/login:  X ── Y           │      │
                                 │      │
feature/signup:                  I ── J
                                 │
release/1.0:                     K ── L
                                 │
hotfix/bug:                      ────── P ── Q
```

| ブランチ    | 役割                 | ライフサイクル |
| ----------- | -------------------- | -------------- |
| `main`      | リリース済みのコード | 永続           |
| `develop`   | 開発中のコード       | 永続           |
| `feature/*` | 新機能の開発         | 一時的         |
| `release/*` | リリース準備         | 一時的         |
| `hotfix/*`  | 緊急バグ修正         | 一時的         |

### 3. GitHub Flow

GitHubが推奨するシンプルな戦略。`main`ブランチとフィーチャーブランチの2種類のみ。

```
main:          A --- B --- M1 --- C --- M2
                \         /       \   /
feature/login:   D --- E          │
                                  │
feature/signup:                   F --- G
```

ルール:

1. `main`は常にデプロイ可能な状態を保つ
2. 新しい作業は`main`からブランチを作る
3. ブランチにコミットしたらPull Requestを作る
4. レビューを受けてからマージする
5. マージしたら即デプロイする

### 4. Trunk-based Development

`main`（trunk）に直接、または非常に短命なブランチで頻繁にマージする戦略。CI/CDが高度に整備されたチーム向け。

```
main:    A --- B --- C --- D --- E --- F --- G --- H
              \   /           \   /
feature/x:    X               Y
```

### ブランチ戦略の比較

| 戦略           | 複雑さ | 適したプロジェクト                   | チーム規模 |
| -------------- | ------ | ------------------------------------ | ---------- |
| Feature Branch | 低     | 小規模プロジェクト                   | 1-5人      |
| Git Flow       | 高     | リリースサイクルが明確なプロジェクト | 5人以上    |
| GitHub Flow    | 低     | Webアプリ、継続的デプロイ            | 任意       |
| Trunk-based    | 中     | CI/CDが整備された大規模開発          | 任意       |

実務では**GitHub Flow**が最も広く使われている。特に理由がなければGitHub Flowから始めるのがおすすめ。

---

## マージとリベース

ブランチを統合する方法として、**merge**と**rebase**の2つがある。

### merge（マージ）

2つのブランチの変更を統合し、マージコミットを作成する。

```bash
git switch main
git merge feature/login
```

```
Before:
  main:          A --- B --- C
                        \
  feature/login:         D --- E

After (merge):
  main:          A --- B --- C --- M   ← マージコミット
                        \         /
  feature/login:         D --- E
```

### rebase（リベース）

あるブランチのコミットを、別のブランチの先端に「付け替える」操作。

```bash
git switch feature/login
git rebase main
```

```
Before:
  main:          A --- B --- C
                        \
  feature/login:         D --- E

After (rebase):
  main:          A --- B --- C
                              \
  feature/login:               D' --- E'   ← コミットが新しく作り直される
```

リベース後にmainにマージすると、履歴が一直線になる:

```
  main:    A --- B --- C --- D' --- E'
```

### merge vs rebase 比較

| 比較項目         | merge                          | rebase                               |
| ---------------- | ------------------------------ | ------------------------------------ |
| 履歴             | 分岐・統合の歴史がそのまま残る | 一直線の綺麗な履歴になる             |
| マージコミット   | 作成される                     | 作成されない                         |
| コンフリクト解決 | 1回で済む                      | 各コミットごとに必要な場合がある     |
| 安全性           | 安全（履歴を書き換えない）     | プッシュ済みのコミットに対しては危険 |
| 適した場面       | チームの共有ブランチ           | ローカルのフィーチャーブランチ       |

### 使い分けの指針

```
「このブランチは自分だけが使っている？」
  ├── はい → rebaseでOK
  └── いいえ（他の人もプッシュしている）→ mergeを使う

「プッシュ済みのコミットか？」
  ├── はい → rebaseは危険。mergeを使う
  └── いいえ → rebaseでOK
```

**ゴールデンルール**: プッシュ済みのコミットをリベースしてはいけない。他の開発者が同じコミットを基にして作業している場合、履歴の不整合が発生する。

---

## コンフリクト解決

### コンフリクトとは

複数の人（またはブランチ）が**同じファイルの同じ箇所**を別々に変更した場合に発生する。Gitが「どちらの変更を採用すべきか分からない」状態。

### コンフリクトが発生する例

```bash
# Aさん: mainブランチでindex.htmlの10行目を変更
<h1>Welcome to Our Site</h1>

# Bさん: feature/redesignブランチで同じ10行目を変更
<h1>Welcome to My Portfolio</h1>

# Aさんの変更がマージされた後、Bさんがマージしようとすると...
git merge feature/redesign
# CONFLICT (content): Merge conflict in index.html
# Automatic merge failed; fix conflicts and then commit the result.
```

### コンフリクトマーカーの読み方

コンフリクトが発生すると、Gitは該当箇所にマーカーを挿入する。

```html
<<<<<<< HEAD
<h1>Welcome to Our Site</h1>
=======
<h1>Welcome to My Portfolio</h1>
>>>>>>> feature/redesign
```

| マーカー                   | 意味                                   |
| -------------------------- | -------------------------------------- |
| `<<<<<<< HEAD`             | 現在のブランチ（マージ先）の変更の開始 |
| `=======`                  | 2つの変更の区切り                      |
| `>>>>>>> feature/redesign` | マージ元のブランチの変更の終了         |

### コンフリクト解決の手順

**手順1: コンフリクトの確認**

```bash
git status
# both modified: index.html  ← コンフリクトが発生しているファイル
```

**手順2: コンフリクトマーカーを手動で編集**

コンフリクトマーカーを全て削除し、最終的にどうしたいかを書く。

```html
<!-- 3つの選択肢 -->

<!-- 選択肢1: HEADの変更を採用 -->
<h1>Welcome to Our Site</h1>

<!-- 選択肢2: マージ元の変更を採用 -->
<h1>Welcome to My Portfolio</h1>

<!-- 選択肢3: 両方の変更を組み合わせる -->
<h1>Welcome to Our Portfolio Site</h1>
```

**手順3: 解決したファイルをステージしてコミット**

```bash
git add index.html
git commit -m "merge: feature/redesignをmainにマージ（コンフリクト解決）"
```

### VS Codeでのコンフリクト解決

VS Codeはコンフリクトマーカーを検出すると、以下のオプションをインラインで表示してくれる:

- **Accept Current Change**: 現在のブランチの変更を採用
- **Accept Incoming Change**: マージ元の変更を採用
- **Accept Both Changes**: 両方を残す
- **Compare Changes**: 差分を横並びで表示

### コンフリクトを避けるためのコツ

1. **こまめにpullする**: 最新の変更を頻繁に取り込む
2. **小さなコミット**: 大きな変更を一度にマージしない
3. **コミュニケーション**: 同じファイルを同時に編集していないか確認する
4. **ファイルを分割する**: 巨大なファイルは適切に分割する

---

## .gitignore

### .gitignoreとは

Gitに「このファイルは追跡しないでほしい」と伝えるための設定ファイル。リポジトリのルートディレクトリに`.gitignore`というファイル名で配置する。

### なぜ必要か

以下のようなファイルはGitで管理すべきでない:

| 種類           | 例                         | 理由                                       |
| -------------- | -------------------------- | ------------------------------------------ |
| 依存パッケージ | `node_modules/`, `vendor/` | 容量が大きく、`package.json`から再現できる |
| ビルド成果物   | `dist/`, `build/`          | ソースコードから再生成できる               |
| 環境設定       | `.env`, `*.local`          | 秘密情報（APIキー等）が含まれる            |
| OS固有ファイル | `.DS_Store`, `Thumbs.db`   | 開発に無関係                               |
| エディタ設定   | `.vscode/`, `.idea/`       | 個人の設定であり共有不要な場合がある       |
| ログファイル   | `*.log`, `logs/`           | 実行時に生成されるもの                     |

### 書き方

```gitignore
# コメントは#で始める

# 特定のファイルを無視
.env
.DS_Store

# 特定の拡張子を無視
*.log
*.tmp

# 特定のディレクトリを無視
node_modules/
dist/
build/
.cache/

# 特定のパターンを無視（ワイルドカード）
*.min.js
*.min.css

# ディレクトリ内の特定のファイルだけ無視
logs/*.log

# 再帰的にマッチ（サブディレクトリも含む）
**/*.pyc

# 否定パターン（無視しない）
!important.log

# 特定のディレクトリ直下のファイルのみ（サブディレクトリは含まない）
/TODO
```

### よく使う.gitignoreの例

**Node.jsプロジェクト:**

```gitignore
node_modules/
dist/
build/
.env
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
*.tgz
coverage/
```

**Pythonプロジェクト:**

```gitignore
__pycache__/
*.py[cod]
*.egg-info/
dist/
build/
.env
.venv/
venv/
*.egg
.pytest_cache/
htmlcov/
```

### gitignore.io

https://www.toptal.com/developers/gitignore にアクセスすると、使用している言語やフレームワークを選ぶだけで適切な`.gitignore`を自動生成してくれる。

```bash
# コマンドラインからも使える
curl -sL https://www.toptal.com/developers/gitignore/api/node,react,macos > .gitignore
```

### 既に追跡されているファイルを無視する

`.gitignore`に追加しても、既にGitが追跡しているファイルは無視されない。追跡を停止するには:

```bash
# ファイルのキャッシュを削除（ファイル自体は消えない）
git rm --cached .env

# ディレクトリの場合
git rm -r --cached node_modules/

# その後コミット
git commit -m "chore: .envをGit管理から除外"
```

---

## コミットメッセージの書き方

### なぜコミットメッセージが重要か

コミットメッセージは「未来の自分やチームメンバーへの手紙」。良いメッセージがあれば、なぜその変更が必要だったのかを素早く理解できる。

### Conventional Commits

多くのプロジェクトで採用されている**Conventional Commits**というフォーマットがある。

```
<type>(<scope>): <subject>

<body>

<footer>
```

| 要素    | 必須   | 説明                               |
| ------- | ------ | ---------------------------------- |
| type    | はい   | 変更の種類                         |
| scope   | いいえ | 変更の影響範囲                     |
| subject | はい   | 変更の簡潔な説明（50文字以内推奨） |
| body    | いいえ | 変更の詳細な説明                   |
| footer  | いいえ | 破壊的変更やIssue番号              |

### typeの種類

| type       | 用途                                           | 例                                          |
| ---------- | ---------------------------------------------- | ------------------------------------------- |
| `feat`     | 新機能                                         | `feat: ユーザー登録機能を追加`              |
| `fix`      | バグ修正                                       | `fix: ログイン時のエラーハンドリングを修正` |
| `docs`     | ドキュメントのみの変更                         | `docs: READMEにセットアップ手順を追加`      |
| `style`    | コードの動作に影響しない変更（フォーマット等） | `style: インデントをタブからスペースに統一` |
| `refactor` | リファクタリング                               | `refactor: 認証ロジックをサービス層に分離`  |
| `test`     | テストの追加・修正                             | `test: ログイン機能のユニットテストを追加`  |
| `chore`    | ビルドプロセスやツールの変更                   | `chore: ESLintの設定を更新`                 |
| `perf`     | パフォーマンス改善                             | `perf: 画像の遅延読み込みを実装`            |
| `ci`       | CI/CDの変更                                    | `ci: GitHub Actionsのワークフローを追加`    |

### 良いコミットメッセージ / 悪いコミットメッセージ

| 種類 | 例                                                                | 問題点                              |
| ---- | ----------------------------------------------------------------- | ----------------------------------- |
| 悪い | `fix`                                                             | 何を修正したか分からない            |
| 悪い | `update`                                                          | 何を更新したか分からない            |
| 悪い | `修正`                                                            | 具体性がない                        |
| 悪い | `バグ直した`                                                      | どのバグか分からない                |
| 悪い | `あれこれ修正`                                                    | 複数の変更を1コミットにまとめている |
| 良い | `fix: ログインフォームで空メール送信時にクラッシュする問題を修正` | 具体的で分かりやすい                |
| 良い | `feat(auth): パスワードリセット機能を実装`                        | typeとscopeが明確                   |
| 良い | `refactor: UserServiceの認証ロジックを共通モジュールに抽出`       | 何をどうしたかが明確                |

### 複数行のコミットメッセージ

```bash
git commit -m "feat(cart): 買い物カゴの合計金額計算を実装

税込み・税抜きの切り替えに対応。
消費税率は設定ファイルから読み込む仕様。

Closes #42"
```

---

## タグ（リリース管理）

タグは特定のコミットに名前をつける機能。リリースのバージョン管理に使われる。

```bash
# 軽量タグ（名前だけ）
git tag v1.0.0

# 注釈付きタグ（推奨。メッセージ付き）
git tag -a v1.0.0 -m "バージョン1.0.0リリース"

# 過去のコミットにタグを付ける
git tag -a v0.9.0 -m "ベータリリース" a1b2c3d

# タグ一覧を表示
git tag

# 特定のパターンで絞り込み
git tag -l "v1.*"

# タグの詳細を表示
git show v1.0.0

# タグをリモートにプッシュ
git push origin v1.0.0

# 全てのタグをリモートにプッシュ
git push origin --tags

# タグを削除
git tag -d v1.0.0

# リモートのタグを削除
git push origin --delete v1.0.0
```

### セマンティックバージョニング

タグ名には**セマンティックバージョニング（SemVer）**がよく使われる。

```
v{MAJOR}.{MINOR}.{PATCH}
例: v1.2.3
```

| 要素  | いつ上げるか             | 例              |
| ----- | ------------------------ | --------------- |
| MAJOR | 後方互換性のない変更     | v1.0.0 → v2.0.0 |
| MINOR | 後方互換性のある機能追加 | v1.0.0 → v1.1.0 |
| PATCH | バグ修正                 | v1.0.0 → v1.0.1 |

---

## git bisect - バグの原因コミットを特定

`git bisect`は二分探索アルゴリズムを使って、バグが混入したコミットを効率的に特定するコマンド。100個のコミットがあっても、最大7回のテスト（log2(100)）で原因コミットを見つけられる。

### 使い方

```bash
# bisectを開始
git bisect start

# 現在のコミット（バグがある）を「bad」とマーク
git bisect bad

# バグがなかった時点のコミットを「good」とマーク
git bisect good v1.0.0

# Gitが中間のコミットをチェックアウトする
# → テストして、バグがあるかないかを判定

# バグがある場合
git bisect bad

# バグがない場合
git bisect good

# これを繰り返すと、原因コミットが特定される
# abc1234 is the first bad commit

# bisectを終了して元のブランチに戻る
git bisect reset
```

### 自動テストと組み合わせる

テストスクリプトがある場合、完全に自動化できる:

```bash
git bisect start
git bisect bad HEAD
git bisect good v1.0.0

# テストスクリプトを指定して自動実行
# スクリプトが終了コード0を返せば「good」、それ以外は「bad」
git bisect run npm test
```

### 具体的なシナリオ

「先週まで動いていたログイン機能が壊れている」という状況:

```bash
git bisect start
git bisect bad                    # 今のHEADはバグがある
git bisect good HEAD~50           # 50コミット前は動いていた

# Gitが25コミット目あたりをチェックアウト
# → テストする → バグなし
git bisect good

# Gitが37コミット目あたりをチェックアウト
# → テストする → バグあり
git bisect bad

# Gitが31コミット目あたりをチェックアウト
# → テストする → バグなし
git bisect good

# ... 数回繰り返し ...

# 結果: "commit abc1234 is the first bad commit"
# → このコミットの変更を確認すれば原因が分かる

git bisect reset
```

---

## git cherry-pick

特定のコミットだけを現在のブランチに取り込むコマンド。「別のブランチの特定の変更だけが欲しい」ときに使う。

```bash
# 特定のコミットを現在のブランチに適用
git cherry-pick a1b2c3d

# 複数のコミットを適用
git cherry-pick a1b2c3d e4f5g6h

# コミットせずに変更だけ取り込む
git cherry-pick --no-commit a1b2c3d

# cherry-pickを中止
git cherry-pick --abort
```

### 使用例

```
main:          A --- B --- C
                \
feature/login:   D --- E --- F --- G

# mainブランチにいるとき、feature/loginのコミットEだけが欲しい場合:
git switch main
git cherry-pick e4f5g6h  # コミットEのハッシュ

main:          A --- B --- C --- E'
                \
feature/login:   D --- E --- F --- G
```

### cherry-pickが有効な場面

- 別ブランチで作った修正を、リリースブランチにも適用したい
- 別ブランチの特定機能だけを先行して取り込みたい
- 間違えたブランチにコミットしてしまい、正しいブランチに移したい

**注意**: cherry-pickは同じ変更が異なるコミットハッシュで複数のブランチに存在することになるため、多用するとマージ時にコンフリクトが発生しやすくなる。ブランチ全体をマージできる場合はmergeを使うほうが良い。

---

## 実務でよくあるシナリオと対処法

### シナリオ1: 間違えてコミットしてしまった（まだプッシュしていない）

```bash
# コミットメッセージを間違えた → 直前のコミットメッセージを修正
git commit --amend -m "正しいメッセージ"

# ファイルを追加し忘れた → 直前のコミットにファイルを追加
git add forgotten-file.js
git commit --amend --no-edit

# コミット自体を取り消したい → 変更はワーキングツリーに残る
git reset HEAD~1
```

### シナリオ2: 間違えてプッシュしてしまった

```bash
# 方法1: revertで打ち消しコミットを作成（安全。推奨）
git revert HEAD
git push

# 方法2: 強制プッシュ（チームで使う場合は必ず相談してから）
git reset HEAD~1
git push --force-with-lease  # --forceより安全
```

`--force-with-lease`は、リモートが自分の知っている状態と一致する場合のみ強制プッシュを実行する。他の人が新しいコミットをプッシュしていた場合は失敗してくれるので、`--force`より安全。

### シナリオ3: 間違ったブランチにコミットしてしまった

```bash
# 例: mainブランチに直接コミットしてしまった。feature/loginに移したい

# 現在mainにいる。直前のコミットのハッシュをメモ
git log --oneline -1
# a1b2c3d feat: ログイン機能実装   ← このコミット

# mainのコミットを取り消す（変更は残る）
git reset HEAD~1

# 変更をstashに退避
git stash

# 正しいブランチに切り替え
git switch -c feature/login

# stashを復元
git stash pop

# 改めてコミット
git add .
git commit -m "feat: ログイン機能実装"
```

### シナリオ4: .envファイルをコミットしてしまった

```bash
# .envファイルを追跡対象から外す（ファイル自体は消えない）
git rm --cached .env

# .gitignoreに追加
echo ".env" >> .gitignore

# コミット
git add .gitignore
git commit -m "chore: .envをGit管理から除外"
```

**重要**: Gitの履歴には.envの内容が残っている。プッシュ済みの場合、APIキーやパスワードが漏洩した可能性がある。含まれていた秘密情報は全てローテーション（再発行）すること。履歴から完全に除去するには`git filter-branch`や`BFG Repo-Cleaner`を使う必要がある。

### シナリオ5: pullしたらコンフリクトした

```bash
# コンフリクトが発生したファイルを確認
git status

# VS Codeなどのエディタでコンフリクトを解決
code .

# 解決後、ファイルをステージしてコミット
git add .
git commit -m "merge: リモートの変更をマージ（コンフリクト解決）"
```

### シナリオ6: 直前のコミットに変更を追加したい（プッシュ前）

```bash
# 追加したいファイルをステージ
git add newly-added-file.js

# 直前のコミットに追加（メッセージは変更しない）
git commit --amend --no-edit
```

### シナリオ7: 作業中のブランチが古くなった

```bash
# mainの最新を取得
git fetch origin

# 方法1: rebaseで最新のmainの上に自分の変更を載せる
git rebase origin/main

# 方法2: mainをマージする
git merge origin/main
```

### シナリオ8: 消してしまったブランチを復元したい

```bash
# reflogで削除前の最後のコミットを探す
git reflog
# abc1234 HEAD@{5}: commit: feat: 最後のコミット (feature/deletedにいた)

# そのコミットからブランチを復元
git branch feature/deleted abc1234
```

### シナリオ9: git resetで消してしまった変更を復元したい

```bash
# reflogでreset前のコミットを探す
git reflog
# abc1234 HEAD@{1}: reset: moving to HEAD~3
# def5678 HEAD@{2}: commit: feat: 消えた変更

# reset前のコミットに戻る
git reset --hard def5678
```

`git reflog`はGitの「操作ログ」。HEADが指したコミットの履歴を記録しており、`reset`や`rebase`で「消えた」ように見えるコミットも、ここから復元できる（ただしガベージコレクションが実行されるまでの一定期間のみ）。

---

## 練習問題

### 演習1: 基本操作

```bash
# 1. 新しいディレクトリを作成してGitリポジトリを初期化する
mkdir git-practice && cd git-practice
git init

# 2. index.htmlを作成してコミットする
echo "<h1>Hello Git</h1>" > index.html
git add index.html
git commit -m "feat: index.htmlを作成"

# 3. style.cssを作成してコミットする
echo "h1 { color: blue; }" > style.css
git add style.css
git commit -m "feat: style.cssを作成"

# 4. ログを確認する
git log --oneline

# 5. index.htmlを編集して差分を確認する
echo "<p>Welcome</p>" >> index.html
git diff

# 6. 変更をステージしてコミットする
git add index.html
git commit -m "feat: index.htmlにウェルカムメッセージを追加"
```

### 演習2: ブランチ操作

```bash
# 1. featureブランチを作成して切り替える
git switch -c feature/about-page

# 2. about.htmlを作成してコミットする
echo "<h1>About</h1>" > about.html
git add about.html
git commit -m "feat: Aboutページを作成"

# 3. mainブランチに戻る
git switch main

# 4. about.htmlが存在しないことを確認する
ls about.html  # エラーになるはず

# 5. featureブランチをマージする
git merge feature/about-page

# 6. about.htmlが存在することを確認する
ls about.html  # 存在する

# 7. マージ済みのブランチを削除する
git branch -d feature/about-page
```

### 演習3: コンフリクトの解決

```bash
# 1. mainブランチでindex.htmlを編集してコミット
echo "<h1>Main Branch Title</h1>" > index.html
git add index.html
git commit -m "fix: mainブランチでタイトルを変更"

# 2. featureブランチを作成して同じ箇所を編集
git switch -c feature/title-change
echo "<h1>Feature Branch Title</h1>" > index.html
git add index.html
git commit -m "fix: featureブランチでタイトルを変更"

# 3. mainに戻ってマージ → コンフリクト発生
git switch main
git merge feature/title-change
# CONFLICT!

# 4. ファイルを開いてコンフリクトを解決する
# 5. 解決後にコミット
git add index.html
git commit -m "merge: タイトル変更のコンフリクトを解決"
```

---

## 参考リンク

- [Git公式ドキュメント](https://git-scm.com/doc) - Gitの公式リファレンスとマニュアル
- [Pro Git Book（日本語版、無料）](https://git-scm.com/book/ja/v2) - Gitの仕組みから応用まで網羅した無料書籍
- [Learn Git Branching](https://learngitbranching.js.org/?locale=ja) - 視覚的に学べるインタラクティブチュートリアル
- [gitignore.io](https://www.toptal.com/developers/gitignore) - .gitignoreの自動生成ツール
- [Conventional Commits仕様](https://www.conventionalcommits.org/ja/v1.0.0/) - コミットメッセージの標準フォーマット
- [GitHub Git Cheat Sheet](https://training.github.com/downloads/ja/github-git-cheat-sheet/) - よく使うGitコマンドの早見表
- [Atlassian Gitチュートリアル](https://www.atlassian.com/ja/git/tutorials) - 図解付きのGit入門ガイド
