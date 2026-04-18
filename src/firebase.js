// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvOznxJib5o0ttuClENUoG3BO780ikPFM",
  authDomain: "taskly-4cd43.firebaseapp.com",
  projectId: "taskly-4cd43",
  storageBucket: "taskly-4cd43.firebasestorage.app",
  messagingSenderId: "1014616365916",
  appId: "1:1014616365916:web:1af6e143fe5b8a66f23f99",
  measurementId: "G-KF7F6Q2SY6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);