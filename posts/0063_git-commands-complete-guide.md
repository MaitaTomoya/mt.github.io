---
id: 63
title: "Gitコマンド完全ガイド：164コマンドを網羅＋業務で使える実践Tips"
tags: ["Git", "コマンドライン", "バージョン管理", "開発効率化"]
create: "2026-03-22 11:34"
update: "2026-03-22 12:15"
---

普段`git add`、`git commit`、`git push`くらいしか使っていない...という人は多いのではないでしょうか。実はGitには**164以上のコマンド**が存在し、日々新しい機能が追加されています。この記事ではGitコマンドを網羅的に一覧化し、業務で使える実践的なコマンドや最新機能をまとめます。

## 目次

- [Gitコマンドの全体像](#gitコマンドの全体像)
- [業務で使えるコマンド厳選](#業務で使えるコマンド厳選)
- [常時使いしたいコマンドと設定](#常時使いしたいコマンドと設定)
- [Git 2.47〜2.52の新機能まとめ](#git-247252の新機能まとめ)
- [Gitコマンド完全一覧（164コマンド）](#gitコマンド完全一覧164コマンド)
- [まとめ](#まとめ)
- [参考リンク](#参考リンク)

## Gitコマンドの全体像

Gitのコマンドは大きく4つの層に分かれています。

| 層 | 説明 | 対象ユーザー |
|---|---|---|
| **Porcelain（メイン）** | 日常的に使う高レベルコマンド | 全員 |
| **Ancillary（補助）** | 設定・調査・操作の補助コマンド | 中級者〜 |
| **Interacting（外部連携）** | SVN、CVS等の他システム連携 | 移行時のみ |
| **Plumbing（低レベル）** | Gitの内部操作を行うコマンド | ツール開発者向け |

普段使うのはPorcelainの約50コマンドです。しかし補助コマンドにも**知っておくと作業が劇的に楽になるもの**が多数あります。まずは実践的なコマンドから見ていきましょう。全164コマンドの一覧表は[記事の最後](#gitコマンド完全一覧164コマンド)にまとめています。

---

## 業務で使えるコマンド厳選

ここからは**知っていると業務が楽になるコマンド**を実践シナリオ付きで紹介します。

### git switch / git restore -- checkoutを卒業する

Git 2.23（2019年）で追加された`switch`と`restore`は、`checkout`の機能を分離したコマンドです。`checkout`は「ブランチ切替」と「ファイル復元」の2つの役割を持っていて紛らわしかったため、明確に分けられました。

なお、**checkout、switch、restoreの3つとも廃止される予定はありません**（[公式ドキュメントで明言](https://zenn.dev/yoichi/articles/git-checkout-switch-restore)）。

```bash
# ブランチ操作は switch
git switch main                    # mainブランチに切替
git switch -c feature/new-page     # ブランチ作成+切替（-cはcreateの略）
git switch -                       # 直前のブランチに戻る

# ファイル復元は restore
git restore file.txt               # 作業ツリーの変更を元に戻す
git restore --staged file.txt      # ステージングを取り消す（ファイルは変更のまま）
git restore --source=HEAD~3 file.txt  # 3つ前のコミットの状態に復元
```

#### switchの主要オプション

| オプション | 説明 | コマンド例 |
|---|---|---|
| `-c` | **create**の略。新規ブランチを作成して切替 | `git switch -c feature/login` |
| `-C` | 既にブランチが存在しても強制的に作り直して切替 | `git switch -C feature/login` |
| `-d` | 特定のコミットに一時的に移動（detached HEAD） | `git switch -d abc1234` |
| `-` | 直前のブランチに戻る | `git switch -` |

旧コマンドの`git checkout -b`が`git switch -c`に対応します。`-b`（branch）から`-c`（create）に変わっただけで、やっていることは同じです。

### git worktree -- 並行作業の救世主

**「PRレビュー中に別の作業をしたい」**「**緊急のhotfixが入ったけど、今の作業を中断したくない**」というシーンで大活躍します。

#### worktreeがない場合の問題

通常、1つのリポジトリでは**1つのブランチしか同時に開けません**。別ブランチの作業をするには、今の変更をstashして、ブランチを切り替えて、終わったら戻して...という手間が発生します。

```bash
# worktreeなしの場合（面倒...）
git stash push -m "作業途中"     # 今の変更を退避
git switch hotfix/urgent-bug      # ブランチ切替
# ... hotfix作業 ...
git switch feature/login          # 元のブランチに戻る
git stash pop                     # 退避した変更を復元
```

#### worktreeを使うと

worktreeは**同じリポジトリの別ブランチを、別のディレクトリに同時に展開**できます。コミット履歴やリモート設定は共有しつつ、作業ディレクトリだけが独立します。

```
~/projects/
├── my-app/                  ← メインの作業ディレクトリ（feature/login ブランチ）
│   ├── src/
│   └── ...
└── my-app-hotfix/           ← worktreeで作った別ディレクトリ（hotfix/urgent-bug ブランチ）
    ├── src/
    └── ...
```

2つのディレクトリを**別々のエディタやターミナルで同時に開ける**ので、作業を中断する必要がありません。

```bash
# 別ディレクトリにブランチを展開
git worktree add ../my-app-hotfix hotfix/urgent-bug

# 新規ブランチを作りながら展開することも可能
git worktree add -b hotfix/urgent-bug ../my-app-hotfix main

# 作業ツリーの一覧を確認
git worktree list
# /Users/me/projects/my-app          abc1234 [feature/login]
# /Users/me/projects/my-app-hotfix   def5678 [hotfix/urgent-bug]

# hotfixディレクトリで作業
cd ../my-app-hotfix
# ... 修正してコミット＆プッシュ ...

# 作業完了後にクリーンアップ
git worktree remove ../my-app-hotfix
```

#### cloneとの違い

| | git worktree | git clone |
|---|---|---|
| **リポジトリ** | 1つを共有 | 完全に別のコピー |
| **ディスク容量** | 少ない（.gitを共有） | 多い（.gitも複製） |
| **コミット履歴** | リアルタイムで共有 | pushしないと反映されない |
| **用途** | 一時的な並行作業 | 独立した長期作業 |

**Claude Codeとの相性も抜群**です。Claude Codeのサブエージェントがworktreeを使って並列作業を行う仕組みが注目されています。

### git bisect -- バグ混入コミットを自動特定

「いつからこのバグが入った？」をコミット単位で特定できます。**二分探索アルゴリズム**を使うため、1000コミットあっても約10回の確認で特定できます。

```bash
# 二分探索を開始
git bisect start

# 現在のコミットはバグあり
git bisect bad

# このタグの時点ではバグなし
git bisect good v1.0

# Gitが中間のコミットをチェックアウトしてくれるので、テストして判定
git bisect good  # または git bisect bad

# テストスクリプトで自動化も可能
git bisect run npm test

# 完了後にリセット
git bisect reset
```

### git stash -- 一時退避の応用技

基本の`stash`/`pop`以外にも便利なオプションがあります。

```bash
# メッセージ付きで退避（複数stashの管理に便利）
git stash push -m "ログイン画面の途中"

# 未追跡ファイルも含めて退避
git stash push -u

# 一部のファイルだけ退避
git stash push -p  # 対話モードでhunk単位で選択

# stashの一覧と内容確認
git stash list
git stash show -p stash@{0}  # 差分を表示

# 特定のstashを適用（削除しない）
git stash apply stash@{2}

# 特定のstashを削除
git stash drop stash@{1}
```

### git maintenance -- リポジトリの自動最適化

リポジトリが大きくなると操作が遅くなります。`maintenance`はバックグラウンドで最適化を行います。

```bash
# バックグラウンド最適化を開始（cron/launchdに登録される）
git maintenance start

# 手動で特定のタスクを実行
git maintenance run --task=gc          # ガベージコレクション
git maintenance run --task=commit-graph # コミットグラフの更新
git maintenance run --task=prefetch     # リモートの事前取得

# 最適化を停止
git maintenance stop
```

### git rerere -- コンフリクト解決の再利用

「Re-use Recorded Resolution」の略。一度解決したコンフリクトのパターンを記録し、同じコンフリクトが再発した時に**自動で解決**してくれます。

```bash
# rerereを有効化（一度設定すればOK）
git config --global rerere.enabled true

# 以降、コンフリクト解決時に自動で記録される
# 同じコンフリクトが発生した時に自動適用される
```

リベースを繰り返すワークフローで特に効果を発揮します。

### git sparse-checkout -- 必要なファイルだけ取得

モノレポや巨大リポジトリで、必要なディレクトリだけをチェックアウトします。

```bash
# sparse-checkoutを有効化
git sparse-checkout init --cone

# 必要なディレクトリだけを指定
git sparse-checkout set src/frontend docs/

# 現在の設定を確認
git sparse-checkout list

# 無効化して全ファイルに戻す
git sparse-checkout disable
```

### git notes -- コミットに後からメモを追記

コミットメッセージとは別に、**コミットを変更せずに後から補足情報を追記**できます。

#### コミットメッセージとの違い

| | コミットメッセージ | git notes |
|---|---|---|
| **保存先** | コミットオブジェクト自体に含まれる | 別のrefに保存（`refs/notes/commits`） |
| **変更** | `--amend`が必要（コミットハッシュが変わる） | いつでも追加・編集可能（**ハッシュは変わらない**） |
| **push** | 通常の`git push`で送信される | `git push origin refs/notes/*`が別途必要 |
| **用途** | 変更の「何を・なぜ」を記録 | **後から補足情報を付け足す** |

**notesはデフォルトではpush/pullされない**ため、基本的に**自分用のメモ帳**として使います。チームで共有したい情報はコミットメッセージやPRのコメントに書くのが一般的です。

```bash
# コミットにメモを追加
git notes add -m "障害#123の原因コミットだった" abc1234

# メモを確認する方法
git notes show abc1234             # 特定コミットのメモを表示
git log --show-notes               # ログにメモを表示
git notes list                     # メモが付いたコミット一覧

# メモを編集・削除
git notes edit abc1234             # エディタで編集
git notes remove abc1234           # メモを削除
```

### git tag -- リリースの目印をつける

コミットに**固定の名前**を付ける機能です。ブックマークのようなイメージで、ブランチと違って**動きません**。

| | ブランチ | タグ |
|---|---|---|
| **動くか** | コミットするたびに進む | **固定**。動かない |
| **用途** | 開発中の作業線 | リリースや節目のマーキング |
| **例** | `main`, `feature/login` | `v1.0`, `v2.3.1` |

```bash
# 注釈付きタグ（メッセージ・署名付き。こちらが推奨）
git tag -a v1.0 -m "初回リリース"

# 軽量タグ（ただの名前付け）
git tag v1.0

# 特定コミットにタグを付ける
git tag -a v1.0 abc1234 -m "初回リリース"

# タグをリモートにpush（タグは自動pushされない）
git push origin v1.0
git push origin --tags             # 全タグを一括push

# タグを削除
git tag -d v1.0                    # ローカル
git push origin --delete v1.0      # リモート
```

実務ではリリースバージョン管理（`v1.0.0`など）やCI/CDのトリガー（「タグが付いたらデプロイ」）として使われます。

### git submodule -- リポジトリの中に別リポジトリを埋め込む

リポジトリの中に**別のリポジトリを埋め込む**機能です。「社内共通のUIコンポーネント集」を複数プロジェクトで使いたい場合などに使います。

```
my-project/（親リポジトリ）
├── src/
├── docs/
└── lib/ui-components/  ← 別リポジトリを埋め込み（サブモジュール）
```

親リポジトリが保存するのは**「どのリポジトリの、どのコミットを参照するか」**だけです。サブモジュールのバージョンは**コミットハッシュで固定**されるため、勝手に最新版になることはありません。

```bash
# サブモジュールを追加
git submodule add https://github.com/team/ui-components.git lib/ui-components

# クローン時にサブモジュールも取得
git clone --recurse-submodules https://github.com/user/my-project.git

# 既にクローン済みなら初期化+取得
git submodule update --init --recursive

# サブモジュールを最新に更新
git submodule update --remote
```

ただし実務では**サブモジュールは嫌われがち**です。`clone`時に`--recurse-submodules`を忘れてハマったり、親子の変更管理が複雑になるためです。最近は代わりに**モノレポ**（1つのリポジトリに全プロジェクトを入れる）や**npmパッケージ化**を選ぶチームが多いです。

### git range-diff -- PRの変更差分を比較

コードレビューで**「前回のレビュー指摘からどう変わったか」**を確認するのに最適です。

```bash
# v1とv2の差分を比較
git range-diff main..feature-v1 main..feature-v2

# force-push前後の差分を比較
git range-diff @{1}..@{1} @..@
```

---

## 常時使いしたいコマンドと設定

### おすすめgit config設定

```bash
# プルの時にリベースをデフォルトにする
git config --global pull.rebase true

# マージ時にコンフリクト解決を記録
git config --global rerere.enabled true

# push時にローカルブランチ名と同名のリモートブランチに自動push
git config --global push.autoSetupRemote true

# ブランチ一覧をソート（最新コミット順）
git config --global branch.sort -committerdate

# diffを見やすくする
git config --global diff.algorithm histogram

# 差分の表示に色を付ける（移動した行を検出）
git config --global diff.colorMoved default

# デフォルトブランチ名をmainに
git config --global init.defaultBranch main
```

### 便利なエイリアス

```bash
# ログを見やすく
git config --global alias.lg "log --oneline --graph --all --decorate"

# ステータスの短縮表示
git config --global alias.st "status -sb"

# 直前のコミットを修正（メッセージそのまま）
git config --global alias.amend "commit --amend --no-edit"

# 未マージブランチ一覧
git config --global alias.unmerged "branch --no-merged"

# 最後のコミットの差分を表示
git config --global alias.last "diff HEAD~1"

# stashの一覧
git config --global alias.sl "stash list"
```

### 日常的に使えるオプション

```bash
# diff系
git diff --stat                   # 変更ファイル名と行数のサマリー
git diff --name-only              # 変更ファイル名だけ
git diff --word-diff              # 単語単位の差分表示

# log系
git log --oneline --graph --all   # ブランチの分岐を可視化
git log --since="1 week ago"      # 1週間以内のコミット
git log --author="name"           # 特定の著者のコミット
git log -p -- path/to/file        # 特定ファイルの変更履歴（差分付き）
git log -S "searchTerm"           # 特定の文字列を追加/削除したコミットを検索

# branch系
git branch -vv                    # 追跡ブランチとの差分を表示
git branch --merged main          # mainにマージ済みのブランチ
git branch -d $(git branch --merged main | grep -v main)  # マージ済みブランチを一括削除
```

---

## Git 2.47〜2.52の新機能まとめ

2024年後半〜2025年にリリースされたGitの注目新機能です。

### Git 2.47（2024年10月）

| 新機能 | 説明 |
|---|---|
| incremental multi-pack indexes | パックインデックスの増分更新。大規模リポジトリのパフォーマンス改善 |
| ハッシュ関数の最適化 | fetch/cloneの処理が**10〜13%高速化** |

### Git 2.48（2025年1月）

| 新機能 | 説明 |
|---|---|
| 93人のコントリビュータ参加 | うち35人が新規。コミュニティの活発さが伺える |
| reftable対応の進展 | 次世代ブランチ保存形式への移行準備 |

### Git 2.49（2025年3月）

| 新機能 | 説明 |
|---|---|
| `git backfill` | sparse-checkoutで、歴史的コンテンツを一括ダウンロード |
| 新ハッシュ関数 | ディレクトリ構造を考慮し、パックサイズが大幅に削減 |
| `git clone --revision` | 特定のコミットだけをクローン可能に |
| `git gc --expire-to` | 削除前にオブジェクトを別の場所に保存 |
| `git refs verify` | ブランチやタグの整合性を自動チェック |

### Git 2.50（2025年6月）

| 新機能 | 説明 |
|---|---|
| `git fast-export --signed-commits` | コミット署名のエクスポートに対応 |
| cruft packsの改善 | 不要オブジェクトのパック処理が改善 |

### Git 2.51（2025年8月）

| 新機能 | 説明 |
|---|---|
| SHA-1/SHA-256署名の同時インポート | 将来のハッシュ移行に向けた準備 |

### Git 2.52（2025年11月）

| 新機能 | 説明 |
|---|---|
| SHA-1→SHA-256移行の基盤 | **Git 3.0に向けた**ハッシュアルゴリズム置き換えの準備 |
| `git last-modified` | ディレクトリの最終更新コミットを一括取得 |
| Mesonビルド対応 | 新しいビルドシステムへの対応 |
| Rust再実装の開始 | 一部コンポーネントのRust化が進行中 |

### Git 3.0（2026年末予定）

- SHA-1からSHA-256への移行が予定されている
- 公式ドキュメントで変更予定の整理が始まっている
- 後方互換性に影響する変更が含まれる可能性あり

---

## Gitコマンド完全一覧（164コマンド）

ここからはGitの全コマンドをカテゴリ別に一覧化します。辞書的にお使いください。

### メインコマンド（Porcelain Commands）

日常の開発で使う主要コマンドです。

#### リポジトリの作成・取得

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git init` | 新しいリポジトリを作成 | `git init my-project` |
| `git clone` | リポジトリを複製 | `git clone https://github.com/user/repo.git` |

#### スナップショットの作成

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git add` | 変更をステージングエリアに追加 | `git add .` / `git add -p`（対話的に追加） |
| `git status` | 作業ツリーの状態を表示 | `git status -s`（短縮表示） |
| `git diff` | 変更の差分を表示 | `git diff --staged`（ステージング済みの差分） |
| `git commit` | 変更を記録 | `git commit -m "メッセージ"` |
| `git notes` | コミットにメモを追加 | `git notes add -m "補足情報" HEAD` |
| `git restore` | 作業ツリーのファイルを復元 | `git restore file.txt` / `git restore --staged file.txt` |
| `git reset` | HEADを指定した状態にリセット | `git reset --soft HEAD~1` |
| `git rm` | ファイルを削除しインデックスから除去 | `git rm --cached secret.txt`（Git管理のみ解除） |
| `git mv` | ファイルを移動またはリネーム | `git mv old.txt new.txt` |
| `git clean` | 未追跡ファイルを削除 | `git clean -fd`（ディレクトリごと削除） |

#### ブランチとマージ

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git branch` | ブランチの一覧・作成・削除 | `git branch -a`（全ブランチ表示） |
| `git checkout` | ブランチ切替・ファイル復元 | `git checkout -b new-branch`（作成+切替） |
| `git switch` | ブランチ切替専用（Git 2.23+） | `git switch -c new-branch`（作成+切替） |
| `git merge` | ブランチを統合 | `git merge feature --no-ff` |
| `git rebase` | コミットを別のベースに再適用 | `git rebase -i HEAD~3`（対話的リベース） |
| `git cherry-pick` | 特定のコミットを適用 | `git cherry-pick abc1234` |
| `git revert` | コミットを打ち消す新コミットを作成 | `git revert HEAD` |
| `git stash` | 作業中の変更を一時退避 | `git stash push -m "作業中"` / `git stash pop` |
| `git tag` | タグの作成・一覧・削除 | `git tag -a v1.0 -m "リリース"` |
| `git worktree` | 複数の作業ツリーを管理 | `git worktree add ../hotfix hotfix-branch` |

#### 履歴の確認

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git log` | コミット履歴を表示 | `git log --oneline --graph --all` |
| `git shortlog` | コミット履歴を著者別に集約 | `git shortlog -sn`（コミット数順） |
| `git show` | コミットやオブジェクトの詳細表示 | `git show HEAD:src/app.ts`（特定ファイルの内容） |
| `git describe` | 直近のタグからの距離を表示 | `git describe --tags` |
| `git range-diff` | 2つのコミット範囲を比較 | `git range-diff main..feature-v1 main..feature-v2` |

#### リモート操作

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git fetch` | リモートの変更を取得（マージしない） | `git fetch --prune`（削除済みブランチも反映） |
| `git pull` | fetch + merge を一括実行 | `git pull --rebase`（マージコミットを作らない） |
| `git push` | ローカルの変更をリモートに送信 | `git push -u origin feature` |
| `git remote` | リモートリポジトリの管理 | `git remote -v`（URLを表示） |
| `git submodule` | サブモジュールの管理 | `git submodule update --init --recursive` |

#### パッチ操作

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git format-patch` | パッチファイルを作成 | `git format-patch HEAD~3`（直近3コミット） |
| `git am` | メールボックス形式のパッチを適用 | `git am < patch-file.patch` |
| `git apply` | パッチをファイルに適用 | `git apply --check patch.diff`（適用前テスト） |

#### 調査・デバッグ

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git bisect` | 二分探索でバグ混入コミットを特定 | `git bisect start` → `git bisect bad` → `git bisect good v1.0` |
| `git grep` | リポジトリ内のパターン検索 | `git grep -n "TODO"`（行番号付き） |
| `git blame` | 各行の最終変更者を表示 | `git blame -L 10,20 file.txt`（10〜20行目） |

#### その他のメインコマンド

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git archive` | ファイルのアーカイブを作成 | `git archive --format=zip HEAD -o release.zip` |
| `git bundle` | オブジェクトとrefをアーカイブで移動 | `git bundle create repo.bundle --all` |
| `git gc` | 不要オブジェクトの削除と最適化 | `git gc --aggressive` |
| `git maintenance` | リポジトリの自動最適化タスク実行 | `git maintenance start`（バックグラウンド最適化開始） |
| `git scalar` | 大規模リポジトリの管理ツール | `git scalar clone https://github.com/large/repo.git` |
| `git sparse-checkout` | 作業ツリーを特定ファイルに限定 | `git sparse-checkout set src/ docs/` |
| `git citool` | グラフィカルなコミットツール | `git citool` |
| `git gui` | Git操作のGUIツール | `git gui` |
| `git gitk` | リポジトリブラウザ（GUI） | `gitk --all` |
| `git whatchanged` | コミットごとの差分付きログ | `git whatchanged --since="2 weeks ago"` |

### 補助コマンド（Ancillary Commands）

#### 操作系（Manipulators）

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git config` | Gitの設定を管理 | `git config --global user.name "名前"` |
| `git reflog` | HEADの移動履歴を表示 | `git reflog`（誤操作の復元に必須） |
| `git remote` | リモートリポジトリの管理 | `git remote add upstream URL` |
| `git filter-branch` | ブランチ履歴の書き換え | `git filter-branch --tree-filter 'rm -f secret.txt' HEAD` |
| `git fast-export` | リポジトリデータのエクスポート | `git fast-export --all > export.dat` |
| `git fast-import` | データの高速インポート | `git fast-import < export.dat` |
| `git mergetool` | マージコンフリクト解消ツールを起動 | `git mergetool`（設定済みツールが起動） |
| `git pack-refs` | refを効率的にパック | `git pack-refs --all` |
| `git prune` | 到達不能オブジェクトを削除 | `git prune --dry-run`（削除対象の確認） |
| `git repack` | パックファイルを再構成 | `git repack -a -d` |
| `git replace` | オブジェクトの参照を置き換え | `git replace old-commit new-commit` |

#### 調査系（Interrogators）

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git annotate` | ファイルの各行にコミット情報を注釈 | `git annotate file.txt`（blameとほぼ同機能） |
| `git blame` | 各行の最終変更コミットと著者を表示 | `git blame -w file.txt`（空白変更を無視） |
| `git bugreport` | バグレポート用の情報を収集 | `git bugreport` |
| `git count-objects` | オブジェクト数とディスク使用量を表示 | `git count-objects -v` |
| `git diagnose` | 診断情報のzipアーカイブを生成 | `git diagnose` |
| `git difftool` | 外部diffツールで差分を表示 | `git difftool HEAD~1`（VSCodeなどで表示） |
| `git fsck` | オブジェクトの整合性を検証 | `git fsck --full` |
| `git gitweb` | Web上でリポジトリを閲覧 | `git instaweb`（簡易Webサーバー起動） |
| `git help` | ヘルプ情報を表示 | `git help -a`（全コマンド一覧） |
| `git instaweb` | gitwebをブラウザで即座に起動 | `git instaweb --httpd=python` |
| `git merge-tree` | インデックスを変更せずにマージを実行 | `git merge-tree HEAD feature-branch` |
| `git rerere` | コンフリクト解決の記録と再利用 | `git config rerere.enabled true`（有効化） |
| `git show-branch` | ブランチとコミットの関係を表示 | `git show-branch --all` |
| `git verify-commit` | コミットのGPG署名を検証 | `git verify-commit HEAD` |
| `git verify-tag` | タグのGPG署名を検証 | `git verify-tag v1.0` |
| `git version` | Gitのバージョンを表示 | `git version` |

### 外部連携コマンド

他のバージョン管理システムとの連携に使用します。移行プロジェクト以外では使う機会はあまりありません。

| コマンド | 説明 | 用途 |
|---|---|---|
| `git svn` | Subversionリポジトリとの双方向連携 | SVN→Git移行 |
| `git p4` | Perforceリポジトリとの連携 | Perforce→Git移行 |
| `git cvsimport` | CVSリポジトリからのインポート | CVS→Git移行 |
| `git cvsexportcommit` | 単一コミットをCVSにエクスポート | Git→CVS連携 |
| `git cvsserver` | Git用CVSサーバーエミュレータ | CVSクライアント互換 |
| `git archimport` | GNU Archリポジトリからのインポート | Arch→Git移行 |
| `git imap-send` | パッチをIMAPフォルダに送信 | メールベースのレビュー |
| `git send-email` | パッチをメールで送信 | Linuxカーネル開発等 |
| `git request-pull` | 保留中の変更のサマリーを生成 | プルリクエストの原型 |
| `git quiltimport` | quiltパッチセットを適用 | パッチ管理ツール連携 |

### 低レベルコマンド（Plumbing Commands）

Gitの内部構造を直接操作するコマンドです。通常の開発では使いませんが、ツール開発やトラブルシューティングで役立ちます。

#### オブジェクト操作

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git cat-file` | オブジェクトの内容や種類を表示 | `git cat-file -p HEAD`（コミット内容を表示） |
| `git hash-object` | データのオブジェクトIDを計算 | `git hash-object file.txt` |
| `git mktag` | タグオブジェクトを作成 | `git mktag < tag-data` |
| `git mktree` | ツリーオブジェクトを作成 | `git mktree < tree-listing` |
| `git commit-tree` | コミットオブジェクトを作成 | `git commit-tree tree-hash -m "msg"` |
| `git commit-graph` | コミットグラフファイルの書き込み/検証 | `git commit-graph write --reachable` |
| `git multi-pack-index` | マルチパックインデックスの管理 | `git multi-pack-index write` |

#### インデックス操作

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git read-tree` | ツリー情報をインデックスに読み込み | `git read-tree --prefix=sub/ HEAD:lib/` |
| `git write-tree` | インデックスからツリーオブジェクトを作成 | `git write-tree` |
| `git update-index` | インデックスにファイル内容を登録 | `git update-index --assume-unchanged file.txt` |
| `git checkout-index` | インデックスから作業ツリーにコピー | `git checkout-index -a` |
| `git ls-files` | インデックスと作業ツリーのファイル情報 | `git ls-files --others --exclude-standard`（未追跡ファイル） |
| `git ls-tree` | ツリーオブジェクトの内容を一覧表示 | `git ls-tree -r HEAD`（全ファイル） |

#### 差分と比較

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git diff-files` | 作業ツリーとインデックスの差分 | `git diff-files` |
| `git diff-index` | ツリーと作業ツリー/インデックスの差分 | `git diff-index HEAD` |
| `git diff-tree` | 2つのツリーオブジェクトの差分 | `git diff-tree HEAD~1 HEAD` |
| `git merge-base` | マージの共通祖先を検索 | `git merge-base main feature` |
| `git merge-file` | 3-wayファイルマージを実行 | `git merge-file mine.txt base.txt theirs.txt` |
| `git merge-index` | マージが必要なファイルにマージを実行 | `git merge-index git-merge-one-file -a` |
| `git patch-id` | パッチの一意なIDを計算 | `git diff HEAD~1 | git patch-id` |

#### 参照（Ref）操作

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git for-each-ref` | 各refの情報を出力 | `git for-each-ref --sort=-creatordate refs/tags/` |
| `git for-each-repo` | リポジトリ一覧にコマンドを実行 | `git for-each-repo --config=maintenance.repo git gc` |
| `git symbolic-ref` | シンボリックrefの読み書き | `git symbolic-ref HEAD`（現在のブランチ） |
| `git update-ref` | refのオブジェクト名を安全に更新 | `git update-ref refs/heads/main HEAD` |
| `git show-ref` | ローカルのrefを一覧表示 | `git show-ref --tags`（タグ一覧） |
| `git ls-remote` | リモートのrefを一覧表示 | `git ls-remote origin` |
| `git name-rev` | revの記号名を検索 | `git name-rev HEAD` |
| `git rev-list` | コミットオブジェクトを逆順で一覧表示 | `git rev-list --count HEAD`（総コミット数） |
| `git rev-parse` | パラメータを解析 | `git rev-parse --short HEAD`（短縮ハッシュ） |
| `git cherry` | 未適用のコミットを検索 | `git cherry -v main feature` |

#### パック操作

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git pack-objects` | オブジェクトのパックアーカイブを作成 | `git pack-objects --all pack` |
| `git unpack-objects` | パックからオブジェクトを展開 | `git unpack-objects < pack-file` |
| `git index-pack` | パックのインデックスファイルを作成 | `git index-pack pack-file.pack` |
| `git prune-packed` | パック済みの余分なオブジェクトを削除 | `git prune-packed` |
| `git verify-pack` | パックアーカイブの検証 | `git verify-pack -v pack-file.idx` |
| `git show-index` | パックアーカイブのインデックスを表示 | `git show-index < pack-file.idx` |
| `git unpack-file` | blobの内容で一時ファイルを作成 | `git unpack-file blob-hash` |
| `git get-tar-commit-id` | アーカイブからコミットIDを抽出 | `git get-tar-commit-id < archive.tar` |

#### リポジトリ同期（サーバー）

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git daemon` | Gitリポジトリのシンプルサーバー | `git daemon --base-path=/srv/git` |
| `git fetch-pack` | 他リポジトリから不足オブジェクトを受信 | `git fetch-pack remote-url` |
| `git send-pack` | Gitプロトコルでオブジェクトを送信 | `git send-pack remote-url` |
| `git http-backend` | HTTP越しのGitサーバー実装 | Apache/Nginx経由で使用 |
| `git update-server-info` | ダムサーバー用の補助情報を更新 | `git update-server-info` |

#### 内部ヘルパー

| コマンド | 説明 | コマンド例 |
|---|---|---|
| `git check-attr` | gitattributes情報を表示 | `git check-attr diff -- file.txt` |
| `git check-ignore` | gitignore/excludeファイルのデバッグ | `git check-ignore -v file.txt`（どのルールで無視されたか） |
| `git check-mailmap` | mailmapの正規名とメールを表示 | `git check-mailmap "Author Name"` |
| `git check-ref-format` | ref名が正しい形式か検証 | `git check-ref-format refs/heads/main` |
| `git column` | データを列形式で表示 | `echo -e "a\nb\nc" | git column` |
| `git credential` | ユーザー認証情報の取得と保存 | `git credential fill` |
| `git credential-cache` | パスワードを一時的にメモリに保存 | `git config credential.helper cache` |
| `git credential-store` | 認証情報をディスクに保存 | `git config credential.helper store` |
| `git fmt-merge-msg` | マージコミットメッセージを生成 | `git fmt-merge-msg < .git/FETCH_HEAD` |
| `git hook` | Gitフックを実行 | `git hook run pre-commit` |
| `git interpret-trailers` | コミットメッセージにトレーラーを追加/解析 | `git interpret-trailers --trailer "Signed-off-by: Name"` |
| `git mailinfo` | メールからパッチと著者情報を抽出 | `git mailinfo msg patch < email.txt` |
| `git mailsplit` | mboxファイルを分割 | `git mailsplit -o patches/ mbox` |
| `git merge-one-file` | merge-indexと連携する標準ヘルパー | `git merge-index git-merge-one-file -a` |
| `git sh-i18n` | シェルスクリプト用i18nセットアップ | Gitスクリプト内部で使用 |
| `git sh-setup` | シェルスクリプト用共通セットアップ | Gitスクリプト内部で使用 |
| `git stripspace` | 不要な空白を除去 | `echo " hello " | git stripspace` |
| `git var` | Gitの論理変数を表示 | `git var GIT_EDITOR`（使用エディタ） |

---

## まとめ

- Gitには**164以上のコマンド**が存在するが、日常的に使うのは約30〜50コマンド
- `git switch`/`git restore`は`checkout`の明確な代替。**廃止予定はない**ので安心して移行できる
- `git worktree`、`git bisect`、`git rerere`は知っているだけで業務効率が大きく変わる
- `git maintenance`でリポジトリの自動最適化が可能
- Git 2.49で追加された`git backfill`、`git clone --revision`はモノレポ運用で効果大
- **Git 3.0（2026年末予定）**でSHA-256移行が予定されているため、今後の動向に注目

基本コマンドだけでなく、一歩踏み込んだコマンドを知っていると、日々の開発がずっと快適になります。まずは`git switch`と`git restore`から使い始めてみてください。

## 参考リンク

- [So You Think You Know Git? - Scott Chacon（FOSDEM 2024）](https://blog.gitbutler.com/fosdem-git-talk/) - Pro Git著者による「知らないGit機能」大量紹介
- [So You Think You Know Git - Part 2](https://speakerdeck.com/schacon/so-you-think-you-know-git-part-2) - 続編スライド
- [Highlights from Git 2.49 - GitHub Blog](https://github.blog/open-source/git/highlights-from-git-2-49/) - git backfill等の新機能
- [Highlights from Git 2.50 - GitHub Blog](https://github.blog/open-source/git/highlights-from-git-2-50/)
- [Highlights from Git 2.51 - GitHub Blog](https://github.blog/open-source/git/highlights-from-git-2-51/)
- [Highlights from Git 2.52 - GitHub Blog](https://github.blog/open-source/git/highlights-from-git-2-52/)
- [2024年後半〜2025年前半のGitアップデートまとめ](https://yurupro.cloud/4064/) - 日本語まとめ
- [2025年版Git最新情報まとめ - ENECHANGE](https://tech.enechange.co.jp/entry/2025/12/12/112101) - last-modified、Rust導入等
- [まだgit checkout使ってるの？switch/restoreに移行すべき理由](https://qiita.com/kenimo49/items/88f3e5a251b2968d9f0c)
- [git checkoutもgit switch/restoreも廃止されません](https://zenn.dev/yoichi/articles/git-checkout-switch-restore) - 廃止の誤解を解消
- [Git Worktree & ghq入門](https://zenn.dev/genda_jp/articles/2025-12-07-manage-git-worktree-with-ghq) - worktreeの実践活用
- [Git公式ドキュメント](https://git-scm.com/docs)
- [Gitの20年：作者Linus Torvaldsとの対話](https://riscv.or.jp/2025/05/git20y/)
