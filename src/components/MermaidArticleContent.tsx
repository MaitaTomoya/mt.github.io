'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'

const MermaidRenderer = dynamic(() => import('@/components/MermaidRenderer'), {
  ssr: false,
})

interface MermaidArticleContentProps {
  contentHtml: string
}

/**
 * Mermaid図をサポートする記事コンテンツラッパー
 * ロードマップ、技術選定など複数のセクションで共通利用する
 */
export default function MermaidArticleContent({ contentHtml }: MermaidArticleContentProps) {
  useEffect(() => {
    import('mermaid').then((mermaid) => {
      mermaid.default.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
        themeVariables: {
          primaryColor: '#e1f5fe',
          primaryTextColor: '#000',
          primaryBorderColor: '#0066cc',
          lineColor: '#5a5a5a',
          secondaryColor: '#fff3e0',
          tertiaryColor: '#f3e5f5',
        },
      })
      mermaid.default.contentLoaded()
    })
  }, [])

  return (
    <>
      <article
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
      <MermaidRenderer />
    </>
  )
}
