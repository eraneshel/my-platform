// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhBcP4baBDBy8nM0cYCFuNQgYJBgV4iow",
  authDomain: "my-platform-5d6cf.firebaseapp.com",
  projectId: "my-platform-5d6cf",
  storageBucket: "my-platform-5d6cf.firebasestorage.app",
  messagingSenderId: "557347202555",
  appId: "1:557347202555:web:eb847a11c0cc9abf61d75e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

console.log('✅ Firebase initialized!');