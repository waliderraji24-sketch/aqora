'use client';

import BottomNav from '../../components/BottomNav';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getStoredUser, updateUserProfile, saveSession, StoredUser } from '../../lib/auth';
import { isFirebaseAvailable, saveDocument } from '../../lib/firebase';

export default function ProfilePage() {
  const [authorized, setAuthorized] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
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
  }, [router]);

  if (!authorized) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900">جارٍ التحقق...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 pb-28">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-lg border border-orange-100">
          <h1 className="text-3xl font-bold text-orange-600">الملف الشخصي</h1>
          <p className="mt-3 text-gray-600">أدخل معلوماتك الشخصية هنا.</p>
          <form className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم الكامل</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اكتب اسمك"
                className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-3xl border border-orange-200 bg-orange-100/70 px-4 py-3 text-gray-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="اكتب رقم هاتفك"
                className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">نبذة قصيرة</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="أضف نبذة عن نفسك"
                className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none resize-none"
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
                  if (isFirebaseAvailable()) {
                    try {
                      const id = email.replace(/[@.]/g, '_');
                      await saveDocument('users', id, { name: storedUser.name, email: storedUser.email, phone: storedUser.phone, bio: storedUser.bio, joinedAt: storedUser.joinedAt });
                    } catch (e) {
                      console.warn('Failed saving profile to Firestore', e);
                    }
                  }
                  setSuccess('تم حفظ البيانات بنجاح');
                } catch (e) {
                  if (e instanceof Error) setError(e.message);
                  else setError('حدث خطأ أثناء حفظ البيانات');
                }
              }}
              className="w-full rounded-full bg-orange-600 px-6 py-3 text-white font-semibold hover:bg-orange-700"
            >
              حفظ المعلومات
            </button>
          {success ? <div className="mt-4 rounded-2xl bg-green-100 p-3 text-sm text-green-700">{success}</div> : null}
          {error ? <div className="mt-4 rounded-2xl bg-red-100 p-3 text-sm text-red-700">{error}</div> : null}
          </form>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
