import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'

const roadmapDirectory = path.join(process.cwd(), 'roadmap')

/**
 * ロードマップのセクション定義（roadmap.sh準拠）
 */
export interface RoadmapSection {
  id: string
  title: string
  items: RoadmapItem[]
}

export interface RoadmapItem {
  slug: string
  title: string
  type: 'topic' | 'checkpoint'
}

export interface RoadmapPost {
  slug: string
  title: string
  order: number
  section: string
}

export interface RoadmapPostDetail extends RoadmapPost {
  contentHtml: string
}

/**
 * roadmap.sh Full Stack Developer Roadmap準拠の構成
 */
export const roadmapSections: RoadmapSection[] = [
  {
    id: 'frontend-basics',
    title: 'フロントエンド基礎',
    items: [
      { slug: 'html', title: 'HTML', type: 'topic' },
      { slug: 'css', title: 'CSS', type: 'topic' },
      { slug: 'javascript', title: 'JavaScript', type: 'topic' },
      { slug: 'npm', title: 'npm', type: 'topic' },
      {
        slug: 'checkpoint-static-page',
        title: 'チェックポイント: 静的Webページを作る',
        type: 'checkpoint',
      },
    ],
  },
  {
    id: 'frontend-interactivity',
    title: 'フロントエンド インタラクション',
    items: [
      { slug: 'dom', title: 'DOM操作', type: 'topic' },
      { slug: 'events', title: 'イベント処理', type: 'topic' },
      {
        slug: 'checkpoint-interactivity',
        title: 'チェックポイント: インタラクティブなページを作る',
        type: 'checkpoint',
      },
    ],
  },
  {
    id: 'styling-and-frameworks',
    title: 'スタイリングとフレームワーク',
    items: [
      { slug: 'tailwind-css', title: 'Tailwind CSS', type: 'topic' },
      { slug: 'react', title: 'React', type: 'topic' },
      {
        slug: 'checkpoint-packages',
        title: 'チェックポイント: 外部パッケージを使ったアプリ',
        type: 'checkpoint',
      },
    ],
  },
  {
    id: 'version-control',
    title: 'バージョン管理',
    items: [
      { slug: 'git', title: 'Git', type: 'topic' },
      { slug: 'github', title: 'GitHub', type: 'topic' },
      {
        slug: 'checkpoint-collaboration',
        title: 'チェックポイント: チームで協業する',
        type: 'checkpoint',
      },
    ],
  },
  {
    id: 'backend-basics',
    title: 'バックエンド基礎',
    items: [
      { slug: 'nodejs', title: 'Node.js', type: 'topic' },
      { slug: 'checkpoint-cli', title: 'チェックポイント: CLIアプリを作る', type: 'checkpoint' },
    ],
  },
  {
    id: 'api-and-auth',
    title: 'API/認証',
    items: [
      { slug: 'restful-api', title: 'RESTful API', type: 'topic' },
      { slug: 'jwt', title: 'JWT認証', type: 'topic' },
      { slug: 'checkpoint-crud', title: 'チェックポイント: CRUDアプリを作る', type: 'checkpoint' },
    ],
  },
  {
    id: 'caching-and-system',
    title: 'キャッシュ/システム',
    items: [
      { slug: 'redis', title: 'Redis', type: 'topic' },
      { slug: 'linux', title: 'Linux基礎', type: 'topic' },
      {
        slug: 'checkpoint-full-app',
        title: 'チェックポイント: 本格的なアプリを作る',
        type: 'checkpoint',
      },
    ],
  },
  {
    id: 'database',
    title: 'データベース',
    items: [
      { slug: 'database-fundamentals', title: 'データベース基礎', type: 'topic' },
      { slug: 'sql-fundamentals', title: 'SQL基礎', type: 'topic' },
      { slug: 'postgresql', title: 'PostgreSQL', type: 'topic' },
      { slug: 'mysql', title: 'MySQL', type: 'topic' },
      { slug: 'mongodb', title: 'MongoDB', type: 'topic' },
      { slug: 'dynamodb', title: 'DynamoDB', type: 'topic' },
      { slug: 'supabase', title: 'Supabase', type: 'topic' },
      { slug: 'database-design', title: 'データベース設計', type: 'topic' },
      {
        slug: 'checkpoint-database',
        title: 'チェックポイント: データベース設計と運用',
        type: 'checkpoint',
      },
    ],
  },
  {
    id: 'devops',
    title: 'DevOps/インフラ',
    items: [
      { slug: 'aws-ec2', title: 'AWS EC2', type: 'topic' },
      { slug: 'aws-s3', title: 'AWS S3', type: 'topic' },
      { slug: 'aws-vpc', title: 'AWS VPC', type: 'topic' },
      { slug: 'aws-route53', title: 'AWS Route53', type: 'topic' },
      { slug: 'aws-iam', title: 'AWS IAM', type: 'topic' },
      { slug: 'aws-lambda', title: 'AWS Lambda', type: 'topic' },
      { slug: 'aws-step-functions', title: 'AWS Step Functions', type: 'topic' },
      { slug: 'aws-sqs-sns', title: 'AWS SQS/SNS', type: 'topic' },
      { slug: 'aws-eventbridge', title: 'AWS EventBridge', type: 'topic' },
      { slug: 'aws-rds', title: 'AWS RDS', type: 'topic' },
      { slug: 'aws-cloudfront', title: 'AWS CloudFront', type: 'topic' },
      { slug: 'aws-cloudwatch', title: 'AWS CloudWatch', type: 'topic' },
      { slug: 'github-actions', title: 'GitHub Actions', type: 'topic' },
      { slug: 'terraform', title: 'Terraform', type: 'topic' },
      { slug: 'ansible', title: 'Ansible', type: 'topic' },
      { slug: 'monitoring', title: '監視ツール', type: 'topic' },
      {
        slug: 'checkpoint-deploy',
        title: 'チェックポイント: デプロイ/CI/CD/監視',
        type: 'checkpoint',
      },
    ],
  },
  {
    id: 'languages',
    title: 'プログラミング言語',
    items: [
      { slug: 'typescript', title: 'TypeScript', type: 'topic' },
      { slug: 'python', title: 'Python', type: 'topic' },
      { slug: 'go', title: 'Go', type: 'topic' },
      { slug: 'rust', title: 'Rust', type: 'topic' },
      { slug: 'java', title: 'Java', type: 'topic' },
      { slug: 'php', title: 'PHP', type: 'topic' },
    ],
  },
  {
    id: 'frameworks',
    title: 'フレームワーク',
    items: [
      { slug: 'nextjs', title: 'Next.js', type: 'topic' },
      { slug: 'express', title: 'Express.js', type: 'topic' },
      { slug: 'vue', title: 'Vue.js', type: 'topic' },
      { slug: 'django', title: 'Django', type: 'topic' },
      { slug: 'rails', title: 'Ruby on Rails', type: 'topic' },
      { slug: 'spring-boot', title: 'Spring Boot', type: 'topic' },
    ],
  },
  {
    id: 'comparison',
    title: '技術比較',
    items: [
      { slug: 'api-styles-comparison', title: 'APIスタイル比較', type: 'topic' },
      { slug: 'frontend-frameworks-comparison', title: 'フロントエンドFW比較', type: 'topic' },
      { slug: 'backend-languages-comparison', title: 'バックエンド言語比較', type: 'topic' },
      { slug: 'database-comparison', title: 'データベース比較', type: 'topic' },
      { slug: 'architecture-patterns', title: 'アーキテクチャパターン比較', type: 'topic' },
      { slug: 'container-orchestration', title: 'コンテナ技術比較', type: 'topic' },
      { slug: 'cicd-comparison', title: 'CI/CD比較', type: 'topic' },
    ],
  },
]

/**
 * 記事が存在するslugの一覧を取得
 */
export function getExistingRoadmapSlugs(): Set<string> {
  if (!fs.existsSync(roadmapDirectory)) {
    return new Set()
  }
  return new Set(
    fs
      .readdirSync(roadmapDirectory)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''))
  )
}

/**
 * 全slugリストを取得（generateStaticParams用）
 */
export function getAllRoadmapSlugs(): string[] {
  if (!fs.existsSync(roadmapDirectory)) {
    return []
  }
  return fs
    .readdirSync(roadmapDirectory)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

/**
 * 特定slugの記事を取得
 */
export async function getRoadmapPostData(slug: string): Promise<RoadmapPostDetail | null> {
  const fullPath = path.join(roadmapDirectory, `${slug}.md`)

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
    section: (matterResult.data.section as string) || '',
    contentHtml: processedContent.toString(),
  }
}
