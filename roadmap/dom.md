---
title: 'DOM操作'
order: 6
section: 'フロントエンド インタラクション'
---

# DOM操作

## DOMとは何か

DOM（Document Object Model）とは、HTMLやXMLドキュメントをプログラムから操作するための**インターフェース（API）**のこと。ブラウザがHTMLファイルを読み込むと、その内容を**ツリー構造**のオブジェクトとしてメモリ上に展開する。このツリー構造がDOMだ。

身近な例で考えてみよう。HTMLファイルが「設計図」だとすると、DOMは設計図をもとに組み立てられた「模型」のようなもの。JavaScriptはこの模型を自由に触って、パーツを追加したり、色を変えたり、取り外したりできる。

```
HTMLファイル（テキスト）
    ↓ ブラウザが解析（パース）
DOMツリー（オブジェクト）
    ↓ JavaScriptから操作
画面に反映（レンダリング）
```

重要なポイントは、**JavaScriptが直接HTMLファイルを書き換えているわけではない**ということ。JavaScriptが操作しているのはメモリ上のDOMツリーであり、その変更がブラウザの画面に反映される仕組みになっている。

## DOMツリーの構造

HTMLは入れ子（ネスト）構造になっている。この入れ子構造がそのままツリー構造として表現される。

以下のHTMLを例に見てみよう。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <title>サンプルページ</title>
  </head>
  <body>
    <h1>見出し</h1>
    <div id="content">
      <p class="text">段落1</p>
      <p class="text">段落2</p>
    </div>
  </body>
</html>
```

このHTMLに対応するDOMツリーをASCII図で表すと以下のようになる。

```
document
  |
  +-- html (lang="ja")
       |
       +-- head
       |    |
       |    +-- title
       |         |
       |         +-- "サンプルページ" (テキストノード)
       |
       +-- body
            |
            +-- h1
            |    |
            |    +-- "見出し" (テキストノード)
            |
            +-- div (id="content")
                 |
                 +-- p (class="text")
                 |    |
                 |    +-- "段落1" (テキストノード)
                 |
                 +-- p (class="text")
                      |
                      +-- "段落2" (テキストノード)
```

### ノードの種類

DOMツリーを構成する「ノード」にはいくつかの種類がある。

| ノードの種類 | 説明                                              | 例                             |
| ------------ | ------------------------------------------------- | ------------------------------ |
| Document     | ツリーの最上位。ページ全体を表す                  | `document`                     |
| Element      | HTMLタグに対応するノード                          | `<div>`, `<p>`, `<h1>`         |
| Text         | タグの中のテキスト部分                            | `"見出し"`, `"段落1"`          |
| Attribute    | タグの属性（※ツリーの一部ではないが関連している） | `id="content"`, `class="text"` |
| Comment      | HTMLのコメント                                    | `<!-- コメント -->`            |

### 家系図に例えると

DOMツリーの各ノードの関係は、家系図と同じ用語で表現される。

| 用語               | 意味                      | 上の例での具体例  |
| ------------------ | ------------------------- | ----------------- |
| parent（親）       | 直上のノード              | `body`は`h1`の親  |
| child（子）        | 直下のノード              | `h1`は`body`の子  |
| sibling（兄弟）    | 同じ親を持つノード        | `h1`と`div`は兄弟 |
| ancestor（祖先）   | 親、その親、そのまた親... | `html`は`p`の祖先 |
| descendant（子孫） | 子、その子、そのまた子... | `p`は`html`の子孫 |

## なぜDOM操作が必要なのか

静的なHTMLだけでは、ページの内容は読み込み時に決まったまま変わらない。しかし現代のWebページでは、以下のような「動的な変更」が求められる。

- ボタンをクリックしたらメニューが表示される
- フォームに入力した内容をリアルタイムでバリデーション（検証）する
- サーバーから取得したデータを画面に表示する
- ユーザーの操作に応じてリストの項目を追加・削除する
- スクロールに応じてアニメーションを実行する

これらはすべて、JavaScriptからDOMを操作することで実現している。

```javascript
// 例: ボタンをクリックしたらテキストを変える
const button = document.getElementById('myButton')
button.addEventListener('click', () => {
  const heading = document.getElementById('myHeading')
  heading.textContent = 'クリックされました!'
})
```

## 要素の取得

DOM操作の第一歩は、操作したい要素を「取得」すること。JavaScriptにはいくつかの取得方法が用意されている。

### 各メソッドの比較表

| メソッド                 | 戻り値                   | 取得対象    | 複数取得          | パフォーマンス |
| ------------------------ | ------------------------ | ----------- | ----------------- | -------------- |
| `getElementById`         | Element / null           | id属性      | 不可（idは一意）  | 最速           |
| `getElementsByClassName` | HTMLCollection（ライブ） | class属性   | 可                | 速い           |
| `getElementsByTagName`   | HTMLCollection（ライブ） | タグ名      | 可                | 速い           |
| `querySelector`          | Element / null           | CSSセレクタ | 不可（最初の1つ） | やや遅い       |
| `querySelectorAll`       | NodeList（静的）         | CSSセレクタ | 可                | やや遅い       |

### getElementById

ページ内で**一意の**id属性を持つ要素を取得する。最もシンプルで最もパフォーマンスが良い。

```html
<div id="header">ヘッダー</div>
```

```javascript
const header = document.getElementById('header')
console.log(header.textContent) // "ヘッダー"
```

id属性はページ内で**必ず一意**でなければならない。同じidが複数あると、最初に見つかった要素だけが返される（そしてHTMLとしても不正になる）。

### getElementsByClassName

指定したclass属性を持つ要素を**すべて**取得する。戻り値はHTMLCollectionという「ライブ」なコレクションだ。

```html
<p class="message">メッセージ1</p>
<p class="message">メッセージ2</p>
<p class="message">メッセージ3</p>
```

```javascript
const messages = document.getElementsByClassName('message')
console.log(messages.length) // 3
console.log(messages[0].textContent) // "メッセージ1"
```

**ライブコレクション**とは、DOMが変更されると自動的に内容が更新されるコレクションのこと。要素を追加・削除すると、`messages`の内容もリアルタイムで変わる。これは便利な反面、ループ中に要素を削除すると予期しない動作になることがあるので注意が必要だ。

```javascript
// 注意: ライブコレクションのループでの落とし穴
const items = document.getElementsByClassName('item')

// NG: 要素を削除するとlengthが変わり、要素がスキップされる
for (let i = 0; i < items.length; i++) {
  items[i].remove() // lengthが減るので正しく動作しない
}

// OK: 後ろから削除する
for (let i = items.length - 1; i >= 0; i--) {
  items[i].remove()
}

// OK: スプレッド構文で配列に変換してからループ
;[...items].forEach((item) => item.remove())
```

### querySelector / querySelectorAll

CSSセレクタを使って要素を取得する。最も柔軟で、現代の開発で**最もよく使われる**メソッドだ。

```html
<div id="app">
  <ul class="list">
    <li data-id="1">項目1</li>
    <li data-id="2">項目2</li>
    <li data-id="3">項目3</li>
  </ul>
</div>
```

```javascript
// 最初にマッチした1つを取得
const firstItem = document.querySelector('.list li')
console.log(firstItem.textContent) // "項目1"

// マッチしたすべてを取得
const allItems = document.querySelectorAll('.list li')
console.log(allItems.length) // 3

// CSSセレクタの威力: 複雑な条件指定が可能
const item2 = document.querySelector('[data-id="2"]')
console.log(item2.textContent) // "項目2"

// 複数のセレクタを組み合わせ
const specific = document.querySelector('#app .list li:first-child')
console.log(specific.textContent) // "項目1"

// forEachが使える（NodeListはiterableなので）
allItems.forEach((item) => {
  console.log(item.textContent)
})
```

`querySelectorAll`の戻り値は**静的なNodeList**なので、DOMを変更しても内容は変わらない。ループ中に要素を削除しても安全に動作する。

### 使い分けの指針

```
idで取得したい → getElementById（最速）
CSSセレクタで柔軟に取得したい → querySelector / querySelectorAll（最も汎用的）
ライブコレクションが必要 → getElementsByClassName / getElementsByTagName
```

実務では**`querySelector`と`querySelectorAll`を使うことがほとんど**。CSSセレクタで何でも指定できるため、他のメソッドの出番は少ない。ただし、パフォーマンスが極めて重要な場面（数千要素のループなど）では`getElementById`や`getElementsByClassName`の方が有利になることがある。

## 要素の作成と追加

取得だけでなく、新しい要素を作ってDOMに追加することもできる。

### createElement と appendChild

最も基本的なパターン。

```javascript
// 1. 新しい要素を作成
const newDiv = document.createElement('div')

// 2. 内容やスタイルを設定
newDiv.textContent = '新しい要素です'
newDiv.className = 'new-item'
newDiv.id = 'item-new'

// 3. DOMに追加
const container = document.getElementById('container')
container.appendChild(newDiv)
```

`appendChild`は**親要素の末尾**に子要素を追加する。戻り値として追加された要素自身が返される。

### insertBefore

既存の要素の**前に**挿入する場合に使う。

```javascript
const parent = document.getElementById('list')
const newItem = document.createElement('li')
newItem.textContent = '新しい項目'

// 2番目の子要素の前に挿入
const referenceNode = parent.children[1]
parent.insertBefore(newItem, referenceNode)
```

### append と prepend（モダンなAPI）

`appendChild`よりも新しいAPIで、より使いやすい。

```javascript
const container = document.getElementById('container')

// append: 末尾に追加（複数の要素やテキストを同時に追加できる）
const p = document.createElement('p')
p.textContent = '段落'
container.append(p, 'テキストも直接追加できる')

// prepend: 先頭に追加
const header = document.createElement('h2')
header.textContent = '見出し'
container.prepend(header)
```

| メソッド       | 追加位置     | テキスト直接追加 | 複数要素追加 | 戻り値            |
| -------------- | ------------ | ---------------- | ------------ | ----------------- |
| `appendChild`  | 末尾         | 不可             | 不可         | 追加した要素      |
| `append`       | 末尾         | 可               | 可           | なし（undefined） |
| `prepend`      | 先頭         | 可               | 可           | なし（undefined） |
| `insertBefore` | 指定要素の前 | 不可             | 不可         | 追加した要素      |

### before, after, replaceWith

要素自身を基準に挿入や置換を行うモダンなAPIもある。

```javascript
const target = document.querySelector('.target')

// targetの前に新しい要素を追加
const before = document.createElement('div')
before.textContent = '前に追加'
target.before(before)

// targetの後に新しい要素を追加
const after = document.createElement('div')
after.textContent = '後に追加'
target.after(after)

// targetを別の要素に置換
const replacement = document.createElement('div')
replacement.textContent = '置き換え後'
target.replaceWith(replacement)
```

### innerHTML で一括追加

HTMLの文字列をそのまま挿入することもできる。

```javascript
const container = document.getElementById('container')

// HTML文字列から一括追加
container.innerHTML = `
  <h2>タイトル</h2>
  <p>本文です</p>
  <ul>
    <li>項目1</li>
    <li>項目2</li>
  </ul>
`
```

ただし、`innerHTML`にはセキュリティ上の注意点がある（後述のXSSの項を参照）。

## 要素の削除

### remove()

要素自身を削除する最もシンプルな方法。

```javascript
const element = document.getElementById('target')
element.remove() // 自分自身をDOMから削除
```

### removeChild()

親要素から子要素を削除する古いAPI。古いブラウザ対応が必要な場合に使う。

```javascript
const parent = document.getElementById('list')
const child = parent.children[0]
parent.removeChild(child)
```

### 全ての子要素を削除する

```javascript
const container = document.getElementById('container')

// 方法1: innerHTMLを空にする（最もシンプル）
container.innerHTML = ''

// 方法2: replaceChildrenを使う（モダン）
container.replaceChildren()

// 方法3: ループで削除
while (container.firstChild) {
  container.removeChild(container.firstChild)
}
```

## テキストとHTMLの操作

要素の内容を変更する方法は3つある。それぞれ動作が異なるため、違いを理解することが重要だ。

### textContent, innerHTML, innerTextの比較

```html
<div id="example">
  <span>表示される</span>
  <span style="display:none">隠れている</span>
</div>
```

```javascript
const el = document.getElementById('example')

// textContent: 全てのテキストを返す（CSSの表示状態は無視）
console.log(el.textContent)
// "  表示される  隠れている"

// innerText: 画面に表示されているテキストのみ返す
console.log(el.innerText)
// "表示される"

// innerHTML: HTMLタグも含めた文字列を返す
console.log(el.innerHTML)
// "  <span>表示される</span>  <span style=\"display:none\">隠れている</span>"
```

| プロパティ    | HTMLタグの解釈             | 非表示要素 | パフォーマンス               | 用途                   |
| ------------- | -------------------------- | ---------- | ---------------------------- | ---------------------- |
| `textContent` | タグを無視してテキストのみ | 含む       | 速い                         | テキストの取得・設定   |
| `innerText`   | タグを無視してテキストのみ | 含まない   | 遅い（レイアウト計算が必要） | 画面表示テキストの取得 |
| `innerHTML`   | タグをHTMLとして解釈       | 含む       | 普通                         | HTML構造の取得・設定   |

### セキュリティ上の注意点: XSS（クロスサイトスクリプティング）

`innerHTML`にユーザー入力をそのまま挿入すると、**XSS攻撃**の脆弱性が生まれる。XSSとは、悪意のあるスクリプト（JavaScript）をWebページに注入する攻撃手法だ。

```javascript
// 危険な例
const userInput = '<img src="x" onerror="alert(\'攻撃成功!\')">'
document.getElementById('output').innerHTML = userInput
// imgタグのonerrorが実行され、alertが表示される
// 実際の攻撃では、Cookieの盗み出しやリダイレクトが行われる

// 安全な例: textContentを使えばHTMLは解釈されない
document.getElementById('output').textContent = userInput
// "<img src=\"x\" onerror=\"alert('攻撃成功!')\">" がそのまま文字として表示される
```

**ルール**: ユーザーが入力したデータをDOMに表示する場合は、**必ず`textContent`を使う**。`innerHTML`を使う必要がある場合は、必ず**サニタイズ（無害化処理）**を行うこと。

```javascript
// サニタイズ関数の例
function sanitizeHTML(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// 使用例
const userInput = '<script>alert("攻撃")</script>'
const safe = sanitizeHTML(userInput)
document.getElementById('output').innerHTML = safe
// "&lt;script&gt;alert("攻撃")&lt;/script&gt;" と表示される
```

## 属性の操作

HTML要素の属性（`id`, `class`, `src`, `href`, `data-*`など）をJavaScriptから操作できる。

### getAttribute / setAttribute / removeAttribute

```html
<a id="myLink" href="https://example.com" target="_blank">リンク</a>
```

```javascript
const link = document.getElementById('myLink')

// 属性の取得
console.log(link.getAttribute('href')) // "https://example.com"
console.log(link.getAttribute('target')) // "_blank"

// 属性の設定
link.setAttribute('href', 'https://example.org')
link.setAttribute('title', 'Example Orgへのリンク')

// 属性の削除
link.removeAttribute('target')

// 属性の存在チェック
console.log(link.hasAttribute('title')) // true
console.log(link.hasAttribute('target')) // false
```

### プロパティとしての直接アクセス

一般的な属性は、要素のプロパティとして直接アクセスすることもできる。

```javascript
const link = document.getElementById('myLink')

// プロパティとして直接アクセス
console.log(link.href) // "https://example.com" （完全なURL）
console.log(link.id) // "myLink"

// 設定もプロパティ経由で可能
link.href = 'https://example.org'
```

注意点として、`getAttribute('href')`はHTMLに書かれた値をそのまま返すが、`link.href`プロパティは完全なURLに変換された値を返す場合がある。

### data属性（カスタムデータ属性）

`data-`で始まる属性を使って、HTML要素に任意のデータを持たせることができる。`dataset`プロパティで簡単にアクセスできる。

```html
<div id="user" data-user-id="123" data-user-name="太郎" data-role="admin">ユーザー情報</div>
```

```javascript
const user = document.getElementById('user')

// 取得（data-の後のハイフン区切りがキャメルケースに変換される）
console.log(user.dataset.userId) // "123"（data-user-id → userId）
console.log(user.dataset.userName) // "太郎"（data-user-name → userName）
console.log(user.dataset.role) // "admin"

// 設定
user.dataset.email = 'taro@example.com'
// HTML上では data-email="taro@example.com" が追加される

// 削除
delete user.dataset.role
```

data属性は、JavaScriptに値を渡したいが、通常のHTML属性では適切なものがない場合に便利。例えば、商品リストの各項目に商品IDを持たせるなどの使い方が一般的だ。

## クラスの操作

CSSクラスの追加・削除はDOM操作の中でも**最も頻繁に行われる操作**の一つ。要素の見た目を動的に変更するために使う。

### classList

`classList`プロパティはクラスを操作するための便利なメソッドを提供する。

```html
<div id="box" class="container active">ボックス</div>
```

```javascript
const box = document.getElementById('box')

// クラスの追加
box.classList.add('highlight')
// class="container active highlight"

// 複数のクラスを同時に追加
box.classList.add('animated', 'fade-in')

// クラスの削除
box.classList.remove('active')
// class="container highlight animated fade-in"

// クラスの切り替え（あれば削除、なければ追加）
box.classList.toggle('visible')
// visibleがなかったので追加される

box.classList.toggle('visible')
// visibleがあったので削除される

// 条件付きトグル（第2引数がtrueならadd、falseならremove）
const isActive = true
box.classList.toggle('active', isActive)

// クラスの存在チェック
console.log(box.classList.contains('container')) // true
console.log(box.classList.contains('hidden')) // false

// 全クラスの一覧
console.log([...box.classList]) // ["container", "highlight", "animated", "fade-in", "active"]
```

### classNameプロパティ

`className`はクラス属性全体を文字列として扱う。

```javascript
const box = document.getElementById('box')

// 全クラスを取得（文字列として）
console.log(box.className) // "container active"

// 全クラスを一括で書き換え（既存のクラスは失われる）
box.className = 'new-class only'
```

`className`は全クラスを上書きしてしまうため、特定のクラスだけを追加・削除したい場合は`classList`を使うべきだ。

### 実用例: タブ切り替え

```html
<div class="tabs">
  <button class="tab active" data-target="#panel1">タブ1</button>
  <button class="tab" data-target="#panel2">タブ2</button>
  <button class="tab" data-target="#panel3">タブ3</button>
</div>
<div id="panel1" class="panel active">パネル1の内容</div>
<div id="panel2" class="panel">パネル2の内容</div>
<div id="panel3" class="panel">パネル3の内容</div>
```

```javascript
// タブのクリックでアクティブクラスを切り替える
const tabs = document.querySelectorAll('.tab')
const panels = document.querySelectorAll('.panel')

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    // 全タブからactiveを削除
    tabs.forEach((t) => t.classList.remove('active'))
    panels.forEach((p) => p.classList.remove('active'))

    // クリックされたタブとパネルにactiveを追加
    tab.classList.add('active')
    const targetPanel = document.querySelector(tab.dataset.target)
    targetPanel.classList.add('active')
  })
})
```

## スタイルの操作

JavaScriptからCSSスタイルを直接変更する方法。

### style プロパティ

要素のインラインスタイルを操作する。

```javascript
const box = document.getElementById('box')

// スタイルの設定
box.style.backgroundColor = 'blue' // CSSのbackground-colorに対応
box.style.color = 'white'
box.style.padding = '20px'
box.style.borderRadius = '8px' // CSSのborder-radiusに対応
box.style.display = 'flex'

// スタイルの取得（インラインスタイルのみ）
console.log(box.style.backgroundColor) // "blue"

// スタイルの削除
box.style.backgroundColor = '' // 空文字で削除
```

CSSプロパティ名のハイフン区切り（`background-color`）は、JavaScriptではキャメルケース（`backgroundColor`）に変換する必要がある。

| CSSプロパティ      | JavaScriptでの書き方 |
| ------------------ | -------------------- |
| `background-color` | `backgroundColor`    |
| `font-size`        | `fontSize`           |
| `border-radius`    | `borderRadius`       |
| `z-index`          | `zIndex`             |
| `margin-top`       | `marginTop`          |

### getComputedStyle

`style`プロパティはインラインスタイルしか取得できない。CSSファイルで指定されたスタイルも含めて取得するには`getComputedStyle`を使う。

```javascript
const box = document.getElementById('box')

// CSSファイルやstyleタグで指定されたスタイルも含めて取得
const computed = getComputedStyle(box)
console.log(computed.width) // "200px"
console.log(computed.backgroundColor) // "rgb(0, 0, 255)"
console.log(computed.fontSize) // "16px"
```

### スタイル操作のベストプラクティス

実務では、`style`プロパティで個別にスタイルを指定するよりも、**クラスの切り替え**でスタイルを変更することが推奨される。

```javascript
// 非推奨: JavaScriptでスタイルを直接指定
element.style.backgroundColor = 'red'
element.style.color = 'white'
element.style.fontWeight = 'bold'
element.style.border = '2px solid red'

// 推奨: CSSクラスを切り替える
element.classList.add('error')
```

```css
/* CSSファイルにスタイルを定義 */
.error {
  background-color: red;
  color: white;
  font-weight: bold;
  border: 2px solid red;
}
```

この方法の利点は、スタイルの定義をCSSファイルにまとめられること、スタイルの再利用が容易なこと、そしてメンテナンス性が格段に高いことだ。

## DOM走査（トラバーサル）

DOM走査とは、ある要素を起点として、親要素・子要素・兄弟要素へと移動しながら要素を取得するテクニックだ。

### 走査プロパティの一覧

```html
<ul id="list">
  <li id="item-1">項目1</li>
  <li id="item-2">項目2</li>
  <li id="item-3">項目3</li>
</ul>
```

```javascript
const item2 = document.getElementById('item-2')

// 親要素
console.log(item2.parentNode) // <ul id="list">
console.log(item2.parentElement) // <ul id="list">

// 兄弟要素
console.log(item2.previousElementSibling) // <li id="item-1">
console.log(item2.nextElementSibling) // <li id="item-3">

// 子要素
const list = document.getElementById('list')
console.log(list.children) // HTMLCollection [li, li, li]
console.log(list.firstElementChild) // <li id="item-1">
console.log(list.lastElementChild) // <li id="item-3">
console.log(list.childElementCount) // 3
```

### Element系とNode系の違い

走査プロパティには、テキストノードやコメントノードを含む「Node系」と、要素ノードのみを返す「Element系」がある。

| Node系（全ノード） | Element系（要素のみ）    | 推奨               |
| ------------------ | ------------------------ | ------------------ |
| `parentNode`       | `parentElement`          | 通常はどちらでもOK |
| `childNodes`       | `children`               | Element系推奨      |
| `firstChild`       | `firstElementChild`      | Element系推奨      |
| `lastChild`        | `lastElementChild`       | Element系推奨      |
| `previousSibling`  | `previousElementSibling` | Element系推奨      |
| `nextSibling`      | `nextElementSibling`     | Element系推奨      |

```javascript
const list = document.getElementById('list')

// Node系: テキストノード（改行・空白）も含まれる
console.log(list.childNodes.length) // 7（テキスト3つ + 要素3つ + テキスト1つ）

// Element系: 要素ノードのみ
console.log(list.children.length) // 3（li要素のみ）
```

通常の開発では**Element系**を使う方が意図した結果を得やすい。

### closest()

`closest()`は、自身から**親方向に**CSSセレクタに一致する最初の要素を探す。イベント委譲で特に便利なメソッドだ。

```html
<div class="card" data-id="1">
  <div class="card-body">
    <button class="delete-btn">削除</button>
  </div>
</div>
```

```javascript
const button = document.querySelector('.delete-btn')

// ボタンから最も近い.card要素を取得
const card = button.closest('.card')
console.log(card.dataset.id) // "1"

// マッチする要素がなければnullを返す
const form = button.closest('form')
console.log(form) // null
```

## DocumentFragment（パフォーマンス最適化）

多数の要素を一度にDOMに追加する場合、1つずつ追加するとその都度ブラウザが画面を再描画（リフロー・リペイント）する。`DocumentFragment`を使うと、**仮の入れ物**に要素をまとめて入れておき、最後に一括でDOMに追加できる。

### なぜ必要なのか

```javascript
const list = document.getElementById('list')

// 非効率: 1000回DOMに追加 = 1000回リフロー（画面の再計算）の可能性
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li')
  li.textContent = `項目 ${i + 1}`
  list.appendChild(li) // 毎回DOMに追加
}
```

### DocumentFragmentを使った改善

```javascript
const list = document.getElementById('list')
const fragment = document.createDocumentFragment()

// フラグメント（仮の入れ物）に要素を追加（DOMには影響しない）
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li')
  li.textContent = `項目 ${i + 1}`
  fragment.appendChild(li) // フラグメントに追加
}

// 一括でDOMに追加（リフローは1回だけ）
list.appendChild(fragment)
```

`DocumentFragment`はDOMツリーに含まれないため、フラグメントへの操作はリフローを引き起こさない。最後にDOMに追加した瞬間にフラグメントの中身が移動する（フラグメント自体は空になる）。

料理に例えると、**まな板の上で全ての材料を切り終えてから鍋に入れる**のと同じ考え方だ。1つ切るたびに鍋に入れるよりも効率が良い。

## MutationObserver（DOM変更の監視）

`MutationObserver`は、DOMの変更を**監視**するためのAPI。要素の追加・削除、属性の変更、テキストの変更などを検知してコールバック関数を実行できる。

### 基本的な使い方

```javascript
// 1. コールバック関数を定義
const callback = (mutationsList) => {
  for (const mutation of mutationsList) {
    switch (mutation.type) {
      case 'childList':
        console.log('子要素が変更されました')
        console.log('追加:', mutation.addedNodes)
        console.log('削除:', mutation.removedNodes)
        break
      case 'attributes':
        console.log(`属性 "${mutation.attributeName}" が変更されました`)
        break
      case 'characterData':
        console.log('テキストが変更されました')
        break
    }
  }
}

// 2. オブザーバーを作成
const observer = new MutationObserver(callback)

// 3. 監視対象と設定を指定
const target = document.getElementById('observable')
const config = {
  childList: true, // 子要素の追加・削除を監視
  attributes: true, // 属性の変更を監視
  characterData: true, // テキストの変更を監視
  subtree: true, // 子孫要素も含めて監視
}

observer.observe(target, config)

// 4. 監視を停止する場合
// observer.disconnect();
```

### 実用例: 動的に追加されたコンテンツの処理

```javascript
// 外部ライブラリが動的に追加する要素に対して処理を行う例
const container = document.getElementById('dynamic-content')

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      // 要素ノードのみ処理
      if (node.nodeType === Node.ELEMENT_NODE) {
        // 新しく追加された画像に遅延読み込みを設定
        const images = node.querySelectorAll('img')
        images.forEach((img) => {
          img.loading = 'lazy'
        })
      }
    })
  })
})

observer.observe(container, { childList: true, subtree: true })
```

## 仮想DOMとの比較

Reactなどのモダンなフレームワークでは「仮想DOM（Virtual DOM）」という概念が使われている。ネイティブDOMとの違いを理解しておこう。

### ネイティブDOM（通常のDOM操作）

```javascript
// 直接DOMを操作する
const counter = document.getElementById('counter')
let count = 0

document.getElementById('increment').addEventListener('click', () => {
  count++
  counter.textContent = count // 直接DOMを書き換える
})
```

- 開発者が「何をどう変更するか」を明示的に指定する（命令型）
- シンプルなケースでは効率的
- 複雑なUIでは、どの部分を更新すべきか管理が大変になる

### 仮想DOM（Reactのアプローチ）

```jsx
// Reactでの同じ機能
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>増加</button>
    </div>
  )
}
```

- 開発者は「UIがどうあるべきか」を記述する（宣言型）
- stateが変更されると、フレームワークが仮想DOMの差分を計算する
- 差分のみを実際のDOMに反映するので、効率的な更新が可能
- 開発者がDOM操作のタイミングを意識する必要がない

### 比較表

| 観点             | ネイティブDOM            | 仮想DOM（React等）                       |
| ---------------- | ------------------------ | ---------------------------------------- |
| アプローチ       | 命令型（Imperative）     | 宣言型（Declarative）                    |
| DOM操作          | 開発者が直接行う         | フレームワークが自動で行う               |
| パフォーマンス   | 最適化は開発者の責任     | フレームワークが差分更新で最適化         |
| 学習コスト       | 低い（APIを覚えるだけ）  | 高い（フレームワークの仕組み理解が必要） |
| 適しているケース | 小規模なインタラクション | 大規模なSPA（Single Page Application）   |
| デバッグ         | DOM Inspector直接確認    | React DevTools等のツール使用             |

仮想DOMは万能ではない。小規模なページや単純なインタラクションでは、ネイティブDOMの方がシンプルで高速なこともある。Reactを使う場合でも、内部では最終的にネイティブDOMが操作されている。そのため、**ネイティブDOMの理解はフレームワークを使う上でも不可欠**だ。

## パフォーマンスのベストプラクティス

### リフローとリペイントとは

ブラウザは、DOMが変更されると画面を再描画する。この処理は大きく2種類に分かれる。

| 処理                  | 説明                                           | コスト     | トリガーとなる変更                                                  |
| --------------------- | ---------------------------------------------- | ---------- | ------------------------------------------------------------------- |
| リフロー（Reflow）    | 要素のサイズや位置を再計算する                 | 非常に高い | width, height, margin, padding, display, position, フォントサイズ等 |
| リペイント（Repaint） | 外見だけを再描画する（レイアウトは変わらない） | 高い       | color, background-color, visibility, box-shadow等                   |

リフローはリペイントよりもコストが高い。リフローが発生すると、必ずリペイントも発生する。

### 最小化のテクニック

```javascript
// NG: 複数のスタイル変更が個別にリフローを引き起こす可能性
const box = document.getElementById('box')
box.style.width = '200px' // リフロー
box.style.height = '100px' // リフロー
box.style.margin = '10px' // リフロー

// OK: クラスの切り替えで一括変更（リフロー1回）
box.classList.add('new-size')
```

```javascript
// NG: レイアウト情報を読み書きの間に挟むと強制的にリフローが発生する
const box = document.getElementById('box')
box.style.width = '200px' // 書き込み
const height = box.offsetHeight // 読み取り → ここで強制リフロー
box.style.height = height + 'px' // 書き込み

// OK: 読み取りをまとめてから書き込む
const height2 = box.offsetHeight // 読み取り
box.style.width = '200px' // 書き込み
box.style.height = height2 + 'px' // 書き込み（リフローは1回にまとまる）
```

```javascript
// NG: ループ内でDOMに逐次追加
for (let i = 0; i < 100; i++) {
  const item = document.createElement('div')
  item.textContent = `Item ${i}`
  container.appendChild(item) // 毎回リフロー
}

// OK: DocumentFragmentでまとめて追加
const fragment = document.createDocumentFragment()
for (let i = 0; i < 100; i++) {
  const item = document.createElement('div')
  item.textContent = `Item ${i}`
  fragment.appendChild(item)
}
container.appendChild(fragment) // リフロー1回
```

### レイアウトスラッシング

「レイアウトスラッシング」とは、読み取りと書き込みを交互に行うことで、毎回強制的にリフローが発生する問題。

```javascript
// NG: レイアウトスラッシング
const items = document.querySelectorAll('.item')
items.forEach((item) => {
  const width = item.offsetWidth // 読み取り → 強制リフロー
  item.style.width = width * 2 + 'px' // 書き込み
})

// OK: 読み取りと書き込みを分離
const items2 = document.querySelectorAll('.item')
const widths = [...items2].map((item) => item.offsetWidth) // まず全て読み取り
items2.forEach((item, i) => {
  item.style.width = widths[i] * 2 + 'px' // その後まとめて書き込み
})
```

### パフォーマンス最適化のまとめ

| テクニック                            | 効果                                     |
| ------------------------------------- | ---------------------------------------- |
| DocumentFragmentの使用                | 一括追加でリフロー回数を削減             |
| クラスの切り替え                      | 複数のスタイル変更を1回のリフローに      |
| 読み取りと書き込みの分離              | レイアウトスラッシングの防止             |
| `display: none`で一時非表示にして変更 | 非表示要素の変更はリフローを発生させない |
| `requestAnimationFrame`の使用         | ブラウザの描画タイミングに合わせた更新   |
| `will-change`プロパティ               | ブラウザに事前最適化のヒントを与える     |

## 実践例: ToDoリストを純粋なJSで作る

ここまで学んだDOM操作の知識を総合的に使って、ToDoリストアプリケーションを作ってみよう。HTML、CSS、JavaScriptの全コードを提示する。

### HTML

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ToDoリスト</title>
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

      .todo-app {
        max-width: 500px;
        margin: 0 auto;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 30px;
      }

      h1 {
        text-align: center;
        color: #333;
        margin-bottom: 20px;
      }

      .input-area {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }

      .input-area input {
        flex: 1;
        padding: 10px 15px;
        border: 2px solid #ddd;
        border-radius: 6px;
        font-size: 16px;
        outline: none;
        transition: border-color 0.3s;
      }

      .input-area input:focus {
        border-color: #4a90d9;
      }

      .input-area button {
        padding: 10px 20px;
        background-color: #4a90d9;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      .input-area button:hover {
        background-color: #357abd;
      }

      .filters {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
        justify-content: center;
      }

      .filters button {
        padding: 6px 16px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;
      }

      .filters button.active {
        background-color: #4a90d9;
        color: white;
        border-color: #4a90d9;
      }

      .todo-list {
        list-style: none;
      }

      .todo-item {
        display: flex;
        align-items: center;
        padding: 12px 15px;
        border-bottom: 1px solid #eee;
        transition: background-color 0.2s;
      }

      .todo-item:hover {
        background-color: #f9f9f9;
      }

      .todo-item.completed .todo-text {
        text-decoration: line-through;
        color: #999;
      }

      .todo-item input[type='checkbox'] {
        margin-right: 12px;
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .todo-text {
        flex: 1;
        font-size: 16px;
        color: #333;
      }

      .delete-btn {
        padding: 4px 10px;
        background: none;
        border: 1px solid #e74c3c;
        color: #e74c3c;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s;
      }

      .delete-btn:hover {
        background-color: #e74c3c;
        color: white;
      }

      .stats {
        text-align: center;
        color: #999;
        font-size: 14px;
        margin-top: 15px;
      }

      .empty-message {
        text-align: center;
        color: #999;
        padding: 20px;
        font-style: italic;
      }
    </style>
  </head>
  <body>
    <div class="todo-app">
      <h1>ToDoリスト</h1>

      <div class="input-area">
        <input type="text" id="todoInput" placeholder="新しいタスクを入力..." />
        <button id="addBtn">追加</button>
      </div>

      <div class="filters">
        <button class="filter-btn active" data-filter="all">すべて</button>
        <button class="filter-btn" data-filter="active">未完了</button>
        <button class="filter-btn" data-filter="completed">完了</button>
      </div>

      <ul id="todoList" class="todo-list"></ul>
      <p id="stats" class="stats"></p>
    </div>

    <script>
      // --- 状態管理 ---
      let todos = []
      let currentFilter = 'all'

      // --- DOM要素の取得 ---
      const todoInput = document.getElementById('todoInput')
      const addBtn = document.getElementById('addBtn')
      const todoList = document.getElementById('todoList')
      const statsEl = document.getElementById('stats')
      const filterBtns = document.querySelectorAll('.filter-btn')

      // --- ToDo追加 ---
      function addTodo() {
        const text = todoInput.value.trim()
        if (text === '') return

        const todo = {
          id: Date.now(),
          text: text,
          completed: false,
        }

        todos.push(todo)
        todoInput.value = ''
        todoInput.focus()
        render()
      }

      // --- ToDo削除 ---
      function deleteTodo(id) {
        todos = todos.filter((todo) => todo.id !== id)
        render()
      }

      // --- 完了状態の切り替え ---
      function toggleTodo(id) {
        todos = todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
        render()
      }

      // --- フィルタリング ---
      function getFilteredTodos() {
        switch (currentFilter) {
          case 'active':
            return todos.filter((todo) => !todo.completed)
          case 'completed':
            return todos.filter((todo) => todo.completed)
          default:
            return todos
        }
      }

      // --- 画面描画 ---
      function render() {
        const filtered = getFilteredTodos()

        // DocumentFragmentを使って一括でDOMを更新
        const fragment = document.createDocumentFragment()

        if (filtered.length === 0) {
          const emptyMsg = document.createElement('li')
          emptyMsg.className = 'empty-message'
          emptyMsg.textContent =
            currentFilter === 'all'
              ? 'タスクがありません。新しいタスクを追加しましょう。'
              : currentFilter === 'active'
                ? '未完了のタスクはありません。'
                : '完了したタスクはありません。'
          fragment.appendChild(emptyMsg)
        } else {
          filtered.forEach((todo) => {
            // li要素を作成
            const li = document.createElement('li')
            li.className = `todo-item${todo.completed ? ' completed' : ''}`
            li.dataset.id = todo.id

            // チェックボックス
            const checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.checked = todo.completed
            checkbox.addEventListener('change', () => toggleTodo(todo.id))

            // テキスト
            const span = document.createElement('span')
            span.className = 'todo-text'
            span.textContent = todo.text // textContentでXSS防止

            // 削除ボタン
            const deleteBtn = document.createElement('button')
            deleteBtn.className = 'delete-btn'
            deleteBtn.textContent = '削除'
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id))

            li.append(checkbox, span, deleteBtn)
            fragment.appendChild(li)
          })
        }

        // 一括でDOMに反映
        todoList.replaceChildren(fragment)

        // 統計情報の更新
        const total = todos.length
        const completed = todos.filter((t) => t.completed).length
        const active = total - completed
        statsEl.textContent = `全${total}件 / 未完了${active}件 / 完了${completed}件`
      }

      // --- イベントリスナーの設定 ---

      // 追加ボタン
      addBtn.addEventListener('click', addTodo)

      // Enterキーで追加
      todoInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          addTodo()
        }
      })

      // フィルターボタン（イベント委譲を使用）
      document.querySelector('.filters').addEventListener('click', (event) => {
        const btn = event.target.closest('.filter-btn')
        if (!btn) return

        currentFilter = btn.dataset.filter

        // activeクラスの切り替え
        filterBtns.forEach((b) => b.classList.remove('active'))
        btn.classList.add('active')

        render()
      })

      // 初回描画
      render()
    </script>
  </body>
</html>
```

### コードのポイント解説

このToDoリストでは、ここまで学んだ以下のDOM操作テクニックを使っている。

| テクニック         | 使用箇所                                          |
| ------------------ | ------------------------------------------------- |
| `getElementById`   | 各要素の取得                                      |
| `querySelectorAll` | フィルターボタンの一括取得                        |
| `createElement`    | ToDo項目の動的生成                                |
| `DocumentFragment` | 一括DOM更新によるパフォーマンス最適化             |
| `replaceChildren`  | 子要素の一括置換                                  |
| `textContent`      | XSS防止のためにinnerHTMLではなくtextContentを使用 |
| `classList`        | フィルターボタンのactiveクラス切り替え            |
| `dataset`          | データ属性でtodo IDとフィルター種別を管理         |
| `closest`          | イベント委譲でクリック対象を特定                  |
| `addEventListener` | クリック、キーボード入力のイベント処理            |

## 参考リンク

- [MDN Web Docs - DOMの概要](https://developer.mozilla.org/ja/docs/Web/API/Document_Object_Model/Introduction) - DOMの基本概念を解説する公式リファレンス
- [MDN Web Docs - Document](https://developer.mozilla.org/ja/docs/Web/API/Document) - documentオブジェクトの全メソッド・プロパティ一覧
- [MDN Web Docs - Element](https://developer.mozilla.org/ja/docs/Web/API/Element) - Element APIの詳細リファレンス
- [MDN Web Docs - Node](https://developer.mozilla.org/ja/docs/Web/API/Node) - Nodeインターフェースの解説
- [MDN Web Docs - MutationObserver](https://developer.mozilla.org/ja/docs/Web/API/MutationObserver) - DOM変更監視のAPI解説
- [MDN Web Docs - DocumentFragment](https://developer.mozilla.org/ja/docs/Web/API/DocumentFragment) - DocumentFragmentの使い方
- [Google Developers - Avoid Large, Complex Layouts and Layout Thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing) - リフロー最適化のガイド
- [JavaScript.info - Document](https://ja.javascript.info/document) - DOM操作の包括的なチュートリアル
