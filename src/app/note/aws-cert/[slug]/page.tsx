import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllCertSlugs, getCertPostData, certSections } from '@/lib/aws-cert'
import MermaidArticleContent from '@/components/MermaidArticleContent'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllCertSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getCertPostData(slug)
  return {
    title: post ? `${post.title} - AWS資格学習ノート` : slug,
  }
}

function findAdjacentSlugs(currentSlug: string) {
  const allItems = certSections.flatMap((s) => s.items)
  const currentIndex = allItems.findIndex((item) => item.slug === currentSlug)
  const prev = currentIndex > 0 ? allItems[currentIndex - 1] : null
  const next = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null
  return { prev, next }
}

export default async function CertPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getCertPostData(slug)

  if (!post) {
    notFound()
  }

  const { prev, next } = findAdjacentSlugs(slug)

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <nav className="mb-6">
        <Link
          href="/note/aws-cert"
          className="text-blue-400 hover:text-blue-300 hover:underline text-sm"
        >
          ← AWS資格ロードマップへ
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-1">{post.title}</h1>
      <p className="text-gray-500 text-sm mb-8">{post.code}</p>

      <MermaidArticleContent contentHtml={post.contentHtml} />

      <nav className="mt-12 pt-6 border-t border-gray-700 flex justify-between">
        {prev ? (
          <Link
            href={`/note/aws-cert/${prev.slug}/`}
            className="text-blue-400 hover:text-blue-300 hover:underline text-sm"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/note/aws-cert/${next.slug}/`}
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
