import { Game, GAME_CATEGORIES } from './types'

/**
 * ゲームコレクション
 */
export const games: Game[] = [
  {
    id: 'tetris',
    title: 'テトリス',
    description: '落ちてくるブロックを積み上げてラインを消すクラシックパズルゲーム',
    thumbnail: '/game-images/tetris.jpg',
    category: GAME_CATEGORIES.PUZZLE,
    difficulty: 'medium',
    controls: {
      desktop: ['矢印キー: 移動', '↑キー: 回転', 'スペース: 落下'],
      mobile: ['タッチボタンで操作', 'スワイプで移動'],
    },
    features: ['7種類のテトロミノ', 'レベルアップシステム', 'スコアランキング', 'ホールド機能'],
  },
  {
    id: 'snake',
    title: 'スネークゲーム',
    description: '餌を食べて成長するヘビを操作する懐かしのアーケードゲーム',
    thumbnail: '/game-images/snake.jpg',
    category: GAME_CATEGORIES.ARCADE,
    difficulty: 'easy',
    controls: {
      desktop: ['矢印キー: 方向転換', 'WASD: 方向転換'],
      mobile: ['スワイプで方向転換', 'タップで一時停止'],
    },
    features: ['シンプルな操作', '無限に続くゲームプレイ', 'スピードアップ', 'ハイスコア記録'],
  },
  {
    id: '2048',
    title: '2048',
    description: '同じ数字を合わせて2048を目指す中毒性の高いパズルゲーム',
    thumbnail: '/game-images/2048.jpg',
    category: GAME_CATEGORIES.PUZZLE,
    difficulty: 'medium',
    controls: {
      desktop: ['矢印キー: スライド'],
      mobile: ['スワイプでスライド'],
    },
    features: ['シンプルなルール', '戦略的なゲームプレイ', 'アンドゥ機能', 'ベストスコア記録'],
  },
  {
    id: 'algorithm',
    title: 'アルゴリズム計算量ビジュアライザ',
    description:
      'ソートや探索など20種類のアルゴリズムを可視化。2つのアルゴリズムを並べて比較し、計算量の違いを目で学べるインタラクティブな学習ツール',
    thumbnail: '/game-images/algorithm.jpg',
    category: GAME_CATEGORIES.LEARNING,
    difficulty: 'medium',
    controls: {
      desktop: ['スライダー: ステップ操作', 'スペース: 再生/停止', 'ドロップダウン: 問題選択'],
      mobile: ['スライダーをドラッグ: ステップ操作', 'ボタン: 再生/停止'],
    },
    features: [
      '20種類のアルゴリズム比較',
      'ステップバイステップ可視化',
      'O記法の計算量表示',
      '自動再生とスライダー操作',
      '初心者向け日本語解説',
    ],
  },
]

/**
 * IDからゲームを取得
 */
export function getGameById(id: string): Game | undefined {
  return games.find((game) => game.id === id)
}

/**
 * カテゴリーごとにゲームを取得
 */
export function getGamesByCategory(category: string): Game[] {
  return games.filter((game) => game.category === category)
}
