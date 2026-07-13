import { auth } from '../../Firebase/init.js';
import { 
  fetchUserProfile,
  listHomePosts,
  listStories,
  listReels,
  listCommunities,
  listNotifications,
  listSuggestedProfiles,
  listExploreTopics,
  listChatThreads,
  saveOnboardingData
} from '../../Firebase/firestore.js';
import { initOnboarding } from './onboarding.js';

export function initPageControllers() {
  document.addEventListener('route-changed', async event => {
    const { route } = event.detail;
    if (route === 'onboarding') {
      initOnboarding();
      return;
    }

    if (route === 'home') {
      await renderHome();
    }

    if (route === 'friends') {
      await renderFriends();
    }

    if (route === 'profile') {
      await renderProfile();
    }

    if (route === 'messages') {
      await renderMessages();
    }

    if (route === 'reels') {
      await renderReels();
    }

    if (route === 'stories') {
      await renderStories();
    }

    if (route === 'communities') {
      await renderCommunities();
    }

    if (route === 'notifications') {
      await renderNotifications();
    }

    if (route === 'explore') {
      await renderExplore();
    }
  });
}

async function renderHome() {
  const feed = document.getElementById('home-feed');
  if (!feed) return;
  const posts = await listHomePosts();
  feed.innerHTML = `
    <div class="create-post-card">
      <div class="create-post-avatar">A</div>
      <div class="create-post-input">What's on your mind?</div>
    </div>
    <div class="story-row">
      <div class="story-pill active">+ New</div>
      <div class="story-pill">Design</div>
      <div class="story-pill">Tech</div>
      <div class="story-pill">Travel</div>
    </div>
    <div class="feed-stack">
      ${posts.length ? posts.map(postCard).join('') : '<div class="empty-card">No feed content yet. Add your first post.</div>'}
    </div>
  `;
}

function postCard(post) {
  const createdAt = post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just now';
  const initials = (post.authorName || 'AQORA').split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase();
  const tags = post.tags || ['#aqora', '#creator'];
  return `
    <article class="post-card">
      <div class="post-header">
        <div class="post-author-info">
          <div class="avatar">${initials}</div>
          <div class="post-author-details">
            <h4>${post.authorName || 'AQORA Creator'}</h4>
            <p>${createdAt}</p>
          </div>
        </div>
      </div>
      <p class="post-content">${post.content}</p>
      <div class="post-tags">
        ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      <div class="post-stats">
        <span>❤️ ${post.likes || 0}</span>
        <span>💬 ${post.comments || 0}</span>
        <span>🔁 ${post.shares || 0}</span>
      </div>
      <div class="post-actions">
        <button class="post-action-btn">👍 Like</button>
        <button class="post-action-btn">💬 Comment</button>
        <button class="post-action-btn">🔁 Share</button>
      </div>
    </article>
  `;
}

async function renderFriends() {
  const container = document.getElementById('friends-root');
  if (!container) return;
  const people = await listSuggestedProfiles('demo', 6);
  container.innerHTML = `
    <div class="page-card">
      <div class="page-header">
        <div>
          <p class="eyebrow">Community</p>
          <h2>Friends</h2>
          <p class="post-content">Suggested people and creators you may want to follow.</p>
        </div>
      </div>
      <div class="grid-list">
        ${people.map(friendCard).join('')}
      </div>
    </div>
  `;
}

function friendCard(person) {
  const initials = (person.displayName || 'User').split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase();
  return `
    <article class="friend-card card">
      <div class="friend-top">
        <div class="avatar">${initials}</div>
        <div>
          <h3>${person.displayName || 'Suggested User'}</h3>
          <p>${person.username ? '@' + person.username : 'Creator'}</p>
        </div>
      </div>
      <p class="post-content">${person.followers || 0} followers · New on AQORA</p>
      <div class="post-actions">
        <button class="button button-primary">Follow</button>
        <button class="button button-ghost">Message</button>
      </div>
    </article>
  `;
}

async function renderProfile() {
  const profile = document.getElementById('profile-root');
  if (!profile) return;
  const user = auth.currentUser;
  if (!user) {
    profile.innerHTML = '<div class="empty-card">Please login to view your profile.</div>';
    return;
  }
  const data = await fetchUserProfile(user.uid);
  if (!data) {
    profile.innerHTML = '<div class="empty-card">Profile data is missing. Complete onboarding.</div>';
    return;
  }

  profile.innerHTML = `
    <div class="profile-header">
      <div>
        <div class="avatar avatar-xxl">${data.username ? data.username.slice(0,1).toUpperCase() : 'U'}</div>
        <div>
          <h2>${data.username || 'AQORA User'}</h2>
          <p class="muted">${data.profession || 'Creator'} · ${data.followers || 0} followers</p>
        </div>
      </div>
      <button class="button button-primary" id="profile-edit">Edit profile</button>
    </div>
    <div class="profile-bio">${data.bio || 'Welcome to AQORA profile.'}</div>
    <div class="profile-stats">
      <div><span>${data.postsCount || 0}</span> Posts</div>
      <div><span>${data.reelsCount || 0}</span> Reels</div>
      <div><span>${data.likesCount || 0}</span> Likes</div>
    </div>
  `;
}

async function renderMessages() {
  const container = document.getElementById('messages-root');
  if (!container) return;
  const user = auth.currentUser;
  if (!user) {
    container.innerHTML = '<div class="empty-card">Login to open your chats.</div>';
    return;
  }
  const threads = await listChatThreads(user.uid);
  container.innerHTML = threads.length ? threads.map(threadCard).join('') : '<div class="empty-card">No messages yet. Start a conversation.</div>';
}

function threadCard(thread) {
  return `
    <div class="chat-item">
      <div class="avatar">${thread.title?.charAt(0).toUpperCase() || 'C'}</div>
      <div>
        <p class="chat-name">${thread.title || 'Chat thread'}</p>
        <p class="chat-preview">${thread.lastMessage || 'No messages yet.'}</p>
      </div>
      <span class="chat-time">${new Date(thread.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  `;
}

async function renderReels() {
  const container = document.getElementById('reels-root');
  if (!container) return;
  const reels = await listReels();
  container.innerHTML = reels.length ? reels.map(reelCard).join('') : '<div class="empty-card">No reels found. Upload your first short.</div>';
}

function reelCard(reel) {
  const createdAt = reel.createdAt ? new Date(reel.createdAt).toLocaleDateString() : 'Today';
  return `
    <article class="reel-card">
      <div class="reel-thumb" style="background:${reel.gradient || 'linear-gradient(135deg, var(--accent), var(--info))'}"></div>
      <div class="reel-meta">
        <h3>${reel.title || 'New reel'}</h3>
        <p>${reel.views || 0} views · ${createdAt}</p>
        <p class="post-content">${reel.description || 'A fresh short-form story from the AQORA community.'}</p>
      </div>
    </article>
  `;
}

async function renderStories() {
  const container = document.getElementById('stories-root');
  if (!container) return;
  const stories = await listStories();
  container.innerHTML = stories.length ? stories.map(storyCard).join('') : '<div class="empty-card">No stories available. Share your moment.</div>';
}

function storyCard(story) {
  return `
    <div class="story-item">
      <span>${story.title || 'Story'}</span>
    </div>
  `;
}

async function renderCommunities() {
  const container = document.getElementById('communities-root');
  if (!container) return;
  const communities = await listCommunities();
  container.innerHTML = communities.length ? communities.map(communityCard).join('') : '<div class="empty-card">No communities yet. Explore new groups.</div>';
}

function communityCard(community) {
  return `
    <article class="community-card">
      <h3>${community.name || 'Community'}</h3>
      <p>${community.members || 0} members · ${community.topic || 'General'}</p>
    </article>
  `;
}

async function renderNotifications() {
  const container = document.getElementById('notifications-root');
  if (!container) return;
  const user = auth.currentUser;
  if (!user) {
    container.innerHTML = '<div class="empty-card">Login to see notifications.</div>';
    return;
  }
  const notifications = await listNotifications(user.uid);
  container.innerHTML = notifications.length ? notifications.map(notificationCard).join('') : '<div class="empty-card">No notifications yet.</div>';
}

function notificationCard(note) {
  return `
    <div class="notification-item">
      <p><strong>${note.title}</strong> ${note.message}</p>
      <span>${new Date(note.createdAt).toLocaleString()}</span>
    </div>
  `;
}

async function renderExplore() {
  const container = document.getElementById('explore-root');
  if (!container) return;
  const topics = await listExploreTopics();
  container.innerHTML = topics.length ? topics.map(topicCard).join('') : '<div class="empty-card">Nothing trending yet.</div>';
}

function topicCard(topic) {
  return `
    <article class="community-card">
      <h3>${topic.title || 'Trending'}</h3>
      <p>${topic.description || ''}</p>
    </article>
  `;
}
