"use client";

import { useEffect, useState } from 'react';

export default function FollowButton({ targetId }: { targetId: string }) {
  const [following, setFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('aqora_token');
      if (!token) return;
      try {
        const res = await fetch(`/api/follow?targetId=${targetId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setFollowing(!!data.following);
        }
      } catch (e) {
        // ignore
      }
    }
    load();
  }, [targetId]);

  async function toggle() {
    const token = localStorage.getItem('aqora_token');
    if (!token) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }
    setLoading(true);
    try {
      const action = following ? 'unfollow' : 'follow';
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetId, action }),
      });
      if (res.ok) {
        setFollowing(!following);
      } else {
        const data = await res.json();
        alert(data.message || 'فشل الإجراء');
      }
    } catch (e) {
      alert('فشل الاتصال');
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${following ? 'bg-slate-700 text-white' : 'bg-brand-500 text-white'}`}
    >
      {following ? 'متابع' : 'متابعة'}
    </button>
  );
}
