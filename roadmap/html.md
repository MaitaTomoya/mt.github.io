---
title: 'HTML'
order: 1
section: 'フロントエンド基礎'
---

# HTML

## HTMLとは

HTMLは **HyperText Markup Language** の略で、Webページの「骨組み」を作るための言語。ブラウザに「ここは見出し」「ここは段落」「ここはリンク」と伝える役割がある。

プログラミング言語ではなく**マークアップ言語**。計算やロジックは書けない。構造を定義するだけ。

## なぜ必要なのか

Webページは全てHTMLから始まる。CSS（見た目）もJavaScript（動き）もHTMLがないと適用先がない。家に例えると:

| 役割   | 技術       | 家で例えると             |
| ------ | ---------- | ------------------------ |
| 構造   | HTML       | 柱、壁、屋根             |
| 見た目 | CSS        | 壁紙、塗装、家具         |
| 動き   | JavaScript | 電気、水道、エレベーター |

## 基本構造

全てのHTMLファイルはこの形から始まる:

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ページタイトル</title>
  </head>
  <body>
    <!-- ここに表示したい内容を書く -->
  </body>
</html>
```

| 部分               | 役割                                                  |
| ------------------ | ----------------------------------------------------- |
| `<!DOCTYPE html>`  | 「これはHTML5です」とブラウザに伝える宣言             |
| `<html lang="ja">` | HTMLの開始。`lang="ja"`は日本語ページであることを示す |
| `<head>`           | ページの設定情報（ブラウザには表示されない）          |
| `<body>`           | ブラウザに表示される内容                              |

## よく使うタグ

### 見出し

```html
<h1>最も大きい見出し（ページに1つだけが望ましい）</h1>
<h2>セクションの見出し</h2>
<h3>サブセクションの見出し</h3>
```

h1からh6まであるが、実務ではh1〜h3を主に使う。h1はページに1つだけにするのがSEO的にも良い。

### 段落とテキスト

```html
<p>これは段落です。文章のかたまりを表す。</p>
<strong>太字（重要な意味を持つ）</strong>
<em>斜体（強調）</em>
```

### リンク

```html
<a href="https://example.com">リンクテキスト</a>
<a href="/about">サイト内リンク</a>
<a href="https://example.com" target="_blank" rel="noopener noreferrer">別タブで開く</a>
```

`target="_blank"`で別タブを開くときは、セキュリティのために`rel="noopener noreferrer"`を必ずつける。

### 画像

```html
<img src="/images/photo.jpg" alt="写真の説明" width="600" height="400" />
```

`alt`属性は**必須**。画像が読み込めないとき、またスクリーンリーダーで読み上げるときに使われる。

### リスト

```html
<!-- 順序なしリスト -->
<ul>
  <li>項目1</li>
  <li>項目2</li>
</ul>

<!-- 順序ありリスト -->
<ol>
  <li>手順1</li>
  <li>手順2</li>
</ol>
```

### フォーム

```html
<form action="/submit" method="POST">
  <label for="name">名前:</label>
  <input type="text" id="name" name="name" required />

  <label for="email">メール:</label>
  <input type="email" id="email" name="email" required />

  <button type="submit">送信</button>
</form>
```

`label`と`input`を`for`/`id`で紐づけると、ラベルをクリックしたときにinputにフォーカスが当たる。アクセシビリティ的にも重要。

## セマンティックHTML

「意味のあるタグ」を使うこと。`<div>`でなんでも囲むのではなく、適切なタグを選ぶ。

```html
<!-- 良くない例: 全部div -->
<div class="header">
  <div class="nav">...</div>
</div>
<div class="main">...</div>
<div class="footer">...</div>

<!-- 良い例: セマンティックタグ -->
<header>
  <nav>...</nav>
</header>
<main>...</main>
<footer>...</footer>
```

主なセマンティックタグ:

| タグ        | 意味                            |
| ----------- | ------------------------------- |
| `<header>`  | ページやセクションのヘッダー    |
| `<nav>`     | ナビゲーション                  |
| `<main>`    | メインコンテンツ（ページに1つ） |
| `<article>` | 独立したコンテンツ（記事など）  |
| `<section>` | テーマごとのまとまり            |
| `<aside>`   | サイドバーや補足情報            |
| `<footer>`  | フッター                        |

### なぜセマンティックHTMLが大事か

1. **アクセシビリティ**: スクリーンリーダーが構造を理解できる
2. **SEO**: 検索エンジンがコンテンツの意味を理解しやすくなる
3. **保守性**: コードを読む人が構造を把握しやすい

## よくある間違い/つまずきポイント

### 閉じタグの忘れ

```html
<!-- NG: 閉じタグがない -->
<p>段落1</p>
<p>
  段落2

  <!-- OK -->
</p>

<p>段落1</p>
<p>段落2</p>
```

### alt属性の省略

```html
<!-- NG -->
<img src="photo.jpg" />

<!-- OK -->
<img src="photo.jpg" alt="東京タワーの夜景" />

<!-- 装飾的な画像（意味を持たない）の場合は空のaltを設定 -->
<img src="decoration.png" alt="" />
```

### h1の複数使用

```html
<!-- NG: h1が複数 -->
<h1>サイトタイトル</h1>
<h1>ページタイトル</h1>

<!-- OK: h1は1つだけ -->
<h1>ページタイトル</h1>
<h2>セクション1</h2>
<h2>セクション2</h2>
```

### 見出しレベルの飛ばし

```html
<!-- NG: h2を飛ばしてh3 -->
<h1>タイトル</h1>
<h3>サブセクション</h3>

<!-- OK: 順番に -->
<h1>タイトル</h1>
<h2>セクション</h2>
<h3>サブセクション</h3>
```

## 実務でのポイント

- HTMLは「正しく書ける」だけでは差がつかない。**セマンティックHTML + アクセシビリティ**を意識できるかが重要
- ブラウザのDevToolsで「Elements」タブを開くと、実際のHTMLの構造を確認できる
- 他のサイトのHTMLをDevToolsで見て学ぶのは効果的な学習方法

## 参考リンク

- [MDN Web Docs - HTML](https://developer.mozilla.org/ja/docs/Web/HTML) - HTMLの公式リファレンス。最も信頼できる情報源
- [MDN - HTML要素リファレンス](https://developer.mozilla.org/ja/docs/Web/HTML/Element) - 全HTML要素の一覧と解説
- [MDN - HTMLの基本](https://developer.mozilla.org/ja/docs/Learn/Getting_started_with_the_web/HTML_basics) - 初心者向けの入門チュートリアル
- [MDN - フォーム入門](https://developer.mozilla.org/ja/docs/Learn/Forms) - HTMLフォームの学習ガイド
- [HTML Living Standard](https://html.spec.whatwg.org/multipage/) - HTMLの公式仕様（英語）
- [W3C Markup Validation Service](https://validator.w3.org/) - HTMLの文法チェックツール
- [web.dev - Learn HTML](https://web.dev/learn/html) - Googleによる体系的なHTML学習コース（英語）
- [Can I Use](https://caniuse.com/) - HTML要素のブラウザ対応状況を確認できるサイト
