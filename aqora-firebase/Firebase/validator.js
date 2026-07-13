import { firebaseConfig } from './config.js';

const DEMO_MODE = true; // Enable demo mode automatically when Firebase is not configured

export function validateFirebaseConfig() {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = [];
  
  for (const key of required) {
    if (!firebaseConfig[key] || firebaseConfig[key].startsWith('<') || firebaseConfig[key].includes('YOUR_')) {
      missing.push(key);
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    isDemoMode: DEMO_MODE && missing.length > 0
  };
}

export function showFirebaseConfigError(missing) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #050816 0%, #0a0f1f 50%, #0e1223 100%);
    ">
      <div style="
        max-width: 600px;
        background: rgba(14, 18, 35, 0.7);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(251, 113, 133, 0.24);
        border-radius: 24px;
        padding: 48px;
        text-align: center;
      ">
        <div style="
          font-size: 4rem;
          margin-bottom: 24px;
        ">⚠️</div>
        
        <h1 style="
          color: #f3f7ff;
          margin-bottom: 12px;
          font-size: 2rem;
        ">Firebase Configuration Missing</h1>
        
        <p style="
          color: #b8c5e0;
          margin-bottom: 32px;
          line-height: 1.6;
        ">
          The application is not yet configured with your Firebase project credentials.
          To get started, you need to provide the following values:
        </p>
        
        <div style="
          background: rgba(255, 0, 0, 0.05);
          border: 1px solid rgba(251, 113, 133, 0.24);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 32px;
          text-align: left;
        ">
          <p style="
            color: #fb7185;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 12px;
          ">Missing Credentials:</p>
          <ul style="
            list-style: none;
            padding: 0;
            margin: 0;
            color: #fb7185;
            font-size: 0.85rem;
          ">
            ${missing.map(key => `<li style="padding: 6px 0;">• <code>${key}</code></li>`).join('')}
          </ul>
        </div>
        
        <div style="
          background: rgba(56, 189, 248, 0.05);
          border: 1px solid rgba(56, 189, 248, 0.24);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 32px;
          text-align: left;
        ">
          <p style="
            color: #38bdf8;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 12px;
          ">How to Fix:</p>
          <ol style="
            list-style: none;
            padding: 0;
            margin: 0;
            color: #b8c5e0;
            font-size: 0.85rem;
          ">
            <li style="padding: 6px 0; color: #38bdf8;">1. Go to <a href="https://console.firebase.google.com" target="_blank" style="color: #38bdf8; text-decoration: underline;">Firebase Console</a></li>
            <li style="padding: 6px 0; color: #38bdf8;">2. Create or select a project</li>
            <li style="padding: 6px 0; color: #38bdf8;">3. Go to Project Settings → Your Apps → Web</li>
            <li style="padding: 6px 0; color: #38bdf8;">4. Copy all configuration values</li>
            <li style="padding: 6px 0; color: #38bdf8;">5. Update <code>Firebase/config.js</code> with your values</li>
            <li style="padding: 6px 0; color: #38bdf8;">6. Refresh this page</li>
          </ol>
        </div>
        
        <div style="
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 32px;
          text-align: left;
        ">
          <p style="
            color: #9bb0d4;
            font-size: 0.85rem;
            margin: 0;
            font-family: 'Monaco', 'Courier New', monospace;
            line-height: 1.6;
          ">
            <strong style="color: #f3f7ff;">Example config.js:</strong>
            <br>
            export const firebaseConfig = {<br>
            &nbsp;&nbsp;apiKey: "YOUR_API_KEY",<br>
            &nbsp;&nbsp;authDomain: "your-project.firebaseapp.com",<br>
            &nbsp;&nbsp;projectId: "your-project-id",<br>
            &nbsp;&nbsp;storageBucket: "your-project.appspot.com",<br>
            &nbsp;&nbsp;messagingSenderId: "your-sender-id",<br>
            &nbsp;&nbsp;appId: "your-app-id"<br>
            };
          </p>
        </div>
        
        <div style="
          display: flex;
          gap: 12px;
          justify-content: center;
        ">
          <button onclick="location.reload()" style="
            background: linear-gradient(135deg, #6c5ce7, #8B7FFF);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 16px;
            font-weight: 600;
            cursor: pointer;
            font-size: 0.95rem;
          ">
            🔄 Refresh
          </button>
          <a href="https://console.firebase.google.com" target="_blank" style="
            background: transparent;
            color: #38bdf8;
            border: 1px solid #38bdf8;
            padding: 12px 24px;
            border-radius: 16px;
            font-weight: 600;
            cursor: pointer;
            font-size: 0.95rem;
            text-decoration: none;
            display: inline-block;
          ">
            Firebase Console
          </a>
        </div>
      </div>
    </div>
  `;
}
