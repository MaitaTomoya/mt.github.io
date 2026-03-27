---
title: 'イベント処理'
order: 7
section: 'フロントエンド インタラクション'
---

# イベント処理

## イベントとは何か

Webページにおける「イベント」とは、**ユーザーの操作やブラウザの動作を検知する仕組み**のこと。ボタンのクリック、キーボードの入力、ページの読み込み完了など、ブラウザ上で発生するあらゆる「出来事」がイベントとして扱われる。

日常生活で例えると、「玄関のチャイムが鳴ったら玄関に行く」のと同じ仕組みだ。

| 日常生活           | Webでの対応                     |
| ------------------ | ------------------------------- |
| チャイムが鳴る     | イベントが発生する（例: click） |
| チャイムの音を聞く | イベントリスナーが検知する      |
| 玄関に行く         | コールバック関数が実行される    |

```javascript
// 基本的なイベント処理のパターン
// 「ボタンがクリックされたら、アラートを表示する」
const button = document.getElementById('myButton')

button.addEventListener('click', () => {
  alert('ボタンがクリックされました')
})
```

この3行に、イベント処理の本質が詰まっている。

1. **対象要素を取得する**（どこで起きたイベントを捕まえるか）
2. **イベントの種類を指定する**（どんなイベントに反応するか）
3. **実行する処理を定義する**（イベントが起きたら何をするか）

## イベントの種類一覧

ブラウザで利用できるイベントは数十種類ある。以下に、実務でよく使うイベントをカテゴリ別に整理する。

### マウスイベント

| イベント名    | 発生タイミング                           | 用途の例                           |
| ------------- | ---------------------------------------- | ---------------------------------- |
| `click`       | 要素がクリックされた                     | ボタン操作、リンク、メニュー開閉   |
| `dblclick`    | 要素がダブルクリックされた               | テキストの編集モード切替           |
| `mousedown`   | マウスボタンが押された瞬間               | ドラッグ開始                       |
| `mouseup`     | マウスボタンが離された瞬間               | ドラッグ終了                       |
| `mousemove`   | マウスが動いた                           | ドラッグ中の位置追跡、ツールチップ |
| `mouseenter`  | マウスが要素に入った（バブリングしない） | ホバーエフェクト                   |
| `mouseleave`  | マウスが要素から出た（バブリングしない） | ホバーエフェクト解除               |
| `mouseover`   | マウスが要素に入った（バブリングする）   | 子要素も含めた検知                 |
| `mouseout`    | マウスが要素から出た（バブリングする）   | 子要素も含めた検知                 |
| `contextmenu` | 右クリックメニューが表示される前         | カスタム右クリックメニュー         |

### キーボードイベント

| イベント名 | 発生タイミング                              | 用途の例                   |
| ---------- | ------------------------------------------- | -------------------------- |
| `keydown`  | キーが押された瞬間                          | ショートカット、ゲーム操作 |
| `keyup`    | キーが離された瞬間                          | 入力完了の検知             |
| `keypress` | キーが押された（非推奨、keydownを使うこと） | -                          |

### フォームイベント

| イベント名 | 発生タイミング                           | 用途の例                         |
| ---------- | ---------------------------------------- | -------------------------------- |
| `submit`   | フォームが送信された                     | フォームバリデーション           |
| `input`    | 入力値が変更された（リアルタイム）       | リアルタイム検索、文字数カウント |
| `change`   | 入力値が確定した（フォーカスが外れた時） | セレクトボックスの変更検知       |
| `focus`    | 要素がフォーカスされた                   | 入力フィールドのハイライト       |
| `blur`     | 要素からフォーカスが外れた               | 入力値の検証                     |
| `reset`    | フォームがリセットされた                 | 関連UIのリセット                 |
| `invalid`  | バリデーション失敗時                     | エラーメッセージ表示             |

### ウィンドウ / ドキュメントイベント

| イベント名         | 発生タイミング                           | 用途の例                     |
| ------------------ | ---------------------------------------- | ---------------------------- |
| `load`             | ページの読み込みが完了した（画像等含む） | 全リソース読み込み後の初期化 |
| `DOMContentLoaded` | HTMLの解析が完了した（画像等は待たない） | DOM操作の初期化              |
| `resize`           | ウィンドウサイズが変更された             | レスポンシブ対応             |
| `scroll`           | スクロールされた                         | 無限スクロール、ヘッダー固定 |
| `beforeunload`     | ページを離れようとしている               | 未保存データの警告           |
| `unload`           | ページを離れた                           | クリーンアップ処理           |

### タッチイベント

| イベント名    | 発生タイミング           | 用途の例               |
| ------------- | ------------------------ | ---------------------- |
| `touchstart`  | 画面に触れた瞬間         | タッチ操作の開始       |
| `touchend`    | 画面から指を離した瞬間   | タッチ操作の完了       |
| `touchmove`   | 画面上で指を動かした     | スワイプ、ピンチ       |
| `touchcancel` | タッチがキャンセルされた | 電話着信等での中断処理 |

### その他のよく使うイベント

| イベント名      | 発生タイミング              | 用途の例                       |
| --------------- | --------------------------- | ------------------------------ |
| `transitionend` | CSSトランジションが完了した | アニメーション後の処理         |
| `animationend`  | CSSアニメーションが完了した | アニメーション後の要素削除     |
| `copy`          | コピー操作                  | コピー内容のカスタマイズ       |
| `paste`         | ペースト操作                | ペースト内容のフィルタリング   |
| `drag` / `drop` | ドラッグ&ドロップ           | ファイルアップロード、並べ替え |

## イベントリスナーの登録

### addEventListener

イベントリスナーを登録する最も一般的な方法。

```javascript
const button = document.getElementById('myButton')

// 基本形
button.addEventListener('click', function () {
  console.log('クリックされました')
})

// アロー関数を使った書き方
button.addEventListener('click', () => {
  console.log('クリックされました')
})

// 名前付き関数を使う場合（後から削除できる）
function handleClick() {
  console.log('クリックされました')
}
button.addEventListener('click', handleClick)
```

### removeEventListener

登録したイベントリスナーを削除する。**名前付き関数を使って登録した場合のみ削除可能**。

```javascript
function handleClick() {
  console.log('クリックされました')
}

const button = document.getElementById('myButton')

// 登録
button.addEventListener('click', handleClick)

// 削除（同じ関数参照を渡す必要がある）
button.removeEventListener('click', handleClick)

// NG: 無名関数やアロー関数は削除できない
button.addEventListener('click', () => {
  console.log('この関数は削除できない')
})
// 上の関数は同じ参照を渡せないため、removeEventListenerでは削除不可
```

### 1回だけ実行するイベント

`addEventListener`のオプションで、1回だけ実行して自動的に削除されるリスナーを設定できる。

```javascript
button.addEventListener(
  'click',
  () => {
    console.log('この関数は1回だけ実行される')
  },
  { once: true }
)
```

### 同じ要素に複数のリスナーを登録

`addEventListener`は**同じ要素に複数のリスナーを登録できる**。これが次に説明するHTML属性方式との大きな違いだ。

```javascript
const button = document.getElementById('myButton')

// 複数のリスナーを登録（両方とも実行される）
button.addEventListener('click', () => {
  console.log('処理A')
})

button.addEventListener('click', () => {
  console.log('処理B')
})

// クリックすると「処理A」「処理B」が順番に実行される
```

## HTML属性でのイベント

HTML属性として直接イベントハンドラを書く方法もある。

```html
<!-- HTML属性でのイベント登録 -->
<button onclick="handleClick()">クリック</button>
<input oninput="handleInput(this.value)" />

<script>
  function handleClick() {
    console.log('クリックされました')
  }

  function handleInput(value) {
    console.log('入力値:', value)
  }
</script>
```

### なぜaddEventListenerが推奨されるのか

| 観点                 | HTML属性（onclick等）           | addEventListener                   |
| -------------------- | ------------------------------- | ---------------------------------- |
| 複数のリスナー       | 1つしか設定できない             | 複数設定可能                       |
| HTMLとJSの分離       | HTMLにJSが混在する              | 完全に分離できる                   |
| イベントオブジェクト | 扱いにくい                      | 自動的に引数で渡される             |
| オプション           | 設定できない                    | capture, once, passive等が設定可能 |
| 削除                 | 属性を空にする                  | removeEventListenerで明示的に削除  |
| セキュリティ         | CSPポリシーに違反する場合がある | CSPに適合                          |

```javascript
// NG: onclick属性は上書きされる
const btn = document.getElementById('btn')
btn.onclick = () => console.log('処理A')
btn.onclick = () => console.log('処理B') // 処理Aは消えて処理Bだけ実行される

// OK: addEventListenerは追加される
btn.addEventListener('click', () => console.log('処理A'))
btn.addEventListener('click', () => console.log('処理B'))
// 処理Aと処理Bの両方が実行される
```

**結論**: 実務では常に`addEventListener`を使うこと。HTML属性でのイベントは、古いコードや極めてシンプルなプロトタイプでしか使われない。

## イベントオブジェクト

イベントが発生すると、ブラウザは自動的に**イベントオブジェクト**を生成し、コールバック関数の引数として渡す。このオブジェクトには、イベントに関する詳細な情報が含まれている。

```javascript
button.addEventListener('click', (event) => {
  // eventオブジェクトを自由に使える
  console.log(event)
})
```

### 主要なプロパティとメソッド

| プロパティ/メソッド                                 | 説明                         | 例                               |
| --------------------------------------------------- | ---------------------------- | -------------------------------- |
| `event.type`                                        | イベントの種類               | `"click"`, `"keydown"`           |
| `event.target`                                      | イベントが実際に発生した要素 | クリックされた要素               |
| `event.currentTarget`                               | リスナーが登録されている要素 | addEventListenerを呼んだ要素     |
| `event.preventDefault()`                            | デフォルト動作を無効化       | リンクの遷移を防ぐ               |
| `event.stopPropagation()`                           | イベントの伝播を停止         | 親要素への伝播を防ぐ             |
| `event.clientX` / `event.clientY`                   | マウスのビューポート座標     | クリック位置の取得               |
| `event.pageX` / `event.pageY`                       | マウスのページ座標           | スクロール含む位置               |
| `event.key`                                         | 押されたキーの値             | `"Enter"`, `"a"`, `"Escape"`     |
| `event.code`                                        | 物理キーの識別子             | `"KeyA"`, `"Space"`, `"ArrowUp"` |
| `event.shiftKey` / `event.ctrlKey` / `event.altKey` | 修飾キーが押されているか     | `true` / `false`                 |

### event.target と event.currentTarget の違い

この2つの違いは非常に重要で、特にイベント委譲を理解する上で不可欠だ。

```html
<div id="parent">
  <button id="child">クリック</button>
</div>
```

```javascript
const parent = document.getElementById('parent')

parent.addEventListener('click', (event) => {
  console.log('target:', event.target.id) // "child"（実際にクリックされた要素）
  console.log('currentTarget:', event.currentTarget.id) // "parent"（リスナーが登録された要素）
})
```

ボタンをクリックした場合、`event.target`はクリックされた`button`要素を指し、`event.currentTarget`はリスナーが登録された`div`要素を指す。

### preventDefault()

ブラウザのデフォルト動作を無効化する。

```javascript
// リンクのクリック時にページ遷移を防ぐ
const link = document.querySelector('a')
link.addEventListener('click', (event) => {
  event.preventDefault() // ページ遷移を防止
  console.log('リンクがクリックされましたが、遷移しません')
})

// フォーム送信を防ぐ（独自のバリデーションを行うため）
const form = document.querySelector('form')
form.addEventListener('submit', (event) => {
  event.preventDefault() // デフォルトの送信を防止
  // 独自のバリデーションや非同期送信を行う
  validateAndSubmit()
})

// 右クリックメニューを防ぐ
document.addEventListener('contextmenu', (event) => {
  event.preventDefault()
  showCustomMenu(event.clientX, event.clientY)
})
```

### stopPropagation()

イベントの伝播（バブリング/キャプチャ）を停止する。

```javascript
const outer = document.getElementById('outer')
const inner = document.getElementById('inner')

outer.addEventListener('click', () => {
  console.log('外側がクリックされました')
})

inner.addEventListener('click', (event) => {
  event.stopPropagation() // バブリングを停止
  console.log('内側がクリックされました')
  // 「外側がクリックされました」は表示されない
})
```

## イベントバブリングとキャプチャ

イベントが発生すると、そのイベントはDOMツリーを**伝播（でんぱ）**する。この伝播の仕組みを理解することは、イベント処理を正しく使いこなす上で非常に重要だ。

### 伝播の3つのフェーズ

```
 イベント伝播の流れ

 [フェーズ1: キャプチャ]     [フェーズ3: バブリング]
 上から下へ                  下から上へ

     document                    document
        |                           ^
        v                           |
      <html>                      <html>
        |                           ^
        v                           |
      <body>                      <body>
        |                           ^
        v                           |
      <div>                       <div>
        |                           ^
        v                           |
      <button> ---- [フェーズ2: ターゲット] ----
                    イベント発生元
```

1. **キャプチャフェーズ**: `document`からイベント発生元まで下る
2. **ターゲットフェーズ**: イベント発生元に到達
3. **バブリングフェーズ**: イベント発生元から`document`まで上る

**デフォルトでは、イベントリスナーはバブリングフェーズで実行される。**

### バブリングの例

```html
<div id="grandparent" style="padding: 30px; background: #f0f0f0;">
  祖父
  <div id="parent" style="padding: 30px; background: #d0d0d0;">
    親
    <button id="child">子（クリック）</button>
  </div>
</div>
```

```javascript
document.getElementById('grandparent').addEventListener('click', () => {
  console.log('1. 祖父がクリックを検知')
})

document.getElementById('parent').addEventListener('click', () => {
  console.log('2. 親がクリックを検知')
})

document.getElementById('child').addEventListener('click', () => {
  console.log('3. 子（ボタン）がクリックを検知')
})

// ボタンをクリックすると、以下の順番で出力される（バブリング）:
// 3. 子（ボタン）がクリックを検知
// 2. 親がクリックを検知
// 1. 祖父がクリックを検知
```

水中で泡（バブル）が下から上に浮かんでいくイメージだ。イベントは発生元から親へ、親の親へと「泡」のように上がっていく。

### キャプチャフェーズでの検知

`addEventListener`の第3引数に`true`または`{ capture: true }`を渡すと、キャプチャフェーズでイベントを検知する。

```javascript
// キャプチャフェーズで検知（上から下）
document.getElementById('grandparent').addEventListener(
  'click',
  () => {
    console.log('1. 祖父（キャプチャ）')
  },
  true
)

document.getElementById('parent').addEventListener(
  'click',
  () => {
    console.log('2. 親（キャプチャ）')
  },
  { capture: true }
)

// バブリングフェーズで検知（下から上）
document.getElementById('child').addEventListener('click', () => {
  console.log('3. 子（ターゲット）')
})

// ボタンをクリックすると:
// 1. 祖父（キャプチャ）     ← キャプチャ: 上から下
// 2. 親（キャプチャ）       ← キャプチャ: 上から下
// 3. 子（ターゲット）       ← ターゲット
```

実務では**キャプチャフェーズを使うことはほとんどない**。ただし、イベント委譲やイベントの伝播制御を理解するために、この仕組みを知っておくことは重要だ。

## イベント委譲（Event Delegation）

イベント委譲とは、**子要素のイベントを親要素で一括して処理するテクニック**。バブリングの仕組みを活用している。

### なぜイベント委譲が必要なのか

```html
<ul id="todoList">
  <li>タスク1 <button class="delete">削除</button></li>
  <li>タスク2 <button class="delete">削除</button></li>
  <li>タスク3 <button class="delete">削除</button></li>
  <!-- 動的に追加される項目もある -->
</ul>
```

```javascript
// 非効率な方法: 各ボタンに個別にリスナーを設定
const deleteButtons = document.querySelectorAll('.delete')
deleteButtons.forEach((btn) => {
  btn.addEventListener('click', (event) => {
    event.target.closest('li').remove()
  })
})
// 問題点:
// 1. 後から動的に追加された項目のボタンには反応しない
// 2. リスナーの数が多いとメモリを消費する
// 3. 項目を追加するたびにリスナーも追加する必要がある
```

```javascript
// 効率的な方法: イベント委譲
const todoList = document.getElementById('todoList')

todoList.addEventListener('click', (event) => {
  // クリックされた要素が.deleteボタンか確認
  const deleteBtn = event.target.closest('.delete')
  if (!deleteBtn) return // .deleteボタンでなければ何もしない

  // 親のli要素を削除
  deleteBtn.closest('li').remove()
})
// メリット:
// 1. 後から追加された項目にも自動的に反応する
// 2. リスナーは親要素の1つだけ
// 3. メモリ効率が良い
```

### イベント委譲のパターン

```
 従来のパターン            イベント委譲パターン

  <ul>                        <ul> ← ここにリスナーを1つだけ
   |                           |
   +-- <li> ← リスナー        +-- <li>
   |                           |
   +-- <li> ← リスナー        +-- <li>
   |                           |
   +-- <li> ← リスナー        +-- <li>
   |                           |
   +-- <li> ← リスナー        +-- <li>（動的に追加されても対応）

  リスナー数: N個              リスナー数: 1個
```

### 実用的なイベント委譲の例

```javascript
// 複数の種類のボタンを親要素で一括処理
const toolbar = document.getElementById('toolbar')

toolbar.addEventListener('click', (event) => {
  const button = event.target.closest('button')
  if (!button) return

  // data属性でアクションを判別
  const action = button.dataset.action

  switch (action) {
    case 'bold':
      // 注意: execCommandは非推奨API。実務ではcontentEditableやライブラリを使う
      document.execCommand('bold')
      break
    case 'italic':
      document.execCommand('italic')
      break
    case 'save':
      saveDocument()
      break
    case 'delete':
      deleteDocument()
      break
    default:
      console.log('未定義のアクション:', action)
  }
})
```

```html
<div id="toolbar">
  <button data-action="bold">太字</button>
  <button data-action="italic">斜体</button>
  <button data-action="save">保存</button>
  <button data-action="delete">削除</button>
</div>
```

## フォーム関連イベント

フォーム処理はWebアプリケーション開発の基本中の基本。主要なフォームイベントの使い方と、実用的なバリデーション例を解説する。

### inputイベントとchangeイベントの違い

```html
<input type="text" id="name" placeholder="名前を入力" />
<p id="preview"></p>
```

```javascript
const nameInput = document.getElementById('name')
const preview = document.getElementById('preview')

// input: キーを打つたびにリアルタイムで発火する
nameInput.addEventListener('input', (event) => {
  preview.textContent = `入力中: ${event.target.value}`
  // 「田」「田中」「田中太」「田中太郎」のように1文字ごとに発火
})

// change: フォーカスが外れた時（値が確定した時）に発火する
nameInput.addEventListener('change', (event) => {
  console.log(`確定値: ${event.target.value}`)
  // 「田中太郎」のように、入力が終わってフォーカスを外した時に1回だけ発火
})
```

| イベント | 発火タイミング               | 使いどころ                                           |
| -------- | ---------------------------- | ---------------------------------------------------- |
| `input`  | 値が変わるたびにリアルタイム | リアルタイム検索、文字数カウント、プレビュー         |
| `change` | 値が確定した時               | セレクトボックス、チェックボックス、入力完了後の処理 |

### submit イベント

```javascript
const form = document.getElementById('registrationForm')

form.addEventListener('submit', (event) => {
  // デフォルトのフォーム送信を防止
  event.preventDefault()

  // フォームデータの取得
  const formData = new FormData(form)
  const data = Object.fromEntries(formData)
  console.log(data)

  // 独自の送信処理
  fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log('登録成功:', result)
    })
    .catch((error) => {
      console.error('登録失敗:', error)
    })
})
```

### focusとblur

```javascript
const emailInput = document.getElementById('email')
const emailHint = document.getElementById('emailHint')

// focus: フォーカスされた時にヒントを表示
emailInput.addEventListener('focus', () => {
  emailHint.textContent = 'example@domain.com の形式で入力してください'
  emailHint.style.display = 'block'
})

// blur: フォーカスが外れた時にバリデーション
emailInput.addEventListener('blur', (event) => {
  const value = event.target.value
  emailHint.style.display = 'none'

  if (value && !value.includes('@')) {
    event.target.classList.add('error')
    emailHint.textContent = 'メールアドレスの形式が正しくありません'
    emailHint.style.display = 'block'
    emailHint.style.color = 'red'
  } else {
    event.target.classList.remove('error')
  }
})
```

### 実用的なバリデーション例

```html
<form id="signupForm" novalidate>
  <div class="form-group">
    <label for="username">ユーザー名</label>
    <input type="text" id="username" name="username" required minlength="3" maxlength="20" />
    <span class="error-message" id="usernameError"></span>
  </div>

  <div class="form-group">
    <label for="email">メールアドレス</label>
    <input type="email" id="email" name="email" required />
    <span class="error-message" id="emailError"></span>
  </div>

  <div class="form-group">
    <label for="password">パスワード</label>
    <input type="password" id="password" name="password" required minlength="8" />
    <span class="error-message" id="passwordError"></span>
    <div id="passwordStrength" class="strength-meter"></div>
  </div>

  <button type="submit">登録</button>
</form>
```

```javascript
const signupForm = document.getElementById('signupForm')

// バリデーションルールの定義
const validators = {
  username: {
    validate(value) {
      if (!value) return 'ユーザー名は必須です'
      if (value.length < 3) return 'ユーザー名は3文字以上で入力してください'
      if (value.length > 20) return 'ユーザー名は20文字以下で入力してください'
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return '英数字とアンダースコアのみ使用できます'
      return ''
    },
  },
  email: {
    validate(value) {
      if (!value) return 'メールアドレスは必須です'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'メールアドレスの形式が正しくありません'
      return ''
    },
  },
  password: {
    validate(value) {
      if (!value) return 'パスワードは必須です'
      if (value.length < 8) return 'パスワードは8文字以上で入力してください'
      if (!/[A-Z]/.test(value)) return '大文字を1文字以上含めてください'
      if (!/[a-z]/.test(value)) return '小文字を1文字以上含めてください'
      if (!/[0-9]/.test(value)) return '数字を1文字以上含めてください'
      return ''
    },
  },
}

// リアルタイムバリデーション（inputイベント）
Object.keys(validators).forEach((fieldName) => {
  const input = document.getElementById(fieldName)
  const errorEl = document.getElementById(`${fieldName}Error`)

  input.addEventListener('input', () => {
    const errorMessage = validators[fieldName].validate(input.value)
    errorEl.textContent = errorMessage

    if (errorMessage) {
      input.classList.add('invalid')
      input.classList.remove('valid')
    } else {
      input.classList.remove('invalid')
      input.classList.add('valid')
    }
  })
})

// パスワード強度メーター
const passwordInput = document.getElementById('password')
const strengthMeter = document.getElementById('passwordStrength')

passwordInput.addEventListener('input', () => {
  const value = passwordInput.value
  let strength = 0

  if (value.length >= 8) strength++
  if (value.length >= 12) strength++
  if (/[A-Z]/.test(value)) strength++
  if (/[a-z]/.test(value)) strength++
  if (/[0-9]/.test(value)) strength++
  if (/[^A-Za-z0-9]/.test(value)) strength++

  const levels = ['', '非常に弱い', '弱い', '普通', '強い', '非常に強い', '最強']
  const colors = ['', '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#27ae60', '#1abc9c']

  strengthMeter.textContent = levels[strength] || ''
  strengthMeter.style.color = colors[strength] || ''
})

// フォーム送信時のバリデーション
signupForm.addEventListener('submit', (event) => {
  event.preventDefault()

  let isValid = true

  Object.keys(validators).forEach((fieldName) => {
    const input = document.getElementById(fieldName)
    const errorEl = document.getElementById(`${fieldName}Error`)
    const errorMessage = validators[fieldName].validate(input.value)

    errorEl.textContent = errorMessage

    if (errorMessage) {
      input.classList.add('invalid')
      isValid = false
    }
  })

  if (isValid) {
    console.log('バリデーション成功! フォームを送信します')
    // ここで実際の送信処理を行う
  } else {
    console.log('バリデーションエラーがあります')
    // 最初のエラーフィールドにフォーカス
    const firstError = signupForm.querySelector('.invalid')
    if (firstError) firstError.focus()
  }
})
```

## キーボードイベント

### keydownとkeyup

```javascript
document.addEventListener('keydown', (event) => {
  console.log('キーが押された:', event.key)
  console.log('物理キーコード:', event.code)
  console.log('Shift押下中:', event.shiftKey)
  console.log('Ctrl押下中:', event.ctrlKey)
  console.log('Alt押下中:', event.altKey)
  console.log('Meta押下中:', event.metaKey) // Mac: Command, Windows: Windows
})
```

### event.key と event.code の違い

| プロパティ   | 返す値                     | キーボードレイアウトの影響 | 用途                         |
| ------------ | -------------------------- | -------------------------- | ---------------------------- |
| `event.key`  | 入力される文字（論理キー） | 受ける                     | テキスト入力、ショートカット |
| `event.code` | 物理キーの位置             | 受けない                   | ゲーム操作（WASD等）         |

```javascript
// 日本語キーボードでも英語キーボードでも同じ位置のキーを検知したい場合
document.addEventListener('keydown', (event) => {
  // event.key: キーボードレイアウトによって変わる
  // event.code: 物理的なキー位置なので常に同じ
  if (event.code === 'KeyA') {
    console.log('Aの位置のキーが押された')
  }
})
```

### ショートカット実装例

```javascript
// キーボードショートカットの実装
document.addEventListener('keydown', (event) => {
  // Ctrl+S（Windows）または Cmd+S（Mac）で保存
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault() // ブラウザのデフォルト保存ダイアログを防止
    saveDocument()
    console.log('ドキュメントを保存しました')
  }

  // Ctrl+Z で元に戻す
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    event.preventDefault()
    undo()
    console.log('元に戻しました')
  }

  // Escapeでモーダルを閉じる
  if (event.key === 'Escape') {
    closeModal()
  }

  // Ctrl+Shift+P でコマンドパレットを開く
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
    event.preventDefault()
    openCommandPalette()
  }
})

function saveDocument() {
  console.log('保存処理')
}
function undo() {
  console.log('元に戻す処理')
}
function closeModal() {
  console.log('モーダルを閉じる処理')
}
function openCommandPalette() {
  console.log('コマンドパレットを開く処理')
}
```

### キーボードナビゲーションの実装例

```javascript
// リスト内の項目をキーボードで移動する
const list = document.getElementById('itemList')
const items = list.querySelectorAll('.item')
let currentIndex = 0

function highlightItem(index) {
  items.forEach((item) => item.classList.remove('highlighted'))
  items[index].classList.add('highlighted')
  items[index].scrollIntoView({ block: 'nearest' })
}

list.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      currentIndex = Math.min(currentIndex + 1, items.length - 1)
      highlightItem(currentIndex)
      break

    case 'ArrowUp':
      event.preventDefault()
      currentIndex = Math.max(currentIndex - 1, 0)
      highlightItem(currentIndex)
      break

    case 'Enter':
      event.preventDefault()
      items[currentIndex].click()
      break

    case 'Home':
      event.preventDefault()
      currentIndex = 0
      highlightItem(currentIndex)
      break

    case 'End':
      event.preventDefault()
      currentIndex = items.length - 1
      highlightItem(currentIndex)
      break
  }
})
```

## マウスイベント

### click と dblclick

```javascript
const element = document.getElementById('clickable')

element.addEventListener('click', () => {
  console.log('シングルクリック')
})

element.addEventListener('dblclick', () => {
  console.log('ダブルクリック')
})

// 注意: dblclickの前にclickが2回発火する
// クリック → クリック → ダブルクリック の順で実行される
```

### mouseenter / mouseleave vs mouseover / mouseout

この2組の違いは実務でよく混乱するポイントだ。

```html
<div id="outer">
  外側
  <div id="inner">内側</div>
</div>
```

```javascript
// mouseenter / mouseleave: 子要素への移動では発火しない
document.getElementById('outer').addEventListener('mouseenter', () => {
  console.log('mouseenter: 外側に入った')
})
document.getElementById('outer').addEventListener('mouseleave', () => {
  console.log('mouseleave: 外側から出た')
})
// 外側 → 内側 への移動: 何も起きない（まだ外側の中にいるから）

// mouseover / mouseout: 子要素への移動でも発火する
document.getElementById('outer').addEventListener('mouseover', () => {
  console.log('mouseover: 外側に入った（子要素でも発火）')
})
document.getElementById('outer').addEventListener('mouseout', () => {
  console.log('mouseout: 外側から出た（子要素でも発火）')
})
// 外側 → 内側 への移動:
//   mouseout（外側から出た）+ mouseover（内側に入った）が発火する
```

| イベント     | バブリング | 子要素への移動で発火 | 推奨される用途             |
| ------------ | ---------- | -------------------- | -------------------------- |
| `mouseenter` | しない     | しない               | ホバーエフェクト           |
| `mouseleave` | しない     | しない               | ホバーエフェクト解除       |
| `mouseover`  | する       | する                 | イベント委譲でのホバー検知 |
| `mouseout`   | する       | する                 | イベント委譲でのホバー検知 |

一般的には**mouseenter/mouseleave**を使う方がシンプルで直感的だ。

### contextmenu（右クリックメニュー）

```javascript
// カスタム右クリックメニューの実装
const customMenu = document.getElementById('customMenu')

document.addEventListener('contextmenu', (event) => {
  event.preventDefault() // デフォルトの右クリックメニューを無効化

  customMenu.style.display = 'block'
  customMenu.style.left = event.clientX + 'px'
  customMenu.style.top = event.clientY + 'px'
})

// 他の場所をクリックしたらメニューを閉じる
document.addEventListener('click', () => {
  customMenu.style.display = 'none'
})
```

## タッチイベント

モバイルデバイスではマウスイベントの代わりにタッチイベントが使われる。

### 基本的なタッチイベント

```javascript
const element = document.getElementById('touchable')

element.addEventListener('touchstart', (event) => {
  // 画面に触れた瞬間
  const touch = event.touches[0] // 最初の接触点
  console.log(`タッチ開始: X=${touch.clientX}, Y=${touch.clientY}`)
})

element.addEventListener('touchmove', (event) => {
  // 指を動かしている間（連続的に発火）
  const touch = event.touches[0]
  console.log(`移動中: X=${touch.clientX}, Y=${touch.clientY}`)
})

element.addEventListener('touchend', (event) => {
  // 指を離した瞬間
  // touchendではevent.touchesは空になるので、changedTouchesを使う
  const touch = event.changedTouches[0]
  console.log(`タッチ終了: X=${touch.clientX}, Y=${touch.clientY}`)
})
```

### タッチイベントのプロパティ

| プロパティ             | 説明                             |
| ---------------------- | -------------------------------- |
| `event.touches`        | 現在画面に触れている全ての接触点 |
| `event.targetTouches`  | 対象要素に触れている接触点       |
| `event.changedTouches` | 今回のイベントで変化した接触点   |

### スワイプ検知の実装

```javascript
let startX = 0
let startY = 0
const SWIPE_THRESHOLD = 50 // 最低スワイプ距離（px）

const swipeArea = document.getElementById('swipeArea')

swipeArea.addEventListener('touchstart', (event) => {
  startX = event.touches[0].clientX
  startY = event.touches[0].clientY
})

swipeArea.addEventListener('touchend', (event) => {
  const endX = event.changedTouches[0].clientX
  const endY = event.changedTouches[0].clientY

  const diffX = endX - startX
  const diffY = endY - startY

  // 水平方向のスワイプが垂直方向より大きいか判定
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > SWIPE_THRESHOLD) {
    if (diffX > 0) {
      console.log('右スワイプ')
      // 次のスライドに移動など
    } else {
      console.log('左スワイプ')
      // 前のスライドに移動など
    }
  } else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > SWIPE_THRESHOLD) {
    if (diffY > 0) {
      console.log('下スワイプ')
    } else {
      console.log('上スワイプ')
    }
  }
})
```

### モバイル対応の注意点

```javascript
// タッチとマウスの両方に対応するイベント処理
function addPointerListener(element, handler) {
  // Pointer Events API（タッチとマウスを統一的に扱える）
  if (window.PointerEvent) {
    element.addEventListener('pointerdown', handler)
  } else {
    // フォールバック
    element.addEventListener('mousedown', handler)
    element.addEventListener('touchstart', handler)
  }
}

// 300msディレイの回避
// モバイルブラウザはダブルタップズームのため、clickイベントに300msの遅延がある
// 現代のブラウザでは以下のmetaタグで解消される
// <meta name="viewport" content="width=device-width, initial-scale=1.0">

// touch-action CSSプロパティで制御することもできる
// .element { touch-action: manipulation; }
```

## スクロールイベント

### 基本的なスクロール検知

```javascript
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY // または window.pageYOffset
  const scrollLeft = window.scrollX

  console.log(`スクロール位置: 上から${scrollTop}px, 左から${scrollLeft}px`)
})
```

### ヘッダー固定の実装

```javascript
const header = document.getElementById('header')
const headerHeight = header.offsetHeight
let lastScrollTop = 0

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY

  if (scrollTop > headerHeight) {
    // スクロール方向を検知
    if (scrollTop > lastScrollTop) {
      // 下にスクロール → ヘッダーを隠す
      header.classList.add('hidden')
    } else {
      // 上にスクロール → ヘッダーを表示
      header.classList.remove('hidden')
    }
    header.classList.add('fixed')
  } else {
    header.classList.remove('fixed')
    header.classList.remove('hidden')
  }

  lastScrollTop = scrollTop
})
```

### IntersectionObserver

スクロール位置の検知には`IntersectionObserver`がより効率的だ。要素がビューポートに入ったかどうかを非同期に監視する。

```javascript
// 基本的な使い方: 要素が画面に表示された時に処理を実行
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 要素がビューポートに入った
        entry.target.classList.add('visible')
        console.log('表示された:', entry.target.id)
      } else {
        // 要素がビューポートから出た
        entry.target.classList.remove('visible')
      }
    })
  },
  {
    threshold: 0.1, // 10%見えたらトリガー（0.0〜1.0）
    rootMargin: '0px 0px -50px 0px', // ビューポートの下端から50px内側で検知
  }
)

// 監視対象の要素を登録
const sections = document.querySelectorAll('.section')
sections.forEach((section) => observer.observe(section))
```

### 無限スクロールの実装

```javascript
// IntersectionObserverを使った無限スクロール
const loadingTrigger = document.getElementById('loadingTrigger')
const contentContainer = document.getElementById('content')
let page = 1
let isLoading = false

const infiniteScrollObserver = new IntersectionObserver(async (entries) => {
  const entry = entries[0]

  if (entry.isIntersecting && !isLoading) {
    isLoading = true
    loadingTrigger.textContent = '読み込み中...'

    try {
      // APIからデータを取得
      const response = await fetch(`/api/posts?page=${page}`)
      const posts = await response.json()

      if (posts.length === 0) {
        // データがなくなったら監視を停止
        infiniteScrollObserver.unobserve(loadingTrigger)
        loadingTrigger.textContent = 'すべて読み込みました'
        return
      }

      // 取得したデータをDOMに追加
      const fragment = document.createDocumentFragment()
      posts.forEach((post) => {
        const article = document.createElement('article')
        article.className = 'post'
        article.innerHTML = `
          <h2>${sanitizeHTML(post.title)}</h2>
          <p>${sanitizeHTML(post.excerpt)}</p>
        `
        fragment.appendChild(article)
      })

      contentContainer.appendChild(fragment)
      page++
      loadingTrigger.textContent = ''
    } catch (error) {
      console.error('読み込みエラー:', error)
      loadingTrigger.textContent = 'エラーが発生しました'
    } finally {
      isLoading = false
    }
  }
})

infiniteScrollObserver.observe(loadingTrigger)

// サニタイズ関数
function sanitizeHTML(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
```

```html
<div id="content">
  <!-- 記事がここに動的に追加される -->
</div>
<div id="loadingTrigger"></div>
```

## デバウンスとスロットル

scroll、resize、inputなどのイベントは**非常に高頻度で発火する**。処理が重い場合、パフォーマンスが大幅に低下する。この問題を解決するテクニックがデバウンスとスロットルだ。

### デバウンス（Debounce）

デバウンスは、**イベントの発火が止まってから一定時間後に処理を実行する**テクニック。

```
イベント発火のタイムライン（デバウンス: 300ms）

入力: あ  い  う  え  お     （300ms経過）  → 処理実行
      |   |   |   |   |                      |
      v   v   v   v   v                      v
      x   x   x   x   x                   [実行]

毎回タイマーがリセットされ、最後の入力から300ms後に1回だけ実行
```

```javascript
// デバウンス関数の実装
function debounce(func, delay) {
  let timeoutId

  return function (...args) {
    // 前のタイマーをクリア
    clearTimeout(timeoutId)

    // 新しいタイマーをセット
    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

// 使用例: 検索入力
const searchInput = document.getElementById('searchInput')
const searchResults = document.getElementById('searchResults')

// デバウンスされた検索関数（300ms）
const debouncedSearch = debounce(async (query) => {
  if (query.length < 2) {
    searchResults.innerHTML = ''
    return
  }

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const results = await response.json()

    searchResults.innerHTML = results
      .map((item) => `<div class="result-item">${item.title}</div>`)
      .join('')
  } catch (error) {
    console.error('検索エラー:', error)
  }
}, 300)

searchInput.addEventListener('input', (event) => {
  debouncedSearch(event.target.value)
})
```

### スロットル（Throttle）

スロットルは、**一定時間ごとに最大1回だけ処理を実行する**テクニック。

```
イベント発火のタイムライン（スロットル: 200ms）

スクロール:  |||||||||||||||||||||||||||||||||||||
             |                   |                   |
             v                   v                   v
           [実行]              [実行]              [実行]

200msごとに最大1回だけ実行される
```

```javascript
// スロットル関数の実装
function throttle(func, limit) {
  let inThrottle = false

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true

      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// 使用例: スクロール位置の取得
const throttledScroll = throttle(() => {
  const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
  document.getElementById('progressBar').style.width = `${scrollPercent}%`
}, 100)

window.addEventListener('scroll', throttledScroll)

// 使用例: ウィンドウリサイズ
const throttledResize = throttle(() => {
  console.log(`ウィンドウサイズ: ${window.innerWidth} x ${window.innerHeight}`)
  adjustLayout()
}, 200)

window.addEventListener('resize', throttledResize)
```

### デバウンスとスロットルの使い分け

| 観点                 | デバウンス                              | スロットル                                |
| -------------------- | --------------------------------------- | ----------------------------------------- |
| 実行タイミング       | イベント停止後に1回                     | 定期的に実行                              |
| 適したイベント       | input（検索）、resize（レイアウト計算） | scroll（位置追跡）、mousemove（ドラッグ） |
| 連続イベント中の実行 | 実行されない                            | 定期的に実行される                        |
| 用途の例             | 検索候補の表示、フォームの自動保存      | スクロール進捗バー、パララックス効果      |

簡単な判断基準: **「最後の結果だけ知りたい」ならデバウンス、「途中経過も知りたい」ならスロットル**。

## カスタムイベント

ブラウザの標準イベント以外に、自分で定義した**カスタムイベント**を作成して発火させることもできる。コンポーネント間の通信に便利だ。

### CustomEvent の基本

```javascript
// カスタムイベントの作成
const event = new CustomEvent('userLoggedIn', {
  detail: {
    userId: 123,
    username: 'tanaka',
    loginTime: new Date().toISOString(),
  },
  bubbles: true, // バブリングを有効にする
})

// イベントリスナーの登録
document.addEventListener('userLoggedIn', (event) => {
  console.log('ユーザーがログインしました:', event.detail.username)
  console.log('ログイン時刻:', event.detail.loginTime)
  updateUI(event.detail)
})

// イベントの発火
document.dispatchEvent(event)
```

### 実用例: コンポーネント間の通信

```javascript
// 通知システムの実装
class NotificationSystem {
  constructor() {
    this.container = document.getElementById('notifications')
    this.setupListeners()
  }

  setupListeners() {
    // カスタムイベントをリッスン
    document.addEventListener('app:notify', (event) => {
      this.show(event.detail)
    })
  }

  show({ message, type = 'info', duration = 3000 }) {
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.textContent = message
    this.container.appendChild(notification)

    // 一定時間後に自動削除
    setTimeout(() => {
      notification.classList.add('fade-out')
      notification.addEventListener('transitionend', () => {
        notification.remove()
      })
    }, duration)
  }
}

// 通知システムの初期化
const notifications = new NotificationSystem()

// アプリのどこからでも通知を表示できる
function showNotification(message, type) {
  document.dispatchEvent(
    new CustomEvent('app:notify', {
      detail: { message, type },
    })
  )
}

// 使用例
showNotification('保存しました', 'success')
showNotification('エラーが発生しました', 'error')
showNotification('処理中です...', 'info')
```

### カスタムイベントの命名規則

カスタムイベント名は、標準イベントと衝突しないようにする必要がある。一般的には以下のような命名規則が使われる。

```javascript
// パターン1: 名前空間を使う
document.dispatchEvent(new CustomEvent('app:userLogin'))
document.dispatchEvent(new CustomEvent('cart:itemAdded'))
document.dispatchEvent(new CustomEvent('form:validated'))

// パターン2: ハイフン区切り
document.dispatchEvent(new CustomEvent('user-logged-in'))
document.dispatchEvent(new CustomEvent('cart-updated'))
```

## 実践例: フォームバリデーション（リアルタイム検証）

ここまで学んだイベント処理の知識を総合的に活用して、リアルタイムバリデーション付きのお問い合わせフォームを作ってみよう。

### 完全なコード

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>お問い合わせフォーム</title>
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        background-color: #f5f5f5;
        padding: 40px 20px;
      }

      .form-container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 40px;
      }

      h1 {
        text-align: center;
        color: #333;
        margin-bottom: 30px;
      }

      .form-group {
        margin-bottom: 24px;
      }

      label {
        display: block;
        margin-bottom: 6px;
        font-weight: bold;
        color: #555;
        font-size: 14px;
      }

      label .required {
        color: #e74c3c;
        margin-left: 4px;
      }

      input,
      textarea,
      select {
        width: 100%;
        padding: 10px 14px;
        border: 2px solid #ddd;
        border-radius: 6px;
        font-size: 16px;
        outline: none;
        transition:
          border-color 0.3s,
          box-shadow 0.3s;
      }

      input:focus,
      textarea:focus,
      select:focus {
        border-color: #4a90d9;
        box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.1);
      }

      input.valid,
      textarea.valid {
        border-color: #2ecc71;
      }

      input.invalid,
      textarea.invalid {
        border-color: #e74c3c;
      }

      .error-message {
        display: block;
        color: #e74c3c;
        font-size: 13px;
        margin-top: 4px;
        min-height: 20px;
      }

      .hint {
        display: block;
        color: #999;
        font-size: 12px;
        margin-top: 4px;
      }

      .char-count {
        text-align: right;
        color: #999;
        font-size: 12px;
        margin-top: 4px;
      }

      .char-count.warning {
        color: #e67e22;
      }

      .char-count.exceeded {
        color: #e74c3c;
        font-weight: bold;
      }

      textarea {
        resize: vertical;
        min-height: 120px;
      }

      .submit-btn {
        width: 100%;
        padding: 14px;
        background-color: #4a90d9;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 18px;
        cursor: pointer;
        transition:
          background-color 0.3s,
          opacity 0.3s;
      }

      .submit-btn:hover:not(:disabled) {
        background-color: #357abd;
      }

      .submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .success-message {
        display: none;
        text-align: center;
        padding: 20px;
        background-color: #d4edda;
        color: #155724;
        border-radius: 6px;
        margin-top: 20px;
      }

      .success-message.show {
        display: block;
      }
    </style>
  </head>
  <body>
    <div class="form-container">
      <h1>お問い合わせ</h1>

      <form id="contactForm" novalidate>
        <div class="form-group">
          <label for="name">お名前<span class="required">*</span></label>
          <input type="text" id="name" name="name" placeholder="例: 田中太郎" required />
          <span class="error-message" id="nameError"></span>
        </div>

        <div class="form-group">
          <label for="email">メールアドレス<span class="required">*</span></label>
          <input type="email" id="email" name="email" placeholder="例: taro@example.com" required />
          <span class="error-message" id="emailError"></span>
        </div>

        <div class="form-group">
          <label for="phone">電話番号</label>
          <input type="tel" id="phone" name="phone" placeholder="例: 090-1234-5678" />
          <span class="error-message" id="phoneError"></span>
          <span class="hint">ハイフンありなしどちらでも可</span>
        </div>

        <div class="form-group">
          <label for="category">お問い合わせ種別<span class="required">*</span></label>
          <select id="category" name="category" required>
            <option value="">選択してください</option>
            <option value="general">一般的なお問い合わせ</option>
            <option value="support">技術サポート</option>
            <option value="billing">請求関連</option>
            <option value="other">その他</option>
          </select>
          <span class="error-message" id="categoryError"></span>
        </div>

        <div class="form-group">
          <label for="message">お問い合わせ内容<span class="required">*</span></label>
          <textarea
            id="message"
            name="message"
            placeholder="お問い合わせ内容を入力してください"
            required
          ></textarea>
          <div class="char-count" id="charCount">0 / 1000文字</div>
          <span class="error-message" id="messageError"></span>
        </div>

        <button type="submit" id="submitBtn" class="submit-btn">送信する</button>
      </form>

      <div id="successMessage" class="success-message">
        お問い合わせを受け付けました。3営業日以内にご連絡いたします。
      </div>
    </div>

    <script>
      // --- バリデーションルール ---
      const validationRules = {
        name: {
          required: true,
          validate(value) {
            if (!value.trim()) return 'お名前を入力してください'
            if (value.trim().length < 2) return 'お名前は2文字以上で入力してください'
            if (value.trim().length > 50) return 'お名前は50文字以内で入力してください'
            return ''
          },
        },
        email: {
          required: true,
          validate(value) {
            if (!value.trim()) return 'メールアドレスを入力してください'
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(value)) return 'メールアドレスの形式が正しくありません'
            return ''
          },
        },
        phone: {
          required: false,
          validate(value) {
            if (!value.trim()) return '' // 任意項目なので空欄はOK
            const cleaned = value.replace(/[-\s]/g, '')
            if (!/^\d{10,11}$/.test(cleaned)) return '電話番号の形式が正しくありません'
            return ''
          },
        },
        category: {
          required: true,
          validate(value) {
            if (!value) return 'お問い合わせ種別を選択してください'
            return ''
          },
        },
        message: {
          required: true,
          maxLength: 1000,
          validate(value) {
            if (!value.trim()) return 'お問い合わせ内容を入力してください'
            if (value.trim().length < 10) return '10文字以上で入力してください'
            if (value.length > 1000) return '1000文字以内で入力してください'
            return ''
          },
        },
      }

      // --- DOM要素の取得 ---
      const form = document.getElementById('contactForm')
      const submitBtn = document.getElementById('submitBtn')
      const successMessage = document.getElementById('successMessage')
      const charCount = document.getElementById('charCount')

      // --- バリデーション状態の管理 ---
      const fieldState = {}

      // --- 個別フィールドのバリデーション ---
      function validateField(fieldName) {
        const input = document.getElementById(fieldName)
        const errorEl = document.getElementById(`${fieldName}Error`)
        const rules = validationRules[fieldName]

        if (!rules) return true

        const errorMessage = rules.validate(input.value)
        errorEl.textContent = errorMessage

        if (errorMessage) {
          input.classList.add('invalid')
          input.classList.remove('valid')
          fieldState[fieldName] = false
          return false
        } else if (input.value.trim() || rules.required) {
          input.classList.remove('invalid')
          input.classList.add('valid')
          fieldState[fieldName] = true
          return true
        } else {
          input.classList.remove('invalid')
          input.classList.remove('valid')
          fieldState[fieldName] = true
          return true
        }
      }

      // --- 全フィールドのバリデーション ---
      function validateAll() {
        let isValid = true
        Object.keys(validationRules).forEach((fieldName) => {
          if (!validateField(fieldName)) {
            isValid = false
          }
        })
        return isValid
      }

      // --- 送信ボタンの状態更新 ---
      function updateSubmitButton() {
        const allRequiredFilled = Object.keys(validationRules)
          .filter((name) => validationRules[name].required)
          .every((name) => {
            const input = document.getElementById(name)
            return input.value.trim() !== ''
          })

        const noErrors = Object.keys(fieldState).every((name) => fieldState[name] !== false)

        submitBtn.disabled = !(allRequiredFilled && noErrors)
      }

      // --- デバウンス関数 ---
      function debounce(func, delay) {
        let timeoutId
        return function (...args) {
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => func.apply(this, args), delay)
        }
      }

      // --- イベントリスナーの設定 ---

      // 各入力フィールドにリアルタイムバリデーションを設定
      Object.keys(validationRules).forEach((fieldName) => {
        const input = document.getElementById(fieldName)

        // inputイベント: リアルタイムバリデーション（デバウンス付き）
        const debouncedValidate = debounce(() => {
          validateField(fieldName)
          updateSubmitButton()
        }, 300)

        input.addEventListener('input', debouncedValidate)

        // blurイベント: フォーカスが外れた時に即座にバリデーション
        input.addEventListener('blur', () => {
          validateField(fieldName)
          updateSubmitButton()
        })

        // changeイベント: セレクトボックス用
        if (input.tagName === 'SELECT') {
          input.addEventListener('change', () => {
            validateField(fieldName)
            updateSubmitButton()
          })
        }
      })

      // 文字数カウンター
      const messageInput = document.getElementById('message')
      messageInput.addEventListener('input', () => {
        const length = messageInput.value.length
        const maxLength = validationRules.message.maxLength

        charCount.textContent = `${length} / ${maxLength}文字`

        if (length > maxLength) {
          charCount.className = 'char-count exceeded'
        } else if (length > maxLength * 0.8) {
          charCount.className = 'char-count warning'
        } else {
          charCount.className = 'char-count'
        }
      })

      // フォーム送信
      form.addEventListener('submit', (event) => {
        event.preventDefault()

        if (!validateAll()) {
          // 最初のエラーフィールドにフォーカス
          const firstInvalid = form.querySelector('.invalid')
          if (firstInvalid) {
            firstInvalid.focus()
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
          return
        }

        // フォームデータの取得
        const formData = new FormData(form)
        const data = Object.fromEntries(formData)
        console.log('送信データ:', data)

        // 送信成功を表示
        form.style.display = 'none'
        successMessage.classList.add('show')
      })

      // Ctrl+Enter で送信（ショートカット）
      form.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault()
          if (!submitBtn.disabled) {
            form.dispatchEvent(new Event('submit'))
          }
        }
      })

      // 初期状態: 送信ボタンを無効化
      submitBtn.disabled = true
    </script>
  </body>
</html>
```

### コードのポイント解説

| 使用しているテクニック          | 説明                                     |
| ------------------------------- | ---------------------------------------- |
| `addEventListener('input')`     | リアルタイムバリデーション               |
| `addEventListener('blur')`      | フォーカスが外れた時のバリデーション     |
| `addEventListener('change')`    | セレクトボックスの変更検知               |
| `addEventListener('submit')`    | フォーム送信の制御                       |
| `event.preventDefault()`        | デフォルトのフォーム送信を防止           |
| `event.ctrlKey / event.metaKey` | Ctrl/Cmdキーの検知                       |
| `dispatchEvent`                 | プログラムからイベントを発火             |
| デバウンス                      | 入力中の高頻度バリデーションを抑制       |
| `classList`                     | バリデーション結果に応じたクラス切り替え |
| `scrollIntoView`                | エラーフィールドへのスムーズスクロール   |
| `FormData`                      | フォームデータの一括取得                 |

## 実践例: ドラッグ&ドロップ

マウスイベントを組み合わせて、要素をドラッグ&ドロップで移動する機能を実装する。

### 基本的なドラッグ&ドロップ

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ドラッグ&ドロップ</title>
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        background-color: #f0f0f0;
        padding: 40px 20px;
      }

      h1 {
        text-align: center;
        margin-bottom: 30px;
        color: #333;
      }

      .board {
        display: flex;
        gap: 20px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .column {
        background: white;
        border-radius: 8px;
        padding: 16px;
        width: 280px;
        min-height: 400px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .column-title {
        font-size: 16px;
        font-weight: bold;
        color: #555;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 2px solid #eee;
      }

      .card {
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 8px;
        cursor: grab;
        transition:
          box-shadow 0.2s,
          transform 0.2s;
        user-select: none;
      }

      .card:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      .card.dragging {
        opacity: 0.5;
        cursor: grabbing;
        transform: rotate(2deg);
      }

      .column.drag-over {
        background-color: #e8f4fd;
        border: 2px dashed #4a90d9;
      }

      .drop-indicator {
        height: 4px;
        background-color: #4a90d9;
        border-radius: 2px;
        margin: 4px 0;
        display: none;
      }

      .drop-indicator.visible {
        display: block;
      }
    </style>
  </head>
  <body>
    <h1>タスクボード（ドラッグ&ドロップ）</h1>

    <div class="board">
      <div class="column" data-status="todo">
        <div class="column-title">未着手</div>
        <div class="card" draggable="true" data-id="1">デザインの作成</div>
        <div class="card" draggable="true" data-id="2">要件定義書の作成</div>
        <div class="card" draggable="true" data-id="3">APIの設計</div>
      </div>

      <div class="column" data-status="in-progress">
        <div class="column-title">進行中</div>
        <div class="card" draggable="true" data-id="4">フロントエンドの実装</div>
      </div>

      <div class="column" data-status="done">
        <div class="column-title">完了</div>
        <div class="card" draggable="true" data-id="5">環境構築</div>
      </div>
    </div>

    <script>
      // --- HTML5 Drag and Drop API を使った実装 ---

      const board = document.querySelector('.board')
      let draggedCard = null

      // ドラッグ開始
      board.addEventListener('dragstart', (event) => {
        const card = event.target.closest('.card')
        if (!card) return

        draggedCard = card
        card.classList.add('dragging')

        // ドラッグデータを設定
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', card.dataset.id)

        // 少し遅延させて見た目を更新（ドラッグ中のゴースト画像が正しく表示されるように）
        requestAnimationFrame(() => {
          card.style.opacity = '0.5'
        })
      })

      // ドラッグ終了
      board.addEventListener('dragend', (event) => {
        const card = event.target.closest('.card')
        if (!card) return

        card.classList.remove('dragging')
        card.style.opacity = ''
        draggedCard = null

        // 全カラムのハイライトを解除
        document.querySelectorAll('.column').forEach((col) => {
          col.classList.remove('drag-over')
        })
      })

      // ドラッグ中にカラムの上を通過
      board.addEventListener('dragover', (event) => {
        event.preventDefault() // ドロップを許可するために必要
        event.dataTransfer.dropEffect = 'move'

        const column = event.target.closest('.column')
        if (!column) return

        // 現在のカラムをハイライト
        document.querySelectorAll('.column').forEach((col) => {
          col.classList.remove('drag-over')
        })
        column.classList.add('drag-over')

        // カード間の挿入位置を計算
        const afterCard = getDragAfterElement(column, event.clientY)
        if (afterCard) {
          column.insertBefore(draggedCard, afterCard)
        } else {
          column.appendChild(draggedCard)
        }
      })

      // ドラッグがカラムから出た
      board.addEventListener('dragleave', (event) => {
        const column = event.target.closest('.column')
        if (column && !column.contains(event.relatedTarget)) {
          column.classList.remove('drag-over')
        }
      })

      // ドロップ
      board.addEventListener('drop', (event) => {
        event.preventDefault()

        const column = event.target.closest('.column')
        if (!column || !draggedCard) return

        column.classList.remove('drag-over')

        // ドロップ位置を計算して挿入
        const afterCard = getDragAfterElement(column, event.clientY)
        if (afterCard) {
          column.insertBefore(draggedCard, afterCard)
        } else {
          column.appendChild(draggedCard)
        }

        console.log(
          `カード "${draggedCard.textContent}" を "${column.dataset.status}" に移動しました`
        )
      })

      // マウス位置に最も近いカードの後ろの要素を取得
      function getDragAfterElement(column, y) {
        const cards = [...column.querySelectorAll('.card:not(.dragging)')]

        return cards.reduce(
          (closest, card) => {
            const box = card.getBoundingClientRect()
            const offset = y - box.top - box.height / 2

            if (offset < 0 && offset > closest.offset) {
              return { offset: offset, element: card }
            } else {
              return closest
            }
          },
          { offset: Number.NEGATIVE_INFINITY }
        ).element
      }
    </script>
  </body>
</html>
```

### コードのポイント解説

| テクニック                      | 説明                                          |
| ------------------------------- | --------------------------------------------- |
| `draggable="true"`              | HTML属性で要素をドラッグ可能にする            |
| `dragstart`                     | ドラッグ開始時の初期化                        |
| `dragover` + `preventDefault()` | ドロップを許可（デフォルトではドロップ不可）  |
| `drop`                          | ドロップ時の処理                              |
| `dragend`                       | ドラッグ終了時のクリーンアップ                |
| `event.dataTransfer`            | ドラッグ中のデータ転送                        |
| イベント委譲                    | 親要素（board）で全カードのイベントを一括処理 |
| `getBoundingClientRect()`       | カードの位置を計算して挿入位置を決定          |
| `requestAnimationFrame`         | 描画タイミングを制御                          |
| `closest()`                     | イベント発生元から最寄りの対象要素を取得      |

## 参考リンク

- [MDN Web Docs - イベント入門](https://developer.mozilla.org/ja/docs/Learn/JavaScript/Building_blocks/Events) - イベント処理の基本を学べるチュートリアル
- [MDN Web Docs - EventTarget.addEventListener()](https://developer.mozilla.org/ja/docs/Web/API/EventTarget/addEventListener) - addEventListenerの全オプション解説
- [MDN Web Docs - Event](https://developer.mozilla.org/ja/docs/Web/API/Event) - イベントオブジェクトのプロパティ一覧
- [MDN Web Docs - イベントバブリングとキャプチャ](https://developer.mozilla.org/ja/docs/Learn/JavaScript/Building_blocks/Event_bubbling) - 伝播の仕組みの詳細
- [MDN Web Docs - IntersectionObserver](https://developer.mozilla.org/ja/docs/Web/API/Intersection_Observer_API) - 要素の可視性監視API
- [MDN Web Docs - CustomEvent](https://developer.mozilla.org/ja/docs/Web/API/CustomEvent) - カスタムイベントのAPI仕様
- [MDN Web Docs - HTML Drag and Drop API](https://developer.mozilla.org/ja/docs/Web/API/HTML_Drag_and_Drop_API) - ドラッグ&ドロップAPIの詳細
- [MDN Web Docs - Touch Events](https://developer.mozilla.org/ja/docs/Web/API/Touch_events) - タッチイベントの詳細ガイド
- [JavaScript.info - イベント](https://ja.javascript.info/events) - イベント処理の包括的なチュートリアル
- [web.dev - Debouncing and Throttling](https://web.dev/articles/debounce-your-resize-handler) - デバウンスとスロットルの解説
