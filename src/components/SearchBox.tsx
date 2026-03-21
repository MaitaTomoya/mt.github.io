'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Post = {
  slug: string
  id: number
  title: string
  create: string
  tags?: string[]
}

interface SearchBoxProps {
  posts: Post[]
}

export default function SearchBox({ posts }: SearchBoxProps) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (query.length < 2) return []
    const q = query.toLowerCase()
    return posts
      .filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(q))
      )
      .slice(0, 10)
  }, [query, posts])

  return (
    <div className="relative mb-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="記事を検索（タイトル / タグ）..."
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
      />
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 max-h-80 overflow-y-auto">
          {results.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
              onClick={() => setQuery('')}
            >
              <div className="text-sm">
                <span className="text-green-600">#{post.id}</span>{' '}
                <span className="text-gray-200">{post.title}</span>
              </div>
              {post.tags && (
                <div className="flex gap-1 mt-1">
                  {post.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-xs text-gray-500">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
      {query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 px-4 py-3 text-sm text-gray-500">
          該当する記事が見つかりません
        </div>
      )}
    </div>
  )
}
