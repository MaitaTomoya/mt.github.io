import Link from 'next/link'
import { WebTemplate } from '@/lib/templates/types'

interface TemplateCardProps {
  template: WebTemplate
}

/**
 * テンプレートカードコンポーネント
 */
export default function TemplateCard({ template }: TemplateCardProps) {
  const extractFirstImage = (html: string): string | null => {
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1]
    }
    return null
  }

  const imageUrl = extractFirstImage(template.code.html)

  return (
    <Link href={`/note/webpage-temp/${template.id}`} className="block group h-full">
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
        <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-800 relative overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={template.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">🌐</div>
                <div className="text-sm">{template.title}</div>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold group-hover:text-blue-400 transition-colors">
              {template.title}
            </h3>
            <span className="text-xs px-2 py-0.5 bg-blue-900 text-blue-300 rounded">
              {template.category}
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-3 line-clamp-2 flex-1">{template.description}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {template.features.slice(0, 3).map((feature, index) => (
              <span key={index} className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">
                {feature}
              </span>
            ))}
            {template.features.length > 3 && (
              <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">
                +{template.features.length - 3}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {template.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="text-xs text-gray-500">
                  #{tag}
                </span>
              ))}
            </div>
            <span className="text-blue-400 text-sm group-hover:underline">詳細を見る →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
