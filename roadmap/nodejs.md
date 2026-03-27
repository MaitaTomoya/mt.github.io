---
title: 'Node.js'
order: 15
section: 'バックエンド基礎'
---

# Node.js

## Node.jsとは何か

Node.jsは**JavaScriptをサーバーサイドで実行するためのランタイム環境**。通常、JavaScriptはブラウザの中でしか動かないが、Node.jsを使うことで、パソコン上でファイルの読み書きをしたり、Webサーバーを立てたり、データベースに接続したりできるようになる。

2009年にRyan Dahlが開発した。それまで「JavaScriptはフロントエンド専用」だったが、Node.jsの登場によって**フロントエンドもバックエンドもJavaScriptで書ける**時代が始まった。

### V8エンジン

Node.jsの内部では、GoogleがChrome用に開発した**V8 JavaScriptエンジン**が動いている。V8はJavaScriptのコードを高速に実行するためのエンジンで、JavaScriptを直接マシンコード（CPUが理解できるコード）に変換する。

```
ユーザーが書いたJavaScript
       |
       v
   V8エンジン（コンパイル・最適化）
       |
       v
   マシンコード（CPUが直接実行）
```

つまり、Node.jsは「V8エンジン + サーバーサイド向け機能（ファイル操作、ネットワークなど）」をまとめたパッケージだと思えばよい。

### イベント駆動・ノンブロッキングI/O

Node.jsの最大の特徴は**イベント駆動**かつ**ノンブロッキングI/O**という仕組みにある。

レストランに例えてみよう。

**ブロッキング（従来のサーバー）:**
ウェイターが1人いて、1組の客の注文を受けたら料理が出来上がるまでその場で待ち続ける。他の客は待たされる。

**ノンブロッキング（Node.js）:**
ウェイターが1人いて、注文を受けたらキッチンに伝えてすぐ次の客の注文を取りに行く。料理ができたらキッチンから呼ばれて（イベント発火）、その客に料理を届ける。

```
【ブロッキングI/O】
リクエスト1 → [ファイル読み込み中...待機...完了] → レスポンス1
                                                   リクエスト2 → [DB問い合わせ中...待機...完了] → レスポンス2

【ノンブロッキングI/O（Node.js）】
リクエスト1 → ファイル読み込み開始 →（待たない）→ リクエスト2 → DB問い合わせ開始 →（待たない）→ ...
              ↓ 完了通知                           ↓ 完了通知
              レスポンス1                           レスポンス2
```

このおかげで、**シングルスレッド（1つの処理の流れ）でありながら、多数の同時接続を効率よく処理できる**。チャットアプリやリアルタイム通知など、大量の接続が発生するアプリケーションに特に向いている。

## ブラウザJavaScriptとNode.jsの違い

同じJavaScriptでも、実行される場所によってできることが異なる。

| 比較項目                 | ブラウザJS                     | Node.js                         |
| ------------------------ | ------------------------------ | ------------------------------- |
| 実行場所                 | ブラウザの中                   | パソコン/サーバー上             |
| DOM操作                  | できる（document, windowなど） | **できない**                    |
| ファイル操作             | **できない**（セキュリティ上） | できる（fsモジュール）          |
| ネットワークサーバー構築 | **できない**                   | できる（httpモジュール）        |
| グローバルオブジェクト   | `window`                       | `global` / `globalThis`         |
| プロセス情報             | なし                           | `process`オブジェクトで取得可能 |
| モジュールシステム       | ES Modules（import/export）    | CommonJS（require）+ ES Modules |
| パッケージ管理           | なし（CDNやbundler経由）       | npm / yarn / pnpm               |

```javascript
// ブラウザでは動くが、Node.jsではエラーになるコード
document.getElementById('app') // ReferenceError: document is not defined
window.alert('Hello') // ReferenceError: window is not defined

// Node.jsでは動くが、ブラウザではエラーになるコード
const fs = require('fs')
fs.readFileSync('./data.txt', 'utf-8') // ブラウザにはfsモジュールがない

// Node.js固有のオブジェクト
console.log(process.version) // Node.jsのバージョン
console.log(process.platform) // 'darwin', 'linux', 'win32'
console.log(process.cwd()) // 現在の作業ディレクトリ
console.log(process.env.HOME) // 環境変数の取得
```

## インストール方法

### nvm（Node Version Manager）を使う方法（推奨）

Node.jsはバージョンによって機能が異なるため、プロジェクトごとにバージョンを切り替える場面が多い。**nvm**を使うと、複数のバージョンを簡単にインストール・切り替えできる。

```bash
# nvmのインストール（macOS / Linux）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# ターミナルを再起動してから確認
nvm --version

# Node.jsのLTS（Long Term Support = 長期サポート版）をインストール
nvm install --lts

# 特定のバージョンをインストール
nvm install 20
nvm install 18

# インストール済みのバージョン一覧
nvm ls

# バージョンの切り替え
nvm use 20
nvm use 18

# デフォルトのバージョンを設定
nvm alias default 20

# 現在のバージョン確認
node -v
npm -v
```

**なぜnvmが推奨されるのか:**

| インストール方法   | メリット                             | デメリット                 |
| ------------------ | ------------------------------------ | -------------------------- |
| 公式サイトから直接 | 簡単                                 | バージョン切り替えが面倒   |
| nvm                | 複数バージョン管理、切り替えが簡単   | 初回セットアップが少し手間 |
| Homebrew（macOS）  | 簡単                                 | バージョン管理が難しい     |
| Volta              | 高速、プロジェクト単位で自動切り替え | 比較的新しいツール         |

プロジェクトのルートに`.nvmrc`ファイルを置くと、チームで同じバージョンを使える。

```bash
# .nvmrcファイルの作成（バージョンを記載するだけ）
echo "20" > .nvmrc

# .nvmrcに書かれたバージョンに切り替え
nvm use
```

### Node.jsとnpmの関係

Node.jsをインストールすると、**npm（Node Package Manager）** も一緒にインストールされる。npmはJavaScriptのパッケージ（ライブラリ）を管理するためのツール。

```bash
# npmのバージョン確認
npm -v

# パッケージの初期化（package.jsonを作成）
npm init -y

# パッケージのインストール
npm install express           # dependencies（本番で必要）
npm install --save-dev jest   # devDependencies（開発時のみ必要）

# グローバルインストール（コマンドとして使えるようになる）
npm install -g nodemon
```

## Hello World

### ファイルを実行する方法

```javascript
// hello.js
console.log('Hello, Node.js!')
console.log('実行環境:', process.platform)
console.log('Node.jsバージョン:', process.version)
```

```bash
# 実行
node hello.js

# 出力:
# Hello, Node.js!
# 実行環境: darwin
# Node.jsバージョン: v20.x.x
```

### REPL（Read-Eval-Print Loop）

REPLは「入力→評価→出力→繰り返し」の対話的な実行環境。ちょっとしたコードの動作確認に便利。

```bash
# REPLを起動
node

# 以下、対話的に実行できる
> 1 + 2
3
> 'Hello' + ' World'
'Hello World'
> const arr = [1, 2, 3]
undefined
> arr.map(x => x * 2)
[ 2, 4, 6 ]
> .exit  # REPLを終了
```

### 簡単なHTTPサーバー

Node.jsの醍醐味は、たった数行でWebサーバーを立てられること。

```javascript
// server.js
const http = require('http')

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('こんにちは、Node.jsサーバーです!')
})

server.listen(3000, () => {
  console.log('サーバーが http://localhost:3000 で起動しました')
})
```

```bash
node server.js
# ブラウザで http://localhost:3000 にアクセスすると表示される
```

## モジュールシステム

Node.jsには**CommonJS**と**ES Modules**の2つのモジュールシステムがある。

### CommonJS（require / module.exports）

Node.jsで従来から使われている方式。`require()`でモジュールを読み込み、`module.exports`でエクスポートする。

```javascript
// math.js（モジュール側）
function add(a, b) {
  return a + b
}

function multiply(a, b) {
  return a * b
}

module.exports = { add, multiply }
```

```javascript
// app.js（使う側）
const { add, multiply } = require('./math')

console.log(add(2, 3)) // 5
console.log(multiply(4, 5)) // 20
```

### ES Modules（import / export）

JavaScriptの標準仕様であるES Modulesも使える。Node.jsでES Modulesを使うには、以下のいずれかが必要。

1. ファイル拡張子を`.mjs`にする
2. `package.json`に`"type": "module"`を追加する

```javascript
// math.mjs（モジュール側）
export function add(a, b) {
  return a + b
}

export function multiply(a, b) {
  return a * b
}

export default function subtract(a, b) {
  return a - b
}
```

```javascript
// app.mjs（使う側）
import subtract, { add, multiply } from './math.mjs'

console.log(add(2, 3)) // 5
console.log(multiply(4, 5)) // 20
console.log(subtract(10, 3)) // 7
```

### CommonJS vs ES Modules 比較

| 項目               | CommonJS                       | ES Modules                    |
| ------------------ | ------------------------------ | ----------------------------- |
| 構文               | `require()` / `module.exports` | `import` / `export`           |
| 読み込みタイミング | 実行時（動的）                 | パース時（静的）              |
| トップレベルawait  | 不可                           | 可能                          |
| ファイル拡張子     | `.js`（デフォルト）            | `.mjs`または`"type":"module"` |
| 循環参照           | 部分的にサポート               | 仕様で明確に定義              |
| Tree Shaking       | 難しい                         | 可能（静的解析できるため）    |
| 現在の推奨         | レガシーだが広く使われている   | **新規プロジェクトでは推奨**  |

実務では、古いプロジェクトはCommonJS、新しいプロジェクトはES Modulesを使う傾向にある。どちらも読めるようにしておくことが重要。

## 組み込みモジュール

Node.jsには最初から使えるモジュール（ビルトインモジュール）が多数用意されている。外部パッケージをインストールしなくても、基本的な機能はこれらで実現できる。

### fs（ファイルシステム）

ファイルやディレクトリの操作を行う。

```javascript
const fs = require('fs')

// --- ファイルの読み込み（非同期）---
fs.readFile('./data.txt', 'utf-8', (err, data) => {
  if (err) {
    console.error('読み込みエラー:', err.message)
    return
  }
  console.log('ファイル内容:', data)
})

// --- ファイルの読み込み（同期）---
try {
  const data = fs.readFileSync('./data.txt', 'utf-8')
  console.log('ファイル内容:', data)
} catch (err) {
  console.error('読み込みエラー:', err.message)
}

// --- ファイルの読み込み（Promiseベース、推奨）---
const fsPromises = require('fs').promises
// または: const fsPromises = require('fs/promises'); // Node.js 14以降

async function readData() {
  try {
    const data = await fsPromises.readFile('./data.txt', 'utf-8')
    console.log('ファイル内容:', data)
  } catch (err) {
    console.error('読み込みエラー:', err.message)
  }
}
readData()

// --- ファイルの書き込み ---
fs.writeFile('./output.txt', 'Hello, World!', (err) => {
  if (err) {
    console.error('書き込みエラー:', err.message)
    return
  }
  console.log('ファイルに書き込みました')
})

// --- ファイルの追記 ---
fs.appendFile('./log.txt', '新しいログ行\n', (err) => {
  if (err) console.error(err)
})

// --- ディレクトリの作成 ---
fs.mkdir('./new-dir', { recursive: true }, (err) => {
  if (err) console.error(err)
})

// --- ファイル一覧の取得 ---
fs.readdir('./', (err, files) => {
  if (err) console.error(err)
  console.log('ファイル一覧:', files)
})

// --- ファイルの存在確認 ---
console.log(fs.existsSync('./data.txt')) // true or false

// --- ファイル情報の取得 ---
fs.stat('./data.txt', (err, stats) => {
  if (err) console.error(err)
  console.log('ファイルサイズ:', stats.size, 'bytes')
  console.log('最終更新:', stats.mtime)
  console.log('ディレクトリか:', stats.isDirectory())
})
```

### path（パス操作）

OS間のパスの違い（Windowsは`\`、macOS/Linuxは`/`）を吸収してくれるモジュール。

```javascript
const path = require('path')

// パスの結合（OSに応じた区切り文字を使ってくれる）
console.log(path.join('/users', 'taro', 'documents', 'file.txt'))
// → /users/taro/documents/file.txt

// 絶対パスの取得
console.log(path.resolve('src', 'index.js'))
// → /current/working/directory/src/index.js

// ファイル名の取得
console.log(path.basename('/users/taro/photo.jpg')) // photo.jpg
console.log(path.basename('/users/taro/photo.jpg', '.jpg')) // photo

// 拡張子の取得
console.log(path.extname('report.pdf')) // .pdf
console.log(path.extname('archive.tar.gz')) // .gz

// ディレクトリ名の取得
console.log(path.dirname('/users/taro/photo.jpg')) // /users/taro

// パスのパース（分解）
console.log(path.parse('/users/taro/photo.jpg'))
// {
//   root: '/',
//   dir: '/users/taro',
//   base: 'photo.jpg',
//   ext: '.jpg',
//   name: 'photo'
// }
```

### http（HTTPサーバー/クライアント）

```javascript
const http = require('http')

// --- サーバーの作成 ---
const server = http.createServer((req, res) => {
  // リクエスト情報
  console.log(`${req.method} ${req.url}`)

  // ルーティング
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'トップページ' }))
  } else if (req.url === '/about' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Aboutページ')
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'ページが見つかりません' }))
  }
})

server.listen(3000, () => {
  console.log('http://localhost:3000 で起動中')
})
```

### os（OS情報）

```javascript
const os = require('os')

console.log('ホスト名:', os.hostname())
console.log('OS:', os.platform()) // darwin, linux, win32
console.log('アーキテクチャ:', os.arch()) // x64, arm64
console.log('CPUコア数:', os.cpus().length)
console.log('メモリ(合計):', Math.round(os.totalmem() / 1024 / 1024 / 1024), 'GB')
console.log('メモリ(空き):', Math.round(os.freemem() / 1024 / 1024 / 1024), 'GB')
console.log('ホームディレクトリ:', os.homedir())
console.log('一時ディレクトリ:', os.tmpdir())
```

### url（URL解析）

```javascript
const { URL } = require('url')

const myUrl = new URL('https://example.com:8080/api/users?page=2&sort=name#section1')

console.log('プロトコル:', myUrl.protocol) // https:
console.log('ホスト:', myUrl.host) // example.com:8080
console.log('ホスト名:', myUrl.hostname) // example.com
console.log('ポート:', myUrl.port) // 8080
console.log('パス:', myUrl.pathname) // /api/users
console.log('クエリ:', myUrl.search) // ?page=2&sort=name
console.log('ハッシュ:', myUrl.hash) // #section1

// クエリパラメータの取得
console.log('page:', myUrl.searchParams.get('page')) // 2
console.log('sort:', myUrl.searchParams.get('sort')) // name
```

### crypto（暗号化）

```javascript
const crypto = require('crypto')

// ランダムな文字列の生成（トークンやIDに使える）
const token = crypto.randomBytes(32).toString('hex')
console.log('トークン:', token)

// UUIDの生成
const uuid = crypto.randomUUID()
console.log('UUID:', uuid)

// ハッシュの生成（パスワードのハッシュ化などに使う）
const hash = crypto.createHash('sha256').update('password123').digest('hex')
console.log('SHA256ハッシュ:', hash)

// HMAC（メッセージ認証コード）
const hmac = crypto.createHmac('sha256', 'secret-key').update('message').digest('hex')
console.log('HMAC:', hmac)
```

### events（イベントエミッター）

Node.jsのイベント駆動の基盤となるモジュール。

```javascript
const EventEmitter = require('events')

// イベントエミッターのインスタンスを作成
const emitter = new EventEmitter()

// イベントリスナーの登録
emitter.on('order', (item, quantity) => {
  console.log(`注文を受けました: ${item} x ${quantity}`)
})

emitter.on('order', (item, quantity) => {
  console.log(`在庫を確認します: ${item}`)
})

// 1回だけ実行されるリスナー
emitter.once('welcome', (name) => {
  console.log(`ようこそ、${name}さん!`)
})

// イベントの発火
emitter.emit('order', 'コーヒー', 2)
// 出力:
// 注文を受けました: コーヒー x 2
// 在庫を確認します: コーヒー

emitter.emit('welcome', '太郎') // ようこそ、太郎さん!
emitter.emit('welcome', '花子') // （何も出力されない。onceなので1回だけ）
```

### 組み込みモジュール一覧（主要なもの）

| モジュール       | 用途                 | よく使う場面                         |
| ---------------- | -------------------- | ------------------------------------ |
| `fs`             | ファイルシステム操作 | ファイルの読み書き、ディレクトリ操作 |
| `path`           | パス操作             | ファイルパスの結合・解析             |
| `http` / `https` | HTTP通信             | サーバー構築、APIリクエスト          |
| `os`             | OS情報               | システム情報の取得                   |
| `url`            | URL解析              | URLのパース、クエリパラメータ操作    |
| `crypto`         | 暗号化               | ハッシュ生成、トークン生成           |
| `events`         | イベント処理         | カスタムイベントの作成               |
| `stream`         | ストリーム処理       | 大量データの逐次処理                 |
| `child_process`  | 子プロセス           | 外部コマンドの実行                   |
| `util`           | ユーティリティ       | デバッグ、フォーマット               |
| `buffer`         | バイナリデータ       | バイナリデータの操作                 |
| `zlib`           | 圧縮/解凍            | gzip圧縮                             |
| `readline`       | 行単位の入力         | CLI対話ツールの作成                  |

## ファイルの読み書き（詳細）

ファイルの読み書きには3つのスタイルがある。それぞれの違いを理解しておくことが重要。

### 同期（Sync） vs 非同期（コールバック） vs 非同期（Promise/async-await）

```javascript
const fs = require('fs')
const fsPromises = require('fs').promises

// ========================================
// 1. 同期（Sync）- 処理が完了するまで次に進まない
// ========================================
console.log('--- 同期処理 ---')
console.log('読み込み開始')
const data1 = fs.readFileSync('./sample.txt', 'utf-8')
console.log('内容:', data1)
console.log('読み込み完了') // 必ず上の行の後に実行される

// 出力順: 読み込み開始 → 内容:... → 読み込み完了

// ========================================
// 2. 非同期（コールバック）- 処理の完了を待たない
// ========================================
console.log('--- コールバック ---')
console.log('読み込み開始')
fs.readFile('./sample.txt', 'utf-8', (err, data) => {
  if (err) throw err
  console.log('内容:', data)
})
console.log('読み込み完了（のはず）') // 先にこちらが実行される!

// 出力順: 読み込み開始 → 読み込み完了（のはず）→ 内容:...

// ========================================
// 3. 非同期（async/await）- 見た目は同期だが非同期 ★推奨★
// ========================================
async function readFileAsync() {
  console.log('--- async/await ---')
  console.log('読み込み開始')
  const data = await fsPromises.readFile('./sample.txt', 'utf-8')
  console.log('内容:', data)
  console.log('読み込み完了')
}
readFileAsync()

// 出力順: 読み込み開始 → 内容:... → 読み込み完了
```

**どれを使うべきか:**

| スタイル        | 使う場面                     | 注意点                                         |
| --------------- | ---------------------------- | ---------------------------------------------- |
| 同期（Sync）    | 起動時の設定ファイル読み込み | **サーバー処理中に使うとブロックされる**       |
| コールバック    | レガシーコード               | コールバック地獄になりやすい                   |
| **async/await** | **新規コード全般**           | **推奨。読みやすく、エラーハンドリングも容易** |

### 実践的なファイル操作

```javascript
const fs = require('fs').promises
const path = require('path')

// JSONファイルの読み書き
async function manageConfig() {
  const configPath = path.join(__dirname, 'config.json')

  // JSONファイルの読み込み
  const raw = await fs.readFile(configPath, 'utf-8')
  const config = JSON.parse(raw)
  console.log('現在の設定:', config)

  // 設定の変更
  config.port = 4000
  config.debug = true

  // JSONファイルの書き込み（整形して保存）
  await fs.writeFile(configPath, JSON.stringify(config, null, 2))
  console.log('設定を更新しました')
}

// ディレクトリ内のファイルを再帰的に一覧表示
async function listFiles(dirPath, indent = '') {
  const items = await fs.readdir(dirPath, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name)
    if (item.isDirectory()) {
      console.log(`${indent}[DIR] ${item.name}/`)
      await listFiles(fullPath, indent + '  ')
    } else {
      const stats = await fs.stat(fullPath)
      const sizeKB = (stats.size / 1024).toFixed(1)
      console.log(`${indent}${item.name} (${sizeKB} KB)`)
    }
  }
}

// CSVファイルの簡易パース
async function parseCSV(filePath) {
  const content = await fs.readFile(filePath, 'utf-8')
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',')
  const data = lines.slice(1).map((line) => {
    const values = line.split(',')
    return headers.reduce((obj, header, i) => {
      obj[header.trim()] = values[i].trim()
      return obj
    }, {})
  })
  return data
}
```

## HTTPサーバーの作成

### 素のNode.js vs Express.js

Node.jsの組み込み`http`モジュールだけでもサーバーは作れるが、ルーティングやリクエストボディの解析など、全て自分で実装する必要がある。Express.jsはそういった面倒な処理を簡単にしてくれるフレームワーク。

```javascript
// ====================================
// 素のNode.jsでAPIサーバーを作る場合
// ====================================
const http = require('http')

const server = http.createServer((req, res) => {
  // リクエストボディを自分で収集する必要がある
  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })
  req.on('end', () => {
    // ルーティングも自分で分岐
    if (req.method === 'GET' && req.url === '/api/users') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify([{ id: 1, name: '太郎' }]))
    } else if (req.method === 'POST' && req.url === '/api/users') {
      const user = JSON.parse(body)
      res.writeHead(201, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ id: 2, ...user }))
    } else {
      res.writeHead(404)
      res.end('Not Found')
    }
  })
})

server.listen(3000)
```

```javascript
// ====================================
// Express.jsで同じことをする場合
// ====================================
const express = require('express')
const app = express()

app.use(express.json()) // JSONボディを自動解析

app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: '太郎' }])
})

app.post('/api/users', (req, res) => {
  const user = req.body // 自動でパースされている
  res.status(201).json({ id: 2, ...user })
})

app.listen(3000)
```

見比べると、Express.jsの方がはるかにシンプルで読みやすいことがわかる。

## Express.js入門

### インストールとプロジェクトセットアップ

```bash
# プロジェクトディレクトリの作成
mkdir my-api && cd my-api

# package.jsonの初期化
npm init -y

# Expressのインストール
npm install express

# 開発用にnodemonをインストール（ファイル変更で自動再起動）
npm install --save-dev nodemon
```

```json
// package.json に追加
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

### ルーティング

```javascript
const express = require('express')
const app = express()

// GETリクエスト
app.get('/', (req, res) => {
  res.send('トップページ')
})

// パスパラメータ（:idの部分が動的に変わる）
app.get('/users/:id', (req, res) => {
  const userId = req.params.id
  res.json({ id: userId, name: `ユーザー${userId}` })
})

// クエリパラメータ（?key=value の形式）
// 例: /search?q=Node.js&page=2
app.get('/search', (req, res) => {
  const query = req.query.q
  const page = req.query.page || 1
  res.json({ query, page })
})

// POSTリクエスト
app.use(express.json()) // JSONボディパーサー
app.post('/users', (req, res) => {
  const { name, email } = req.body
  res.status(201).json({ id: Date.now(), name, email })
})

// PUTリクエスト（全体更新）
app.put('/users/:id', (req, res) => {
  const { id } = req.params
  const { name, email } = req.body
  res.json({ id, name, email, updated: true })
})

// DELETEリクエスト
app.delete('/users/:id', (req, res) => {
  const { id } = req.params
  res.json({ message: `ユーザー${id}を削除しました` })
})

// ルーターの分割（大規模アプリ向け）
const userRouter = express.Router()
userRouter.get('/', (req, res) => res.json({ users: [] }))
userRouter.get('/:id', (req, res) => res.json({ id: req.params.id }))
userRouter.post('/', (req, res) => res.status(201).json(req.body))

app.use('/api/users', userRouter) // /api/users 以下のルートをまとめて登録

app.listen(3000, () => {
  console.log('http://localhost:3000 で起動中')
})
```

### ミドルウェア

ミドルウェアはExpress.jsの核となる概念。リクエストが来てからレスポンスを返すまでの間に、順番に実行される関数のチェーンのこと。

```
リクエスト → [ログ記録] → [認証チェック] → [ボディ解析] → [ルートハンドラ] → レスポンス
              ↑ミドルウェア1  ↑ミドルウェア2   ↑ミドルウェア3    ↑最終処理
```

各ミドルウェアは`(req, res, next)`の3つの引数を受け取る。`next()`を呼ぶと次のミドルウェアに処理が渡る。

```javascript
const express = require('express')
const app = express()

// ========================================
// アプリケーション全体に適用するミドルウェア
// ========================================

// ログ記録ミドルウェア
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.url}`)
  next() // 次のミドルウェアへ
})

// リクエスト処理時間の計測
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`処理時間: ${duration}ms`)
  })
  next()
})

// 組み込みミドルウェア
app.use(express.json()) // JSONボディのパース
app.use(express.urlencoded({ extended: true })) // フォームデータのパース
app.use(express.static('public')) // 静的ファイルの配信

// ========================================
// 特定のルートにのみ適用するミドルウェア
// ========================================

// 認証チェックミドルウェア
function authMiddleware(req, res, next) {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ error: '認証が必要です' })
  }
  // トークンの検証処理...
  req.userId = 'decoded-user-id' // 検証結果をreqに追加
  next()
}

// 認証が必要なルートにのみ適用
app.get('/api/profile', authMiddleware, (req, res) => {
  res.json({ userId: req.userId, name: 'テストユーザー' })
})

// 複数のミドルウェアを連結
function validateInput(req, res, next) {
  if (!req.body.name) {
    return res.status(400).json({ error: 'nameは必須です' })
  }
  next()
}

app.post('/api/users', authMiddleware, validateInput, (req, res) => {
  res.status(201).json({ message: 'ユーザーを作成しました' })
})

// ========================================
// エラーハンドリングミドルウェア（引数が4つ）
// ========================================
app.use((err, req, res, next) => {
  console.error('エラー発生:', err.message)
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      status: err.status || 500,
    },
  })
})

app.listen(3000)
```

### 静的ファイル配信

```javascript
const express = require('express')
const path = require('path')
const app = express()

// publicディレクトリ内のファイルをそのまま配信
// public/index.html → http://localhost:3000/index.html
// public/css/style.css → http://localhost:3000/css/style.css
app.use(express.static(path.join(__dirname, 'public')))

// パスプレフィックスを付けることもできる
// public/logo.png → http://localhost:3000/static/logo.png
app.use('/static', express.static(path.join(__dirname, 'public')))

app.listen(3000)
```

## 環境変数

アプリケーションの設定値（データベースのURL、APIキー、ポート番号など）は**コードに直接書かず、環境変数で管理する**のが鉄則。

### process.env

```javascript
// Node.jsの組み込み機能で環境変数にアクセスできる
console.log(process.env.NODE_ENV) // 'development' or 'production'
console.log(process.env.PORT) // '3000'
console.log(process.env.HOME) // '/Users/taro'

// 実行時に環境変数を指定
// PORT=4000 NODE_ENV=production node app.js
```

### dotenvパッケージ

`.env`ファイルに設定値を書き、`dotenv`パッケージで読み込むのが一般的。

```bash
npm install dotenv
```

```
# .env（プロジェクトルートに配置）
PORT=3000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/myapp
JWT_SECRET=my-super-secret-key-change-in-production
API_KEY=abc123xyz
```

```javascript
// app.js（ファイルの先頭で読み込む）
require('dotenv').config()

// これで.envの値がprocess.envに追加される
const port = process.env.PORT || 3000
const dbUrl = process.env.DATABASE_URL
const jwtSecret = process.env.JWT_SECRET

console.log(`ポート: ${port}`)
console.log(`DB: ${dbUrl}`)
```

**重要: `.env`ファイルはGitにコミットしてはいけない。** `.gitignore`に追加すること。

```
# .gitignore
.env
.env.local
.env.production
```

代わりに`.env.example`というテンプレートファイルを用意しておくと、他の開発者がどんな環境変数が必要かわかる。

```
# .env.example（値は空にしてコミットする）
PORT=3000
NODE_ENV=development
DATABASE_URL=
JWT_SECRET=
API_KEY=
```

## イベントループの仕組み

Node.jsがシングルスレッドなのに高速な理由を理解するには、**イベントループ**の仕組みを知る必要がある。

### 全体像

```
   ┌───────────────────────────┐
   │      Call Stack           │  ← 現在実行中のコード
   │   (コールスタック)          │
   └─────────┬─────────────────┘
             │
             │ 非同期処理を依頼
             ▼
   ┌───────────────────────────┐
   │     Node.js APIs          │  ← fs, http, setTimeout等
   │  (バックグラウンド処理)      │     別スレッドで処理される
   └─────────┬─────────────────┘
             │
             │ 完了したコールバックをキューに追加
             ▼
   ┌───────────────────────────┐
   │   Microtask Queue         │  ← Promise.then, process.nextTick
   │ (マイクロタスクキュー)      │     ★ 優先度が高い
   ├───────────────────────────┤
   │   Task Queue              │  ← setTimeout, setInterval, I/O
   │ (タスクキュー/マクロタスク)  │     通常の優先度
   └─────────┬─────────────────┘
             │
             │ イベントループがキューから取り出して実行
             ▼
   ┌───────────────────────────┐
   │      Call Stack           │  ← コールバックが実行される
   └───────────────────────────┘
```

### 実行順序の具体例

```javascript
console.log('1: 同期処理（最初）')

setTimeout(() => {
  console.log('2: setTimeout（タスクキュー）')
}, 0)

Promise.resolve().then(() => {
  console.log('3: Promise.then（マイクロタスクキュー）')
})

process.nextTick(() => {
  console.log('4: process.nextTick（マイクロタスクキュー、最優先）')
})

console.log('5: 同期処理（最後）')

// 出力順:
// 1: 同期処理（最初）
// 5: 同期処理（最後）
// 4: process.nextTick（マイクロタスクキュー、最優先）
// 3: Promise.then（マイクロタスクキュー）
// 2: setTimeout（タスクキュー）
```

**実行順序のルール:**

| 優先度    | 種類             | 例                                               |
| --------- | ---------------- | ------------------------------------------------ |
| 1（最高） | 同期コード       | 通常のJavaScriptコード                           |
| 2         | process.nextTick | `process.nextTick(callback)`                     |
| 3         | マイクロタスク   | `Promise.then()`, `queueMicrotask()`             |
| 4         | マクロタスク     | `setTimeout()`, `setInterval()`, I/Oコールバック |

### イベントループのフェーズ

イベントループは以下のフェーズを繰り返し回り続ける。

```
   ┌──────────────────────────────┐
   │         timers               │  setTimeout, setIntervalのコールバック
   ├──────────────────────────────┤
   │    pending callbacks         │  I/Oコールバック
   ├──────────────────────────────┤
   │       idle, prepare          │  内部使用
   ├──────────────────────────────┤
   │         poll                 │  新しいI/Oイベントを取得、I/Oコールバック実行
   ├──────────────────────────────┤
   │         check                │  setImmediateのコールバック
   ├──────────────────────────────┤
   │    close callbacks           │  close系のコールバック
   └──────────────────────────────┘

   ※ 各フェーズの間にマイクロタスクキューが処理される
```

## ストリーム

ストリームは、大量のデータを**一度にメモリに読み込まず、少しずつ処理する仕組み**。

動画配信サービスを思い浮かべてほしい。映画を全部ダウンロードしてから再生するのではなく、少しずつ受信しながら再生している。それがストリームの考え方。

### 4種類のストリーム

| 種類      | 説明                         | 例                               |
| --------- | ---------------------------- | -------------------------------- |
| Readable  | データを読み取るストリーム   | ファイル読み込み、HTTPリクエスト |
| Writable  | データを書き込むストリーム   | ファイル書き込み、HTTPレスポンス |
| Duplex    | 読み書き両方                 | TCPソケット                      |
| Transform | データを変換しながら読み書き | gzip圧縮、暗号化                 |

### ストリームの使用例

```javascript
const fs = require('fs')
const zlib = require('zlib')

// ========================================
// 通常の方法（メモリに全て載せる）- 小さいファイル向け
// ========================================
// 1GBのファイルを読むと、1GBのメモリを消費する!
const data = fs.readFileSync('large-file.txt', 'utf-8')
console.log(data.length)

// ========================================
// ストリーム（少しずつ処理）- 大きいファイル向け
// ========================================
const readStream = fs.createReadStream('large-file.txt', {
  encoding: 'utf-8',
  highWaterMark: 64 * 1024, // 64KBずつ読み込む
})

let totalSize = 0
readStream.on('data', (chunk) => {
  totalSize += chunk.length
  console.log(`チャンク受信: ${chunk.length} bytes`)
})

readStream.on('end', () => {
  console.log(`合計: ${totalSize} bytes`)
})

readStream.on('error', (err) => {
  console.error('エラー:', err.message)
})

// ========================================
// パイプ（ストリーム同士を接続する）
// ========================================

// ファイルのコピー
fs.createReadStream('input.txt').pipe(fs.createWriteStream('output.txt'))

// ファイルの圧縮
fs.createReadStream('large-file.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('large-file.txt.gz'))

// ファイルの解凍
fs.createReadStream('large-file.txt.gz')
  .pipe(zlib.createGunzip())
  .pipe(fs.createWriteStream('large-file-restored.txt'))

// ========================================
// HTTPレスポンスでストリームを使う
// ========================================
const http = require('http')

http
  .createServer((req, res) => {
    // 大きなファイルをストリームで返す（メモリ効率が良い）
    const fileStream = fs.createReadStream('./large-file.txt')
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    fileStream.pipe(res)
  })
  .listen(3000)
```

### Transformストリーム

データを変換しながら流すストリーム。

```javascript
const { Transform } = require('stream')

// 大文字に変換するTransformストリーム
const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    const upper = chunk.toString().toUpperCase()
    callback(null, upper)
  },
})

// 使い方: 入力 → 大文字変換 → 出力
process.stdin.pipe(upperCase).pipe(process.stdout)

// CSVの行を加工するTransformストリーム
const csvTransform = new Transform({
  transform(chunk, encoding, callback) {
    const lines = chunk.toString().split('\n')
    const transformed = lines
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => `[処理済] ${line}`)
      .join('\n')
    callback(null, transformed + '\n')
  },
})
```

## エラーハンドリング

### try/catch（同期処理・async/await）

```javascript
// 同期処理のエラーハンドリング
try {
  const data = JSON.parse('invalid json')
} catch (err) {
  console.error('パースエラー:', err.message)
}

// async/awaitのエラーハンドリング
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data')
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (err) {
    console.error('データ取得エラー:', err.message)
    throw err // 必要に応じて再スロー
  }
}
```

### Express.jsのエラーミドルウェア

```javascript
const express = require('express')
const app = express()

// カスタムエラークラス
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true // 予期されたエラーかどうか
  }
}

// ルートでエラーをスロー
app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await findUser(req.params.id)
    if (!user) {
      throw new AppError('ユーザーが見つかりません', 404)
    }
    res.json(user)
  } catch (err) {
    next(err) // エラーミドルウェアに渡す
  }
})

// async関数のエラーを自動でキャッチするラッパー
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// ラッパーを使うとtry/catchが不要になる
app.get(
  '/api/posts',
  asyncHandler(async (req, res) => {
    const posts = await getPosts()
    res.json(posts)
  })
)

// エラーハンドリングミドルウェア（必ず4つの引数を持つ）
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.isOperational ? err.message : 'サーバー内部エラー'

  // 開発環境ではスタックトレースも返す
  const response = {
    error: {
      message,
      status: statusCode,
    },
  }

  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack
  }

  console.error(`[ERROR] ${statusCode} ${err.message}`)
  res.status(statusCode).json(response)
})

app.listen(3000)
```

### 未処理の例外・Promiseリジェクションのキャッチ

```javascript
// 未キャッチの例外をキャッチ
process.on('uncaughtException', (err) => {
  console.error('未キャッチの例外:', err)
  process.exit(1) // プロセスを終了する（再起動はpm2等に任せる）
})

// 未処理のPromiseリジェクションをキャッチ
process.on('unhandledRejection', (reason, promise) => {
  console.error('未処理のPromiseリジェクション:', reason)
  process.exit(1)
})
```

## デバッグ方法

### console.logによるデバッグ

最も手軽だが、量が増えると管理が大変になる。

```javascript
// 基本
console.log('値:', variable)

// オブジェクトの中身を深くまで表示
console.dir(deepObject, { depth: null, colors: true })

// テーブル形式で表示
console.table([
  { name: '太郎', age: 25 },
  { name: '花子', age: 30 },
])

// 処理時間の計測
console.time('DB問い合わせ')
await queryDatabase()
console.timeEnd('DB問い合わせ') // DB問い合わせ: 45.123ms

// スタックトレースの表示
console.trace('ここを通過')

// 条件付きログ
console.assert(user !== null, 'userがnullです!')
```

### --inspectフラグ（Chrome DevTools）

```bash
# デバッグモードで起動
node --inspect app.js

# 最初の行で停止（ブレークポイントを設定してから実行したい場合）
node --inspect-brk app.js
```

起動後、Chromeで `chrome://inspect` にアクセスすると、Chrome DevToolsでデバッグできる。ブレークポイントの設定、変数の確認、ステップ実行が可能。

### VSCodeでのデバッグ

`.vscode/launch.json`を作成する。

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Node.jsアプリを起動",
      "program": "${workspaceFolder}/app.js",
      "envFile": "${workspaceFolder}/.env"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "現在のファイルを実行",
      "program": "${file}"
    }
  ]
}
```

VSCodeの左サイドバーにあるデバッグアイコンをクリックし、設定を選んで実行すれば、エディタ上でブレークポイントを設定してデバッグできる。

## セキュリティ基礎

Webアプリケーションを公開する際は、セキュリティ対策が不可欠。

### helmet（HTTPヘッダーのセキュリティ強化）

```bash
npm install helmet
```

```javascript
const express = require('express')
const helmet = require('helmet')
const app = express()

// helmetを使うだけで、複数のセキュリティヘッダーが設定される
app.use(helmet())

// 設定されるヘッダーの例:
// X-Content-Type-Options: nosniff（MIMEタイプスニッフィング防止）
// X-Frame-Options: SAMEORIGIN（クリックジャッキング防止）
// Strict-Transport-Security（HTTPS強制）
// Content-Security-Policy（XSS防止）
```

### cors（Cross-Origin Resource Sharing）

```bash
npm install cors
```

```javascript
const cors = require('cors')

// 全てのオリジンを許可（開発時のみ）
app.use(cors())

// 特定のオリジンのみ許可（本番環境）
app.use(
  cors({
    origin: ['https://myapp.com', 'https://admin.myapp.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Cookieを含むリクエストを許可
  })
)
```

### Rate Limiting（レート制限）

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit')

// 15分間に100リクエストまで
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100,
  message: {
    error: 'リクエスト数が上限に達しました。しばらく待ってからお試しください。',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', limiter)

// ログイン用（より厳しい制限）
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 5, // 5回まで
  message: { error: 'ログイン試行回数が上限に達しました。1時間後にお試しください。' },
})

app.post('/api/login', loginLimiter, loginHandler)
```

### 入力バリデーション

ユーザーからの入力は**絶対に信用しない**。必ずサーバー側で検証する。

```javascript
// 簡易的なバリデーション
function validateUser(data) {
  const errors = []

  if (!data.name || typeof data.name !== 'string') {
    errors.push('nameは必須の文字列です')
  } else if (data.name.length < 2 || data.name.length > 50) {
    errors.push('nameは2文字以上50文字以下です')
  }

  if (!data.email || !data.email.includes('@')) {
    errors.push('有効なメールアドレスを入力してください')
  }

  if (data.age !== undefined) {
    if (typeof data.age !== 'number' || data.age < 0 || data.age > 150) {
      errors.push('ageは0以上150以下の数値です')
    }
  }

  return errors
}

app.post('/api/users', (req, res) => {
  const errors = validateUser(req.body)
  if (errors.length > 0) {
    return res.status(400).json({ errors })
  }
  // バリデーション通過後の処理...
})
```

### その他のセキュリティ対策

| 対策                    | 説明                           | 方法                           |
| ----------------------- | ------------------------------ | ------------------------------ |
| SQLインジェクション防止 | 悪意あるSQL文の挿入を防ぐ      | プリペアドステートメントを使う |
| XSS防止                 | 悪意あるスクリプトの実行を防ぐ | 出力のエスケープ、CSPヘッダー  |
| CSRF対策                | 偽造リクエストの送信を防ぐ     | CSRFトークン、SameSite Cookie  |
| HTTPS                   | 通信の暗号化                   | SSL/TLS証明書の導入            |
| 依存パッケージの脆弱性  | 既知の脆弱性を持つパッケージ   | `npm audit`で定期的にチェック  |
| エラーメッセージ        | 内部情報の漏洩防止             | 本番ではスタックトレースを隠す |

```bash
# 依存パッケージの脆弱性チェック
npm audit

# 自動修正
npm audit fix
```

## まとめ

Node.jsの学習で押さえるべきポイントを整理する。

| 段階         | 学ぶべき内容                                           |
| ------------ | ------------------------------------------------------ |
| 基礎         | Node.jsの実行、モジュールシステム、ファイル操作        |
| サーバー構築 | httpモジュール、Express.js、ルーティング、ミドルウェア |
| データ処理   | ストリーム、環境変数、JSON操作                         |
| セキュリティ | helmet, cors, rate-limiting, バリデーション            |
| 運用         | デバッグ、エラーハンドリング、ログ管理                 |

Node.jsの理解が深まると、次のステップとしてデータベース接続（MongoDB, PostgreSQL）、REST API設計、認証（JWT）、デプロイ（Docker, クラウドサービス）へと進むことができる。

## 参考リンク

- [Node.js公式サイト](https://nodejs.org/ja) - 公式ドキュメント、ダウンロード
- [Node.js公式ドキュメント（API Reference）](https://nodejs.org/docs/latest/api/) - 組み込みモジュールの詳細リファレンス
- [Express.js公式サイト](https://expressjs.com/ja/) - Express.jsの公式ガイドとAPIリファレンス
- [nvm（Node Version Manager）](https://github.com/nvm-sh/nvm) - nvmの使い方とインストール方法
- [npm公式サイト](https://www.npmjs.com/) - パッケージの検索とドキュメント
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/ja/docs/Web/JavaScript) - JavaScript言語の基礎リファレンス
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) - Node.jsのベストプラクティス集（英語）
- [helmet.js](https://helmetjs.github.io/) - Express.jsのセキュリティミドルウェア
- [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) - レート制限ミドルウェア
