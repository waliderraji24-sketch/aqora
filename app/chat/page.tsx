'use client';

import BottomNav from '../../components/BottomNav';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addChatMessage,
  getStoredConversations,
  updateConversationLastMessage,
  Conversation,
  ChatMessage,
} from '../../lib/data';
import { isFirebaseAvailable, getCollection } from '../../lib/firebase';
import { getSession } from '../../lib/auth';

export default function ChatPage() {
  const [authorized, setAuthorized] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [message, setMessage] = useState('');
  const [callStatus, setCallStatus] = useState('');
  const [callId, setCallId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/');
      return;
    }
    setAuthorized(true);
    let unsub: (() => void) | null = null;
    async function init() {
      if (isFirebaseAvailable()) {
        try {
          const fb = await import('../../lib/firebase');
          unsub = fb.listenCollection('conversations', (docs: any[]) => {
            setConversations(docs as Conversation[]);
            setSelectedId((docs as any)[0]?.id ?? '');
          });
          // show local until remote resolves
          const stored = getStoredConversations();
          setConversations(stored);
          setSelectedId(stored[0]?.id ?? '');
          return;
        } catch (e) {
          console.warn('Failed to load conversations from Firestore', e);
        }
      }
      const stored = getStoredConversations();
      setConversations(stored);
      setSelectedId(stored[0]?.id ?? '');
    }
    init();
    return () => {
      if (unsub) unsub();
    };
  }, [router]);

  const selectedConv = conversations.find((conv) => conv.id === selectedId);

  const handleSend = async () => {
    if (!message.trim() || !selectedId) return;
    const now = new Date();
    const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const nextMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: message.trim(),
      time,
    };

    const updated = await addChatMessage(selectedId, nextMessage);
    const updatedSummary = await updateConversationLastMessage(selectedId, message.trim(), time);
    setConversations((updatedSummary as Conversation[]) || (updated as Conversation[]));
    setMessage('');
  };

  const handleCall = () => {
    (async () => {
      if (!selectedConv) return;
      if (!isFirebaseAvailable()) {
        setCallStatus(`جاري الاتصال بـ ${selectedConv.name}... (محلي)`);
        setTimeout(() => {
          setCallStatus(`تم الاتصال بـ ${selectedConv.name}`);
          setTimeout(() => setCallStatus(''), 3000);
        }, 1500);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setLocalStream(stream);
        const id = `call-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setCallId(id);
        setCallStatus('جاري إنشاء المكالمة...');
        const webrtc = await import('../../lib/webrtc');
        const { pc, remoteStream } = await webrtc.startCallFirestore(id, stream, (s: MediaStream) => setRemoteStream(s));
        setCallStatus('تم إنشاء المكالمة، بانتظار الإجابة...');
      } catch (e) {
        console.error(e);
        setCallStatus('فشل بدء المكالمة');
        setTimeout(() => setCallStatus(''), 3000);
      }
    })();
  };

  if (!authorized) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900">جارٍ التحقق...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 pb-28">
      <div className="max-w-6xl mx-auto grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-[2rem] border border-orange-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-orange-600 p-5 text-white">
            <h2 className="text-xl font-bold">المحادثات</h2>
          </div>
          <div className="space-y-3 p-5">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full rounded-3xl border p-4 text-right transition ${
                  selectedId === conv.id
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-orange-200 hover:bg-orange-50'
                }`}
              >
                <div className="font-semibold text-gray-900">{conv.name}</div>
                <div className="text-xs text-gray-500">{conv.lastMessage}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-orange-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-orange-100 bg-white p-5">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{selectedConv?.name ?? 'المحادثة'}</div>
              <div className="text-xs text-gray-500">آخر تحديث {selectedConv?.time}</div>
            </div>
            <button
              onClick={handleCall}
              className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              اتصال
            </button>
          </div>
          {callStatus ? (
            <div className="border-t border-orange-100 bg-green-50 px-5 py-3 text-sm text-green-800">{callStatus}</div>
          ) : null}

          {remoteStream ? (
            <div className="p-5">
              <div className="text-sm font-semibold text-gray-700 mb-2 text-right">مكالمة حالية</div>
              <video className="w-full rounded-lg" autoPlay playsInline ref={(el) => { if (el && remoteStream) el.srcObject = remoteStream; }} />
            </div>
          ) : null}

          <div className="space-y-4 bg-slate-50 p-5 min-h-[360px]">
            {selectedConv?.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs rounded-3xl px-4 py-3 shadow-sm ${
                    msg.sender === 'me' ? 'bg-orange-600 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <div className="mt-2 text-[10px] text-gray-400 text-right">{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-orange-100 bg-white p-5">
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالة..."
                className="flex-1 rounded-full border border-orange-200 bg-orange-50 px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={handleSend}
                className="rounded-full bg-orange-600 px-6 py-3 text-white font-semibold hover:bg-orange-700"
              >
                إرسال
              </button>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
