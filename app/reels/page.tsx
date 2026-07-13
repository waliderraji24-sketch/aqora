'use client';

import BottomNav from '../../components/BottomNav';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getReelsViews, incrementReelsViews } from '../../lib/data';
import { getSession } from '../../lib/auth';

export default function ReelsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [views, setViews] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/');
      return;
    }

    setAuthorized(true);
    setViews(getReelsViews());
  }, [router]);

  if (!authorized) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900">جارٍ التحقق...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 pb-28 text-white">
      <div className="mx-auto max-w-md">
        <div className="rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl">
          <div className="relative h-[700px] bg-slate-800">
            <div className="absolute inset-0 flex items-center justify-center text-[6rem] text-white/70">▶</div>
            <div className="absolute top-4 right-4 rounded-full bg-black/60 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
              ريلز
            </div>
            <div className="absolute bottom-6 left-6 space-y-3 text-white">
              <div className="text-sm font-semibold">موسيقى: صوت حقيقية</div>
              <div className="text-xs text-slate-300">المشاهدات: {views}</div>
            </div>
          </div>
          <div className="p-6 bg-slate-950">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">ريلاز</h1>
                <p className="mt-2 text-sm text-slate-400">واجهة تصميم بسيطة تشبه تيك توك.</p>
              </div>
              <div className="space-y-3 text-right">
                <button className="h-12 w-12 rounded-full bg-white/10 text-xl">❤</button>
                <button className="h-12 w-12 rounded-full bg-white/10 text-xl">💬</button>
                <button className="h-12 w-12 rounded-full bg-white/10 text-xl">🔁</button>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  setViews(incrementReelsViews());
                  setPlaying(true);
                }}
                className="rounded-full bg-orange-600 px-6 py-3 text-white font-semibold hover:bg-orange-700"
              >
                {playing ? 'تشغيل...' : 'شاهد الآن'}
              </button>
              <div className="text-sm text-slate-300">
                {playing ? 'الفيديو يعرض الآن ضمن الواجهة.' : 'اضغط للمشاهدة وزيادة عداد المشاهدات.'}
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
