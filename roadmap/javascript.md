---
title: 'JavaScript'
order: 3
section: 'フロントエンド基礎'
---

# JavaScript

## JavaScriptとは

JavaScriptは、Webブラウザで動く**唯一のプログラミング言語**。HTMLが「構造」、CSSが「見た目」を担当するのに対して、JavaScriptは「動き」を担当する。

ボタンをクリックしたときに何か起こる、フォームの入力値をチェックする、サーバーからデータを取得して表示する――これら全てがJavaScriptの仕事。

現在はNode.jsの登場により、ブラウザだけでなくサーバーサイドでも動作するようになった。つまりJavaScriptを学べば、フロントエンドもバックエンドも書ける。

| 用途               | 例                                 |
| ------------------ | ---------------------------------- |
| フロントエンド     | ボタンの動作、アニメーション、SPA  |
| バックエンド       | APIサーバー（Node.js + Express等） |
| モバイルアプリ     | React Native、Ionic                |
| デスクトップアプリ | Electron（VS Code等）              |

**JavaとJavaScriptは全く別の言語。** 名前が似ているのは歴史的な事情（当時Javaが人気だったため、マーケティング目的で名前を借りた）。

## 変数

変数はデータを格納する「名前付きの箱」。JavaScriptには3つの変数宣言の方法がある。

### var / let / const の違い

| 特徴     | var               | let              | const            |
| -------- | ----------------- | ---------------- | ---------------- |
| 再宣言   | 可能              | 不可             | 不可             |
| 再代入   | 可能              | 可能             | 不可             |
| スコープ | 関数スコープ      | ブロックスコープ | ブロックスコープ |
| 巻き上げ | あり（undefined） | あり（エラー）   | あり（エラー）   |
| 導入時期 | ES1（最初から）   | ES2015           | ES2015           |

```javascript
// var: 古い書き方。現代では使わない
var name = '太郎'
var name = '花子' // 再宣言できてしまう（バグの原因になる）

// let: 値を後から変更する場合
let count = 0
count = 1 // 再代入OK
// let count = 2; // エラー: 再宣言は不可

// const: 値を変更しない場合（推奨）
const PI = 3.14
// PI = 3.15;     // エラー: 再代入は不可
```

### スコープ

スコープとは「変数が参照できる範囲」のこと。

```javascript
// varは関数スコープ（関数の中でのみ有効）
function example() {
  if (true) {
    var x = 10
  }
  console.log(x) // 10（ifブロックの外でも参照可能）
}

// let/constはブロックスコープ（{}の中でのみ有効）
function example2() {
  if (true) {
    let y = 10
    const z = 20
  }
  // console.log(y); // エラー: yはブロックの外で参照不可
  // console.log(z); // エラー: zもブロックの外で参照不可
}
```

### 使い分けの指針

**現代のJavaScriptでは `var` は使わない。**

- **基本は `const` を使う**（値が変わらないことを明示できる）
- **値を再代入する必要がある場合だけ `let` を使う**（ループカウンタ等）
- **`var` は使わない**（スコープの挙動が予測しにくく、バグの原因になる）

```javascript
// 実務での使い方
const userName = '太郎' // 変更しない値はconst
const items = [1, 2, 3] // 配列もconst（中身の変更は可能）
const config = { debug: true } // オブジェクトもconst

let total = 0 // ループで加算するのでlet
for (let i = 0; i < items.length; i++) {
  total += items[i]
}
```

**constで宣言した配列やオブジェクトの中身は変更可能** という点に注意。constは「再代入不可」であって「不変（immutable）」ではない。

```javascript
const arr = [1, 2, 3]
arr.push(4) // OK: 配列の中身を変更
// arr = [5, 6, 7]; // エラー: 配列自体を別の配列に再代入は不可

const obj = { name: '太郎' }
obj.name = '花子' // OK: プロパティの変更
// obj = {};        // エラー: オブジェクト自体の再代入は不可
```

## データ型

JavaScriptのデータ型は大きく「プリミティブ型」と「オブジェクト型」に分かれる。

### プリミティブ型（基本的な値）

| 型        | 説明                           | 例                               |
| --------- | ------------------------------ | -------------------------------- |
| string    | 文字列                         | `'hello'`, `"world"`, `` `hi` `` |
| number    | 整数・小数                     | `42`, `3.14`, `NaN`, `Infinity`  |
| boolean   | 真偽値                         | `true`, `false`                  |
| null      | 値が「ない」ことを意図的に示す | `null`                           |
| undefined | 値が「未定義」                 | `undefined`                      |
| symbol    | 一意の識別子（ES2015）         | `Symbol('description')`          |
| BigInt    | 巨大な整数（ES2020）           | `9007199254740991n`              |

### オブジェクト型（複合的な値）

| 型       | 説明               | 例                          |
| -------- | ------------------ | --------------------------- |
| Object   | キーと値のペア     | `{ name: '太郎', age: 25 }` |
| Array    | 順序付きリスト     | `[1, 2, 3]`                 |
| Function | 実行可能な処理     | `function() {}`             |
| Date     | 日付と時刻         | `new Date()`                |
| RegExp   | 正規表現           | `/pattern/g`                |
| Map      | キーと値のペア     | `new Map()`                 |
| Set      | 重複なしの値の集合 | `new Set()`                 |

### nullとundefinedの違い

初心者が混乱しやすいポイント。

```javascript
// undefined: 「まだ値が設定されていない」
let x
console.log(x) // undefined

// null: 「意図的に値がないことを示す」
let user = null // ユーザーはまだログインしていない
```

例えるなら:

- `undefined` = 空の本棚（まだ本を置いていない）
- `null` = 「空」と書かれたラベルが貼ってある本棚（意図的に空にしている）

### 型の確認

```javascript
typeof 'hello' // 'string'
typeof 42 // 'number'
typeof true // 'boolean'
typeof undefined // 'undefined'
typeof null // 'object' ← 注意! JavaScriptの歴史的なバグ
typeof {} // 'object'
typeof [] // 'object' ← 配列かどうかはArray.isArrayで判定
typeof function () {} // 'function'

// 配列かどうかの正確な判定
Array.isArray([1, 2, 3]) // true
Array.isArray('hello') // false
```

## 演算子

### 算術演算子

```javascript
10 + 3 // 13（加算）
10 - 3 // 7（減算）
10 * 3 // 30（乗算）
10 / 3 // 3.333...（除算）
10 % 3 // 1（剰余 = 余り）
10 ** 3 // 1000（べき乗）

// インクリメント/デクリメント
let count = 0
count++ // 1（1を加算）
count-- // 0（1を減算）

// 複合代入演算子
let total = 100
total += 10 // total = total + 10 → 110
total -= 5 // total = total - 5 → 105
total *= 2 // total = total * 2 → 210
```

### 比較演算子（=== vs ==）

**JavaScriptで最も重要な注意点の1つ。**

```javascript
// == : 型変換してから比較（緩い比較）→ 使わない
1 == '1' // true（文字列'1'が数値1に変換される）
0 == false // true
null == undefined // true
'' == 0 // true

// === : 型も値も一致する場合のみtrue（厳密比較）→ 常にこちらを使う
1 === '1' // false（型が違う）
0 === false // false
null === undefined // false
'' === 0 // false
```

**実務では常に `===`（厳密等価演算子）を使う。** `==`は予期しない型変換が起こるため、バグの温床になる。

| 演算子 | 意味       | 例                 |
| ------ | ---------- | ------------------ |
| ===    | 厳密等価   | `1 === 1` → true   |
| !==    | 厳密不等価 | `1 !== '1'` → true |
| >      | より大きい | `5 > 3` → true     |
| <      | より小さい | `3 < 5` → true     |
| >=     | 以上       | `5 >= 5` → true    |
| <=     | 以下       | `3 <= 5` → true    |

### 論理演算子

```javascript
// AND（&&）: 両方trueならtrue
true && true // true
true && false // false

// OR（||）: どちらかがtrueならtrue
true || false // true
false || false // false

// NOT（!）: 反転
!true // false
!false // true
!!0 // false（二重否定で真偽値に変換）
!!'hello' // true
```

### 三項演算子

if/elseの短縮形。単純な条件分岐を1行で書ける。

```javascript
const age = 20
const message = age >= 18 ? '成人' : '未成年'
// 条件 ? trueのときの値 : falseのときの値
```

### Nullish Coalescing（??）

`null`または`undefined`のときだけ右側の値を使う。ES2020で追加。

```javascript
const input = null
const value = input ?? 'デフォルト値'
console.log(value) // 'デフォルト値'

// || との違い
const count = 0
console.log(count || 10) // 10（0はfalsyなので右側になる）
console.log(count ?? 10) // 0（0はnullでもundefinedでもないので左側が採用）
```

`||`は `0`, `''`, `false` もfalsyとして扱うため、意図しない動作になることがある。`??`の方が安全。

### Optional Chaining（?.）

プロパティが存在しない場合にエラーにならず`undefined`を返す。ES2020で追加。

```javascript
const user = {
  name: '太郎',
  address: {
    city: '東京',
  },
}

// Optional Chainingなし: エラーになる可能性
// const zip = user.address.zipCode.toString(); // エラー!

// Optional Chainingあり: 安全にアクセス
const zip = user.address?.zipCode?.toString() // undefined（エラーにならない）

// メソッド呼び出しにも使える
const result = user.greet?.() // greetメソッドが存在しなければundefined
```

## 条件分岐

### if / else

```javascript
const score = 85

if (score >= 90) {
  console.log('優秀')
} else if (score >= 70) {
  console.log('良好')
} else if (score >= 50) {
  console.log('合格')
} else {
  console.log('不合格')
}
```

### switch

特定の値に対して分岐する場合に使う。`break`を忘れると、次のcaseも実行される（フォールスルー）ので注意。

```javascript
const day = 'Monday'

switch (day) {
  case 'Monday':
  case 'Tuesday':
  case 'Wednesday':
  case 'Thursday':
  case 'Friday':
    console.log('平日')
    break
  case 'Saturday':
  case 'Sunday':
    console.log('休日')
    break
  default:
    console.log('無効な曜日')
}
```

### 三項演算子（実用例）

```javascript
// React等のUIライブラリで頻出
const isLoggedIn = true
const greeting = isLoggedIn ? 'ようこそ!' : 'ログインしてください'

// ネストは避ける（読みにくくなる）
// NG: const result = a ? b ? 'X' : 'Y' : 'Z';
// OK: if/elseを使う
```

## ループ

### for文

```javascript
// 基本的なfor文
for (let i = 0; i < 5; i++) {
  console.log(i) // 0, 1, 2, 3, 4
}
```

### for...of（配列の要素を順番に取り出す）

```javascript
const fruits = ['りんご', 'バナナ', 'みかん']

for (const fruit of fruits) {
  console.log(fruit)
}
// りんご
// バナナ
// みかん
```

### for...in（オブジェクトのキーを順番に取り出す）

```javascript
const person = { name: '太郎', age: 25, city: '東京' }

for (const key in person) {
  console.log(`${key}: ${person[key]}`)
}
// name: 太郎
// age: 25
// city: 東京
```

**注意:** 配列に`for...in`を使うのは避ける。配列には`for...of`や`forEach`を使う。

### while

```javascript
let count = 0
while (count < 5) {
  console.log(count)
  count++
}
```

### forEach（配列メソッド）

```javascript
const numbers = [1, 2, 3, 4, 5]

numbers.forEach((num, index) => {
  console.log(`${index}: ${num}`)
})
```

### map（配列メソッド - 新しい配列を返す）

```javascript
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map((num) => num * 2)
console.log(doubled) // [2, 4, 6, 8, 10]
```

### 使い分けの指針

| ループ   | 使い所                               | 返り値     |
| -------- | ------------------------------------ | ---------- |
| for      | インデックスが必要な場合、複雑な条件 | なし       |
| for...of | 配列の要素を順番に処理               | なし       |
| for...in | オブジェクトのキーを列挙             | なし       |
| while    | 条件が変化するまで繰り返す           | なし       |
| forEach  | 配列の各要素に処理を適用             | undefined  |
| map      | 配列を変換して新しい配列を作る       | 新しい配列 |

**実務では `map`, `filter`, `forEach` 等の配列メソッドを使う場面が多い。** for文は特殊な場合にのみ使用する。

## 関数

### function宣言

```javascript
function greet(name) {
  return `こんにちは、${name}さん!`
}

console.log(greet('太郎')) // こんにちは、太郎さん!
```

### アロー関数（ES2015）

現代のJavaScriptで最も使われる関数の書き方。

```javascript
// 基本形
const greet = (name) => {
  return `こんにちは、${name}さん!`
}

// 1行で返す場合はreturnと{}を省略可能
const greet = (name) => `こんにちは、${name}さん!`

// 引数が1つの場合は()を省略可能
const double = (num) => num * 2

// 引数がない場合
const getTimestamp = () => Date.now()
```

### function宣言 vs アロー関数

| 特徴       | function宣言                 | アロー関数                 |
| ---------- | ---------------------------- | -------------------------- |
| thisの束縛 | 呼び出し元に依存             | 定義時のthisを保持         |
| 巻き上げ   | あり（宣言前に呼べる）       | なし                       |
| 簡潔さ     | 長め                         | 短め                       |
| 用途       | メソッド定義、コンストラクタ | コールバック、一般的な関数 |

```javascript
// 巻き上げの違い
greetA('太郎') // OK: function宣言は巻き上げられる
// greetB('太郎'); // エラー: アロー関数は巻き上げられない

function greetA(name) {
  return `こんにちは、${name}`
}

const greetB = (name) => `こんにちは、${name}`
```

### デフォルト引数

```javascript
const greet = (name = 'ゲスト', greeting = 'こんにちは') => {
  return `${greeting}、${name}さん!`
}

greet() // こんにちは、ゲストさん!
greet('太郎') // こんにちは、太郎さん!
greet('太郎', 'おはよう') // おはよう、太郎さん!
```

### 残余引数（Rest Parameters）

```javascript
const sum = (...numbers) => {
  return numbers.reduce((total, num) => total + num, 0)
}

sum(1, 2, 3) // 6
sum(1, 2, 3, 4, 5) // 15
```

### コールバック関数

関数を別の関数に引数として渡すパターン。JavaScriptの核心的な概念。

```javascript
// setTimeoutはコールバック関数を受け取る
setTimeout(() => {
  console.log('3秒後に実行')
}, 3000)

// 配列メソッドもコールバック関数を受け取る
const numbers = [1, 2, 3, 4, 5]
const evens = numbers.filter((num) => num % 2 === 0)
console.log(evens) // [2, 4]

// 自分でコールバックを受け取る関数を作る
const executeWithLogging = (callback) => {
  console.log('処理開始')
  const result = callback()
  console.log('処理完了')
  return result
}

executeWithLogging(() => {
  console.log('メインの処理')
})
```

## オブジェクト

オブジェクトは「キーと値のペア」を格納するデータ構造。JavaScriptで最も重要なデータ型の1つ。

### オブジェクトリテラル

```javascript
const user = {
  name: '太郎',
  age: 25,
  email: 'taro@example.com',
  isActive: true,
  // メソッド（オブジェクト内の関数）
  greet() {
    return `こんにちは、${this.name}です`
  },
}
```

### プロパティアクセス

```javascript
// ドット記法（推奨）
console.log(user.name) // '太郎'

// ブラケット記法（キーが変数や特殊文字を含む場合）
console.log(user['name']) // '太郎'

const key = 'email'
console.log(user[key]) // 'taro@example.com'

// メソッドの呼び出し
console.log(user.greet()) // 'こんにちは、太郎です'
```

### 分割代入（Destructuring）

オブジェクトから値を取り出して変数に代入する簡潔な書き方。ES2015で追加。

```javascript
const user = { name: '太郎', age: 25, city: '東京' }

// 従来の書き方
const name = user.name
const age = user.age

// 分割代入（同じことを簡潔に書ける）
const { name, age, city } = user
console.log(name) // '太郎'
console.log(age) // 25

// 別名を付ける
const { name: userName, age: userAge } = user

// デフォルト値
const { name, country = '日本' } = user
console.log(country) // '日本'（userにcountryがないのでデフォルト値が使われる）

// ネストしたオブジェクトの分割代入
const response = {
  data: {
    user: { name: '太郎', age: 25 },
  },
}
const {
  data: {
    user: { name: deepName },
  },
} = response
console.log(deepName) // '太郎'
```

### スプレッド構文

```javascript
// オブジェクトのコピー
const original = { a: 1, b: 2 }
const copy = { ...original }

// オブジェクトのマージ
const defaults = { theme: 'light', lang: 'ja', debug: false }
const userConfig = { theme: 'dark', debug: true }
const config = { ...defaults, ...userConfig }
// { theme: 'dark', lang: 'ja', debug: true }
// 後のオブジェクトの値が優先される

// 特定のプロパティを除外してコピー
const { debug, ...configWithoutDebug } = config
// configWithoutDebug = { theme: 'dark', lang: 'ja' }
```

## 配列

配列は「順序付きのデータの集まり」を格納するデータ構造。

### 基本操作

```javascript
const fruits = ['りんご', 'バナナ', 'みかん']

// アクセス（インデックスは0から始まる）
console.log(fruits[0]) // 'りんご'
console.log(fruits[2]) // 'みかん'

// 長さ
console.log(fruits.length) // 3
```

### 配列の主要メソッド一覧

#### 要素の追加・削除

| メソッド  | 説明                 | 元の配列を変更するか   |
| --------- | -------------------- | ---------------------- |
| push()    | 末尾に追加           | する                   |
| pop()     | 末尾を削除して返す   | する                   |
| unshift() | 先頭に追加           | する                   |
| shift()   | 先頭を削除して返す   | する                   |
| splice()  | 指定位置で追加・削除 | する                   |
| slice()   | 指定範囲を切り出す   | しない（コピーを返す） |

```javascript
const arr = [1, 2, 3]

// 末尾に追加
arr.push(4) // [1, 2, 3, 4]

// 末尾を削除
arr.pop() // [1, 2, 3]、返り値は4

// 先頭に追加
arr.unshift(0) // [0, 1, 2, 3]

// 先頭を削除
arr.shift() // [1, 2, 3]、返り値は0

// splice: インデックス1から2つ削除
arr.splice(1, 2) // [1]、削除された[2, 3]が返る

// splice: インデックス1に'a', 'b'を挿入
arr.splice(1, 0, 'a', 'b') // [1, 'a', 'b']

// slice: インデックス0から2（2は含まない）を切り出し
const sliced = [1, 2, 3, 4, 5].slice(0, 2) // [1, 2]
```

#### 検索・判定

| メソッド    | 説明                               | 返り値            |
| ----------- | ---------------------------------- | ----------------- |
| find()      | 条件に合う最初の要素を返す         | 要素 or undefined |
| findIndex() | 条件に合う最初のインデックスを返す | 数値 or -1        |
| includes()  | 特定の値が含まれるか               | boolean           |
| indexOf()   | 特定の値のインデックスを返す       | 数値 or -1        |
| some()      | 1つでも条件を満たすか              | boolean           |
| every()     | 全て条件を満たすか                 | boolean           |

```javascript
const users = [
  { name: '太郎', age: 25 },
  { name: '花子', age: 30 },
  { name: '次郎', age: 20 },
]

// find: 条件に合う最初の要素
const found = users.find((user) => user.age >= 25)
console.log(found) // { name: '太郎', age: 25 }

// some: 1つでも条件を満たすか
const hasAdult = users.some((user) => user.age >= 20)
console.log(hasAdult) // true

// every: 全て条件を満たすか
const allAdults = users.every((user) => user.age >= 20)
console.log(allAdults) // true

// includes: 値が含まれるか
const colors = ['red', 'blue', 'green']
console.log(colors.includes('blue')) // true
```

#### 変換・加工

| メソッド  | 説明                       | 返り値     |
| --------- | -------------------------- | ---------- |
| map()     | 各要素を変換した新しい配列 | 新しい配列 |
| filter()  | 条件に合う要素だけの配列   | 新しい配列 |
| reduce()  | 配列を1つの値にまとめる    | 任意の値   |
| sort()    | 並べ替え                   | 元の配列   |
| flat()    | ネストした配列を平坦化     | 新しい配列 |
| flatMap() | mapしてからflatする        | 新しい配列 |

```javascript
const numbers = [1, 2, 3, 4, 5]

// map: 各要素を変換
const doubled = numbers.map((num) => num * 2)
console.log(doubled) // [2, 4, 6, 8, 10]

// filter: 条件に合う要素だけ抽出
const evens = numbers.filter((num) => num % 2 === 0)
console.log(evens) // [2, 4]

// reduce: 配列を1つの値にまとめる
const sum = numbers.reduce((total, num) => total + num, 0)
console.log(sum) // 15

// メソッドチェーン（組み合わせて使う）
const result = numbers
  .filter((num) => num % 2 !== 0) // 奇数だけ抽出: [1, 3, 5]
  .map((num) => num * 10) // 10倍: [10, 30, 50]
  .reduce((sum, num) => sum + num, 0) // 合計: 90

// sort: 並べ替え（注意: 元の配列を変更する）
const scores = [80, 95, 70, 60, 90]
scores.sort((a, b) => a - b) // 昇順: [60, 70, 80, 90, 95]
scores.sort((a, b) => b - a) // 降順: [95, 90, 80, 70, 60]
```

### reduceの理解（初心者が最もつまずきやすいメソッド）

`reduce`は配列を「畳み込む」メソッド。配列の全要素を使って1つの値を作る。

```javascript
// reduce(コールバック, 初期値)
// コールバック(蓄積値, 現在の要素, インデックス, 元の配列)

// 例: 合計を求める
;[1, 2, 3, 4, 5].reduce((accumulator, current) => {
  console.log(`蓄積値: ${accumulator}, 現在値: ${current}`)
  return accumulator + current
}, 0)
// 蓄積値: 0, 現在値: 1 → return 1
// 蓄積値: 1, 現在値: 2 → return 3
// 蓄積値: 3, 現在値: 3 → return 6
// 蓄積値: 6, 現在値: 4 → return 10
// 蓄積値: 10, 現在値: 5 → return 15
// 結果: 15

// 実用例: オブジェクトの配列から特定のプロパティだけを集計
const cart = [
  { item: 'りんご', price: 150 },
  { item: 'バナナ', price: 100 },
  { item: 'みかん', price: 80 },
]

const totalPrice = cart.reduce((sum, product) => sum + product.price, 0)
console.log(totalPrice) // 330

// 実用例: 出現回数をカウント
const colors = ['red', 'blue', 'red', 'green', 'blue', 'red']
const countMap = colors.reduce((acc, color) => {
  acc[color] = (acc[color] || 0) + 1
  return acc
}, {})
console.log(countMap) // { red: 3, blue: 2, green: 1 }
```

### 配列の分割代入

```javascript
const [first, second, ...rest] = [1, 2, 3, 4, 5]
console.log(first) // 1
console.log(second) // 2
console.log(rest) // [3, 4, 5]

// 値の入れ替え
let a = 1
let b = 2
;[a, b] = [b, a]
console.log(a) // 2
console.log(b) // 1
```

### スプレッド構文（配列）

```javascript
// 配列のコピー
const original = [1, 2, 3]
const copy = [...original]

// 配列の結合
const arr1 = [1, 2]
const arr2 = [3, 4]
const combined = [...arr1, ...arr2] // [1, 2, 3, 4]

// 配列の中に展開
const withExtra = [0, ...arr1, 5] // [0, 1, 2, 5]
```

## 文字列メソッド

```javascript
const str = '  Hello, World!  '

// 前後の空白を除去
str.trim() // 'Hello, World!'

// 含まれるか
str.includes('World') // true

// 始まるか / 終わるか
str.trim().startsWith('Hello') // true
str.trim().endsWith('!') // true

// 分割
'a,b,c'.split(',') // ['a', 'b', 'c']

// 置換
'Hello World'.replace('World', 'JavaScript') // 'Hello JavaScript'
'aaa'.replaceAll('a', 'b') // 'bbb'（ES2021）

// 大文字 / 小文字
'hello'.toUpperCase() // 'HELLO'
'HELLO'.toLowerCase() // 'hello'

// 部分文字列
'JavaScript'.substring(0, 4) // 'Java'
'JavaScript'.slice(-6) // 'Script'

// パディング
'5'.padStart(3, '0') // '005'
'5'.padEnd(3, '0') // '500'
```

### テンプレートリテラル

バッククォート（`` ` ``）で囲む文字列。変数の埋め込みと改行がそのまま書ける。

```javascript
const name = '太郎'
const age = 25

// 従来の文字列連結
const message1 = 'こんにちは、' + name + 'さん。年齢は' + age + '歳です。'

// テンプレートリテラル（推奨）
const message2 = `こんにちは、${name}さん。年齢は${age}歳です。`

// 式も埋め込める
const message3 = `来年は${age + 1}歳になります`

// 複数行
const html = `
  <div class="card">
    <h2>${name}</h2>
    <p>年齢: ${age}</p>
  </div>
`
```

## スコープとクロージャ

### スコープの種類

```javascript
// グローバルスコープ: どこからでもアクセス可能
const globalVar = 'グローバル'

function outer() {
  // 関数スコープ: この関数の中でのみアクセス可能
  const outerVar = '外側の関数'

  if (true) {
    // ブロックスコープ: このブロックの中でのみアクセス可能
    const blockVar = 'ブロック内'
    console.log(globalVar) // OK
    console.log(outerVar) // OK
    console.log(blockVar) // OK
  }

  console.log(globalVar) // OK
  console.log(outerVar) // OK
  // console.log(blockVar); // エラー: ブロックの外
}
```

### レキシカルスコープ

関数は**定義された場所**のスコープを参照する（呼び出された場所ではない）。

```javascript
const x = 10

function outer() {
  const x = 20

  function inner() {
    console.log(x) // 20（定義された場所のスコープ = outerのx）
  }

  inner()
}

outer()
```

### クロージャ

関数が、自身が定義されたスコープの変数を「覚えている」仕組み。

```javascript
function createCounter() {
  let count = 0 // この変数はcreateCounter実行後も保持される

  return {
    increment() {
      count++
      return count
    },
    decrement() {
      count--
      return count
    },
    getCount() {
      return count
    },
  }
}

const counter = createCounter()
console.log(counter.increment()) // 1
console.log(counter.increment()) // 2
console.log(counter.decrement()) // 1
console.log(counter.getCount()) // 1
// countに直接アクセスする方法はない（カプセル化）
```

クロージャの実用例:

```javascript
// イベントハンドラでの使用
function setupButton(buttonId) {
  let clickCount = 0

  document.getElementById(buttonId).addEventListener('click', () => {
    clickCount++ // クロージャでclickCountを保持
    console.log(`${clickCount}回クリックされました`)
  })
}
```

## this

`this`はJavaScriptで最も混乱しやすい概念の1つ。**呼び出し方によって`this`が指すものが変わる。**

### thisの値の決まり方

| 呼び出し方      | thisの値                       | 例                  |
| --------------- | ------------------------------ | ------------------- |
| グローバル      | windowオブジェクト（ブラウザ） | `console.log(this)` |
| メソッドとして  | そのオブジェクト               | `obj.method()`      |
| 関数として      | undefined（strictモード）      | `func()`            |
| アロー関数      | 定義時のthis                   | `() => this`        |
| new演算子       | 新しいインスタンス             | `new Constructor()` |
| bind/call/apply | 指定したオブジェクト           | `func.bind(obj)`    |

```javascript
const user = {
  name: '太郎',

  // メソッド内のthis → userオブジェクト
  greet() {
    console.log(`こんにちは、${this.name}`)
  },

  // アロー関数のthis → 定義時のthis（この場合グローバル）
  greetArrow: () => {
    console.log(`こんにちは、${this.name}`) // thisはuserではない
  },

  // setTimeoutでのよくある問題と解決
  delayedGreet() {
    // NG: function式のthisはsetTimeoutの呼び出し元になる
    // setTimeout(function() {
    //   console.log(this.name); // undefined
    // }, 1000);

    // OK: アロー関数はdelayedGreetのthisを保持
    setTimeout(() => {
      console.log(this.name) // '太郎'
    }, 1000)
  },
}
```

### bind / call / apply

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}、${this.name}${punctuation}`)
}

const user = { name: '太郎' }

// call: thisを指定して即座に実行（引数をカンマ区切り）
greet.call(user, 'こんにちは', '!') // こんにちは、太郎!

// apply: thisを指定して即座に実行（引数を配列で渡す）
greet.apply(user, ['こんにちは', '!']) // こんにちは、太郎!

// bind: thisを束縛した新しい関数を返す（即座には実行しない）
const greetUser = greet.bind(user)
greetUser('こんにちは', '!') // こんにちは、太郎!
```

**実務での指針:** アロー関数を使えば`this`の問題はほとんど解決できる。メソッド定義には通常の関数を、コールバックにはアロー関数を使うのが安全。

## 非同期処理

JavaScriptはシングルスレッド（1つの処理を1つずつ実行する）だが、非同期処理により「待ち時間のある処理」を効率的に扱える。

### なぜ非同期処理が必要か

サーバーへのデータ取得に3秒かかる場合、その間画面がフリーズしては困る。非同期処理を使えば、データ取得中も画面操作を続けられる。

### 進化の歴史

```
コールバック（古い） → Promise（ES2015） → async/await（ES2017、現在の主流）
```

### コールバック（古い方式）

```javascript
// コールバック地獄（Callback Hell）の例
getUser(userId, (user) => {
  getOrders(user.id, (orders) => {
    getOrderDetails(orders[0].id, (details) => {
      getShippingInfo(details.shippingId, (shipping) => {
        console.log(shipping)
        // ネストが深くなりすぎて読めない...
      })
    })
  })
})
```

### Promise

非同期処理の結果を「約束」するオブジェクト。成功（resolve）か失敗（reject）のどちらかになる。

```javascript
// Promiseの作成
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = true
      if (success) {
        resolve({ data: 'サーバーからのデータ' })
      } else {
        reject(new Error('データ取得に失敗'))
      }
    }, 1000)
  })
}

// Promiseの使用
fetchData()
  .then((result) => {
    console.log(result.data) // 'サーバーからのデータ'
  })
  .catch((error) => {
    console.error(error.message)
  })
  .finally(() => {
    console.log('処理完了')
  })
```

### async/await（現在の主流）

Promiseをより直感的に書けるようにした構文糖（シンタックスシュガー）。

```javascript
// asyncを付けた関数はPromiseを返す
const fetchUserData = async (userId) => {
  try {
    // awaitでPromiseの解決を待つ
    const response = await fetch(`/api/users/${userId}`)

    // レスポンスが正常でない場合
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
    }

    const user = await response.json()
    return user
  } catch (error) {
    console.error('データ取得エラー:', error.message)
    throw error // エラーを再throw
  }
}

// 使用例
const displayUser = async () => {
  try {
    const user = await fetchUserData(1)
    console.log(user.name)
  } catch (error) {
    console.error('表示エラー:', error)
  }
}

displayUser()
```

### 並列実行

```javascript
// 複数の非同期処理を並列に実行
const fetchAllData = async () => {
  try {
    // Promise.all: 全てが完了するまで待つ
    const [users, posts, comments] = await Promise.all([
      fetch('/api/users').then((r) => r.json()),
      fetch('/api/posts').then((r) => r.json()),
      fetch('/api/comments').then((r) => r.json()),
    ])

    console.log({ users, posts, comments })
  } catch (error) {
    // どれか1つでも失敗したらここに来る
    console.error('エラー:', error)
  }
}
```

### 非同期処理の使い分け

| メソッド             | 説明                           | 使い所                 |
| -------------------- | ------------------------------ | ---------------------- |
| Promise.all()        | 全て成功したら結果を返す       | 全て必要なデータ取得   |
| Promise.allSettled() | 全て完了（成功・失敗問わず）   | 結果に関わらず全て待つ |
| Promise.race()       | 最初に完了したものの結果を返す | タイムアウト実装       |
| Promise.any()        | 最初に成功したものの結果を返す | 複数のバックアップURL  |

## エラーハンドリング

### try / catch / finally

```javascript
const parseJSON = (jsonString) => {
  try {
    const data = JSON.parse(jsonString)
    return data
  } catch (error) {
    // JSONのパースに失敗した場合
    console.error('JSONパースエラー:', error.message)
    return null
  } finally {
    // 成功しても失敗しても必ず実行される
    console.log('パース処理完了')
  }
}

parseJSON('{"name": "太郎"}') // { name: '太郎' }
parseJSON('invalid json') // null + エラーログ
```

### カスタムエラー

```javascript
class ValidationError extends Error {
  constructor(message, field) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

const validateAge = (age) => {
  if (typeof age !== 'number') {
    throw new ValidationError('年齢は数値で入力してください', 'age')
  }
  if (age < 0 || age > 150) {
    throw new ValidationError('年齢は0から150の間で入力してください', 'age')
  }
  return true
}

try {
  validateAge('twenty')
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`${error.field}: ${error.message}`)
  } else {
    throw error // 想定外のエラーは再throw
  }
}
```

## モジュール（import / export）

コードを複数のファイルに分割し、必要な部分だけを読み込む仕組み。

### 名前付きエクスポート / インポート

```javascript
// math.js
export const add = (a, b) => a + b
export const subtract = (a, b) => a - b
export const PI = 3.14159

// main.js
import { add, subtract, PI } from './math.js'
console.log(add(2, 3)) // 5
```

### デフォルトエクスポート / インポート

```javascript
// User.js（1ファイル1つのメインの機能をエクスポート）
export default class User {
  constructor(name) {
    this.name = name
  }
}

// main.js（好きな名前でインポートできる）
import User from './User.js'
const user = new User('太郎')
```

### 名前付きとデフォルトの使い分け

| 種類           | 1ファイルから | インポート名 | 使い所                         |
| -------------- | ------------- | ------------ | ------------------------------ |
| 名前付きexport | 複数可能      | 固定         | ユーティリティ関数、定数       |
| default export | 1つだけ       | 自由         | メインのクラスやコンポーネント |

```javascript
// 混在も可能
// api.js
export const BASE_URL = 'https://api.example.com'
export const fetchData = async (path) => {
  /* ... */
}
export default class ApiClient {
  /* ... */
}

// main.js
import ApiClient, { BASE_URL, fetchData } from './api.js'
```

## クラス（class）

ES2015で追加されたクラス構文。JavaScriptのプロトタイプベースの継承を、他の言語に馴染みのある書き方で扱えるようにした構文糖（シンタックスシュガー）。

### 基本的なクラス定義

```javascript
class User {
  // コンストラクタ（インスタンス生成時に呼ばれる）
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  // メソッド
  greet() {
    return `こんにちは、${this.name}です（${this.age}歳）`
  }

  // 静的メソッド（インスタンスではなくクラス自体から呼ぶ）
  static create(name, age) {
    return new User(name, age)
  }
}

const user = new User('太郎', 25)
console.log(user.greet()) // こんにちは、太郎です（25歳）

const user2 = User.create('花子', 30)
```

### 継承

```javascript
class Admin extends User {
  constructor(name, age, role) {
    super(name, age) // 親クラスのコンストラクタを呼ぶ
    this.role = role
  }

  greet() {
    return `${super.greet()} [${this.role}]`
  }
}

const admin = new Admin('管理者', 35, 'admin')
console.log(admin.greet()) // こんにちは、管理者です（35歳） [admin]
```

**実務での使い所:** React等のフレームワークではクラスコンポーネントとして使われてきたが、現在は関数コンポーネント+Hooksが主流。ただし、カスタムエラークラスやライブラリのAPI設計ではクラスが今でも活躍している。

## ES2015+の重要機能まとめ

ES2015（ES6）以降に追加された、実務で必須の機能一覧。

| 機能                 | 導入時期 | 概要                                       |
| -------------------- | -------- | ------------------------------------------ |
| let / const          | ES2015   | ブロックスコープの変数宣言                 |
| アロー関数           | ES2015   | 簡潔な関数構文 + thisの束縛                |
| テンプレートリテラル | ES2015   | バッククォートによる文字列埋め込み         |
| 分割代入             | ES2015   | オブジェクト・配列からの値の取り出し       |
| スプレッド構文       | ES2015   | 展開演算子 `...`                           |
| Promise              | ES2015   | 非同期処理の管理                           |
| class                | ES2015   | クラス構文（プロトタイプベースの糖衣構文） |
| Map / Set            | ES2015   | 新しいコレクション型                       |
| Symbol               | ES2015   | 一意の識別子                               |
| for...of             | ES2015   | イテラブルのループ                         |
| import / export      | ES2015   | モジュールシステム                         |
| async / await        | ES2017   | Promiseの簡潔な書き方                      |
| Optional Chaining    | ES2020   | `?.` 安全なプロパティアクセス              |
| Nullish Coalescing   | ES2020   | `??` null/undefinedのデフォルト値          |
| replaceAll           | ES2021   | 全置換                                     |
| Object.hasOwn()      | ES2022   | プロパティの存在チェック                   |
| Array.at()           | ES2022   | 負のインデックスでのアクセス               |

### Map / Set

```javascript
// Map: キーに任意の型が使えるオブジェクト
const userRoles = new Map()
userRoles.set('太郎', 'admin')
userRoles.set('花子', 'editor')
console.log(userRoles.get('太郎')) // 'admin'
console.log(userRoles.has('次郎')) // false
console.log(userRoles.size) // 2

// Set: 重複しない値の集合
const uniqueNumbers = new Set([1, 2, 2, 3, 3, 3])
console.log(uniqueNumbers) // Set {1, 2, 3}

// 配列の重複を除去するパターン（実務で頻出）
const arr = [1, 2, 2, 3, 3, 3]
const unique = [...new Set(arr)]
console.log(unique) // [1, 2, 3]
```

## JSON

JSON（JavaScript Object Notation）はデータ交換のための軽量なフォーマット。APIのレスポンスやデータの保存に広く使われている。

```javascript
// JavaScriptオブジェクト → JSON文字列
const user = { name: '太郎', age: 25, isActive: true }
const jsonString = JSON.stringify(user)
console.log(jsonString) // '{"name":"太郎","age":25,"isActive":true}'

// 整形して出力（デバッグ時に便利）
console.log(JSON.stringify(user, null, 2))
// {
//   "name": "太郎",
//   "age": 25,
//   "isActive": true
// }

// JSON文字列 → JavaScriptオブジェクト
const parsed = JSON.parse(jsonString)
console.log(parsed.name) // '太郎'
```

**JSONの注意点:**

- キーは必ず二重引用符で囲む（シングルクォートは不可）
- 末尾のカンマ（trailing comma）は不可
- コメントは書けない
- `undefined`、関数、`Symbol`は含められない

## 実務でよく書くパターン集

### APIからデータを取得して表示

```javascript
const fetchAndDisplay = async () => {
  try {
    const response = await fetch('https://api.example.com/users')
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
    }
    const users = await response.json()

    const html = users.map((user) => `<li>${user.name} (${user.email})</li>`).join('')

    document.getElementById('user-list').innerHTML = `<ul>${html}</ul>`
  } catch (error) {
    document.getElementById('user-list').innerHTML = '<p>データの取得に失敗しました</p>'
    console.error(error)
  }
}
```

### フォームの値を取得してバリデーション

```javascript
const form = document.getElementById('signup-form')

form.addEventListener('submit', (event) => {
  event.preventDefault() // フォームのデフォルト送信を防ぐ

  const formData = new FormData(form)
  const data = {
    name: formData.get('name')?.trim(),
    email: formData.get('email')?.trim(),
    age: Number(formData.get('age')),
  }

  // バリデーション
  const errors = []
  if (!data.name) errors.push('名前は必須です')
  if (!data.email?.includes('@')) errors.push('メールアドレスが無効です')
  if (data.age < 0 || data.age > 150) errors.push('年齢が不正です')

  if (errors.length > 0) {
    alert(errors.join('\n'))
    return
  }

  console.log('送信データ:', data)
})
```

### 配列データの加工（実務で最も多いパターン）

```javascript
const products = [
  { id: 1, name: 'りんご', price: 150, category: '果物', inStock: true },
  { id: 2, name: 'キャベツ', price: 200, category: '野菜', inStock: true },
  { id: 3, name: 'バナナ', price: 100, category: '果物', inStock: false },
  { id: 4, name: 'トマト', price: 180, category: '野菜', inStock: true },
]

// 在庫ありの果物だけ抽出し、名前だけの配列にする
const availableFruits = products
  .filter((p) => p.category === '果物' && p.inStock)
  .map((p) => p.name)
// ['りんご']

// カテゴリごとにグループ化
const grouped = products.reduce((acc, product) => {
  const key = product.category
  if (!acc[key]) acc[key] = []
  acc[key].push(product)
  return acc
}, {})
// { '果物': [...], '野菜': [...] }

// 在庫ありの商品の合計金額
const totalPrice = products.filter((p) => p.inStock).reduce((sum, p) => sum + p.price, 0)
// 530
```

### LocalStorageを使ったデータの永続化

```javascript
// 保存
const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data))
}

// 読み込み
const loadData = (key) => {
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null
}

// 使用例
saveData('user-settings', { theme: 'dark', lang: 'ja' })
const settings = loadData('user-settings')
console.log(settings) // { theme: 'dark', lang: 'ja' }
```

### デバウンス（入力中に毎回実行しない）

```javascript
const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// 使用例: 検索入力
const searchInput = document.getElementById('search')
const handleSearch = debounce((event) => {
  console.log('検索:', event.target.value)
  // ここでAPIを呼ぶ
}, 300)

searchInput.addEventListener('input', handleSearch)
```

## DOM操作について

この記事のコード例では`document.getElementById`や`addEventListener`といったDOM（Document Object Model）操作が登場する。DOMはJavaScriptからHTMLの要素を操作するための仕組みで、フロントエンド開発の核心的な技術の1つ。

DOM操作の詳細はロードマップの別記事で解説しているため、そちらを参照してほしい。

## デバッグ方法

### console系メソッド

```javascript
// 基本的なログ
console.log('値:', variable)

// 表形式で表示（配列やオブジェクトの一覧に便利）
const users = [
  { name: '太郎', age: 25 },
  { name: '花子', age: 30 },
]
console.table(users)

// 警告（黄色で表示）
console.warn('注意: この機能は非推奨です')

// エラー（赤色で表示）
console.error('エラーが発生しました')

// グルーピング
console.group('ユーザー処理')
console.log('取得開始')
console.log('取得完了')
console.groupEnd()

// 処理時間の計測
console.time('fetchData')
await fetchData()
console.timeEnd('fetchData') // fetchData: 234ms

// オブジェクトのプロパティを一覧表示
console.dir(document.body)
```

### debugger文

コードの中に`debugger`と書くと、DevToolsが開いている状態でそこで実行が一時停止する。

```javascript
const calculateTotal = (items) => {
  debugger // ここで止まる（DevToolsで変数の値を確認できる）
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

### ブラウザDevTools

1. **Console**: `console.log`の出力やエラーを確認
2. **Elements**: HTMLとCSSをリアルタイムで確認・編集
3. **Sources**: ブレークポイントを設定してステップ実行
4. **Network**: APIリクエストの内容とレスポンスを確認
5. **Application**: LocalStorage、Cookie等のデータを確認

**DevToolsの開き方:**

- Windows/Linux: `F12` または `Ctrl + Shift + I`
- Mac: `Cmd + Option + I`

## 参考リンク

- [MDN Web Docs - JavaScript](https://developer.mozilla.org/ja/docs/Web/JavaScript) - JavaScriptの公式リファレンス。最も信頼できる情報源
- [MDN - JavaScript入門](https://developer.mozilla.org/ja/docs/Learn/JavaScript/First_steps) - 初心者向けの入門チュートリアル
- [MDN - 非同期JavaScript](https://developer.mozilla.org/ja/docs/Learn/JavaScript/Asynchronous) - 非同期処理の学習ガイド
- [JavaScript.info](https://ja.javascript.info/) - 体系的に学べるオンライン教科書（日本語版あり）
- [ES2015+チートシート](https://devhints.io/es6) - ES2015以降の構文を素早く確認（英語）
- [JavaScript配列メソッドの選び方](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array) - MDNの配列メソッド一覧
- [Can I Use](https://caniuse.com/) - JavaScriptのブラウザ対応状況の確認
