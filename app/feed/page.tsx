'use client';

import BottomNav from '../../components/BottomNav';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPost, getStoredPosts, FeedPost, incrementPostViews } from '../../lib/data';
import { isFirebaseAvailable, getCollection } from '../../lib/firebase';
import { AuthUser, getSession } from '../../lib/auth';

export default function FeedPage() {
  const [authorized, setAuthorized] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/');
      return;
    }
    setAuthorized(true);
    let unsub: (() => void) | null = null;
    async function init() {
      if (isFirebaseAvailable()) {
        try {
          const fb = await import('../../lib/firebase');
          unsub = fb.listenCollection('posts', (docs: any[]) => setPosts(docs as FeedPost[]));
          // show local posts until remote updates arrive
          setPosts(getStoredPosts());
          return;
        } catch (e) {
          console.warn('Failed to load posts from Firestore', e);
        }
      }
      setPosts(getStoredPosts());
    }
    init();
    return () => {
      if (unsub) unsub();
    };
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
                  <div className="text-lg font-semibold text-gray-900">{post.author}</div>
                  <div className="text-sm text-gray-500">{post.timestamp}</div>
                </div>
                <div className="text-sm text-gray-500 text-left sm:text-right">{post.email}</div>
              </div>
              <p className="mt-4 text-gray-800 whitespace-pre-wrap">{post.content}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                <span>عدد المشاهدات: {post.views}</span>
                <button
                  type="button"
                  onClick={async () => {
                    const updated = await incrementPostViews(post.id);
                    setPosts(updated as FeedPost[]);
                  }}
                  className="rounded-full bg-orange-50 px-4 py-2 text-orange-700 transition hover:bg-orange-100"
                >
                  شاهد المنشور
                </button>
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
