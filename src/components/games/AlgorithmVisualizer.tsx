'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { AlgorithmPair, AlgorithmStep } from '@/lib/algorithms/types'
import { algorithmPairs } from '@/lib/algorithms'

/** カテゴリフィルタの定義 */
const CATEGORIES = [
  { key: 'all', label: '全て' },
  { key: 'sort', label: 'ソート' },
  { key: 'search', label: '探索' },
  { key: 'datastructure', label: 'データ構造' },
  { key: 'numeric', label: '数値' },
  { key: 'applied', label: '応用' },
] as const

/** 再生速度の定義（ミリ秒） */
const SPEED_OPTIONS = [
  { label: '遅い', value: 500 },
  { label: '普通', value: 200 },
  { label: '速い', value: 50 },
] as const

/** 配列サイズの選択肢 */
const SIZE_OPTIONS = [8, 12, 16, 20, 24] as const

/**
 * ランダムな配列を生成する
 * @param size - 配列の要素数
 * @returns 1からsize*4までのランダムな整数配列
 */
function generateRandomArray(size: number): number[] {
  const arr: number[] = []
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * size * 4) + 1)
  }
  return arr
}

/**
 * バーの色クラスを状態に応じて返す
 * @param index - バーのインデックス
 * @param step - 現在のアルゴリズムステップ
 * @param defaultColor - デフォルトのバー色
 * @returns Tailwindのbg-クラス名
 */
function getBarColorClass(
  index: number,
  step: AlgorithmStep | undefined,
  defaultColor: string
): string {
  if (!step) return 'bg-gray-600'
  if (step.found === index) return 'bg-emerald-400'
  if (step.swapping?.includes(index)) return 'bg-red-500'
  if (step.comparing?.includes(index)) return 'bg-yellow-400'
  if (step.searching === index) return 'bg-orange-400'
  if (step.sorted?.includes(index)) return 'bg-green-500'
  return defaultColor
}

/**
 * アルゴリズム可視化コンポーネント
 *
 * 2つのアルゴリズムを横並びに比較表示し、
 * スライダーやPlay/Pauseで同時にステップを進めることができる。
 */
export default function AlgorithmVisualizer() {
  /** 選択中のアルゴリズムペアID */
  const [selectedPairId, setSelectedPairId] = useState<string>('')
  /** 現在のステップ番号 */
  const [currentStep, setCurrentStep] = useState(0)
  /** 自動再生中かどうか */
  const [isPlaying, setIsPlaying] = useState(false)
  /** 再生速度（ミリ秒） */
  const [speed, setSpeed] = useState(200)
  /** 配列サイズ */
  const [arraySize, setArraySize] = useState(12)
  /** アルゴリズムAのステップ一覧 */
  const [stepsA, setStepsA] = useState<AlgorithmStep[]>([])
  /** アルゴリズムBのステップ一覧 */
  const [stepsB, setStepsB] = useState<AlgorithmStep[]>([])
  /** カテゴリフィルタ */
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  /** 初期化済みフラグ */
  const [initialized, setInitialized] = useState(false)

  /** 自動再生用のintervalを保持するref */
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /** カテゴリでフィルタされたアルゴリズムペア一覧 */
  const filteredPairs = useMemo(() => {
    if (categoryFilter === 'all') return algorithmPairs
    return algorithmPairs.filter((p) => p.category === categoryFilter)
  }, [categoryFilter])

  /** 現在選択中のアルゴリズムペア */
  const selectedPair = useMemo(() => {
    return algorithmPairs.find((p) => p.id === selectedPairId)
  }, [selectedPairId])

  /** 最大ステップ数（AとBのうち多い方） */
  const maxSteps = useMemo(() => {
    return Math.max(stepsA.length, stepsB.length)
  }, [stepsA.length, stepsB.length])

  /**
   * ステップを生成する
   * 同じ配列を両方のアルゴリズムに渡して実行する
   */
  const generateSteps = useCallback((pair: AlgorithmPair, size: number) => {
    const arr = generateRandomArray(size)
    const newStepsA = pair.algorithmA.generator([...arr])
    const newStepsB = pair.algorithmB.generator([...arr])
    setStepsA(newStepsA)
    setStepsB(newStepsB)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])

  /** 初期化：最初のアルゴリズムペアを選択する */
  useEffect(() => {
    if (!initialized && algorithmPairs.length > 0) {
      const firstPair = algorithmPairs[0]
      setSelectedPairId(firstPair.id)
      setArraySize(firstPair.defaultSize)
      generateSteps(firstPair, firstPair.defaultSize)
      setInitialized(true)
    }
  }, [initialized, generateSteps])

  /** アルゴリズムペアが変更されたときにステップを再生成する */
  const handlePairChange = useCallback(
    (pairId: string) => {
      const pair = algorithmPairs.find((p) => p.id === pairId)
      if (!pair) return
      setSelectedPairId(pairId)
      setArraySize(pair.defaultSize)
      generateSteps(pair, pair.defaultSize)
    },
    [generateSteps]
  )

  /** 配列サイズ変更 */
  const handleSizeChange = useCallback(
    (size: number) => {
      setArraySize(size)
      if (selectedPair) {
        generateSteps(selectedPair, size)
      }
    },
    [selectedPair, generateSteps]
  )

  /** リセット */
  const handleReset = useCallback(() => {
    if (selectedPair) {
      generateSteps(selectedPair, arraySize)
    }
  }, [selectedPair, arraySize, generateSteps])

  /** 自動再生の制御 */
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (isPlaying && maxSteps > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= maxSteps - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, speed)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, speed, maxSteps])

  /** Play/Pause切り替え */
  const togglePlay = useCallback(() => {
    if (currentStep >= maxSteps - 1) {
      setCurrentStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying((prev) => !prev)
    }
  }, [currentStep, maxSteps])

  /** 現在のステップ情報を取得する（範囲外は最後のステップを返す） */
  const currentStepA =
    stepsA.length > 0 ? stepsA[Math.min(currentStep, stepsA.length - 1)] : undefined
  const currentStepB =
    stepsB.length > 0 ? stepsB[Math.min(currentStep, stepsB.length - 1)] : undefined

  /** 現在の配列の最大値（バーの高さ計算用） */
  const maxValue = useMemo(() => {
    const allValues = [...(currentStepA?.array ?? []), ...(currentStepB?.array ?? [])]
    return Math.max(...allValues, 1)
  }, [currentStepA, currentStepB])

  /** カテゴリ変更時、フィルタ結果にペアがなければ先頭を選択 */
  useEffect(() => {
    if (filteredPairs.length > 0 && !filteredPairs.find((p) => p.id === selectedPairId)) {
      handlePairChange(filteredPairs[0].id)
    }
  }, [filteredPairs, selectedPairId, handlePairChange])

  if (!selectedPair || !initialized) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-gray-900 text-gray-400">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8 text-gray-100">
      <div className="mx-auto max-w-7xl">
        {/* ヘッダー: タイトルとアルゴリズム選択 */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-white">アルゴリズム比較ビジュアライザ</h1>
          <select
            value={selectedPairId}
            onChange={(e) => handlePairChange(e.target.value)}
            className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none"
            aria-label="アルゴリズムペアを選択"
          >
            {filteredPairs.map((pair) => (
              <option key={pair.id} value={pair.id}>
                {pair.title}
              </option>
            ))}
          </select>
        </div>

        {/* カテゴリフィルタタブ */}
        <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="カテゴリフィルタ">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              role="tab"
              aria-selected={categoryFilter === cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                categoryFilter === cat.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 問題の説明 */}
        <p className="mb-6 text-sm leading-relaxed text-gray-400">{selectedPair.description}</p>

        {/* 比較パネル（横並び） */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* アルゴリズムAパネル */}
          <VisualizationPanel
            name={selectedPair.algorithmA.name}
            complexity={selectedPair.algorithmA.complexity}
            color={selectedPair.algorithmA.color}
            step={currentStepA}
            stepIndex={Math.min(currentStep, stepsA.length - 1)}
            totalSteps={stepsA.length}
            maxValue={maxValue}
            isFinished={currentStep >= stepsA.length - 1}
            side="A"
          />
          {/* アルゴリズムBパネル */}
          <VisualizationPanel
            name={selectedPair.algorithmB.name}
            complexity={selectedPair.algorithmB.complexity}
            color={selectedPair.algorithmB.color}
            step={currentStepB}
            stepIndex={Math.min(currentStep, stepsB.length - 1)}
            totalSteps={stepsB.length}
            maxValue={maxValue}
            isFinished={currentStep >= stepsB.length - 1}
            side="B"
          />
        </div>

        {/* スライダー */}
        <div className="mb-6 rounded-xl bg-gray-800 p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
            <span>ステップ</span>
            <span>
              {maxSteps > 0 ? currentStep + 1 : 0} / {maxSteps}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(maxSteps - 1, 0)}
            value={currentStep}
            onChange={(e) => {
              setCurrentStep(Number(e.target.value))
              setIsPlaying(false)
            }}
            className="w-full cursor-pointer accent-blue-500"
            aria-label="ステップスライダー"
          />
        </div>

        {/* コントロール */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            aria-label={isPlaying ? '一時停止' : '再生'}
          >
            {isPlaying ? '一時停止' : currentStep >= maxSteps - 1 ? '最初から再生' : '再生'}
          </button>

          {/* リセット */}
          <button
            onClick={handleReset}
            className="rounded-lg bg-gray-700 px-5 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-600"
          >
            リセット
          </button>

          {/* 速度選択 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">速度:</span>
            {SPEED_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSpeed(opt.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  speed === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* 配列サイズ */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">要素数:</span>
            <select
              value={arraySize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs text-gray-200 focus:border-blue-500 focus:outline-none"
              aria-label="配列サイズ"
            >
              {SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 解説セクション */}
        <div className="rounded-xl bg-gray-800 p-6">
          <h2 className="mb-4 text-lg font-bold text-white">解説</h2>

          {/* 現在のステップ説明 */}
          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg bg-gray-900 p-3">
              <h3 className="mb-1 text-sm font-semibold text-blue-400">
                {selectedPair.algorithmA.name} - 現在の動作
              </h3>
              <p className="text-sm text-gray-300">{currentStepA?.description ?? '--'}</p>
            </div>
            <div className="rounded-lg bg-gray-900 p-3">
              <h3 className="mb-1 text-sm font-semibold text-purple-400">
                {selectedPair.algorithmB.name} - 現在の動作
              </h3>
              <p className="text-sm text-gray-300">{currentStepB?.description ?? '--'}</p>
            </div>
          </div>

          {/* なぜ計算量が違うのか */}
          <div className="rounded-lg bg-gray-900 p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-200">なぜ計算量が違うのか</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-400">
              {selectedPair.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 可視化パネルのprops */
interface VisualizationPanelProps {
  /** アルゴリズム名 */
  name: string
  /** 計算量（O記法） */
  complexity: string
  /** バーのデフォルト色（Tailwindクラス名） */
  color: string
  /** 現在のステップデータ */
  step: AlgorithmStep | undefined
  /** 現在のステップインデックス */
  stepIndex: number
  /** ステップ総数 */
  totalSteps: number
  /** 配列値の最大値（高さ正規化用） */
  maxValue: number
  /** このアルゴリズムが完了済みかどうか */
  isFinished: boolean
  /** パネル識別子 */
  side: 'A' | 'B'
}

/**
 * 1つのアルゴリズムの可視化パネル
 *
 * バーチャートで配列状態を描画し、各バーの色をステップの状態に応じて変える。
 */
function VisualizationPanel({
  name,
  complexity,
  color,
  step,
  stepIndex,
  totalSteps,
  maxValue,
  isFinished,
  side,
}: VisualizationPanelProps) {
  /** バーチャートの最大高さ（px） */
  const MAX_BAR_HEIGHT = 200

  /** パネルのアクセントカラー */
  const accentColor = side === 'A' ? 'text-blue-400' : 'text-purple-400'
  const borderColor = side === 'A' ? 'border-blue-500/30' : 'border-purple-500/30'

  return (
    <div
      className={`rounded-xl border bg-gray-800 p-5 ${borderColor}`}
      role="region"
      aria-label={`${name}の可視化`}
    >
      {/* ヘッダー */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-bold ${accentColor}`}>{name}</h2>
          <span className="text-xs text-gray-500">{complexity}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-white">{stepIndex + 1}</div>
          <div className="text-xs text-gray-500">/ {totalSteps} ステップ</div>
        </div>
      </div>

      {/* 完了バッジ */}
      {isFinished && totalSteps > 0 && (
        <div className="mb-3 rounded-md bg-green-900/40 px-3 py-1 text-center text-xs font-medium text-green-400">
          完了
        </div>
      )}

      {/* バーチャート */}
      <div
        className="flex items-end justify-center gap-[2px]"
        style={{ height: `${MAX_BAR_HEIGHT + 24}px` }}
        aria-hidden="true"
      >
        {step?.array.map((value, index) => {
          const height = (value / maxValue) * MAX_BAR_HEIGHT
          const barColor = getBarColorClass(index, step, color)

          return (
            <div
              key={index}
              className="flex flex-col items-center"
              style={{
                flex: '1 1 0%',
                maxWidth: '40px',
              }}
            >
              <span className="mb-1 text-[10px] text-gray-500">{value}</span>
              <div
                className={`w-full rounded-t-sm ${barColor}`}
                style={{
                  height: `${Math.max(height, 4)}px`,
                  transition: 'height 150ms ease-out, background-color 100ms ease',
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
