import { login, register, googleLogin, logout, resetPassword } from '../../Authentication/auth.js';
import { renderRoute } from './router.js';
import { createUserProfile, fetchUserProfile } from '../../Firebase/firestore.js';

let authHandlersInitialized = false;

export function initAuthUI() {
  if (authHandlersInitialized) return;

  document.addEventListener('route-changed', setupAuthHandlers);
  setupAuthHandlers();
  authHandlersInitialized = true;
}

function setupAuthHandlers() {
  const loginForm = document.getElementById('login-form');
  if (loginForm && loginForm.dataset.bound !== 'true') {
    loginForm.addEventListener('submit', async event => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const email = formData.get('email');
      const password = formData.get('password');
      try {
        const userCredential = await login(email, password);
        await redirectAfterAuth(userCredential.user);
      } catch (error) {
        showAuthError(error.message);
      }
    });
    loginForm.dataset.bound = 'true';
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm && registerForm.dataset.bound !== 'true') {
    registerForm.addEventListener('submit', async event => {
      event.preventDefault();
      const formData = new FormData(registerForm);
      const email = formData.get('email');
      const password = formData.get('password');
      const username = formData.get('username');
      try {
        const userCredential = await register(email, password);
        const user = userCredential.user;
        await createUserProfile(user.uid, {
          username,
          email,
          createdAt: Date.now(),
          completedOnboarding: false
        });
        await renderRoute('onboarding');
      } catch (error) {
        showAuthError(error.message);
      }
    });
    registerForm.dataset.bound = 'true';
  }

  const googleButtons = document.querySelectorAll('#google-login, #google-register');
  googleButtons.forEach(button => {
    if (button.dataset.bound === 'true') return;
    button.addEventListener('click', async () => {
      try {
        const userCredential = await googleLogin();
        const user = userCredential.user;
        const profile = await fetchUserProfile(user.uid);
        if (!profile) {
          await createUserProfile(user.uid, {
            username: user.displayName || 'Creator',
            email: user.email,
            createdAt: Date.now(),
            completedOnboarding: false
          });
          await renderRoute('onboarding');
          return;
        }

        if (!profile.completedOnboarding) {
          await renderRoute('onboarding');
          return;
        }

        await renderRoute('home');
      } catch (error) {
        showAuthError(error.message);
      }
    });
    button.dataset.bound = 'true';
  });

  const logoutButton = document.getElementById('logout-button');
  if (logoutButton && logoutButton.dataset.bound !== 'true') {
    logoutButton.addEventListener('click', async () => {
      await logout();
      await renderRoute('login');
    });
    logoutButton.dataset.bound = 'true';
  }

  const forgotPasswordLink = document.getElementById('forgot-password');
  if (forgotPasswordLink && forgotPasswordLink.dataset.bound !== 'true') {
    forgotPasswordLink.addEventListener('click', async event => {
      event.preventDefault();
      history.pushState(null, '', '#forgot');
      await renderRoute('forgot');
    });
    forgotPasswordLink.dataset.bound = 'true';
  }

  const resetForm = document.getElementById('reset-form');
  if (resetForm && resetForm.dataset.bound !== 'true') {
    resetForm.addEventListener('submit', async event => {
      event.preventDefault();
      const email = new FormData(resetForm).get('email');
      try {
        await resetPassword(email);
        showAuthInfo('Password reset email sent.');
      } catch (error) {
        showAuthError(error.message);
      }
    });
    resetForm.dataset.bound = 'true';
  }
}

async function redirectAfterAuth(user) {
  if (!user) {
    await renderRoute('login');
    return;
  }

  const profile = await fetchUserProfile(user.uid);
  if (!profile || !profile.completedOnboarding) {
    await renderRoute('onboarding');
    return;
  }

  await renderRoute('home');
}

function showAuthError(message) {
  const errorContainer = document.querySelector('.auth-error');
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
  }
}

function showAuthInfo(message) {
  const infoContainer = document.querySelector('.auth-info');
  if (infoContainer) {
    infoContainer.textContent = message;
    infoContainer.style.display = 'block';
  }
}
