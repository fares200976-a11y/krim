import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA9RvkyOQ4laIMvYY_VM8wM06Rl6UgE2UI",
  authDomain: "karim-3a8e0.firebaseapp.com",
  projectId: "karim-3a8e0",
  storageBucket: "karim-3a8e0.firebasestorage.app",
  messagingSenderId: "993540079581",
  appId: "1:993540079581:web:e01c96eb5cec22a1440034",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);