import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllRoadmapSlugs, getRoadmapPostData, roadmapSections } from '@/lib/roadmap'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllRoadmapSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getRoadmapPostData(slug)
  return {
    title: post?.title || slug,
  }
}

function findAdjacentSlugs(currentSlug: string) {
  const allItems = roadmapSections.flatMap((s) => s.items)
  const currentIndex = allItems.findIndex((item) => item.slug === currentSlug)
  const prev = currentIndex > 0 ? allItems[currentIndex - 1] : null
  const next = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null
  return { prev, next }
}

export default async function RoadmapPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getRoadmapPostData(slug)

  if (!post) {
    notFound()
  }

  const { prev, next } = findAdjacentSlugs(slug)

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <nav className="mb-6">
        <Link
          href="/note/roadmap"
          className="text-blue-400 hover:text-blue-300 hover:underline text-sm"
        >
          ← ロードマップ一覧へ
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      {post.section && <p className="text-gray-500 text-sm mb-8">{post.section}</p>}

      <article
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {/* 前後のナビゲーション */}
      <nav className="mt-12 pt-6 border-t border-gray-700 flex justify-between">
        {prev ? (
          <Link
            href={`/note/roadmap/${prev.slug}/`}
            className="text-blue-400 hover:text-blue-300 hover:underline text-sm"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/note/roadmap/${next.slug}/`}
            className="text-blue-400 hover:text-blue-300 hover:underline text-sm"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  )
}
