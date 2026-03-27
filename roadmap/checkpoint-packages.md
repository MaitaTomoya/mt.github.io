---
title: 'チェックポイント: 外部パッケージを使ったアプリ'
order: 11
section: 'スタイリングとフレームワーク'
---

# チェックポイント: 外部パッケージを使ったアプリ

このチェックポイントでは、React + Tailwind CSS + 天気APIを組み合わせて天気予報アプリを作成します。モダンなフロントエンド開発のワークフローを実践的に学びます。

---

## 完成イメージ

| 機能         | 説明                                     |
| ------------ | ---------------------------------------- |
| 都市名検索   | テキスト入力で都市名を入力して検索       |
| 天気表示     | 現在の天気、気温、湿度、風速を表示       |
| 天気アイコン | 天気の状態に応じたアイコンを表示         |
| エラー表示   | 都市が見つからない場合のエラーメッセージ |
| ローディング | データ取得中のローディング表示           |

---

## 要件リスト

- [ ] Viteでプロジェクトをセットアップする
- [ ] Tailwind CSSでスタイリングする
- [ ] OpenWeatherMap APIから天気データを取得する
- [ ] `useState`でローディング、エラー、データの状態を管理する
- [ ] コンポーネントを適切に分割する
- [ ] ローディングとエラー状態をUIに反映する

---

## ステップ1: プロジェクトのセットアップ

### Viteでプロジェクトを作成

```bash
npm create vite@latest weather-app -- --template react
cd weather-app
npm install
```

**Viteとは**: Viteは高速なフロントエンド開発ツールです。開発時のホットリロードが非常に速く、`create-react-app`の代替として広く使われています。

### Tailwind CSSを導入

```bash
npm install -D tailwindcss @tailwindcss/vite
```

`vite.config.js`を編集します。

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`src/index.css`の先頭に以下を追加します。

```css
@import 'tailwindcss';
```

### OpenWeatherMap APIキーの取得

1. [OpenWeatherMap](https://openweathermap.org/)でアカウントを作成する
2. 「API keys」ページでAPIキーを取得する
3. プロジェクトのルートに`.env`ファイルを作成する

```
VITE_WEATHER_API_KEY=ここにAPIキーを入れる
```

**注意**: `.env`ファイルは`.gitignore`に追加し、GitHubに公開しないようにしてください。Viteでは`VITE_`で始まる環境変数のみクライアントで使用できます。

---

## ステップ2: コンポーネント構成

```
src/
├── App.jsx           # メインコンポーネント
├── components/
│   ├── SearchBar.jsx  # 検索バー
│   ├── WeatherCard.jsx # 天気情報カード
│   ├── Loading.jsx    # ローディング表示
│   └── ErrorMessage.jsx # エラー表示
├── hooks/
│   └── useWeather.js  # 天気データ取得のカスタムフック
├── index.css
└── main.jsx
```

---

## ステップ3: カスタムフックを作成する

`src/hooks/useWeather.js`

```javascript
import { useState } from 'react'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

/**
 * 天気データを取得するカスタムフック
 * @returns {object} 天気データ、ローディング状態、エラー、検索関数
 */
export function useWeather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * 指定した都市の天気データを取得する
   * @param {string} city - 都市名
   */
  async function fetchWeather(city) {
    if (!city.trim()) return

    setLoading(true)
    setError(null)
    setWeather(null)

    try {
      const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ja`
      const response = await fetch(url)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('都市が見つかりませんでした。都市名を確認してください。')
        }
        throw new Error('天気データの取得に失敗しました。')
      }

      const data = await response.json()
      setWeather(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { weather, loading, error, fetchWeather }
}
```

**カスタムフックの解説**: Reactのカスタムフックは`use`で始まる関数で、ロジックを再利用可能な形で切り出す仕組みです。コンポーネントからデータ取得ロジックを分離することで、コードの見通しがよくなります。

**`useState`の解説**: `useState`はコンポーネントに「状態」を持たせるフックです。`const [weather, setWeather] = useState(null)`は「`weather`という状態変数を`null`で初期化し、`setWeather`関数で値を更新できる」という意味です。

---

## ステップ4: 各コンポーネントを作成する

### 検索バーコンポーネント

`src/components/SearchBar.jsx`

```jsx
import { useState } from 'react'

/**
 * 都市名を入力して検索するコンポーネント
 * @param {object} props
 * @param {function} props.onSearch - 検索実行時に呼ばれるコールバック
 */
export function SearchBar({ onSearch }) {
  const [city, setCity] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSearch(city)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="都市名を入力（例: Tokyo）"
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-400
                   text-gray-700"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-blue-500 text-white rounded-lg
                   hover:bg-blue-600 transition-colors"
      >
        検索
      </button>
    </form>
  )
}
```

### 天気カードコンポーネント

`src/components/WeatherCard.jsx`

```jsx
/**
 * 天気情報を表示するカードコンポーネント
 * @param {object} props
 * @param {object} props.data - OpenWeatherMap APIのレスポンスデータ
 */
export function WeatherCard({ data }) {
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
      {/* 都市名 */}
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        {data.name}, {data.sys.country}
      </h2>

      {/* 天気アイコンと説明 */}
      <div className="flex items-center justify-center mt-4">
        <img src={iconUrl} alt={data.weather[0].description} className="w-20 h-20" />
        <span className="text-lg text-gray-600 capitalize">{data.weather[0].description}</span>
      </div>

      {/* 気温 */}
      <p className="text-5xl font-bold text-center text-gray-800 mt-2">
        {Math.round(data.main.temp)}&deg;C
      </p>

      {/* 詳細情報 */}
      <div className="grid grid-cols-3 gap-4 mt-8 text-center">
        <div>
          <p className="text-sm text-gray-500">体感温度</p>
          <p className="text-lg font-semibold text-gray-700">
            {Math.round(data.main.feels_like)}&deg;C
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">湿度</p>
          <p className="text-lg font-semibold text-gray-700">{data.main.humidity}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">風速</p>
          <p className="text-lg font-semibold text-gray-700">{data.wind.speed} m/s</p>
        </div>
      </div>
    </div>
  )
}
```

### ローディングコンポーネント

`src/components/Loading.jsx`

```jsx
/**
 * データ取得中のローディング表示
 */
export function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div
        className="w-10 h-10 border-4 border-blue-200 border-t-blue-500
                    rounded-full animate-spin"
      ></div>
      <span className="ml-3 text-gray-500">データを取得中...</span>
    </div>
  )
}
```

### エラーメッセージコンポーネント

`src/components/ErrorMessage.jsx`

```jsx
/**
 * エラーメッセージを表示するコンポーネント
 * @param {object} props
 * @param {string} props.message - エラーメッセージ
 */
export function ErrorMessage({ message }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full max-w-md">
      <p className="text-red-600 text-center">{message}</p>
    </div>
  )
}
```

---

## ステップ5: Appコンポーネントで組み立てる

`src/App.jsx`

```jsx
import { SearchBar } from './components/SearchBar'
import { WeatherCard } from './components/WeatherCard'
import { Loading } from './components/Loading'
import { ErrorMessage } from './components/ErrorMessage'
import { useWeather } from './hooks/useWeather'

export default function App() {
  const { weather, loading, error, fetchWeather } = useWeather()

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300
                    flex flex-col items-center justify-center p-4 gap-6"
    >
      <h1 className="text-3xl font-bold text-gray-800">天気予報アプリ</h1>

      <SearchBar onSearch={fetchWeather} />

      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}
      {weather && <WeatherCard data={weather} />}
    </div>
  )
}
```

**条件付きレンダリングの解説**: `{loading && <Loading />}`はJSXの条件付きレンダリングです。`loading`が`true`のときだけ`<Loading />`コンポーネントを表示します。`&&`演算子は左辺が`true`なら右辺を返し、`false`なら何も返しません。

---

## ステップ6: 動作確認

```bash
npm run dev
```

ブラウザで`http://localhost:5173`を開き、以下を確認します。

1. 都市名（例: Tokyo, London, New York）を入力して検索
2. ローディング表示が出ること
3. 天気データが正しく表示されること
4. 存在しない都市名でエラーメッセージが出ること
5. 空欄で検索しても何も起きないこと

---

## 完了チェックリスト

| チェック項目                                           | 確認 |
| ------------------------------------------------------ | ---- |
| Vite + Reactプロジェクトが正しくセットアップされている |      |
| Tailwind CSSが動作している                             |      |
| 環境変数でAPIキーを管理している                        |      |
| 都市名で天気データを検索できる                         |      |
| 天気情報（気温、湿度、風速）が表示される               |      |
| ローディング中の表示がある                             |      |
| エラー時にメッセージが表示される                       |      |
| コンポーネントが適切に分割されている                   |      |
| カスタムフックでロジックが分離されている               |      |

---

## 発展課題（任意）

- 5日間の天気予報を表示する（5 day forecast API）
- 位置情報APIで現在地の天気を自動取得する
- お気に入り都市リストを保存する（ローカルストレージ）
- ダークモードを実装する
- React Routerで複数ページ構成にする

## 参考リンク

- [React 公式ドキュメント](https://react.dev/) - Reactの公式リファレンスとチュートリアル
- [Tailwind CSS 公式ドキュメント](https://tailwindcss.com/docs) - ユーティリティクラスの全リファレンス
- [Vite 公式サイト](https://vite.dev/) - 高速なフロントエンドビルドツール
- [OpenWeatherMap API](https://openweathermap.org/api) - 天気データAPI
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API) - Fetch APIの公式リファレンス
