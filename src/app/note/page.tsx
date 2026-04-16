import Link from 'next/link'

export const metadata = {
  title: 'Note - 個人作業スペース',
  description: '個人作業用のツールやプロジェクトのコレクション',
}

interface NoteSection {
  title: string
  description: string
  href: string
  color: string
  tags: string[]
  status?: 'active' | 'beta' | 'new'
}

const noteSections: NoteSection[] = [
  {
    title: 'Webページテンプレート',
    description:
      '50種類以上のレスポンシブ対応Webテンプレート集。カフェ、レストラン、企業サイトなど様々なカテゴリーを網羅',
    href: '/note/webpage-temp',
    color: 'blue',
    tags: ['HTML', 'CSS', 'JavaScript', 'レスポンシブ'],
    status: 'active',
  },
  {
    title: 'Full Stack Developer Roadmap',
    description:
      'roadmap.sh準拠のフルスタック開発者ロードマップ。各技術を自分の言葉で解説し、人に教えられるレベルを目指す',
    href: '/note/roadmap',
    color: 'green',
    tags: ['ロードマップ', '学習記録', 'フルスタック'],
    status: 'new',
  },
  {
    title: '技術選定に向けた基礎理解',
    description:
      'プログラミング言語、フレームワーク、データベース、クラウドサービスの選び方を体系的に学ぶ。ケーススタディと成功/失敗事例付き',
    href: '/note/tech-selection',
    color: 'cyan',
    tags: ['技術選定', '言語比較', 'フレームワーク', 'アーキテクチャ'],
    status: 'new',
  },
  {
    title: '読書記録',
    description:
      '読んだ本の内容・感想・生活への活かし方をまとめた読書ノート。Claude Codeで本のPDFから要約を自動生成',
    href: '/note/books',
    color: 'amber',
    tags: ['読書', '要約', '感想', '自己成長'],
    status: 'new',
  },
  {
    title: 'AWS全資格取得ロードマップ 2026',
    description:
      '2026年中にAWS認定資格を全12種取得するためのロードマップ。学習ノートと進捗管理付き',
    href: '/note/aws-cert',
    color: 'orange',
    tags: ['AWS', '資格', 'クラウド', 'ロードマップ'],
    status: 'new',
  },
  {
    title: 'ブラウザゲームコレクション',
    description:
      'HTML5 Canvas APIで作成したミニゲーム集。テトリス、スネーク、2048などクラシックゲームをプレイ可能',
    href: '/note/game',
    color: 'purple',
    tags: ['Canvas', 'ゲーム', 'インタラクティブ'],
    status: 'new',
  },
]

const upcomingSections = [
  {
    title: 'コードスニペット集',
    description: '実用的なコードスニペットとユーティリティ関数のライブラリ',
  },
  {
    title: 'デザインツール',
    description: 'カラーパレット生成やグラデーション作成ツール',
  },
  {
    title: 'パフォーマンス最適化',
    description: 'Webサイトのパフォーマンス測定と最適化ツール',
  },
]

export default function NotePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* ヘッダー */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-gray-800 rounded-full">
          <span className="text-sm text-gray-300">個人作業スペース</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Note Collection</h1>
        <p className="text-gray-400 max-w-2xl">
          開発中のツール、実験的なプロジェクト、学習用リソースなど、
          様々な個人プロジェクトを集めたスペースです
        </p>
      </div>

      {/* 公開中のプロジェクト */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6 text-gray-200">公開中のプロジェクト</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {noteSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group relative block rounded-xl bg-gray-800 border border-gray-700 p-6 hover:border-gray-600 transition-all"
            >
              {section.status && (
                <span
                  className={`absolute top-4 right-4 px-2 py-0.5 text-xs font-bold rounded ${
                    section.status === 'new'
                      ? 'bg-green-900 text-green-300'
                      : section.status === 'beta'
                        ? 'bg-yellow-900 text-yellow-300'
                        : 'bg-blue-900 text-blue-300'
                  }`}
                >
                  {section.status === 'new' ? 'NEW' : section.status === 'beta' ? 'BETA' : 'ACTIVE'}
                </span>
              )}

              <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">
                {section.title}
              </h3>

              <p className="text-gray-400 text-sm mb-4">{section.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {section.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs bg-gray-700 text-gray-400 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              <span className="text-sm text-blue-400 group-hover:text-blue-300 transition-colors">
                プロジェクトを見る →
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 開発予定 */}
      <div>
        <h2 className="text-xl font-bold mb-6 text-gray-200">開発予定のプロジェクト</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {upcomingSections.map((section) => (
            <div
              key={section.title}
              className="p-5 rounded-xl border border-dashed border-gray-700 bg-gray-900"
            >
              <h3 className="text-base font-semibold text-gray-400 mb-2">{section.title}</h3>
              <p className="text-sm text-gray-500">{section.description}</p>
              <div className="mt-3 text-xs text-gray-600">Coming Soon...</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
