import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged as fbOnAuthStateChanged,
} from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { getDoc, onSnapshot, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

function getConfigFromEnv(): FirebaseConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !authDomain || !projectId) return null;
  return { apiKey, authDomain, projectId, storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID };
}

let appInitialized = false;
function initFirebase() {
  if (typeof window === 'undefined') return null;
  if (getApps().length > 0) {
    appInitialized = true;
    return getApps()[0];
  }

  const cfg = getConfigFromEnv();
  if (!cfg) return null;

  const app = initializeApp(cfg);
  appInitialized = true;
  return app;
}

export function isFirebaseAvailable() {
  if (typeof window === 'undefined') return false;
  try {
    if (getApps().length > 0) return true;
  } catch {}
  return !!getConfigFromEnv();
}

export async function signInWithGoogle() {
  if (typeof window === 'undefined') throw new Error('Client only');
  const app = initFirebase();
  if (!app) throw new Error('Firebase not configured');
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const token = await user.getIdToken();
  return {
    user: {
      name: user.displayName ?? user.email?.split('@')[0] ?? 'مستخدم',
      email: user.email ?? '',
      joinedAt: user.metadata.creationTime ?? new Date().toLocaleDateString('ar-EG'),
    },
    token,
  };
}

export async function signUpWithEmail(email: string, password: string) {
  if (typeof window === 'undefined') throw new Error('Client only');
  const app = initFirebase();
  if (!app) throw new Error('Firebase not configured');
  const auth = getAuth();
  const res = await createUserWithEmailAndPassword(auth, email, password);
  const user = res.user;
  const token = await user.getIdToken();
  return {
    user: {
      name: user.email?.split('@')[0] ?? 'مستخدم',
      email: user.email ?? '',
      joinedAt: user.metadata.creationTime ?? new Date().toLocaleDateString('ar-EG'),
    },
    token,
  };
}

export async function signInWithEmailPassword(email: string, password: string) {
  if (typeof window === 'undefined') throw new Error('Client only');
  const app = initFirebase();
  if (!app) throw new Error('Firebase not configured');
  const auth = getAuth();
  const res = await signInWithEmailAndPassword(auth, email, password);
  const user = res.user;
  const token = await user.getIdToken();
  return {
    user: {
      name: user.displayName ?? user.email?.split('@')[0] ?? 'مستخدم',
      email: user.email ?? '',
      joinedAt: user.metadata.creationTime ?? new Date().toLocaleDateString('ar-EG'),
    },
    token,
  };
}

export function onAuthStateChanged(cb: (u: any) => void) {
  if (typeof window === 'undefined') return () => {};
  const app = initFirebase();
  if (!app) return () => {};
  const auth = getAuth();
  return fbOnAuthStateChanged(auth, (user) => {
    if (!user) return cb(null);
    cb({ name: user.displayName ?? user.email?.split('@')[0] ?? 'مستخدم', email: user.email, joinedAt: user.metadata.creationTime });
  });
}

export async function signOutFirebase() {
  if (typeof window === 'undefined') return;
  const auth = getAuth();
  await fbSignOut(auth);
}

export function getFirestoreClient() {
  if (typeof window === 'undefined') return null;
  const app = initFirebase();
  if (!app) return null;
  return getFirestore();
}

export async function savePostToFirestore(collectionName: string, data: any) {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore not available');
  const ref = collection(db, collectionName);
  const docRef = await addDoc(ref, data);
  return docRef.id;
}

export async function getCollection(collectionName: string) {
  const db = getFirestoreClient();
  if (!db) return [];
  const q = collection(db, collectionName);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveDocument(collectionName: string, id: string | null, data: any) {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore not available');
  if (id) {
    const ref = doc(db, collectionName, id);
    await setDoc(ref, { ...data }, { merge: true });
    return id;
  }
  const ref = collection(db, collectionName);
  const added = await addDoc(ref, data);
  return added.id;
}

export function listenDocument(collectionName: string, id: string, cb: (val: any) => void) {
  const db = getFirestoreClient();
  if (!db) return () => {};
  const ref = doc(db, collectionName, id);
  const unsub = onSnapshot(ref, (snap) => {
    cb({ id: snap.id, ...snap.data() });
  });
  return unsub;
}

export function listenCollection(collectionName: string, cb: (items: any[]) => void) {
  const db = getFirestoreClient();
  if (!db) return () => {};
  const q = collection(db, collectionName);
  const unsub = onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(docs);
  });
  return unsub;
}

export async function appendToArrayField(collectionName: string, id: string, field: string, value: any) {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore not available');
  const ref = doc(db, collectionName, id);
  await updateDoc(ref, { [field]: arrayUnion(value), updatedAt: serverTimestamp() });
}

