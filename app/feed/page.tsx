'use client';

import BottomNav from '../../components/BottomNav';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '../../lib/auth';
import { addCommentToPost, createPost, deletePost, incrementPostViews, listenPosts, SocialComment, SocialPost, toggleLikePost, toggleSavePost } from '../../lib/social';

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 pb-28">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-lg border border-orange-100">
          <h1 className="text-3xl font-bold text-orange-600">الصفحة الرئيسية</h1>
          <p className="mt-3 text-gray-600">أنشر محتوى حقيقي وشاهد المشاركات الخاصة بك.</p>
        </div>

        <div className="rounded-[2rem] border border-orange-200 bg-white p-6 shadow-sm">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="اكتب منشوراً جديداً..."
            className="w-full rounded-[1.5rem] border border-orange-200 bg-orange-50 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none resize-none"
          />
          {error ? <div className="mt-3 rounded-2xl bg-red-100 p-3 text-sm text-red-700">{error}</div> : null}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handlePublish}
              className="rounded-full bg-orange-600 px-6 py-3 text-white font-semibold transition hover:bg-orange-700"
            >
              نشر
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {posts.map((post) => (
            <div key={post.id} className="rounded-[2rem] border border-orange-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 text-right sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-900">{post.authorName}</div>
                  <div className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString('ar-EG')}</div>
                </div>
                <div className="text-sm text-gray-500 text-left sm:text-right">{post.authorEmail}</div>
              </div>
              <p className="mt-4 text-gray-800 whitespace-pre-wrap">{post.content}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                <span>عدد المشاهدات: {post.views ?? 0}</span>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={async () => { const session = getSession(); if (session) { await toggleLikePost(post.id, session.user.email); } }} className="rounded-full bg-orange-50 px-4 py-2 text-orange-700 transition hover:bg-orange-100">{(post.likes ?? []).length} إعجاب</button>
                  <button type="button" onClick={async () => { await incrementPostViews(post.id); }} className="rounded-full bg-orange-50 px-4 py-2 text-orange-700 transition hover:bg-orange-100">شاهد</button>
                  <button type="button" onClick={async () => { const session = getSession(); if (session) { await toggleSavePost(post.id, session.user.email); } }} className="rounded-full bg-orange-50 px-4 py-2 text-orange-700 transition hover:bg-orange-100">حفظ</button>
                  <button type="button" onClick={async () => { await deletePost(post.id); }} className="rounded-full bg-red-50 px-4 py-2 text-red-700 transition hover:bg-red-100">حذف</button>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/60 p-3">
                {(post.comments ?? []).map((comment) => (
                  <div key={comment.id} className="mb-2 rounded-xl bg-white px-3 py-2 text-sm text-gray-700">
                    <div className="font-semibold text-gray-900">{comment.authorName}</div>
                    <div>{comment.text}</div>
                  </div>
                ))}
                <div className="mt-2 flex gap-2">
                  <input value={commentDrafts[post.id] ?? ''} onChange={(e) => setCommentDrafts((current) => ({ ...current, [post.id]: e.target.value }))} placeholder="اكتب تعليقاً..." className="flex-1 rounded-full border border-orange-200 px-3 py-2 text-sm" />
                  <button type="button" onClick={async () => { const session = getSession(); const text = commentDrafts[post.id]?.trim(); if (!session || !text) return; await addCommentToPost(post.id, session.user, text); setCommentDrafts((current) => ({ ...current, [post.id]: '' })); }} className="rounded-full bg-orange-600 px-4 py-2 text-sm text-white">تعليق</button>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 ? (
            <div className="rounded-[2rem] border border-orange-200 bg-white p-6 shadow-sm text-center text-gray-500">
              لا توجد منشورات حتى الآن.
            </div>
          ) : null}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
