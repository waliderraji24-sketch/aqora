import Link from 'next/link';

export default function BottomNav() {
  const navItems = [
    { icon: '🏠', href: '/dashboard', label: 'الرئيسية' },
    { icon: '💬', href: '/chat', label: 'الرسائل' },
    { icon: '🎥', href: '/reels', label: 'الريلز' },
    { icon: '👤', href: '/profile', label: 'الملف الشخصي' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t-2 border-orange-200 bg-white shadow-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 items-center justify-center py-4 transition duration-200 hover:bg-orange-50"
            title={item.label}
          >
            <span className="text-4xl transition duration-200">{item.icon}</span>
            <span className="sr-only">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
