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

// >>> COLE AQUI a sua configuração do Firebase <<<
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
};
// >>> FIM DA CONFIGURAÇÃO <<<

// Inicializa o Firebase e exporta os serviços usados no app.
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;