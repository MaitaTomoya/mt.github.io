import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'

const awsCertDirectory = path.join(process.cwd(), 'aws-cert')

export type CertStatus = 'not-started' | 'studying' | 'scheduled' | 'passed'

export interface CertItem {
  slug: string
  title: string
  code: string
  level: 'foundational' | 'associate' | 'professional' | 'specialty'
  status: CertStatus
  targetMonth?: string
  examDate?: string
  passedDate?: string
}

export interface CertSection {
  id: string
  title: string
  items: CertItem[]
}

export interface CertPostDetail {
  slug: string
  title: string
  code: string
  level: string
  contentHtml: string
}

export const certSections: CertSection[] = [
  {
    id: 'foundational',
    title: 'Foundational',
    items: [
      {
        slug: 'cloud-practitioner',
        title: 'Cloud Practitioner',
        code: 'CLF-C02',
        level: 'foundational',
        status: 'not-started',
        targetMonth: '2026-05',
      },
    ],
  },
  {
    id: 'associate',
    title: 'Associate',
    items: [
      {
        slug: 'solutions-architect-associate',
        title: 'Solutions Architect - Associate',
        code: 'SAA-C03',
        level: 'associate',
        status: 'not-started',
        targetMonth: '2026-06',
      },
      {
        slug: 'developer-associate',
        title: 'Developer - Associate',
        code: 'DVA-C02',
        level: 'associate',
        status: 'not-started',
        targetMonth: '2026-07',
      },
      {
        slug: 'sysops-administrator',
        title: 'SysOps Administrator - Associate',
        code: 'SOA-C02',
        level: 'associate',
        status: 'not-started',
        targetMonth: '2026-08',
      },
    ],
  },
  {
    id: 'professional',
    title: 'Professional',
    items: [
      {
        slug: 'solutions-architect-professional',
        title: 'Solutions Architect - Professional',
        code: 'SAP-C02',
        level: 'professional',
        status: 'not-started',
        targetMonth: '2026-09',
      },
      {
        slug: 'devops-engineer-professional',
        title: 'DevOps Engineer - Professional',
        code: 'DOP-C02',
        level: 'professional',
        status: 'not-started',
        targetMonth: '2026-10',
      },
    ],
  },
  {
    id: 'specialty',
    title: 'Specialty',
    items: [
      {
        slug: 'security-specialty',
        title: 'Security - Specialty',
        code: 'SCS-C02',
        level: 'specialty',
        status: 'not-started',
        targetMonth: '2026-10',
      },
      {
        slug: 'database-specialty',
        title: 'Database - Specialty',
        code: 'DBS-C01',
        level: 'specialty',
        status: 'not-started',
        targetMonth: '2026-11',
      },
      {
        slug: 'machine-learning-specialty',
        title: 'Machine Learning - Specialty',
        code: 'MLS-C01',
        level: 'specialty',
        status: 'not-started',
        targetMonth: '2026-11',
      },
      {
        slug: 'data-analytics-specialty',
        title: 'Data Analytics - Specialty',
        code: 'DAS-C01',
        level: 'specialty',
        status: 'not-started',
        targetMonth: '2026-11',
      },
      {
        slug: 'advanced-networking-specialty',
        title: 'Advanced Networking - Specialty',
        code: 'ANS-C01',
        level: 'specialty',
        status: 'not-started',
        targetMonth: '2026-12',
      },
      {
        slug: 'sap-on-aws-specialty',
        title: 'SAP on AWS - Specialty',
        code: 'PAS-C01',
        level: 'specialty',
        status: 'not-started',
        targetMonth: '2026-12',
      },
    ],
  },
]

export function getExistingCertSlugs(): Set<string> {
  if (!fs.existsSync(awsCertDirectory)) {
    return new Set()
  }
  return new Set(
    fs
      .readdirSync(awsCertDirectory)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''))
  )
}

export function getAllCertSlugs(): string[] {
  if (!fs.existsSync(awsCertDirectory)) {
    return []
  }
  return fs
    .readdirSync(awsCertDirectory)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

export async function getCertPostData(slug: string): Promise<CertPostDetail | null> {
  const fullPath = path.join(awsCertDirectory, `${slug}.md`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContents)

  let content = matterResult.content
  const mermaidRegex = /```mermaid\r?\n([\s\S]*?)\r?\n```/g
  const mermaidBlocks: string[] = []
  let mermaidIndex = 0

  content = content.replace(mermaidRegex, (_, code) => {
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
    mermaidBlocks.push(escapedCode)
    return `\n<!-- MERMAID_PLACEHOLDER_${mermaidIndex++} -->\n`
  })

  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(content)

  let contentHtml = processedContent.toString()

  mermaidBlocks.forEach((code, index) => {
    const placeholder = `<!-- MERMAID_PLACEHOLDER_${index} -->`
    const mermaidDiv = `<div class="mermaid">${code}</div>`
    contentHtml = contentHtml.replace(placeholder, mermaidDiv)
  })

  return {
    slug,
    title: (matterResult.data.title as string) || slug,
    code: (matterResult.data.code as string) || '',
    level: (matterResult.data.level as string) || '',
    contentHtml,
  }
}

export function getCertProgress(): {
  total: number
  passed: number
  studying: number
  scheduled: number
} {
  const allItems = certSections.flatMap((s) => s.items)
  return {
    total: allItems.length,
    passed: allItems.filter((i) => i.status === 'passed').length,
    studying: allItems.filter((i) => i.status === 'studying').length,
    scheduled: allItems.filter((i) => i.status === 'scheduled').length,
  }
}
