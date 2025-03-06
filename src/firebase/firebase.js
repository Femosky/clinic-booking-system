// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlSqC_wfyXUxfJb_4UPOPNIX3omKMS8sE",
  authDomain: "capstone-clinic-booking.firebaseapp.com",
  projectId: "capstone-clinic-booking",
  storageBucket: "capstone-clinic-booking.firebasestorage.app",
  messagingSenderId: "1089497421638",
  appId: "1:1089497421638:web:e015013f28fdf0379c3747",
  measurementId: "G-2PYLK688PK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);

// Auth
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();