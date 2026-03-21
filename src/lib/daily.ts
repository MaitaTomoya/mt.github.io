import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'

const dailyDirectory = path.join(process.cwd(), 'daily')

export interface DailyPost {
  date: string
  title: string
}

export interface DailyPostDetail extends DailyPost {
  contentHtml: string
}

/**
 * 全日次トレンド記事を日付降順で取得
 */
export function getSortedDailyPosts(): DailyPost[] {
  if (!fs.existsSync(dailyDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(dailyDirectory)

  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const date = fileName.replace(/-trend\.md$/, '')
      const fullPath = path.join(dailyDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const matterResult = matter(fileContents)

      return {
        date,
        title: (matterResult.data.title as string) || `${date} トレンド情報収集`,
      }
    })

  return posts.sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * 全日次トレンドの日付リストを取得
 */
export function getAllDailyDates(): string[] {
  if (!fs.existsSync(dailyDirectory)) {
    return []
  }

  return fs
    .readdirSync(dailyDirectory)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => fileName.replace(/-trend\.md$/, ''))
}

/**
 * 特定日付のトレンド記事を取得
 */
export async function getDailyPostData(date: string): Promise<DailyPostDetail | null> {
  const fullPath = path.join(dailyDirectory, `${date}-trend.md`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContents)

  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(matterResult.content)

  return {
    date,
    title: (matterResult.data.title as string) || `${date} トレンド情報収集`,
    contentHtml: processedContent.toString(),
  }
}
