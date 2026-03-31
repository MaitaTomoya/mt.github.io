---
title: 'チェックポイント: CLIアプリを作る'
order: 16
section: 'バックエンド基礎'
---

# チェックポイント: CLIアプリを作る

このチェックポイントでは、Node.jsを使ってCLI（コマンドラインインターフェース）のTodoアプリを作成します。ファイル操作、コマンドライン引数の処理、外部パッケージの活用を学びます。

---

## 完成イメージ

```bash
# タスクを追加
$ node todo.js add "記事を書く"
[追加] 記事を書く (ID: 1)

# タスク一覧を表示
$ node todo.js list
  ID  状態    タスク            作成日
  1   [ ]     記事を書く        2026-03-28

# タスクを完了にする
$ node todo.js done 1
[完了] 記事を書く

# タスクを削除
$ node todo.js delete 1
[削除] 記事を書く

# ヘルプを表示
$ node todo.js help
```

---

## 要件リスト

- [ ] `fs`モジュールでJSONファイルにデータを永続化する
- [ ] `process.argv`でコマンドライン引数を処理する
- [ ] `add` / `list` / `done` / `delete`コマンドを実装する
- [ ] `chalk`で出力に色を付ける
- [ ] エラーハンドリングを適切に行う

---

## ステップ1: プロジェクトの準備

```bash
mkdir todo-cli
cd todo-cli
npm init -y
npm install chalk
```

### package.jsonの設定

`package.json`に`"type": "module"`を追加して、ES Modules形式でimportを使えるようにします。

```json
{
  "name": "todo-cli",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "chalk": "^5.3.0"
  }
}
```

---

## ステップ2: データ管理モジュールを作る

タスクデータの読み書きを担当するモジュールを作成します。

`store.js`

```javascript
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * データファイルのパスを取得する
 * __dirnameはES Modulesでは使えないため、import.meta.urlから算出する
 */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_FILE = path.join(__dirname, 'todos.json')

/**
 * JSONファイルから全タスクを読み込む
 * ファイルが存在しない場合は空配列を返す
 * @returns {Array} タスクの配列
 */
export function loadTodos() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return []
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

/**
 * 全タスクをJSONファイルに保存する
 * @param {Array} todos - タスクの配列
 */
export function saveTodos(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), 'utf-8')
}

/**
 * 次のIDを生成する
 * 既存タスクの最大ID + 1を返す
 * @param {Array} todos - タスクの配列
 * @returns {number} 新しいID
 */
export function nextId(todos) {
  if (todos.length === 0) return 1
  return Math.max(...todos.map((t) => t.id)) + 1
}
```

**`fs`モジュールの解説**: Node.jsの標準モジュールで、ファイルの読み書きを行います。`readFileSync`は同期的にファイルを読み込み、`writeFileSync`は同期的にファイルに書き込みます。CLIアプリでは同期処理で問題ありません。

**`process.argv`の解説**: Node.jsがコマンドライン引数を格納する配列です。`process.argv[0]`はNode.jsのパス、`process.argv[1]`はスクリプトのパス、`process.argv[2]`以降がユーザーが入力した引数です。

---

## ステップ3: コマンド処理モジュールを作る

各コマンドの処理を関数として定義します。

`commands.js`

```javascript
import chalk from 'chalk'
import { loadTodos, saveTodos, nextId } from './store.js'

/**
 * タスクを追加する
 * @param {string} text - タスクのテキスト
 */
export function addTodo(text) {
  if (!text) {
    console.log(chalk.red('エラー: タスクのテキストを指定してください'))
    console.log(chalk.gray('使い方: node todo.js add "タスク名"'))
    return
  }

  const todos = loadTodos()
  const id = nextId(todos)
  const newTodo = {
    id,
    text,
    done: false,
    createdAt: new Date().toISOString().split('T')[0],
  }

  todos.push(newTodo)
  saveTodos(todos)

  console.log(chalk.green(`[追加] ${text} (ID: ${id})`))
}

/**
 * タスク一覧を表示する
 */
export function listTodos() {
  const todos = loadTodos()

  if (todos.length === 0) {
    console.log(chalk.yellow('タスクはありません'))
    return
  }

  // ヘッダー
  console.log('')
  console.log(chalk.bold(padEnd('ID', 6) + padEnd('状態', 8) + padEnd('タスク', 24) + '作成日'))
  console.log(chalk.gray('-'.repeat(50)))

  // 各タスク
  todos.forEach((todo) => {
    const status = todo.done ? chalk.green('[x]') : chalk.gray('[ ]')
    const text = todo.done ? chalk.strikethrough.gray(todo.text) : chalk.white(todo.text)

    console.log(
      padEnd(String(todo.id), 6) + padEnd(status, 8) + padEnd(text, 24) + chalk.gray(todo.createdAt)
    )
  })

  console.log('')

  // 統計
  const doneCount = todos.filter((t) => t.done).length
  console.log(
    chalk.gray(
      `合計: ${todos.length} 件 / 完了: ${doneCount} 件 / 未完了: ${todos.length - doneCount} 件`
    )
  )
}

/**
 * タスクを完了にする
 * @param {string} idStr - タスクのID（文字列）
 */
export function doneTodo(idStr) {
  const id = parseInt(idStr, 10)
  if (isNaN(id)) {
    console.log(chalk.red('エラー: 有効なIDを指定してください'))
    return
  }

  const todos = loadTodos()
  const todo = todos.find((t) => t.id === id)

  if (!todo) {
    console.log(chalk.red(`エラー: ID ${id} のタスクが見つかりません`))
    return
  }

  if (todo.done) {
    console.log(chalk.yellow(`ID ${id} は既に完了しています`))
    return
  }

  todo.done = true
  saveTodos(todos)

  console.log(chalk.green(`[完了] ${todo.text}`))
}

/**
 * タスクを削除する
 * @param {string} idStr - タスクのID（文字列）
 */
export function deleteTodo(idStr) {
  const id = parseInt(idStr, 10)
  if (isNaN(id)) {
    console.log(chalk.red('エラー: 有効なIDを指定してください'))
    return
  }

  const todos = loadTodos()
  const index = todos.findIndex((t) => t.id === id)

  if (index === -1) {
    console.log(chalk.red(`エラー: ID ${id} のタスクが見つかりません`))
    return
  }

  const removed = todos.splice(index, 1)[0]
  saveTodos(todos)

  console.log(chalk.red(`[削除] ${removed.text}`))
}

/**
 * ヘルプを表示する
 */
export function showHelp() {
  console.log('')
  console.log(chalk.bold('Todo CLI - 使い方'))
  console.log('')
  console.log('  node todo.js ' + chalk.cyan('add') + ' "タスク名"    タスクを追加')
  console.log('  node todo.js ' + chalk.cyan('list') + '              タスク一覧を表示')
  console.log('  node todo.js ' + chalk.cyan('done') + ' <ID>         タスクを完了にする')
  console.log('  node todo.js ' + chalk.cyan('delete') + ' <ID>       タスクを削除する')
  console.log('  node todo.js ' + chalk.cyan('help') + '              このヘルプを表示')
  console.log('')
}

/**
 * 文字列を指定幅に右パディングする（簡易版）
 * chalkの装飾文字列を含む場合は正確でない場合がある
 * @param {string} str - 対象文字列
 * @param {number} width - 幅
 * @returns {string} パディングされた文字列
 */
function padEnd(str, width) {
  const len = stripAnsi(str).length
  if (len >= width) return str
  return str + ' '.repeat(width - len)
}

/**
 * ANSIエスケープシーケンスを除去する（簡易版）
 * @param {string} str - 対象文字列
 * @returns {string} エスケープシーケンスを除去した文字列
 */
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}
```

**chalkの解説**: `chalk`はターミナル出力に色やスタイルを付けるパッケージです。`chalk.red("エラー")`で赤色テキスト、`chalk.bold("太字")`で太字テキストを出力します。チェーンも可能で`chalk.bold.green("成功")`のように使えます。

---

## ステップ4: メインファイルでコマンドを振り分ける

`todo.js`

```javascript
import { addTodo, listTodos, doneTodo, deleteTodo, showHelp } from './commands.js'

/**
 * メイン処理
 * process.argvからコマンドと引数を取得して処理を振り分ける
 */
function main() {
  // process.argv[0] = node, process.argv[1] = todo.js
  const command = process.argv[2]
  const arg = process.argv[3]

  switch (command) {
    case 'add':
      addTodo(arg)
      break
    case 'list':
      listTodos()
      break
    case 'done':
      doneTodo(arg)
      break
    case 'delete':
      deleteTodo(arg)
      break
    case 'help':
      showHelp()
      break
    default:
      showHelp()
      break
  }
}

main()
```

---

## ステップ5: 動作確認

以下のコマンドを順番に実行して動作を確認します。

```bash
# ヘルプ表示
node todo.js help

# タスクを3つ追加
node todo.js add "Node.jsの基礎を学ぶ"
node todo.js add "CLIアプリを完成させる"
node todo.js add "READMEを書く"

# 一覧を表示
node todo.js list

# ID 1のタスクを完了にする
node todo.js done 1

# 一覧を再表示（完了状態を確認）
node todo.js list

# ID 3のタスクを削除
node todo.js delete 3

# 最終確認
node todo.js list

# エラーケースの確認
node todo.js add
node todo.js done 999
node todo.js delete abc
```

### 保存されたJSONファイルの確認

`todos.json`が以下のような形式で保存されていることを確認します。

```json
[
  {
    "id": 1,
    "text": "Node.jsの基礎を学ぶ",
    "done": true,
    "createdAt": "2026-03-28"
  },
  {
    "id": 2,
    "text": "CLIアプリを完成させる",
    "done": false,
    "createdAt": "2026-03-28"
  }
]
```

---

## ファイル構成のまとめ

```
todo-cli/
├── package.json      # プロジェクト設定
├── todo.js           # エントリーポイント（コマンド振り分け）
├── commands.js       # 各コマンドの処理ロジック
├── store.js          # データの読み書き
└── todos.json        # データファイル（自動生成）
```

| ファイル      | 役割                                                   |
| ------------- | ------------------------------------------------------ |
| `todo.js`     | コマンドラインの入力を受け取り、適切な関数に振り分ける |
| `commands.js` | 各コマンド（add, list, done, delete）の具体的な処理    |
| `store.js`    | JSONファイルの読み書きとID生成                         |

このようにファイルを分割することで、各ファイルの責務が明確になり、変更が容易になります。

---

## 完了チェックリスト

| チェック項目                             | 確認 |
| ---------------------------------------- | ---- |
| `add`コマンドでタスクを追加できる        |      |
| `list`コマンドでタスク一覧が表示される   |      |
| `done`コマンドでタスクを完了にできる     |      |
| `delete`コマンドでタスクを削除できる     |      |
| データがJSONファイルに永続化される       |      |
| Node.jsを再起動してもデータが消えない    |      |
| 不正な入力にエラーメッセージが表示される |      |
| 出力に色が付いている（chalk）            |      |
| `help`コマンドが動作する                 |      |

---

## 発展課題（任意）

- タスクに優先度（高/中/低）を追加する
- タスクの絞り込み表示（完了のみ、未完了のみ）
- `npm link`でグローバルコマンドとして使えるようにする
- inquirerパッケージで対話式CLIにする
- テストコードを書く（Vitest）

## 参考リンク

- [Node.js公式ドキュメント - File System](https://nodejs.org/docs/latest/api/fs.html) - ファイル操作APIのリファレンス
- [Node.js公式ドキュメント - Process](https://nodejs.org/docs/latest/api/process.html) - コマンドライン引数の処理方法
- [npm公式ドキュメント](https://docs.npmjs.com/) - npmの公式リファレンス
- [chalk GitHub](https://github.com/chalk/chalk) - ターミナル出力の色付けライブラリ
- [inquirer GitHub](https://github.com/SBoudrias/Inquirer.js) - 対話式CLIライブラリ
