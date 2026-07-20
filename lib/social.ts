import { AuthUser, getSession } from './auth';
import {
  deleteDocument,
  getCollection,
  listenCollection,
  listenDocument,
  saveDocument,
  updateDocument,
  uploadFileToStorage,
} from './firebase';

const SOCIAL_USERS_KEY = 'aqora-social-users';
const SOCIAL_POSTS_KEY = 'aqora-social-posts';
const SOCIAL_REELS_KEY = 'aqora-social-reels';
const SOCIAL_CONVERSATIONS_KEY = 'aqora-social-conversations';
const SOCIAL_PRESENCE_KEY = 'aqora-social-presence';
const SOCIAL_NOTIFICATIONS_KEY = 'aqora-social-notifications';
const SOCIAL_FOLLOWS_KEY = 'aqora-social-follows';

function readLocalCollection<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalCollection<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function readLocalUsers(): SocialUserProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SOCIAL_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SocialUserProfile[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalUsers(users: SocialUserProfile[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOCIAL_USERS_KEY, JSON.stringify(users));
}

export type SocialUserProfile = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  joinedAt?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  reelsCount?: number;
};

export type SocialPost = {
  id: string;
  authorName: string;
  authorEmail: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  likes?: string[];
  comments?: SocialComment[];
  saves?: string[];
  views?: number;
};

export type SocialComment = {
  id: string;
  authorName: string;
  authorEmail: string;
  text: string;
  createdAt: string;
};

export type SocialReel = {
  id: string;
  authorName: string;
  authorEmail: string;
  caption: string;
  videoUrl: string;
  createdAt: string;
  likes?: string[];
  comments?: SocialComment[];
  views?: number;
};

export type SocialConversation = {
  id: string;
  participants: string[];
  createdAt: string;
  messages?: SocialMessage[];
  lastMessage?: string;
  updatedAt?: string;
};

export type SocialPresence = {
  email: string;
  online: boolean;
  lastSeen: string;
};

export type SocialMessage = {
  id: string;
  senderEmail: string;
  text: string;
  createdAt: string;
  type?: 'text' | 'image' | 'file';
};

export async function ensureUserProfile(profile: SocialUserProfile) {
  const id = profile.email.replace(/[@.]/g, '_');
  try {
    await saveDocument('users', id, {
      ...profile,
      id,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // fall back to local storage so the user still appears in the friends list
  }

  const existing = readLocalUsers();
  const next = [...existing.filter((item) => item.email !== profile.email), { ...profile, id, updatedAt: new Date().toISOString() }];
  writeLocalUsers(next);
  return id;
}

export function listenUsers(cb: (users: SocialUserProfile[]) => void) {
  const localUsers = readLocalUsers();
  cb(localUsers);
  try {
    return listenCollection('users', (docs) => {
      const remoteUsers = (docs as SocialUserProfile[]).filter(Boolean);
      const merged = [...remoteUsers, ...localUsers.filter((item) => !remoteUsers.some((remote) => remote.email === item.email))];
      cb(merged);
    });
  } catch {
    return () => {};
  }
}

export async function getProfiles() {
  try {
    const users = await getCollection('users');
    return users as SocialUserProfile[];
  } catch {
    return readLocalUsers();
  }
}

export async function createPost(user: AuthUser, content: string, file?: File | null) {
  let imageUrl: string | undefined;
  let videoUrl: string | undefined;

  try {
    if (file) {
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      const publicUrl = await uploadFileToStorage(`posts/${Date.now()}-${file.name}`, file);
      if (type === 'video') {
        videoUrl = publicUrl;
      } else {
        imageUrl = publicUrl;
      }
    }
  } catch {
    // ignore upload errors and keep the post local-only
  }

  const post: SocialPost = {
    id: '',
    authorName: user.name,
    authorEmail: user.email,
    content: content.trim(),
    imageUrl,
    videoUrl,
    createdAt: new Date().toISOString(),
    likes: [],
    comments: [],
    saves: [],
    views: 0,
  };

  try {
    const id = await saveDocument('posts', null, post);
    return { ...post, id } as SocialPost;
  } catch {
    const posts = readLocalCollection<SocialPost>(SOCIAL_POSTS_KEY, []);
    const next = [{ ...post, id: `local-${Date.now()}` }, ...posts];
    writeLocalCollection(SOCIAL_POSTS_KEY, next);
    return next[0];
  }
}

export function listenPosts(cb: (posts: SocialPost[]) => void) {
  const localPosts = readLocalCollection<SocialPost>(SOCIAL_POSTS_KEY, []);
  cb(localPosts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  try {
    return listenCollection('posts', (docs) => {
      const remotePosts = (docs as SocialPost[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const merged = [...remotePosts, ...localPosts.filter((item) => !remotePosts.some((remote) => remote.id === item.id))];
      cb(merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    });
  } catch {
    return () => {};
  }
}

export async function toggleLikePost(postId: string, userEmail: string) {
  try {
    const posts = (await getCollection('posts')) as SocialPost[];
    const target = posts.find((item) => item.id === postId);
    if (!target) return;
    const likes = target.likes ?? [];
    const nextLikes = likes.includes(userEmail) ? likes.filter((value) => value !== userEmail) : [...likes, userEmail];
    await updateDocument('posts', postId, { likes: nextLikes });
    return;
  } catch {
    const posts = readLocalCollection<SocialPost>(SOCIAL_POSTS_KEY, []);
    const target = posts.find((item) => item.id === postId);
    if (!target) return;
    const likes = target.likes ?? [];
    const nextLikes = likes.includes(userEmail) ? likes.filter((value) => value !== userEmail) : [...likes, userEmail];
    const nextPosts = posts.map((item) => item.id === postId ? { ...item, likes: nextLikes } : item);
    writeLocalCollection(SOCIAL_POSTS_KEY, nextPosts);
  }
}

export async function addCommentToPost(postId: string, user: AuthUser, text: string) {
  try {
    const posts = (await getCollection('posts')) as SocialPost[];
    const target = posts.find((item) => item.id === postId);
    if (!target) return;
    const comment: SocialComment = {
      id: `${Date.now()}`,
      authorName: user.name,
      authorEmail: user.email,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    const comments = [...(target.comments ?? []), comment];
    await updateDocument('posts', postId, { comments });
    return;
  } catch {
    const posts = readLocalCollection<SocialPost>(SOCIAL_POSTS_KEY, []);
    const target = posts.find((item) => item.id === postId);
    if (!target) return;
    const comment: SocialComment = {
      id: `${Date.now()}`,
      authorName: user.name,
      authorEmail: user.email,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    const nextPosts = posts.map((item) => item.id === postId ? { ...item, comments: [...(item.comments ?? []), comment] } : item);
    writeLocalCollection(SOCIAL_POSTS_KEY, nextPosts);
  }
}

export async function toggleSavePost(postId: string, userEmail: string) {
  try {
    const posts = (await getCollection('posts')) as SocialPost[];
    const target = posts.find((item) => item.id === postId);
    if (!target) return;
    const saves = target.saves ?? [];
    const nextSaves = saves.includes(userEmail) ? saves.filter((value) => value !== userEmail) : [...saves, userEmail];
    await updateDocument('posts', postId, { saves: nextSaves });
    return;
  } catch {
    const posts = readLocalCollection<SocialPost>(SOCIAL_POSTS_KEY, []);
    const target = posts.find((item) => item.id === postId);
    if (!target) return;
    const saves = target.saves ?? [];
    const nextSaves = saves.includes(userEmail) ? saves.filter((value) => value !== userEmail) : [...saves, userEmail];
    const nextPosts = posts.map((item) => item.id === postId ? { ...item, saves: nextSaves } : item);
    writeLocalCollection(SOCIAL_POSTS_KEY, nextPosts);
  }
}

export async function incrementPostViews(postId: string) {
  try {
    const posts = (await getCollection('posts')) as SocialPost[];
    const target = posts.find((item) => item.id === postId);
    if (!target) return;
    const nextViews = (target.views ?? 0) + 1;
    await updateDocument('posts', postId, { views: nextViews });
    return;
  } catch {
    const posts = readLocalCollection<SocialPost>(SOCIAL_POSTS_KEY, []);
    const target = posts.find((item) => item.id === postId);
    if (!target) return;
    const nextPosts = posts.map((item) => item.id === postId ? { ...item, views: (item.views ?? 0) + 1 } : item);
    writeLocalCollection(SOCIAL_POSTS_KEY, nextPosts);
  }
}

export async function deletePost(postId: string) {
  try {
    await deleteDocument('posts', postId);
    return;
  } catch {
    const posts = readLocalCollection<SocialPost>(SOCIAL_POSTS_KEY, []);
    writeLocalCollection(SOCIAL_POSTS_KEY, posts.filter((item) => item.id !== postId));
  }
}

export async function createReel(user: AuthUser, caption: string, videoFile: File) {
  try {
    const videoUrl = await uploadFileToStorage(`reels/${Date.now()}-${videoFile.name}`, videoFile);
    const reel: SocialReel = {
      id: '',
      authorName: user.name,
      authorEmail: user.email,
      caption: caption.trim(),
      videoUrl,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      views: 0,
    };
    const id = await saveDocument('reels', null, reel);
    return { ...reel, id } as SocialReel;
  } catch {
    const reel: SocialReel = {
      id: `local-reel-${Date.now()}`,
      authorName: user.name,
      authorEmail: user.email,
      caption: caption.trim(),
      videoUrl: '',
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      views: 0,
    };
    const reels = readLocalCollection<SocialReel>(SOCIAL_REELS_KEY, []);
    writeLocalCollection(SOCIAL_REELS_KEY, [reel, ...reels]);
    return reel;
  }
}

export function listenReels(cb: (reels: SocialReel[]) => void) {
  const localReels = readLocalCollection<SocialReel>(SOCIAL_REELS_KEY, []);
  cb(localReels.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  try {
    return listenCollection('reels', (docs) => {
      const remoteReels = (docs as SocialReel[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const merged = [...remoteReels, ...localReels.filter((item) => !remoteReels.some((remote) => remote.id === item.id))];
      cb(merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    });
  } catch {
    return () => {};
  }
}

export async function toggleLikeReel(reelId: string, userEmail: string) {
  const reels = (await getCollection('reels')) as SocialReel[];
  const target = reels.find((item) => item.id === reelId);
  if (!target) return;
  const likes = target.likes ?? [];
  const nextLikes = likes.includes(userEmail) ? likes.filter((value) => value !== userEmail) : [...likes, userEmail];
  await updateDocument('reels', reelId, { likes: nextLikes });
}

export async function incrementReelViews(reelId: string) {
  const reels = (await getCollection('reels')) as SocialReel[];
  const target = reels.find((item) => item.id === reelId);
  if (!target) return;
  const nextViews = (target.views ?? 0) + 1;
  await updateDocument('reels', reelId, { views: nextViews });
}

export async function createConversation(currentUserEmail: string, otherEmail: string) {
  try {
    const conversations = (await getCollection('conversations')) as SocialConversation[];
    const existing = conversations.find((conversation) => {
      const participants = conversation.participants ?? [];
      return participants.includes(currentUserEmail) && participants.includes(otherEmail);
    });
    if (existing) return existing;

    const conversation: SocialConversation = {
      id: `${Date.now()}`,
      participants: [currentUserEmail, otherEmail],
      createdAt: new Date().toISOString(),
      messages: [],
      lastMessage: '',
      updatedAt: new Date().toISOString(),
    };
    await saveDocument('conversations', conversation.id, conversation);
    return conversation;
  } catch {
    const conversations = readLocalCollection<SocialConversation>(SOCIAL_CONVERSATIONS_KEY, []);
    const existing = conversations.find((conversation) => {
      const participants = conversation.participants ?? [];
      return participants.includes(currentUserEmail) && participants.includes(otherEmail);
    });
    if (existing) return existing;
    const conversation: SocialConversation = {
      id: `local-conv-${Date.now()}`,
      participants: [currentUserEmail, otherEmail],
      createdAt: new Date().toISOString(),
      messages: [],
      lastMessage: '',
      updatedAt: new Date().toISOString(),
    };
    writeLocalCollection(SOCIAL_CONVERSATIONS_KEY, [conversation, ...conversations]);
    return conversation;
  }
}

export async function sendMessage(conversationId: string, senderEmail: string, text: string) {
  try {
    const conversations = (await getCollection('conversations')) as SocialConversation[];
    const target = conversations.find((item) => item.id === conversationId);
    if (!target) return;
    const message: SocialMessage = {
      id: `${Date.now()}`,
      senderEmail,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      type: 'text',
    };
    const messages = [...(target.messages ?? []), message];
    await updateDocument('conversations', conversationId, {
      messages,
      lastMessage: text.trim(),
      updatedAt: new Date().toISOString(),
    });
    return;
  } catch {
    const conversations = readLocalCollection<SocialConversation>(SOCIAL_CONVERSATIONS_KEY, []);
    const target = conversations.find((item) => item.id === conversationId);
    if (!target) return;
    const message: SocialMessage = {
      id: `${Date.now()}`,
      senderEmail,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      type: 'text',
    };
    const nextConversations = conversations.map((item) => item.id === conversationId ? { ...item, messages: [...(item.messages ?? []), message], lastMessage: text.trim(), updatedAt: new Date().toISOString() } : item);
    writeLocalCollection(SOCIAL_CONVERSATIONS_KEY, nextConversations);
  }
}

export async function createCallInvite(callerEmail: string, calleeEmail: string) {
  const id = `call-${Date.now()}`;
  await saveDocument('calls', id, {
    id,
    callerEmail,
    calleeEmail,
    status: 'ringing',
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function setPresence(email: string, online: boolean) {
  try {
    await saveDocument('presence', email.replace(/[@.]/g, '_'), {
      email,
      online,
      lastSeen: new Date().toISOString(),
    });
  } catch {
    const presence = readLocalCollection<SocialPresence>(SOCIAL_PRESENCE_KEY, []);
    const next = [...presence.filter((item) => item.email !== email), { email, online, lastSeen: new Date().toISOString() }];
    writeLocalCollection(SOCIAL_PRESENCE_KEY, next);
  }
}

export function listenPresence(cb: (presence: SocialPresence[]) => void) {
  const localPresence = readLocalCollection<SocialPresence>(SOCIAL_PRESENCE_KEY, []);
  cb(localPresence);
  try {
    return listenCollection('presence', (docs) => cb((docs as SocialPresence[]).filter(Boolean)));
  } catch {
    return () => {};
  }
}

export async function createNotification(recipientEmail: string, title: string, body: string) {
  try {
    await saveDocument('notifications', `${Date.now()}_${recipientEmail}`, {
      recipientEmail,
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false,
    });
  } catch {
    const notifications = readLocalCollection<any>(SOCIAL_NOTIFICATIONS_KEY, []);
    writeLocalCollection(SOCIAL_NOTIFICATIONS_KEY, [{ recipientEmail, title, body, createdAt: new Date().toISOString(), read: false }, ...notifications]);
  }
}

export function listenNotifications(recipientEmail: string, cb: (notifications: any[]) => void) {
  const localNotifications = readLocalCollection<any>(SOCIAL_NOTIFICATIONS_KEY, []);
  cb(localNotifications.filter((item) => item.recipientEmail === recipientEmail));
  try {
    return listenCollection('notifications', (docs) => {
      cb((docs as any[]).filter((item) => item.recipientEmail === recipientEmail));
    });
  } catch {
    return () => {};
  }
}

export function listenConversation(conversationId: string, cb: (conversation: SocialConversation | null) => void) {
  const localConversations = readLocalCollection<SocialConversation>(SOCIAL_CONVERSATIONS_KEY, []);
  const localConversation = localConversations.find((item) => item.id === conversationId) ?? null;
  cb(localConversation);
  try {
    return listenDocument('conversations', conversationId, (doc) => cb(doc as SocialConversation));
  } catch {
    return () => {};
  }
}

export function listenConversations(cb: (conversations: SocialConversation[]) => void) {
  const localConversations = readLocalCollection<SocialConversation>(SOCIAL_CONVERSATIONS_KEY, []);
  cb(localConversations.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')));
  try {
    return listenCollection('conversations', (docs) => {
      const conversations = (docs as SocialConversation[]).sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
      cb(conversations);
    });
  } catch {
    return () => {};
  }
}

export async function followUser(currentEmail: string, targetEmail: string) {
  try {
    const follows = (await getCollection('follows')) as Array<any>;
    const alreadyFollowing = follows.some(
      (item: any) => item.followerEmail === currentEmail && item.followingEmail === targetEmail
    );
    if (alreadyFollowing) {
      const match = follows.find((item) => item.followerEmail === currentEmail && item.followingEmail === targetEmail);
      if (match) {
        await deleteDocument('follows', `${match.followerEmail}_${match.followingEmail}`);
      }
      return false;
    }

    await saveDocument('follows', `${currentEmail}_${targetEmail}`, {
      followerEmail: currentEmail,
      followingEmail: targetEmail,
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch {
    const follows = readLocalCollection<any>(SOCIAL_FOLLOWS_KEY, []);
    const alreadyFollowing = follows.some((item: any) => item.followerEmail === currentEmail && item.followingEmail === targetEmail);
    if (alreadyFollowing) {
      writeLocalCollection(SOCIAL_FOLLOWS_KEY, follows.filter((item: any) => !(item.followerEmail === currentEmail && item.followingEmail === targetEmail)));
      return false;
    }
    const next = [...follows, { followerEmail: currentEmail, followingEmail: targetEmail, createdAt: new Date().toISOString() }];
    writeLocalCollection(SOCIAL_FOLLOWS_KEY, next);
    return true;
  }
}

export async function getFollowStatus(currentEmail: string, targetEmail: string) {
  try {
    const follows = (await getCollection('follows')) as Array<any>;
    return follows.some((item: any) => item.followerEmail === currentEmail && item.followingEmail === targetEmail);
  } catch {
    const follows = readLocalCollection<any>(SOCIAL_FOLLOWS_KEY, []);
    return follows.some((item: any) => item.followerEmail === currentEmail && item.followingEmail === targetEmail);
  }
}

export async function searchContent(query: string) {
  try {
    const [users, posts, reels] = await Promise.all([
      getCollection('users'),
      getCollection('posts'),
      getCollection('reels'),
    ]);
    const normalized = query.trim().toLowerCase();
    return {
      users: (users as SocialUserProfile[]).filter((item) => item.name?.toLowerCase().includes(normalized) || item.email?.toLowerCase().includes(normalized)),
      posts: (posts as SocialPost[]).filter((item) => item.content?.toLowerCase().includes(normalized) || item.authorName?.toLowerCase().includes(normalized)),
      reels: (reels as SocialReel[]).filter((item) => item.caption?.toLowerCase().includes(normalized) || item.authorName?.toLowerCase().includes(normalized)),
    };
  } catch {
    const normalized = query.trim().toLowerCase();
    return {
      users: readLocalUsers().filter((item) => item.name?.toLowerCase().includes(normalized) || item.email?.toLowerCase().includes(normalized)),
      posts: readLocalCollection<SocialPost>(SOCIAL_POSTS_KEY, []).filter((item) => item.content?.toLowerCase().includes(normalized) || item.authorName?.toLowerCase().includes(normalized)),
      reels: readLocalCollection<SocialReel>(SOCIAL_REELS_KEY, []).filter((item) => item.caption?.toLowerCase().includes(normalized) || item.authorName?.toLowerCase().includes(normalized)),
    };
  }
}
