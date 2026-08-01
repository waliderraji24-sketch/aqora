'use client';

import BottomNav from '../../components/BottomNav';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '../../lib/auth';
import { searchContent, SocialPost, SocialReel, SocialUserProfile } from '../../lib/social';

export default function SearchPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ users: SocialUserProfile[]; posts: SocialPost[]; reels: SocialReel[] }>({
    users: [],
    posts: [],
    reels: [],
  });

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/');
      return;
    }
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ users: [], posts: [], reels: [] });
      return;
    }

    let cancelled = false;
    searchContent(trimmed).then((next) => {
      if (!cancelled) setResults(next);
    });

    return () => {
      cancelled = true;
    };
  }, [query]);

  if (!authorized) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900">جارٍ التحقق...</div>;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 pb-28 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-5 px-4 pt-4">
        <section className="rounded-[30px] bg-white p-5 shadow-sm">
          <div className="mb-4 text-2xl font-black text-slate-900">البحث الشامل</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مستخدم، منشور، أو ريل"
            className="w-full rounded-[20px] border border-orange-200 bg-orange-50 px-4 py-3 text-slate-900 outline-none focus:border-orange-400"
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[28px] bg-white p-4 shadow-sm">
            <div className="mb-3 font-black text-slate-900">المستخدمون</div>
            <div className="space-y-2">
              {results.users.length ? (
                results.users.slice(0, 5).map((user) => (
                  <div key={user.email} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                    <div className="font-bold text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">لا توجد نتائج للمستخدمين</div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-4 shadow-sm">
            <div className="mb-3 font-black text-slate-900">المنشورات</div>
            <div className="space-y-2">
              {results.posts.length ? (
                results.posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                    <div className="font-bold text-slate-900">{post.authorName}</div>
                    <div className="mt-1">{post.content}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">لا توجد نتائج للمنشورات</div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-4 shadow-sm">
            <div className="mb-3 font-black text-slate-900">الريلز</div>
            <div className="space-y-2">
              {results.reels.length ? (
                results.reels.slice(0, 5).map((reel) => (
                  <div key={reel.id} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                    <div className="font-bold text-slate-900">{reel.authorName}</div>
                    <div className="mt-1">{reel.caption}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">لا توجد نتائج للريلز</div>
              )}
            </div>
          </div>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
