import { firebaseConfig } from './config.js';
import { getDemoUserProfile, updateDemoUserProfile } from './demo-auth.js';
import { demoPosts, demoStories, demoReels, demoCommunities, demoNotifications, demoMessages } from './demo-data.js';

// Check if Firebase is properly configured
const isFirebaseConfigured = firebaseConfig && 
  firebaseConfig.apiKey && 
  !firebaseConfig.apiKey.startsWith('<') && 
  !firebaseConfig.apiKey.includes('YOUR_');

// Import Firebase modules only if configured
let db = null;
let firebaseGetDoc = null;
let firebaseSetDoc = null;
let firebaseDoc = null;
let firebaseCollection = null;
let firebaseQuery = null;
let firebaseGetDocs = null;
let firebaseOrderBy = null;
let firebaseLimit = null;

if (isFirebaseConfigured) {
  // Import Firebase modules
  import('./init.js').then(module => {
    db = module.db;
  });
  
  import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js').then(module => {
    firebaseGetDoc = module.getDoc;
    firebaseSetDoc = module.setDoc;
    firebaseDoc = module.doc;
    firebaseCollection = module.collection;
    firebaseQuery = module.query;
    firebaseGetDocs = module.getDocs;
    firebaseOrderBy = module.orderBy;
    firebaseLimit = module.limit;
  });
}

// User Management
export async function createUserProfile(uid, data) {
  if (isFirebaseConfigured) {
    const profileRef = firebaseDoc(db, 'users', uid);
    await firebaseSetDoc(profileRef, data, { merge: true });
  } else {
    // Demo mode - save to localStorage
    localStorage.setItem('demo-user-profile', JSON.stringify({
      uid,
      ...data
    }));
  }
}

export async function fetchUserProfile(uid) {
  if (isFirebaseConfigured) {
    const profileRef = firebaseDoc(db, 'users', uid);
    const snapshot = await firebaseGetDoc(profileRef);
    return snapshot.exists() ? snapshot.data() : null;
  } else {
    // Demo mode - get from localStorage
    return getDemoUserProfile();
  }
}

export async function saveOnboardingData(uid, data) {
  if (isFirebaseConfigured) {
    const profileRef = firebaseDoc(db, 'users', uid);
    await firebaseSetDoc(profileRef, data, { merge: true });
  } else {
    // Demo mode
    return updateDemoUserProfile(data);
  }
}

// Posts
export async function listHomePosts(limitSize = 12) {
  if (isFirebaseConfigured) {
    const postsRef = firebaseCollection(db, 'posts');
    const q = firebaseQuery(postsRef, firebaseOrderBy('createdAt', 'desc'), firebaseLimit(limitSize));
    const snapshot = await firebaseGetDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    // Demo mode - return demo posts
    return demoPosts;
  }
}

export async function createPost(userId, content) {
  if (isFirebaseConfigured) {
    const postsRef = firebaseCollection(db, 'posts');
    return firebaseAddDoc(postsRef, {
      content,
      userId,
      createdAt: new Date()
    });
  } else {
    // Demo mode
    return Promise.resolve({ id: 'post-' + Date.now() });
  }
}

// Stories
export async function listStories(limitSize = 12) {
  if (isFirebaseConfigured) {
    const storiesRef = firebaseCollection(db, 'stories');
    const q = firebaseQuery(storiesRef, firebaseOrderBy('createdAt', 'desc'), firebaseLimit(limitSize));
    const snapshot = await firebaseGetDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    // Demo mode
    return demoStories;
  }
}

// Reels
export async function listReels(limitSize = 12) {
  if (isFirebaseConfigured) {
    const reelsRef = firebaseCollection(db, 'reels');
    const q = firebaseQuery(reelsRef, firebaseOrderBy('createdAt', 'desc'), firebaseLimit(limitSize));
    const snapshot = await firebaseGetDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    // Demo mode
    return demoReels;
  }
}

// Communities
export async function listCommunities(limitSize = 12) {
  if (isFirebaseConfigured) {
    const commRef = firebaseCollection(db, 'communities');
    const q = firebaseQuery(commRef, firebaseOrderBy('members', 'desc'), firebaseLimit(limitSize));
    const snapshot = await firebaseGetDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    // Demo mode
    return demoCommunities;
  }
}

// Notifications
export async function listNotifications(userId, limitSize = 12) {
  if (!userId) return [];
  
  if (isFirebaseConfigured) {
    const notificationsRef = firebaseCollection(db, 'notifications');
    const q = firebaseQuery(notificationsRef, firebaseOrderBy('timestamp', 'desc'), firebaseLimit(limitSize));
    const snapshot = await firebaseGetDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    // Demo mode
    return demoNotifications;
  }
}

// Messages & Chat
export async function listChatThreads(userId, limitSize = 20) {
  if (!userId) return [];
  
  if (isFirebaseConfigured) {
    const threadsRef = firebaseCollection(db, 'threads');
    const q = firebaseQuery(threadsRef, firebaseOrderBy('lastMessageTime', 'desc'), firebaseLimit(limitSize));
    const snapshot = await firebaseGetDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    // Demo mode
    return demoMessages;
  }
}

export async function sendMessage(threadId, userId, message) {
  if (isFirebaseConfigured) {
    const messagesRef = firebaseCollection(db, 'threads', threadId, 'messages');
    return firebaseAddDoc(messagesRef, {
      sender: userId,
      text: message,
      timestamp: new Date()
    });
  } else {
    // Demo mode
    return Promise.resolve({ id: 'msg-' + Date.now() });
  }
}

// Explore Topics
export async function listExploreTopics(limitSize = 20) {
  if (isFirebaseConfigured) {
    const topicsRef = firebaseCollection(db, 'topics');
    const q = firebaseQuery(topicsRef, firebaseOrderBy('trendingScore', 'desc'), firebaseLimit(limitSize));
    const snapshot = await firebaseGetDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    // Demo mode - return static topics
    return [
      { id: '1', name: '#Design', posts: 24523 },
      { id: '2', name: '#Technology', posts: 18945 },
      { id: '3', name: '#Creators', posts: 15432 },
      { id: '4', name: '#Innovation', posts: 12890 },
      { id: '5', name: '#Community', posts: 10234 }
    ];
  }
}

// Suggested Profiles
export async function listSuggestedProfiles(userId, limitSize = 5) {
  if (isFirebaseConfigured) {
    const usersRef = firebaseCollection(db, 'users');
    const q = firebaseQuery(usersRef, firebaseOrderBy('followers', 'desc'), firebaseLimit(limitSize));
    const snapshot = await firebaseGetDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    // Demo mode - return suggested creators
    return [
      { id: '1', displayName: 'Sarah Williams', username: 'sarahwilliams', followers: 8934, avatar: 'SW' },
      { id: '2', displayName: 'Mike Johnson', username: 'mikejohnson', followers: 5623, avatar: 'MJ' },
      { id: '3', displayName: 'Emma Davis', username: 'emmadavis', followers: 4321, avatar: 'ED' },
      { id: '4', displayName: 'John Brown', username: 'johnbrown', followers: 3876, avatar: 'JB' },
      { id: '5', displayName: 'Lisa Chen', username: 'lisachen', followers: 3245, avatar: 'LC' }
    ];
  }
}
