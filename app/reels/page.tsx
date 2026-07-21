'use client';

import BottomNav from '../../components/BottomNav';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '../../lib/auth';
import { createReel, incrementReelViews, listenReels, SocialReel, toggleLikeReel } from '../../lib/social';

export default function ReelsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [reels, setReels] = useState<SocialReel[]>([]);
  const [caption, setCaption] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/');
      return;
    }

    setAuthorized(true);
    const unsub = listenReels((docs) => setReels(docs));
    return () => unsub();
  }, [router]);

  if (!authorized) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900">جارٍ التحقق...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 pb-28 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-[2.5rem] border border-white/10 bg-slate-900 p-5 shadow-2xl">
          <h1 className="text-2xl font-bold">ريلز AQORA</h1>
          <p className="mt-2 text-sm text-slate-400">ارفع فيديوهاتك وقم بمشاركة الريلز مع المستخدمين الآخرين.</p>
          <div className="mt-4 space-y-3">
            <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="اكتب وصف الريل" className="w-full rounded-full border border-white/10 bg-slate-800 px-4 py-3 text-sm" />
            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} className="w-full rounded-full border border-white/10 bg-slate-800 px-4 py-3 text-sm" />
            <button type="button" onClick={async () => { const session = getSession(); if (!session || !videoFile) return; setStatus('جارٍ رفع الريل...'); const reel = await createReel(session.user, caption, videoFile); setReels((current) => [reel, ...current]); setCaption(''); setVideoFile(null); setStatus('تم رفع الريل بنجاح'); }} className="rounded-full bg-orange-600 px-6 py-3 text-white font-semibold hover:bg-orange-700">نشر الريل</button>
            {status ? <div className="text-sm text-orange-400">{status}</div> : null}
          </div>
        </div>
        {reels.map((reel) => (
          <div key={reel.id} className="rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl">
            <div className="relative h-[650px] bg-slate-800">
              <div className="absolute inset-0 flex items-center justify-center text-[6rem] text-white/70">▶</div>
              <div className="absolute top-4 right-4 rounded-full bg-black/60 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">ريلز</div>
              <div className="absolute bottom-6 left-6 space-y-3 text-white">
                <div className="text-sm font-semibold">{reel.authorName}</div>
                <div className="text-xs text-slate-300">المشاهدات: {reel.views ?? 0}</div>
              </div>
            </div>
            <div className="p-6 bg-slate-950">
              <p className="text-sm text-slate-300">{reel.caption}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={async () => { const session = getSession(); if (session) await toggleLikeReel(reel.id, session.user.email); }} className="rounded-full bg-white/10 px-4 py-2 text-sm">{(reel.likes ?? []).length} إعجاب</button>
                <button type="button" onClick={async () => { await incrementReelViews(reel.id); }} className="rounded-full bg-white/10 px-4 py-2 text-sm">مشاهدة</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
