'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Blog' },
  { href: '/blog/tags', label: 'Tags' },
  { href: '/daily', label: 'Daily' },
  { href: '/note', label: 'Note' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/favicon.png"
            alt="サイトアイコン"
            width={28}
            height={28}
            className="rounded"
          />
          <span className="font-bold text-sm md:text-base">maita tomoya dev io</span>
        </Link>

        {/* デスクトップナビ */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition-colors ${
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  ? 'text-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* モバイルメニューボタン */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-gray-200"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="メニューを開く"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <nav className="md:hidden border-t border-gray-800 bg-black">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 text-sm transition-colors ${
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  ? 'text-blue-400 bg-gray-900'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
