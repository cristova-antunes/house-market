// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQwMkG26Y25ILiC4OIJLQ_NuYfDMWpjzo",
  authDomain: "house-market-app-31b4a.firebaseapp.com",
  projectId: "house-market-app-31b4a",
  storageBucket: "house-market-app-31b4a.appspot.com",
  messagingSenderId: "472004762389",
  appId: "1:472004762389:web:23546762d1033ed69be71c",
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();
