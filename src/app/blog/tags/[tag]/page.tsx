import Link from 'next/link'
import { getAllTags, getPostsByTag } from '@/lib/posts'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ tag: string }>
}

export async function generateStaticParams() {
  const tags = getAllTags()
  return tags.map(({ tag }) => ({
    tag: encodeURIComponent(tag),
  }))
}

export async function generateMetadata({ params }: PageProps) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  return {
    title: `${decodedTag} の記事一覧 - Maita Tomoya Dev IO`,
  }
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const posts = getPostsByTag(decodedTag)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <nav className="mb-6">
        <Link
          href="/blog/tags"
          className="text-blue-400 hover:text-blue-300 hover:underline text-sm"
        >
          ← タグ一覧へ
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        <span className="text-blue-400">{decodedTag}</span> の記事
      </h1>
      <p className="text-gray-500 text-sm mb-8">{posts.length}件の記事</p>

      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.slug} className="border-b border-gray-700 pb-4">
            <Link
              href={`/blog/${post.slug}`}
              className="text-blue-400 hover:text-blue-300 hover:underline text-lg"
            >
              <span className="text-green-600">#{post.id}</span> {post.title}
            </Link>
            <p className="text-gray-500 text-sm mt-1">
              {post.update
                ? `作成日時: ${post.create}、更新日時: ${post.update}`
                : `作成日時: ${post.create}`}
            </p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {post.tags.map((t, index) => (
                  <Link
                    key={index}
                    href={`/blog/tags/${encodeURIComponent(t)}`}
                    className={`px-2 py-0.5 rounded text-xs ${
                      t === decodedTag
                        ? 'bg-blue-900 text-blue-300'
                        : 'bg-gray-800 text-gray-300 hover:text-blue-300'
                    }`}
                  >
                    {t}
                  </Link>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
