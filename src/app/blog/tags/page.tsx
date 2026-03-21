import Link from 'next/link'
import { getAllTags } from '@/lib/posts'

export const metadata = {
  title: 'タグ一覧 - Maita Tomoya Dev IO',
  description: '技術ブログのタグ一覧ページ',
}

export default function TagsPage() {
  const tags = getAllTags()

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">タグ一覧</h1>

      <div className="flex flex-wrap gap-3">
        {tags.map(({ tag, count }) => (
          <Link
            key={tag}
            href={`/blog/tags/${encodeURIComponent(tag)}`}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm hover:border-blue-500 hover:text-blue-400 transition-colors"
          >
            {tag}
            <span className="ml-2 text-gray-500">({count})</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
