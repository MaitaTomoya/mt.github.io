---
title: 'CSS'
order: 2
section: 'フロントエンド基礎'
---

# CSS

## CSSとは

CSSは **Cascading Style Sheets** の略で、Webページの「見た目」を担当する言語。HTMLが「骨組み」を作り、CSSが「装飾」を施す。

HTMLだけのWebページは、白い背景に黒い文字が並んでいるだけの素っ気ないページになる。CSSを使うことで、色、フォント、レイアウト、アニメーションなど、見た目に関するあらゆることを制御できる。

家に例えると:

| 役割   | 技術       | 家で例えると                   |
| ------ | ---------- | ------------------------------ |
| 構造   | HTML       | 柱、壁、屋根（骨組み）         |
| 見た目 | CSS        | 壁紙、塗装、家具の配置（内装） |
| 動き   | JavaScript | 電気、水道、自動ドア（機能）   |

CSSは「プログラミング言語」ではなく「スタイルシート言語」。計算やロジックは基本的に書けないが、Webページの見た目を完全にコントロールできる強力な言語。

## なぜCSSが必要なのか

### 1. HTMLだけでは見た目が制御できない

HTMLはあくまで「構造」を定義する言語。「この文字を赤くしたい」「2カラムのレイアウトにしたい」といった見た目の要求に応えられない。

### 2. デザインと構造を分離できる

CSSを使えば、HTMLファイルには構造だけを書き、見た目はCSSファイルに分離できる。これにより:

- HTMLが読みやすくなる
- デザインの変更がCSSだけで済む
- 同じCSSを複数のHTMLページに適用できる
- デザイナーとエンジニアの分業がしやすくなる

### 3. レスポンシブデザインが実現できる

スマートフォン、タブレット、PCなど、画面サイズが異なるデバイスに対して、CSSで見た目を切り替えることができる。

## CSSの3つの書き方

CSSには3つの書き方があり、それぞれメリット・デメリットがある。

### 1. インラインスタイル

HTML要素に直接`style`属性を書く方法。

```html
<p style="color: red; font-size: 18px;">赤い文字です</p>
```

### 2. 内部スタイルシート

HTMLファイルの`<head>`内に`<style>`タグで書く方法。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <style>
      p {
        color: red;
        font-size: 18px;
      }
    </style>
  </head>
  <body>
    <p>赤い文字です</p>
  </body>
</html>
```

### 3. 外部スタイルシート（推奨）

別ファイル（.css）にスタイルを書き、HTMLから読み込む方法。

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="ja">
  <head>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <p>赤い文字です</p>
  </body>
</html>
```

```css
/* style.css */
p {
  color: red;
  font-size: 18px;
}
```

### 比較表

| 書き方             | メリット                             | デメリット                               | 推奨度 |
| ------------------ | ------------------------------------ | ---------------------------------------- | ------ |
| インライン         | すぐ書ける、特定要素にだけ適用       | 再利用不可、HTMLが読みにくくなる         | 低     |
| 内部スタイルシート | 1ファイルで完結、小規模ページに便利  | 複数ページで使い回せない                 | 中     |
| 外部スタイルシート | 再利用可能、キャッシュが効く、保守性 | ファイルが増える（ただし管理はしやすい） | 高     |

**実務では外部スタイルシートがほぼ100%使われる。** 理由は:

- 1つのCSSファイルを複数のHTMLページで共有できる
- ブラウザがCSSファイルをキャッシュ（一時保存）するので、2回目以降の読み込みが速い
- HTMLとCSSが分離されているので、チーム開発がしやすい

## CSSの基本構文

CSSは「セレクタ」「プロパティ」「値」の3つで構成される。

```css
セレクタ {
  プロパティ: 値;
  プロパティ: 値;
}
```

```css
/* 例: 全ての段落を赤い文字、18pxにする */
p {
  color: red;
  font-size: 18px;
}
```

- **セレクタ**: どの要素にスタイルを適用するか指定する（`p`は全ての`<p>`要素）
- **プロパティ**: 何を変えるか（`color`は文字色、`font-size`は文字サイズ）
- **値**: どう変えるか（`red`は赤、`18px`は18ピクセル）

## セレクタの基本

セレクタは「どの要素にスタイルを適用するか」を指定するもの。CSSの中で最も重要な概念の1つ。

### 要素セレクタ（タグセレクタ）

HTMLのタグ名をそのまま指定する。

```css
/* 全ての<p>要素に適用 */
p {
  color: blue;
}

/* 全ての<h1>要素に適用 */
h1 {
  font-size: 32px;
}
```

### クラスセレクタ

HTML要素の`class`属性を指定する。ドット（`.`）で始める。**最も頻繁に使うセレクタ。**

```html
<p class="highlight">強調したい段落</p>
<p class="highlight">こちらも強調</p>
<p>普通の段落</p>
```

```css
.highlight {
  color: red;
  background-color: yellow;
}
```

1つの要素に複数のクラスを付けることも可能。

```html
<p class="highlight large">赤くて大きい段落</p>
```

```css
.highlight {
  color: red;
}
.large {
  font-size: 24px;
}
```

### IDセレクタ

HTML要素の`id`属性を指定する。シャープ（`#`）で始める。**ページ内で1つだけの要素**に使う。

```html
<header id="main-header">サイトヘッダー</header>
```

```css
#main-header {
  background-color: navy;
  color: white;
}
```

**注意:** IDセレクタは優先度が高すぎるため、実務ではスタイリング目的にはあまり使わない。クラスセレクタを使うのが主流。IDはJavaScriptでの要素取得やページ内リンクに使うことが多い。

### 子孫セレクタ

スペースで区切って、ある要素の中にある要素を指定する。

```html
<nav>
  <ul>
    <li><a href="/">ホーム</a></li>
    <li><a href="/about">概要</a></li>
  </ul>
</nav>
```

```css
/* nav要素の中にある全てのa要素 */
nav a {
  color: white;
  text-decoration: none;
}
```

### 子セレクタ

`>`を使って、直接の子要素だけを指定する（孫要素は対象外）。

```css
/* ulの直接の子であるliだけ */
ul > li {
  list-style: none;
}
```

### 擬似クラスセレクタ

要素の「状態」に応じてスタイルを適用する。コロン（`:`）で始める。

```css
/* マウスを乗せたとき */
a:hover {
  color: orange;
  text-decoration: underline;
}

/* クリック中 */
a:active {
  color: red;
}

/* フォーカスが当たっているとき（Tabキーで移動したとき等） */
input:focus {
  border-color: blue;
  outline: none;
}

/* 最初の子要素 */
li:first-child {
  font-weight: bold;
}

/* 最後の子要素 */
li:last-child {
  border-bottom: none;
}

/* 偶数番目の要素 */
tr:nth-child(even) {
  background-color: #f2f2f2;
}
```

### セレクタの優先度

複数のセレクタが同じ要素にスタイルを指定した場合、優先度が高いものが適用される。

| 優先度  | セレクタの種類     | 例                       | 詳細度（a-b-c）   |
| ------- | ------------------ | ------------------------ | ----------------- |
| 1（高） | !important         | `color: red !important;` | 最強              |
| 2       | インラインスタイル | `style="color: red"`     | style属性で最優先 |
| 3       | IDセレクタ         | `#header`                | 1-0-0             |
| 4       | クラスセレクタ     | `.highlight`             | 0-1-0             |
| 5       | 擬似クラス         | `:hover`                 | 0-1-0             |
| 6（低） | 要素セレクタ       | `p`                      | 0-0-1             |

```css
/* この場合、.specialの方が優先度が高いので赤になる */
p {
  color: blue; /* 詳細度: 0-0-1 */
}
.special {
  color: red; /* 詳細度: 0-1-0 */
}
```

```html
<p class="special">この文字は赤くなる</p>
```

**実務での指針:**

- `!important`はなるべく使わない（デバッグが困難になる）
- IDセレクタではなくクラスセレクタを使う（優先度が適度で扱いやすい）
- セレクタはできるだけシンプルに保つ

## ボックスモデル

CSSの最も重要な概念の1つ。**全てのHTML要素は「箱（ボックス）」として扱われる。** この箱は4つの領域で構成されている。

```
+-------------------------------------------+
|              margin（外側の余白）           |
|  +---------------------------------------+|
|  |           border（境界線）              ||
|  |  +-----------------------------------+||
|  |  |        padding（内側の余白）        |||
|  |  |  +-------------------------------+|||
|  |  |  |                               ||||
|  |  |  |        content（内容）          ||||
|  |  |  |                               ||||
|  |  |  +-------------------------------+|||
|  |  +-----------------------------------+||
|  +---------------------------------------+|
+-------------------------------------------+
```

| 領域    | 役割                             | 例え                     |
| ------- | -------------------------------- | ------------------------ |
| content | 実際のテキストや画像が表示される | 絵画そのもの             |
| padding | contentとborderの間の余白        | 額縁の中のマット（台紙） |
| border  | ボックスの境界線                 | 額縁                     |
| margin  | ボックスの外側の余白             | 額縁と壁の間の隙間       |

```css
.box {
  /* content */
  width: 300px;
  height: 200px;

  /* padding（内側の余白） */
  padding: 20px;

  /* border（境界線） */
  border: 2px solid black;

  /* margin（外側の余白） */
  margin: 10px;
}
```

### 幅の計算に注意

デフォルトでは、`width`は**contentの幅だけ**を指定する。paddingとborderは別に加算される。

```css
.box {
  width: 300px;
  padding: 20px;
  border: 2px solid black;
}
/* 実際の幅 = 300 + 20*2 + 2*2 = 344px */
```

これは直感に反するため、`box-sizing: border-box`を使うのが現代の標準。

```css
/* 全ての要素にborder-boxを適用（実務ではほぼ必須のリセット） */
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

`border-box`を指定すると、`width`がpadding + border + contentの合計になる。つまり`width: 300px`と指定すれば、実際の幅が300pxになる。

### paddingとmarginの書き方

```css
/* 4方向すべて同じ値 */
padding: 20px;

/* 上下 左右 */
padding: 10px 20px;

/* 上 左右 下 */
padding: 10px 20px 30px;

/* 上 右 下 左（時計回り） */
padding: 10px 20px 30px 40px;

/* 個別に指定 */
padding-top: 10px;
padding-right: 20px;
padding-bottom: 30px;
padding-left: 40px;
```

marginも同じ書き方ができる。

### marginの相殺（マージンの崩壊）

上下に並んだ要素のmarginは**重なる（大きい方が採用される）**。これは初心者がハマりやすいポイント。

```css
.box1 {
  margin-bottom: 30px;
}
.box2 {
  margin-top: 20px;
}
/* 間の余白は30px + 20px = 50pxではなく、30px（大きい方）になる */
```

## display

`display`プロパティは、要素がどのように表示されるかを決める。レイアウトの根幹となるプロパティ。

### 主要なdisplayの値

| 値           | 特徴                                           | 代表的な要素               |
| ------------ | ---------------------------------------------- | -------------------------- |
| block        | 幅いっぱいに広がる。次の要素は改行される       | div, p, h1-h6, section     |
| inline       | 内容の幅だけ。横に並ぶ。幅・高さの指定不可     | span, a, strong, em        |
| inline-block | inlineのように横に並ぶが、幅・高さの指定が可能 | img, button（初期値）      |
| none         | 要素が完全に非表示（スペースも取らない）       | （JavaScriptで切り替え用） |
| flex         | 子要素をフレキシブルに配置（後述）             | レイアウト用               |
| grid         | 子要素をグリッド状に配置（後述）               | レイアウト用               |

```css
/* block: 幅いっぱい、次の要素は下に来る */
div {
  display: block;
}

/* inline: コンテンツ幅だけ、横に並ぶ */
span {
  display: inline;
}

/* inline-block: 横に並びつつ、サイズ指定可能 */
.badge {
  display: inline-block;
  width: 100px;
  height: 30px;
  background-color: blue;
  color: white;
  text-align: center;
}

/* none: 完全に非表示 */
.hidden {
  display: none;
}
```

### blockとinlineの違い（よく混同されるポイント）

```
block要素:
+--------------------------------------------------+
|              要素の内容                            |
+--------------------------------------------------+
+--------------------------------------------------+
|              次のblock要素                         |
+--------------------------------------------------+

inline要素:
[要素A][要素B][要素C] ← 横に並ぶ
```

## Flexbox

**Flexbox（フレックスボックス）** は、要素を横並びや縦並びに柔軟に配置するためのレイアウト手法。現代のWebレイアウトで最も頻繁に使われる。

### 基本概念: 親要素と子要素

Flexboxでは、`display: flex`を指定した**親要素（コンテナ）** と、その中の**子要素（アイテム）** の関係で考える。

```html
<div class="container">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>
```

```css
.container {
  display: flex; /* これだけで子要素が横並びになる */
}
```

### 主軸と交差軸

Flexboxには「主軸（Main Axis）」と「交差軸（Cross Axis）」がある。

```
flex-direction: row（デフォルト）の場合:

主軸 →→→→→→→→→→→
↓ [アイテム1] [アイテム2] [アイテム3]
交差軸

flex-direction: columnの場合:

主軸
↓
[アイテム1]
[アイテム2]   →→→ 交差軸
[アイテム3]
```

### 親要素（コンテナ）のプロパティ

```css
.container {
  display: flex;

  /* 子要素の並ぶ方向 */
  flex-direction: row; /* 横並び（デフォルト） */
  flex-direction: row-reverse; /* 横並び（逆順） */
  flex-direction: column; /* 縦並び */
  flex-direction: column-reverse; /* 縦並び（逆順） */

  /* 主軸方向の配置 */
  justify-content: flex-start; /* 左寄せ（デフォルト） */
  justify-content: flex-end; /* 右寄せ */
  justify-content: center; /* 中央寄せ */
  justify-content: space-between; /* 両端揃え（間に均等余白） */
  justify-content: space-around; /* 各アイテムの両側に均等余白 */
  justify-content: space-evenly; /* 全ての余白が均等 */

  /* 交差軸方向の配置 */
  align-items: stretch; /* 高さを引き伸ばす（デフォルト） */
  align-items: flex-start; /* 上揃え */
  align-items: flex-end; /* 下揃え */
  align-items: center; /* 中央揃え */

  /* 折り返し */
  flex-wrap: nowrap; /* 折り返さない（デフォルト） */
  flex-wrap: wrap; /* 折り返す */

  /* アイテム間の余白 */
  gap: 16px; /* 全方向に16pxの余白 */
  gap: 16px 24px; /* 行間16px、列間24px */
}
```

### justify-contentの違い（図解）

```
flex-start（デフォルト）:
|[1][2][3]                    |

flex-end:
|                    [1][2][3]|

center:
|         [1][2][3]           |

space-between:
|[1]         [2]         [3] |

space-around:
|  [1]     [2]     [3]       |

space-evenly:
|   [1]    [2]    [3]        |
```

### 実用例: ナビゲーションバー

```html
<nav class="navbar">
  <div class="logo">MyApp</div>
  <ul class="nav-links">
    <li><a href="/">ホーム</a></li>
    <li><a href="/about">概要</a></li>
    <li><a href="/contact">お問い合わせ</a></li>
  </ul>
</nav>
```

```css
.navbar {
  display: flex;
  justify-content: space-between; /* ロゴと右メニューを両端に */
  align-items: center; /* 縦方向中央揃え */
  padding: 16px 24px;
  background-color: #333;
  color: white;
}

.nav-links {
  display: flex;
  gap: 24px; /* リンク間の余白 */
  list-style: none; /* リストの黒丸を消す */
}
```

### 実用例: カードを横並びに

```css
.card-container {
  display: flex;
  flex-wrap: wrap; /* 画面幅が足りなければ折り返す */
  gap: 16px;
}

.card {
  flex: 1 1 300px; /* 最小300px、余った空間を均等に広がる */
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
```

### 実用例: 上下左右の中央揃え（最頻出パターン）

```css
.center-container {
  display: flex;
  justify-content: center; /* 横方向中央 */
  align-items: center; /* 縦方向中央 */
  height: 100vh; /* 画面全体の高さ */
}
```

## Grid

**CSS Grid** は、2次元（行と列）のレイアウトを作るための手法。Flexboxが「1方向のレイアウト」に強いのに対して、Gridは「2方向のレイアウト」に強い。

### FlexboxとGridの使い分け

| 特徴           | Flexbox              | Grid                             |
| -------------- | -------------------- | -------------------------------- |
| レイアウト方向 | 1方向（行 or 列）    | 2方向（行 and 列）               |
| 得意なこと     | 要素の横並び         | ページ全体のレイアウト           |
| 使う場面       | ナビバー、カード並び | ダッシュボード、複雑なレイアウト |

### 基本的な使い方

```html
<div class="grid-container">
  <div class="grid-item">1</div>
  <div class="grid-item">2</div>
  <div class="grid-item">3</div>
  <div class="grid-item">4</div>
  <div class="grid-item">5</div>
  <div class="grid-item">6</div>
</div>
```

```css
.grid-container {
  display: grid;
  grid-template-columns: 200px 200px 200px; /* 3列、各200px */
  grid-template-rows: 100px 100px; /* 2行、各100px */
  gap: 16px; /* 行間・列間の余白 */
}
```

結果:

```
+--------+--------+--------+
|   1    |   2    |   3    |
+--------+--------+--------+
|   4    |   5    |   6    |
+--------+--------+--------+
```

### fr単位（fractionの略）

余った空間を比率で分割する単位。Gridレイアウトで非常によく使う。

```css
.grid-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr; /* 1:2:1の比率 */
  gap: 16px;
}
```

### repeat関数

同じ値の繰り返しを簡潔に書ける。

```css
/* これは */
grid-template-columns: 1fr 1fr 1fr 1fr;

/* これと同じ */
grid-template-columns: repeat(4, 1fr);
```

### レスポンシブなグリッド

```css
.grid-container {
  display: grid;
  /* 最小250px、余った空間は均等に分配、自動で列数を調整 */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}
```

この1行で、画面幅に応じて自動的に列数が変わるレスポンシブなグリッドが作れる。非常に便利なパターン。

### 実用例: 典型的なページレイアウト

```css
.page {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr 40px;
  grid-template-areas:
    'header header'
    'sidebar main'
    'footer footer';
  min-height: 100vh;
}

.header {
  grid-area: header;
}
.sidebar {
  grid-area: sidebar;
}
.main {
  grid-area: main;
}
.footer {
  grid-area: footer;
}
```

```
+------------------------------+
|          header               |
+--------+---------------------+
|        |                     |
|sidebar |       main          |
|        |                     |
+--------+---------------------+
|          footer               |
+------------------------------+
```

## レスポンシブデザイン

レスポンシブデザインとは、1つのWebページが様々な画面サイズ（スマートフォン、タブレット、PC）に対応するデザイン手法。

### メディアクエリ

画面幅などの条件に応じてスタイルを切り替える仕組み。

```css
/* 全ての画面サイズに適用 */
.container {
  padding: 16px;
}

/* 画面幅が768px以上のとき */
@media (min-width: 768px) {
  .container {
    padding: 24px;
    max-width: 720px;
    margin: 0 auto;
  }
}

/* 画面幅が1024px以上のとき */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}
```

### モバイルファーストとは

**まずスマートフォン向けのスタイルを書き、画面が大きくなるにつれてスタイルを追加する** 考え方。現代のWeb開発では、モバイルファーストが標準。

```css
/* モバイルファースト: 小さい画面がデフォルト */
.nav-links {
  display: none; /* スマホではメニューを非表示 */
}

@media (min-width: 768px) {
  .nav-links {
    display: flex; /* タブレット以上で表示 */
  }
}
```

理由:

- 世界中のWeb閲覧の50%以上がモバイル端末
- 小さい画面のシンプルなレイアウトをベースにする方が設計しやすい
- 不要なスタイルを上書きするより、必要なスタイルを追加する方が効率的

### よく使われるブレークポイント

| 名前               | 画面幅          | 対象デバイス   |
| ------------------ | --------------- | -------------- |
| モバイル           | 0px - 767px     | スマートフォン |
| タブレット         | 768px - 1023px  | タブレット     |
| デスクトップ       | 1024px - 1279px | ノートPC       |
| ラージデスクトップ | 1280px以上      | デスクトップPC |

### viewportの設定

レスポンシブデザインには、HTMLの`<head>`内に以下のmetaタグが**必須**。

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

これがないと、スマートフォンでPC版のサイズが表示されてしまう。

### レスポンシブで便利なCSS単位

| 単位    | 説明                                 | 使い所                 |
| ------- | ------------------------------------ | ---------------------- |
| px      | 固定サイズ                           | border、shadow等       |
| %       | 親要素に対する割合                   | 幅の指定               |
| em      | 親要素のフォントサイズ基準           | padding、margin        |
| rem     | ルート（html）のフォントサイズ基準   | フォントサイズ（推奨） |
| vw      | ビューポート幅の1%                   | 全幅レイアウト         |
| vh      | ビューポート高さの1%                 | 全画面セクション       |
| clamp() | 最小値、推奨値、最大値を指定（関数） | 可変フォントサイズ     |

```css
/* remの例: ルートのフォントサイズが16pxの場合 */
html {
  font-size: 16px;
}
h1 {
  font-size: 2rem; /* 32px */
}
p {
  font-size: 1rem; /* 16px */
}

/* clampの例: 最小16px、推奨2.5vw、最大24px */
h2 {
  font-size: clamp(16px, 2.5vw, 24px);
}
```

## ポジション（position）

`position`プロパティは、要素の配置方法を制御する。通常のレイアウトフローから要素を外して、自由な位置に配置できる。

### 各値の特徴

| 値       | 基準点                 | フローから外れるか | スクロール時の動き     |
| -------- | ---------------------- | ------------------ | ---------------------- |
| static   | 通常のフロー           | いいえ             | 通常通りスクロール     |
| relative | 元の位置が基準         | いいえ             | 通常通りスクロール     |
| absolute | 直近のrelative親が基準 | はい               | 親と一緒にスクロール   |
| fixed    | ビューポートが基準     | はい               | 画面に固定（動かない） |
| sticky   | スクロール位置で切替   | 条件付き           | 途中で固定される       |

### static（デフォルト）

何も指定しなければstatic。上から下に順番に並ぶ通常のフロー。

### relative

元の位置を基準にして、ずらして表示する。元の位置のスペースは残る。

```css
.box {
  position: relative;
  top: 10px; /* 元の位置から下に10px */
  left: 20px; /* 元の位置から右に20px */
}
```

**主な用途:** absoluteの基準点として使うことが最も多い。

### absolute

直近の`position: relative`（またはabsolute, fixed）を持つ親要素を基準に配置する。通常のフローから外れるため、他の要素はこの要素がないものとして配置される。

```css
.parent {
  position: relative; /* absoluteの基準点 */
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
}
```

**用途:** バッジ、ツールチップ、ドロップダウンメニューなど。

### fixed

ビューポート（ブラウザの表示領域）を基準に固定される。スクロールしても動かない。

```css
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background-color: white;
}
```

**用途:** 固定ヘッダー、「トップに戻る」ボタン。

### sticky

スクロールに応じて、通常のフローからfixedに切り替わる。

```css
.sticky-nav {
  position: sticky;
  top: 0; /* スクロール位置がここに来たら固定 */
  background-color: white;
  z-index: 10;
}
```

**用途:** テーブルのヘッダー固定、サイドバーの追従。

### 使い分けの指針

- **通常のレイアウト:** positionは使わない（staticのまま）
- **基準点を作りたい:** `relative`
- **要素を自由配置したい:** `absolute`（親に`relative`を付ける）
- **画面に固定したい:** `fixed`
- **スクロールで途中から固定:** `sticky`

## カスケード（優先度の仕組み）

CSSの「C」は **Cascading**（カスケーディング = 滝のように流れ落ちる）の意味。複数のスタイルが同じ要素に適用されたとき、どれが勝つかを決めるルール。

### 優先度の順番

高い順に:

```
1. !important（最強だが使用は避けるべき）
2. インラインスタイル（style属性）
3. IDセレクタ（#id）
4. クラスセレクタ（.class）、擬似クラス（:hover）、属性セレクタ（[type="text"]）
5. 要素セレクタ（p, h1）、擬似要素（::before）
6. ユニバーサルセレクタ（*）
```

### 同じ優先度の場合

後に書かれたスタイルが勝つ。

```css
p {
  color: blue;
}
p {
  color: red; /* こちらが勝つ（後に書かれているから） */
}
```

### 詳細度の計算例

```css
p {
} /* a-b-c = 0-0-1 */
.intro {
} /* a-b-c = 0-1-0 */
#header {
} /* a-b-c = 1-0-0 */
p.intro {
} /* a-b-c = 0-1-1 */
#header .nav li {
} /* a-b-c = 1-1-1 */
#header .nav li.active {
} /* a-b-c = 1-2-1 */
```

**a-b-c形式の読み方:**

- **a**: IDセレクタの数
- **b**: クラスセレクタ、擬似クラス、属性セレクタの数
- **c**: 要素セレクタ、擬似要素の数

左の桁が大きい方が優先。`1-0-0`は`0-99-99`よりも強い。

**実務でのベストプラクティス:**

- クラスセレクタを中心に使う（管理しやすい優先度）
- IDセレクタはスタイリングに使わない
- `!important`は最終手段
- ネストを深くしすぎない（`.parent .child .grandchild`のように）

## CSS変数（CSS Custom Properties）

CSS変数を使うと、値を変数として定義し、再利用できる。色やサイズなどの統一管理に非常に便利。

```css
/* :rootに定義すると、全てのセレクタで使える */
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --text-color: #333;
  --font-size-base: 16px;
  --spacing-unit: 8px;
  --border-radius: 4px;
}

/* var()で呼び出す */
.button {
  background-color: var(--primary-color);
  color: white;
  padding: calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 3);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
}

.button-secondary {
  background-color: var(--secondary-color);
}

/* フォールバック値（変数が未定義の場合に使われる） */
.text {
  color: var(--undefined-color, black);
}
```

### CSS変数のメリット

- デザインの一貫性を保てる
- テーマカラーの変更が1箇所で済む
- ダークモード対応が簡単になる

```css
/* ダークモード対応の例 */
:root {
  --bg-color: white;
  --text-color: #333;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
  }
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

## アニメーション

CSSで要素にアニメーションを付ける方法は主に2つある。

### transition（状態変化時のアニメーション）

ある状態から別の状態への変化を滑らかにする。`:hover`など、状態が変わるときに使う。

```css
.button {
  background-color: #3498db;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  /* transitionの設定 */
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.button:hover {
  background-color: #2980b9;
  transform: translateY(-2px); /* 少し上に浮く */
}

.button:active {
  transform: translateY(0); /* クリック時に元に戻る */
}
```

**transitionの構文:**

```css
transition: プロパティ 時間 タイミング関数 遅延;
```

| タイミング関数 | 動き                             |
| -------------- | -------------------------------- |
| ease           | ゆっくり開始、速く、ゆっくり終了 |
| linear         | 一定速度                         |
| ease-in        | ゆっくり開始                     |
| ease-out       | ゆっくり終了                     |
| ease-in-out    | ゆっくり開始、ゆっくり終了       |

### @keyframes（自立したアニメーション）

状態変化に関係なく、要素に独自のアニメーションを付ける。

```css
/* アニメーションの定義 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* アニメーションの適用 */
.card {
  animation: fadeIn 0.5s ease forwards;
}
```

```css
/* 複数のステップも指定可能 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.pulse-button {
  animation: pulse 2s ease-in-out infinite; /* 無限ループ */
}
```

### ローディングスピナーの例

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ddd;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

## よくあるレイアウトパターン

実務で頻出するレイアウトパターンをCSSで実装する方法。

### 1. ヘッダー固定 + コンテンツスクロール

```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.main-content {
  margin-top: 60px; /* ヘッダーの高さ分だけ下にずらす */
  padding: 24px;
}
```

### 2. サイドバー + メインコンテンツ

```css
.layout {
  display: flex;
}

.sidebar {
  width: 250px;
  flex-shrink: 0; /* 幅が縮まないようにする */
  padding: 24px;
  background-color: #f5f5f5;
}

.main {
  flex: 1; /* 残りの幅を全て使う */
  padding: 24px;
}

/* スマホではサイドバーを非表示にするか、上に配置 */
@media (max-width: 767px) {
  .layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
  }
}
```

### 3. カード一覧

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 24px;
}

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-body {
  padding: 16px;
}
```

### 4. フッターを画面下部に固定（コンテンツが少なくても）

```css
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin: 0;
}

.main-content {
  flex: 1; /* メインコンテンツが残りの高さを全て使う */
}

.footer {
  padding: 24px;
  background-color: #333;
  color: white;
}
```

## 実務でよく使うプロパティ一覧表

### テキスト関連

| プロパティ      | 説明               | 値の例                                   |
| --------------- | ------------------ | ---------------------------------------- |
| color           | 文字色             | `#333`, `rgb(0,0,0)`, `red`              |
| font-size       | 文字サイズ         | `16px`, `1rem`, `clamp(14px, 2vw, 18px)` |
| font-weight     | 文字の太さ         | `normal`, `bold`, `700`                  |
| font-family     | フォント           | `'Noto Sans JP', sans-serif`             |
| line-height     | 行の高さ           | `1.6`, `24px`                            |
| letter-spacing  | 文字間隔           | `0.05em`, `1px`                          |
| text-align      | 文字の水平揃え     | `left`, `center`, `right`                |
| text-decoration | 下線等の装飾       | `none`, `underline`, `line-through`      |
| text-overflow   | はみ出た文字の処理 | `ellipsis`（...で省略）                  |
| white-space     | 空白の処理         | `nowrap`, `pre-wrap`                     |
| overflow        | はみ出た内容の処理 | `hidden`, `auto`, `scroll`               |

### 背景関連

| プロパティ          | 説明             | 値の例                       |
| ------------------- | ---------------- | ---------------------------- |
| background-color    | 背景色           | `#f5f5f5`, `rgba(0,0,0,0.5)` |
| background-image    | 背景画像         | `url('image.jpg')`           |
| background-size     | 背景画像のサイズ | `cover`, `contain`, `100%`   |
| background-position | 背景画像の位置   | `center`, `top left`         |

### ボーダーと影

| プロパティ    | 説明         | 値の例                      |
| ------------- | ------------ | --------------------------- |
| border        | 境界線       | `1px solid #ddd`            |
| border-radius | 角の丸み     | `4px`, `8px`, `50%`（円形） |
| box-shadow    | ボックスの影 | `0 2px 8px rgba(0,0,0,0.1)` |
| outline       | フォーカス枠 | `2px solid blue`, `none`    |

### サイズ関連

| プロパティ | 説明     | 値の例                  |
| ---------- | -------- | ----------------------- |
| width      | 幅       | `100%`, `300px`, `50vw` |
| height     | 高さ     | `auto`, `100vh`         |
| max-width  | 最大幅   | `1200px`, `100%`        |
| min-height | 最小高さ | `100vh`                 |

### その他

| プロパティ | 説明               | 値の例                     |
| ---------- | ------------------ | -------------------------- |
| cursor     | マウスカーソルの形 | `pointer`, `not-allowed`   |
| opacity    | 透明度             | `0`（透明）~ `1`（不透明） |
| z-index    | 重なり順           | `1`, `10`, `100`           |
| overflow   | はみ出し処理       | `hidden`, `auto`, `scroll` |
| list-style | リストのスタイル   | `none`                     |

## 学習のコツとよくあるミス

### よくあるミス

**1. セミコロンの書き忘れ**

```css
/* NG: font-sizeが無視される */
p {
  color: red
  font-size: 16px;
}

/* OK */
p {
  color: red;
  font-size: 16px;
}
```

**2. クラス名のドットを忘れる**

```css
/* NG: highlight要素セレクタ（存在しない要素） */
highlight {
  color: red;
}

/* OK: highlightクラスセレクタ */
.highlight {
  color: red;
}
```

**3. heightを指定しても効かない**

inlineの要素には`width`や`height`が効かない。`display: block`や`display: inline-block`に変更する必要がある。

**4. margin: 0 autoが効かない**

中央寄せの`margin: 0 auto`は、`width`が指定されていないと効かない。

```css
/* NG */
.center {
  margin: 0 auto;
}

/* OK */
.center {
  width: 800px; /* または max-width */
  margin: 0 auto;
}
```

**5. z-indexが効かない**

`z-index`は`position`が`static`以外（`relative`, `absolute`, `fixed`, `sticky`）のときだけ有効。

### 学習のコツ

1. **ブラウザのDevTools（開発者ツール）を活用する**: 要素を右クリック→「検証」で、CSSのリアルタイム編集やボックスモデルの確認ができる
2. **小さなプロジェクトを作る**: 名刺サイト、ランディングページなど、実際に手を動かして学ぶ
3. **他人のサイトのCSSを読む**: DevToolsで気になるサイトのCSSを確認する
4. **Flexboxは徹底的に練習する**: 実務で最も使うレイアウト手法
5. **完璧を求めず、まず動くものを作る**: 細かい調整は後からできる

### デバッグ方法

```css
/* 要素の範囲を視覚化する（デバッグ時に便利） */
* {
  outline: 1px solid red;
}

/* 特定の要素だけ確認 */
.debug-target {
  border: 2px solid red !important;
  background-color: rgba(255, 0, 0, 0.1) !important;
}
```

## 参考リンク

- [MDN Web Docs - CSS](https://developer.mozilla.org/ja/docs/Web/CSS) - CSSの公式リファレンス。最も信頼できる情報源
- [MDN - CSSの基本](https://developer.mozilla.org/ja/docs/Learn/Getting_started_with_the_web/CSS_basics) - 初心者向けの入門チュートリアル
- [MDN - Flexbox](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox) - Flexboxの基本概念
- [MDN - Grid](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_grid_layout/Basic_concepts_of_grid_layout) - Gridの基本概念
- [CSS-Tricks - A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) - Flexboxの視覚的ガイド（英語）
- [CSS-Tricks - A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/) - Gridの視覚的ガイド（英語）
- [Flexbox Froggy](https://flexboxfroggy.com/#ja) - Flexboxをゲームで学べるサイト
- [Grid Garden](https://cssgridgarden.com/#ja) - Gridをゲームで学べるサイト
- [Can I Use](https://caniuse.com/) - CSSプロパティのブラウザ対応状況を確認できるサイト
- [web.dev - Learn CSS](https://web.dev/learn/css) - Googleによる体系的なCSS学習コース（英語）
- [web.dev - Learn Responsive Design](https://web.dev/learn/design) - レスポンシブデザインの学習コース（英語）
