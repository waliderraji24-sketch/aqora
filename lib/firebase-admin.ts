import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let adminApp: ReturnType<typeof initializeApp> | null = null;

export function getFirebaseAdminApp() {
  if (typeof window !== 'undefined') return null;
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  try {
    adminApp = initializeApp({
      credential: applicationDefault(),
    });
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
    return null;
  }

  return adminApp;
}

export async function verifyFirebaseToken(token: string | null | undefined) {
  if (!token) return null;
  try {
    const app = getFirebaseAdminApp();
    if (!app) return null;
    const decodedToken = await getAuth(app).verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email ?? '',
      name: decodedToken.name ?? decodedToken.email?.split('@')[0] ?? 'مستخدم',
    };
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return null;
  }
}
