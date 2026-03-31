---
title: 'チェックポイント: チームで協業する'
order: 14
section: 'バージョン管理'
---

# チェックポイント: チームで協業する

このチェックポイントでは、Git/GitHubを使ったチーム開発のワークフローを実践的に学びます。1人で複数の役割をシミュレーションしながら、ブランチ戦略、プルリクエスト、コンフリクト解決、Issue管理を体験します。

---

## この演習の目的

実務では1人で開発することはほぼありません。チーム開発で必要になるGit操作を、シミュレーション形式で安全に練習します。

| 学ぶスキル       | 実務での重要度 |
| ---------------- | -------------- |
| ブランチ戦略     | 非常に高い     |
| プルリクエスト   | 非常に高い     |
| コードレビュー   | 非常に高い     |
| コンフリクト解決 | 高い           |
| Issue管理        | 高い           |

---

## 要件リスト

- [ ] GitHubにリポジトリを作成しプッシュする
- [ ] developブランチを作成してブランチ戦略を導入する
- [ ] feature branchで開発してPRを作成する
- [ ] PRをレビューしてマージする
- [ ] 意図的にコンフリクトを発生させて解決する
- [ ] Issueを作成してPRと連携する

---

## 事前準備

### GitHubアカウントの確認

```bash
# Git設定の確認
git config --global user.name
git config --global user.email

# GitHub CLIのインストール（まだの場合）
# macOS
brew install gh

# 認証
gh auth login
```

---

## 演習1: リポジトリ作成とブランチ戦略の決定

### リポジトリを作成する

```bash
mkdir team-practice
cd team-practice
git init
```

### READMEを作成して初回コミット

```bash
cat << 'EOF' > README.md
# チーム開発練習プロジェクト

簡単なプロフィールページを共同開発するプロジェクトです。

## ブランチ戦略

- main: 本番環境用。直接コミット禁止。
- develop: 開発用の統合ブランチ。
- feature/*: 機能開発用。developから分岐し、developにマージ。
- fix/*: バグ修正用。developから分岐し、developにマージ。
EOF

git add README.md
git commit -m "初回コミット: READMEを追加"
```

### GitHubにリポジトリを作成してプッシュ

```bash
gh repo create team-practice --public --source=. --remote=origin --push
```

### developブランチを作成

```bash
git checkout -b develop
git push -u origin develop
```

### ブランチ保護ルールの解説

実務ではmainブランチに直接プッシュできないように保護ルールを設定します。GitHubの設定画面で以下を有効にします。

- **Require a pull request before merging**: マージ前にPR必須
- **Require approvals**: 承認が必要（最低1人）
- **Require status checks to pass**: CI/CDが通ることを必須にする

GitHubの「Settings」 > 「Branches」 > 「Add branch protection rule」から設定できます。

---

## 演習2: feature branchでの開発フロー

2つの機能を別々のブランチで開発し、それぞれPRを作成します。

### 機能A: HTMLの骨格を作成

```bash
# developから新しいブランチを作成
git checkout develop
git checkout -b feature/html-structure

# ファイルを作成
cat << 'EOF' > index.html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>チームプロフィール</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>チームメンバー紹介</h1>
  </header>
  <main>
    <section class="profiles">
      <div class="profile-card">
        <h2>メンバーA</h2>
        <p>フロントエンド担当</p>
      </div>
    </section>
  </main>
  <footer>
    <p>チーム開発練習プロジェクト</p>
  </footer>
</body>
</html>
EOF

# コミットしてプッシュ
git add index.html
git commit -m "feat: HTMLの骨格を追加"
git push -u origin feature/html-structure
```

### PRを作成

```bash
gh pr create \
  --base develop \
  --title "feat: HTMLの骨格を追加" \
  --body "## 概要
HTMLファイルの基本構造を作成しました。

## 変更内容
- index.htmlを新規作成
- ヘッダー、メインコンテンツ、フッターの基本構造

## 確認事項
- [ ] HTMLの構文エラーがないこと
- [ ] セマンティックなタグが使われていること"
```

---

## 演習3: PRレビューとコードレビューの練習

### レビューのチェックポイント

PRをレビューする際は以下の観点で確認します。

```markdown
## コードレビューの観点

1. 機能面
   - 要件を満たしているか
   - エッジケースは考慮されているか

2. コード品質
   - 命名は適切か
   - 重複したコードはないか
   - 不要なコメントや未使用のコードはないか

3. セキュリティ
   - 秘匿情報がハードコードされていないか
   - ユーザー入力のバリデーションはあるか

4. パフォーマンス
   - 不要なDOM操作はないか
   - 画像は最適化されているか
```

### GitHub上でレビューコメントを付ける

```bash
# PRの内容を確認
gh pr view 1

# PRの差分を確認
gh pr diff 1

# レビューコメントを残す（Approve, Request Changes, Comment）
gh pr review 1 --approve --body "HTMLの構造が適切です。LGTMです。"

# PRをマージ
gh pr merge 1 --merge
```

**LGTM**: 「Looks Good To Me（私から見て問題ない）」の略で、コードレビューでよく使われる承認フレーズです。

### マージ後にdevelopブランチを更新

```bash
git checkout develop
git pull origin develop
```

---

## 演習4: コンフリクト解決の実践

意図的にコンフリクトを発生させ、解決方法を練習します。

### ブランチAでfooterを変更

```bash
git checkout develop
git checkout -b feature/footer-update-a
```

`index.html`のfooter部分を変更します。

```html
<footer>
  <p>Copyright 2026 チーム開発練習プロジェクト</p>
</footer>
```

```bash
git add index.html
git commit -m "feat: フッターにCopyright表記を追加"
git push -u origin feature/footer-update-a
```

### ブランチBで同じfooterを別の内容に変更

```bash
git checkout develop
git checkout -b feature/footer-update-b
```

`index.html`のfooter部分を別の内容に変更します。

```html
<footer>
  <p>チーム開発練習 - 2026年制作</p>
  <nav>
    <a href="#">プライバシーポリシー</a>
  </nav>
</footer>
```

```bash
git add index.html
git commit -m "feat: フッターにナビゲーションリンクを追加"
git push -u origin feature/footer-update-b
```

### ブランチAをまずdevelopにマージ

```bash
gh pr create --base develop --title "feat: フッターにCopyright追加" --body "フッター更新A"
# 作成されたPR番号を確認して指定する（例: 2番の場合）
gh pr merge 2 --merge
```

### ブランチBをマージしようとするとコンフリクト発生

```bash
git checkout feature/footer-update-b
git merge develop
```

以下のようなコンフリクトが表示されます。

```
<<<<<<< HEAD
    <p>チーム開発練習 - 2026年制作</p>
    <nav>
      <a href="#">プライバシーポリシー</a>
    </nav>
=======
    <p>Copyright 2026 チーム開発練習プロジェクト</p>
>>>>>>> develop
```

### コンフリクトを解決する

両方の変更を統合します。

```html
<footer>
  <p>Copyright 2026 チーム開発練習プロジェクト</p>
  <nav>
    <a href="#">プライバシーポリシー</a>
  </nav>
</footer>
```

```bash
git add index.html
git commit -m "merge: developをマージしてコンフリクトを解決"
git push origin feature/footer-update-b
```

**コンフリクト解決のコツ**:

- `<<<<<<<`から`=======`が自分の変更
- `=======`から`>>>>>>>`が相手の変更
- 両方の意図を理解した上で、最適な形に統合する
- 解決後は必ず動作確認をする

---

## 演習5: Issue管理とProject board活用

### Issueを作成する

```bash
# 機能追加のIssue
gh issue create \
  --title "CSSでプロフィールカードをスタイリングする" \
  --body "## 概要
プロフィールカードにCSSスタイルを適用する。

## 要件
- カード形式のレイアウト
- ホバーエフェクト
- レスポンシブ対応

## 完了条件
- [ ] カードスタイルが適用されている
- [ ] ホバーで影が変わる
- [ ] モバイルで1カラムになる" \
  --label "enhancement"

# バグ修正のIssue
gh issue create \
  --title "viewportメタタグの確認" \
  --body "モバイル表示が正しく動作するか確認する" \
  --label "bug"
```

### IssueとPRを連携する

PRの本文に`Closes #3`のように記述すると、PRがマージされた際にIssueが自動的にクローズされます。

```bash
git checkout develop
git checkout -b feature/profile-styling

# CSSファイルを作成（省略）

git add style.css
git commit -m "feat: プロフィールカードのスタイルを追加 (#3)"
git push -u origin feature/profile-styling

gh pr create \
  --base develop \
  --title "feat: プロフィールカードのスタイリング" \
  --body "Closes #3

プロフィールカードにCSSスタイルを追加しました。"
```

### GitHub Projects（Project board）

GitHub Projectsを使うとタスクの進捗をカンバン形式で管理できます。

| カラム      | 説明                     |
| ----------- | ------------------------ |
| Todo        | まだ着手していないタスク |
| In Progress | 作業中のタスク           |
| In Review   | レビュー待ちのタスク     |
| Done        | 完了したタスク           |

GitHubの「Projects」タブから作成できます。IssueやPRを各カラムにドラッグして管理します。

---

## 完了チェックリスト

| チェック項目                         | 確認 |
| ------------------------------------ | ---- |
| GitHubにリポジトリを作成できた       |      |
| developブランチを作成できた          |      |
| feature branchを作成して開発できた   |      |
| PRを作成できた                       |      |
| PRのレビューコメントを付けられた     |      |
| PRをマージできた                     |      |
| コンフリクトを意図的に発生させられた |      |
| コンフリクトを正しく解決できた       |      |
| Issueを作成できた                    |      |
| IssueとPRを連携できた                |      |

---

## 発展課題（任意）

- ブランチ保護ルールを設定する
- GitHub Actionsで自動テスト（CI）を追加する
- `CODEOWNERS`ファイルでレビュー担当者を自動指定する
- Gitのrebase、cherry-pick、stashを実践する
- コミットメッセージの規約（Conventional Commits）を導入する

## 参考リンク

- [Git公式ドキュメント](https://git-scm.com/doc) - Gitの公式リファレンスとマニュアル
- [GitHub公式ドキュメント](https://docs.github.com/ja) - GitHub全般の公式ガイド
- [GitHub Flow](https://docs.github.com/ja/get-started/using-github/github-flow) - ブランチ戦略の公式解説
- [Pro Git Book（日本語版、無料）](https://git-scm.com/book/ja/v2) - Gitの仕組みから応用まで網羅した無料書籍
- [Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) - コミットメッセージの標準フォーマット
