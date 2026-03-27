---
title: 'チェックポイント: 静的Webページを作る'
order: 5
section: 'フロントエンド基礎'
---

# チェックポイント: 静的Webページを作る

このチェックポイントでは、HTML/CSSを使って自分のポートフォリオページを作成します。Flexbox/CSS Gridを活用し、レスポンシブ対応のページを完成させましょう。

---

## 完成イメージ

以下の4つのセクションで構成されたシンプルなポートフォリオページを作ります。

| セクション | 内容                               |
| ---------- | ---------------------------------- |
| ヘッダー   | サイト名、ナビゲーションリンク     |
| 自己紹介   | プロフィール画像、名前、自己紹介文 |
| スキル一覧 | スキルをカード形式で表示           |
| フッター   | コピーライト、SNSリンク            |

ページはPC/タブレット/スマートフォンの全てで適切に表示されるようにします。

---

## 要件リスト

- [ ] セマンティックなHTMLタグを使用する（`header`, `main`, `section`, `footer`）
- [ ] ヘッダーにナビゲーションリンクを配置する
- [ ] 自己紹介セクションにプロフィール画像と説明文を配置する
- [ ] スキル一覧をCSS Gridでカード形式に並べる
- [ ] フッターにコピーライトとSNSリンクを配置する
- [ ] レスポンシブ対応（768px以下でレイアウト変更）
- [ ] 外部CSSファイルにスタイルを分離する

---

## ステップ1: プロジェクトの準備

まずフォルダ構成を作ります。

```
portfolio/
├── index.html
├── css/
│   └── style.css
└── images/
    └── profile.jpg
```

ターミナルで以下を実行します。

```bash
mkdir -p portfolio/css portfolio/images
touch portfolio/index.html portfolio/css/style.css
```

---

## ステップ2: HTMLの骨格を作る

`index.html`に以下を記述します。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ポートフォリオ</title>
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <!-- ヘッダー -->
    <header class="header">
      <h1 class="header__title">My Portfolio</h1>
      <nav class="header__nav">
        <ul class="header__nav-list">
          <li><a href="#about">自己紹介</a></li>
          <li><a href="#skills">スキル</a></li>
          <li><a href="#contact">お問い合わせ</a></li>
        </ul>
      </nav>
    </header>

    <main>
      <!-- 自己紹介セクション -->
      <section id="about" class="about">
        <div class="about__container">
          <img src="images/profile.jpg" alt="プロフィール画像" class="about__image" />
          <div class="about__text">
            <h2>山田 太郎</h2>
            <p>
              Webエンジニアを目指して学習中です。
              HTML/CSS/JavaScriptを中心に、フロントエンドからバックエンドまで 幅広く学んでいます。
            </p>
          </div>
        </div>
      </section>

      <!-- スキル一覧セクション -->
      <section id="skills" class="skills">
        <h2 class="skills__heading">スキル一覧</h2>
        <div class="skills__grid">
          <div class="skills__card">
            <h3>HTML</h3>
            <p>
              セマンティックなマークアップができます。アクセシビリティを意識した構造を設計できます。
            </p>
          </div>
          <div class="skills__card">
            <h3>CSS</h3>
            <p>
              Flexbox/Gridを使ったレイアウト設計ができます。レスポンシブデザインに対応できます。
            </p>
          </div>
          <div class="skills__card">
            <h3>JavaScript</h3>
            <p>DOM操作やイベント処理の基本を理解しています。非同期処理も学習中です。</p>
          </div>
          <div class="skills__card">
            <h3>Git</h3>
            <p>バージョン管理の基本的なワークフローを理解しています。</p>
          </div>
        </div>
      </section>

      <!-- お問い合わせセクション -->
      <section id="contact" class="contact">
        <h2>お問い合わせ</h2>
        <p>お気軽にご連絡ください。</p>
        <a href="mailto:example@example.com" class="contact__button"> メールを送る </a>
      </section>
    </main>

    <!-- フッター -->
    <footer class="footer">
      <div class="footer__links">
        <a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
      </div>
      <p class="footer__copyright">&copy; 2026 My Portfolio. All rights reserved.</p>
    </footer>
  </body>
</html>
```

### HTMLのポイント

- `<header>`, `<main>`, `<section>`, `<footer>` などのセマンティックタグを使うことで、検索エンジンやスクリーンリーダーがページの構造を正しく理解できる
- `id`属性を使うことで、ナビゲーションリンクからページ内スクロールができる
- `<img>`タグには必ず`alt`属性を設定し、画像が表示できない場合の代替テキストを提供する
- 外部リンクには`target="_blank"`と`rel="noopener noreferrer"`を設定し、セキュリティリスクを防ぐ

---

## ステップ3: CSSでスタイルを適用する

`css/style.css`に以下を記述します。

### リセットと基本設定

```css
/* リセットCSS */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f9f9f9;
}

a {
  color: inherit;
  text-decoration: none;
}

ul {
  list-style: none;
}

img {
  max-width: 100%;
  height: auto;
}
```

### ヘッダー（Flexboxで横並び）

```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background-color: #2c3e50;
  color: #fff;
}

.header__title {
  font-size: 1.5rem;
}

.header__nav-list {
  display: flex;
  gap: 24px;
}

.header__nav-list a {
  color: #ecf0f1;
  transition: color 0.3s;
}

.header__nav-list a:hover {
  color: #3498db;
}
```

**Flexboxの解説**: `display: flex`を指定すると、子要素が横並びになります。`justify-content: space-between`でロゴとナビを左右に分け、`align-items: center`で縦方向の中央揃えを実現しています。

### 自己紹介セクション（Flexbox）

```css
.about {
  padding: 64px 32px;
  background-color: #fff;
}

.about__container {
  display: flex;
  align-items: center;
  gap: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.about__image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
}

.about__text h2 {
  font-size: 1.8rem;
  margin-bottom: 16px;
}

.about__text p {
  font-size: 1rem;
  color: #555;
}
```

### スキル一覧（CSS Grid）

```css
.skills {
  padding: 64px 32px;
}

.skills__heading {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 40px;
}

.skills__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.skills__card {
  background-color: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.skills__card:hover {
  transform: translateY(-4px);
}

.skills__card h3 {
  font-size: 1.2rem;
  margin-bottom: 12px;
  color: #2c3e50;
}

.skills__card p {
  font-size: 0.9rem;
  color: #666;
}
```

**CSS Gridの解説**: `display: grid`でグリッドレイアウトを作成します。`grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`は「各カードは最小240px、余白があれば均等に広がる」という指定で、これだけでレスポンシブ対応のカードレイアウトが実現できます。

### お問い合わせセクション

```css
.contact {
  padding: 64px 32px;
  text-align: center;
  background-color: #fff;
}

.contact h2 {
  font-size: 1.8rem;
  margin-bottom: 16px;
}

.contact p {
  margin-bottom: 24px;
  color: #555;
}

.contact__button {
  display: inline-block;
  padding: 12px 32px;
  background-color: #3498db;
  color: #fff;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.contact__button:hover {
  background-color: #2980b9;
}
```

### フッター

```css
.footer {
  padding: 32px;
  text-align: center;
  background-color: #2c3e50;
  color: #ecf0f1;
}

.footer__links {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 16px;
}

.footer__links a {
  color: #3498db;
  transition: color 0.3s;
}

.footer__links a:hover {
  color: #ecf0f1;
}

.footer__copyright {
  font-size: 0.85rem;
  color: #95a5a6;
}
```

---

**注意**: 上記のCSSコードはセクションごとに分割して解説していますが、実際には全てを`css/style.css`に上から順にまとめて記述してください。

---

## ステップ4: レスポンシブ対応

メディアクエリを追加して、画面幅が小さいデバイスでもレイアウトが崩れないようにします。

```css
/* タブレット以下（768px以下） */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .header__nav-list {
    flex-direction: column;
    gap: 8px;
  }

  .about__container {
    flex-direction: column;
    text-align: center;
  }

  .about__image {
    width: 150px;
    height: 150px;
  }
}

/* スマートフォン（480px以下） */
@media (max-width: 480px) {
  .header__title {
    font-size: 1.2rem;
  }

  .about__text h2 {
    font-size: 1.4rem;
  }

  .skills__heading {
    font-size: 1.4rem;
  }
}
```

**メディアクエリの解説**: `@media (max-width: 768px)`は「画面幅が768px以下のとき」に適用されるスタイルです。PCでは横並びだった要素を、小さい画面では`flex-direction: column`で縦並びに変更しています。

---

## 動作確認方法

1. `index.html`をブラウザで直接開く
2. ブラウザの開発者ツール（F12）でレスポンシブモードに切り替える
3. 画面幅を変えてレイアウトが崩れないか確認する

もしくはVS Codeの拡張機能「Live Server」を使うと、ファイル保存時に自動リロードされて便利です。

---

## 完了チェックリスト

以下を全て満たしていれば、このチェックポイントはクリアです。

| チェック項目                                                  | 確認 |
| ------------------------------------------------------------- | ---- |
| HTMLがセマンティックタグで構成されている                      |      |
| ヘッダーにナビゲーションリンクがある                          |      |
| 自己紹介セクションに画像と説明文がある                        |      |
| スキル一覧がカード形式でGrid表示されている                    |      |
| フッターにSNSリンクとコピーライトがある                       |      |
| PC表示で横並びレイアウトが正しく動作する                      |      |
| 768px以下で縦並びレイアウトに切り替わる                       |      |
| HTMLバリデーション（https://validator.w3.org/）でエラーがない |      |
| 全てのリンクが正しく動作する                                  |      |

---

## 発展課題（任意）

- Google Fontsを導入してフォントを変更する
- アニメーションを追加する（CSS `@keyframes`）
- ダークモード対応（`prefers-color-scheme`メディアクエリ）
- お問い合わせフォームを追加する

## 参考リンク

- [MDN Web Docs - HTML](https://developer.mozilla.org/ja/docs/Web/HTML) - HTMLの公式リファレンス
- [MDN Web Docs - CSS](https://developer.mozilla.org/ja/docs/Web/CSS) - CSSの公式リファレンス
- [MDN - Flexbox](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox) - Flexboxの基本概念
- [MDN - CSS Grid](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_grid_layout/Basic_concepts_of_grid_layout) - CSS Gridの基本概念
- [MDN - レスポンシブデザイン](https://developer.mozilla.org/ja/docs/Learn/CSS/CSS_layout/Responsive_Design) - レスポンシブデザインの学習ガイド
- [W3C Markup Validation Service](https://validator.w3.org/) - HTMLの文法チェックツール
- [Google Fonts](https://fonts.google.com/) - 無料Webフォントの提供サイト
