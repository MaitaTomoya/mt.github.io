import type { Metadata } from 'next'
import Link from 'next/link'
import { techSelectionCategories, getExistingTechSelectionSlugs } from '@/lib/tech-selection'

export const metadata: Metadata = {
  title: '技術選定に向けた基礎理解',
  description:
    'プログラミング言語、フレームワーク、データベース、クラウドサービスの選び方を体系的に学ぶガイド',
}

/**
 * 記事タイプに応じたラベルとスタイルを返す
 */
function getTypeLabel(type: 'article' | 'case-study' | 'comparison') {
  switch (type) {
    case 'comparison':
      return { label: '比較', className: 'bg-purple-900 text-purple-300' }
    case 'case-study':
      return { label: '事例', className: 'bg-amber-900 text-amber-300' }
    default:
      return { label: '解説', className: 'bg-blue-900 text-blue-300' }
  }
}

export default function TechSelectionIndexPage() {
  const existingSlugs = getExistingTechSelectionSlugs()

  const totalArticles = techSelectionCategories.reduce((sum, cat) => sum + cat.items.length, 0)
  const completedArticles = techSelectionCategories.reduce(
    (sum, cat) => sum + cat.items.filter((item) => existingSlugs.has(item.slug)).length,
    0
  )

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">技術選定に向けた基礎理解</h1>
        <p className="text-gray-400 text-sm mb-4">
          プログラミング言語、フレームワーク、データベース、クラウドサービスなど、
          プロダクト開発における技術選定の考え方を体系的にまとめたガイドです。
          初めて技術選定に関わるエンジニアが、判断軸を持てるようになることを目指しています。
        </p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            進捗: {completedArticles} / {totalArticles} 記事
          </span>
          <div className="flex-1 max-w-xs h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all"
              style={{
                width: totalArticles > 0 ? `${(completedArticles / totalArticles) * 100}%` : '0%',
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {techSelectionCategories.map((category) => {
          const categoryCompleted = category.items.filter((item) =>
            existingSlugs.has(item.slug)
          ).length

          return (
            <div key={category.id}>
              <div className="border-b border-gray-700 pb-2 mb-4">
                <h2 className="text-xl font-bold text-gray-200">{category.title}</h2>
                <p className="text-gray-500 text-xs mt-1">
                  {category.description} -- {categoryCompleted} / {category.items.length} 記事完了
                </p>
              </div>
              <ul className="space-y-2">
                {category.items.map((item) => {
                  const hasContent = existingSlugs.has(item.slug)
                  const typeInfo = getTypeLabel(item.type)

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

                      {/* タイプタグ */}
                      <span className={`px-1.5 py-0.5 text-xs rounded ${typeInfo.className}`}>
                        {typeInfo.label}
                      </span>

                      {/* リンク or テキスト */}
                      {hasContent ? (
                        <Link
                          href={`/note/tech-selection/${item.slug}/`}
                          className="text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <span className="text-gray-500">
                          {item.title}
                          <span className="ml-2 text-xs text-gray-600">（準備中）</span>
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
