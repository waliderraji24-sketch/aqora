import { renderLayout } from './layout.js';
import { initNavigation, renderRoute } from './router.js';
import { initAuthUI } from './auth-ui.js';
import { initPageControllers } from './page-controller.js';
import { onAuthChanged } from '../../Authentication/auth.js';

let shellInitialized = false;
let navigationInitialized = false;

export async function renderApp() {
  const app = document.getElementById('app');

  if (!shellInitialized) {
    app.innerHTML = `
      <div class="app-shell auth-view">
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; color: var(--text-secondary);">
          <div style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 16px; animation: spin 2s linear infinite;">⚡</div>
            <p>Loading AQORA...</p>
          </div>
        </div>
      </div>
    `;
    shellInitialized = true;
  }

  if (!navigationInitialized) {
    renderLayout();
    initNavigation();
    initPageControllers();
    navigationInitialized = true;
  }

  initAuthUI();

  onAuthChanged(async user => {
    const authRoutes = ['login', 'register', 'forgot', 'welcome', 'onboarding'];
    const currentRoute = (location.hash.replace('#', '') || '').trim();
    const showAuthShell = !user || authRoutes.includes(currentRoute);

    if (showAuthShell) {
      app.innerHTML = `
        <div class="app-shell auth-view" id="auth-shell">
          <main class="content" id="main-content" style="width: 100%; padding: 0; background: transparent; box-shadow: none; border: none;"></main>
        </div>
      `;
      const targetRoute = !user && currentRoute && !authRoutes.includes(currentRoute) ? 'login' : (currentRoute || 'login');
      if (!user && currentRoute && !authRoutes.includes(currentRoute)) {
        history.replaceState(null, '', '#login');
      }
      await renderRoute(targetRoute);
      return;
    }

    app.innerHTML = `
      <div class="app-shell" id="authenticated-shell">
        <aside class="sidebar primary" id="primary-sidebar">
          <div class="brand-section">
            <div class="brand">
              <div class="brand-logo">A</div>
              <div class="brand-text">
                <h1>AQORA</h1>
                <p>Minimal social</p>
              </div>
            </div>
          </div>
          <nav class="nav-section">
            <button class="nav-item" data-route="home">
              <span class="nav-icon">🏠</span>
              <span>Home</span>
            </button>
            <button class="nav-item" data-route="friends">
              <span class="nav-icon">👥</span>
              <span>Friends</span>
            </button>
            <button class="nav-item" data-route="reels">
              <span class="nav-icon">🎬</span>
              <span>Reels</span>
            </button>
            <button class="nav-item" data-route="logout" id="logout-btn">
              <span class="nav-icon">🚪</span>
              <span>Logout</span>
            </button>
          </nav>
        </aside>
        
        <main class="content" id="main-content"></main>
      </div>
    `;

    const targetRoute = currentRoute && !authRoutes.includes(currentRoute) ? currentRoute : 'home';
    if (currentRoute && authRoutes.includes(currentRoute)) {
      history.replaceState(null, '', '#home');
    }
    await renderRoute(targetRoute);
  });
}
