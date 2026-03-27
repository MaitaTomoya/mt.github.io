---
id: 65
title: "JSのフォーマット修正はprettierに任せろ — CI失敗から学んだこと"
tags: [JavaScript, prettier, CI/CD, フォーマッター, 開発Tips]
create: "2026-03-26 17:00"
---

CIのprettierチェックが通らず、手動で直しても再び失敗するという経験をした。原因と対処法をメモする。

## 何が起きたか

PRで新規のJSファイル（Stimulus controller）を追加したところ、CIのprettierチェックが失敗した。

エラー内容は「1行が長すぎるので改行せよ」というもの。

## 手動で直して再びFAIL

指摘に従って手動で改行を入れたが、**別の箇所で再びFAIL**した。

```javascript
// 最初にClaudeが書き出したコード（NG）
const result =
    someObject.getContent().doSomething(true).getChild();

// prettierが期待する改行（OK）
const result = someObject.getContent().doSomething(true)
    .getChild();
```

違いは「`=` の後で改行」か「メソッドチェーンの `.` の前で改行」か。prettierはメソッドチェーンの `.` を次の行の先頭に置くルールを持っている。人間の感覚だと `=` の後で切りたくなるが、prettierのルールは異なる。

## 正解

**手動で直さない。`npx prettier --write` で自動修正する。**

```bash
npx prettier --write path/to/file.js
npx prettier --check path/to/file.js  # 確認
```

prettierのルールを全て把握して手動で合わせるのは現実的ではない。自動修正に任せるのが最も確実で速い。

## pre-commit hookとの関係

プロジェクトではlint-stagedが設定されており、コミット時に自動でprettierが走る。しかし `--no-verify` でコミットするとスキップされる。今回は `git commit --amend --no-verify` を多用していたためスキップされ続け、CIで初めて検出された。

### 教訓

- `--no-verify` でコミットした場合は、push前に `npx prettier --check` を手動で実行する
- フォーマットの手動修正は避け、`npx prettier --write` に任せる
- CIで失敗したら、エラー箇所だけでなくファイル全体に `prettier --write` を実行する（部分修正だと他の箇所で再び失敗する）
