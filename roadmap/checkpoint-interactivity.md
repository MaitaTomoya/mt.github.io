---
title: 'チェックポイント: インタラクティブなページを作る'
order: 8
section: 'フロントエンド インタラクション'
---

# チェックポイント: インタラクティブなページを作る

このチェックポイントでは、バニラJavaScript（フレームワークなし）でクイズアプリを作成します。DOM操作、イベント処理、ローカルストレージの使い方を実践的に学びます。

---

## 完成イメージ

| 画面         | 内容                                   |
| ------------ | -------------------------------------- |
| スタート画面 | クイズのタイトルとスタートボタン       |
| 問題画面     | 問題文、4つの選択肢、進捗表示          |
| 結果画面     | スコア表示、ハイスコア、リトライボタン |

---

## 要件リスト

- [ ] DOM操作で問題を動的に表示する
- [ ] クリックイベントで回答を受け付ける
- [ ] 正解/不正解をフィードバックする
- [ ] スコアを計算して結果を表示する
- [ ] ローカルストレージにハイスコアを保存する
- [ ] 問題データはJavaScriptの配列で管理する

---

## ステップ1: プロジェクトの準備

```
quiz-app/
├── index.html
├── css/
│   └── style.css
└── js/
    └── app.js
```

ターミナルで以下を実行してプロジェクトを作成します。

```bash
mkdir -p quiz-app/css quiz-app/js
touch quiz-app/index.html quiz-app/css/style.css quiz-app/js/app.js
```

---

## ステップ2: HTMLを作成する

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>クイズアプリ</title>
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <div class="quiz-container">
      <!-- スタート画面 -->
      <div id="start-screen" class="screen">
        <h1>JavaScript クイズ</h1>
        <p>全5問のクイズに挑戦しよう</p>
        <p id="high-score-display"></p>
        <button id="start-button" class="btn btn--primary">スタート</button>
      </div>

      <!-- 問題画面 -->
      <div id="quiz-screen" class="screen" hidden>
        <div class="quiz-header">
          <span id="progress">問題 1 / 5</span>
          <span id="score-display">スコア: 0</span>
        </div>
        <h2 id="question"></h2>
        <div id="choices" class="choices"></div>
        <p id="feedback" class="feedback"></p>
      </div>

      <!-- 結果画面 -->
      <div id="result-screen" class="screen" hidden>
        <h2>結果発表</h2>
        <p id="final-score"></p>
        <p id="high-score-result"></p>
        <button id="retry-button" class="btn btn--primary">もう一度挑戦する</button>
      </div>
    </div>

    <script src="js/app.js"></script>
  </body>
</html>
```

### HTMLのポイント

- `hidden`属性で画面の表示/非表示を切り替える
- 各画面を`div`で分けて管理する
- ボタンには分かりやすい`id`を付けておく

---

## ステップ3: CSSでスタイルを適用する

```css
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.quiz-container {
  background-color: #fff;
  border-radius: 12px;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.screen {
  text-align: center;
}

.screen h1 {
  font-size: 2rem;
  margin-bottom: 16px;
  color: #2c3e50;
}

.screen h2 {
  font-size: 1.4rem;
  margin-bottom: 24px;
  color: #2c3e50;
  text-align: left;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.choices {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.choices button {
  padding: 14px 20px;
  font-size: 1rem;
  text-align: left;
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.choices button:hover {
  background-color: #e9ecef;
  border-color: #3498db;
}

.choices button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.choices button.correct {
  background-color: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.choices button.wrong {
  background-color: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

.feedback {
  margin-top: 16px;
  font-size: 1.1rem;
  font-weight: bold;
  min-height: 1.5em;
}

.feedback.correct {
  color: #28a745;
}

.feedback.wrong {
  color: #dc3545;
}

.btn {
  padding: 12px 32px;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn--primary {
  background-color: #3498db;
  color: #fff;
  margin-top: 24px;
}

.btn--primary:hover {
  background-color: #2980b9;
}

#final-score {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 24px 0 8px;
}

#high-score-result {
  color: #7f8c8d;
  margin-bottom: 8px;
}
```

---

## ステップ4: JavaScriptでロジックを実装する

`js/app.js`に以下のコードを記述します。各部分を解説しながら進めます。

### 問題データの定義

```javascript
/**
 * クイズの問題データ
 * question: 問題文
 * choices: 選択肢の配列
 * answer: 正解のインデックス（0始まり）
 */
const questions = [
  {
    question: 'JavaScriptで変数を宣言するキーワードはどれ？',
    choices: ['var', 'variable', 'dim', 'declare'],
    answer: 0,
  },
  {
    question: '配列の要素数を取得するプロパティはどれ？',
    choices: ['size', 'count', 'length', 'total'],
    answer: 2,
  },
  {
    question: 'DOMとは何の略称？',
    choices: [
      'Document Object Model',
      'Data Object Management',
      'Digital Output Module',
      'Document Oriented Middleware',
    ],
    answer: 0,
  },
  {
    question: 'console.log(typeof null) の出力結果は？',
    choices: ['"null"', '"undefined"', '"object"', '"boolean"'],
    answer: 2,
  },
  {
    question: '非同期処理を扱うために使われるオブジェクトは？',
    choices: ['Callback', 'Promise', 'Timer', 'Async'],
    answer: 1,
  },
]
```

### アプリの状態管理

```javascript
/**
 * アプリケーションの状態を管理するオブジェクト
 */
const state = {
  currentIndex: 0,
  score: 0,
  isAnswered: false,
}
```

**ポイント**: 状態を1つのオブジェクトにまとめると、アプリのどこで何が変わるかを把握しやすくなります。

### DOM要素の取得

```javascript
// 各画面
const startScreen = document.getElementById('start-screen')
const quizScreen = document.getElementById('quiz-screen')
const resultScreen = document.getElementById('result-screen')

// スタート画面の要素
const startButton = document.getElementById('start-button')
const highScoreDisplay = document.getElementById('high-score-display')

// 問題画面の要素
const progressEl = document.getElementById('progress')
const scoreDisplayEl = document.getElementById('score-display')
const questionEl = document.getElementById('question')
const choicesEl = document.getElementById('choices')
const feedbackEl = document.getElementById('feedback')

// 結果画面の要素
const finalScoreEl = document.getElementById('final-score')
const highScoreResultEl = document.getElementById('high-score-result')
const retryButton = document.getElementById('retry-button')
```

### 画面切り替え関数

```javascript
/**
 * 指定した画面を表示し、他の画面を非表示にする
 * @param {HTMLElement} screen - 表示する画面の要素
 */
function showScreen(screen) {
  startScreen.hidden = true
  quizScreen.hidden = true
  resultScreen.hidden = true
  screen.hidden = false
}
```

### ローカルストレージの操作

```javascript
/**
 * ローカルストレージからハイスコアを取得する
 * @returns {number} ハイスコア（未保存の場合は0）
 */
function getHighScore() {
  const saved = localStorage.getItem('quizHighScore')
  return saved ? parseInt(saved, 10) : 0
}

/**
 * ローカルストレージにハイスコアを保存する
 * @param {number} score - 保存するスコア
 */
function saveHighScore(score) {
  const current = getHighScore()
  if (score > current) {
    localStorage.setItem('quizHighScore', score.toString())
  }
}
```

**ローカルストレージの解説**: `localStorage`はブラウザにデータを永続的に保存する仕組みです。文字列しか保存できないため、数値は`toString()`で変換して保存し、取得時は`parseInt()`で数値に戻します。

### 問題の表示

```javascript
/**
 * 現在の問題を画面に表示する
 */
function renderQuestion() {
  const q = questions[state.currentIndex]

  // 進捗とスコアを更新
  progressEl.textContent = `問題 ${state.currentIndex + 1} / ${questions.length}`
  scoreDisplayEl.textContent = `スコア: ${state.score}`

  // 問題文を表示
  questionEl.textContent = q.question

  // フィードバックをリセット
  feedbackEl.textContent = ''
  feedbackEl.className = 'feedback'

  // 選択肢ボタンを生成
  choicesEl.innerHTML = ''
  q.choices.forEach((choice, index) => {
    const button = document.createElement('button')
    button.textContent = choice
    button.addEventListener('click', () => handleAnswer(index))
    choicesEl.appendChild(button)
  })

  state.isAnswered = false
}
```

**DOM操作の解説**: `document.createElement("button")`で新しいボタン要素を作成し、`appendChild()`で親要素に追加しています。`innerHTML = ""`で既存の子要素をクリアしてから新しい要素を追加します。

### 回答処理

```javascript
/**
 * ユーザーの回答を処理する
 * @param {number} selectedIndex - 選択された選択肢のインデックス
 */
function handleAnswer(selectedIndex) {
  // 既に回答済みなら何もしない（二重クリック防止）
  if (state.isAnswered) return
  state.isAnswered = true

  const q = questions[state.currentIndex]
  const buttons = choicesEl.querySelectorAll('button')
  const isCorrect = selectedIndex === q.answer

  // 全てのボタンを無効化
  buttons.forEach((btn) => {
    btn.disabled = true
  })

  // 正解のボタンにクラスを追加
  buttons[q.answer].classList.add('correct')

  if (isCorrect) {
    state.score++
    feedbackEl.textContent = '正解!'
    feedbackEl.className = 'feedback correct'
  } else {
    // 不正解の場合、選択したボタンにクラスを追加
    buttons[selectedIndex].classList.add('wrong')
    feedbackEl.textContent = `不正解... 正解は「${q.choices[q.answer]}」`
    feedbackEl.className = 'feedback wrong'
  }

  // 1.5秒後に次の問題へ進む
  setTimeout(() => {
    state.currentIndex++
    if (state.currentIndex < questions.length) {
      renderQuestion()
    } else {
      showResult()
    }
  }, 1500)
}
```

**イベント処理の解説**: `addEventListener("click", ...)`でクリックイベントを登録しています。`state.isAnswered`フラグで二重クリックを防止しています。`setTimeout`で1.5秒の待機を入れることで、ユーザーが正解/不正解を確認する時間を確保しています。

### 結果表示

```javascript
/**
 * クイズの結果を表示する
 */
function showResult() {
  showScreen(resultScreen)

  finalScoreEl.textContent = `${state.score} / ${questions.length} 問正解`

  // ハイスコアを更新して表示
  saveHighScore(state.score)
  const highScore = getHighScore()
  highScoreResultEl.textContent = `ハイスコア: ${highScore} / ${questions.length}`
}
```

### 初期化とイベント登録

```javascript
/**
 * アプリケーションを初期化する
 */
function init() {
  // ハイスコアを表示
  const highScore = getHighScore()
  if (highScore > 0) {
    highScoreDisplay.textContent = `ハイスコア: ${highScore} / ${questions.length}`
  }

  // スタートボタンのイベント
  startButton.addEventListener('click', () => {
    state.currentIndex = 0
    state.score = 0
    showScreen(quizScreen)
    renderQuestion()
  })

  // リトライボタンのイベント
  retryButton.addEventListener('click', () => {
    state.currentIndex = 0
    state.score = 0
    showScreen(quizScreen)
    renderQuestion()
  })
}

// アプリを起動
init()
```

---

## 動作確認方法

1. `index.html`をブラウザで開く
2. 「スタート」ボタンをクリック
3. 各問題に回答し、正解/不正解が表示されることを確認
4. 結果画面でスコアが正しく計算されていることを確認
5. ページをリロードし、ハイスコアが保持されていることを確認
6. 開発者ツールの「Application」タブでローカルストレージの内容を確認

---

## 完了チェックリスト

| チェック項目                               | 確認 |
| ------------------------------------------ | ---- |
| 問題がDOM操作で動的に表示される            |      |
| 選択肢をクリックすると回答が処理される     |      |
| 正解/不正解のフィードバックが表示される    |      |
| 二重クリックが防止されている               |      |
| スコアが正しく計算される                   |      |
| 結果画面に最終スコアが表示される           |      |
| ハイスコアがローカルストレージに保存される |      |
| ページリロード後もハイスコアが表示される   |      |
| 「もう一度挑戦する」で最初からやり直せる   |      |

---

## 発展課題（任意）

- 問題をシャッフルして出題順をランダムにする
- 制限時間を設けてタイマーを表示する
- 問題をカテゴリ別に分類して選択できるようにする
- Fetch APIで外部APIから問題を取得する（Open Trivia DBなど）

## 参考リンク

- [MDN Web Docs - DOM](https://developer.mozilla.org/ja/docs/Web/API/Document_Object_Model) - DOM APIの公式リファレンス
- [MDN Web Docs - イベント入門](https://developer.mozilla.org/ja/docs/Learn/JavaScript/Building_blocks/Events) - イベント処理の基本チュートリアル
- [MDN Web Docs - Web Storage API](https://developer.mozilla.org/ja/docs/Web/API/Web_Storage_API) - ローカルストレージの公式ガイド
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/ja/docs/Web/JavaScript) - JavaScriptの公式リファレンス
- [JavaScript.info - Document](https://ja.javascript.info/document) - DOM操作の包括的なチュートリアル
