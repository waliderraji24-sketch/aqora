import { AuthUser } from './auth';
import { isFirebaseAvailable, getCollection, saveDocument } from './firebase';

export type FeedPost = {
  id: string;
  author: string;
  email: string;
  content: string;
  timestamp: string;
  views: number;
};

export type ChatMessage = {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
};

export type Conversation = {
  id: string;
  name: string;
  avatar: string;
  messages: ChatMessage[];
  lastMessage: string;
  time: string;
};

const POSTS_KEY = 'aqoraPosts';
const CHATS_KEY = 'aqoraChats';

function readStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredPosts(): FeedPost[] {
  if (isFirebaseAvailable()) {
    // Firestore-backed posts will be fetched on-demand from UI using `getCollection`
    return readStorage<FeedPost[]>(POSTS_KEY)?.map((post) => ({ ...post, views: post.views ?? 0 })) ?? [];
  }
  return readStorage<FeedPost[]>(POSTS_KEY)?.map((post) => ({
    ...post,
    views: post.views ?? 0,
  })) ?? [];
}

export function saveStoredPosts(posts: FeedPost[]) {
  writeStorage(POSTS_KEY, posts);
}

export async function createPost(user: AuthUser, content: string) {
  const now = new Date();
  const post: FeedPost = {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2)}`,
    author: user.name,
    email: user.email,
    content: content.trim(),
    timestamp: now.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    views: 0,
  };

  if (isFirebaseAvailable()) {
    try {
      const id = await saveDocument('posts', null, { ...post, createdAt: new Date().toISOString() });
      post.id = id;
      return post;
    } catch (e) {
      console.warn('Failed to save post to Firestore', e);
      // fall back to local storage below
    }
  }

  const posts = getStoredPosts();
  saveStoredPosts([post, ...posts]);
  return post;
}

export async function incrementPostViews(postId: string) {
  if (isFirebaseAvailable()) {
    try {
      // increment locally then update firestore
      const posts: any[] = await getCollection('posts');
      const target = posts.find((p: any) => p.id === postId);
      const nextViews = (target?.views ?? 0) + 1;
      await saveDocument('posts', postId, { views: nextViews });
      return posts.map((p: any) => (p.id === postId ? { ...p, views: nextViews } : p));
    } catch (e) {
      console.warn('Failed to increment views in Firestore', e);
    }
  }

  const posts = getStoredPosts();
  const updated = posts.map((post) => (post.id !== postId ? post : { ...post, views: post.views + 1 }));
  saveStoredPosts(updated);
  return updated;
}

export function getStoredConversations(): Conversation[] {
  const stored = readStorage<Conversation[]>(CHATS_KEY);
  if (stored && stored.length > 0) {
    return stored;
  }

  const now = new Date();
  const initial: Conversation[] = [
    {
      id: 'conv-1',
      name: 'سارة',
      avatar: '👩',
      lastMessage: 'مرحباً، هل تحتاج أي مساعدة؟',
      time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      messages: [
        {
          id: 'msg-1',
          sender: 'other',
          text: 'مرحباً، هل تحتاج أي مساعدة؟',
          time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    },
  ];
  saveStoredConversations(initial);
  return initial;
}

export function saveStoredConversations(conversations: Conversation[]) {
  writeStorage(CHATS_KEY, conversations);
}

export async function addChatMessage(conversationId: string, message: ChatMessage) {
  if (isFirebaseAvailable()) {
    try {
      // We append via saveDocument by reading existing doc then merging
      const convs: any[] = await getCollection('conversations');
      const conv = convs.find((c) => c.id === conversationId);
      const messages = conv ? [...(conv.messages ?? []), message] : [message];
      await saveDocument('conversations', conversationId, { messages });
      const updated = convs.map((c) => (c.id === conversationId ? { ...c, messages, lastMessage: message.text, time: message.time } : c));
      return updated;
    } catch (e) {
      console.warn('Failed to add chat message to Firestore', e);
    }
  }

  const conversations = getStoredConversations();
  const updated = conversations.map((conv) => {
    if (conv.id !== conversationId) return conv;
    const messages = [...conv.messages, message];
    return {
      ...conv,
      messages,
      lastMessage: message.text,
      time: message.time,
    };
  });
  saveStoredConversations(updated);
  return updated;
}

export async function updateConversationLastMessage(conversationId: string, text: string, time: string) {
  if (isFirebaseAvailable()) {
    try {
      const convs: any[] = await getCollection('conversations');
      const updated = convs.map((conv) => (conv.id !== conversationId ? conv : { ...conv, lastMessage: text, time }));
      await saveDocument('conversations', conversationId, { lastMessage: text, time });
      return updated;
    } catch (e) {
      console.warn('Failed to update conversation in Firestore', e);
    }
  }

  const conversations = getStoredConversations();
  const updated = conversations.map((conv) => (conv.id !== conversationId ? conv : { ...conv, lastMessage: text, time }));
  saveStoredConversations(updated);
  return updated;
}

const REELS_VIEWS_KEY = 'aqoraReelsViews';

export function getReelsViews() {
  return readStorage<number>(REELS_VIEWS_KEY) ?? 0;
}

export function incrementReelsViews() {
  const next = getReelsViews() + 1;
  writeStorage(REELS_VIEWS_KEY, next);
  return next;
}
