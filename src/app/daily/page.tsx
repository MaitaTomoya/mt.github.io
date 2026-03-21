import type { Metadata } from 'next'
import Link from 'next/link'
import { getSortedDailyPosts } from '@/lib/daily'

export const metadata: Metadata = {
  title: 'Daily Trend',
  description: '日次トレンド情報収集のアーカイブ',
}

export default function DailyIndexPage() {
  const posts = getSortedDailyPosts()

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Daily Trend</h1>
        <p className="text-gray-400 text-sm">
          はてブ、Hacker News、Redditから収集した日次トレンド情報
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500">まだトレンド記事がありません。</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.date} className="border-b border-gray-700 pb-3">
              <Link
                href={`/daily/${post.date}/`}
                className="text-blue-400 hover:text-blue-300 hover:underline text-lg"
              >
                {post.title}
              </Link>
              <p className="text-gray-500 text-sm mt-1">{post.date}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
