'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, saveSession } from '../../lib/auth';
import { isFirebaseAvailable } from '../../lib/firebase';
import { ensureUserProfile } from '../../lib/social';

export default function LoginPage() {
  const router = useRouter();
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
          const res = await (await import('../../lib/firebase')).signInWithEmailPassword(email, password);
          try {
            await ensureUserProfile({ name: res.user.name, email: res.user.email, joinedAt: res.user.joinedAt });
          } catch {}
          saveSession(res.user, res.token);
          router.push('/dashboard');
          return;
        } catch (e) {
          if (e instanceof Error) throw e;
          throw new Error('فشل تسجيل الدخول عبر Firebase. تحقق من إعدادات المحاكي.');
        }
      }

      const result = loginUser(email, password);
      try {
        await ensureUserProfile({ name: result.user.name, email: result.user.email, joinedAt: result.user.joinedAt });
      } catch {}
      saveSession(result.user, result.token);
      router.push('/dashboard');
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-orange-200 bg-white p-8 shadow-[0_20px_60px_-20px_rgba(249,115,22,0.4)]">
        <div className="text-center">
          <div className="text-4xl font-black text-orange-600">AQORA</div>
          <p className="mt-2 text-sm text-gray-500">تسجيل الدخول إلى منصتك</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="email">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              className="w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-gray-900 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="password">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-gray-900 focus:border-orange-500 focus:outline-none"
              required
              minLength={6}
            />
          </div>

          {error ? <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-orange-600 px-6 py-3 text-base font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? 'جارٍ تسجيل الدخول...' : 'دخول'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-600">
          ليس لديك حساب؟{' '}
          <button type="button" onClick={() => router.push('/register')} className="font-bold text-orange-600">
            إنشاء حساب
          </button>
        </div>
      </div>
    </div>
  );
}
