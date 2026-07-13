Deployment steps — Firebase + Vercel

1) Create Firebase project
  - Go to https://console.firebase.google.com and create a project.
  - In Project Settings -> General -> Add Web App, copy the config values.
  - In Authentication -> Sign-in method, enable Google and Email/Password.
  - In Firestore Database, create a native mode database.

2) Add environment variables
  - Copy `.env.local.example` to `.env.local` and fill the fields from the Firebase config.

3) Local test
  ```bash
  npm install
  npm run dev
  # open http://localhost:3000
  ```

4) Deploy to Vercel
  - Push your repo to GitHub.
  - Import the repo in Vercel and set the same environment variables in Vercel project settings.
  - Deploy.

Notes:
  - This project uses client-side Firebase initialization; ensure the `NEXT_PUBLIC_*` keys are set.
  - WebRTC signalling uses Firestore documents under the `calls` collection (offer/answer). For production, consider a dedicated signalling server and TURN servers for reliability.
