// ============================================================
// firebase.js — Configuração do Firebase.
//
// COMO CONFIGURAR:
// 1. Acesse https://console.firebase.google.com
// 2. Crie um projeto (ou use um existente).
// 3. Em "Configurações do Projeto" -> "Seus Apps" -> Adicionar App Web.
// 4. Copie o objeto de configuração e COLE ABAIXO no lugar dos placeholders.
// 5. Ative:
//    - Authentication -> Sign-in method -> Email/Password + Google
//    - Firestore Database -> criar banco
// ============================================================
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCj52UNZGsiUsDCw7B41Di8xZubTn87zZE",
  authDomain: "ctr-fitness-app.firebaseapp.com",
  projectId: "ctr-fitness-app",
  storageBucket: "ctr-fitness-app.firebasestorage.app",
  messagingSenderId: "871828540628",
  appId: "1:871828540628:web:c2c6d94ef1e9e6e9443f41"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
