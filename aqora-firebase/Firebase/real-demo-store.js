const STORAGE_KEY = 'aqora-real-demo-store';

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { users: [], reels: [], chats: [] };
  } catch (error) {
    return { users: [], reels: [], chats: [] };
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function registerUser({ email, phone, password, username, displayName }) {
  const store = readStore();
  const existing = store.users.find(user => user.email === email || user.phone === phone);
  if (existing) {
    throw new Error('This phone or email is already registered.');
  }

  const user = {
    id: 'user-' + Date.now(),
    email,
    phone,
    password,
    username,
    displayName,
    createdAt: Date.now()
  };

  store.users.push(user);
  writeStore(store);
  return user;
}

function loginUser(identifier, password) {
  const store = readStore();
  const user = store.users.find(item => (item.email === identifier || item.phone === identifier) && item.password === password);
  if (!user) {
    throw new Error('Invalid phone/email or password.');
  }
  return user;
}

function addReel({ title, description, videoUrl, authorId }) {
  const store = readStore();
  const reel = {
    id: 'reel-' + Date.now(),
    title,
    description,
    videoUrl,
    authorId,
    createdAt: Date.now()
  };

  store.reels.push(reel);
  writeStore(store);
  return reel;
}

function getReels() {
  return readStore().reels;
}

function getUsers() {
  return readStore().users;
}

function sendMessage({ fromUserId, toUserId, text }) {
  const store = readStore();
  const message = {
    id: 'msg-' + Date.now(),
    fromUserId,
    toUserId,
    text,
    createdAt: Date.now()
  };
  store.chats.push(message);
  writeStore(store);
  return message;
}

function getMessages(userA, userB) {
  const store = readStore();
  return store.chats.filter(message =>
    (message.fromUserId === userA && message.toUserId === userB) ||
    (message.fromUserId === userB && message.toUserId === userA)
  );
}

module.exports = {
  registerUser,
  loginUser,
  addReel,
  getReels,
  getUsers,
  sendMessage,
  getMessages
};
