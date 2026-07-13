import { initializeApp } from "firebase/app";

import {
    getAuth,
    GoogleAuthProvider
} from "firebase/auth";

import {
    getFirestore
} from "firebase/firestore";

const firebaseConfig = {

    apiKey: "AIzaSyCj52UNZGsiUsDCw7B41Di8xZubTn87zZE",

    authDomain: "ctr-fitness-app.firebaseapp.com",

    projectId: "ctr-fitness-app",

    storageBucket: "ctr-fitness-app.firebasestorage.app",

    messagingSenderId: "871828540628",

    appId: "1:871828540628:web:9101e90a6e460efa443f41"

};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

export default app;
