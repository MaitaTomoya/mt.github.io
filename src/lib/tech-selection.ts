import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'

const techSelectionDirectory = path.join(process.cwd(), 'tech-selection')

/**
 * 技術選定ガイドのカテゴリ定義
 */
export interface TechSelectionCategory {
  id: string
  title: string
  description: string
  items: TechSelectionItem[]
}

/**
 * 技術選定ガイドの個別記事定義
 */
export interface TechSelectionItem {
  slug: string
  title: string
  type: 'article' | 'case-study' | 'comparison'
}

/**
 * 技術選定記事のメタデータ
 */
export interface TechSelectionPost {
  slug: string
  title: string
  order: number
  category: string
}

/**
 * 技術選定記事の詳細（HTML変換後のコンテンツ含む）
 */
export interface TechSelectionPostDetail extends TechSelectionPost {
  contentHtml: string
}

/**
 * 技術選定ガイドのカテゴリ・記事構成
 */
export const techSelectionCategories: TechSelectionCategory[] = [
  {
    id: 'introduction',
    title: '技術選定の基礎',
    description: '技術選定とは何か、なぜ重要なのか',
    items: [
      { slug: 'what-is-tech-selection', title: '技術選定とは何か', type: 'article' },
      { slug: 'selection-criteria', title: '技術選定の評価基準', type: 'article' },
      { slug: 'common-mistakes', title: '技術選定でよくある失敗', type: 'article' },
    ],
  },
  {
    id: 'frontend-languages',
    title: 'フロントエンド言語',
    description: 'JavaScript、TypeScript、Dartなどフロントエンド向け言語の比較',
    items: [
      { slug: 'javascript', title: 'JavaScript', type: 'article' },
      { slug: 'typescript', title: 'TypeScript', type: 'article' },
      { slug: 'dart', title: 'Dart', type: 'article' },
      {
        slug: 'frontend-lang-comparison',
        title: 'フロントエンド言語比較まとめ',
        type: 'comparison',
      },
    ],
  },
  {
    id: 'backend-languages',
    title: 'バックエンド言語',
    description: 'Node.js、Python、Go、Rust、Java、PHP、Rubyの比較',
    items: [
      { slug: 'nodejs', title: 'Node.js / JavaScript', type: 'article' },
      { slug: 'python', title: 'Python', type: 'article' },
      { slug: 'go', title: 'Go', type: 'article' },
      { slug: 'rust', title: 'Rust', type: 'article' },
      { slug: 'java', title: 'Java / Kotlin', type: 'article' },
      { slug: 'php', title: 'PHP', type: 'article' },
      { slug: 'ruby', title: 'Ruby', type: 'article' },
      {
        slug: 'backend-lang-comparison',
        title: 'バックエンド言語比較まとめ',
        type: 'comparison',
      },
    ],
  },
  {
    id: 'frontend-frameworks',
    title: 'フロントエンドフレームワーク',
    description: 'React、Vue、Angular、Svelte、Next.js、Nuxtなどの比較',
    items: [
      { slug: 'react-nextjs', title: 'React / Next.js', type: 'article' },
      { slug: 'vue-nuxt', title: 'Vue.js / Nuxt', type: 'article' },
      { slug: 'angular', title: 'Angular', type: 'article' },
      { slug: 'svelte', title: 'Svelte / SvelteKit', type: 'article' },
      {
        slug: 'frontend-fw-comparison',
        title: 'フロントエンドFW比較まとめ',
        type: 'comparison',
      },
    ],
  },
  {
    id: 'backend-frameworks',
    title: 'バックエンドフレームワーク',
    description: 'Express、NestJS、Django、Rails、Spring Boot、Laravelの比較',
    items: [
      { slug: 'express-nestjs', title: 'Express / NestJS', type: 'article' },
      { slug: 'django-fastapi', title: 'Django / FastAPI', type: 'article' },
      { slug: 'rails', title: 'Ruby on Rails', type: 'article' },
      { slug: 'spring-boot', title: 'Spring Boot', type: 'article' },
      { slug: 'laravel', title: 'Laravel', type: 'article' },
      {
        slug: 'backend-fw-comparison',
        title: 'バックエンドFW比較まとめ',
        type: 'comparison',
      },
    ],
  },
  {
    id: 'databases',
    title: 'データベース',
    description: 'PostgreSQL、MySQL、MongoDB、Redis、DynamoDB、Supabaseの比較',
    items: [
      { slug: 'rdbms-comparison', title: 'RDB比較: PostgreSQL vs MySQL', type: 'article' },
      { slug: 'nosql-comparison', title: 'NoSQL比較: MongoDB vs DynamoDB', type: 'article' },
      { slug: 'cache-comparison', title: 'キャッシュ: Redis vs Memcached', type: 'article' },
      { slug: 'baas-comparison', title: 'BaaS: Supabase vs Firebase', type: 'article' },
      { slug: 'orm-comparison', title: 'ORM: Prisma vs Drizzle vs TypeORM', type: 'comparison' },
    ],
  },
  {
    id: 'cloud-aws',
    title: 'クラウド / AWS',
    description: 'AWS、GCP、Azure、Vercel、Cloudflareの比較とAWSリソース選定',
    items: [
      {
        slug: 'cloud-provider-comparison',
        title: 'クラウドプロバイダ比較: AWS vs GCP vs Azure',
        type: 'article',
      },
      {
        slug: 'hosting-comparison',
        title: 'ホスティング比較: Vercel vs Cloudflare vs AWS',
        type: 'article',
      },
      {
        slug: 'aws-compute',
        title: 'AWSコンピュート: EC2 vs ECS vs Lambda vs App Runner',
        type: 'article',
      },
      {
        slug: 'aws-database',
        title: 'AWSデータベース: RDS vs Aurora vs DynamoDB',
        type: 'article',
      },
      { slug: 'aws-storage', title: 'AWSストレージ: S3 vs EBS vs EFS', type: 'article' },
    ],
  },
  {
    id: 'devops-tools',
    title: 'DevOps / ツール',
    description: 'CI/CD、コンテナ、IaC、監視ツールの比較',
    items: [
      {
        slug: 'cicd-comparison',
        title: 'CI/CD: GitHub Actions vs CircleCI vs Jenkins',
        type: 'article',
      },
      {
        slug: 'container-comparison',
        title: 'コンテナ: Docker vs Podman、ECS vs EKS',
        type: 'article',
      },
      {
        slug: 'iac-comparison',
        title: 'IaC: Terraform vs CloudFormation vs Pulumi',
        type: 'article',
      },
    ],
  },
  {
    id: 'case-studies',
    title: 'ケーススタディ',
    description: '具体的なサービス開発における技術選定の実例',
    items: [
      { slug: 'case-sns', title: 'ケース1: SNSアプリを作る場合', type: 'case-study' },
      { slug: 'case-ec', title: 'ケース2: ECサイトを作る場合', type: 'case-study' },
      { slug: 'case-saas', title: 'ケース3: SaaSプロダクトを作る場合', type: 'case-study' },
      { slug: 'case-startup', title: 'ケース4: スタートアップのMVP', type: 'case-study' },
      {
        slug: 'case-enterprise',
        title: 'ケース5: エンタープライズシステム',
        type: 'case-study',
      },
    ],
  },
  {
    id: 'growth-patterns',
    title: '成長戦略とアンチパターン',
    description: '技術選定の成功例・失敗例とスケーリング戦略',
    items: [
      { slug: 'success-stories', title: '技術選定の成功事例', type: 'article' },
      { slug: 'failure-stories', title: '技術選定の失敗事例', type: 'article' },
      { slug: 'scaling-strategies', title: 'スケーリングを見据えた技術選定', type: 'article' },
      { slug: 'migration-guide', title: '技術移行（リプレース）の進め方', type: 'article' },
    ],
  },
]

/**
 * 記事が存在するslugの一覧を取得
 */
export function getExistingTechSelectionSlugs(): Set<string> {
  if (!fs.existsSync(techSelectionDirectory)) {
    return new Set()
  }
  return new Set(
    fs
      .readdirSync(techSelectionDirectory)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''))
  )
}

/**
 * 全slugリストを取得（generateStaticParams用）
 */
export function getAllTechSelectionSlugs(): string[] {
  if (!fs.existsSync(techSelectionDirectory)) {
    return []
  }
  return fs
    .readdirSync(techSelectionDirectory)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

/**
 * 特定slugの記事を取得
 */
export async function getTechSelectionPostData(
  slug: string
): Promise<TechSelectionPostDetail | null> {
  const fullPath = path.join(techSelectionDirectory, `${slug}.md`)

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
    title: (matterResult.data.title as string) || slug,
    order: (matterResult.data.order as number) || 0,
    category: (matterResult.data.category as string) || '',
    contentHtml: processedContent.toString(),
  }
}
