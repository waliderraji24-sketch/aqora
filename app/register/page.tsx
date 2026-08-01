'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, saveSession } from '../../lib/auth';
import { isFirebaseAvailable } from '../../lib/firebase';
import { ensureUserProfile } from '../../lib/social';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isFirebaseAvailable()) {
        try {
          const res = await (await import('../../lib/firebase')).signUpWithEmail(email, password);
          try {
            await ensureUserProfile({ name, email: res.user.email, joinedAt: res.user.joinedAt });
          } catch {}
          saveSession(res.user, res.token);
          router.push('/dashboard');
          return;
        } catch (e) {
          if (e instanceof Error) throw e;
          throw new Error('فشل تسجيل Firebase. تحقق من إعدادات المحاكي.');
        }
      }

      const result = registerUser(name, email, password);
      try {
        await ensureUserProfile({ name: result.user.name, email: result.user.email, joinedAt: result.user.joinedAt });
      } catch {}
      saveSession(result.user, result.token);
      router.push('/dashboard');
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError('حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-sm rounded-[24px] border border-orange-100 bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="text-4xl font-black text-orange-600">AQORA</div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="الاسم الكامل"
            className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-gray-900 focus:border-orange-500 focus:outline-none"
            required
          />

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني"
            className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-gray-900 focus:border-orange-500 focus:outline-none"
            required
          />

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-gray-900 focus:border-orange-500 focus:outline-none"
            required
            minLength={6}
          />

          {error ? <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-orange-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <button type="button" onClick={() => router.push('/login')} className="font-bold text-orange-600">
            تسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );
}
