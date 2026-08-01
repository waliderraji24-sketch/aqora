'use client';

import BottomNav from '../../components/BottomNav';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '../../lib/auth';
import { listenNotifications } from '../../lib/social';

export default function NotificationsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/');
      return;
    }

    setAuthorized(true);
    const unsub = listenNotifications(session.user.email, (docs) => setNotifications(docs));
    return () => unsub();
  }, [router]);

  if (!authorized) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900">جارٍ التحقق...</div>;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 pb-28 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-5 px-4 pt-4">
        <section className="rounded-[30px] bg-white p-5 shadow-sm">
          <div className="mb-4 text-2xl font-black text-slate-900">الإشعارات</div>
          <div className="space-y-3">
            {notifications.length ? (
              notifications.map((item) => (
                <div key={`${item.title}-${item.createdAt}`} className="rounded-[22px] bg-orange-50 p-4 text-sm text-slate-700">
                  <div className="font-black text-slate-900">{item.title}</div>
                  <div className="mt-1">{item.body}</div>
                  <div className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString('ar-EG')}</div>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] bg-slate-50 p-4 text-sm text-slate-500">لا توجد إشعارات الآن.</div>
            )}
          </div>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
