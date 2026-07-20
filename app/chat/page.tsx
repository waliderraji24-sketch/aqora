'use client';

import BottomNav from '../../components/BottomNav';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '../../lib/auth';
import { createCallInvite, createConversation, createNotification, listenConversations, listenNotifications, listenPresence, listenUsers, sendMessage, setPresence, SocialConversation, SocialMessage, SocialPresence, SocialUserProfile } from '../../lib/social';

export default function ChatPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [users, setUsers] = useState<SocialUserProfile[]>([]);
  const [conversations, setConversations] = useState<SocialConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [message, setMessage] = useState('');
  const [callStatus, setCallStatus] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [presence, setPresenceState] = useState<SocialPresence[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/');
      return;
    }
    setAuthorized(true);
    setCurrentUserEmail(session.user.email);
    setPresence(session.user.email, true);
    const stopUsers = listenUsers((docs) => setUsers(docs.filter((user) => user.email !== session.user.email)));
    const stopConversations = listenConversations((docs) => {
      setConversations(docs.filter((conversation) => (conversation.participants ?? []).includes(session.user.email)));
      if (!selectedConversationId && docs.length > 0) {
        setSelectedConversationId(docs[0].id);
      }
    });
    const stopPresence = listenPresence((docs) => setPresenceState(docs));
    const stopNotifications = listenNotifications(session.user.email, (docs) => setNotifications(docs));
    return () => {
      stopUsers();
      stopConversations();
      stopPresence();
      stopNotifications();
      setPresence(session.user.email, false);
    };
  }, [router]);

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConversationId);

  const handleStartChat = async (otherEmail: string) => {
    const session = getSession();
    if (!session) return;
    const conversation = await createConversation(session.user.email, otherEmail);
    setSelectedConversationId(conversation.id);
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedConversationId) return;
    const session = getSession();
    if (!session) return;
    await sendMessage(selectedConversationId, session.user.email, message.trim());
    const otherEmail = selectedConversation?.participants.filter((email) => email !== session.user.email)[0];
    if (otherEmail) {
      await createNotification(otherEmail, 'رسالة جديدة', `${session.user.name} أرسل لك رسالة جديدة`);
    }
    setMessage('');
  };

  const handleCall = async (calleeEmail: string) => {
    const session = getSession();
    if (!session) return;
    const callId = await createCallInvite(session.user.email, calleeEmail);
    setCallStatus(`تم إرسال دعوة مكالمة إلى ${calleeEmail} — معرف الدعوة: ${callId}`);
  };

  if (!authorized) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900">جارٍ التحقق...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 pb-28">
      <div className="mx-auto max-w-7xl grid gap-4 lg:grid-cols-[280px_1fr_280px]">
        <div className="rounded-[2rem] border border-orange-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-orange-600 p-5 text-white">
            <h2 className="text-xl font-bold">الأصدقاء</h2>
            <p className="mt-1 text-sm text-orange-100">المستخدمون المسجلون فعليًا</p>
          </div>
          <div className="space-y-3 p-5">
            {users.length === 0 ? (
            <div className="rounded-3xl border border-orange-100 bg-orange-50 p-4 text-center text-gray-500">لا يوجد أصدقاء مسجلين حتى الآن.</div>
          ) : users.map((user) => {
            const isOnline = presence.some((item) => item.email === user.email && item.online);
            return (
              <div key={user.email} className="rounded-3xl border border-orange-100 bg-orange-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {isOnline ? 'متصل' : 'غير متصل'}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleStartChat(user.email)} className="rounded-full bg-orange-600 px-3 py-2 text-xs text-white">محادثة</button>
                  <button onClick={() => handleCall(user.email)} className="rounded-full bg-green-600 px-3 py-2 text-xs text-white">اتصال</button>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-orange-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-orange-100 bg-white p-5">
            <div className="text-lg font-bold text-gray-900">{selectedConversation ? selectedConversation.participants.filter((email) => email !== currentUserEmail)[0] ?? 'المحادثة' : 'اختر محادثة'}</div>
            <div className="text-xs text-gray-500">{selectedConversation ? 'رسائل مباشرة بين المستخدمين' : 'اختر شخصاً لبدء المحادثة'}</div>
          </div>
          {callStatus ? <div className="border-t border-orange-100 bg-green-50 px-5 py-3 text-sm text-green-800">{callStatus}</div> : null}

          <div className="space-y-4 bg-slate-50 p-5 min-h-[380px]">
            {(selectedConversation?.messages ?? []).map((msg: SocialMessage) => (
              <div key={msg.id} className={`flex ${msg.senderEmail === currentUserEmail ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-3xl px-4 py-3 shadow-sm ${msg.senderEmail === currentUserEmail ? 'bg-orange-600 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <div className="mt-2 text-[10px] text-gray-400 text-right">{new Date(msg.createdAt).toLocaleString('ar-EG')}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-orange-100 bg-white p-5">
            <div className="flex gap-3">
              <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="اكتب رسالة..." className="flex-1 rounded-full border border-orange-200 bg-orange-50 px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500" />
              <button onClick={handleSend} className="rounded-full bg-orange-600 px-6 py-3 text-white font-semibold hover:bg-orange-700">إرسال</button>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-orange-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-orange-600 p-5 text-white">
            <h2 className="text-xl font-bold">المحادثات</h2>
            <div className="mt-2 text-sm text-orange-100">{notifications.length} إشعار جديد</div>
          </div>
          <div className="space-y-3 p-5">
            {conversations.map((conversation) => (
              <button key={conversation.id} onClick={() => setSelectedConversationId(conversation.id)} className={`w-full rounded-3xl border p-4 text-right transition ${selectedConversationId === conversation.id ? 'border-orange-400 bg-orange-50' : 'border-orange-200 hover:bg-orange-50'}`}>
                <div className="font-semibold text-gray-900">{conversation.participants.filter((email) => email !== currentUserEmail)[0] ?? 'محادثة'}</div>
                <div className="text-xs text-gray-500">{conversation.lastMessage || 'ابدأ المحادثة الآن'}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
