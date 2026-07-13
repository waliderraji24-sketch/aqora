import './globals.css';
import type { Metadata } from 'next';
import SiteNav from '../components/SiteNav';

export const metadata: Metadata = {
  title: 'AQORA | Real Social Platform v3',
  description: 'AQORA is a real social platform with accounts, chats, reels, and social interactions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-white text-gray-900 antialiased">
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
          <SiteNav />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
