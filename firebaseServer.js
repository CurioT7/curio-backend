// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsaPCAKMxSMG9_pxHObTOQgHc5460zGgM",
  authDomain: "curio-e356a.firebaseapp.com",
  databaseURL:
    "https://curio-e356a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "curio-e356a",
  storageBucket: "curio-e356a.appspot.com",
  messagingSenderId: "411830826423",
  appId: "1:411830826423:web:bfd3d465afbae843c1e432",
  measurementId: "G-TH01FY8BQ7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
