'use client'

import { useEffect, useRef } from 'react'

interface MermaidArticleContentProps {
  contentHtml: string
}

/**
 * Mermaid図をサポートする記事コンテンツラッパー
 * ロードマップ、技術選定など複数のセクションで共通利用する
 */
export default function MermaidArticleContent({ contentHtml }: MermaidArticleContentProps) {
  const articleRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const initMermaid = async () => {
      const mermaid = (await import('mermaid')).default

      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        themeVariables: {
          primaryColor: '#1e293b',
          primaryTextColor: '#f1f5f9',
          primaryBorderColor: '#475569',
          lineColor: '#64748b',
          secondaryColor: '#334155',
          tertiaryColor: '#475569',
          background: '#0f172a',
          mainBkg: '#1e293b',
          secondBkg: '#334155',
          tertiaryBkg: '#475569',
          textColor: '#f1f5f9',
        },
      })

      if (!articleRef.current) return
      const elements = articleRef.current.querySelectorAll('.mermaid')
      if (elements.length > 0) {
        try {
          await mermaid.run({
            nodes: Array.from(elements) as HTMLElement[],
          })
        } catch (error) {
          console.error('Mermaid rendering error:', error)
          elements.forEach((el) => {
            const htmlEl = el as HTMLElement
            if (htmlEl.textContent && !htmlEl.querySelector('svg')) {
              htmlEl.style.padding = '1rem'
              htmlEl.style.backgroundColor = '#1e293b'
              htmlEl.style.border = '1px solid #475569'
              htmlEl.style.borderRadius = '0.375rem'
              htmlEl.style.fontFamily = 'monospace'
              htmlEl.style.whiteSpace = 'pre-wrap'
              htmlEl.style.color = '#f1f5f9'
            }
          })
        }
      }
    }

    initMermaid().catch(console.error)
  }, [contentHtml])

  return (
    <article
      ref={articleRef}
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  )
}
