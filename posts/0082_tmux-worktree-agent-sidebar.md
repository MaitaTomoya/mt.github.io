---
id: 82
title: "tmux + git worktree + tmux-agent-sidebarで複数AIエージェントを並行運用する"
tags: ["tmux", "git", "git worktree", "Claude Code", "AI", "開発環境"]
create: "2026-04-07 23:31"
update: "2026-04-07 23:38"
---

# tmux + git worktree + tmux-agent-sidebarで複数AIエージェントを並行運用する

AIコーディングエージェント（Claude CodeやCodexなど）を複数同時に動かして開発効率を上げたい。でも「tmuxって何？」「同じリポジトリで複数ブランチを同時に触れるの？」という疑問がある方も多いのではないでしょうか。

この記事では、**tmux**、**git worktree**、**tmux-agent-sidebar**の3つを組み合わせて、複数のAIエージェントを並行して管理する方法を解説します。

---

## 前提知識

この記事で扱うツールの関係を先に整理しておきます。

| ツール | 役割 |
|---|---|
| tmux | 1つのターミナルで複数の作業を同時に行う |
| git worktree | 1つのリポジトリで複数ブランチを同時にチェックアウトする |
| tmux-agent-sidebar | tmux内で動いているAIエージェントの状態を一覧表示する |

3つのツールがどう連携するかを図にすると、以下のようになります。

```mermaid
graph TB
    subgraph tmux["tmux（ターミナルマルチプレクサ）"]
        direction LR
        subgraph pane1["ペイン1"]
            wt1["git worktree<br/>mainブランチ"]
            agent1["Claude Code #1"]
            wt1 --> agent1
        end
        subgraph pane2["ペイン2"]
            wt2["git worktree<br/>featureブランチ"]
            agent2["Claude Code #2"]
            wt2 --> agent2
        end
        subgraph sidebar["サイドバー"]
            monitor["tmux-agent-sidebar<br/>全エージェントの状態を表示"]
        end
    end
    agent1 -. "hook通知" .-> monitor
    agent2 -. "hook通知" .-> monitor
```

---

## tmuxとは

**tmux**（Terminal Multiplexer）は、1つのターミナルウィンドウ内で**複数の端末を分割・切り替え**できるツールです。

### なぜtmuxが必要なのか

普通のターミナルでは、以下のような問題があります。

- コードを編集しながらサーバーを動かしたい → ターミナルを複数開く必要がある
- ターミナルを閉じたら実行中のプロセスが終了してしまう
- AIエージェントを複数動かすと、どのウィンドウがどれかわからなくなる

tmuxはこれらをすべて解決します。

### tmuxの基本構造

tmuxには3つの階層があります。

```mermaid
graph TB
    subgraph session["セッション（Session）"]
        direction TB
        subgraph window1["ウィンドウ1（Window）"]
            direction LR
            p1["ペイン1<br/>エディタ"]
            p2["ペイン2<br/>サーバー"]
        end
        subgraph window2["ウィンドウ2（Window）"]
            direction LR
            p3["ペイン3<br/>git操作"]
            p4["ペイン4<br/>ログ監視"]
        end
    end

    style session fill:#1a1a2e,stroke:#16213e,color:#fff
    style window1 fill:#16213e,stroke:#0f3460,color:#fff
    style window2 fill:#16213e,stroke:#0f3460,color:#fff
```

- **セッション**: 一番外側の箱。デタッチしても裏で生き続ける
- **ウィンドウ**: ブラウザのタブのようなもの。切り替えて使う
- **ペイン**: ウィンドウ内の分割された領域。同時に表示される

それぞれを身近なものに例えると：

| tmuxの概念 | 例え |
|---|---|
| セッション | デスクトップそのもの。閉じても裏で生き続ける |
| ウィンドウ | ブラウザのタブ。複数のタブを切り替えて使う |
| ペイン | ブラウザのタブ内を分割した画面。横並びや縦並びに配置できる |

### 画面イメージ

```
┌─────────────────────────┬─────────────────────────┐
│ ペイン1                  │ ペイン2                  │
│ ~/project (main)        │ ~/project-feat           │
│ $ claude                │ (feature/new-api)        │
│ > APIの設計をして        │ $ claude                 │
│                         │ > テストを書いて          │
├─────────────────────────┤                         │
│ ペイン3                  │                         │
│ $ npm run dev           │                         │
│ Server running...       │                         │
└─────────────────────────┴─────────────────────────┘
```

### tmuxのインストール

```bash
# macOS（Homebrewを使用）
brew install tmux

# Ubuntu/Debian
sudo apt install tmux

# バージョン確認
tmux -V
```

### 基本操作

tmuxのすべての操作は**プレフィックスキー**（デフォルトは `Ctrl-b`）の後にキーを押すことで行います。

```
Ctrl-b を押す → 手を離す → 次のキーを押す
```

**同時押しではない**ことに注意してください。

#### よく使うキーバインド

| 操作 | キー | 説明 |
|---|---|---|
| 横分割 | `Ctrl-b` → `%` | ペインを左右に分ける |
| 縦分割 | `Ctrl-b` → `"` | ペインを上下に分ける |
| ペイン移動 | `Ctrl-b` → 矢印キー | 隣のペインに移動 |
| ウィンドウ作成 | `Ctrl-b` → `c` | 新しいウィンドウ（タブ）を作る |
| ウィンドウ切替 | `Ctrl-b` → `n` / `p` | 次/前のウィンドウに移動 |
| デタッチ | `Ctrl-b` → `d` | tmuxから抜ける（セッションは残る） |
| ペインを閉じる | `Ctrl-b` → `x` | 現在のペインを閉じる |

#### セッション管理コマンド

```bash
# 新しいセッションを開始
tmux

# 名前付きセッションを開始
tmux new -s my-project

# セッション一覧を表示
tmux ls

# セッションに再接続（デタッチ後）
tmux attach -t my-project
```

### デタッチとアタッチ

tmuxの最大の特徴の1つが**デタッチ**です。

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant T as ターミナル
    participant S as tmuxセッション
    participant A as AIエージェント

    U->>T: tmux起動
    T->>S: セッション作成
    U->>S: claude起動
    S->>A: エージェント開始
    Note over A: 処理中...
    U->>S: Ctrl-b → d（デタッチ）
    U->>T: ターミナルを閉じる
    Note over S,A: セッションは裏で動き続ける
    U->>T: 翌日ターミナルを開く
    U->>T: tmux attach
    T->>S: セッションに再接続
    Note over U,A: 前日の続きからそのまま作業
```

- **デタッチ** = tmuxから抜けること（セッションは裏で動き続ける）
- **アタッチ** = 裏で動いているセッションに再接続すること

つまり、ターミナルを閉じてもtmux内で実行中のプロセス（サーバーやAIエージェント）は**停止しません**。翌日ターミナルを開いて`tmux attach`すれば、前日の続きからそのまま作業できます。

---

## git worktreeとは

### 問題：同じリポジトリで複数ブランチを同時に触りたい

こんな経験はありませんか？

- `feature/api`ブランチで開発中だけど、急に`main`ブランチで別の修正が必要になった
- ブランチを切り替えるたびに`node_modules`の再インストールが走る
- AIエージェントを2つ起動して、別々のブランチで並行作業させたい

通常のgitでは、**1つのディレクトリに1つのブランチしかチェックアウトできません**。ブランチを切り替えるには`git checkout`や`git switch`が必要で、その度にファイルの中身が書き変わります。

### 通常のgit vs git worktree

まず、通常のgitとgit worktreeの違いを図で見てみましょう。

```mermaid
graph LR
    subgraph normal["通常のgit"]
        direction TB
        dir1["~/project/"]
        branch1["mainブランチ"]
        dir1 --- branch1
        note1["1つのブランチしか<br/>チェックアウトできない"]
    end

    subgraph worktree["git worktreeを使った場合"]
        direction TB
        git[".gitデータ<br/>（共有）"]
        dir2["~/project/<br/>mainブランチ"]
        dir3["~/project-feature/<br/>feature/apiブランチ"]
        dir4["~/project-fix/<br/>fix/bugブランチ"]
        git --- dir2
        git --- dir3
        git --- dir4
    end
```

### git worktreeの仕組み

**git worktree**は、1つのリポジトリから**別のディレクトリに別ブランチを展開**する機能です。

重要なのは、すべてのworktreeが**同じ`.git`データを共有**していることです。コミット履歴やリモートの情報は1つだけで、作業ディレクトリが複数あるイメージです。

以下の図は、worktree作成から削除までの流れを示しています。

```mermaid
flowchart TD
    A["git worktree add ../project-feat feature/api"] --> B["新しいディレクトリが作成される"]
    B --> C["~/project-feat/ に feature/api が展開"]
    C --> D{"作業完了？"}
    D -- "No" --> E["各worktreeで独立して開発"]
    E --> D
    D -- "Yes" --> F["コミット & プッシュ"]
    F --> G["git worktree remove ../project-feat"]
    G --> H["ディレクトリが削除される"]
```

### 基本操作

```bash
# worktreeを作成（既存ブランチを展開）
git worktree add ../project-feature feature/api

# worktreeを作成（新しいブランチを作りつつ展開）
git worktree add -b feature/new-task ../project-new-task

# worktree一覧を表示
git worktree list

# worktreeを削除
git worktree remove ../project-feature
```

### 実行例

```bash
$ cd ~/Developments/my-app
$ git branch
* main
  feature/api
  fix/login-bug

# feature/apiブランチを別ディレクトリに展開
$ git worktree add ../my-app-api feature/api
Preparing worktree (checking out 'feature/api')
HEAD is now at abc1234 Add API endpoints

# worktree一覧を確認
$ git worktree list
/Users/me/Developments/my-app      abc1234 [main]
/Users/me/Developments/my-app-api  def5678 [feature/api]
```

これで`my-app`と`my-app-api`の両方を同時に開いて作業できます。

### worktreeの注意点

| 注意点 | 説明 |
|---|---|
| 同じブランチは同時に展開できない | `main`がメインにあるなら、worktreeでも`main`は使えない |
| `.git`ファイルはシンボリックリンク | worktree側の`.git`はファイルで、メインの`.git`ディレクトリを参照している |
| `node_modules`は各worktreeで独立 | worktree作成後に`npm install`が必要 |
| 不要になったら削除する | `git worktree remove`で片付ける |

---

## tmux-agent-sidebarとは

[tmux-agent-sidebar](https://github.com/hiroppy/tmux-agent-sidebar)は、tmux内で動いている**AIコーディングエージェント（Claude Code、Codex）の状態をリアルタイムで監視**するtmuxプラグインです。

### なぜ必要なのか

複数のAIエージェントを同時に動かしていると、以下の問題が起きます。

- どのペインでどのエージェントが動いているかわからない
- エージェントが許可待ちで止まっていることに気づかない
- 全体の進捗状況を把握するのに各ペインを1つずつ確認する必要がある

tmux-agent-sidebarは、これらを1つのサイドバーで一覧表示して解決します。

### 表示される情報

```
┌ サイドバー ──────────┬─────────────────────────────┐
│                      │                             │
│ ● claude (main)      │  Claude Codeのペイン         │
│   > APIの設計をして   │                             │
│   00:03:42           │  $ claude                   │
│                      │  > APIの設計をしています...   │
│ ◐ claude (feature)   │                             │
│   > テストを書いて    │                             │
│   許可待ち           │                             │
│                      │                             │
│ ○ codex (fix)        │                             │
│   Idle               │                             │
│                      │                             │
│ [Activity] [Git]     │                             │
│ Read src/api.ts      │                             │
│ Edit src/api.ts      │                             │
│ Bash npm test        │                             │
└──────────────────────┴─────────────────────────────┘
```

### ステータスアイコンの意味

| アイコン | 状態 | 意味 |
|---|---|---|
| `●` | Running | エージェントが処理中（アニメーション付き） |
| `◐` | Waiting | ユーザーの入力待ち（ツール実行の許可など） |
| `○` | Idle | 待機中（次のプロンプト入力待ち） |
| `✕` | Error | エラーが発生した |

### エージェントのライフサイクル

サイドバーのステータスは、Claude Codeの各イベントに連動して自動で変わります。

```mermaid
stateDiagram-v2
    [*] --> Idle: SessionStart<br/>セッション開始
    Idle --> Running: UserPromptSubmit<br/>プロンプト送信
    Running --> Running: PostToolUse<br/>ツール実行（繰り返し）
    Running --> Waiting: Notification<br/>許可待ち
    Waiting --> Running: ユーザーが許可
    Running --> Idle: Stop<br/>応答完了
    Running --> Error: StopFailure<br/>エラー発生
    Error --> Running: UserPromptSubmit<br/>再試行
    Idle --> [*]: SessionEnd<br/>セッション終了

    state Idle {
        [*]: ○ 待機中
    }
    state Running {
        [*]: ● 処理中
    }
    state Waiting {
        [*]: ◐ 入力待ち
    }
    state Error {
        [*]: ✕ エラー
    }
```

この連動は**hooks**（フック）という仕組みで実現されています。以下の図は、hookがどのようにClaude Codeとサイドバーを繋いでいるかを示しています。

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant C as Claude Code
    participant H as hook.sh
    participant S as tmux-agent-sidebar

    U->>C: プロンプトを入力
    C->>H: UserPromptSubmit hookが発火
    H->>S: ステータスを "Running" に更新
    C->>C: ファイルを読む（Read）
    C->>H: PostToolUse hookが発火
    H->>S: Activity Logに "Read src/api.ts" を追加
    C->>C: ファイルを編集（Edit）
    C->>H: PostToolUse hookが発火
    H->>S: Activity Logに "Edit src/api.ts" を追加
    C->>C: 応答完了
    C->>H: Stop hookが発火
    H->>S: ステータスを "Idle" に更新
```

hookとは、Claude Codeが特定のイベント（プロンプト送信、ツール実行など）を実行するたびに、指定したシェルコマンドを自動実行する機能です。

### サイドバーの操作方法

| 操作 | キー | 説明 |
|---|---|---|
| サイドバーの表示/非表示 | `Ctrl-b` → `e` | トグルで切り替え |
| エージェント選択 | `j`/`k` または上下矢印 | リスト内で移動 |
| エージェントに移動 | `Enter` | 選択したエージェントのペインにジャンプ |
| フィルター切替 | `Tab` | All → Running → Waiting → Idle → Error |
| 下部パネル切替 | `Shift + Tab` | ActivityタブとGitタブを切り替え |

---

## セットアップ手順

### 1. tmuxのインストール

```bash
brew install tmux
```

### 2. TPM（tmux Plugin Manager）のインストール

TPMはtmuxのプラグイン管理ツールです。npmがNode.jsのパッケージを管理するのと同じ役割です。

```bash
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
```

### 3. tmux設定ファイルの作成

`~/.tmux.conf`を作成します。

```bash
# プラグイン設定
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'hiroppy/tmux-agent-sidebar'

# TPMの初期化（必ず設定ファイルの最後に記載）
run '~/.tmux/plugins/tpm/tpm'
```

### 4. プラグインのインストール

```bash
# tmuxを起動
tmux

# tmux内で Ctrl-b → I（大文字のI）を押す
# インストールウィザードが表示される
```

### 5. Claude Codeのhook設定

`~/.claude/settings.json`のhooksセクションに以下を追加します。

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.tmux/plugins/tmux-agent-sidebar/hook.sh claude notification"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.tmux/plugins/tmux-agent-sidebar/hook.sh claude user-prompt-submit"
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.tmux/plugins/tmux-agent-sidebar/hook.sh claude session-start"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.tmux/plugins/tmux-agent-sidebar/hook.sh claude stop"
          }
        ]
      }
    ],
    "StopFailure": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.tmux/plugins/tmux-agent-sidebar/hook.sh claude stop-failure"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.tmux/plugins/tmux-agent-sidebar/hook.sh claude activity-log"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.tmux/plugins/tmux-agent-sidebar/hook.sh claude session-end"
          }
        ]
      }
    ]
  }
}
```

既存のhook設定がある場合は、各イベントの配列に追加する形でマージしてください。

---

## 実践：tmux + git worktreeで複数エージェントを並行運用

ここからは、実際にtmuxとgit worktreeを組み合わせて、2つのAIエージェントを並行して動かす手順を紹介します。

### シナリオ

- `main`ブランチでAPIの設計作業
- `feature/tests`ブランチでテスト作成作業
- この2つをAIエージェントに同時並行で任せたい

```mermaid
flowchart LR
    subgraph repo["my-appリポジトリ"]
        main["mainブランチ"]
        feat["feature/testsブランチ"]
    end

    subgraph tmux["tmuxセッション"]
        subgraph p1["ペイン1: ~/my-app"]
            c1["Claude Code #1<br/>APIの設計"]
        end
        subgraph p2["ペイン2: ~/my-app-tests"]
            c2["Claude Code #2<br/>テスト作成"]
        end
        sb["サイドバー<br/>両方のエージェントを監視"]
    end

    main --> p1
    feat -- "git worktree" --> p2
    c1 -. hook .-> sb
    c2 -. hook .-> sb
```

### 手順

```bash
# 1. tmuxセッションを開始
tmux new -s dev

# 2. メインのリポジトリで作業（mainブランチ）
cd ~/Developments/my-app

# 3. git worktreeで別ブランチを展開
git worktree add ../my-app-tests feature/tests

# 4. tmuxペインを横に分割
# Ctrl-b → %

# 5. 右ペインでworktreeに移動
cd ~/Developments/my-app-tests

# 6. 左ペインでClaude Codeを起動
# Ctrl-b → 左矢印（左ペインに移動）
claude

# 7. 右ペインでもClaude Codeを起動
# Ctrl-b → 右矢印（右ペインに移動）
claude

# 8. サイドバーを表示
# Ctrl-b → e
```

これで以下のような画面になります。

```
┌ sidebar ──┬─────────────────┬─────────────────┐
│           │ ~/my-app        │ ~/my-app-tests   │
│ ● claude  │ (main)          │ (feature/tests)  │
│   main    │ $ claude        │ $ claude         │
│           │ > APIを設計して  │ > テストを書いて  │
│ ● claude  │                 │                  │
│   feature │                 │                  │
│           │                 │                  │
└───────────┴─────────────────┴─────────────────┘
```

### 作業完了後の片付け

```bash
# worktreeの変更をコミット・プッシュした後
git worktree remove ../my-app-tests

# worktree一覧を確認（残っていないことを確認）
git worktree list
```

---

## よくある質問

### Q. 同じディレクトリで異なるブランチを同時にチェックアウトできる？

**できません。** gitの仕組み上、1つのディレクトリには1つのブランチしかチェックアウトできません。複数ブランチを同時に触りたい場合は`git worktree`を使います。

### Q. tmuxを閉じたらAIエージェントは止まる？

`Ctrl-b` → `d`（デタッチ）で抜けた場合は**止まりません**。ターミナルの`×`ボタンで閉じた場合も、tmuxセッションは裏で動き続けます。`tmux attach`で再接続できます。

### Q. worktreeとcloneの違いは？

| 項目 | git worktree | git clone |
|---|---|---|
| `.git`データ | 共有（1つ） | 独立（コピー） |
| ディスク使用量 | 少ない | 多い（全履歴をコピー） |
| コミット履歴 | リアルタイムで共有 | fetch/pullが必要 |
| 用途 | 同じリポジトリの並行作業 | 別の場所で独立した作業 |

```mermaid
graph TB
    subgraph wt["git worktree"]
        direction TB
        gitdata1[".gitデータ（1つだけ）"]
        wt_main["~/project<br/>main"]
        wt_feat["~/project-feat<br/>feature"]
        gitdata1 --- wt_main
        gitdata1 --- wt_feat
    end

    subgraph cl["git clone"]
        direction TB
        gitdata2[".gitデータ（コピーA）"]
        gitdata3[".gitデータ（コピーB）"]
        cl_main["~/project<br/>main"]
        cl_feat["~/project-copy<br/>feature"]
        gitdata2 --- cl_main
        gitdata3 --- cl_feat
    end
```

### Q. サイドバーが表示されない場合は？

以下を確認してください。

```bash
# バイナリが正しくインストールされているか
~/.tmux/plugins/tmux-agent-sidebar/bin/tmux-agent-sidebar --version

# キーバインドが登録されているか
tmux list-keys | grep sidebar

# 手動でサイドバーを起動してみる
~/.tmux/plugins/tmux-agent-sidebar/bin/tmux-agent-sidebar toggle "$(tmux display -p '#{window_id}')" "$(pwd)"
```

---

## まとめ

| ツール | 解決する問題 |
|---|---|
| tmux | ターミナルを分割して複数の作業を同時に行えるようにする |
| git worktree | 1つのリポジトリで複数ブランチを同時に展開できるようにする |
| tmux-agent-sidebar | tmux内のAIエージェントの状態を一覧で監視できるようにする |

```mermaid
graph TB
    A["課題: 複数のAIエージェントを<br/>異なるブランチで並行運用したい"] --> B["tmux"]
    A --> C["git worktree"]
    A --> D["tmux-agent-sidebar"]
    B --> E["画面分割で複数の<br/>エージェントを同時実行"]
    C --> F["1つのリポジトリで<br/>複数ブランチを同時展開"]
    D --> G["全エージェントの状態を<br/>リアルタイム監視"]
    E --> H["効率的な並行開発環境の完成"]
    F --> H
    G --> H
```

この3つを組み合わせることで、複数のAIエージェントに異なるブランチで並行して作業させ、その進捗をリアルタイムで確認できる開発環境が構築できます。

導入の順番としては以下がおすすめです。

```mermaid
graph LR
    S1["Step 1<br/>tmuxの基本操作に慣れる"] --> S2["Step 2<br/>git worktreeで<br/>並行ブランチ作業"]
    S2 --> S3["Step 3<br/>tmux-agent-sidebarで<br/>エージェント監視"]
```

まずはtmuxの基本操作に慣れるところから始めて、慣れてきたらgit worktreeとtmux-agent-sidebarを導入してみてください。

---

## 参考リンク

- [tmux公式リポジトリ](https://github.com/tmux/tmux)
- [git-worktree公式ドキュメント](https://git-scm.com/docs/git-worktree)
- [tmux-agent-sidebar](https://github.com/hiroppy/tmux-agent-sidebar)
- [TPM（tmux Plugin Manager）](https://github.com/tmux-plugins/tpm)
