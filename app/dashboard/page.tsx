'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/BottomNav';
import { clearSession, getSession } from '../../lib/auth';

export default function DashboardPage() {
  const [authorized, setAuthorized] = useState(false);
  const [name, setName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/');
      return;
    }
    setName(session.user.name);
    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900">جارٍ التحقق...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 pb-28">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white border-2 border-orange-200 rounded-2xl p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-orange-600">مرحباً، {name}</h1>
          <p className="text-gray-600 mt-2 font-semibold">اختر القسم الذي تريد الدخول إليه.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/feed" className="rounded-[2rem] border border-orange-200 bg-white p-8 shadow-sm transition hover:border-orange-300 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <span className="text-5xl">🏠</span>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">الصفحة الرئيسية</h2>
                <p className="mt-2 text-gray-600">تصميم يشبه فيسبوك إلى حد ما.</p>
              </div>
            </div>
          </Link>

          <Link href="/reels" className="rounded-[2rem] border border-orange-200 bg-white p-8 shadow-sm transition hover:border-orange-300 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <span className="text-5xl">🎥</span>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">الريلز</h2>
                <p className="mt-2 text-gray-600">واجهة شبيهة بتيك توك للفيديوهات القصيرة.</p>
              </div>
            </div>
          </Link>

          <Link href="/chat" className="rounded-[2rem] border border-orange-200 bg-white p-8 shadow-sm transition hover:border-orange-300 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <span className="text-5xl">💬</span>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">الرسائل</h2>
                <p className="mt-2 text-gray-600">تصميم مثل واتساب مع زر اتصال.</p>
              </div>
            </div>
          </Link>

          <Link href="/profile" className="rounded-[2rem] border border-orange-200 bg-white p-8 shadow-sm transition hover:border-orange-300 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <span className="text-5xl">👤</span>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">الملف الشخصي</h2>
                <p className="mt-2 text-gray-600">نموذج يطلب معلومات المستخدم الشخصية.</p>
              </div>
            </div>
          </Link>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => {
              clearSession();
              router.push('/');
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-md"
          >
            تسجيل خروج
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
