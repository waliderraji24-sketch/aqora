'use client';

import BottomNav from '../../components/BottomNav';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getStoredUser, updateUserProfile, saveSession } from '../../lib/auth';
import { ensureUserProfile, getProfiles } from '../../lib/social';

export default function ProfilePage() {
  const [authorized, setAuthorized] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profiles, setProfiles] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/');
      return;
    }

    const storedUser = getStoredUser(session.user.email);
    setName(storedUser?.name ?? session.user.name);
    setEmail(session.user.email);
    setPhone(storedUser?.phone ?? '');
    setBio(storedUser?.bio ?? '');
    setAuthorized(true);
    getProfiles().then(setProfiles).catch(() => setProfiles([]));
  }, [router]);

  if (!authorized) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900">جارٍ التحقق...</div>;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 pb-28 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6 px-4 pt-4">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-sm">
          <div className="h-48 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500" />
          <div className="p-5">
            <div className="-mt-14 flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-orange-500 to-rose-500 text-3xl text-white shadow-lg">
                👤
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{name || 'AQORA User'}</div>
                <div className="text-sm text-slate-500">{email}</div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-orange-50 p-4 text-center">
                <div className="text-xl font-black text-orange-600">1.2K</div>
                <div className="text-xs text-slate-500">المنشورات</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-center">
                <div className="text-xl font-black text-slate-900">24K</div>
                <div className="text-xs text-slate-500">المتابعون</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-center">
                <div className="text-xl font-black text-slate-900">890</div>
                <div className="text-xs text-slate-500">المتابعون</div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[32px] bg-white p-5 shadow-sm">
            <div className="mb-4 text-xl font-black text-slate-900">تحديث الملف الشخصي</div>
            <form className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">الاسم الكامل</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اكتب اسمك"
                  className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-slate-900 focus:border-orange-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-3xl border border-orange-200 bg-orange-100/70 px-4 py-3 text-slate-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">رقم الهاتف</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="اكتب رقم هاتفك"
                  className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-slate-900 focus:border-orange-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">نبذة قصيرة</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="أضف نبذة عن نفسك"
                  className="w-full resize-none rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-slate-900 focus:border-orange-400 focus:outline-none"
                  rows={4}
                />
              </div>
              <button
                type="button"
                onClick={async () => {
                  setError('');
                  setSuccess('');
                  try {
                    const storedUser = updateUserProfile(email, { name, phone, bio });
                    const session = getSession();
                    if (session) {
                      saveSession({ name: storedUser.name, email: storedUser.email, joinedAt: storedUser.joinedAt }, session.token);
                    }
                    await ensureUserProfile({ name: storedUser.name, email: storedUser.email, phone: storedUser.phone, bio: storedUser.bio, joinedAt: storedUser.joinedAt });
                    setSuccess('تم حفظ البيانات بنجاح');
                  } catch (e) {
                    if (e instanceof Error) setError(e.message);
                    else setError('حدث خطأ أثناء حفظ البيانات');
                  }
                }}
                className="w-full rounded-full bg-orange-600 px-6 py-3 font-bold text-white transition hover:bg-orange-700"
              >
                حفظ المعلومات
              </button>
              {success ? <div className="rounded-2xl bg-green-100 p-3 text-sm text-green-700">{success}</div> : null}
              {error ? <div className="rounded-2xl bg-red-100 p-3 text-sm text-red-700">{error}</div> : null}
            </form>
          </div>

          <div className="space-y-5">
            <div className="rounded-[32px] bg-white p-5 shadow-sm">
              <div className="mb-3 font-black text-slate-900">أصدقاءك</div>
              <div className="space-y-3">
                {profiles.slice(0, 3).map((profile) => (
                  <div key={profile.email} className="rounded-2xl bg-slate-50 p-3">
                    <div className="font-bold text-slate-900">{profile.name}</div>
                    <div className="text-xs text-slate-500">{profile.email}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] bg-gradient-to-br from-orange-500 to-rose-500 p-5 text-white shadow-sm">
              <div className="text-lg font-black">نبذة</div>
              <div className="mt-2 text-sm opacity-90">{bio || 'أضف نبذة قصيرة لعرضها في الملف الشخصي.'}</div>
            </div>
          </div>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
