'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/BottomNav';
import { clearSession, getSession } from '../../lib/auth';
import {
  listenNotifications,
  listenPresence,
  listenUsers,
  searchContent,
  setPresence,
  SocialPost,
  SocialPresence,
  SocialReel,
  SocialUserProfile,
} from '../../lib/social';

const quickLinks = [
  { href: '/feed', icon: '🏠', title: 'المنشورات', desc: 'Feed متكامل وشبيه بالفيسبوك' },
  { href: '/reels', icon: '🎥', title: 'ريلز', desc: 'فيديوهات قصيرة مثل تيك توك' },
  { href: '/chat', icon: '💬', title: 'الرسائل', desc: 'دردشة واتساب-مستوحاة' },
  { href: '/profile', icon: '👤', title: 'الملف الشخصي', desc: 'بطاقة شخصية احترافية' },
];

const stories = [
  { name: 'أحمد', emoji: '📸', tone: 'from-orange-500 to-rose-500' },
  { name: 'سارة', emoji: '✨', tone: 'from-sky-500 to-cyan-400' },
  { name: 'ريم', emoji: '🔥', tone: 'from-violet-500 to-fuchsia-500' },
  { name: 'خالد', emoji: '🎬', tone: 'from-emerald-500 to-lime-500' },
];

const trending = ['#AQORA', '#Social', '#Reels', '#Launch'];

export default function DashboardPage() {
  const [authorized, setAuthorized] = useState(false);
  const [name, setName] = useState('');
  const [users, setUsers] = useState<SocialUserProfile[]>([]);
  const [presence, setPresenceState] = useState<SocialPresence[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ users: SocialUserProfile[]; posts: SocialPost[]; reels: SocialReel[] }>({
    users: [],
    posts: [],
    reels: [],
  });
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/');
      return;
    }

    setName(session.user.name);
    setAuthorized(true);
    setPresence(session.user.email, true);

    const stopUsers = listenUsers((docs) => setUsers(docs.filter((user) => user.email !== session.user.email)));
    const stopPresence = listenPresence((docs) => setPresenceState(docs));
    const stopNotifications = listenNotifications(session.user.email, (docs) => setNotifications(docs));

    return () => {
      stopUsers();
      stopPresence();
      stopNotifications();
      setPresence(session.user.email, false);
    };
  }, [router]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults({ users: [], posts: [], reels: [] });
      return;
    }

    let cancelled = false;
    searchContent(trimmed).then((result) => {
      if (!cancelled) setSearchResults(result);
    });

    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  const onlineFriends = users.filter((user) => presence.some((entry) => entry.email === user.email && entry.online));

  if (!authorized) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900">جارٍ التحقق...</div>;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 pb-28 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-5 px-4 pt-4">
        <header className="rounded-[30px] bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 p-5 text-white shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-3xl font-black">AQORA</div>
              <div className="text-sm opacity-90">مرحباً، {name} — كل شيء في مكان واحد</div>
            </div>
            <div className="rounded-full bg-white/20 px-4 py-2 backdrop-blur">🔍 ابحث عن الأصدقاء أو الريلز أو المنشورات</div>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[30px] bg-white p-4 shadow-sm">
            <div className="mb-3 font-black text-slate-900">القصص والريلز</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stories.map((story) => (
                <div key={story.name} className={`rounded-[24px] bg-gradient-to-br ${story.tone} p-[1px]`}>
                  <div className="rounded-[23px] bg-white/10 p-4 text-white backdrop-blur">
                    <div className="mb-8 text-3xl">{story.emoji}</div>
                    <div className="font-bold">{story.name}</div>
                    <div className="text-xs opacity-90">Story Live</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] bg-white p-4 shadow-sm">
            <div className="mb-3 font-black text-slate-900">البحث السريع</div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اكتب اسم مستخدم، منشور، أو كلمة مفتاحية"
              className="w-full rounded-[18px] border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-orange-400"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {trending.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{tag}</span>
              ))}
            </div>

            {searchQuery.trim() ? (
              <div className="mt-4 space-y-3 rounded-[22px] bg-slate-50 p-3">
                {searchResults.users.length ? (
                  <div>
                    <div className="mb-2 text-sm font-bold text-slate-900">المستخدمون</div>
                    <div className="space-y-2">
                      {searchResults.users.slice(0, 3).map((user) => (
                        <div key={user.email} className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-700">
                          {user.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {searchResults.posts.length ? (
                  <div>
                    <div className="mb-2 text-sm font-bold text-slate-900">المنشورات</div>
                    <div className="space-y-2">
                      {searchResults.posts.slice(0, 3).map((post) => (
                        <div key={post.id} className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-700">
                          {post.content}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {searchResults.reels.length ? (
                  <div>
                    <div className="mb-2 text-sm font-bold text-slate-900">الريلز</div>
                    <div className="space-y-2">
                      {searchResults.reels.slice(0, 3).map((reel) => (
                        <div key={reel.id} className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-700">
                          {reel.caption}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {!searchResults.users.length && !searchResults.posts.length && !searchResults.reels.length ? (
                  <div className="text-sm text-slate-500">لا توجد نتائج لبحثك.</div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[28px] border border-orange-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">{item.icon}</span>
                <div>
                  <div className="font-black text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] bg-white p-5 shadow-sm">
            <div className="mb-3 font-black text-slate-900">المنشورات الأخيرة</div>
            <div className="space-y-3">
              <div className="rounded-[24px] bg-slate-50 p-4">
                <div className="font-bold text-slate-900">أحمد</div>
                <div className="mt-2 text-sm text-slate-600">تجربة مميزة في AQORA، تصميم اجتماعي يشبه Facebook مع تفاعل حقيقي.</div>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4">
                <div className="font-bold text-slate-900">سارة</div>
                <div className="mt-2 text-sm text-slate-600">الرسائل والريلز وملفك الشخصي الآن متكامل في واجهة واحدة.</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[30px] bg-white p-5 shadow-sm">
              <div className="mb-3 font-black text-slate-900">الإشعارات</div>
              <div className="space-y-2">
                {notifications.length ? (
                  notifications.map((item) => (
                    <div key={`${item.title}-${item.createdAt}`} className="rounded-[18px] bg-orange-50 p-3 text-sm text-slate-700">
                      {item.title} — {item.body}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[18px] bg-slate-50 p-3 text-sm text-slate-500">لا توجد إشعارات الآن.</div>
                )}
              </div>
            </div>

            <div className="rounded-[30px] bg-white p-5 shadow-sm">
              <div className="mb-3 font-black text-slate-900">الأصدقاء المتصلون</div>
              <div className="space-y-2">
                {onlineFriends.length ? (
                  onlineFriends.map((friend) => (
                    <div key={friend.email} className="flex items-center justify-between rounded-[18px] bg-slate-50 p-3">
                      <div className="font-semibold text-slate-900">{friend.name}</div>
                      <div className="text-xs text-emerald-600">متصل الآن</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[18px] bg-slate-50 p-3 text-sm text-slate-500">لا يوجد أصدقاء متصلون حالياً.</div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            onClick={() => {
              clearSession();
              router.push('/');
            }}
            className="rounded-lg bg-red-600 px-8 py-3 font-bold text-white shadow-md transition hover:bg-red-700"
          >
            تسجيل خروج
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
