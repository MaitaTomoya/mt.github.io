import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'

const booksDirectory = path.join(process.cwd(), 'books')

export interface BookPost {
  slug: string
  title: string
  author: string
  bookUrl: string
  tags: string[]
  rating: number
  readDate: string
  create: string
}

export interface BookPostDetail extends BookPost {
  contentHtml: string
}

/**
 * 全読書記録を読了日の降順で取得
 */
export function getSortedBookPosts(): BookPost[] {
  if (!fs.existsSync(booksDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(booksDirectory)

  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(booksDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const matterResult = matter(fileContents)

      return {
        slug,
        title: (matterResult.data.title as string) || '',
        author: (matterResult.data.author as string) || '',
        bookUrl: (matterResult.data.bookUrl as string) || '',
        tags: (matterResult.data.tags as string[]) || [],
        rating: (matterResult.data.rating as number) || 0,
        readDate: (matterResult.data.readDate as string) || '',
        create: (matterResult.data.create as string) || '',
      }
    })

  return posts.sort((a, b) => b.readDate.localeCompare(a.readDate))
}

/**
 * 全読書記録のslugリストを取得
 */
export function getAllBookSlugs(): string[] {
  if (!fs.existsSync(booksDirectory)) {
    return []
  }

  return fs
    .readdirSync(booksDirectory)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => fileName.replace(/\.md$/, ''))
}

/**
 * 特定の読書記録を取得
 */
export async function getBookPostData(slug: string): Promise<BookPostDetail | null> {
  const fullPath = path.join(booksDirectory, `${slug}.md`)

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
    slug,
    title: (matterResult.data.title as string) || '',
    author: (matterResult.data.author as string) || '',
    bookUrl: (matterResult.data.bookUrl as string) || '',
    tags: (matterResult.data.tags as string[]) || [],
    rating: (matterResult.data.rating as number) || 0,
    readDate: (matterResult.data.readDate as string) || '',
    create: (matterResult.data.create as string) || '',
    contentHtml: processedContent.toString(),
  }
}
