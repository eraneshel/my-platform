// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhBcP4baBDBy8nM0cYCFuNQgYJBgV4iow",
  authDomain: "my-platform-5d6cf.firebaseapp.com",
  projectId: "my-platform-5d6cf",
  storageBucket: "my-platform-5d6cf.firebasestorage.app",
  messagingSenderId: "557347202555",
  appId: "1:557347202555:web:eb847a11c0cc9abf61d75e",
  measurementId: "G-43756Y54DN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('✅ Firebase initialized!');