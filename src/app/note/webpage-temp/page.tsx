import Link from 'next/link'
import { getAllTemplates } from '@/lib/templates'
import TemplateCard from '@/components/templates/TemplateCard'
import { TEMPLATE_CATEGORIES } from '@/lib/templates/types'

export default function WebPageTemplatesPage() {
  const templates = getAllTemplates()

  const templatesByCategory = Object.values(TEMPLATE_CATEGORIES).map((category) => ({
    category,
    templates: templates.filter((t) => t.category === category),
  }))

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* ヘッダー */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-4">Webページテンプレート集</h1>
        <p className="text-gray-400 mb-4">
          カフェや小規模ビジネス向けの美しいWebサイトテンプレートをご覧いただけます。
          各テンプレートはレスポンシブ対応で、すぐに使えるHTML/CSS/JavaScriptコードが含まれています。
        </p>

        <Link
          href="/note/webpage-temp/guide"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          初心者向け学習ガイドを見る
        </Link>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-blue-400">{templates.length}</div>
          <div className="text-sm text-gray-400">テンプレート数</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-green-400">
            {Object.keys(TEMPLATE_CATEGORIES).length}
          </div>
          <div className="text-sm text-gray-400">カテゴリー</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-purple-400">100%</div>
          <div className="text-sm text-gray-400">レスポンシブ対応</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-orange-400">無料</div>
          <div className="text-sm text-gray-400">ダウンロード</div>
        </div>
      </div>

      {/* カテゴリー別グリッド */}
      <div className="space-y-12">
        {templatesByCategory.map(
          ({ category, templates: categoryTemplates }) =>
            categoryTemplates.length > 0 && (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-6">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </div>
            )
        )}
      </div>

      {/* フッター */}
      <div className="mt-12 pt-8 border-t border-gray-700">
        <div className="text-center text-gray-500 text-sm">
          <p className="mb-2">これらのテンプレートは学習目的で作成されています。</p>
          <p>実際のプロジェクトで使用する際は、必要に応じてカスタマイズしてください。</p>
        </div>
      </div>
    </div>
  )
}
