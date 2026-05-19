import { initializeApp } from "firebase/app";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBqY_jsd997ufIcUCoZNOeeRReG08V5CxA",
  authDomain: "weather-app-338d4.firebaseapp.com",
  projectId: "weather-app-338d4",
  storageBucket: "weather-app-338d4.firebasestorage.app",
  messagingSenderId: "125102442417",
  appId: "1:125102442417:web:d3732209ecd632678ddf90",
  measurementId: "G-H54WNB3RW4",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};
