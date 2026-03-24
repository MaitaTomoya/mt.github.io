---
id: 64
title: "Claude Code に設定しているコマンド一覧（2026年3月時点）"
tags: [Claude Code, AI, 開発環境, コマンド]
create: "2026-03-24 14:34"
---

この記事では、2026年3月24日時点で自分の Claude Code 環境に設定しているコマンド（Command）の全一覧と、Skill / Command / Agent の概念整理、コンテキストウィンドウ管理との関係についてまとめる。

## Everything Claude Code（ECC）について

本記事で紹介するコマンドの大部分は [Everything Claude Code（ECC）](https://github.com/affaan-m/everything-claude-code) をベースにしている。ECCは Claude Code のスキル・コマンド・エージェント・ルールをまとめたコミュニティ主導のコレクションで、インストールスクリプトで必要なものだけを選んで導入できる。

自分の環境では ECC のコマンドセットをグローバル（`~/.claude/commands/`）にインストールした上で、プロジェクト固有のコマンドを `.claude/commands/` に追加している。

## Skill / Command / Agent の違い

| 概念 | 何か | 保存場所 | 呼び出し方 |
|---|---|---|---|
| **Skill** | 特定のドメイン知識やパターン集。Claudeが文脈に応じて自動的に参照する「参考資料」 | `~/.claude/skills/` または `.claude/skills/` | 自動（Claudeが関連性を判断して読み込む） |
| **Command** | ユーザーが明示的に実行するスラッシュコマンド。Skill を組み合わせた「手順書」 | `~/.claude/commands/` または `.claude/commands/` | `/コマンド名` で手動実行 |
| **Agent** | 独立したサブプロセスとして起動する専門エージェント。メインの会話とは別コンテキストで自律的にタスクを実行する | Claude Code 内蔵 | Claudeが必要に応じて自動起動、またはCommand内から呼び出し |

一言でまとめると：

- **Skill** = 知識（何を知っているか）
- **Command** = 手順（何をするか）
- **Agent** = 実行者（誰がやるか）

例えば `/rust-build` コマンドを実行すると、`rust-patterns` スキルの知識を参照しながら、`rust-build-resolver` エージェントが独立プロセスでビルドエラーを修正する。3つが連携して動く。

## コンテキストウィンドウ管理との関係

AIエージェントの性能はコンテキストウィンドウ（一度に扱える情報量）の使い方で大きく変わる。Skill / Command / Agent はそれぞれ異なる形でコンテキスト管理に貢献する。

### メリット

| 概念 | コンテキスト管理上の利点 |
|---|---|
| **Skill** | **遅延読み込み**。全知識を常時ロードせず、関連するスキルだけが必要なタイミングで読み込まれる。「全部の本を机に広げる」のではなく「必要な本だけ棚から取る」イメージ |
| **Command** | **手順の外部化**。複雑な手順をファイルに書き出しておくことで、ユーザーが毎回長いプロンプトを入力する必要がない。会話の往復が減り、コンテキストの消費を抑えられる |
| **Agent** | **コンテキストの分離**。サブエージェントは独立したコンテキストウィンドウで動く。重いファイル読み込みや大量の検索結果がメインの会話を圧迫しない。終わったら要約だけが返る |

特に **Agent の分離効果** が最も大きい。例えばコードベース全体の探索をメインの会話でやると数万トークンを消費するが、Explore エージェントに委任すれば結果の要約（数百トークン）だけがメインに返る。

### デメリット（設定しすぎた場合）

| リスク | 説明 |
|---|---|
| **Skill の過剰登録** | Skill の一覧（名前+説明）は会話開始時にシステムプロンプトとして読み込まれる。100個以上登録すると、一覧だけで数千トークンを常時消費し、本来の作業に使えるコンテキストが減る |
| **Command の肥大化** | 1つのコマンドに手順を詰め込みすぎると、実行時に大量のプロンプトが注入される。`/book-review`（約290行）のようなコマンドは実行のたびにそのまま読み込まれる |
| **Agent の多重起動** | エージェントを並列に立ち上げすぎると、APIコール数が増えコストが跳ね上がる。また各エージェントが同じファイルを重複して読むと全体の効率が落ちる |
| **判断コストの増加** | 選択肢が多すぎるとClaude自身が「どのSkill/Agentを使うべきか」の判断にトークンを消費する。似た名前のSkillが複数あると誤選択のリスクも上がる |

### 実践的な目安

- **Skill**: プロジェクトで実際に使う技術スタックに絞る（全言語入れない）
- **Command**: 週1回以上使うものだけ登録。稀にしか使わないものは都度プロンプトで指示する方が軽い
- **Agent**: 同時起動は3-5個程度に抑える。独立したタスクだけ並列化する

---

## コマンド一覧

### プロジェクト固有コマンド

このプロジェクト（ブログ）専用に作成したコマンド。`.claude/commands/` に配置している。

| コマンド | 説明 | 使い方 |
|---|---|---|
| `/book-review` | 読書レビュー。PDFから要約→感想の壁打ち→記事生成までを対話的に進める | `/book-review books-pdf/ファイル名.pdf` |
| `/neta-trend-daily` | トレンドネタ収集。はてブIT・HN・Reddit・セキュリティブログから情報を収集し `daily/YYYYMMDD-trend.md` に保存 | `/neta-trend-daily` |

### ワークフロー・計画

| コマンド | 説明 | 使い方 |
|---|---|---|
| `/plan` | 要件を整理しリスク評価、ステップバイステップの実装計画を作成。ユーザー確認後に着手 | `/plan 機能の説明` |
| `/multi-plan` | マルチモデル協調プランニング。複数モデルで分析→実装計画を生成 | `/multi-plan` |
| `/multi-workflow` | マルチモデル協調開発（Research→Ideation→Plan→Execute→Optimize→Review） | `/multi-workflow` |
| `/multi-frontend` | フロントエンド特化ワークフロー（Geminiリード） | `/multi-frontend` |
| `/multi-backend` | バックエンド特化ワークフロー（Codexリード） | `/multi-backend` |
| `/multi-execute` | マルチモデル協調実行。プロトタイプ→リファクタ→監査→デリバリー | `/multi-execute` |
| `/orchestrate` | マルチエージェントワークフローのオーケストレーション（Sequential/tmux/worktree） | `/orchestrate` |
| `/devfleet` | Claude DevFleetで並列エージェントをオーケストレーション | `/devfleet` |

### コードレビュー・品質

| コマンド | 説明 | 使い方 |
|---|---|---|
| `/code-review` | 未コミットの変更に対するセキュリティ・品質レビュー | `/code-review` |
| `/python-review` | Python コードレビュー（PEP 8、型ヒント、セキュリティ） | `/python-review` |
| `/go-review` | Go コードレビュー（イディオム、並行性、エラー処理） | `/go-review` |
| `/rust-review` | Rust コードレビュー（所有権、ライフタイム、unsafe） | `/rust-review` |
| `/kotlin-review` | Kotlin コードレビュー（null安全、コルーチン、イディオム） | `/kotlin-review` |
| `/cpp-review` | C++ コードレビュー（メモリ安全、モダンC++、並行性） | `/cpp-review` |
| `/quality-gate` | ECC品質パイプラインをファイルまたはプロジェクト全体に実行 | `/quality-gate` |
| `/verify` | コードベースの包括的検証 | `/verify` |

### テスト

| コマンド | 説明 | 使い方 |
|---|---|---|
| `/tdd` | テスト駆動開発ワークフロー。テストを先に書き、実装→80%+カバレッジ | `/tdd` |
| `/go-test` | Go TDD。テーブル駆動テスト→実装→80%+カバレッジ | `/go-test` |
| `/rust-test` | Rust TDD。テスト→実装→cargo-llvm-covで80%+カバレッジ | `/rust-test` |
| `/kotlin-test` | Kotlin TDD。Kotest→実装→Koverで80%+カバレッジ | `/kotlin-test` |
| `/cpp-test` | C++ TDD。GoogleTest→実装→gcov/lcovでカバレッジ | `/cpp-test` |
| `/e2e` | Playwright E2Eテスト生成・実行。スクリーンショット/ビデオ/トレース取得 | `/e2e` |
| `/test-coverage` | テストカバレッジ分析、ギャップ特定、不足テスト生成 | `/test-coverage` |

### ビルドエラー修正

| コマンド | 説明 | 使い方 |
|---|---|---|
| `/build-fix` | ビルド・型エラーを最小差分で段階的に修正 | `/build-fix` |
| `/go-build` | Go ビルドエラー・go vet警告・リンター問題を修正 | `/go-build` |
| `/rust-build` | Rust ビルドエラー・借用チェッカー・依存関係問題を修正 | `/rust-build` |
| `/kotlin-build` | Kotlin/Gradle ビルドエラー・コンパイラ警告を修正 | `/kotlin-build` |
| `/cpp-build` | C++ ビルドエラー・CMake・リンカー問題を修正 | `/cpp-build` |
| `/gradle-build` | Android/KMP の Gradle ビルドエラーを修正 | `/gradle-build` |

### リファクタ・ドキュメント

| コマンド | 説明 | 使い方 |
|---|---|---|
| `/refactor-clean` | デッドコードを安全に特定・削除（テスト検証付き） | `/refactor-clean` |
| `/update-docs` | ドキュメントをコードベースと同期 | `/update-docs` |
| `/update-codemaps` | コードベース構造を分析しアーキテクチャドキュメント生成 | `/update-codemaps` |

### 学習・パターン抽出

| コマンド | 説明 | 使い方 |
|---|---|---|
| `/learn` | セッションから再利用可能なパターンを抽出しスキルとして保存 | `/learn` |
| `/learn-eval` | パターン抽出＋品質自己評価＋保存先判定（Global vs Project） | `/learn-eval` |
| `/evolve` | instinctを分析し、進化した構造（スキル/コマンド/エージェント）を提案・生成 | `/evolve` |
| `/instinct-status` | 学習済みinstinct（プロジェクト＋グローバル）を信頼度付きで表示 | `/instinct-status` |
| `/instinct-export` | instinctをプロジェクト/グローバルスコープからファイルにエクスポート | `/instinct-export` |
| `/instinct-import` | ファイルやURLからinstinctをインポート | `/instinct-import` |
| `/promote` | プロジェクトスコープのinstinctをグローバルスコープに昇格 | `/promote` |
| `/prune` | 30日以上未昇格のpending instinctを削除 | `/prune` |
| `/projects` | 既知のプロジェクトとinstinct統計を表示 | `/projects` |

### セッション管理

| コマンド | 説明 | 使い方 |
|---|---|---|
| `/save-session` | 現在のセッション状態を `~/.claude/sessions/` に保存 | `/save-session` |
| `/resume-session` | 最新のセッションファイルを読み込んで作業を再開 | `/resume-session` |
| `/sessions` | セッション履歴・エイリアス・メタデータの管理 | `/sessions` |
| `/checkpoint` | ワークフロー内のチェックポイントを作成・検証 | `/checkpoint` |

### ループ・自動化

| コマンド | 説明 | 使い方 |
|---|---|---|
| `/loop-start` | 安全なデフォルト設定で自律ループパターンを開始 | `/loop-start` |
| `/loop-status` | アクティブなループの状態・進捗・障害シグナルを確認 | `/loop-status` |

### ユーティリティ

| コマンド | 説明 | 使い方 |
|---|---|---|
| `/aside` | 現在のタスクを中断せずに横道の質問に回答し、自動で元の作業に復帰 | `/aside 質問内容` |
| `/docs` | Context7経由でライブラリ/トピックの最新ドキュメントを検索 | `/docs ライブラリ名` |
| `/prompt-optimize` | プロンプトを分析し最適化版を出力（実行はしない、アドバイザリーのみ） | `/prompt-optimize プロンプト` |
| `/model-route` | タスクの複雑さと予算に応じた最適モデルティアを推奨 | `/model-route` |
| `/context-budget` | コンテキストウィンドウ使用量を分析し最適化の機会を特定 | `/context-budget` |
| `/pm2` | プロジェクトを分析しPM2サービスコマンドを自動生成 | `/pm2` |
| `/claw` | NanoClaw v2 REPLを起動（モデルルーティング、スキルホットロード、分岐、圧縮） | `/claw` |

### メタ・管理

| コマンド | 説明 | 使い方 |
|---|---|---|
| `/skill-create` | ローカルgit履歴からコーディングパターンを抽出しSKILL.mdを生成 | `/skill-create` |
| `/skill-health` | スキルポートフォリオのヘルスダッシュボードを表示 | `/skill-health` |
| `/rules-distill` | スキルを横断スキャンし共通原則をルールとして抽出 | `/rules-distill` |
| `/harness-audit` | リポジトリのハーネス監査を実行しスコアカードを返す | `/harness-audit` |
| `/eval` | eval駆動開発ワークフローの管理 | `/eval` |
