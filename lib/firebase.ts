import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBj2Ka2pO06MWXqRKD5hRSTY4CpF1rcYaU",//process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "mathilda2-a7c48.firebaseapp.com",//process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: "mathilda2-a7c48",//process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: "mathilda2-a7c48.appspot.com",//process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: "91082222005",//process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: "1:91082222005:web:18c8ee817390b7501391fc",//process.env.NEXT_PUBLIC_FIREBASE_APP_ID, 
  measurementId: "G-J8DW7VG2D4"//process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics and export it
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;