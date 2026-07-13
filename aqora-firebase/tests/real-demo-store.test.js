const test = require('node:test');
const assert = require('node:assert/strict');
const { registerUser, loginUser, addReel, getReels } = require('../Firebase/real-demo-store.js');

test('registerUser stores a phone-based account', () => {
  const user = registerUser({
    email: 'tester@example.com',
    phone: '+966500000001',
    password: 'password123',
    username: 'tester',
    displayName: 'Tester One'
  });

  assert.ok(user);
  assert.equal(user.phone, '+966500000001');
  assert.equal(user.username, 'tester');
});

test('loginUser works with phone or email', () => {
  const user = loginUser('+966500000001', 'password123');
  assert.ok(user);
  assert.equal(user.email, 'tester@example.com');
});

test('addReel and getReels persist reel data', () => {
  const reel = addReel({
    title: 'Demo Reel',
    description: 'Uploaded from the app',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    authorId: 'demo-user-1'
  });

  const reels = getReels();
  assert.ok(reels.some(item => item.id === reel.id));
});
