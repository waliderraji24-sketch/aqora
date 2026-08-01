'use client';

import BottomNav from '../../components/BottomNav';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '../../lib/auth';
import { createConversation, createNotification, followUser, getFollowStatus, listenPresence, listenUsers, SocialPresence, SocialUserProfile } from '../../lib/social';

export default function FriendsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [users, setUsers] = useState<SocialUserProfile[]>([]);
  const [presence, setPresenceState] = useState<SocialPresence[]>([]);
  const [followState, setFollowState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/');
      return;
    }

    setAuthorized(true);
    const stopUsers = listenUsers((docs) => setUsers(docs.filter((user) => user.email !== session.user.email)));
    const stopPresence = listenPresence((docs) => setPresenceState(docs));

    return () => {
      stopUsers();
      stopPresence();
    };
  }, [router]);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    users.forEach(async (user) => {
      const status = await getFollowStatus(session.user.email, user.email);
      setFollowState((current) => ({ ...current, [user.email]: status }));
    });
  }, [users]);

  const handleToggleFollow = async (targetEmail: string) => {
    const session = getSession();
    if (!session) return;
    const nextStatus = await followUser(session.user.email, targetEmail);
    setFollowState((current) => ({ ...current, [targetEmail]: Boolean(nextStatus) }));
  };

  const handleStartChat = async (targetEmail: string) => {
    const session = getSession();
    if (!session) return;
    const conversation = await createConversation(session.user.email, targetEmail);
    await createNotification(targetEmail, 'رسالة جديدة', `${session.user.name} بدأ محادثة معك`);
    router.push(`/chat?conversation=${conversation.id}`);
  };

  if (!authorized) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900">جارٍ التحقق...</div>;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 pb-28 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-5 px-4 pt-4">
        <section className="rounded-[30px] bg-white p-5 shadow-sm">
          <div className="mb-4 text-2xl font-black text-slate-900">الأصدقاء</div>
          <div className="space-y-3">
            {users.length ? (
              users.map((user) => {
                const isOnline = presence.some((item) => item.email === user.email && item.online);
                const isFollowing = Boolean(followState[user.email]);
                return (
                  <div key={user.email} className="rounded-[24px] bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-black text-slate-900">{user.name}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                        <div className="mt-1 text-xs text-slate-500">{isOnline ? 'متصل الآن' : 'غير متصل حالياً'}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleFollow(user.email)}
                          className={`rounded-full px-4 py-2 text-sm font-bold ${isFollowing ? 'bg-slate-900 text-white' : 'bg-orange-600 text-white'}`}
                        >
                          {isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartChat(user.email)}
                          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
                        >
                          محادثة
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[22px] bg-slate-50 p-4 text-sm text-slate-500">لا يوجد أصدقاء لعرضهم في الوقت الحالي.</div>
            )}
          </div>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
