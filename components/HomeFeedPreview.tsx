"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { listenPosts, SocialPost } from "../lib/social";

export default function HomeFeedPreview() {
  const [posts, setPosts] = useState<SocialPost[]>([]);

  useEffect(() => {
    const unsub = listenPosts((p) => setPosts(p.slice(0, 5)));
    return unsub;
  }, []);

  return (
    <section className="mx-auto mt-8 w-full max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900">أحدث المنشورات</h2>
        <Link href="/feed" className="text-sm font-bold text-orange-600 hover:underline">عرض الكل</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-orange-200 bg-white p-6 text-center text-slate-500 md:col-span-2 xl:col-span-3">
            لا توجد منشورات بعد — جرب إنشاء حساب ونشر أول منشور!
          </div>
        )}

        {posts.map((post) => (
          <article key={post.id} className="rounded-[26px] border border-orange-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="font-black text-slate-900">{post.authorName || post.authorEmail}</div>
              <div className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleString('ar-EG')}</div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-slate-700">{post.content}</p>
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
              <div className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">❤️ {post.likes?.length ?? 0}</div>
              <div className="rounded-full bg-slate-100 px-3 py-1">💬 {post.comments?.length ?? 0}</div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link href="/login" className="inline-flex rounded-full bg-orange-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-700">
          تسجيل / إنشاء حساب
        </Link>
      </div>
    </section>
  );
}
