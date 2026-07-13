import { logout } from '../../Authentication/auth.js';

const routes = {
  welcome: 'Pages/welcome.html',
  login: 'Pages/login.html',
  register: 'Pages/register.html',
  forgot: 'Pages/forgot.html',
  onboarding: 'Pages/onboarding.html',
  home: 'Pages/home.html',
  friends: 'Pages/friends.html',
  explore: 'Pages/explore.html',
  reels: 'Pages/reels.html',
  stories: 'Pages/stories.html',
  communities: 'Pages/communities.html',
  notifications: 'Pages/notifications.html',
  profile: 'Pages/profile.html',
  messages: 'Pages/messages.html'
};

export async function renderRoute(route = 'welcome') {
  const container = document.getElementById('main-content');
  const target = routes[route] || routes['welcome'];
  const response = await fetch(target);
  container.innerHTML = await response.text();

  document.querySelectorAll('[data-route]').forEach(button => {
    button.classList.toggle('active', button.dataset.route === route);
  });

  document.dispatchEvent(new CustomEvent('route-changed', { detail: { route } }));
}

let navigationInitialized = false;

export function initNavigation() {
  if (navigationInitialized) return;

  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-route]');
    if (!button) return;
    event.preventDefault();
    const route = button.dataset.route;

    if (route === 'logout') {
      try {
        await logout();
      } catch (_) {
        // Ignore logout errors in demo mode
      }
      history.replaceState(null, '', '#login');
      await renderRoute('login');
      return;
    }

    history.pushState({ route }, '', `#${route}`);
    await renderRoute(route);
  });

  window.addEventListener('popstate', async () => {
    const route = location.hash.replace('#', '') || 'welcome';
    await renderRoute(route);
  });

  navigationInitialized = true;
}
