'use client'

import { useEffect } from 'react'
import TetrisGame from './TetrisGame'
import SnakeGame from './SnakeGame'
import Game2048 from './Game2048'
import AlgorithmVisualizer from './AlgorithmVisualizer'
import TypingGame from './TypingGame'
import BirthdayCamera from './BirthdayCamera'

interface GamePlayerProps {
  gameId: string
}

export default function GamePlayer({ gameId }: GamePlayerProps) {
  const isScrollable = gameId === 'algorithm' || gameId === 'typing'
  const isFullscreen = gameId === 'birthday-camera'

  useEffect(() => {
    // フルスクリーン用のスタイル適用
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = isScrollable ? 'auto' : 'hidden'

    // バースデーゲームではヘッダー・フッターを非表示
    if (isFullscreen) {
      const header = document.querySelector('header')
      const footer = document.querySelector('footer')
      if (header) header.style.display = 'none'
      if (footer) footer.style.display = 'none'
    }

    return () => {
      document.body.style.margin = ''
      document.body.style.padding = ''
      document.body.style.overflow = ''
      if (isFullscreen) {
        const header = document.querySelector('header')
        const footer = document.querySelector('footer')
        if (header) header.style.display = ''
        if (footer) footer.style.display = ''
      }
    }
  }, [isScrollable, isFullscreen])

  if (isFullscreen) {
    return <BirthdayCamera />
  }

  if (isScrollable) {
    return (
      <div className="min-h-screen bg-gray-900">
        {gameId === 'algorithm' && <AlgorithmVisualizer />}
        {gameId === 'typing' && <TypingGame />}
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-gray-900 flex items-center justify-center">
      {gameId === 'tetris' && <TetrisGame />}
      {gameId === 'snake' && <SnakeGame />}
      {gameId === '2048' && <Game2048 />}
    </div>
  )
}
