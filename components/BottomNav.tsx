import Link from 'next/link';

export default function BottomNav() {
  const navItems = [
    { icon: '🏠', href: '/dashboard', label: 'الرئيسية' },
    { icon: '💬', href: '/chat', label: 'الرسائل' },
    { icon: '🎥', href: '/reels', label: 'الريلز' },
    { icon: '👤', href: '/profile', label: 'الملف الشخصي' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-200 shadow-2xl">
      <div className="flex justify-around items-center max-w-7xl mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex items-center justify-center py-4 hover:bg-orange-50 transition duration-200"
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
