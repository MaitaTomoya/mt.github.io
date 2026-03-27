---
title: 'Tailwind CSS'
order: 9
section: 'スタイリングとフレームワーク'
---

# Tailwind CSS

## Tailwind CSSとは

Tailwind CSSは**ユーティリティファーストCSSフレームワーク**。従来のCSSフレームワーク（Bootstrapなど）が「ボタンはこういう見た目」と完成品を提供するのに対し、Tailwind CSSは「文字を赤くする」「余白を4pxにする」といった**小さなユーティリティクラスを組み合わせてデザインを構築する**アプローチを取る。

たとえるなら、Bootstrapは「完成品の家具セット」を買うようなもので、Tailwind CSSは「木材、ネジ、塗料を自由に組み合わせてオリジナル家具を作る」ようなもの。自由度は高いが、基本的なパーツ（ユーティリティクラス）は全て用意されているので、ゼロから作る必要はない。

2017年にAdam Wathanによって開発され、現在はWebフロントエンド開発で最も人気のあるCSSフレームワークの一つ。React、Vue、Next.jsなどのモダンフレームワークとの相性が非常に良い。

---

## 従来のCSS vs Tailwind CSS

### アプローチの違い

**従来のCSS（BEMなど）の書き方:**

```html
<!-- HTML -->
<div class="card">
  <h2 class="card__title">タイトル</h2>
  <p class="card__description">説明文です。</p>
  <button class="card__button">詳細を見る</button>
</div>
```

```css
/* CSS */
.card {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card__title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1a202c;
  margin-bottom: 8px;
}

.card__description {
  color: #718096;
  margin-bottom: 16px;
}

.card__button {
  background-color: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
```

**Tailwind CSSの書き方:**

```html
<div class="bg-white rounded-lg p-6 shadow-md">
  <h2 class="text-xl font-bold text-gray-900 mb-2">タイトル</h2>
  <p class="text-gray-500 mb-4">説明文です。</p>
  <button class="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">詳細を見る</button>
</div>
```

CSSファイルが不要で、HTMLだけで完結する。これがTailwind CSSの最大の特徴。

### メリット・デメリット比較表

| 観点                   | 従来のCSS                       | Tailwind CSS                           |
| ---------------------- | ------------------------------- | -------------------------------------- |
| CSSファイルの管理      | CSSファイルが肥大化しやすい     | CSSファイルをほぼ書かない              |
| クラス名の命名         | BEMなどの命名規則が必要         | 命名不要（ユーティリティクラスを使う） |
| HTML側のクラス         | シンプル                        | クラスが長くなりがち                   |
| デザインの一貫性       | 開発者に依存                    | デザイントークンで統一される           |
| 学習コスト             | CSS自体の知識が必要             | CSSの知識 + ユーティリティクラスの暗記 |
| カスタマイズ性         | 自由度が高い                    | config設定で柔軟に対応可能             |
| 開発速度               | CSSファイルとHTMLの行き来が必要 | HTMLだけで完結するため速い             |
| ファイルサイズ         | 使わないCSSも残りがち           | ビルド時に未使用クラスを自動削除       |
| コンポーネントとの相性 | 普通                            | React/Vueなどと非常に相性が良い        |
| チーム開発             | スタイルの衝突リスクあり        | ユーティリティなので衝突しにくい       |

**Tailwind CSSが特に向いているケース:**

- React、Vue、Svelteなどコンポーネントベースの開発
- プロトタイピングやMVPの素早い開発
- デザインシステムを統一したいチーム開発

**従来のCSSが向いているケース:**

- 既存プロジェクトの保守
- CSSの基礎を学ぶ段階
- 極めて複雑なアニメーションが多いプロジェクト

---

## 導入方法

Tailwind CSSの導入にはいくつかの方法がある。プロジェクトの規模や用途に応じて選択する。

### 方法1: CDN（学習・プロトタイプ向け）

最も簡単な方法。HTMLファイルに1行追加するだけで使える。ただし、本番環境での利用は推奨されない（カスタマイズが制限される、ファイルサイズが大きい）。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tailwind CSS テスト</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto p-8">
      <h1 class="text-3xl font-bold text-blue-600">Hello Tailwind!</h1>
      <p class="mt-4 text-gray-700">CDNで簡単に試せます。</p>
    </div>
  </body>
</html>
```

### 方法2: npm install（実務向け・推奨）

Viteを使ったプロジェクトでの導入手順を示す。現在の実務で最も一般的な方法。

```bash
# 新しいViteプロジェクトを作成
npm create vite@latest my-project -- --template react
cd my-project

# Tailwind CSSとその依存パッケージをインストール
npm install -D tailwindcss @tailwindcss/vite
```

`vite.config.ts`にプラグインを追加:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

CSSファイルにTailwindのインポートを追加:

```css
/* src/index.css */
@import 'tailwindcss';
```

これでTailwind CSSが使えるようになる。

### 方法3: PostCSS設定（既存プロジェクトへの導入、Tailwind CSS v3系）

既存のプロジェクトにTailwind CSSを追加する場合はPostCSS経由で導入する。なお、この設定方法はTailwind CSS v3系のもの。v4では設定方法が大きく変わっているため、新規プロジェクトでは方法2のViteプラグイン方式を推奨する。

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

`postcss.config.js`を作成:

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

`tailwind.config.js`でコンテンツのパスを設定:

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

| 導入方法   | 用途                     | カスタマイズ | ビルド最適化 |
| ---------- | ------------------------ | ------------ | ------------ |
| CDN        | 学習、プロトタイプ       | 制限あり     | なし         |
| npm + Vite | 新規プロジェクト（推奨） | 全て可能     | あり         |
| PostCSS    | 既存プロジェクトへの追加 | 全て可能     | あり         |

---

## 基本的なユーティリティクラス

Tailwind CSSの核心はユーティリティクラス。CSSのプロパティ1つに対して1つのクラスが対応する。以下に主要なカテゴリごとにまとめる。

### 色（Color）

Tailwindの色は`{プロパティ}-{色名}-{濃さ}`の形式で指定する。濃さは50（薄い）から950（濃い）まで。

```html
<!-- テキストの色 -->
<p class="text-red-500">赤いテキスト</p>
<p class="text-blue-700">濃い青のテキスト</p>
<p class="text-gray-400">薄いグレーのテキスト</p>

<!-- 背景色 -->
<div class="bg-green-100">薄い緑の背景</div>
<div class="bg-yellow-500">黄色の背景</div>

<!-- ボーダーの色 -->
<div class="border border-purple-300">紫のボーダー</div>
```

主要な色の一覧:

| 色名     | 用途の例                 | クラス例                           |
| -------- | ------------------------ | ---------------------------------- |
| `slate`  | 落ち着いたグレー系       | `text-slate-700`, `bg-slate-100`   |
| `gray`   | 標準的なグレー           | `text-gray-500`, `bg-gray-200`     |
| `red`    | エラー、警告             | `text-red-500`, `bg-red-100`       |
| `orange` | 注意、アクセント         | `text-orange-500`, `bg-orange-100` |
| `yellow` | 警告、ハイライト         | `text-yellow-500`, `bg-yellow-100` |
| `green`  | 成功、確認               | `text-green-500`, `bg-green-100`   |
| `blue`   | リンク、情報、プライマリ | `text-blue-500`, `bg-blue-100`     |
| `indigo` | アクセント               | `text-indigo-500`, `bg-indigo-100` |
| `purple` | 装飾、ブランド           | `text-purple-500`, `bg-purple-100` |
| `pink`   | 装飾、フェミニン         | `text-pink-500`, `bg-pink-100`     |

濃さの段階:

| 値      | 印象       | 使用例                       |
| ------- | ---------- | ---------------------------- |
| 50      | 非常に薄い | 背景色に使う（`bg-blue-50`） |
| 100-200 | 薄い       | 背景色、ホバー時の背景       |
| 300-400 | やや薄い   | ボーダー、無効状態のテキスト |
| 500     | 標準       | アイコン、ボタン背景         |
| 600-700 | やや濃い   | 本文テキスト、ボタンホバー   |
| 800-900 | 濃い       | 見出し、重要なテキスト       |
| 950     | 非常に濃い | 最も目立つテキスト           |

### サイズ（Width / Height）

```html
<!-- 幅 -->
<div class="w-full">横幅100%</div>
<div class="w-1/2">横幅50%</div>
<div class="w-64">横幅256px（16rem）</div>
<div class="w-screen">画面幅いっぱい</div>

<!-- 高さ -->
<div class="h-screen">画面の高さいっぱい</div>
<div class="h-64">高さ256px</div>
<div class="h-full">親要素の高さいっぱい</div>

<!-- 最大・最小幅 -->
<div class="max-w-md">最大幅448px</div>
<div class="min-h-screen">最低でも画面の高さ</div>
```

主なサイズ値:

| クラス     | 値      | ピクセル換算 |
| ---------- | ------- | ------------ |
| `w-0`      | 0       | 0px          |
| `w-1`      | 0.25rem | 4px          |
| `w-2`      | 0.5rem  | 8px          |
| `w-4`      | 1rem    | 16px         |
| `w-8`      | 2rem    | 32px         |
| `w-16`     | 4rem    | 64px         |
| `w-32`     | 8rem    | 128px        |
| `w-64`     | 16rem   | 256px        |
| `w-96`     | 24rem   | 384px        |
| `w-1/2`    | 50%     | -            |
| `w-1/3`    | 33.333% | -            |
| `w-2/3`    | 66.667% | -            |
| `w-full`   | 100%    | -            |
| `w-screen` | 100vw   | -            |

覚え方のコツ: 数字は基本的に「値 x 4px = ピクセル」と覚える。`w-4`なら4 x 4px = 16px。

### 余白（Padding / Margin）

Tailwindの余白は`{種類}{方向}-{サイズ}`の形式。

```html
<!-- パディング（内側の余白） -->
<div class="p-4">全方向に16pxの余白</div>
<div class="px-4">左右に16pxの余白</div>
<div class="py-2">上下に8pxの余白</div>
<div class="pt-8">上だけに32pxの余白</div>
<div class="pb-4">下だけに16pxの余白</div>

<!-- マージン（外側の余白） -->
<div class="m-4">全方向に16pxの外側余白</div>
<div class="mx-auto">左右中央揃え</div>
<div class="mt-8">上に32pxの外側余白</div>
<div class="mb-4">下に16pxの外側余白</div>

<!-- 負のマージン -->
<div class="-mt-4">上に-16pxのマージン</div>
```

方向の記号:

| 記号          | 意味   | 対応するCSSプロパティ                     |
| ------------- | ------ | ----------------------------------------- |
| なし（`p-4`） | 全方向 | `padding: 1rem`                           |
| `x`（`px-4`） | 左右   | `padding-left: 1rem; padding-right: 1rem` |
| `y`（`py-4`） | 上下   | `padding-top: 1rem; padding-bottom: 1rem` |
| `t`（`pt-4`） | 上     | `padding-top: 1rem`                       |
| `r`（`pr-4`） | 右     | `padding-right: 1rem`                     |
| `b`（`pb-4`） | 下     | `padding-bottom: 1rem`                    |
| `l`（`pl-4`） | 左     | `padding-left: 1rem`                      |

### ボーダー（Border）

```html
<!-- 基本のボーダー -->
<div class="border">1pxの実線ボーダー</div>
<div class="border-2">2pxのボーダー</div>
<div class="border-4">4pxのボーダー</div>

<!-- ボーダーの色 -->
<div class="border border-gray-300">グレーのボーダー</div>
<div class="border-2 border-blue-500">青い2pxのボーダー</div>

<!-- 角丸 -->
<div class="rounded">小さな角丸（4px）</div>
<div class="rounded-md">中くらいの角丸（6px）</div>
<div class="rounded-lg">大きな角丸（8px）</div>
<div class="rounded-xl">さらに大きな角丸（12px）</div>
<div class="rounded-full">完全な円</div>

<!-- 特定の方向の角丸 -->
<div class="rounded-t-lg">上だけ角丸</div>
<div class="rounded-b-lg">下だけ角丸</div>

<!-- ボーダーの方向 -->
<div class="border-b">下だけボーダー</div>
<div class="border-t-2 border-blue-500">上に青い2pxボーダー</div>
```

### テキスト（Typography）

```html
<!-- フォントサイズ -->
<p class="text-xs">12px - 極小テキスト</p>
<p class="text-sm">14px - 小さいテキスト</p>
<p class="text-base">16px - 標準テキスト</p>
<p class="text-lg">18px - やや大きいテキスト</p>
<p class="text-xl">20px - 大きいテキスト</p>
<p class="text-2xl">24px - 見出し向け</p>
<p class="text-3xl">30px - 大見出し</p>
<p class="text-4xl">36px - 特大見出し</p>

<!-- 太さ -->
<p class="font-thin">細い（100）</p>
<p class="font-normal">標準（400）</p>
<p class="font-medium">やや太い（500）</p>
<p class="font-semibold">半太字（600）</p>
<p class="font-bold">太字（700）</p>

<!-- 文字揃え -->
<p class="text-left">左揃え</p>
<p class="text-center">中央揃え</p>
<p class="text-right">右揃え</p>

<!-- 行間 -->
<p class="leading-tight">狭い行間</p>
<p class="leading-normal">標準の行間</p>
<p class="leading-relaxed">広い行間</p>

<!-- その他 -->
<p class="underline">下線付き</p>
<p class="line-through">取り消し線</p>
<p class="uppercase">大文字変換</p>
<p class="truncate">長いテキストを省略記号で...（overflow: hidden + text-overflow: ellipsis）</p>
```

### シャドウ（Box Shadow）

```html
<div class="shadow-sm">小さな影</div>
<div class="shadow">標準的な影</div>
<div class="shadow-md">中くらいの影</div>
<div class="shadow-lg">大きな影</div>
<div class="shadow-xl">特大の影</div>
<div class="shadow-2xl">最大の影</div>
<div class="shadow-none">影なし</div>
```

### 透明度（Opacity）

```html
<div class="opacity-100">不透明（100%）</div>
<div class="opacity-75">やや透明（75%）</div>
<div class="opacity-50">半透明（50%）</div>
<div class="opacity-25">かなり透明（25%）</div>
<div class="opacity-0">完全に透明（0%）</div>
```

---

## レスポンシブデザイン

Tailwind CSSのレスポンシブデザインは**モバイルファースト**。何もプレフィックスをつけないクラスがモバイル用で、ブレイクポイントのプレフィックスをつけると「その画面幅以上で適用」される。

### ブレイクポイント一覧

| プレフィックス | 最小幅 | 対象デバイスの目安   | CSSの値                      |
| -------------- | ------ | -------------------- | ---------------------------- |
| なし           | 0px    | モバイル（全サイズ） | -                            |
| `sm:`          | 640px  | 大きめスマホ         | `@media (min-width: 640px)`  |
| `md:`          | 768px  | タブレット           | `@media (min-width: 768px)`  |
| `lg:`          | 1024px | ノートPC             | `@media (min-width: 1024px)` |
| `xl:`          | 1280px | デスクトップ         | `@media (min-width: 1280px)` |
| `2xl:`         | 1536px | 大画面デスクトップ   | `@media (min-width: 1536px)` |

### モバイルファーストの考え方

重要な概念: Tailwindでは「小さい画面のスタイルをデフォルトで書き、画面が大きくなるにつれて上書きしていく」。

```html
<!-- モバイルファーストの例 -->
<div class="text-sm md:text-base lg:text-lg xl:text-xl">
  <!--
    モバイル: text-sm（14px）
    768px以上: text-base（16px）
    1024px以上: text-lg（18px）
    1280px以上: text-xl（20px）
  -->
  レスポンシブなテキスト
</div>
```

### 実践例: レスポンシブカードグリッド

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
  <!--
    モバイル: 1列
    640px以上: 2列
    1024px以上: 3列
    1280px以上: 4列
  -->
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-bold mb-2">カード1</h3>
    <p class="text-gray-600">カードの説明文です。</p>
  </div>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-bold mb-2">カード2</h3>
    <p class="text-gray-600">カードの説明文です。</p>
  </div>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-bold mb-2">カード3</h3>
    <p class="text-gray-600">カードの説明文です。</p>
  </div>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-bold mb-2">カード4</h3>
    <p class="text-gray-600">カードの説明文です。</p>
  </div>
</div>
```

### 実践例: レスポンシブレイアウト

```html
<!-- モバイルでは縦並び、PCでは横並び -->
<div class="flex flex-col md:flex-row gap-4">
  <!-- サイドバー: モバイルでは上に、PCでは左に -->
  <aside class="w-full md:w-64 bg-gray-800 text-white p-4 rounded-lg">
    <h2 class="text-xl font-bold mb-4">メニュー</h2>
    <nav>
      <ul class="space-y-2">
        <li><a href="#" class="hover:text-blue-300">ホーム</a></li>
        <li><a href="#" class="hover:text-blue-300">記事一覧</a></li>
        <li><a href="#" class="hover:text-blue-300">お問い合わせ</a></li>
      </ul>
    </nav>
  </aside>

  <!-- メインコンテンツ -->
  <main class="flex-1 bg-white p-6 rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-4">メインコンテンツ</h1>
    <p class="text-gray-700 leading-relaxed">
      ここにメインの内容が入ります。 画面幅が768px以上ではサイドバーと横並びになります。
    </p>
  </main>
</div>
```

---

## Flexboxユーティリティ

Flexboxはレイアウトを組むための強力なCSS機能。Tailwindではクラスを追加するだけで使える。

### 基本

```html
<!-- 横並び（デフォルト） -->
<div class="flex">
  <div>要素1</div>
  <div>要素2</div>
  <div>要素3</div>
</div>

<!-- 縦並び -->
<div class="flex flex-col">
  <div>要素1</div>
  <div>要素2</div>
  <div>要素3</div>
</div>

<!-- 折り返しあり -->
<div class="flex flex-wrap">
  <div>要素1</div>
  <div>要素2</div>
  <div>要素3</div>
</div>
```

### 配置

```html
<!-- 水平方向の配置 -->
<div class="flex justify-start">左寄せ（デフォルト）</div>
<div class="flex justify-center">中央寄せ</div>
<div class="flex justify-end">右寄せ</div>
<div class="flex justify-between">両端揃え（間に均等スペース）</div>
<div class="flex justify-around">均等配置（両端にもスペース）</div>
<div class="flex justify-evenly">完全均等配置</div>

<!-- 垂直方向の配置 -->
<div class="flex items-start">上揃え</div>
<div class="flex items-center">中央揃え</div>
<div class="flex items-end">下揃え</div>
<div class="flex items-stretch">高さを揃える（デフォルト）</div>

<!-- 上下左右ど真ん中に配置（超よく使う） -->
<div class="flex items-center justify-center h-screen">
  <div>画面の真ん中に表示</div>
</div>
```

### 主なFlexboxクラス一覧

| クラス            | CSSプロパティ                    | 説明                     |
| ----------------- | -------------------------------- | ------------------------ |
| `flex`            | `display: flex`                  | Flexコンテナにする       |
| `inline-flex`     | `display: inline-flex`           | インラインFlexコンテナ   |
| `flex-row`        | `flex-direction: row`            | 横並び（デフォルト）     |
| `flex-col`        | `flex-direction: column`         | 縦並び                   |
| `flex-wrap`       | `flex-wrap: wrap`                | 折り返しあり             |
| `flex-nowrap`     | `flex-wrap: nowrap`              | 折り返しなし             |
| `justify-start`   | `justify-content: flex-start`    | 主軸の開始位置に配置     |
| `justify-center`  | `justify-content: center`        | 主軸の中央に配置         |
| `justify-end`     | `justify-content: flex-end`      | 主軸の終了位置に配置     |
| `justify-between` | `justify-content: space-between` | 均等配置（両端に寄せる） |
| `items-start`     | `align-items: flex-start`        | 交差軸の開始位置         |
| `items-center`    | `align-items: center`            | 交差軸の中央             |
| `items-end`       | `align-items: flex-end`          | 交差軸の終了位置         |
| `items-stretch`   | `align-items: stretch`           | 高さを揃える             |
| `flex-1`          | `flex: 1 1 0%`                   | 残りのスペースを埋める   |
| `flex-none`       | `flex: none`                     | 伸縮しない               |
| `gap-4`           | `gap: 1rem`                      | 要素間の余白             |
| `order-1`         | `order: 1`                       | 並び順を変更             |

### 実践例: ヘッダーのレイアウト

```html
<header class="flex items-center justify-between px-6 py-4 bg-white shadow">
  <!-- ロゴ -->
  <div class="text-xl font-bold text-blue-600">MyApp</div>

  <!-- ナビゲーション -->
  <nav class="hidden md:flex gap-6">
    <a href="#" class="text-gray-700 hover:text-blue-600">ホーム</a>
    <a href="#" class="text-gray-700 hover:text-blue-600">機能</a>
    <a href="#" class="text-gray-700 hover:text-blue-600">料金</a>
    <a href="#" class="text-gray-700 hover:text-blue-600">お問い合わせ</a>
  </nav>

  <!-- ログインボタン -->
  <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">ログイン</button>
</header>
```

---

## Gridユーティリティ

CSS Gridは2次元レイアウト（行と列を同時に制御）に最適。Tailwindでは直感的にGridが使える。

### 基本

```html
<!-- 3列グリッド -->
<div class="grid grid-cols-3 gap-4">
  <div class="bg-blue-100 p-4">1</div>
  <div class="bg-blue-200 p-4">2</div>
  <div class="bg-blue-300 p-4">3</div>
  <div class="bg-blue-100 p-4">4</div>
  <div class="bg-blue-200 p-4">5</div>
  <div class="bg-blue-300 p-4">6</div>
</div>

<!-- 列幅の指定 -->
<div class="grid grid-cols-4 gap-4">
  <div class="col-span-1 bg-gray-200 p-4">サイドバー</div>
  <div class="col-span-3 bg-white p-4">メインコンテンツ（3列分）</div>
</div>

<!-- 自動フィット -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <!-- 最小250px、最大1frで自動的に列数が変わる -->
  <div class="bg-blue-100 p-4">アイテム1</div>
  <div class="bg-blue-100 p-4">アイテム2</div>
  <div class="bg-blue-100 p-4">アイテム3</div>
  <div class="bg-blue-100 p-4">アイテム4</div>
</div>
```

### 主なGridクラス一覧

| クラス                         | 説明               |
| ------------------------------ | ------------------ |
| `grid`                         | Gridコンテナにする |
| `grid-cols-1` ~ `grid-cols-12` | 列数を指定         |
| `grid-rows-1` ~ `grid-rows-6`  | 行数を指定         |
| `col-span-1` ~ `col-span-12`   | 要素が占める列数   |
| `row-span-1` ~ `row-span-6`    | 要素が占める行数   |
| `gap-1` ~ `gap-96`             | グリッド間の余白   |
| `gap-x-4`                      | 列方向の余白       |
| `gap-y-4`                      | 行方向の余白       |
| `col-start-1`                  | 開始列を指定       |
| `col-end-4`                    | 終了列を指定       |

### FlexboxとGridの使い分け

| 場面                         | 推奨    | 理由               |
| ---------------------------- | ------- | ------------------ |
| 1行のナビゲーション          | Flexbox | 1次元の横並び      |
| ヘッダーのロゴとメニュー配置 | Flexbox | 左右の配置         |
| カードの一覧表示             | Grid    | 均等な2次元配置    |
| ダッシュボードのレイアウト   | Grid    | 複雑な行列制御     |
| ボタングループ               | Flexbox | 簡単な横並び       |
| フォームのラベルと入力欄     | Grid    | 列幅を揃えたい場合 |

---

## ダークモード対応

Tailwind CSSでは`dark:`プレフィックスを使うだけでダークモード対応ができる。

### 基本的な使い方

```html
<!-- ライトモードでは白背景・黒文字、ダークモードでは暗い背景・白文字 -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <h1 class="text-2xl font-bold text-blue-600 dark:text-blue-400">ダークモード対応のタイトル</h1>
  <p class="text-gray-600 dark:text-gray-300">ユーザーのOS設定に応じて自動的に切り替わります。</p>
</div>
```

### ダークモードの切り替え方法

Tailwind CSSには2つのダークモード戦略がある。

**方法1: メディアクエリ（デフォルト）**

OSのダークモード設定に自動的に追従する。

```css
/* tailwind.config.jsで特に設定不要（デフォルト） */
```

**方法2: セレクタ戦略（手動切り替え）**

JavaScriptでダークモードを切り替えたい場合に使う。

```javascript
// tailwind.config.js
export default {
  darkMode: 'selector', // v3.4.1以降
  // ...
}
```

```html
<!-- HTMLのルート要素にdarkクラスを追加・削除で切り替え -->
<html class="dark">
  <body class="bg-white dark:bg-gray-900">
    <!-- ダークモードが適用される -->
  </body>
</html>
```

```javascript
// JavaScriptでの切り替え例
const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark')
}
```

### 実践例: ダークモード対応のカード

```html
<div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
  <div
    class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg
              dark:shadow-gray-900/50 p-6"
  >
    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">記事のタイトル</h2>
    <p class="text-gray-600 dark:text-gray-300 mb-4">
      この記事ではダークモード対応の方法を解説します。
      OSの設定に応じて自動的にテーマが切り替わります。
    </p>
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-500 dark:text-gray-400">2026年3月28日</span>
      <span
        class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200
                   text-xs px-2 py-1 rounded-full"
      >
        チュートリアル
      </span>
    </div>
  </div>
</div>
```

---

## 状態バリアント（hover / focus等）

Tailwindでは、要素の状態に応じたスタイル変更を`hover:`や`focus:`などのプレフィックスで簡単に実現できる。

### 主なバリアント一覧

| プレフィックス   | いつ適用されるか           | よく使う場面               |
| ---------------- | -------------------------- | -------------------------- |
| `hover:`         | マウスを乗せた時           | ボタン、リンク、カード     |
| `focus:`         | フォーカスが当たった時     | 入力欄、ボタン             |
| `active:`        | クリック中                 | ボタン                     |
| `focus-within:`  | 子要素にフォーカスがある時 | フォームグループ           |
| `focus-visible:` | キーボードフォーカス時     | アクセシビリティ対応       |
| `disabled:`      | disabled属性がある時       | 無効化されたボタン         |
| `first:`         | 最初の子要素               | リストの最初の項目         |
| `last:`          | 最後の子要素               | リストの最後の項目         |
| `odd:`           | 奇数番目の子要素           | テーブルの縞模様           |
| `even:`          | 偶数番目の子要素           | テーブルの縞模様           |
| `group-hover:`   | 親要素にhoverした時        | カード内のアイコン変化     |
| `peer-checked:`  | 兄弟要素がチェックされた時 | カスタムトグル             |
| `placeholder:`   | プレースホルダーテキスト   | 入力欄のプレースホルダー色 |

### 実践例

```html
<!-- ボタンの状態変化 -->
<button
  class="bg-blue-600 text-white px-6 py-3 rounded-lg
               hover:bg-blue-700
               active:bg-blue-800
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
               disabled:bg-gray-400 disabled:cursor-not-allowed
               transition-colors duration-200"
>
  送信する
</button>

<!-- 入力欄 -->
<input
  type="text"
  class="w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
              placeholder:text-gray-400
              transition-all duration-200"
  placeholder="メールアドレスを入力"
/>

<!-- テーブルの縞模様 -->
<table class="w-full">
  <tbody>
    <tr class="odd:bg-gray-50 even:bg-white hover:bg-blue-50">
      <td class="p-3">行1</td>
    </tr>
    <tr class="odd:bg-gray-50 even:bg-white hover:bg-blue-50">
      <td class="p-3">行2</td>
    </tr>
    <tr class="odd:bg-gray-50 even:bg-white hover:bg-blue-50">
      <td class="p-3">行3</td>
    </tr>
  </tbody>
</table>
```

### group-hoverの使い方

親要素にhoverした時に、子要素のスタイルを変えたい場合に使う。

```html
<!-- 親要素に group クラスを付ける -->
<a
  href="#"
  class="group block bg-white rounded-lg p-6 shadow
                   hover:shadow-lg transition-shadow duration-200"
>
  <h3
    class="text-lg font-bold text-gray-900
             group-hover:text-blue-600 transition-colors duration-200"
  >
    記事タイトル
  </h3>
  <p class="text-gray-500 group-hover:text-gray-700 transition-colors duration-200">
    カードにhoverすると、タイトルの色も変わります。
  </p>
  <span
    class="text-blue-500 group-hover:translate-x-2
               inline-block transition-transform duration-200"
  >
    続きを読む →
  </span>
</a>
```

---

## カスタマイズ（tailwind.config.js）

Tailwindの大きな強みは高いカスタマイズ性。`tailwind.config.js`でプロジェクト独自のデザインシステムを構築できる。

### テーマの拡張

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 独自の色を追加
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        brand: {
          green: '#00C853',
          dark: '#1A1A2E',
        },
      },

      // 独自のフォントファミリー
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      // 独自のスペーシング
      spacing: {
        128: '32rem',
        144: '36rem',
      },

      // 独自のブレイクポイント
      screens: {
        '3xl': '1920px',
      },

      // 独自のアニメーション
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

使い方:

```html
<!-- 独自の色を使う -->
<button class="bg-primary-500 hover:bg-primary-600 text-white">プライマリボタン</button>
<div class="bg-brand-dark text-white">ブランドカラー</div>

<!-- 独自のアニメーション -->
<div class="animate-fade-in">フェードイン表示</div>
<div class="animate-slide-up">スライドアップ表示</div>
```

### extendとoverrideの違い

```javascript
// tailwind.config.js
export default {
  theme: {
    // extend: 既存の値に追加（推奨）
    extend: {
      colors: {
        brand: '#FF6B00', // 既存の色はそのまま、brandだけ追加
      },
    },

    // 直接指定: 既存の値を完全に上書き（注意！）
    // colors: {
    //   brand: '#FF6B00', // これだけになり、blue, red等が使えなくなる
    // },
  },
}
```

重要: 基本的には`extend`の中に書くこと。`extend`を使わないと既存のユーティリティが全て使えなくなる。

---

## @apply（ユーティリティクラスの抽出）

`@apply`を使うと、よく使うユーティリティクラスの組み合わせをカスタムCSSクラスにまとめられる。

### 基本的な使い方

```css
/* src/index.css */
@import 'tailwindcss';

/* ボタンの共通スタイルを定義 */
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200;
}

.btn-primary {
  @apply btn bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
  @apply btn bg-gray-200 text-gray-800 hover:bg-gray-300;
}

.btn-danger {
  @apply btn bg-red-600 text-white hover:bg-red-700;
}

/* 入力欄の共通スタイル */
.input {
  @apply w-full px-4 py-2 border border-gray-300 rounded-lg
         focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
         transition-all duration-200;
}
```

```html
<!-- 使い方 -->
<button class="btn-primary">保存</button>
<button class="btn-secondary">キャンセル</button>
<button class="btn-danger">削除</button>
<input type="text" class="input" placeholder="入力してください" />
```

### @applyを使いすぎてはいけない理由

`@apply`は便利だが、多用するとTailwind CSSのメリットが失われる。

| 状況                                             | 推奨             | 理由                              |
| ------------------------------------------------ | ---------------- | --------------------------------- |
| React/Vueコンポーネントでの再利用                | コンポーネント化 | JSXでクラスを直接書ける           |
| HTMLだけのプロジェクトで同じスタイルを何度も使う | `@apply`         | コンポーネントが使えないため      |
| 非常に長いクラスの組み合わせ                     | `@apply`を検討   | 可読性を優先する場合              |
| ほぼ全てのスタイルを`@apply`で書く               | やめるべき       | 従来のCSSを書くのと変わらなくなる |

Reactを使っている場合、`@apply`よりもコンポーネント化で対応するのが推奨:

```jsx
// Button.jsx -- コンポーネントで再利用する方が良い
const Button = ({ variant = 'primary', children, ...props }) => {
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${styles[variant]}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

---

## よく使うレイアウトパターン

### パターン1: ナビゲーションバー

```html
<nav class="bg-white shadow-md">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- ロゴ -->
      <div class="flex-shrink-0">
        <a href="/" class="text-2xl font-bold text-blue-600"> TechBlog </a>
      </div>

      <!-- デスクトップナビ -->
      <div class="hidden md:flex items-center gap-8">
        <a
          href="#"
          class="text-gray-700 hover:text-blue-600 font-medium
                          transition-colors duration-200"
        >
          ホーム
        </a>
        <a
          href="#"
          class="text-gray-700 hover:text-blue-600 font-medium
                          transition-colors duration-200"
        >
          記事
        </a>
        <a
          href="#"
          class="text-gray-700 hover:text-blue-600 font-medium
                          transition-colors duration-200"
        >
          カテゴリ
        </a>
        <a
          href="#"
          class="text-gray-700 hover:text-blue-600 font-medium
                          transition-colors duration-200"
        >
          お問い合わせ
        </a>
      </div>

      <!-- ユーザーメニュー -->
      <div class="hidden md:flex items-center gap-4">
        <button class="text-gray-600 hover:text-gray-900">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-lg
                       hover:bg-blue-700 transition-colors duration-200"
        >
          ログイン
        </button>
      </div>

      <!-- モバイルメニューボタン -->
      <div class="md:hidden">
        <button class="text-gray-600 hover:text-gray-900 p-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</nav>
```

### パターン2: カードコンポーネント

```html
<div
  class="max-w-sm bg-white rounded-xl shadow-md overflow-hidden
            hover:shadow-xl transition-shadow duration-300"
>
  <!-- カード画像 -->
  <div class="relative">
    <img
      src="https://via.placeholder.com/400x200"
      alt="カード画像"
      class="w-full h-48 object-cover"
    />
    <span
      class="absolute top-3 right-3 bg-blue-600 text-white text-xs
                 font-medium px-3 py-1 rounded-full"
    >
      新着
    </span>
  </div>

  <!-- カード本文 -->
  <div class="p-6">
    <div class="flex items-center gap-2 mb-3">
      <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
        プログラミング
      </span>
      <span class="text-xs text-gray-400">2026年3月28日</span>
    </div>

    <h3
      class="text-lg font-bold text-gray-900 mb-2
               line-clamp-2 hover:text-blue-600 transition-colors"
    >
      Tailwind CSSで美しいUIを構築する方法
    </h3>

    <p class="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
      Tailwind CSSを使って、レスポンシブでアクセシブルなUIを 効率的に構築する方法を解説します。
    </p>

    <!-- フッター -->
    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
        <span class="text-sm text-gray-700">山田太郎</span>
      </div>
      <a href="#" class="text-sm text-blue-600 hover:text-blue-800 font-medium"> 続きを読む → </a>
    </div>
  </div>
</div>
```

### パターン3: お問い合わせフォーム

```html
<div class="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8">
  <h2 class="text-2xl font-bold text-gray-900 mb-2">お問い合わせ</h2>
  <p class="text-gray-500 mb-8">お気軽にご連絡ください。</p>

  <form class="space-y-6">
    <!-- 名前（2列） -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">姓</label>
        <input
          type="text"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                      focus:outline-none transition-all duration-200
                      placeholder:text-gray-400"
          placeholder="山田"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">名</label>
        <input
          type="text"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                      focus:outline-none transition-all duration-200
                      placeholder:text-gray-400"
          placeholder="太郎"
        />
      </div>
    </div>

    <!-- メール -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1"> メールアドレス </label>
      <input
        type="email"
        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                    focus:outline-none transition-all duration-200
                    placeholder:text-gray-400"
        placeholder="example@mail.com"
      />
    </div>

    <!-- お問い合わせ種類 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1"> お問い合わせ種類 </label>
      <select
        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                     focus:outline-none transition-all duration-200
                     text-gray-700"
      >
        <option value="">選択してください</option>
        <option value="general">一般的なお問い合わせ</option>
        <option value="support">技術サポート</option>
        <option value="billing">料金について</option>
        <option value="other">その他</option>
      </select>
    </div>

    <!-- メッセージ -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1"> メッセージ </label>
      <textarea
        rows="5"
        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                       focus:outline-none transition-all duration-200
                       placeholder:text-gray-400 resize-none"
        placeholder="お問い合わせ内容を入力してください"
      ></textarea>
    </div>

    <!-- 送信ボタン -->
    <button
      type="submit"
      class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium
                   hover:bg-blue-700 active:bg-blue-800
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   transition-colors duration-200"
    >
      送信する
    </button>
  </form>
</div>
```

### パターン4: フッター

```html
<footer class="bg-gray-900 text-gray-300">
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <!-- ブランド情報 -->
      <div>
        <h3 class="text-white text-xl font-bold mb-4">TechBlog</h3>
        <p class="text-sm leading-relaxed mb-4">
          初心者からミドルエンジニアまで、実践的な技術情報を発信するブログです。
        </p>
      </div>

      <!-- リンク1 -->
      <div>
        <h4 class="text-white font-semibold mb-4">コンテンツ</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="#" class="hover:text-white transition-colors">最新記事</a></li>
          <li><a href="#" class="hover:text-white transition-colors">チュートリアル</a></li>
          <li><a href="#" class="hover:text-white transition-colors">ハンズオン</a></li>
          <li><a href="#" class="hover:text-white transition-colors">書籍レビュー</a></li>
        </ul>
      </div>

      <!-- リンク2 -->
      <div>
        <h4 class="text-white font-semibold mb-4">カテゴリ</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="#" class="hover:text-white transition-colors">フロントエンド</a></li>
          <li><a href="#" class="hover:text-white transition-colors">バックエンド</a></li>
          <li><a href="#" class="hover:text-white transition-colors">インフラ</a></li>
          <li><a href="#" class="hover:text-white transition-colors">AI/ML</a></li>
        </ul>
      </div>

      <!-- リンク3 -->
      <div>
        <h4 class="text-white font-semibold mb-4">関連リンク</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="#" class="hover:text-white transition-colors">プライバシーポリシー</a></li>
          <li><a href="#" class="hover:text-white transition-colors">利用規約</a></li>
          <li><a href="#" class="hover:text-white transition-colors">お問い合わせ</a></li>
          <li><a href="#" class="hover:text-white transition-colors">運営者情報</a></li>
        </ul>
      </div>
    </div>

    <!-- コピーライト -->
    <div class="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
      <p>&copy; 2026 TechBlog. All rights reserved.</p>
    </div>
  </div>
</footer>
```

---

## Tailwind CSSとコンポーネントライブラリ

Tailwind CSSをベースにした人気のコンポーネントライブラリを紹介する。これらを使うことで、開発速度をさらに向上できる。

### daisyUI

Tailwind CSS上に構築されたコンポーネントライブラリ。Bootstrapのようにクラス名を付けるだけでスタイルが適用される。

```bash
npm install daisyui
```

```javascript
// tailwind.config.js
export default {
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark', 'cupcake'],
  },
}
```

```html
<!-- daisyUIのボタン -->
<button class="btn btn-primary">プライマリ</button>
<button class="btn btn-secondary">セカンダリ</button>
<button class="btn btn-accent">アクセント</button>

<!-- daisyUIのカード -->
<div class="card w-96 bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">カードタイトル</h2>
    <p>カードの本文です。</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">詳細</button>
    </div>
  </div>
</div>
```

### shadcn/ui

コンポーネントのソースコードを自分のプロジェクトにコピーして使う方式のライブラリ。React + Tailwind CSS + Radix UIの組み合わせ。カスタマイズ性が非常に高い。

```bash
# 初期設定
npx shadcn@latest init

# 使いたいコンポーネントを追加
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

```jsx
// Reactでの使用例
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>タイトル</CardTitle>
      </CardHeader>
      <CardContent>
        <p>コンテンツ</p>
        <Button variant="default">クリック</Button>
      </CardContent>
    </Card>
  )
}
```

### ライブラリ比較表

| 特徴               | daisyUI                | shadcn/ui              | Headless UI              |
| ------------------ | ---------------------- | ---------------------- | ------------------------ |
| 対応フレームワーク | 全て（HTML/CSS）       | React                  | React, Vue               |
| カスタマイズ性     | 中                     | 高                     | 高                       |
| コンポーネント数   | 多い                   | 多い                   | 少ない（基本のみ）       |
| 導入の簡単さ       | 非常に簡単             | やや手間               | 中程度                   |
| バンドルサイズ     | 小さい                 | 小さい（必要な分だけ） | 小さい                   |
| アクセシビリティ   | 標準的                 | Radix UIベースで優秀   | WAI-ARIA準拠             |
| 学習コスト         | 低い                   | 中程度                 | 中程度                   |
| TypeScriptサポート | あり                   | 優秀                   | あり                     |
| 適した場面         | プロトタイプ、個人開発 | 本番アプリ             | 独自デザインが必要な場合 |

---

## パフォーマンス

### 未使用クラスの自動削除

Tailwind CSSは全てのユーティリティクラスを生成すると非常に大きなCSSファイルになる。しかし、ビルド時に実際に使用しているクラスだけを抽出して、未使用のクラスを自動的に削除する仕組みがある。

この仕組みが正しく動くためには、`tailwind.config.js`の`content`設定が正確である必要がある:

```javascript
// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // ソースコードのパスを正確に指定
  ],
  // ...
}
```

### やってはいけないこと（クラス名の動的生成）

Tailwindはビルド時にファイルを静的に解析するため、動的にクラス名を組み立てるとビルドから漏れてしまう。

```jsx
// NG: 動的に文字列を結合してクラス名を作る
const color = 'blue'
const size = '500'
;<div className={`text-${color}-${size}`}>テキスト</div>
// → ビルド時に "text-blue-500" を認識できず、CSSが適用されない

// OK: 完全なクラス名を使う
const colorClass = 'text-blue-500'
;<div className={colorClass}>テキスト</div>

// OK: 条件分岐で完全なクラス名を使う
const textColor = isError ? 'text-red-500' : 'text-blue-500'
;<div className={textColor}>テキスト</div>

// OK: オブジェクトで管理する
const colorMap = {
  primary: 'text-blue-500',
  success: 'text-green-500',
  danger: 'text-red-500',
}
;<div className={colorMap[variant]}>テキスト</div>
```

### ビルドサイズの比較

| 状態                             | CSSファイルサイズの目安 |
| -------------------------------- | ----------------------- |
| 開発時（全クラス含む）           | 約3-4MB                 |
| ビルド後（未使用クラス削除済み） | 約10-30KB               |
| gzip圧縮後                       | 約5-10KB                |

ビルド後のサイズは非常に小さく、パフォーマンスの問題にはならない。

### clsxやtwMergeの活用

複数のクラスを条件付きで結合する場合、`clsx`や`tailwind-merge`を使うとコードがすっきりする。

```bash
npm install clsx tailwind-merge
```

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// クラス名を安全にマージするユーティリティ関数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```jsx
import { cn } from '@/lib/utils'

// 使用例
;<button
  className={cn(
    'px-4 py-2 rounded-lg font-medium', // 基本スタイル
    isActive && 'bg-blue-600 text-white', // アクティブ時
    isDisabled && 'opacity-50 cursor-not-allowed', // 無効時
    className // 外部から渡されたクラス
  )}
>
  {children}
</button>
```

`tailwind-merge`が重要な理由: 同じCSSプロパティに対して複数のクラスが指定された場合、後から指定したクラスが優先されるように解決してくれる。

```typescript
import { twMerge } from 'tailwind-merge'

twMerge('px-4 px-8') // → 'px-8'（後のものが優先）
twMerge('text-red-500 text-blue-500') // → 'text-blue-500'
```

---

## 実践演習

以下の課題に取り組むことで、Tailwind CSSの理解が深まる。

### 演習1: プロフィールカードを作成

以下の要件でプロフィールカードを作ってみよう。

- 丸いアバター画像
- 名前（太字、大きめ）
- 肩書き（グレー、小さめ）
- 自己紹介文
- SNSリンクボタン3つ（横並び）
- ホバーエフェクト付き
- レスポンシブ対応

### 演習2: 価格比較テーブルを作成

- 3つのプラン（無料、プロ、ビジネス）
- 各プランの機能一覧
- おすすめプランを目立たせる
- ダークモード対応

### 演習3: レスポンシブダッシュボード

- サイドバー（モバイルでは非表示）
- ヘッダーバー
- 統計カード4つ（モバイル1列、タブレット2列、PC4列）
- メインコンテンツエリア

---

## 参考リンク

- [Tailwind CSS 公式ドキュメント](https://tailwindcss.com/docs) - ユーティリティクラスの全リファレンス
- [Tailwind CSS 公式プレイグラウンド](https://play.tailwindcss.com/) - ブラウザ上でTailwind CSSを試せる環境
- [Tailwind CSS 公式ブログ](https://tailwindcss.com/blog) - 新バージョンの変更点やベストプラクティス
- [daisyUI 公式サイト](https://daisyui.com/) - Tailwind CSS向けコンポーネントライブラリ
- [shadcn/ui 公式サイト](https://ui.shadcn.com/) - React + Tailwind CSSのUIコンポーネント集
- [Headless UI 公式サイト](https://headlessui.com/) - アクセシブルなUIコンポーネント
- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet) - クラス名の早見表
- [tailwind-merge GitHub](https://github.com/dcastil/tailwind-merge) - Tailwindクラスの競合解決ライブラリ
