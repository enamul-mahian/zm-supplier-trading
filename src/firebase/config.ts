import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ভাইটের এনভায়রনমেন্ট ভেরিয়েবল (Environment Variables) হ্যান্ডলিং রুলস অনুযায়ী কনফিগারেশন সেটআপ
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ডেভেলপমেন্ট এনভায়রনমেন্টে ডিবাগিং ও নিরাপদ ডিপ্লয়মেন্টে সহায়তার জন্য কনফিগারেশন চেক
if (import.meta.env.DEV) {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missingKeys.length > 0) {
    console.warn(
      `[Firebase Config Warning]: Missing environment variables: ${missingKeys.join(', ')}. Please configure your .env file.`
    );
  }
}

// ফায়ারবেস অ্যাপ্লিকেশন ও সার্ভিস ইনিশিয়ালাইজেশন
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };