'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '../../components/Card';

type Post = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
};

type TrendingUser = {
  id: string;
  name: string;
  bio: string;
  followersCount: number;
};

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingUsers, setTrendingUsers] = useState<TrendingUser[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    async function fetchExplore() {
      setLoading(true);
      try {
        const res = await fetch('/api/explore?page=1');
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
          setTrendingUsers(data.trendingUsers || []);

          // تحقق من حالة المتابعة لكل مستخدم
          const token = localStorage.getItem('aqora_token');
          if (token) {
            const followMap: Record<string, boolean> = {};
            for (const user of data.trendingUsers) {
              const checkRes = await fetch(`/api/follow?targetUserId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (checkRes.ok) {
                const checkData = await checkRes.json();
                followMap[user.id] = checkData.following || false;
              }
            }
            setFollowingMap(followMap);
          }
        }
      } catch (error) {
        console.error('فشل جلب البيانات:', error);
      }
      setLoading(false);
    }

    fetchExplore();
  }, []);

  async function toggleFollow(userId: string) {
    const token = localStorage.getItem('aqora_token');
    if (!token) {
      setStatusMessage('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: userId }),
      });

      if (res.ok) {
        const data = await res.json();
        setFollowingMap((prev) => ({ ...prev, [userId]: data.following }));
        setTrendingUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  followersCount: data.following
                    ? user.followersCount + 1
                    : user.followersCount - 1,
                }
              : user
          )
        );
        setStatusMessage(data.following ? 'تمت المتابعة' : 'تم إلغاء المتابعة');
      }
    } catch (error) {
      console.error('خطأ في المتابعة:', error);
      setStatusMessage('حدث خطأ أثناء المتابعة');
    }
  }

  return (
    <div className="space-y-6 py-6">
      <Card>
        <h1 className="text-2xl font-semibold text-white">استكشاف</h1>
        <p className="mt-2 text-sm text-slate-400">اكتشف منشورات جديدة وتوصيات من مجتمع AQORA.</p>
      </Card>

      {statusMessage && (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {statusMessage}
        </div>
      )}

      {loading ? (
        <Card>
          <p className="text-slate-300">جاري تحميل المحتوى...</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* المستخدمون الرائجون */}
          <div className="md:col-span-1">
            <Card>
              <h2 className="text-lg font-semibold text-white">مستخدمون رائجون</h2>
              <div className="mt-4 space-y-3">
                {trendingUsers.length === 0 ? (
                  <p className="text-slate-400 text-sm">لا توجد مستخدمين بعد</p>
                ) : (
                  trendingUsers.map((user) => (
                    <div key={user.id} className="rounded-3xl border border-slate-800 p-4">
                      <Link href={`/profile/${user.id}`}>
                        <p className="font-semibold text-white hover:text-brand-400 transition">
                          {user.name}
                        </p>
                      </Link>
                      <p className="mt-1 text-xs text-slate-400">{user.bio || 'بدون معلومات'}</p>
                      <p className="mt-2 text-xs text-slate-500">{user.followersCount} متابع</p>
                      <button
                        onClick={() => toggleFollow(user.id)}
                        className={`mt-3 w-full rounded-full px-4 py-2 text-sm font-semibold transition ${
                          followingMap[user.id]
                            ? 'border border-brand-500 text-brand-400 hover:bg-brand-500/10'
                            : 'bg-brand-500 text-white hover:bg-brand-700'
                        }`}
                      >
                        {followingMap[user.id] ? 'متابع' : 'متابعة'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* المنشورات الرائجة */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-white">منشورات رائجة</h2>
            {posts.length === 0 ? (
              <Card>
                <p className="text-slate-400">لا توجد منشورات حالياً. كن أول من يشارك!</p>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Link href={`/profile/${post.authorId}`} className="text-lg font-semibold text-white hover:text-brand-200">
                        {post.authorName}
                      </Link>
                      <p className="text-sm text-slate-400">{new Date(post.createdAt).toLocaleString('ar-EG')}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-slate-200">{post.content}</p>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
