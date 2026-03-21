import { getSortedPostsData } from '@/lib/posts'
import HomeTabs from '@/components/HomeTabs'
import SearchBox from '@/components/SearchBox'

export default function Home() {
  const posts = getSortedPostsData()

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-4">
        <h1 className="text-3xl md:text-4xl font-bold">maita tomoya dev io</h1>
      </div>
      <p className="text-gray-300 mb-8">技術記事や学習記録を掲載しています。</p>

      <SearchBox posts={posts} />
      <HomeTabs posts={posts} />
    </div>
  )
}
