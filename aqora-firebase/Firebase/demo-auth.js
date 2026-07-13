// Demo authentication for testing without Firebase
import { demoUsers } from './demo-data.js';

let currentDemoUser = null;
let authStateCallbacks = [];

export function initDemoAuth() {
  // Check if user was previously logged in
  const savedUser = localStorage.getItem('demo-user');
  if (savedUser) {
    currentDemoUser = JSON.parse(savedUser);
    notifyAuthStateChange();
  }
}

export function demoLogin(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = demoUsers[email];
      
      if (user && (password === user.password || password === 'demo123')) {
        currentDemoUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        };
        localStorage.setItem('demo-user', JSON.stringify(currentDemoUser));
        notifyAuthStateChange();
        
        resolve({
          user: currentDemoUser
        });
      } else {
        reject(new Error('Invalid email or password. Try demo@aqora.com / demo123 or test@aqora.com / test123'));
      }
    }, 500); // Simulate network delay
  });
}

export function demoRegister(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Allow any registration in demo mode
      const newUser = {
        uid: 'demo-user-' + Date.now(),
        email,
        displayName: email.split('@')[0],
        username: email.split('@')[0],
        bio: '',
        profession: '',
        interests: [],
        followers: 0,
        following: 0,
        completedOnboarding: false
      };
      
      currentDemoUser = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName
      };
      
      localStorage.setItem('demo-user', JSON.stringify(currentDemoUser));
      localStorage.setItem('demo-user-profile', JSON.stringify(newUser));
      notifyAuthStateChange();
      
      resolve({
        user: currentDemoUser
      });
    }, 500);
  });
}

export function demoLogout() {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentDemoUser = null;
      localStorage.removeItem('demo-user');
      notifyAuthStateChange();
      resolve();
    }, 300);
  });
}

export function getCurrentDemoUser() {
  return currentDemoUser;
}

export function onDemoAuthChanged(callback) {
  authStateCallbacks.push(callback);
  
  // Immediately call with current state
  setTimeout(() => {
    callback(currentDemoUser);
  }, 0);
  
  // Return unsubscribe function
  return () => {
    authStateCallbacks = authStateCallbacks.filter(cb => cb !== callback);
  };
}

export function getDemoUserProfile() {
  if (!currentDemoUser) return null;
  
  const savedProfile = localStorage.getItem('demo-user-profile');
  if (savedProfile) {
    return JSON.parse(savedProfile);
  }
  
  return demoUsers[currentDemoUser.email] || null;
}

export function updateDemoUserProfile(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const profile = getDemoUserProfile() || {
        uid: currentDemoUser.uid,
        email: currentDemoUser.email,
        displayName: currentDemoUser.displayName
      };
      
      const updated = { ...profile, ...data };
      localStorage.setItem('demo-user-profile', JSON.stringify(updated));
      
      resolve(updated);
    }, 300);
  });
}

function notifyAuthStateChange() {
  authStateCallbacks.forEach(callback => {
    callback(currentDemoUser);
  });
}
