/** アルゴリズムのステップ（可視化の1フレーム） */
export interface AlgorithmStep {
  /** 現在の配列状態 */
  array: number[]
  /** 比較中のインデックス（ハイライト用） */
  comparing?: number[]
  /** スワップ中のインデックス（ハイライト用） */
  swapping?: number[]
  /** ソート済みのインデックス */
  sorted?: number[]
  /** 探索で見つかったインデックス */
  found?: number
  /** 探索中のインデックス */
  searching?: number
  /** このステップの日本語説明 */
  description: string
}

/** アルゴリズム実行関数の型 */
export type AlgorithmGenerator = (arr: number[]) => AlgorithmStep[]

/** アルゴリズムのペア定義（比較用） */
export interface AlgorithmPair {
  /** 一意の識別子（ケバブケース） */
  id: string
  /** 問題タイトル（日本語） */
  title: string
  /** カテゴリ */
  category: 'sort' | 'search' | 'datastructure' | 'numeric' | 'applied'
  /** カテゴリ名（日本語） */
  categoryLabel: string
  /** 問題の解説（日本語、初心者向け） */
  description: string
  /** アルゴリズムA（通常、遅い方） */
  algorithmA: {
    /** アルゴリズム名 */
    name: string
    /** 計算量（O記法） */
    complexity: string
    /** ステップ生成関数 */
    generator: AlgorithmGenerator
    /** バーの色（Tailwindクラス名） */
    color: string
  }
  /** アルゴリズムB（通常、速い方） */
  algorithmB: {
    name: string
    complexity: string
    generator: AlgorithmGenerator
    color: string
  }
  /** デフォルト配列サイズ */
  defaultSize: number
  /** なぜ計算量が違うのか（日本語解説） */
  explanation: string
}
