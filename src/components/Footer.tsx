import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} maita tomoya dev io
          </div>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-300 transition-colors">
              Blog
            </Link>
            <Link href="/note" className="hover:text-gray-300 transition-colors">
              Note
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
