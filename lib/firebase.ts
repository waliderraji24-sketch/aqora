import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged as fbOnAuthStateChanged,
  connectAuthEmulator,
} from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc, onSnapshot, updateDoc, arrayUnion, serverTimestamp, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, connectStorageEmulator } from 'firebase/storage';

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

const FALLBACK_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: 'AIzaSyDJDDpkxzTrl9pbzScQy7mRFbO0kWTvhZw',
  authDomain: 'aqora-28595165-beb5f.firebaseapp.com',
  projectId: 'aqora-28595165-beb5f',
  storageBucket: 'aqora-28595165-beb5f.firebasestorage.app',
  messagingSenderId: '168023435195',
  appId: '1:168023435195:web:71362611b25e8219a4869e',
};

function getConfigFromEnv(): FirebaseConfig {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || FALLBACK_FIREBASE_CONFIG.apiKey;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || FALLBACK_FIREBASE_CONFIG.authDomain;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || FALLBACK_FIREBASE_CONFIG.projectId;
  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || FALLBACK_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || FALLBACK_FIREBASE_CONFIG.messagingSenderId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || FALLBACK_FIREBASE_CONFIG.appId,
  };
}

let appInitialized = false;
function initFirebase() {
  if (typeof window === 'undefined') return null;
  if (getApps().length > 0) {
    appInitialized = true;
    return getApps()[0];
  }

  const cfg = getConfigFromEnv();
  const app = initializeApp(cfg);
  // If running with the emulator flag, connect SDK to local emulators
  try {
    const emulatorEnabled =
      typeof window !== 'undefined' &&
      (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' || window.location.hostname === 'localhost');

    if (emulatorEnabled) {
      const db = getFirestore();
      // default emulator ports
      const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || 'localhost';
      const firestorePort = Number(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || '8080');
      connectFirestoreEmulator(db, firestoreHost, firestorePort);

      const storage = getStorage(app);
      const storageHost = process.env.NEXT_PUBLIC_STORAGE_EMULATOR_HOST || 'localhost';
      const storagePort = Number(process.env.NEXT_PUBLIC_STORAGE_EMULATOR_PORT || '9199');
      connectStorageEmulator(storage, storageHost, storagePort);

      const auth = getAuth(app);
      const authUrl = process.env.NEXT_PUBLIC_AUTH_EMULATOR_URL || 'http://localhost:9099';
      connectAuthEmulator(auth, authUrl, { disableWarnings: true });
    }
  } catch (e) {
    // ignore emulator hookup failures
  }
  appInitialized = true;
  return app;
}

export function isFirebaseAvailable() {
  if (typeof window === 'undefined') return false;
  try {
    if (getApps().length > 0) return true;
  } catch {}
  return !!getConfigFromEnv().projectId;
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

export async function updateDocument(collectionName: string, id: string, data: any) {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore not available');
  const ref = doc(db, collectionName, id);
  await setDoc(ref, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function deleteDocument(collectionName: string, id: string) {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore not available');
  await deleteDoc(doc(db, collectionName, id));
}

export async function uploadFileToStorage(path: string, file: File | Blob) {
  if (typeof window === 'undefined') throw new Error('Client only');
  const app = initFirebase();
  if (!app) throw new Error('Firebase not configured');
  const storage = getStorage(app);
  const storageRef = ref(storage, path);
  await uploadBytesResumable(storageRef, file);
  return getDownloadURL(storageRef);
}

