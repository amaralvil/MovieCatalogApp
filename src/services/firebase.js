import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAn0IvWw1RBnFVeQ_tZ57g1Krc1JjiPceI",
  authDomain: "moviecatalogo.firebaseapp.com",
  projectId: "moviecatalogo",
  storageBucket: "moviecatalogo.firebasestorage.app",
  messagingSenderId: "1075260411144",
  appId: "1:1075260411144:web:5c40b0b12e7fc995aa30bd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;