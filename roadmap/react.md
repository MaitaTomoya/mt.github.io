---
title: 'React'
order: 10
section: 'スタイリングとフレームワーク'
---

# React

## Reactとは何か

Reactは**ユーザーインターフェース（UI）を構築するためのJavaScriptライブラリ**。2013年にFacebook（現Meta）が開発・公開した。「フレームワーク」と呼ばれることもあるが、正確にはUIの描画に特化した「ライブラリ」。ルーティングや状態管理などは別のライブラリを組み合わせて使う。

たとえるなら、Reactは「レゴブロック」のような存在。小さなブロック（コンポーネント）を組み合わせてページ全体を構築する。ボタン、ヘッダー、カード、フォームといった部品を個別に作り、それらを組み合わせて完成品にする。

### Reactの3つの核心的な特徴

| 特徴                 | 説明                                                            | たとえ                                                 |
| -------------------- | --------------------------------------------------------------- | ------------------------------------------------------ |
| コンポーネントベース | UIを再利用可能な部品に分割する                                  | レゴブロックの組み合わせ                               |
| 宣言的UI             | 「こう表示したい」と書くだけで、Reactが最適な方法で更新する     | 料理の完成写真を見せれば作ってくれるシェフ             |
| 仮想DOM              | 実際のDOMとは別の軽量なコピーを使い、差分だけを効率的に更新する | 書類全体を書き直すのではなく、変わった箇所だけ修正する |

---

## なぜReactが人気なのか

### 仮想DOM（Virtual DOM）

通常のDOM操作は重い処理。ページ上の要素が1つ変わっただけでも、ブラウザは多くの再計算を行う。

Reactは「仮想DOM」というJavaScriptオブジェクトのツリーをメモリ上に保持する。状態が変わった時、まず仮想DOMを更新し、前回の仮想DOMとの差分を計算して、**変更があった部分だけ**実際のDOMに反映する。

```
状態変更
  ↓
新しい仮想DOMを作成
  ↓
前回の仮想DOMと比較（差分検出 = Reconciliation）
  ↓
差分だけを実際のDOMに反映
```

これにより、開発者は「今の状態からどう変えればいいか」を考える必要がなく、「このデータの時はこう表示したい」と宣言するだけでよい。

### 宣言的UI

従来のjQuery的アプローチ（命令的）:

```javascript
// jQuery: 「こうしろ」と手順を指示する
$('#counter').text('0')
$('#increment').click(function () {
  const current = parseInt($('#counter').text())
  $('#counter').text(current + 1)
})
```

React的アプローチ（宣言的）:

```jsx
// React: 「こうなってほしい」と結果を宣言する
function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}
```

宣言的UIの方が「今の状態に対してUIがどう見えるか」が明確で、バグが起きにくい。

### 巨大なエコシステム

Reactは単体のライブラリだが、周辺のエコシステムが非常に充実している。

| カテゴリ       | 主なライブラリ                  | 用途                  |
| -------------- | ------------------------------- | --------------------- |
| フレームワーク | Next.js, Remix                  | SSR/SSG、ルーティング |
| 状態管理       | Redux, Zustand, Jotai           | グローバル状態の管理  |
| スタイリング   | Tailwind CSS, styled-components | CSSの適用             |
| フォーム       | React Hook Form, Formik         | フォーム処理          |
| データ取得     | TanStack Query, SWR             | API通信とキャッシュ   |
| テスト         | Vitest, Testing Library         | コンポーネントテスト  |
| UIライブラリ   | shadcn/ui, MUI, Chakra UI       | 既成コンポーネント    |
| アニメーション | Framer Motion, React Spring     | アニメーション        |

---

## 環境構築

### Vite（推奨）

現在のReact開発環境の構築には**Vite**が最も推奨されている。高速なHMR（Hot Module Replacement）と軽量なビルドが特徴。

```bash
# Viteでプロジェクトを作成
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app
npm install
npm run dev
```

上記のコマンドを実行すると、以下のようなフォルダ構成が生成される:

```
my-react-app/
├── public/
│   └── vite.svg
├── src/
│   ├── App.tsx          # メインのコンポーネント
│   ├── App.css          # Appのスタイル
│   ├── main.tsx         # エントリーポイント
│   ├── index.css        # グローバルスタイル
│   └── vite-env.d.ts    # Viteの型定義
├── index.html           # HTMLテンプレート
├── package.json         # 依存関係
├── tsconfig.json        # TypeScript設定
└── vite.config.ts       # Vite設定
```

### create-react-app（非推奨）

以前はReactの公式推奨だった`create-react-app`（CRA）は、2023年以降メンテナンスがほぼ停止しており、新規プロジェクトでの使用は推奨されない。ビルド速度もViteに比べて遅い。

```bash
# これは古い方法なので、新規プロジェクトでは使わないこと
npx create-react-app my-app --template typescript
```

### Next.js

本格的なWebアプリケーションを開発する場合は**Next.js**が推奨される。Reactをベースにしたフルスタックフレームワーク。

```bash
npx create-next-app@latest my-next-app --typescript --tailwind --app
cd my-next-app
npm run dev
```

### 環境構築の選び方

| 選択肢       | 適した場面                   | 特徴                |
| ------------ | ---------------------------- | ------------------- |
| Vite + React | SPAの開発、学習用            | 高速、シンプル      |
| Next.js      | 本格的なWebアプリ、SEOが重要 | SSR/SSG、API Routes |
| Remix        | フォームが多いアプリ         | Web標準準拠         |

---

## JSXの基本

JSX（JavaScript XML）はReact独自の構文で、JavaScript内にHTMLのような記述ができる。ブラウザはJSXを直接理解できないため、ビルド時に通常のJavaScriptに変換される。

### JSXの基本ルール

```jsx
function App() {
  return (
    // ルール1: 必ず1つのルート要素で囲む
    <div>
      <h1>タイトル</h1>
      <p>本文</p>
    </div>
  )
}

// ルート要素を増やしたくない場合はフラグメントを使う
function App() {
  return (
    <>
      <h1>タイトル</h1>
      <p>本文</p>
    </>
  )
}
```

`<>...</>` はフラグメント（Fragment）と呼ばれ、余分なDOMノードを作らずに複数の要素をまとめられる。

### 式の埋め込み

JSXの中で`{}`（波括弧）を使うと、JavaScriptの式を埋め込める。

```jsx
function Greeting() {
  const name = '太郎'
  const age = 25
  const isAdmin = true
  const skills = ['React', 'TypeScript', 'Node.js']

  return (
    <div>
      {/* 変数の表示 */}
      <h1>こんにちは、{name}さん</h1>

      {/* 計算式 */}
      <p>来年は{age + 1}歳です</p>

      {/* 関数呼び出し */}
      <p>名前の文字数: {name.length}</p>

      {/* テンプレートリテラル */}
      <p>{`${name}さんは${age}歳です`}</p>

      {/* 配列のmap */}
      <ul>
        {skills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    </div>
  )
}
```

### 条件分岐

```jsx
function UserStatus({ isLoggedIn, isAdmin, notifications }) {
  return (
    <div>
      {/* 方法1: && 演算子（条件がtrueの時だけ表示） */}
      {isLoggedIn && <p>ログイン中です</p>}

      {/* 方法2: 三項演算子（条件で表示を切り替え） */}
      {isLoggedIn ? <button>ログアウト</button> : <button>ログイン</button>}

      {/* 方法3: 複雑な条件は変数に抽出 */}
      {isAdmin && isLoggedIn && <div>管理者メニュー</div>}

      {/* 注意: 数値の0はfalsy値だが画面に表示される */}
      {notifications > 0 && <span>通知: {notifications}件</span>}
      {/* ↑ notificationsが0の場合、"0"が画面に表示されてしまう */}

      {/* 安全な書き方 */}
      {notifications > 0 ? <span>通知: {notifications}件</span> : null}
    </div>
  )
}
```

### リスト表示

```jsx
function TodoList() {
  const todos = [
    { id: 1, text: '買い物', done: false },
    { id: 2, text: '掃除', done: true },
    { id: 3, text: '勉強', done: false },
  ]

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id} style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
          {todo.text}
        </li>
      ))}
    </ul>
  )
}
```

### JSXで注意すべき点

| HTMLの書き方         | JSXでの書き方              | 理由                           |
| -------------------- | -------------------------- | ------------------------------ |
| `class="..."`        | `className="..."`          | `class`はJavaScriptの予約語    |
| `for="..."`          | `htmlFor="..."`            | `for`はJavaScriptの予約語      |
| `style="color: red"` | `style={{ color: 'red' }}` | オブジェクトで指定             |
| `onclick="..."`      | `onClick={...}`            | キャメルケースで書く           |
| `tabindex="0"`       | `tabIndex={0}`             | キャメルケース、数値はそのまま |
| `<!-- コメント -->`  | `{/* コメント */}`         | JSXのコメント構文              |

---

## コンポーネント

### 関数コンポーネント

Reactのコンポーネントは「UIの部品」。関数として定義し、JSXを返す。

```tsx
// 最もシンプルなコンポーネント（関数宣言）
function Welcome() {
  return <h1>ようこそ!</h1>
}

// アロー関数でも書ける（どちらでもOK、チームの規約に従う）
const Greeting = () => {
  return <h1>ようこそ!</h1>
}

// 使い方
function App() {
  return (
    <div>
      <Welcome />
      <Welcome /> {/* 何回でも再利用できる */}
    </div>
  )
}
```

コンポーネント名は**必ず大文字で始める**。小文字だとHTMLタグとして解釈されてしまう。

### Props（プロパティ）

Propsはコンポーネントに外部からデータを渡す仕組み。親コンポーネントから子コンポーネントに値を渡す。

```tsx
// TypeScriptで型を定義
type UserCardProps = {
  name: string
  age: number
  role?: string // ?をつけるとオプション（渡さなくてもOK）
}

function UserCard({ name, age, role = 'メンバー' }: UserCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-lg font-bold">{name}</h2>
      <p>年齢: {age}</p>
      <p>役職: {role}</p>
    </div>
  )
}

// 使い方
function App() {
  return (
    <div>
      <UserCard name="田中太郎" age={25} role="エンジニア" />
      <UserCard name="山田花子" age={30} /> {/* roleは省略可能 */}
    </div>
  )
}
```

**Propsの重要なルール: Propsは読み取り専用（Read Only）**。子コンポーネントの中でPropsを変更してはいけない。

```tsx
// NG: Propsを変更しようとしてはいけない
function BadComponent({ name }: { name: string }) {
  name = '別の名前' // これはやってはいけない
  return <p>{name}</p>
}
```

### children

`children`は特別なPropsで、コンポーネントの開始タグと終了タグの間に書いた内容が自動的に渡される。

```tsx
type CardProps = {
  title: string
  children: React.ReactNode // childrenの型
}

function Card({ title, children }: CardProps) {
  return (
    <div className="border rounded-lg shadow-md">
      <div className="border-b px-4 py-3">
        <h2 className="font-bold">{title}</h2>
      </div>
      <div className="p-4">
        {children} {/* ここに中身が入る */}
      </div>
    </div>
  )
}

// 使い方
function App() {
  return (
    <Card title="お知らせ">
      <p>明日はメンテナンスのためサービスを停止します。</p>
      <p>ご不便をおかけしますが、よろしくお願いいたします。</p>
    </Card>
  )
}
```

`children`を使うことで、柔軟なレイアウトコンポーネントを作れる。

---

## useState

`useState`はReactで**状態（state）を管理するためのHook**。状態が変わるとコンポーネントが再描画（リレンダリング）される。

### 基本的な使い方

```tsx
import { useState } from 'react'

function Counter() {
  // const [状態変数, 更新関数] = useState(初期値);
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>リセット</button>
    </div>
  )
}
```

### 様々な型の状態

```tsx
function FormExample() {
  // 文字列
  const [name, setName] = useState('')

  // 真偽値
  const [isVisible, setIsVisible] = useState(false)

  // 数値
  const [count, setCount] = useState(0)

  // 配列
  const [items, setItems] = useState<string[]>([])

  // オブジェクト
  const [user, setUser] = useState({ name: '', email: '' })

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="名前を入力" />
      <button onClick={() => setIsVisible(!isVisible)}>{isVisible ? '隠す' : '表示'}</button>
    </div>
  )
}
```

### 配列・オブジェクトの更新注意点

Reactの状態更新では**イミュータブル（不変）な更新**が必要。元の配列やオブジェクトを直接変更してはいけない。

```tsx
function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: '買い物', done: false },
    { id: 2, text: '掃除', done: false },
  ])

  // --- 配列の操作 ---

  // 追加（スプレッド構文で新しい配列を作る）
  const addTodo = (text: string) => {
    const newTodo = { id: Date.now(), text, done: false }
    setTodos([...todos, newTodo]) // 元の配列 + 新しい要素
  }

  // 削除（filterで新しい配列を作る）
  const removeTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  // 更新（mapで新しい配列を作る）
  const toggleTodo = (id: number) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }

  // --- やってはいけない例 ---
  // NG: 直接変更してもReactは変更を検知できない
  // todos.push(newTodo);        // 配列を直接変更
  // todos[0].done = true;       // オブジェクトを直接変更
  // setTodos(todos);            // 同じ参照なので再描画されない

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>{todo.text}</span>
          <button onClick={() => toggleTodo(todo.id)}>完了切替</button>
          <button onClick={() => removeTodo(todo.id)}>削除</button>
        </li>
      ))}
    </ul>
  )
}
```

### オブジェクトの更新

```tsx
function ProfileForm() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    address: {
      city: '',
      zipCode: '',
    },
  })

  // 浅いプロパティの更新
  const updateName = (name: string) => {
    setProfile({ ...profile, name }) // スプレッドで展開して上書き
  }

  // ネストしたオブジェクトの更新
  const updateCity = (city: string) => {
    setProfile({
      ...profile,
      address: {
        ...profile.address, // addressも展開する必要がある
        city,
      },
    })
  }

  return (
    <form>
      <input value={profile.name} onChange={(e) => updateName(e.target.value)} placeholder="名前" />
      <input
        value={profile.email}
        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        placeholder="メールアドレス"
      />
      <input
        value={profile.address.city}
        onChange={(e) => updateCity(e.target.value)}
        placeholder="市区町村"
      />
    </form>
  )
}
```

### 関数型更新

前の状態に基づいて更新する場合は、関数型更新を使うとより安全。

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  const incrementThree = () => {
    // NG: countは同じ値を参照するため、1しか増えない
    // setCount(count + 1);
    // setCount(count + 1);
    // setCount(count + 1);

    // OK: 関数型更新なら前の値を参照するため、3増える
    setCount((prev) => prev + 1)
    setCount((prev) => prev + 1)
    setCount((prev) => prev + 1)
  }

  return (
    <div>
      <p>{count}</p>
      <button onClick={incrementThree}>+3</button>
    </div>
  )
}
```

---

## useEffect

`useEffect`は**副作用（side effect）を実行するためのHook**。副作用とは、コンポーネントの描画以外の処理のこと。たとえばAPIからのデータ取得、タイマーの設定、DOMの直接操作、外部サービスとの通信などが該当する。

### 基本構文

```tsx
import { useEffect } from 'react'

useEffect(() => {
  // ここに副作用の処理を書く

  return () => {
    // クリーンアップ関数（オプション）
    // コンポーネントがアンマウントされる時、
    // または次のuseEffectが実行される前に呼ばれる
  }
}, [依存配列]) // この配列の値が変わった時にuseEffectが再実行される
```

### 3つの実行パターン

```tsx
function EffectExample({ userId }: { userId: number }) {
  // パターン1: マウント時に1回だけ実行（依存配列が空）
  useEffect(() => {
    console.log('コンポーネントがマウントされた')

    return () => {
      console.log('コンポーネントがアンマウントされた')
    }
  }, []) // 空の配列 = マウント時のみ

  // パターン2: 特定の値が変わった時に実行
  useEffect(() => {
    console.log(`userIdが${userId}に変わった`)
    fetchUser(userId)

    return () => {
      // 前のuserIdの処理をクリーンアップ
      console.log(`userId ${userId}のクリーンアップ`)
    }
  }, [userId]) // userIdが変わった時に再実行

  // パターン3: 毎回のレンダリング後に実行（依存配列なし）
  // 注意: パフォーマンスに影響するため、通常は使わない
  useEffect(() => {
    console.log('毎回実行される')
  }) // 依存配列を書かない

  return <div>ユーザーID: {userId}</div>
}
```

| パターン       | 依存配列  | いつ実行されるか                   | よく使う場面                               |
| -------------- | --------- | ---------------------------------- | ------------------------------------------ |
| マウント時のみ | `[]`      | コンポーネントが最初に表示された時 | 初期データの取得、イベントリスナー登録     |
| 値の変更時     | `[value]` | valueが変わるたびに                | 検索フィルタ、ユーザーIDに基づくデータ取得 |
| 毎回           | なし      | 全てのレンダリング後               | 通常は使わない                             |

### 実践例: APIからデータを取得

```tsx
import { useState, useEffect } from 'react'

type User = {
  id: number
  name: string
  email: string
}

function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // フラグを用意してクリーンアップに備える
    let isCancelled = false

    const fetchUser = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
        if (!response.ok) {
          throw new Error('ユーザーが見つかりません')
        }
        const data: User = await response.json()

        // アンマウント後に状態更新しない
        if (!isCancelled) {
          setUser(data)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'エラーが発生しました')
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchUser()

    // クリーンアップ: コンポーネントがアンマウントされたらフラグを立てる
    return () => {
      isCancelled = true
    }
  }, [userId]) // userIdが変わったら再取得

  if (loading) return <p>読み込み中...</p>
  if (error) return <p>エラー: {error}</p>
  if (!user) return null

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

### クリーンアップが必要な場面

```tsx
function Timer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    // タイマーを設定
    const intervalId = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    // クリーンアップ: コンポーネントが消える時にタイマーを止める
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  return <p>経過時間: {seconds}秒</p>
}

function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // イベントリスナーを登録
    window.addEventListener('resize', handleResize)

    // クリーンアップ: イベントリスナーを解除
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <p>
      画面サイズ: {size.width} x {size.height}
    </p>
  )
}
```

クリーンアップを忘れるとメモリリーク（メモリの無駄遣い）やバグの原因になる。タイマー、イベントリスナー、WebSocket接続などを使う場合は必ずクリーンアップを書くこと。

---

## イベントハンドリング

Reactのイベントハンドリングは、HTMLのイベント属性に似ているが、いくつかの違いがある。

### 基本的なイベント

```tsx
function EventExamples() {
  // クリックイベント
  const handleClick = () => {
    alert('クリックされました')
  }

  // イベントオブジェクトを受け取る
  const handleClickWithEvent = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('クリック位置:', e.clientX, e.clientY)
  }

  // 引数を渡す
  const handleItemClick = (id: number) => {
    console.log(`アイテム${id}がクリックされた`)
  }

  return (
    <div>
      {/* 基本のクリック */}
      <button onClick={handleClick}>クリック</button>

      {/* イベントオブジェクト付き */}
      <button onClick={handleClickWithEvent}>位置を取得</button>

      {/* 引数を渡す場合はアロー関数で包む */}
      <button onClick={() => handleItemClick(1)}>アイテム1</button>
      <button onClick={() => handleItemClick(2)}>アイテム2</button>
    </div>
  )
}
```

### フォームイベント

```tsx
function SearchForm() {
  const [query, setQuery] = useState('')

  // onChangeで入力値を追跡
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  // onSubmitでフォーム送信を処理
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // ページリロードを防ぐ
    console.log('検索:', query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={query} onChange={handleChange} placeholder="検索キーワード" />
      <button type="submit">検索</button>
    </form>
  )
}
```

### よく使うイベント一覧

| イベント       | 発火タイミング         | 主な用途                |
| -------------- | ---------------------- | ----------------------- |
| `onClick`      | クリック時             | ボタン、リンク          |
| `onChange`     | 値が変わった時         | input, select, textarea |
| `onSubmit`     | フォーム送信時         | フォーム                |
| `onFocus`      | フォーカスが当たった時 | 入力欄のハイライト      |
| `onBlur`       | フォーカスが外れた時   | バリデーション          |
| `onKeyDown`    | キーが押された時       | ショートカットキー      |
| `onMouseEnter` | マウスが乗った時       | ツールチップ表示        |
| `onMouseLeave` | マウスが離れた時       | ツールチップ非表示      |
| `onScroll`     | スクロール時           | 無限スクロール          |

---

## 条件付きレンダリング

### パターンと使い分け

```tsx
function ConditionalRendering({
  isLoggedIn,
  isAdmin,
  items,
  error,
}: {
  isLoggedIn: boolean
  isAdmin: boolean
  items: string[]
  error: string | null
}) {
  // パターン1: early return（複雑な条件分岐に向いている）
  if (error) {
    return <div className="text-red-500">エラー: {error}</div>
  }

  if (!isLoggedIn) {
    return <div>ログインしてください</div>
  }

  // パターン2: && 演算子（シンプルな表示/非表示）
  // trueの時だけ表示、falseの時は何も表示しない
  return (
    <div>
      <h1>ダッシュボード</h1>

      {isAdmin && <div className="bg-yellow-100 p-4 rounded">管理者メニュー</div>}

      {/* パターン3: 三項演算子（2つの表示を切り替え） */}
      {items.length > 0 ? (
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">アイテムがありません</p>
      )}
    </div>
  )
}
```

### パターンの選び方

| パターン     | 書き方                        | 適した場面                         |
| ------------ | ----------------------------- | ---------------------------------- |
| early return | `if (...) return ...`         | ローディング、エラー、未認証の処理 |
| && 演算子    | `{条件 && <要素>}`            | 表示/非表示の切り替え              |
| 三項演算子   | `{条件 ? <A> : <B>}`          | 2つのUIを切り替え                  |
| 変数に抽出   | `const el = 条件 ? ... : ...` | 複雑な条件の整理                   |

---

## リストとkey

### mapでリスト表示

```tsx
type Product = {
  id: number
  name: string
  price: number
  inStock: boolean
}

function ProductList() {
  const products: Product[] = [
    { id: 1, name: 'キーボード', price: 8000, inStock: true },
    { id: 2, name: 'マウス', price: 3000, inStock: true },
    { id: 3, name: 'モニター', price: 45000, inStock: false },
    { id: 4, name: 'ヘッドセット', price: 12000, inStock: true },
  ]

  return (
    <div>
      <h2>商品一覧</h2>
      <ul>
        {products
          .filter((product) => product.inStock) // 在庫ありだけ表示
          .map((product) => (
            <li key={product.id}>
              {product.name} - {product.price.toLocaleString()}円
            </li>
          ))}
      </ul>
    </div>
  )
}
```

### keyが必要な理由

`key`はReactが各要素を識別するために必要。keyがないと、リストの変更時にReactは全ての要素を再描画する必要がある。keyがあれば、変更された要素だけを効率的に更新できる。

```tsx
// OK: 一意のIDをkeyにする
{
  users.map((user) => <UserCard key={user.id} user={user} />)
}

// NG: indexをkeyにする（順序が変わる可能性があるリストでは問題あり）
{
  users.map((user, index) => <UserCard key={index} user={user} />)
}
```

### indexをkeyにしてはいけない理由

| 操作       | keyがID        | keyがindex                     |
| ---------- | -------------- | ------------------------------ |
| 末尾に追加 | 問題なし       | 問題なし                       |
| 先頭に追加 | 追加分だけ描画 | 全要素が再描画される           |
| 中間の削除 | 削除分だけ反映 | 削除以降の全要素が再描画される |
| 並び替え   | 正しく追跡     | 要素の入力値が混乱する         |

indexをkeyにしても良いケース:

- リストが静的で変更されない
- リストの順序が変わらない
- リストにフィルタやソートを適用しない

それ以外の場合は、必ず一意のIDをkeyにする。

---

## フォーム処理

### 制御コンポーネント（Controlled Component）

Reactの状態（state）でフォームの値を管理する方法。推奨されるパターン。

```tsx
function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.username) {
      newErrors.username = 'ユーザー名は必須です'
    }
    if (!formData.email.includes('@')) {
      newErrors.email = '有効なメールアドレスを入力してください'
    }
    if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上にしてください'
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = '利用規約に同意してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      console.log('送信データ:', formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">ユーザー名</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">メール</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">パスワード</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">権限</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="user">一般ユーザー</option>
          <option value="editor">編集者</option>
          <option value="admin">管理者</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleChange}
        />
        <label>利用規約に同意する</label>
        {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>}
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        登録
      </button>
    </form>
  )
}
```

### 非制御コンポーネント（Uncontrolled Component）

DOMが直接値を管理する方法。`useRef`でDOM要素を参照する。

```tsx
import { useRef } from 'react'

function UncontrolledForm() {
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 送信時にDOMから直接値を取得
    console.log('名前:', nameRef.current?.value)
    console.log('メール:', emailRef.current?.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} type="text" placeholder="名前" defaultValue="" />
      <input ref={emailRef} type="email" placeholder="メール" defaultValue="" />
      <button type="submit">送信</button>
    </form>
  )
}
```

### 制御と非制御の比較

| 特徴                       | 制御コンポーネント | 非制御コンポーネント                     |
| -------------------------- | ------------------ | ---------------------------------------- |
| 値の管理場所               | React state        | DOM                                      |
| リアルタイムバリデーション | 容易               | 困難                                     |
| 値の取得タイミング         | いつでも           | 送信時のみ                               |
| フォームのリセット         | stateをリセット    | DOM APIを使用                            |
| 推奨度                     | 推奨               | 特別な理由がない限り非推奨               |
| 適した場面                 | ほぼ全ての場面     | ファイルアップロード、外部ライブラリ連携 |

実務では**React Hook Form**を使うことが多い。制御コンポーネントのような書き心地で、非制御コンポーネントのパフォーマンスを両立する。

---

## useContext

`useContext`は**コンポーネントツリー全体でデータを共有するためのHook**。Props Drilling（バケツリレー問題）を解決する。

### Props Drilling問題

Props Drillingとは、深くネストしたコンポーネントにデータを渡すために、中間のコンポーネントが使わないPropsを「バケツリレー」のように受け渡す問題。

```
App (userデータを持っている)
  └── Layout (userを渡すだけ、自分は使わない)
       └── Header (userを渡すだけ、自分は使わない)
            └── UserMenu (userを実際に使う)
```

```tsx
// Props Drillingの問題例
function App() {
  const user = { name: '太郎', role: 'admin' }
  return <Layout user={user} /> // Layoutは使わないのに渡す
}

function Layout({ user }) {
  return <Header user={user} /> // Headerも使わないのに渡す
}

function Header({ user }) {
  return <UserMenu user={user} /> // ようやくここで使う
}
```

### useContextで解決

```tsx
import { createContext, useContext, useState } from 'react'

// 1. Contextを作成
type User = {
  name: string
  role: string
}

type AuthContextType = {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

// 2. Providerコンポーネントを作成
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (user: User) => setUser(user)
  const logout = () => setUser(null)

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

// 3. カスタムフックで使いやすくする
function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthはAuthProvider内で使用してください')
  }
  return context
}

// 4. アプリのルートをProviderで囲む
function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  )
}

// 5. どの階層からでもuserにアクセスできる
function Layout() {
  return <Header /> // userを渡す必要がない
}

function Header() {
  return <UserMenu /> // userを渡す必要がない
}

function UserMenu() {
  const { user, logout } = useAuth() // 直接アクセス

  if (!user) return <button>ログイン</button>

  return (
    <div>
      <span>{user.name}さん</span>
      <button onClick={logout}>ログアウト</button>
    </div>
  )
}
```

### useContextの使い分け

| データの種類               | useContextが適している | Propsが適している |
| -------------------------- | ---------------------- | ----------------- |
| 認証情報                   | はい                   | いいえ            |
| テーマ（ダークモード）     | はい                   | いいえ            |
| 言語設定（i18n）           | はい                   | いいえ            |
| コンポーネント固有のデータ | いいえ                 | はい              |
| 親→子の1段階の受け渡し     | いいえ                 | はい              |

---

## useRef

`useRef`は**レンダリングをトリガーせずに値を保持するためのHook**。主に2つの用途がある。

### 用途1: DOM要素への参照

```tsx
import { useRef, useEffect } from 'react'

function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // マウント時に自動フォーカス
    inputRef.current?.focus()
  }, [])

  return <input ref={inputRef} type="text" placeholder="自動フォーカス" />
}

function ScrollToTop() {
  const topRef = useRef<HTMLDivElement>(null)

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      <div ref={topRef}>ページの先頭</div>
      {/* ...長いコンテンツ... */}
      <button onClick={scrollToTop}>先頭に戻る</button>
    </div>
  )
}
```

### 用途2: レンダリングをトリガーしない値の保持

```tsx
function StopWatch() {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<number | null>(null) // タイマーIDを保持

  const start = () => {
    if (isRunning) return
    setIsRunning(true)
    intervalRef.current = window.setInterval(() => {
      setTime((prev) => prev + 1)
    }, 1000)
  }

  const stop = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
    }
    setIsRunning(false)
  }

  const reset = () => {
    stop()
    setTime(0)
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div>
      <p>{time}秒</p>
      <button onClick={start}>開始</button>
      <button onClick={stop}>停止</button>
      <button onClick={reset}>リセット</button>
    </div>
  )
}
```

### useRefとuseStateの違い

| 特徴                     | useState           | useRef                        |
| ------------------------ | ------------------ | ----------------------------- |
| 値の変更時に再描画するか | する               | しない                        |
| 値へのアクセス           | `state`            | `ref.current`                 |
| 主な用途                 | UIに表示するデータ | DOM参照、タイマーID、前回の値 |
| レンダリング間で値を保持 | する               | する                          |

---

## useMemo / useCallback

### useMemo（計算結果のメモ化）

`useMemo`は**重い計算の結果をキャッシュ**し、依存配列の値が変わらない限り再計算しない。

```tsx
import { useMemo, useState } from 'react'

function ExpensiveList({ items, filter }: { items: string[]; filter: string }) {
  // filterが変わらない限り、再計算されない
  const filteredItems = useMemo(() => {
    console.log('フィルタリング実行') // filterが変わった時だけ出力される
    return items.filter((item) => item.toLowerCase().includes(filter.toLowerCase()))
  }, [items, filter])

  return (
    <ul>
      {filteredItems.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  )
}
```

### useCallback（関数のメモ化）

`useCallback`は**関数自体をメモ化**する。子コンポーネントにコールバック関数を渡す時に、不要な再描画を防ぐ。

```tsx
import { useCallback, useState, memo } from 'react'

// memo()で囲むことで、Propsが変わらない限り再描画しない
const TodoItem = memo(function TodoItem({
  todo,
  onToggle,
}: {
  todo: { id: number; text: string; done: boolean }
  onToggle: (id: number) => void
}) {
  console.log(`${todo.text}を描画`)
  return (
    <li>
      <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
      {todo.text}
    </li>
  )
})

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: '買い物', done: false },
    { id: 2, text: '掃除', done: false },
  ])
  const [newTodo, setNewTodo] = useState('')

  // useCallbackで関数をメモ化
  // todosが変わらない限り、同じ関数参照を返す
  const handleToggle = useCallback((id: number) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }, []) // setTodosの関数型更新を使うので依存配列は空でOK

  return (
    <div>
      <input
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="新しいToDo"
      />
      <ul>
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} />
        ))}
      </ul>
    </div>
  )
}
```

### いつ使うべきか

| 状況                                     | 使うべきか      | 理由                         |
| ---------------------------------------- | --------------- | ---------------------------- |
| 重い計算（大量データのフィルタリング等） | useMemo使う     | 計算コストの削減             |
| memo()されたコンポーネントに関数を渡す   | useCallback使う | 不要な再描画の防止           |
| 単純な計算や少量のデータ                 | 使わない        | メモ化自体にもコストがある   |
| 全てのstateやpropsに対して               | 使わない        | 過剰な最適化は可読性を下げる |

**初心者へのアドバイス**: 最初はuseMemo/useCallbackを使わずに実装し、パフォーマンスの問題が実際に発生した時に導入するのが良い。早すぎる最適化は避けるべき。

---

## カスタムフック

カスタムフックは**ロジックを再利用可能な関数に切り出す仕組み**。`use`で始まる名前の関数として定義する。

### 基本的なカスタムフック

```tsx
// useToggle: 真偽値の切り替えを簡単にするフック
function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue((prev) => !prev)
  }, [])

  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return { value, toggle, setTrue, setFalse }
}

// 使い方
function Modal() {
  const { value: isOpen, toggle, setFalse: close } = useToggle(false)

  return (
    <div>
      <button onClick={toggle}>モーダルを開く</button>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2>モーダル</h2>
            <button onClick={close}>閉じる</button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 実践的なカスタムフック

```tsx
// useLocalStorage: ローカルストレージと同期する状態管理
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`ローカルストレージの読み込みに失敗: ${error}`)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`ローカルストレージの書き込みに失敗: ${error}`)
    }
  }

  return [storedValue, setValue] as const
}

// 使い方
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light')

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      現在のテーマ: {theme}
    </button>
  )
}
```

```tsx
// useFetch: データ取得を汎用化
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
        const json = await response.json()

        if (!isCancelled) {
          setData(json)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : '不明なエラー')
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isCancelled = true
    }
  }, [url])

  return { data, loading, error }
}

// 使い方
function UserList() {
  const {
    data: users,
    loading,
    error,
  } = useFetch<User[]>('https://jsonplaceholder.typicode.com/users')

  if (loading) return <p>読み込み中...</p>
  if (error) return <p>エラー: {error}</p>

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### カスタムフックの命名規則

| ルール        | 例                             | 説明                        |
| ------------- | ------------------------------ | --------------------------- |
| `use`で始める | `useAuth`, `useFetch`          | Reactがフックとして認識する |
| 動詞を含める  | `useToggle`, `useLocalStorage` | 何をするフックか分かる      |
| 具体的に命名  | `useWindowSize`                | 抽象的すぎる名前は避ける    |

---

## コンポーネント設計のベストプラクティス

### 単一責任の原則

1つのコンポーネントは1つの責任を持つべき。

```tsx
// NG: 1つのコンポーネントに多くの責任
function UserPage() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  // ...データ取得のロジック
  // ...フォーム処理のロジック
  // ...表示のロジック（数百行...）
}

// OK: 責任を分割
function UserPage() {
  return (
    <div>
      <UserProfile /> {/* ユーザー情報の表示 */}
      <UserPosts /> {/* 投稿一覧 */}
      <UserEditForm /> {/* 編集フォーム */}
    </div>
  )
}
```

### Presentational / Container パターン

UIの表示（Presentational）とロジック（Container）を分離するパターン。現在はカスタムフックで代替されることが多いが、概念は重要。

```tsx
// Presentationalコンポーネント: 表示だけに専念
type UserCardProps = {
  name: string
  email: string
  avatar: string
  onEdit: () => void
}

function UserCard({ name, email, avatar, onEdit }: UserCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <img src={avatar} alt={name} className="w-16 h-16 rounded-full" />
      <h2 className="text-xl font-bold mt-2">{name}</h2>
      <p className="text-gray-500">{email}</p>
      <button onClick={onEdit} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        編集
      </button>
    </div>
  )
}

// カスタムフックでロジックを分離（Containerの代替）
function useUser(userId: number) {
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then(setUser)
  }, [userId])

  const handleEdit = () => setIsEditing(true)

  return { user, isEditing, handleEdit }
}

// 組み合わせて使う
function UserProfilePage({ userId }: { userId: number }) {
  const { user, handleEdit } = useUser(userId)

  if (!user) return <p>読み込み中...</p>

  return <UserCard name={user.name} email={user.email} avatar={user.avatar} onEdit={handleEdit} />
}
```

### コンポーネント分割のガイドライン

| 分割すべきサイン            | 説明                         |
| --------------------------- | ---------------------------- |
| 100行を超えるコンポーネント | 複数の責任を持っている可能性 |
| 同じUIパターンの繰り返し    | 共通コンポーネントに抽出     |
| 条件分岐が複雑              | 各分岐をコンポーネントに分離 |
| propsが10個以上             | 責任が多すぎる               |
| 複数のuseStateが関連し合う  | カスタムフックに切り出す     |

---

## React Developer Tools

React Developer Toolsはブラウザの拡張機能で、Reactアプリのデバッグに必須のツール。

### インストール

- Chrome: [React Developer Tools - Chrome Web Store](https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- Firefox: [React Developer Tools - Firefox Add-ons](https://addons.mozilla.org/ja/firefox/addon/react-devtools/)

### 主な機能

| タブ       | 機能                       | 用途                                           |
| ---------- | -------------------------- | ---------------------------------------------- |
| Components | コンポーネントツリーの表示 | 各コンポーネントのProps, State, Hooksの確認    |
| Profiler   | パフォーマンス計測         | どのコンポーネントが何回再描画されたかを可視化 |

**Components タブでできること:**

- コンポーネントの階層構造を確認
- 各コンポーネントのProps値をリアルタイムで確認
- Stateの値を確認・編集
- カスタムフックの状態を確認
- コンポーネントのソースコードへジャンプ

**Profiler タブでできること:**

- レンダリングの計測と記録
- どのコンポーネントが再描画されたか
- 再描画にかかった時間
- 再描画の原因（どのPropsやStateが変わったか）

---

## 状態管理ライブラリの概要

Reactの`useState`や`useContext`だけでは管理が難しくなるほど大規模なアプリケーションでは、専用の状態管理ライブラリを使う。

### 主要ライブラリの比較

| 特徴               | Redux Toolkit              | Zustand            | Jotai           |
| ------------------ | -------------------------- | ------------------ | --------------- |
| アプローチ         | Flux（一方向データフロー） | Store              | Atomic          |
| 学習コスト         | 高い                       | 低い               | 低い            |
| ボイラープレート   | やや多い                   | 非常に少ない       | 非常に少ない    |
| DevTools           | Redux DevTools（強力）     | Redux DevTools対応 | React DevTools  |
| 規模               | 大規模向き                 | 中小規模向き       | 中小規模向き    |
| TypeScriptサポート | 良い                       | 良い               | 良い            |
| バンドルサイズ     | やや大きい                 | 小さい（約1KB）    | 小さい（約2KB） |
| ミドルウェア       | 豊富                       | シンプル           | なし            |
| サーバーサイド対応 | あり                       | あり               | あり            |

### 各ライブラリのコード例

**Redux Toolkit:**

```tsx
// store.ts
import { configureStore, createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
  },
})

export const { increment, decrement } = counterSlice.actions
export const store = configureStore({ reducer: { counter: counterSlice.reducer } })

// コンポーネントでの使用
import { useSelector, useDispatch } from 'react-redux'

function Counter() {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => dispatch(increment())}>+1</button>
    </div>
  )
}
```

**Zustand:**

```tsx
import { create } from 'zustand'

// ストアの定義（シンプル）
const useCounterStore = create<{
  count: number
  increment: () => void
  decrement: () => void
}>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))

// コンポーネントでの使用
function Counter() {
  const { count, increment, decrement } = useCounterStore()
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </div>
  )
}
```

**Jotai:**

```tsx
import { atom, useAtom } from 'jotai'

// アトムの定義（最小単位の状態）
const countAtom = atom(0)
const doubleCountAtom = atom((get) => get(countAtom) * 2) // 派生アトム

// コンポーネントでの使用
function Counter() {
  const [count, setCount] = useAtom(countAtom)
  const [doubleCount] = useAtom(doubleCountAtom)
  return (
    <div>
      <p>カウント: {count}</p>
      <p>2倍: {doubleCount}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>+1</button>
    </div>
  )
}
```

### どれを選ぶべきか

| 状況                           | 推奨                        |
| ------------------------------ | --------------------------- |
| 大規模アプリ、チーム開発       | Redux Toolkit               |
| 中小規模、シンプルに管理したい | Zustand                     |
| React的なアプローチが好み      | Jotai                       |
| 状態が少ない                   | useState + useContextで十分 |

---

## Next.jsとの関係

Next.jsは**Reactをベースにしたフルスタックフレームワーク**。Reactが提供しないルーティング、サーバーサイドレンダリング（SSR）、静的サイト生成（SSG）などの機能を追加する。

### ReactとNext.jsの関係

```
React（UIライブラリ）
  └── Next.js（フレームワーク）
       ├── ルーティング（App Router）
       ├── サーバーサイドレンダリング（SSR）
       ├── 静的サイト生成（SSG）
       ├── API Routes
       ├── 画像最適化
       ├── フォント最適化
       └── ミドルウェア
```

### レンダリング方式の比較

| 方式                                   | 説明                               | 適した場面                   |
| -------------------------------------- | ---------------------------------- | ---------------------------- |
| CSR（Client Side Rendering）           | ブラウザでHTMLを生成               | インタラクティブなアプリ     |
| SSR（Server Side Rendering）           | サーバーでHTMLを生成、リクエスト毎 | 常に最新データが必要なページ |
| SSG（Static Site Generation）          | ビルド時にHTMLを生成               | ブログ、ドキュメント         |
| ISR（Incremental Static Regeneration） | 一定時間ごとにHTMLを再生成         | ECサイトの商品ページ         |

### App Router（Next.js 13以降）

Next.js 13で導入されたApp Routerは、Reactサーバーコンポーネントをベースにした新しいルーティングシステム。

```
app/
├── layout.tsx        # 全ページ共通レイアウト
├── page.tsx          # /(ルート)ページ
├── about/
│   └── page.tsx      # /about ページ
├── blog/
│   ├── page.tsx      # /blog ページ（記事一覧）
│   └── [slug]/
│       └── page.tsx  # /blog/:slug ページ（記事詳細）
└── api/
    └── users/
        └── route.ts  # API: /api/users
```

```tsx
// app/page.tsx - サーバーコンポーネント（デフォルト）
// このコンポーネントはサーバーで実行される
export default async function HomePage() {
  // サーバーで直接データを取得できる
  const posts = await fetch('https://api.example.com/posts').then((res) => res.json())

  return (
    <div>
      <h1>ブログ</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.body}</p>
        </article>
      ))}
    </div>
  )
}
```

```tsx
// app/components/Counter.tsx - クライアントコンポーネント
'use client' // この宣言でクライアントコンポーネントになる

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}
```

---

## 実践例: カウンターアプリからToDoアプリへ

### Step 1: カウンターアプリ

まずは最もシンプルなアプリから始めよう。

```tsx
// src/App.tsx
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-6">カウンターアプリ</h1>

        <p className="text-6xl font-bold text-blue-600 mb-8">{count}</p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setCount((prev) => prev - 1)}
            className="bg-red-500 text-white px-6 py-3 rounded-lg
                       hover:bg-red-600 active:bg-red-700
                       transition-colors text-lg font-medium"
          >
            -1
          </button>
          <button
            onClick={() => setCount(0)}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg
                       hover:bg-gray-600 active:bg-gray-700
                       transition-colors text-lg font-medium"
          >
            リセット
          </button>
          <button
            onClick={() => setCount((prev) => prev + 1)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg
                       hover:bg-blue-600 active:bg-blue-700
                       transition-colors text-lg font-medium"
          >
            +1
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
```

### Step 2: ToDoアプリへ発展

カウンターアプリで学んだ`useState`を発展させて、ToDoアプリを作る。

```tsx
// src/types/todo.ts
export type Todo = {
  id: number
  text: string
  done: boolean
  createdAt: Date
}

export type FilterType = 'all' | 'active' | 'completed'
```

```tsx
// src/hooks/useTodos.ts
import { useState, useCallback, useMemo } from 'react'
import { Todo, FilterType } from '../types/todo'

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<FilterType>('all')

  const addTodo = useCallback((text: string) => {
    if (!text.trim()) return
    const newTodo: Todo = {
      id: Date.now(),
      text: text.trim(),
      done: false,
      createdAt: new Date(),
    }
    setTodos((prev) => [newTodo, ...prev])
  }, [])

  const toggleTodo = useCallback((id: number) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }, [])

  const removeTodo = useCallback((id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }, [])

  const editTodo = useCallback((id: number, newText: string) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, text: newText } : todo)))
  }, [])

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => !todo.done))
  }, [])

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.done)
      case 'completed':
        return todos.filter((todo) => todo.done)
      default:
        return todos
    }
  }, [todos, filter])

  const stats = useMemo(
    () => ({
      total: todos.length,
      active: todos.filter((t) => !t.done).length,
      completed: todos.filter((t) => t.done).length,
    }),
    [todos]
  )

  return {
    todos: filteredTodos,
    filter,
    stats,
    setFilter,
    addTodo,
    toggleTodo,
    removeTodo,
    editTodo,
    clearCompleted,
  }
}
```

```tsx
// src/components/TodoInput.tsx
import { useState } from 'react'

type TodoInputProps = {
  onAdd: (text: string) => void
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    onAdd(text)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="新しいタスクを入力..."
        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                   focus:outline-none transition-all"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium
                   hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                   transition-colors"
      >
        追加
      </button>
    </form>
  )
}
```

```tsx
// src/components/TodoItem.tsx
import { useState, memo } from 'react'
import { Todo } from '../types/todo'

type TodoItemProps = {
  todo: Todo
  onToggle: (id: number) => void
  onRemove: (id: number) => void
  onEdit: (id: number, text: string) => void
}

export const TodoItem = memo(function TodoItem({
  todo,
  onToggle,
  onRemove,
  onEdit,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(todo.id, editText.trim())
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditText(todo.text)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') handleCancel()
  }

  return (
    <li
      className={`flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm
                    border-l-4 transition-all duration-200
                    ${todo.done ? 'border-green-400 bg-green-50' : 'border-blue-400'}`}
    >
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        className="w-5 h-5 rounded border-gray-300 text-blue-600
                   focus:ring-blue-500 cursor-pointer"
      />

      {isEditing ? (
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-3 py-1 border border-gray-300 rounded
                       focus:border-blue-500 focus:outline-none"
            autoFocus
          />
          <button onClick={handleSave} className="text-sm text-blue-600 hover:text-blue-800">
            保存
          </button>
          <button onClick={handleCancel} className="text-sm text-gray-500 hover:text-gray-700">
            取消
          </button>
        </div>
      ) : (
        <>
          <span className={`flex-1 ${todo.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {todo.text}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            編集
          </button>
          <button
            onClick={() => onRemove(todo.id)}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            削除
          </button>
        </>
      )}
    </li>
  )
})
```

```tsx
// src/components/TodoFilter.tsx
import { FilterType } from '../types/todo'

type TodoFilterProps = {
  filter: FilterType
  stats: { total: number; active: number; completed: number }
  onFilterChange: (filter: FilterType) => void
  onClearCompleted: () => void
}

export function TodoFilter({ filter, stats, onFilterChange, onClearCompleted }: TodoFilterProps) {
  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: '全て', count: stats.total },
    { key: 'active', label: '未完了', count: stats.active },
    { key: 'completed', label: '完了', count: stats.completed },
  ]

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex gap-2">
        {filters.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {stats.completed > 0 && (
        <button
          onClick={onClearCompleted}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          完了済みを削除
        </button>
      )}
    </div>
  )
}
```

```tsx
// src/App.tsx
import { useTodos } from './hooks/useTodos'
import { TodoInput } from './components/TodoInput'
import { TodoItem } from './components/TodoItem'
import { TodoFilter } from './components/TodoFilter'

function App() {
  const {
    todos,
    filter,
    stats,
    setFilter,
    addTodo,
    toggleTodo,
    removeTodo,
    editTodo,
    clearCompleted,
  } = useTodos()

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ToDo App</h1>
          <p className="text-gray-500 mt-2">タスクを管理しよう</p>
        </div>

        {/* 入力フォーム */}
        <div className="mb-6">
          <TodoInput onAdd={addTodo} />
        </div>

        {/* フィルター */}
        <div className="mb-4">
          <TodoFilter
            filter={filter}
            stats={stats}
            onFilterChange={setFilter}
            onClearCompleted={clearCompleted}
          />
        </div>

        {/* ToDoリスト */}
        {todos.length > 0 ? (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onRemove={removeTodo}
                onEdit={editTodo}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center py-12 text-gray-400">
            {filter === 'all'
              ? 'タスクがありません。上のフォームから追加しましょう。'
              : filter === 'active'
                ? '未完了のタスクはありません。'
                : '完了済みのタスクはありません。'}
          </div>
        )}

        {/* フッター */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>{stats.active}件の未完了タスク</p>
        </div>
      </div>
    </div>
  )
}

export default App
```

### ToDoアプリで学べること

このToDoアプリでは、以下のReactの概念を実践的に使用している。

| 概念                 | どこで使われているか                   |
| -------------------- | -------------------------------------- |
| useState             | 各コンポーネントの状態管理             |
| useCallback          | useTodosフック内の関数メモ化           |
| useMemo              | フィルタリング結果と統計情報のメモ化   |
| memo                 | TodoItemの不要な再描画防止             |
| カスタムフック       | useTodosでロジックを分離               |
| Props                | 親子間のデータ受け渡し                 |
| イベントハンドリング | フォーム送信、クリック、キーボード入力 |
| 条件付きレンダリング | フィルタ状態に応じた表示切り替え       |
| リストとkey          | todo.idをkeyに使用                     |
| コンポーネント分割   | Input, Item, Filter, Appに分離         |
| TypeScript           | 型定義による安全なコード               |

---

## 参考リンク

- [React 公式ドキュメント](https://react.dev/) - Reactの公式リファレンスとチュートリアル
- [React 日本語ドキュメント](https://ja.react.dev/) - React公式ドキュメントの日本語版
- [Vite 公式サイト](https://vite.dev/) - 高速なフロントエンドビルドツール
- [Next.js 公式ドキュメント](https://nextjs.org/docs) - React用フルスタックフレームワーク
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/) - TypeScriptの公式ガイド
- [Redux Toolkit 公式ドキュメント](https://redux-toolkit.js.org/) - Redux公式の状態管理ツールキット
- [Zustand GitHub](https://github.com/pmndrs/zustand) - 軽量な状態管理ライブラリ
- [Jotai 公式ドキュメント](https://jotai.org/) - アトムベースの状態管理ライブラリ
- [React Hook Form 公式ドキュメント](https://react-hook-form.com/) - パフォーマンス重視のフォームライブラリ
- [TanStack Query 公式ドキュメント](https://tanstack.com/query/latest) - データフェッチングライブラリ
- [React Developer Tools - Chrome](https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) - React用ブラウザ開発者ツール
