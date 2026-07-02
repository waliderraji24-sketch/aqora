'use client';

import { useState } from 'react';
import Card from '../../components/Card';
import Link from 'next/link';

type SearchUser = {
  id: string;
  name: string;
  bio: string;
  followersCount: number;
};

type SearchPost = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ users: SearchUser[]; posts: SearchPost[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        setResults(null);
      }
    } catch (error) {
      console.error('خطأ في البحث:', error);
      setResults(null);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6 py-6">
      <Card>
        <h1 className="text-2xl font-semibold text-white">البحث</h1>
        <p className="mt-2 text-sm text-slate-400">ابحث عن المستخدمين والمنشورات والمحتوى.</p>
      </Card>

      <Card>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مستخدم أو منشور..."
            className="flex-1 rounded-3xl border border-slate-800 bg-slate-950 px-5 py-3 text-slate-100 outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'جاري البحث...' : 'بحث'}
          </button>
        </form>
      </Card>

      {searched && loading && (
        <Card>
          <p className="text-center text-slate-400">جاري البحث عن "{query}"...</p>
        </Card>
      )}

      {searched && !loading && results && (
        <div className="space-y-6">
          {/* نتائج المستخدمين */}
          {results.users.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">المستخدمون ({results.users.length})</h2>
              <div className="space-y-3">
                {results.users.map((user) => (
                  <Card key={user.id}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <Link
                          href={`/profile/${user.id}`}
                          className="font-semibold text-white hover:text-brand-400 transition"
                        >
                          {user.name}
                        </Link>
                        <p className="mt-1 text-sm text-slate-400">{user.bio || 'بدون معلومات'}</p>
                        <p className="mt-2 text-xs text-slate-500">{user.followersCount} متابع</p>
                      </div>
                      <Link
                        href={`/profile/${user.id}`}
                        className="rounded-full border border-brand-500 px-4 py-2 text-sm text-white transition hover:bg-brand-500/10"
                      >
                        عرض الملف
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* نتائج المنشورات */}
          {results.posts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">المنشورات ({results.posts.length})</h2>
              <div className="space-y-3">
                {results.posts.map((post) => (
                  <Card key={post.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Link
                          href={`/profile/${post.authorId}`}
                          className="font-semibold text-white hover:text-brand-400 transition"
                        >
                          {post.authorName}
                        </Link>
                        <p className="mt-2 text-slate-300">{post.content}</p>
                        <p className="mt-3 text-xs text-slate-500">
                          {new Date(post.createdAt).toLocaleString('ar-EG')}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {results.users.length === 0 && results.posts.length === 0 && (
            <Card>
              <p className="text-center text-slate-400">لم يتم العثور على نتائج لـ "{query}"</p>
            </Card>
          )}
        </div>
      )}

      {searched && !loading && !results && (
        <Card>
          <p className="text-center text-slate-400">فشل البحث. حاول مرة أخرى.</p>
        </Card>
      )}
    </div>
  );
}
