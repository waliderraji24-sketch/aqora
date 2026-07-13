import { firebaseConfig } from '../Firebase/config.js';
import { demoLogin, demoRegister, demoLogout, onDemoAuthChanged } from '../Firebase/demo-auth.js';

// Check if Firebase is properly configured
const isFirebaseConfigured = firebaseConfig && 
  firebaseConfig.apiKey && 
  !firebaseConfig.apiKey.startsWith('<') && 
  !firebaseConfig.apiKey.includes('YOUR_');

let auth = null;
let onAuthStateChanged = null;
let signInWithEmailAndPassword = null;
let createUserWithEmailAndPassword = null;
let signOut = null;
let sendPasswordResetEmail = null;
let GoogleAuthProvider = null;
let signInWithPopup = null;

// Initialize based on Firebase availability
if (isFirebaseConfigured) {
  // Use real Firebase
  const firebaseModule = await import('../Firebase/init.js');
  auth = firebaseModule.auth;
  const authModule = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
  onAuthStateChanged = authModule.onAuthStateChanged;
  signInWithEmailAndPassword = authModule.signInWithEmailAndPassword;
  createUserWithEmailAndPassword = authModule.createUserWithEmailAndPassword;
  signOut = authModule.signOut;
  sendPasswordResetEmail = authModule.sendPasswordResetEmail;
  GoogleAuthProvider = authModule.GoogleAuthProvider;
  signInWithPopup = authModule.signInWithPopup;
}

// Export auth functions that work with both Firebase and Demo Mode
export async function register(email, password) {
  if (isFirebaseConfigured) {
    return createUserWithEmailAndPassword(auth, email, password);
  } else {
    return demoRegister(email, password);
  }
}

export async function login(email, password) {
  if (isFirebaseConfigured) {
    return signInWithEmailAndPassword(auth, email, password);
  } else {
    return demoLogin(email, password);
  }
}

export async function googleLogin() {
  if (isFirebaseConfigured) {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  } else {
    // In demo mode, just login with demo user
    return demoLogin('demo@aqora.com', 'demo123');
  }
}

export async function logout() {
  if (isFirebaseConfigured) {
    return signOut(auth);
  } else {
    return demoLogout();
  }
}

export async function resetPassword(email) {
  if (isFirebaseConfigured) {
    return sendPasswordResetEmail(auth, email);
  } else {
    // In demo mode, just resolve
    return Promise.resolve();
  }
}

export function onAuthChanged(callback) {
  if (isFirebaseConfigured) {
    return onAuthStateChanged(auth, callback);
  } else {
    return onDemoAuthChanged(callback);
  }
}
