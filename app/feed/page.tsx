'use client';

import { useEffect, useState } from 'react';
import Card from '../../components/Card';

type Post = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};

type Comment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []));
  }, []);

  async function publish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = localStorage.getItem('aqora_token');
    if (!token) {
      setMessage('يجب تسجيل الدخول أولاً');
      return;
    }

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      setContent('');
      setMessage('تم نشر المنشور بنجاح');
      const data = await res.json();
      setPosts((prev) => [data.post, ...prev]);
    } else {
      setMessage('فشل النشر، تأكد من تسجيل الدخول');
    }
  }

  async function toggleComments(postId: string) {
    if (activeComments === postId) {
      setActiveComments(null);
      return;
    }

    setActiveComments(postId);
    if (commentsMap[postId]) {
      return;
    }

    const res = await fetch(`/api/comments?postId=${postId}`);
    if (!res.ok) return;
    const data = await res.json();
    setCommentsMap((prev) => ({ ...prev, [postId]: data.comments || [] }));
  }

  async function submitComment(postId: string) {
    const token = localStorage.getItem('aqora_token');
    if (!token) {
      setStatusMessage('يجب تسجيل الدخول للتعليق');
      return;
    }

    const contentForComment = commentInput[postId]?.trim();
    if (!contentForComment) {
      setStatusMessage('التعليق فارغ');
      return;
    }

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ postId, content: contentForComment }),
    });

    if (!res.ok) {
      setStatusMessage('فشل إضافة التعليق');
      return;
    }

    const data = await res.json();
    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [data.comment, ...(prev[postId] || [])],
    }));
    setCommentInput((prev) => ({ ...prev, [postId]: '' }));
    setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, commentCount: post.commentCount + 1 } : post)));
    setStatusMessage('تم إضافة التعليق');
  }

  async function handleLike(postId: string) {
    const token = localStorage.getItem('aqora_token');
    if (!token) {
      setStatusMessage('يجب تسجيل الدخول للإعجاب');
      return;
    }

    const res = await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ postId }),
    });

    if (!res.ok) {
      const data = await res.json();
      setStatusMessage(data.message || 'فشل الإعجاب');
      return;
    }

    setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, likeCount: post.likeCount + 1 } : post)));
    setStatusMessage('تمت إضافة إعجاب');
  }

  return (
    <div className="space-y-6 py-6">
      <Card>
        <h1 className="text-2xl font-semibold text-white">Feed</h1>
        <p className="mt-2 text-sm text-slate-400">نشر المحتوى والتفاعل مع شبكة AQORA.</p>
        <form onSubmit={publish} className="mt-6 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="اكتب منشوراً موجزاً..."
            className="w-full rounded-3xl border border-slate-800 bg-slate-950 p-4 text-slate-100 outline-none focus:border-brand-500"
          />
          <div className="flex items-center justify-between gap-4">
            <button className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
              نشر المنشور
            </button>
            {message ? <span className="text-sm text-slate-300">{message}</span> : null}
          </div>
        </form>
      </Card>

      {statusMessage ? (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{statusMessage}</div>
      ) : null}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <p className="text-slate-400">لا توجد منشورات حالياً. كن أول من يشارك!</p>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">{post.authorName}</p>
                  <p className="text-sm text-slate-400">{new Date(post.createdAt).toLocaleString('ar-EG')}</p>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    className="rounded-full border border-slate-700 px-4 py-2 text-sm transition hover:border-brand-500 hover:text-white"
                  >
                    ❤️ {post.likeCount}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleComments(post.id)}
                    className="rounded-full border border-slate-700 px-4 py-2 text-sm transition hover:border-brand-500 hover:text-white"
                  >
                    💬 {post.commentCount}
                  </button>
                </div>
              </div>
              <p className="mt-4 text-slate-200">{post.content}</p>

              {activeComments === post.id ? (
                <div className="mt-5 space-y-4 rounded-3xl border border-slate-800 bg-slate-950 p-4">
                  <div className="space-y-3">
                    {(commentsMap[post.id] || []).map((comment) => (
                      <div key={comment.id} className="rounded-3xl bg-slate-900 p-4">
                        <p className="text-sm font-semibold text-white">{comment.authorName}</p>
                        <p className="mt-2 text-slate-300">{comment.content}</p>
                        <p className="mt-2 text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString('ar-EG')}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <textarea
                      value={commentInput[post.id] || ''}
                      onChange={(e) => setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      rows={3}
                      placeholder="اكتب تعليق..."
                      className="w-full rounded-3xl border border-slate-800 bg-slate-950 p-4 text-slate-100 outline-none focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => submitComment(post.id)}
                      className="rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                    >
                      أرسل تعليق
                    </button>
                  </div>
                </div>
              ) : null}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
