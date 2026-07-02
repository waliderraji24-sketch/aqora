'use client';

import { useState, useEffect } from 'react';
import Card from '../../components/Card';

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt?: string;
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [newRecipientId, setNewRecipientId] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // محاكاة للمحادثات (في الإنتاج ستأتي من API)
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: 'conv-1',
        participants: ['user-1', 'user-2'],
        lastMessage: 'مرحباً بك في AQORA!',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'conv-2',
        participants: ['user-1', 'user-3'],
        lastMessage: 'كيف حالك؟',
        updatedAt: new Date().toISOString(),
      },
    ];
    setConversations(mockConversations);
  }, []);

  // جلب الرسائل عند تحديد محادثة
  useEffect(() => {
    if (!selectedConversation) return;

    async function fetchMessages() {
      setLoading(true);
      try {
        const res = await fetch(`/api/chat?conversationId=${selectedConversation}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('فشل جلب الرسائل:', error);
      }
      setLoading(false);
    }

    fetchMessages();
  }, [selectedConversation]);

  // إرسال رسالة جديدة
  async function sendMessage() {
    if (!selectedConversation || !messageInput.trim()) {
      setStatusMessage('الرجاء اختيار محادثة وكتابة رسالة');
      return;
    }

    const token = localStorage.getItem('aqora_token');
    if (!token) {
      setStatusMessage('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: messageInput,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...messages, data.message]);
        setMessageInput('');
        setStatusMessage('تم إرسال الرسالة');
      } else {
        setStatusMessage('فشل إرسال الرسالة');
      }
    } catch (error) {
      console.error('خطأ في الإرسال:', error);
      setStatusMessage('حدث خطأ أثناء الإرسال');
    }
  }

  // بدء محادثة جديدة
  async function startNewConversation() {
    if (!newRecipientId.trim()) {
      setStatusMessage('الرجاء إدخال معرف المستقبل');
      return;
    }

    const newConvId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      participants: ['user-current', newRecipientId],
      updatedAt: new Date().toISOString(),
    };
    setConversations([newConv, ...conversations]);
    setSelectedConversation(newConvId);
    setNewRecipientId('');
    setMessages([]);
    setStatusMessage('تم بدء محادثة جديدة');
  }

  return (
    <div className="space-y-6 py-6">
      <Card>
        <h1 className="text-2xl font-semibold text-white">الدردشة</h1>
        <p className="mt-2 text-sm text-slate-400">ابدأ المحادثات مع الأصدقاء والمجتمع.</p>
      </Card>

      {statusMessage && (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {statusMessage}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* قائمة المحادثات */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <h2 className="text-lg font-semibold text-white">المحادثات</h2>
            <div className="mt-4 space-y-3">
              <div className="space-y-2">
                <input
                  type="text"
                  value={newRecipientId}
                  onChange={(e) => setNewRecipientId(e.target.value)}
                  placeholder="معرف المستقبل..."
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950 p-3 text-slate-100 outline-none focus:border-brand-500"
                />
                <button
                  onClick={startNewConversation}
                  className="w-full rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  محادثة جديدة
                </button>
              </div>

              <div className="space-y-2">
                {conversations.length === 0 ? (
                  <p className="text-slate-400 text-sm">لا توجد محادثات بعد</p>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full rounded-3xl border p-3 text-left transition ${
                        selectedConversation === conv.id
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-sm font-semibold text-white">
                        {conv.participants.join(', ')}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {conv.lastMessage || 'لا توجد رسائل'}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* نافذة الرسائل */}
        <div className="md:col-span-2">
          {selectedConversation ? (
            <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-soft" style={{ minHeight: '500px' }}>
              <div className="flex-1 space-y-4 overflow-y-auto mb-4">
                {loading ? (
                  <p className="text-center text-slate-400">جاري تحميل الرسائل...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm">لا توجد رسائل بعد. ابدأ المحادثة!</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="rounded-3xl bg-slate-950 p-4">
                      <p className="text-sm font-semibold text-white">{msg.senderName}</p>
                      <p className="mt-2 text-slate-300">{msg.content}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(msg.createdAt).toLocaleString('ar-EG')}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3 border-t border-slate-800 pt-4">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  rows={3}
                  placeholder="اكتب رسالة..."
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950 p-4 text-slate-100 outline-none focus:border-brand-500"
                />
                <button
                  onClick={sendMessage}
                  className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  إرسال
                </button>
              </div>
            </div>
          ) : (
            <Card>
              <p className="text-center text-slate-400">اختر محادثة أو ابدأ محادثة جديدة</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
