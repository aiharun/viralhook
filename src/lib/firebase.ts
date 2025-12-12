import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCbZ-eBr2qtdkV54JQTi-WOzKm801BBt9M",
  authDomain: "viralhook-1c7e7.firebaseapp.com",
  projectId: "viralhook-1c7e7",
  storageBucket: "viralhook-1c7e7.firebasestorage.app",
  messagingSenderId: "803767941502",
  appId: "1:803767941502:web:ce91988b8cb87f63585b2f",
  measurementId: "G-DRGSDBD05V"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
