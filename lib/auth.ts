export type AuthUser = {
  name: string;
  email: string;
  joinedAt: string;
};

export type StoredUser = AuthUser & {
  password: string;
  phone?: string;
  bio?: string;
};

const USERS_KEY = 'aqoraUsers';
const SESSION_KEY = 'aqoraSession';

export function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

export function saveStoredUsers(users: StoredUser[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function saveSession(user: AuthUser, token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
  localStorage.setItem('token', token);
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('token');
}

export function getSession(): { user: AuthUser; token: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { user: AuthUser; token: string };
  } catch {
    return null;
  }
}

export function getStoredUser(email: string): StoredUser | null {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  return users.find((user) => user.email === normalizedEmail) ?? null;
}

export function updateUserProfile(
  email: string,
  updates: Partial<Pick<StoredUser, 'name' | 'phone' | 'bio'>>
): StoredUser {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  let updatedUser: StoredUser | null = null;

  const updatedUsers = users.map((user) => {
    if (user.email !== normalizedEmail) return user;
    updatedUser = {
      ...user,
      ...updates,
    };
    return updatedUser;
  });

  if (!updatedUser) {
    throw new Error('المستخدم غير موجود');
  }

  saveStoredUsers(updatedUsers);
  return updatedUser;
}

export function registerUser(name: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password.trim() || !name.trim()) {
    throw new Error('جميع الحقول مطلوبة');
  }

  const users = getStoredUsers();
  const existing = users.find((user) => user.email === normalizedEmail);
  if (existing) {
    throw new Error('هذا البريد مستخدم بالفعل');
  }

  const newUser: StoredUser = {
    name: name.trim(),
    email: normalizedEmail,
    password: password.trim(),
    joinedAt: new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };

  users.push(newUser);
  saveStoredUsers(users);

  return {
    user: {
      name: newUser.name,
      email: newUser.email,
      joinedAt: newUser.joinedAt,
    },
    token: `aqora-token-${Date.now()}`,
  };
}

export function loginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password.trim()) {
    throw new Error('جميع الحقول مطلوبة');
  }

  const users = getStoredUsers();
  const matched = users.find(
    (user) => user.email === normalizedEmail && user.password === password.trim()
  );

  if (!matched) {
    throw new Error('البريد أو كلمة المرور غير صحيحة');
  }

  return {
    user: {
      name: matched.name,
      email: matched.email,
      joinedAt: matched.joinedAt,
    },
    token: `aqora-token-${Date.now()}`,
  };
}
