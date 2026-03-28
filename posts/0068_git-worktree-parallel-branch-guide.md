---
id: 68
title: "git worktree入門 -- 複数ターミナルで別ブランチを同時に作業する方法"
tags: [Git, git worktree, ブランチ, 並列作業, 開発効率化, Claude Code, 初心者向け]
create: "2026-03-28 09:42"
---

複数のターミナルで同じリポジトリを開いて作業していると、片方で`git checkout`したら**もう片方のブランチも変わってしまった**という経験はないだろうか。この記事では、その問題を根本的に解決する`git worktree`を中心に、複数ブランチを並列で作業する方法を解説する。

### 対象読者

- 複数のターミナルやIDEウィンドウで同時に開発している方
- ブランチ切り替えのたびに作業が中断されて困っている方
- AIエージェント（Claude Code等）で複数タスクを並列に進めたい方
- `git worktree`という機能を初めて知った方

---

## そもそも何が問題なのか

### 「片方でcheckoutしたら、もう片方も変わった」問題

開発中によくあるシチュエーションを見てみよう。

```
ターミナルA: ~/my-project (feature/a)  ← 新機能を開発中
ターミナルB: ~/my-project (feature/a)  ← 同じディレクトリを開いている
```

ここでターミナルBから緊急のバグ修正をするために、ブランチを切り替える。

```bash
# ターミナルBで実行
$ git checkout fix/urgent-bug
```

すると、こうなる。

```
ターミナルA: ~/my-project (fix/urgent-bug)  ← 勝手に変わった！開発中のファイルが消えた！
ターミナルB: ~/my-project (fix/urgent-bug)
```

**ターミナルAで編集していたファイルが突然別ブランチのものに変わってしまう。** 未保存の変更は消え、IDEは混乱し、最悪の場合は作業がやり直しになる。

### なぜこうなるのか

原因はシンプルで、**同じディレクトリ（同じ`.git`）を見ているから**である。

Gitのブランチ情報は`.git/HEAD`ファイルに記録されている。同じディレクトリを複数のターミナルで開いても、参照している`.git`は1つだけ。だから片方で`checkout`すれば全ターミナルに影響する。

```
~/my-project/
├── .git/          ← ブランチ情報はここに1つだけ
│   └── HEAD       ← "ref: refs/heads/feature/a" と書かれている
├── src/           ← HEADが指すブランチのファイルが展開される
└── ...
```

この仕組みを理解すれば、解決策も見えてくる。**作業フォルダを分ければいい**のだ。

---

## 解決策の全体像

複数ブランチを並列で作業する方法は主に3つある。

| 項目 | git worktree | 複数クローン | git stash + 切替 |
|------|:----------:|:----------:|:----------:|
| **並列作業** | 可能 | 可能 | 不可能（逐次のみ） |
| **ディスク使用量** | 最小（.git共有） | 大（履歴が重複） | 追加なし |
| **同一ブランチの同時作業** | 不可 | 可能 | N/A |
| **git fetch回数** | 1回で全体に反映 | 各クローンで個別に必要 | 1回 |
| **依存関係のインストール** | 各worktreeで必要 | 各クローンで必要 | 不要 |
| **セットアップの手軽さ** | 簡単 | やや面倒 | 最も簡単 |
| **AIエージェント並列** | 最適 | 可能だが重い | 不可能 |

結論から言うと、**ほとんどのケースで`git worktree`が最適解**である。以降、worktreeを中心に詳しく解説していく。

---

## git worktreeとは

### 一言で言うと

**1つのリポジトリから複数の作業フォルダを作れるGitの組み込み機能。** Git 2.5（2015年リリース）から使える。

### 通常のGitとworktreeの違い

**通常のGit（1つのフォルダに1つのブランチ）:**

```
~/my-project/          ← 1つのブランチしか開けない
├── .git/              ← 履歴データ
├── src/
└── ...
```

**worktreeを使った場合（フォルダごとに別ブランチ）:**

```
~/my-project/                ← mainブランチ（メインの作業場所）
├── .git/                    ← 履歴データ（ここを全worktreeで共有）
├── src/
└── ...

~/my-project-feature-a/     ← feature/aブランチ（別フォルダ）
├── src/
└── ...

~/my-project-fix-b/         ← fix/bブランチ（別フォルダ）
├── src/
└── ...
```

**ポイント:**
- `.git`フォルダ（コミット履歴やリモート設定）は**共有**される
- 作業ファイル・ステージングエリア・HEADは各worktreeで**独立**
- だから別のworktreeで`checkout`しても、他のworktreeには一切影響しない

### 身近な例え

- **通常のGit** = 1つの机で1つの書類しか広げられない。別の書類を見たければ今の書類を片付ける必要がある
- **worktree** = 机を複数用意して、それぞれに別の書類を広げておける。いつでもどの机にも行ける

---

## 実践: worktreeを使った並列作業の手順

「ターミナルAでfeature/aの開発をしながら、ターミナルBで緊急のバグ修正をする」という実際の作業シナリオで手順を見ていこう。

### Step 1: 現在の状態を確認する

```bash
# ターミナルA（メインの作業場所）
$ pwd
/Users/user/my-project

$ git branch
* feature/a    ← 現在このブランチで開発中
  develop
  main
```

### Step 2: 緊急バグ修正用のworktreeを作成する

```bash
# ターミナルA or Bどちらからでも実行可能
$ git worktree add ../my-project-hotfix -b fix/urgent-bug develop
```

このコマンドを分解すると以下のようになる。

| 部分 | 意味 |
|------|------|
| `git worktree add` | worktreeを新しく作成する |
| `../my-project-hotfix` | worktreeのフォルダパス（どこに作るか） |
| `-b fix/urgent-bug` | 新しいブランチ`fix/urgent-bug`を作成 |
| `develop` | `develop`ブランチから分岐する |

実行すると`../my-project-hotfix`フォルダが作られ、`develop`から分岐した`fix/urgent-bug`ブランチがチェックアウトされた状態になる。

### Step 3: ターミナルBでworktreeに移動して作業する

```bash
# ターミナルB
$ cd ../my-project-hotfix

$ git branch
  feature/a
  develop
  main
* fix/urgent-bug    ← このworktree専用のブランチ

# バグ修正を実施
$ vim src/api/handler.ts
$ git add src/api/handler.ts
$ git commit -m "fix: 緊急バグ修正"
$ git push origin fix/urgent-bug
```

### Step 4: ターミナルAは影響を受けていない

```bash
# ターミナルA（何も変わっていない）
$ git branch
* feature/a    ← そのまま作業を継続できる
  develop
  main
```

**これがworktreeの最大のメリットである。** 別のフォルダで別のブランチの作業をしても、メインの作業場所には一切影響しない。

### Step 5: 複数worktreeを同時に使う場合

3つ以上の作業を並列で進めることもできる。

```bash
# developから2つのworktreeを追加作成
$ git worktree add ../my-project-feature-b -b feature/b develop
$ git worktree add ../my-project-fix-css -b fix/css-layout develop

# 一覧を確認
$ git worktree list
/Users/user/my-project              abc1234 [feature/a]
/Users/user/my-project-feature-b    def5678 [feature/b]
/Users/user/my-project-fix-css      ghi9012 [fix/css-layout]
```

```
ターミナルA: ~/my-project           → feature/aの開発
ターミナルB: ~/my-project-feature-b  → feature/bの開発
ターミナルC: ~/my-project-fix-css    → CSSのバグ修正

全て独立しており、互いに干渉しない
```

### Step 6: 依存関係のインストールを忘れずに

worktreeで共有されるのは`.git`の中身だけである。`node_modules`や`vendor`などの依存パッケージは**各worktreeで個別にインストールが必要**。

```bash
$ cd ../my-project-feature-b
$ npm install          # Node.jsプロジェクトの場合
# $ bundle install     # Rubyプロジェクトの場合
# $ pip install -r requirements.txt  # Pythonプロジェクトの場合
```

---

## worktreeでの作業時の注意点

### やってはいけない4つのNG操作

| NG操作 | 何が起きるか | 正しい対処法 |
|--------|-------------|-------------|
| worktreeフォルダを`rm -rf`で直接削除する | `.git/worktrees/`にメタデータが残りゴミが蓄積する | 必ず`git worktree remove`を使う |
| 同一ブランチを複数worktreeでチェックアウトする | インデックスが競合し、コミットが壊れる可能性がある | 1ブランチ = 1worktreeを厳守 |
| worktree内で`git checkout`して別ブランチに切り替える | そのworktreeの意味がなくなり、元のworktreeとブランチが競合する可能性がある | 新しいブランチが必要なら新しいworktreeを作る |
| メインリポジトリでworktreeが使用中のブランチを削除する | worktreeが参照するブランチが消え、壊れた状態になる | 先にworktreeを削除してからブランチを削除する |

### 共有されるもの / されないもの

worktreeを使う上で、何が共有されて何が独立しているかを理解しておくことは重要である。

```
共有される（全worktreeで同じ）:
  ├── .git/objects/     # コミット履歴、ファイルデータ
  ├── .git/refs/        # ブランチ、タグの参照
  ├── .git/config       # リモート設定
  ├── .git/hooks/       # Gitフック（pre-commit等）
  └── .gitignore        # 無視ルール（リポジトリに含まれている場合）

共有されない（各worktreeで独立）:
  ├── HEAD              # 現在チェックアウトしているブランチ
  ├── index             # ステージングエリア（git addした内容）
  ├── node_modules/     # 依存パッケージ
  ├── .env              # 環境変数ファイル
  ├── dist/ / build/    # ビルド成果物
  └── その他の作業ファイル
```

**特に注意すべき点:**
- `.env`ファイルはworktreeごとに設置が必要。コピーし忘れると環境変数が読み込めずアプリが起動しない
- `node_modules/`は各worktreeでインストールが必要。ディスク容量を消費するので、不要になったworktreeは早めに削除する
- `git fetch`は1回実行すれば全worktreeに反映される。これはworktreeの大きなメリットである

### IDEでの注意点

- **VSCode**: 各worktreeを**別ウィンドウ**で開く。同じウィンドウのマルチルートワークスペースに複数worktreeを入れると混乱しやすい
- **JetBrains系（IntelliJ、WebStorm等）**: 各worktreeを**別プロジェクト**として開く。Gitの認識は自動で行われる
- worktreeフォルダをIDEで開くと、そのフォルダがプロジェクトルートとして認識される。パスの解決もそのフォルダが基準になる

---

## コミットからPR作成、クリーンアップまでの完全手順

worktreeでの作業は「作成 → 作業 → コミット → PR → クリーンアップ」の5フェーズで進める。

### フェーズ1: worktreeの作成と作業開始

```bash
# 1. メインリポジトリで最新の状態を取得
$ cd ~/my-project
$ git fetch origin

# 2. worktreeを作成（developブランチから分岐する例）
$ git worktree add ../my-project-feature-x -b feature/x origin/develop

# 3. worktreeに移動
$ cd ../my-project-feature-x

# 4. 依存関係のインストール
$ npm install

# 5. 作業開始
```

`origin/develop`を指定しているのは、リモートの最新のdevelopブランチから分岐するためである。ローカルの`develop`が古い場合、`git fetch`してから`origin/develop`を基点にするのがベストプラクティスである。

### フェーズ2: コミットとプッシュ

worktree内でのGit操作は**通常のリポジトリと全く同じ**である。特別なコマンドは一切不要。

```bash
# worktreeフォルダ内で作業
$ cd ../my-project-feature-x

# 変更内容の確認
$ git status
$ git diff

# ステージングとコミット
$ git add src/components/NewFeature.tsx
$ git commit -m "feat: 新機能Xの実装"

# 追加のコミット
$ git add src/utils/helper.ts
$ git commit -m "feat: ヘルパー関数の追加"

# リモートにプッシュ
$ git push origin feature/x
```

**豆知識:** コミットは全worktreeで共有される。worktreeAでコミットした内容は、worktreeBから`git log feature/x`で確認できる。これは`.git/objects`が共有されているためである。

### フェーズ3: PR作成

[GitHub CLI（gh）](https://cli.github.com/)を使えば、worktreeフォルダ内からそのままPRを作成できる。

```bash
# worktreeフォルダ内からPR作成
$ cd ../my-project-feature-x

$ gh pr create \
  --base develop \
  --title "feat: 新機能Xの実装" \
  --body "## 主な変更点
- 新機能Xを追加
- ヘルパー関数を追加

## テスト
- 単体テスト追加済み"
```

メインリポジトリからPRを作成することもできる。ブランチを指定すればどのディレクトリからでもOK。

```bash
# メインリポジトリからでも同じことができる
$ cd ~/my-project
$ gh pr create --head feature/x --base develop --title "feat: 新機能Xの実装"
```

### フェーズ4: PRマージ後のクリーンアップ（必須）

PRがマージされた後、**worktreeとブランチの両方を削除する必要がある。**

```bash
# 1. 現在のworktree一覧を確認
$ git worktree list
/Users/user/my-project              abc1234 [develop]
/Users/user/my-project-feature-x    def5678 [feature/x]    ← 削除対象
/Users/user/my-project-fix-y        ghi9012 [fix/y]        ← まだ作業中

# 2. worktreeを削除（フォルダとメタデータの両方が削除される）
$ git worktree remove ../my-project-feature-x

# 3. マージ済みのブランチを削除
$ git branch -d feature/x              # ローカルブランチの削除
$ git push origin --delete feature/x    # リモートブランチの削除

# 4. 削除後の確認
$ git worktree list
/Users/user/my-project              abc1234 [develop]
/Users/user/my-project-fix-y        ghi9012 [fix/y]
```

もしworktree内に未コミットの変更がある場合、`git worktree remove`はエラーになる。本当に削除したい場合は`--force`をつける。

```bash
$ git worktree remove --force ../my-project-feature-x
```

GitHubの設定でPRマージ時にリモートブランチを自動削除する設定にしている場合は、`git push origin --delete`は不要。設定場所はリポジトリの Settings → General → "Automatically delete head branches" である。

### フェーズ5: 定期的なメンテナンス

worktreeを日常的に使っていると、たまにゴミが残ることがある。定期的にメンテナンスしておくと安心である。

```bash
# 手動でフォルダを削除してしまった場合のメタデータ掃除
$ git worktree prune

# 不要なworktreeが残っていないか確認
$ git worktree list

# マージ済みブランチの一括確認
$ git branch --merged develop
```

### クリーンアップ早見表

| 状況 | 必要な操作 |
|------|-----------|
| PRマージ後 | `git worktree remove` → `git branch -d` → `git push origin --delete` |
| 作業を中断・破棄したい | `git worktree remove --force`（未コミットの変更を捨てる場合） |
| フォルダを直接`rm -rf`してしまった | `git worktree prune`でメタデータを掃除 |
| 全worktreeの棚卸し | `git worktree list`で一覧確認し、不要なものを削除 |

### 放置するとどうなるか

- worktreeフォルダ内の`node_modules`等で**ディスク容量が圧迫**される
- `git worktree list`が見づらくなる
- 同名ブランチを再作成しようとすると**「既にチェックアウト済み」とエラー**になる

---

## git worktreeコマンド一覧

よく使うコマンドをまとめておく。

```bash
# --- 作成系 ---
# 新しいブランチを作成してworktreeを追加
git worktree add ../feature-auth -b feature/auth

# 既存ブランチをworktreeに展開
git worktree add ../hotfix-dir hotfix/urgent-bug

# detached HEADでworktreeを作成（実験用、ブランチを作らない）
git worktree add -d ../experiment

# --- 確認系 ---
# worktree一覧を確認
git worktree list

# --- 削除・管理系 ---
# worktreeの削除
git worktree remove ../feature-auth

# 削除済みworktreeのメタデータをクリーンアップ
git worktree prune

# worktreeをロック（誤削除防止）
git worktree lock ../feature-auth --reason "作業中"
git worktree unlock ../feature-auth

# worktreeのパスを移動
git worktree move ../old-path ../new-path

# 壊れたworktreeリンクを修復
git worktree repair
```

---

## 補足: 他の方法との比較

worktree以外にも並列作業の方法がある。それぞれの特徴を理解しておくと、状況に応じた使い分けができる。

### 方法2: リポジトリの複数クローン

同じリポジトリを複数のフォルダにクローンする方法。

```bash
# 通常のクローン
git clone https://github.com/user/repo.git repo-feature-a
git clone https://github.com/user/repo.git repo-feature-b
```

**メリット:**
- 完全に独立した環境。同一ブランチの同時チェックアウトも可能
- サブモジュールも問題なく動作

**デメリット:**
- ディスク使用量が大きい（Git履歴が完全に重複する）
- `git fetch`を各クローンで個別に実行する必要がある
- リポジトリ間の同期管理が煩雑

`--reference`オプションを使うと、既存のローカルリポジトリのオブジェクトを参照してクローンを高速化できる。

```bash
git clone --reference /path/to/existing-repo https://github.com/user/repo.git repo-new
```

### 方法3: git stash + ブランチ切り替え

従来からあるやり方。変更をstashに退避し、ブランチを切り替えて作業する。

```bash
# 現在の変更を退避
git stash push -m "feature-a作業中"

# 別ブランチで作業
git checkout fix/urgent-bug
# ... 作業してコミット ...

# 元のブランチに戻る
git checkout feature/a
git stash pop
```

**メリット:**
- 追加のディスク領域不要
- 学習コストが低い

**デメリット:**
- **並列作業は不可能**（逐次的な切り替えのみ）
- stashが積み重なると管理が困難になる
- コンテキストスイッチのコストが高い

### どの方法を選ぶべきか

| 用途 | おすすめの方法 |
|------|-------------|
| 複数ターミナルで並列に開発したい | **git worktree** |
| AIエージェントで複数タスクを同時に進めたい | **git worktree** |
| 同一ブランチを2箇所で同時に編集したい | **複数クローン** |
| サブモジュールを多用するプロジェクト | **複数クローン** |
| 一時的に別ブランチを確認するだけ | **git stash** |

---

## Claude Codeとの統合

AIコーディングエージェントの[Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview)は、worktreeの組み込みサポートを持っている。複数のClaude Codeセッションを異なるworktreeで同時に走らせることで、開発速度を大幅に向上できる。

### CLIフラグでの起動

```bash
# --worktree (-w) フラグでworktreeを指定して起動
claude --worktree feature-auth
# .claude/worktrees/feature-auth/ にworktreeが作成される
```

### セッション中のworktree操作

Claude Codeはセッション中に`EnterWorktree`/`ExitWorktree`というツールを使って、動的にworktreeを作成・削除できる。

- `EnterWorktree` -- セッション中にworktreeを作成し、作業ディレクトリを切り替え
- `ExitWorktree` -- `action: "keep"`で残す、`action: "remove"`で削除

### サブエージェントでの自動隔離

Claude Codeのカスタムサブエージェントには`isolation: worktree`というオプションがある。

```yaml
# カスタムサブエージェントのfrontmatterに追加
isolation: worktree
```

各サブエージェントが独自のworktreeを自動取得し、変更なしで終了すると自動クリーンアップされる。incident.ioの事例では、4-5個のClaude Codeエージェントをworktreeで並列実行し、大幅な開発速度向上を実現している。

### おすすめのディレクトリ構成

```
# パターン1: Claude Code管理（.claude/worktrees/に集約）
project/
├── .git/
├── .claude/worktrees/
│   ├── feature-auth/
│   ├── fix-bug-123/
│   └── refactor-api/
├── src/
└── ...

# パターン2: プロジェクトルートの外に配置
developments/
├── my-project/              # メインworktree
├── my-project-feature-a/    # worktree 1
└── my-project-fix-b/        # worktree 2
```

---

## 上級者向け: Bare Repositoryパターン

ベアリポジトリを中心に置き、**全ての作業をworktreeで行う**パターンもある。メインの作業ディレクトリを持たない設計で、全ブランチを対等に扱える。

```bash
# ベアリポジトリとしてクローン（作業ファイルなし、.gitの中身だけ）
git clone --bare https://github.com/user/repo.git repo.git
cd repo.git

# 全てをworktreeとして作成
git worktree add ../main main
git worktree add ../feature-a feature/a
git worktree add ../fix-b fix/b
```

このパターンのメリットは「メインリポジトリ」という概念がなくなり、全worktreeが平等になること。worktreeを日常的に多用するチームに向いている。

---

## まとめ

- **複数ターミナルで同じディレクトリを開いている場合、`git checkout`は全ターミナルに影響する**。これはGitの仕組み上避けられない
- **`git worktree`を使えば、ブランチごとに独立した作業フォルダを作れる**。互いに干渉せず、ディスク効率も良い
- worktreeの作成は`git worktree add`、削除は`git worktree remove`。**作業後のクリーンアップ（worktree削除 + ブランチ削除）を忘れずに**
- AIエージェントの並列実行にも最適。Claude Codeは`--worktree`フラグで組み込みサポートしている

一度使い始めると「なぜ今まで使っていなかったのか」と思うくらい便利な機能である。まずは1つworktreeを作って試してみることをおすすめする。

---

## 参考リンク

- [Git公式ドキュメント: git-worktree](https://git-scm.com/docs/git-worktree)
- [Git公式ドキュメント: git-clone](https://git-scm.com/docs/git-clone)
- [How we're shipping faster with Claude Code and Git Worktrees - incident.io](https://incident.io/blog/shipping-faster-with-claude-code-and-git-worktrees)
- [Claude Code公式ドキュメント: Common workflows](https://code.claude.com/docs/en/common-workflows)
- [Using Git Worktrees for Multi-Feature Development with AI Agents](https://www.nrmitchi.com/2025/10/using-git-worktrees-for-multi-feature-development-with-ai-agents/)
- [How Git Worktrees Changed My AI Agent Workflow - Nx Blog](https://nx.dev/blog/git-worktrees-ai-agents)
