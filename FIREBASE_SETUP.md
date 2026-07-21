Firebase setup (Quick steps)
===========================

1) Create or open a Firebase project at https://console.firebase.google.com

2) Enable Authentication -> Sign-in methods -> Email/Password and Google.

3) Enable Firestore and Firebase Storage (choose region close to your users).

4) Add Web App and copy the config values. Put them into `.env.local` using the keys in `.env.local.example`.

Local development (quick):

```bash
# copy example and edit
cp .env.local.example .env.local
# then fill values in .env.local
npm run dev
```

Production (Vercel): Use Vercel dashboard or CLI to add environment variables for `production` and `preview`.

CLI example (one-by-one, you'll be prompted for the value):

```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID production
```

Service Account (admin tasks)
-----------------------------
- If you need server-side admin tasks (FCM, moderation), create a Service Account JSON in Firebase Console -> Project settings -> Service accounts.
- Do NOT paste the JSON into chat. Add it as a Vercel secret named `FIREBASE_SERVICE_ACCOUNT` (or store it securely and reference from your deployment).
