'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  normalQuestions,
  japaneseQuestions,
  vimQuestions,
  macShortcutQuestions,
  ROMAJI_TABLE,
} from '@/lib/games/typing-data'

// ---------------------------------------------------------------------------
// 型定義
// ---------------------------------------------------------------------------

/** ゲームモード */
type GameMode = 'normal' | 'japanese' | 'vim' | 'mac'

/** 難易度 */
type Difficulty = 'easy' | 'medium' | 'hard'

/** 画面の状態 */
type Screen = 'select' | 'playing' | 'result'

/** localStorage に保存するスコア情報 */
interface GameStats {
  highScores: { [mode: string]: { [difficulty: string]: number } }
  totalGames: number
  weakKeys: { [key: string]: { total: number; miss: number } }
}

/** 各文字の入力結果 */
interface CharResult {
  char: string
  correct: boolean
}

/** Vim 問題の回答結果 */
interface VimResult {
  instruction: string
  correct: boolean
  playerKeys: string[]
  expectedKeys: string[]
}

/** Mac ショートカット問題の回答結果 */
interface MacResult {
  instruction: string
  correct: boolean
  playerAnswer: string
  expectedAnswer: string
}

// ---------------------------------------------------------------------------
// 定数
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'typing-game-stats'

const MODE_INFO: {
  [key in GameMode]: { name: string; description: string; icon: string }
} = {
  normal: {
    name: '通常タイピング',
    description: '英単語や文章をタイピングして速度と正確性を鍛える',
    icon: '[A]',
  },
  japanese: {
    name: '日本語タイピング',
    description: 'ローマ字入力で日本語をタイピング。複数のローマ字パターンに対応',
    icon: '[あ]',
  },
  vim: {
    name: 'Vimトレーニング',
    description: 'Vimのキー操作を実践的に学ぶ。カーソル移動やテキスト編集を練習',
    icon: '[Vi]',
  },
  mac: {
    name: 'Macショートカット',
    description: 'macOSの便利なショートカットキーをマスターする',
    icon: '[Cmd]',
  },
}

const DIFFICULTY_LABELS: { [key in Difficulty]: string } = {
  easy: '初級',
  medium: '中級',
  hard: '上級',
}

/** Vim モードで表示するサンプルコード */
const SAMPLE_CODE_LINES = [
  'function greet(name) {',
  '  const message = `Hello, ${name}!`;',
  '  console.log(message);',
  '  return message;',
  '}',
  '',
  'const users = ["Alice", "Bob"];',
  'users.forEach((user) => {',
  '  greet(user);',
  '});',
]

// ---------------------------------------------------------------------------
// ユーティリティ関数
// ---------------------------------------------------------------------------

/** localStorage からスコア情報を取得する */
function loadStats(): GameStats {
  if (typeof window === 'undefined') {
    return { highScores: {}, totalGames: 0, weakKeys: {} }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as GameStats
  } catch {
    // パースに失敗した場合はデフォルト値を返す
  }
  return { highScores: {}, totalGames: 0, weakKeys: {} }
}

/** localStorage にスコア情報を保存する */
function saveStats(stats: GameStats): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // ストレージが利用できない場合は無視する
  }
}

/** WPM (Words Per Minute) を計算する */
function calcWpm(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0
  return Math.round((correctChars / 5 / elapsedSeconds) * 60)
}

/** 正確性(%)を計算する */
function calcAccuracy(correct: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((correct / total) * 100)
}

/**
 * ひらがなをローマ字のパターン候補一覧に変換する。
 * 例: "し" -> ["si", "shi", "ci"]
 */
function kanaToRomajiPatterns(kana: string): string[][] {
  const result: string[][] = []
  let i = 0
  while (i < kana.length) {
    // 2文字の組み合わせを先にチェック（拗音など）
    if (i + 1 < kana.length) {
      const twoChar = kana.slice(i, i + 2)
      if (ROMAJI_TABLE[twoChar]) {
        result.push(ROMAJI_TABLE[twoChar])
        i += 2
        continue
      }
    }
    const oneChar = kana[i]
    if (ROMAJI_TABLE[oneChar]) {
      result.push(ROMAJI_TABLE[oneChar])
    } else {
      // テーブルにない文字はそのまま入力する想定
      result.push([oneChar])
    }
    i += 1
  }
  return result
}

/**
 * 弱点キー上位5件を取得する
 */
function getTopWeakKeys(
  weakKeys: { [key: string]: { total: number; miss: number } },
  count: number = 5
): { key: string; missRate: number; total: number; miss: number }[] {
  return Object.entries(weakKeys)
    .filter(([, v]) => v.total >= 2)
    .map(([key, v]) => ({
      key,
      missRate: v.miss / v.total,
      total: v.total,
      miss: v.miss,
    }))
    .sort((a, b) => b.missRate - a.missRate)
    .slice(0, count)
}

// ---------------------------------------------------------------------------
// メインコンポーネント
// ---------------------------------------------------------------------------

/** タイピングゲーム - 複数モード対応のタイピング練習ツール */
export default function TypingGame() {
  // 画面状態
  const [screen, setScreen] = useState<Screen>('select')
  const [mode, setMode] = useState<GameMode>('normal')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')

  // ゲーム共通状態
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isRunning, setIsRunning] = useState(false)
  const [totalKeystrokes, setTotalKeystrokes] = useState(0)
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0)
  const startTimeRef = useRef<number>(0)

  // 通常タイピング用
  const [normalQuestionIndex, setNormalQuestionIndex] = useState(0)
  const [normalCharIndex, setNormalCharIndex] = useState(0)
  const [charResults, setCharResults] = useState<CharResult[]>([])
  const [questionsCompleted, setQuestionsCompleted] = useState(0)

  // 日本語タイピング用
  const [jpQuestionIndex, setJpQuestionIndex] = useState(0)
  const [jpKanaIndex, setJpKanaIndex] = useState(0)
  const [jpRomajiBuffer, setJpRomajiBuffer] = useState('')
  const [jpConvertedKana, setJpConvertedKana] = useState('')
  const [showReading, setShowReading] = useState(true)

  // Vim 用
  const [vimQuestionIndex, setVimQuestionIndex] = useState(0)
  const [vimInput, setVimInput] = useState<string[]>([])
  const [vimKeyIndex, setVimKeyIndex] = useState(0)
  const [vimResults, setVimResults] = useState<VimResult[]>([])
  const [vimCursorLine, setVimCursorLine] = useState(0)
  const [vimCursorCol, setVimCursorCol] = useState(0)
  const [vimTargetLine, setVimTargetLine] = useState(4)
  const [vimShowHint, setVimShowHint] = useState(false)
  const [vimFeedback, setVimFeedback] = useState<'correct' | 'wrong' | null>(null)

  // Mac ショートカット用
  const [macQuestionIndex, setMacQuestionIndex] = useState(0)
  const [macResults, setMacResults] = useState<MacResult[]>([])
  const [macFeedback, setMacFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [macChoices, setMacChoices] = useState<string[]>([])
  const [macSelectedChoice, setMacSelectedChoice] = useState<number | null>(null)

  // 弱点キー追跡
  const weakKeysRef = useRef<{ [key: string]: { total: number; miss: number } }>({})

  // ---------------------------------------------------------------------------
  // 問題データの取得
  // ---------------------------------------------------------------------------

  const currentNormalQuestions = useMemo(() => {
    return normalQuestions[difficulty] || []
  }, [difficulty])

  const currentJpQuestions = useMemo(() => {
    return japaneseQuestions[difficulty] || []
  }, [difficulty])

  const filteredVimQuestions = useMemo(() => {
    return vimQuestions.filter(
      (q) =>
        (difficulty === 'easy' && q.difficulty === 'easy') ||
        (difficulty === 'medium' && (q.difficulty === 'easy' || q.difficulty === 'medium')) ||
        difficulty === 'hard'
    )
  }, [difficulty])

  const filteredMacQuestions = useMemo(() => {
    return macShortcutQuestions.filter(
      (q) =>
        (difficulty === 'easy' && q.difficulty === 'easy') ||
        (difficulty === 'medium' && (q.difficulty === 'easy' || q.difficulty === 'medium')) ||
        difficulty === 'hard'
    )
  }, [difficulty])

  // ---------------------------------------------------------------------------
  // タイマー
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isRunning || difficulty === 'easy') return
    if (timeLeft <= 0) {
      setIsRunning(false)
      setScreen('result')
      return
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isRunning, timeLeft, difficulty])

  // ---------------------------------------------------------------------------
  // ゲーム開始
  // ---------------------------------------------------------------------------

  const startGame = useCallback(() => {
    setScore(0)
    setTimeLeft(difficulty === 'easy' ? 9999 : 60)
    setTotalKeystrokes(0)
    setCorrectKeystrokes(0)
    setQuestionsCompleted(0)
    weakKeysRef.current = {}
    startTimeRef.current = Date.now()

    // モード別初期化
    setNormalQuestionIndex(0)
    setNormalCharIndex(0)
    setCharResults([])

    setJpQuestionIndex(0)
    setJpKanaIndex(0)
    setJpRomajiBuffer('')
    setJpConvertedKana('')

    setVimQuestionIndex(0)
    setVimInput([])
    setVimKeyIndex(0)
    setVimResults([])
    setVimCursorLine(0)
    setVimCursorCol(0)
    setVimTargetLine(4)
    setVimShowHint(false)
    setVimFeedback(null)

    setMacQuestionIndex(0)
    setMacResults([])
    setMacFeedback(null)
    setMacSelectedChoice(null)

    // Mac モードの最初の問題で選択肢を生成
    if (mode === 'mac' && filteredMacQuestions.length > 0) {
      generateMacChoices(0)
    }

    setIsRunning(true)
    setScreen('playing')
  }, [difficulty, mode, filteredMacQuestions])

  // ---------------------------------------------------------------------------
  // ゲーム終了・結果保存
  // ---------------------------------------------------------------------------

  const endGame = useCallback(() => {
    setIsRunning(false)
    setScreen('result')

    // スコアを保存
    const stats = loadStats()
    stats.totalGames += 1
    if (!stats.highScores[mode]) stats.highScores[mode] = {}
    const currentHigh = stats.highScores[mode][difficulty] || 0
    if (score > currentHigh) {
      stats.highScores[mode][difficulty] = score
    }
    // 弱点キーをマージ
    for (const [key, val] of Object.entries(weakKeysRef.current)) {
      if (!stats.weakKeys[key]) stats.weakKeys[key] = { total: 0, miss: 0 }
      stats.weakKeys[key].total += val.total
      stats.weakKeys[key].miss += val.miss
    }
    saveStats(stats)
  }, [mode, difficulty, score])

  // ---------------------------------------------------------------------------
  // 通常タイピング用キーハンドラ
  // ---------------------------------------------------------------------------

  const handleNormalKey = useCallback(
    (key: string) => {
      if (currentNormalQuestions.length === 0) return
      const question = currentNormalQuestions[normalQuestionIndex]
      if (!question) {
        endGame()
        return
      }
      const expectedChar = question.text[normalCharIndex]
      if (!expectedChar) return

      const isCorrect = key === expectedChar
      setTotalKeystrokes((p) => p + 1)

      // 弱点キー追跡
      const trackKey = expectedChar.toLowerCase()
      if (!weakKeysRef.current[trackKey]) weakKeysRef.current[trackKey] = { total: 0, miss: 0 }
      weakKeysRef.current[trackKey].total += 1

      if (isCorrect) {
        setCorrectKeystrokes((p) => p + 1)
        setScore((p) => p + 10)
        setCharResults((prev) => [...prev, { char: expectedChar, correct: true }])
        const nextIndex = normalCharIndex + 1
        if (nextIndex >= question.text.length) {
          // 問題完了 -> 次の問題へ
          setQuestionsCompleted((p) => p + 1)
          const nextQ = normalQuestionIndex + 1
          if (nextQ >= currentNormalQuestions.length) {
            endGame()
            return
          }
          setNormalQuestionIndex(nextQ)
          setNormalCharIndex(0)
          setCharResults([])
        } else {
          setNormalCharIndex(nextIndex)
        }
      } else {
        weakKeysRef.current[trackKey].miss += 1
        setCharResults((prev) => [...prev, { char: expectedChar, correct: false }])
        // ミスしても次の文字へ進む
        const nextIndex = normalCharIndex + 1
        if (nextIndex >= question.text.length) {
          setQuestionsCompleted((p) => p + 1)
          const nextQ = normalQuestionIndex + 1
          if (nextQ >= currentNormalQuestions.length) {
            endGame()
            return
          }
          setNormalQuestionIndex(nextQ)
          setNormalCharIndex(0)
          setCharResults([])
        } else {
          setNormalCharIndex(nextIndex)
        }
      }
    },
    [currentNormalQuestions, normalQuestionIndex, normalCharIndex, endGame]
  )

  // ---------------------------------------------------------------------------
  // 日本語タイピング用キーハンドラ
  // ---------------------------------------------------------------------------

  const handleJapaneseKey = useCallback(
    (key: string) => {
      if (currentJpQuestions.length === 0) return
      const question = currentJpQuestions[jpQuestionIndex]
      if (!question) {
        endGame()
        return
      }

      const reading = question.reading
      const kanaPatterns = kanaToRomajiPatterns(reading)
      if (jpKanaIndex >= kanaPatterns.length) {
        endGame()
        return
      }

      setTotalKeystrokes((p) => p + 1)
      const currentPatterns = kanaPatterns[jpKanaIndex]
      const newBuffer = jpRomajiBuffer + key

      // 現在のバッファが、いずれかのパターンの先頭と一致するか確認
      const matchingPatterns = currentPatterns.filter((p) => p.startsWith(newBuffer))
      const exactMatch = currentPatterns.find((p) => p === newBuffer)

      const trackKey = key.toLowerCase()
      if (!weakKeysRef.current[trackKey]) weakKeysRef.current[trackKey] = { total: 0, miss: 0 }
      weakKeysRef.current[trackKey].total += 1

      if (exactMatch) {
        // かな1文字分の完全一致
        setCorrectKeystrokes((p) => p + newBuffer.length)
        setScore((p) => p + 15)
        const newConverted = jpConvertedKana + reading[jpKanaIndex]
        // 2文字のかな（拗音）に対応
        const consumed = ROMAJI_TABLE[reading.slice(jpKanaIndex, jpKanaIndex + 2)]
          ? reading.slice(jpKanaIndex, jpKanaIndex + 2)
          : reading[jpKanaIndex]
        setJpConvertedKana(
          newConverted.length > jpConvertedKana.length ? newConverted : jpConvertedKana + consumed
        )
        setJpRomajiBuffer('')

        const nextKana = jpKanaIndex + 1
        if (nextKana >= kanaPatterns.length) {
          // 問題完了
          setQuestionsCompleted((p) => p + 1)
          const nextQ = jpQuestionIndex + 1
          if (nextQ >= currentJpQuestions.length) {
            endGame()
            return
          }
          setJpQuestionIndex(nextQ)
          setJpKanaIndex(0)
          setJpRomajiBuffer('')
          setJpConvertedKana('')
        } else {
          setJpKanaIndex(nextKana)
        }
      } else if (matchingPatterns.length > 0) {
        // 部分一致 - バッファに追加
        setCorrectKeystrokes((p) => p + 1)
        setJpRomajiBuffer(newBuffer)
      } else {
        // 不一致
        weakKeysRef.current[trackKey].miss += 1
        // バッファをリセットせず、入力を無視する
      }
    },
    [currentJpQuestions, jpQuestionIndex, jpKanaIndex, jpRomajiBuffer, jpConvertedKana, endGame]
  )

  // ---------------------------------------------------------------------------
  // Vim 用キーハンドラ
  // ---------------------------------------------------------------------------

  const handleVimKey = useCallback(
    (key: string) => {
      if (filteredVimQuestions.length === 0) return
      const question = filteredVimQuestions[vimQuestionIndex]
      if (!question) {
        endGame()
        return
      }

      setTotalKeystrokes((p) => p + 1)
      const newInput = [...vimInput, key]
      setVimInput(newInput)

      const trackKey = key.toLowerCase()
      if (!weakKeysRef.current[trackKey]) weakKeysRef.current[trackKey] = { total: 0, miss: 0 }
      weakKeysRef.current[trackKey].total += 1

      const expectedKey = question.keys[vimKeyIndex]
      if (key === expectedKey) {
        setCorrectKeystrokes((p) => p + 1)
        setVimKeyIndex((prev) => prev + 1)

        // カーソル位置のアニメーション
        if (key === 'j') setVimCursorLine((p) => Math.min(p + 1, SAMPLE_CODE_LINES.length - 1))
        else if (key === 'k') setVimCursorLine((p) => Math.max(p - 1, 0))
        else if (key === '$') setVimCursorCol(999)
        else if (key === '0' || key === '^') setVimCursorCol(0)
        else if (key === 'G') setVimCursorLine(SAMPLE_CODE_LINES.length - 1)
        else if (key === 'g') {
          // gg の2文字目
        } else if (key === 'w') setVimCursorCol((p) => p + 4)
        else if (key === 'b') setVimCursorCol((p) => Math.max(p - 4, 0))

        if (vimKeyIndex + 1 >= question.keys.length) {
          // 問題正解
          setScore((p) => p + 20)
          setVimFeedback('correct')
          setVimResults((prev) => [
            ...prev,
            {
              instruction: question.instruction,
              correct: true,
              playerKeys: newInput,
              expectedKeys: question.keys,
            },
          ])
          setTimeout(() => {
            setVimFeedback(null)
            advanceVimQuestion()
          }, 800)
        }
      } else {
        // 不正解
        weakKeysRef.current[trackKey].miss += 1
        setVimFeedback('wrong')
        setVimResults((prev) => [
          ...prev,
          {
            instruction: question.instruction,
            correct: false,
            playerKeys: newInput,
            expectedKeys: question.keys,
          },
        ])
        setTimeout(() => {
          setVimFeedback(null)
          advanceVimQuestion()
        }, 1200)
      }
    },
    [filteredVimQuestions, vimQuestionIndex, vimKeyIndex, vimInput, endGame]
  )

  const advanceVimQuestion = useCallback(() => {
    const nextQ = vimQuestionIndex + 1
    if (nextQ >= filteredVimQuestions.length) {
      endGame()
      return
    }
    setVimQuestionIndex(nextQ)
    setVimInput([])
    setVimKeyIndex(0)
    setVimCursorLine(0)
    setVimCursorCol(0)
    setQuestionsCompleted((p) => p + 1)
  }, [vimQuestionIndex, filteredVimQuestions.length, endGame])

  // ---------------------------------------------------------------------------
  // Mac ショートカット用
  // ---------------------------------------------------------------------------

  /** 選択肢をシャッフルして生成する */
  const generateMacChoices = useCallback(
    (questionIdx: number) => {
      if (filteredMacQuestions.length === 0) return
      const q = filteredMacQuestions[questionIdx]
      if (!q) return
      const correctAnswer = q.displayKeys.join(' + ')
      // ダミー選択肢を生成
      const dummies = filteredMacQuestions
        .filter((_, i) => i !== questionIdx)
        .map((d) => d.displayKeys.join(' + '))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
      const all = [correctAnswer, ...dummies].sort(() => Math.random() - 0.5)
      setMacChoices(all)
    },
    [filteredMacQuestions]
  )

  const handleMacKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (filteredMacQuestions.length === 0) return
      const question = filteredMacQuestions[macQuestionIndex]
      if (!question || !question.canCapture) return

      // キャプチャ可能なショートカットのみキーボードで判定
      e.preventDefault()

      setTotalKeystrokes((p) => p + 1)

      const trackKey = e.key.toLowerCase()
      if (!weakKeysRef.current[trackKey]) weakKeysRef.current[trackKey] = { total: 0, miss: 0 }
      weakKeysRef.current[trackKey].total += 1

      // 期待するキーの組み合わせを確認
      const expectedKeys = question.keys
      const allMatch = expectedKeys.every((expected) => {
        if (expected.meta && !e.metaKey) return false
        if (expected.ctrl && !e.ctrlKey) return false
        if (expected.alt && !e.altKey) return false
        if (expected.shift && !e.shiftKey) return false
        return e.key.toLowerCase() === expected.key.toLowerCase()
      })

      const correctAnswer = question.displayKeys.join(' + ')

      if (allMatch) {
        setCorrectKeystrokes((p) => p + 1)
        setScore((p) => p + 25)
        setMacFeedback('correct')
        setMacResults((prev) => [
          ...prev,
          {
            instruction: question.instruction,
            correct: true,
            playerAnswer: correctAnswer,
            expectedAnswer: correctAnswer,
          },
        ])
      } else {
        weakKeysRef.current[trackKey].miss += 1
        setMacFeedback('wrong')
        setMacResults((prev) => [
          ...prev,
          {
            instruction: question.instruction,
            correct: false,
            playerAnswer: `${e.metaKey ? 'Cmd+' : ''}${e.ctrlKey ? 'Ctrl+' : ''}${e.altKey ? 'Alt+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`,
            expectedAnswer: correctAnswer,
          },
        ])
      }

      setTimeout(() => {
        setMacFeedback(null)
        advanceMacQuestion()
      }, 800)
    },
    [filteredMacQuestions, macQuestionIndex]
  )

  /** 選択肢をクリックした場合の処理 */
  const handleMacChoice = useCallback(
    (choiceIndex: number) => {
      if (filteredMacQuestions.length === 0) return
      const question = filteredMacQuestions[macQuestionIndex]
      if (!question) return

      setMacSelectedChoice(choiceIndex)
      setTotalKeystrokes((p) => p + 1)

      const correctAnswer = question.displayKeys.join(' + ')
      const selected = macChoices[choiceIndex]

      const trackKey = question.displayKeys[0]?.toLowerCase() || 'unknown'
      if (!weakKeysRef.current[trackKey]) weakKeysRef.current[trackKey] = { total: 0, miss: 0 }
      weakKeysRef.current[trackKey].total += 1

      if (selected === correctAnswer) {
        setCorrectKeystrokes((p) => p + 1)
        setScore((p) => p + 25)
        setMacFeedback('correct')
        setMacResults((prev) => [
          ...prev,
          {
            instruction: question.instruction,
            correct: true,
            playerAnswer: selected,
            expectedAnswer: correctAnswer,
          },
        ])
      } else {
        weakKeysRef.current[trackKey].miss += 1
        setMacFeedback('wrong')
        setMacResults((prev) => [
          ...prev,
          {
            instruction: question.instruction,
            correct: false,
            playerAnswer: selected,
            expectedAnswer: correctAnswer,
          },
        ])
      }

      setTimeout(() => {
        setMacFeedback(null)
        setMacSelectedChoice(null)
        advanceMacQuestion()
      }, 1000)
    },
    [filteredMacQuestions, macQuestionIndex, macChoices]
  )

  const advanceMacQuestion = useCallback(() => {
    const nextQ = macQuestionIndex + 1
    if (nextQ >= filteredMacQuestions.length) {
      endGame()
      return
    }
    setMacQuestionIndex(nextQ)
    setQuestionsCompleted((p) => p + 1)
    generateMacChoices(nextQ)
  }, [macQuestionIndex, filteredMacQuestions.length, endGame, generateMacChoices])

  // ---------------------------------------------------------------------------
  // キーイベントリスナー
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (screen !== 'playing' || !isRunning) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // 共通: Tab, F キーなどのブラウザ操作は許可する
      if (e.key === 'Tab' || e.key.startsWith('F')) return

      if (mode === 'mac') {
        handleMacKeydown(e)
        return
      }

      // ブラウザのショートカットを無効化
      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault()
        return
      }

      // 入力文字以外は無視
      if (e.key.length !== 1 && e.key !== 'Escape') return
      if (e.key === 'Escape') {
        endGame()
        return
      }

      e.preventDefault()

      switch (mode) {
        case 'normal':
          handleNormalKey(e.key)
          break
        case 'japanese':
          handleJapaneseKey(e.key)
          break
        case 'vim':
          handleVimKey(e.key)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    screen,
    isRunning,
    mode,
    handleNormalKey,
    handleJapaneseKey,
    handleVimKey,
    handleMacKeydown,
    endGame,
  ])

  // ---------------------------------------------------------------------------
  // 計算値
  // ---------------------------------------------------------------------------

  const elapsedSeconds = useMemo(() => {
    if (!startTimeRef.current) return 0
    return (Date.now() - startTimeRef.current) / 1000
  }, [totalKeystrokes]) // totalKeystrokes が変わるたびに再計算

  const wpm = useMemo(
    () => calcWpm(correctKeystrokes, elapsedSeconds),
    [correctKeystrokes, elapsedSeconds]
  )
  const accuracy = useMemo(
    () => calcAccuracy(correctKeystrokes, totalKeystrokes),
    [correctKeystrokes, totalKeystrokes]
  )

  const topWeakKeys = useMemo(() => getTopWeakKeys(weakKeysRef.current), [screen])

  // ---------------------------------------------------------------------------
  // 画面描画: モード選択
  // ---------------------------------------------------------------------------

  if (screen === 'select') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-2">タイピングゲーム</h1>
        <p className="text-gray-400 mb-8">モードと難易度を選択してください</p>

        {/* モード選択カード */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full mb-8">
          {(Object.keys(MODE_INFO) as GameMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`p-6 rounded-xl text-left transition-all duration-200 ${
                mode === m ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl font-mono font-bold text-blue-300">
                  {MODE_INFO[m].icon}
                </span>
                <span className="text-lg font-semibold">{MODE_INFO[m].name}</span>
              </div>
              <p className="text-sm text-gray-300">{MODE_INFO[m].description}</p>
              {(m === 'vim' || m === 'mac') && (
                <p className="text-xs text-yellow-400 mt-2">* デスクトップ推奨</p>
              )}
            </button>
          ))}
        </div>

        {/* 難易度選択 */}
        <div className="flex gap-3 mb-8">
          {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                difficulty === d
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>

        {/* ハイスコア表示 */}
        <HighScoreDisplay mode={mode} difficulty={difficulty} />

        {/* 開始ボタン */}
        <button
          onClick={startGame}
          className="px-12 py-4 bg-green-600 hover:bg-green-500 rounded-xl text-xl font-bold transition-all duration-200 mt-4"
        >
          ゲーム開始
        </button>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // 画面描画: 結果
  // ---------------------------------------------------------------------------

  if (screen === 'result') {
    const stats = loadStats()
    const highScore = stats.highScores[mode]?.[difficulty] || 0

    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-3xl font-bold mb-6">結果</h2>

        <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <StatCard label="スコア" value={String(score)} />
            <StatCard
              label="ハイスコア"
              value={String(highScore)}
              highlight={score >= highScore && score > 0}
            />
            {(mode === 'normal' || mode === 'japanese') && (
              <>
                <StatCard label="WPM" value={String(wpm)} />
                <StatCard label="正確性" value={`${accuracy}%`} />
              </>
            )}
            <StatCard label="問題数" value={`${questionsCompleted}`} />
            <StatCard label="総キー入力" value={String(totalKeystrokes)} />
          </div>
        </div>

        {/* 弱点キー分析 */}
        {topWeakKeys.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mb-6">
            <h3 className="text-lg font-semibold mb-4">弱点キー分析</h3>
            <div className="space-y-2">
              {topWeakKeys.map((wk) => (
                <div key={wk.key} className="flex items-center justify-between">
                  <span className="font-mono bg-gray-700 px-3 py-1 rounded text-sm">{wk.key}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-red-400 h-2 rounded-full"
                        style={{ width: `${Math.round(wk.missRate * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-16 text-right">
                      {wk.miss}/{wk.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vim / Mac の詳細結果 */}
        {mode === 'vim' && vimResults.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mb-6 max-h-48 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-3">回答詳細</h3>
            {vimResults.map((r, i) => (
              <div
                key={i}
                className={`text-sm mb-1 ${r.correct ? 'text-green-400' : 'text-red-400'}`}
              >
                {r.correct ? '[正解]' : '[不正解]'} {r.instruction}
              </div>
            ))}
          </div>
        )}

        {mode === 'mac' && macResults.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mb-6 max-h-48 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-3">回答詳細</h3>
            {macResults.map((r, i) => (
              <div
                key={i}
                className={`text-sm mb-1 ${r.correct ? 'text-green-400' : 'text-red-400'}`}
              >
                {r.correct ? '[正解]' : '[不正解]'} {r.instruction}
                {!r.correct && (
                  <span className="text-gray-400 ml-2">(正解: {r.expectedAnswer})</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ボタン */}
        <div className="flex gap-4">
          <button
            onClick={startGame}
            className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-all duration-200"
          >
            もう一度
          </button>
          <button
            onClick={() => setScreen('select')}
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all duration-200"
          >
            モード選択に戻る
          </button>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // 画面描画: プレイ中
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      {/* ヘッダー: スコアとタイマー */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {MODE_INFO[mode].name} / {DIFFICULTY_LABELS[difficulty]}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-xs text-gray-500">スコア</div>
            <div className="text-xl font-bold text-green-400">{score}</div>
          </div>
          {(mode === 'normal' || mode === 'japanese') && (
            <>
              <div className="text-center">
                <div className="text-xs text-gray-500">WPM</div>
                <div className="text-xl font-bold">{wpm}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">正確性</div>
                <div className="text-xl font-bold">{accuracy}%</div>
              </div>
            </>
          )}
          {difficulty !== 'easy' && (
            <div className="text-center">
              <div className="text-xs text-gray-500">残り時間</div>
              <div className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-400' : ''}`}>
                {timeLeft}s
              </div>
            </div>
          )}
        </div>
        <button
          onClick={endGame}
          className="px-4 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          終了
        </button>
      </div>

      {/* モード別のプレイ画面 */}
      <div className="w-full max-w-3xl flex-1">
        {mode === 'normal' && (
          <NormalPlayView
            question={currentNormalQuestions[normalQuestionIndex]}
            charIndex={normalCharIndex}
            charResults={charResults}
            questionNumber={normalQuestionIndex + 1}
            totalQuestions={currentNormalQuestions.length}
          />
        )}

        {mode === 'japanese' && (
          <JapanesePlayView
            question={currentJpQuestions[jpQuestionIndex]}
            kanaIndex={jpKanaIndex}
            romajiBuffer={jpRomajiBuffer}
            convertedKana={jpConvertedKana}
            showReading={showReading}
            onToggleReading={() => setShowReading((p) => !p)}
            questionNumber={jpQuestionIndex + 1}
            totalQuestions={currentJpQuestions.length}
          />
        )}

        {mode === 'vim' && (
          <VimPlayView
            question={filteredVimQuestions[vimQuestionIndex]}
            cursorLine={vimCursorLine}
            cursorCol={vimCursorCol}
            targetLine={vimTargetLine}
            input={vimInput}
            feedback={vimFeedback}
            showHint={vimShowHint}
            onToggleHint={() => setVimShowHint((p) => !p)}
            questionNumber={vimQuestionIndex + 1}
            totalQuestions={filteredVimQuestions.length}
          />
        )}

        {mode === 'mac' && (
          <MacPlayView
            question={filteredMacQuestions[macQuestionIndex]}
            choices={macChoices}
            selectedChoice={macSelectedChoice}
            feedback={macFeedback}
            onChoiceClick={handleMacChoice}
            questionNumber={macQuestionIndex + 1}
            totalQuestions={filteredMacQuestions.length}
          />
        )}
      </div>

      {/* ESCキーのヒント */}
      <p className="text-xs text-gray-600 mt-4">Escキーで終了</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// サブコンポーネント
// ---------------------------------------------------------------------------

/** スコアカード表示用 */
function StatCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="bg-gray-700 rounded-lg p-3">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${highlight ? 'text-yellow-400' : ''}`}>{value}</div>
    </div>
  )
}

/** ハイスコア表示 */
function HighScoreDisplay({ mode, difficulty }: { mode: GameMode; difficulty: Difficulty }) {
  const [highScore, setHighScore] = useState(0)

  useEffect(() => {
    const stats = loadStats()
    setHighScore(stats.highScores[mode]?.[difficulty] || 0)
  }, [mode, difficulty])

  if (highScore === 0) return null

  return (
    <p className="text-sm text-gray-400 mb-2">
      ハイスコア: <span className="text-yellow-400 font-bold">{highScore}</span>
    </p>
  )
}

// ---------------------------------------------------------------------------
// 通常タイピングのプレイ画面
// ---------------------------------------------------------------------------

interface NormalPlayViewProps {
  question: { text: string; category: string } | undefined
  charIndex: number
  charResults: CharResult[]
  questionNumber: number
  totalQuestions: number
}

/** 通常タイピングモードのプレイ画面 */
function NormalPlayView({
  question,
  charIndex,
  charResults,
  questionNumber,
  totalQuestions,
}: NormalPlayViewProps) {
  if (!question) return <div className="text-gray-500 text-center">問題がありません</div>

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm text-gray-500 mb-4">
        問題 {questionNumber} / {totalQuestions}
        <span className="ml-4 text-gray-600">{question.category}</span>
      </div>
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl">
        <div className="font-mono text-2xl leading-relaxed tracking-wider flex flex-wrap justify-center">
          {question.text.split('').map((char, i) => {
            let colorClass = 'text-gray-600' // 未入力
            let extraClass = ''

            if (i < charResults.length) {
              // 入力済み
              colorClass = charResults[i].correct ? 'text-green-400' : 'text-red-400 underline'
            } else if (i === charIndex) {
              // 現在位置
              colorClass = 'text-white'
              extraClass = 'border-l-2 border-white animate-pulse'
            }

            return (
              <span key={i} className={`${colorClass} ${extraClass}`}>
                {char}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 日本語タイピングのプレイ画面
// ---------------------------------------------------------------------------

interface JapanesePlayViewProps {
  question: { text: string; reading: string; category: string } | undefined
  kanaIndex: number
  romajiBuffer: string
  convertedKana: string
  showReading: boolean
  onToggleReading: () => void
  questionNumber: number
  totalQuestions: number
}

/** 日本語タイピングモードのプレイ画面 */
function JapanesePlayView({
  question,
  kanaIndex,
  romajiBuffer,
  convertedKana,
  showReading,
  onToggleReading,
  questionNumber,
  totalQuestions,
}: JapanesePlayViewProps) {
  if (!question) return <div className="text-gray-500 text-center">問題がありません</div>

  const reading = question.reading

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm text-gray-500 mb-4">
        問題 {questionNumber} / {totalQuestions}
        <span className="ml-4 text-gray-600">{question.category}</span>
      </div>

      {/* 日本語テキスト表示 */}
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl mb-4">
        <div className="text-3xl font-bold text-center mb-4 tracking-widest">{question.text}</div>

        {/* 読みガイド */}
        {showReading && (
          <div className="text-center font-mono text-lg tracking-wider mb-4">
            {reading.split('').map((char, i) => {
              let colorClass = 'text-gray-600'
              if (i < convertedKana.length) {
                colorClass = 'text-green-400'
              } else if (i === kanaIndex) {
                colorClass = 'text-white border-l-2 border-white animate-pulse'
              }
              return (
                <span key={i} className={colorClass}>
                  {char}
                </span>
              )
            })}
          </div>
        )}

        {/* ローマ字入力バッファ */}
        <div className="text-center">
          <span className="font-mono text-xl text-yellow-400">{romajiBuffer}</span>
          <span className="text-gray-600 animate-pulse">|</span>
        </div>
      </div>

      <button
        onClick={onToggleReading}
        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        {showReading ? '読みガイドを非表示' : '読みガイドを表示'}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Vim トレーニングのプレイ画面
// ---------------------------------------------------------------------------

interface VimPlayViewProps {
  question:
    | { instruction: string; keys: string[]; category: string; difficulty: string }
    | undefined
  cursorLine: number
  cursorCol: number
  targetLine: number
  input: string[]
  feedback: 'correct' | 'wrong' | null
  showHint: boolean
  onToggleHint: () => void
  questionNumber: number
  totalQuestions: number
}

/** Vimトレーニングモードのプレイ画面 */
function VimPlayView({
  question,
  cursorLine,
  cursorCol,
  targetLine,
  input,
  feedback,
  showHint,
  onToggleHint,
  questionNumber,
  totalQuestions,
}: VimPlayViewProps) {
  if (!question) return <div className="text-gray-500 text-center">問題がありません</div>

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm text-gray-500 mb-2">
        問題 {questionNumber} / {totalQuestions}
        <span className="ml-4 text-gray-600">{question.category}</span>
      </div>

      {/* 命令文 */}
      <div
        className={`text-xl font-bold mb-4 px-6 py-3 rounded-lg transition-colors duration-300 ${
          feedback === 'correct'
            ? 'bg-green-900 text-green-300'
            : feedback === 'wrong'
              ? 'bg-red-900 text-red-300'
              : 'bg-gray-800 text-white'
        }`}
      >
        {question.instruction}
      </div>

      {/* コードエディタ風表示 */}
      <div className="bg-gray-950 rounded-xl p-4 w-full max-w-2xl font-mono text-sm border border-gray-700 mb-4">
        {SAMPLE_CODE_LINES.map((line, lineIdx) => (
          <div key={lineIdx} className="flex">
            <span className="text-gray-600 w-8 text-right mr-4 select-none">{lineIdx + 1}</span>
            <span className="flex-1">
              {line.split('').map((char, colIdx) => {
                const isCursor = lineIdx === cursorLine && colIdx === cursorCol
                const isTarget = lineIdx === targetLine && colIdx === 0
                return (
                  <span
                    key={colIdx}
                    className={`${
                      isCursor
                        ? 'bg-green-500 text-black'
                        : isTarget
                          ? 'border border-dashed border-yellow-500'
                          : 'text-gray-300'
                    }`}
                  >
                    {char}
                  </span>
                )
              })}
              {line.length === 0 && lineIdx === cursorLine && (
                <span className="bg-green-500 text-black"> </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* 入力表示 */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm text-gray-500">入力:</span>
        <div className="flex gap-1">
          {input.length === 0 && (
            <span className="text-gray-600 text-sm">キーを入力してください</span>
          )}
          {input.map((k, i) => (
            <span key={i} className="bg-gray-700 px-2 py-1 rounded text-sm font-mono">
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* ヒント */}
      <button
        onClick={onToggleHint}
        className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-2"
      >
        {showHint ? 'ヒントを非表示' : 'ヒントを表示'}
      </button>
      {showHint && (
        <div className="bg-gray-800 rounded-lg px-4 py-2 text-sm text-yellow-400">
          正解: {question.keys.join(' ')}
        </div>
      )}

      {/* フィードバック */}
      {feedback === 'wrong' && (
        <div className="mt-2 text-sm text-red-400">正解は「{question.keys.join(' ')}」でした</div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mac ショートカットのプレイ画面
// ---------------------------------------------------------------------------

interface MacPlayViewProps {
  question:
    | {
        instruction: string
        keys: { key: string; ctrl?: boolean; meta?: boolean; alt?: boolean; shift?: boolean }[]
        displayKeys: string[]
        category: string
        difficulty: string
        canCapture: boolean
      }
    | undefined
  choices: string[]
  selectedChoice: number | null
  feedback: 'correct' | 'wrong' | null
  onChoiceClick: (index: number) => void
  questionNumber: number
  totalQuestions: number
}

/** Macショートカットモードのプレイ画面 */
function MacPlayView({
  question,
  choices,
  selectedChoice,
  feedback,
  onChoiceClick,
  questionNumber,
  totalQuestions,
}: MacPlayViewProps) {
  if (!question) return <div className="text-gray-500 text-center">問題がありません</div>

  const correctAnswer = question.displayKeys.join(' + ')

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm text-gray-500 mb-2">
        問題 {questionNumber} / {totalQuestions}
        <span className="ml-4 text-gray-600">{question.category}</span>
      </div>

      {/* 命令文 */}
      <div
        className={`text-xl font-bold mb-6 px-6 py-3 rounded-lg transition-colors duration-300 ${
          feedback === 'correct'
            ? 'bg-green-900 text-green-300'
            : feedback === 'wrong'
              ? 'bg-red-900 text-red-300'
              : 'bg-gray-800 text-white'
        }`}
      >
        {question.instruction}
      </div>

      {/* テキストエリア風の表示 */}
      <div className="bg-gray-950 rounded-xl p-6 w-full max-w-2xl border border-gray-700 mb-6">
        <div className="text-gray-400 text-sm mb-2">テキストエディタ</div>
        <div className="font-mono text-base text-gray-300 leading-relaxed">
          <span>ここにテキストが入力されています。</span>
          <span className="bg-white text-black animate-pulse">|</span>
          <span className="text-gray-500">カーソルの位置を操作してください。</span>
        </div>
      </div>

      {question.canCapture ? (
        /* キャプチャ可能: キーボード入力を待つ */
        <div className="text-center">
          <p className="text-gray-400 mb-2">ショートカットキーを入力してください</p>
          <div className="flex gap-2 justify-center">
            {question.displayKeys.map((_dk, i) => (
              <span
                key={i}
                className="bg-gray-700 px-4 py-2 rounded-lg font-mono text-lg border border-gray-600"
              >
                ?
              </span>
            ))}
          </div>
        </div>
      ) : (
        /* キャプチャ不可: 4択表示 */
        <div className="w-full max-w-md">
          <p className="text-gray-400 mb-4 text-center">正しいショートカットを選択してください</p>
          <div className="grid grid-cols-1 gap-3">
            {choices.map((choice, i) => {
              let btnClass = 'bg-gray-800 hover:bg-gray-700 border-gray-600'
              if (selectedChoice !== null) {
                if (choice === correctAnswer) {
                  btnClass = 'bg-green-900 border-green-500'
                } else if (i === selectedChoice) {
                  btnClass = 'bg-red-900 border-red-500'
                }
              }
              return (
                <button
                  key={i}
                  onClick={() => selectedChoice === null && onChoiceClick(i)}
                  disabled={selectedChoice !== null}
                  className={`px-6 py-3 rounded-lg font-mono text-lg border transition-all duration-200 ${btnClass}`}
                >
                  {choice}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* フィードバック */}
      {feedback === 'wrong' && (
        <div className="mt-4 text-sm text-red-400">正解は「{correctAnswer}」でした</div>
      )}
    </div>
  )
}
