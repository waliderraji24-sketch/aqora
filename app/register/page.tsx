'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, saveSession } from '../../lib/auth';
import { isFirebaseAvailable, signInWithGoogle } from '../../lib/firebase';
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

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      if (!isFirebaseAvailable()) throw new Error('Firebase not configured');
      const result = await signInWithGoogle();
      try {
        await ensureUserProfile({ name: result.user.name, email: result.user.email, joinedAt: result.user.joinedAt });
      } catch {}
      saveSession(result.user, result.token);
      router.push('/dashboard');
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError('فشل تسجيل الدخول عبر Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-orange-200 bg-white p-8 shadow-xl shadow-orange-100">
        <h1 className="text-4xl font-bold text-orange-600 text-center">إنشاء حساب</h1>
        <p className="mt-3 text-center text-gray-600">أنشئ حساباً فعلياً لتستعمل التطبيق.</p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="name">
              الاسم الكامل
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسمك"
              className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none"
              required
              minLength={6}
            />
          </div>

          {error ? <div className="rounded-2xl bg-red-100 p-3 text-sm text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-orange-600 px-6 py-3 text-white font-semibold transition hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleGoogle}
            className="mt-3 inline-flex items-center gap-3 rounded-full border px-6 py-3 text-sm font-semibold"
          >
            <span>التسجيل عبر Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
