import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllBookSlugs, getBookPostData } from '@/lib/books'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllBookSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBookPostData(slug)
  return {
    title: post ? `${post.title} - 読書記録` : '読書記録',
  }
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400">
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </span>
  )
}

export default async function BookPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getBookPostData(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <nav className="mb-6">
        <Link
          href="/note/books"
          className="text-blue-400 hover:text-blue-300 hover:underline text-sm"
        >
          ← 読書記録一覧へ
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
          <span>{post.author}</span>
          <RatingStars rating={post.rating} />
          <span>{post.readDate} 読了</span>
        </div>
        {post.bookUrl && (
          <a
            href={post.bookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-sm text-blue-400 hover:text-blue-300 hover:underline"
          >
            この本を見る →
          </a>
        )}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-xs bg-gray-700 text-gray-400 rounded">
              {tag}
            </span>
          ))}
        </div>
      </header>

      <article
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      <nav className="mt-8 pt-4 border-t border-gray-700">
        <Link
          href="/note/books"
          className="text-blue-400 hover:text-blue-300 hover:underline text-sm"
        >
          ← 読書記録一覧へ
        </Link>
      </nav>
    </div>
  )
}
