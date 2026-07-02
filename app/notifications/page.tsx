'use client';

import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import Link from 'next/link';

type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  type: 'like' | 'comment' | 'follow' | 'system';
  fromUserId?: string;
  fromUserName?: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      const token = localStorage.getItem('aqora_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error('فشل جلب الإشعارات:', error);
      }
      setLoading(false);
    }

    fetchNotifications();
  }, []);

  return (
    <div className="space-y-6 py-6">
      <Card>
        <h1 className="text-2xl font-semibold text-white">الإشعارات</h1>
        <p className="mt-2 text-sm text-slate-400">اطلع على آخر نشاطات التواصل في AQORA.</p>
      </Card>

      {loading ? (
        <Card>
          <p className="text-slate-300">جاري تحميل الإشعارات...</p>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <p className="text-slate-400">لا توجد إشعارات بعد. تفاعل مع المستخدمين لبدء النشاط.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-slate-200 text-2xl">
                  {notification.type === 'like' && '❤️'}
                  {notification.type === 'comment' && '💬'}
                  {notification.type === 'follow' && '👥'}
                  {notification.type === 'system' && '⚙️'}
                </div>
                <div className="flex-1">
                  <div>
                    {notification.fromUserId ? (
                      <Link
                        href={`/profile/${notification.fromUserId}`}
                        className="font-semibold text-white hover:text-brand-400 transition"
                      >
                        {notification.fromUserName || 'مستخدم'}
                      </Link>
                    ) : (
                      <p className="font-semibold text-white">{notification.title}</p>
                    )}
                  </div>
                  <p className="mt-2 text-slate-300">{notification.message}</p>
                  <p className="mt-3 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString('ar-EG')}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
