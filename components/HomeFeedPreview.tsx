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
    <section className="mt-12 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">أحدث المنشورات</h2>
        <Link href="/feed" className="text-sm text-orange-600 hover:underline">عرض الكل</Link>
      </div>

      <div className="mt-4 space-y-4">
        {posts.length === 0 && (
          <div className="text-gray-500">لا توجد منشورات بعد — جرب إنشاء حساب ونشر أول منشور!</div>
        )}

        {posts.map((post) => (
          <article key={post.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">{post.authorName || post.authorEmail}</div>
              <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
            </div>
            <p className="mt-2 text-gray-800 line-clamp-3">{post.content}</p>
            <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
              <div>❤️ {post.likes?.length ?? 0}</div>
              <div>💬 {post.comments?.length ?? 0}</div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link href="/login" className="inline-flex rounded-full bg-orange-600 px-6 py-2 text-white">تسجيل / إنشاء حساب</Link>
      </div>
    </section>
  );
}
