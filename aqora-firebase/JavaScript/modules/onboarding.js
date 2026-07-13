import { auth } from '../../Firebase/init.js';
import { saveOnboardingData, fetchUserProfile } from '../../Firebase/firestore.js';
import { renderRoute } from './router.js';

export function initOnboarding() {
  const onboardingForm = document.getElementById('onboarding-form');
  if (!onboardingForm || onboardingForm.dataset.bound === 'true') return;

  onboardingForm.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(onboardingForm);
    const displayName = formData.get('displayName');
    const profession = formData.get('profession');
    const interests = formData.get('interests');
    const bio = formData.get('bio');
    const user = auth.currentUser;

    if (!user) {
      showOnboardingError('Please login again to complete onboarding.');
      return;
    }

    try {
      const profile = await fetchUserProfile(user.uid);
      const payload = {
        username: displayName,
        displayName,
        profession,
        interests,
        bio,
        completedOnboarding: true,
        updatedAt: Date.now(),
        email: user.email
      };

      if (profile && profile.createdAt) {
        payload.createdAt = profile.createdAt;
      }

      await saveOnboardingData(user.uid, payload);
      await renderRoute('home');
    } catch (error) {
      showOnboardingError(error.message || 'Could not save onboarding details.');
    }
  });

  onboardingForm.dataset.bound = 'true';
}

function showOnboardingError(message) {
  const errorContainer = document.querySelector('.auth-error');
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
  }
}
