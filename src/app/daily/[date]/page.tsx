import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllDailyDates, getDailyPostData } from '@/lib/daily'

interface PageProps {
  params: Promise<{ date: string }>
}

export async function generateStaticParams() {
  const dates = getAllDailyDates()
  return dates.map((date) => ({ date }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params
  return {
    title: `${date} トレンド情報収集`,
  }
}

export default async function DailyPostPage({ params }: PageProps) {
  const { date } = await params
  const post = await getDailyPostData(date)

  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <nav className="mb-6">
        <Link href="/daily" className="text-blue-400 hover:text-blue-300 hover:underline text-sm">
          ← Daily Trend一覧へ
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-500 text-sm mb-8">{post.date}</p>

      <article
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      <nav className="mt-8 pt-4 border-t border-gray-700">
        <Link href="/daily" className="text-blue-400 hover:text-blue-300 hover:underline text-sm">
          ← Daily Trend一覧へ
        </Link>
      </nav>
    </div>
  )
}
