import './modules/ui.js';
import { renderApp } from './modules/app.js';
import { validateFirebaseConfig, showFirebaseConfigError } from '../Firebase/validator.js';
import { initDemoAuth } from '../Firebase/demo-auth.js';

// Check Firebase configuration before starting app
const configValidation = validateFirebaseConfig();

if (configValidation.isDemoMode) {
  // Initialize demo mode automatically
  console.log('🎬 DEMO MODE ENABLED - Using mock data instead of Firebase');
  initDemoAuth();
  renderApp();
} else if (!configValidation.isValid) {
  showFirebaseConfigError(configValidation.missing);
} else {
  renderApp();
}
