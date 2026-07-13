import Link from 'next/link';

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-orange-200 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-bold text-orange-600">
          AQORA
        </Link>
      </div>
    </header>
  );
}
