import type { Metadata } from 'next'
import Link from 'next/link'
import { roadmapSections, getExistingRoadmapSlugs } from '@/lib/roadmap'

export const metadata: Metadata = {
  title: 'Full Stack Developer Roadmap',
  description: 'roadmap.sh準拠のフルスタック開発者ロードマップ。各項目を自分の言葉で解説。',
}

export default function RoadmapIndexPage() {
  const existingSlugs = getExistingRoadmapSlugs()

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Full Stack Developer Roadmap</h1>
        <p className="text-gray-400 text-sm mb-4">
          <a
            href="https://roadmap.sh/full-stack"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            roadmap.sh
          </a>
          のフルスタック開発者ロードマップに沿って、各技術を自分の言葉で解説するページです。
        </p>
        <p className="text-gray-500 text-sm">
          「人に教えられるレベル」を目指して、順に書いています。
        </p>
      </div>

      <div className="space-y-10">
        {roadmapSections.map((section) => (
          <div key={section.id}>
            <h2 className="text-xl font-bold mb-4 text-gray-200 border-b border-gray-700 pb-2">
              {section.title}
            </h2>
            <ul className="space-y-2">
              {section.items.map((item) => {
                const hasContent = existingSlugs.has(item.slug)
                const isCheckpoint = item.type === 'checkpoint'

                return (
                  <li key={item.slug} className="flex items-center gap-3">
                    {/* チェックマーク */}
                    <span
                      className={`w-5 h-5 flex items-center justify-center rounded border text-xs ${
                        hasContent
                          ? 'bg-green-900 border-green-600 text-green-400'
                          : 'border-gray-600 text-gray-600'
                      }`}
                    >
                      {hasContent ? '✓' : ''}
                    </span>

                    {/* リンク or テキスト */}
                    {hasContent ? (
                      <Link
                        href={`/note/roadmap/${item.slug}/`}
                        className={`hover:text-blue-300 hover:underline ${
                          isCheckpoint ? 'text-yellow-400 text-sm' : 'text-blue-400'
                        }`}
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <span
                        className={`${isCheckpoint ? 'text-yellow-600 text-sm' : 'text-gray-500'}`}
                      >
                        {item.title}
                        {!isCheckpoint && (
                          <span className="ml-2 text-xs text-gray-600">（準備中）</span>
                        )}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
