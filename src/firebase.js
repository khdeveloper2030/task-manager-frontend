import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // បន្ថែម Auth
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCvOznxJib5o0ttuClENUoG3BO780ikPFM",
  authDomain: "taskly-4cd43.firebaseapp.com",
  projectId: "taskly-4cd43",
  storageBucket: "taskly-4cd43.firebasestorage.app",
  messagingSenderId: "1014616365916",
  appId: "1:1014616365916:web:1af6e143fe5b8a66f23f99",
  measurementId: "G-KF7F6Q2SY6"
};

// បង្កើត Instance សម្រាប់ប្រើប្រាស់
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export សម្រាប់យកទៅប្រើក្នុង App.jsx
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();