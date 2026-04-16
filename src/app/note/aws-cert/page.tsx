import type { Metadata } from 'next'
import Link from 'next/link'
import {
  certSections,
  getExistingCertSlugs,
  getCertProgress,
  type CertStatus,
} from '@/lib/aws-cert'

export const metadata: Metadata = {
  title: 'AWS全資格取得ロードマップ 2026',
  description: '2026年中にAWS認定資格を全12種取得するためのロードマップと進捗管理',
}

const statusConfig: Record<CertStatus, { label: string; bg: string; text: string }> = {
  'not-started': { label: '未着手', bg: 'bg-gray-700', text: 'text-gray-400' },
  studying: { label: '学習中', bg: 'bg-blue-900', text: 'text-blue-300' },
  scheduled: { label: '受験予定', bg: 'bg-yellow-900', text: 'text-yellow-300' },
  passed: { label: '合格', bg: 'bg-green-900', text: 'text-green-300' },
}

const levelColor: Record<string, string> = {
  foundational: 'border-gray-500',
  associate: 'border-blue-500',
  professional: 'border-purple-500',
  specialty: 'border-amber-500',
}

export default function AwsCertPage() {
  const existingSlugs = getExistingCertSlugs()
  const progress = getCertProgress()
  const progressPercent = Math.round((progress.passed / progress.total) * 100)

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <nav className="mb-6">
        <Link href="/note" className="text-blue-400 hover:text-blue-300 hover:underline text-sm">
          ← Note一覧へ
        </Link>
      </nav>

      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">AWS全資格取得ロードマップ 2026</h1>
        <p className="text-gray-400 text-sm mb-6">
          2026年中にAWS認定資格を全12種取得することを目標に、学習の進捗を管理するページ。
          各資格のリンクをクリックすると学習ノートを閲覧できる。
        </p>

        {/* 進捗バー */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-200">全体進捗</span>
            <span className="text-sm text-gray-400">
              {progress.passed} / {progress.total} 合格 ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex gap-6 text-xs text-gray-400">
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
              合格: {progress.passed}
            </span>
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1" />
              受験予定: {progress.scheduled}
            </span>
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />
              学習中: {progress.studying}
            </span>
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-1" />
              未着手: {progress.total - progress.passed - progress.studying - progress.scheduled}
            </span>
          </div>
        </div>
      </div>

      {/* 資格一覧 */}
      <div className="space-y-10">
        {certSections.map((section) => (
          <div key={section.id}>
            <h2
              className={`text-xl font-bold mb-4 text-gray-200 border-b pb-2 ${levelColor[section.id] || 'border-gray-700'}`}
            >
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.items.map((item) => {
                const hasContent = existingSlugs.has(item.slug)
                const sc = statusConfig[item.status]

                return (
                  <div
                    key={item.slug}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50"
                  >
                    {/* ステータスバッジ */}
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded ${sc.bg} ${sc.text} min-w-[60px] text-center`}
                    >
                      {sc.label}
                    </span>

                    {/* 資格名 */}
                    <div className="flex-1 min-w-0">
                      {hasContent ? (
                        <Link
                          href={`/note/aws-cert/${item.slug}/`}
                          className="text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <span className="text-gray-300">{item.title}</span>
                      )}
                      <span className="ml-2 text-xs text-gray-500">{item.code}</span>
                    </div>

                    {/* 目標月 */}
                    {item.targetMonth && (
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        目標: {item.targetMonth}
                      </span>
                    )}

                    {/* 合格日 */}
                    {item.passedDate && (
                      <span className="text-xs text-green-400 whitespace-nowrap">
                        合格: {item.passedDate}
                      </span>
                    )}

                    {/* ノートリンク */}
                    {hasContent && (
                      <Link
                        href={`/note/aws-cert/${item.slug}/`}
                        className="text-xs text-gray-500 hover:text-blue-400"
                      >
                        ノート →
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* タイムライン */}
      <div className="mt-12 pt-8 border-t border-gray-700">
        <h2 className="text-xl font-bold mb-6 text-gray-200">受験スケジュール</h2>
        <div className="space-y-2">
          {[
            { month: '5月', certs: ['Cloud Practitioner'] },
            { month: '6月', certs: ['Solutions Architect - Associate'] },
            { month: '7月', certs: ['Developer - Associate'] },
            { month: '8月', certs: ['SysOps Administrator - Associate'] },
            { month: '9月', certs: ['Solutions Architect - Professional'] },
            { month: '10月', certs: ['DevOps Engineer - Professional', 'Security - Specialty'] },
            { month: '11月', certs: ['Database', 'Machine Learning', 'Data Analytics'] },
            { month: '12月', certs: ['Advanced Networking', 'SAP on AWS'] },
          ].map((item) => (
            <div key={item.month} className="flex gap-4 items-start">
              <span className="text-sm font-bold text-gray-300 w-12 shrink-0 pt-0.5">
                {item.month}
              </span>
              <div className="flex-1 flex flex-wrap gap-2">
                {item.certs.map((cert) => (
                  <span
                    key={cert}
                    className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-400"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
