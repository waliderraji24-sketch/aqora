'use client';

import { useState } from 'react';
import Card from '../../components/Card';

export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSave = () => {
    // حفظ الإعدادات في localStorage (مؤقتاً)
    localStorage.setItem(
      'user_settings',
      JSON.stringify({
        notificationsEnabled,
        emailNotifications,
        privateAccount,
      })
    );
    setStatusMessage('تم حفظ الإعدادات بنجاح');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <div className="space-y-6 py-6">
      <Card>
        <h1 className="text-2xl font-semibold text-white">الإعدادات</h1>
        <p className="mt-2 text-sm text-slate-400">قم بتخصيص حسابك وسياسات إشعارات AQORA.</p>
      </Card>

      {statusMessage && (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {statusMessage}
        </div>
      )}

      <Card>
        <h2 className="text-xl font-semibold text-white">إعدادات الإشعارات</h2>
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">تفعيل الإشعارات</p>
              <p className="mt-1 text-sm text-slate-400">استقبل إشعارات حول النشاط</p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-7 rounded-full transition ${
                notificationsEnabled ? 'bg-brand-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition ${
                  notificationsEnabled ? 'ml-1' : 'mr-1'
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">إشعارات البريد الإلكتروني</p>
              <p className="mt-1 text-sm text-slate-400">استقبل ملخصات عبر البريد</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`w-12 h-7 rounded-full transition ${
                emailNotifications ? 'bg-brand-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition ${
                  emailNotifications ? 'ml-1' : 'mr-1'
                }`}
              ></div>
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-white">إعدادات الخصوصية</h2>
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">حساب خاص</p>
              <p className="mt-1 text-sm text-slate-400">اجعل حسابك خاص وتحكم في المتابعين</p>
            </div>
            <button
              onClick={() => setPrivateAccount(!privateAccount)}
              className={`w-12 h-7 rounded-full transition ${
                privateAccount ? 'bg-brand-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition ${
                  privateAccount ? 'ml-1' : 'mr-1'
                }`}
              ></div>
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-white">عن AQORA</h2>
        <div className="mt-4 space-y-3 text-slate-400 text-sm">
          <p>📱 الإصدار: 1.0.0</p>
          <p>🌍 منصة اجتماعية عالمية ذكية</p>
          <p>💾 البيانات محفوظة بأمان في MongoDB</p>
          <p>🔐 التشفير والحماية مفعلة</p>
        </div>
      </Card>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="rounded-full bg-brand-500 px-8 py-3 font-semibold text-white transition hover:bg-brand-700"
        >
          حفظ الإعدادات
        </button>
        <button className="rounded-full border border-slate-700 px-8 py-3 font-semibold text-white transition hover:border-red-500 hover:text-red-400">
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
