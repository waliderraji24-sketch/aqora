import Link from 'next/link';

const pages = [
  { label: 'الرئيسية', href: '/' },
  { label: 'Feed', href: '/feed' },
  { label: 'Reels', href: '/reels' },
  { label: 'الدردشة', href: '/chat' },
  { label: 'إشعارات', href: '/notifications' },
  { label: 'استكشاف', href: '/explore' },
  { label: 'بحث', href: '/search' },
  { label: 'الإعدادات', href: '/settings' },
  { label: 'Admin', href: '/admin' },
];

export default function SiteNav() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold text-white">
          AQORA
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {page.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700">
            تسجيل دخول
          </Link>
          <Link href="/register" className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-brand-500 hover:text-white">
            إنشاء حساب
          </Link>
        </div>
      </div>
    </header>
  );
}
