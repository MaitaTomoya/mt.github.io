import type { Metadata } from 'next'
import Link from 'next/link'
import { getSortedBookPosts } from '@/lib/books'

export const metadata: Metadata = {
  title: '読書記録 - Note',
  description: '読んだ本の内容と感想、生活への活かし方をまとめた読書記録',
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </span>
  )
}

export default function BooksPage() {
  const books = getSortedBookPosts()

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <nav className="mb-6">
        <Link href="/note" className="text-blue-400 hover:text-blue-300 hover:underline text-sm">
          ← Note一覧へ
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-2">読書記録</h1>
      <p className="text-gray-400 text-sm mb-8">
        読んだ本の内容・感想・生活への活かし方をまとめています
      </p>

      {books.length === 0 ? (
        <p className="text-gray-500">まだ読書記録がありません。</p>
      ) : (
        <div className="space-y-4">
          {books.map((book) => (
            <Link
              key={book.slug}
              href={`/note/books/${book.slug}`}
              className="block group rounded-xl bg-gray-800 border border-gray-700 p-5 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold group-hover:text-blue-400 transition-colors truncate">
                    {book.title}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">{book.author}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <RatingStars rating={book.rating} />
                    <span className="text-gray-500 text-xs">{book.readDate} 読了</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {book.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-gray-700 text-gray-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-gray-600 group-hover:text-gray-400 transition-colors text-sm shrink-0">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
