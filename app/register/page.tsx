'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../components/Card';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || 'فشل إنشاء الحساب');
      return;
    }

    const data = await res.json();
    localStorage.setItem('aqora_token', data.token);
    router.push('/feed');
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <Card>
        <h1 className="text-3xl font-semibold text-white">إنشاء حساب جديد</h1>
        <p className="mt-3 text-slate-400">ابدأ تجربتك على AQORA اليوم.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <label className="block">
            <span className="text-sm text-slate-300">الاسم الكامل</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-500"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">البريد الإلكتروني</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-500"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">كلمة المرور</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-500"
            />
          </label>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
            إنشاء الحساب
          </button>
        </form>
      </Card>
    </div>
  );
}
