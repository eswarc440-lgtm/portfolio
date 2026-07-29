import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDbLqI3KXiNnM8c4y-yftmZxKP6jpWjAkw",
  authDomain: "gen-lang-client-0475738979.firebaseapp.com",
  projectId: "gen-lang-client-0475738979",
  storageBucket: "gen-lang-client-0475738979.firebasestorage.app",
  messagingSenderId: "36960215994",
  appId: "1:36960215994:web:690fde6b5442d309cd7383"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId
export const db = initializeFirestore(app, {
  databaseId: "ai-studio-a0aff675-7414-40ea-9ade-2443c33b8011"
} as any);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
