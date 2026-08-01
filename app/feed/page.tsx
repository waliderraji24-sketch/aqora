'use client';

import BottomNav from '../../components/BottomNav';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '../../lib/auth';
import {
  addCommentToPost,
  createPost,
  deletePost,
  incrementPostViews,
  listenPosts,
  SocialPost,
  toggleLikePost,
  toggleSavePost,
} from '../../lib/social';

const stories = [
  { name: 'أحمد', color: 'from-orange-500 to-rose-500', icon: '🎬' },
  { name: 'سارة', color: 'from-sky-500 to-cyan-400', icon: '✨' },
  { name: 'خالد', color: 'from-violet-500 to-fuchsia-500', icon: '🔥' },
  { name: 'ريم', color: 'from-emerald-500 to-lime-500', icon: '📸' },
];

const chats = [
  { name: 'سارة', message: 'أرسل لي الفيديو الجديد', online: true },
  { name: 'أحمد', message: 'شاهد آخر منشور لي؟', online: true },
  { name: 'هيفاء', message: 'ممتاز، أحتاج إلى رأيك', online: false },
];

const profileStats = [
  { label: 'المنشورات', value: '1.2K' },
  { label: 'المتابعون', value: '24K' },
  { label: 'المتابَعون', value: '890' },
];

export default function FeedPage() {
  const [authorized, setAuthorized] = useState(false);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [content, setContent] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/');
      return;
    }
    setAuthorized(true);
    const unsub = listenPosts((docs) => setPosts(docs));
    return () => unsub();
  }, [router]);

  const handlePublish = async () => {
    setError('');
    if (!content.trim()) {
      setError('اكتب نصاً قبل النشر');
      return;
    }
    const session = getSession();
    if (!session) return;
    const post = await createPost(session.user, content);
    setPosts((current) => [post, ...current]);
    setContent('');
  };

  if (!authorized) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900">جارٍ التحقق...</div>;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-4">
        <header className="mb-5 rounded-[28px] bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 p-4 text-white shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-2xl font-black">AQORA</div>
              <div className="text-sm opacity-90">شبكة اجتماعية تشبه Facebook + Reels + Chat</div>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-white/20 px-4 py-2 backdrop-blur">
              <span className="text-lg">🔍</span>
              <span className="text-sm">ابحث عن الأصدقاء أو المنشورات</span>
            </div>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="space-y-5">
            <div className="rounded-[28px] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-2xl text-white">
                  👤
                </div>
                <div>
                  <div className="font-bold text-slate-900">ملفك الشخصي</div>
                  <div className="text-sm text-slate-500">AQORA Creator</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {profileStats.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-lg font-bold text-orange-600">{item.value}</div>
                    <div className="text-xs text-slate-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-bold text-slate-900">القصص</div>
                <div className="text-xs text-orange-600">Story</div>
              </div>
              <div className="space-y-3">
                {stories.map((story) => (
                  <div key={story.name} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${story.color} text-lg text-white`}>
                      {story.icon}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{story.name}</div>
                      <div className="text-xs text-slate-500">تم تحديث القصة</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="space-y-5">
            <section className="rounded-[28px] bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap gap-2 text-sm">
                <button className="rounded-full bg-orange-100 px-4 py-2 font-bold text-orange-700">المنشورات</button>
                <button className="rounded-full bg-slate-100 px-4 py-2 text-slate-600">ريلز</button>
                <button className="rounded-full bg-slate-100 px-4 py-2 text-slate-600">ألبومات</button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="ما الذي تريد مشاركته اليوم؟"
                className="w-full resize-none rounded-[22px] border border-orange-200 bg-orange-50 px-4 py-3 text-slate-900 focus:border-orange-400 focus:outline-none"
              />
              {error ? <div className="mt-3 rounded-2xl bg-red-100 p-3 text-sm text-red-700">{error}</div> : null}
              <div className="mt-4 flex justify-between gap-3">
                <div className="flex gap-2 text-sm text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-2">📷 صورة</span>
                  <span className="rounded-full bg-slate-100 px-3 py-2">🎥 فيديو</span>
                </div>
                <button
                  type="button"
                  onClick={handlePublish}
                  className="rounded-full bg-orange-600 px-6 py-2.5 font-bold text-white transition hover:bg-orange-700"
                >
                  نشر
                </button>
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-bold text-slate-900">Reels</div>
                <div className="text-xs text-orange-600">قصص قصيرة</div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {stories.map((story, index) => (
                  <div key={story.name} className="rounded-[24px] bg-gradient-to-br p-[1px] shadow-sm">
                    <div className={`rounded-[23px] bg-gradient-to-br ${story.color} p-4 text-white`}>
                      <div className="mb-10 text-3xl">{story.icon}</div>
                      <div className="font-bold">{story.name}</div>
                      <div className="text-xs opacity-90">ريل #{index + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              {posts.map((post) => (
                <article key={post.id} className="rounded-[28px] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-bold text-slate-900">{post.authorName}</div>
                      <div className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString('ar-EG')}</div>
                    </div>
                    <div className="rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-700">{post.authorEmail}</div>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-slate-800">{post.content}</p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                    <span>المشاهدات: {post.views ?? 0}</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const session = getSession();
                          if (session) {
                            await toggleLikePost(post.id, session.user.email);
                          }
                        }}
                        className="rounded-full bg-orange-50 px-4 py-2 text-orange-700 transition hover:bg-orange-100"
                      >
                        {(post.likes ?? []).length} إعجاب
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await incrementPostViews(post.id);
                        }}
                        className="rounded-full bg-orange-50 px-4 py-2 text-orange-700 transition hover:bg-orange-100"
                      >
                        شاهد
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const session = getSession();
                          if (session) {
                            await toggleSavePost(post.id, session.user.email);
                          }
                        }}
                        className="rounded-full bg-orange-50 px-4 py-2 text-orange-700 transition hover:bg-orange-100"
                      >
                        حفظ
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await deletePost(post.id);
                        }}
                        className="rounded-full bg-red-50 px-4 py-2 text-red-700 transition hover:bg-red-100"
                      >
                        حذف
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[20px] bg-slate-50 p-3">
                    {(post.comments ?? []).map((comment) => (
                      <div key={comment.id} className="mb-2 rounded-2xl bg-white px-3 py-2 text-sm text-slate-700">
                        <div className="font-bold text-slate-900">{comment.authorName}</div>
                        <div>{comment.text}</div>
                      </div>
                    ))}
                    <div className="mt-2 flex gap-2">
                      <input
                        value={commentDrafts[post.id] ?? ''}
                        onChange={(e) => setCommentDrafts((current) => ({ ...current, [post.id]: e.target.value }))}
                        placeholder="اكتب تعليقاً..."
                        className="flex-1 rounded-full border border-orange-200 px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const session = getSession();
                          const text = commentDrafts[post.id]?.trim();
                          if (!session || !text) return;
                          await addCommentToPost(post.id, session.user, text);
                          setCommentDrafts((current) => ({ ...current, [post.id]: '' }));
                        }}
                        className="rounded-full bg-orange-600 px-4 py-2 text-sm text-white"
                      >
                        تعليق
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {posts.length === 0 ? (
                <div className="rounded-[28px] bg-white p-6 text-center text-slate-500 shadow-sm">
                  لا توجد منشورات حتى الآن.
                </div>
              ) : null}
            </section>
          </main>

          <aside className="space-y-5">
            <div className="rounded-[28px] bg-white p-4 shadow-sm">
              <div className="mb-3 font-bold text-slate-900">الرسائل</div>
              <div className="space-y-3">
                {chats.map((chat) => (
                  <div key={chat.name} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-white">
                        {chat.name.slice(0, 1)}
                      </div>
                      <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${chat.online ? 'bg-green-500' : 'bg-slate-300'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold text-slate-900">{chat.name}</div>
                      <div className="truncate text-xs text-slate-500">{chat.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-4 shadow-sm">
              <div className="mb-3 font-bold text-slate-900">الملف الشخصي</div>
              <div className="space-y-3">
                <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 p-4 text-white">
                  <div className="text-2xl font-black">AQORA</div>
                  <div className="mt-2 text-sm opacity-90">ملف شخصي متكامل يشبه Facebook</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                  أضف صورة غلاف، أزرار متابعة، ووضع الظهور عبر الإنترنت لتجربة أكثر واقعية.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
