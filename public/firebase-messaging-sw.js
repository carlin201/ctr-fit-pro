// ============================================================
// firebase-messaging-sw.js — Service worker de notificações push.
// Precisa ficar na RAIZ da pasta public/ (não dentro de subpastas).
// Cuida das notificações que chegam com o app fechado ou em segundo plano.
// ============================================================
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCj52UNZGsiUsDCw7B41Di8xZubTn87zZE",
  authDomain: "ctr-fitness-app.firebaseapp.com",
  projectId: "ctr-fitness-app",
  storageBucket: "ctr-fitness-app.firebasestorage.app",
  messagingSenderId: "871828540628",
  appId: "1:871828540628:web:9101e90a6e460efa443f41",
});

const messaging = firebase.messaging();

// Notificação recebida com o app fechado/minimizado
messaging.onBackgroundMessage((payload) => {
  const titulo = payload.notification?.title || "CTR Fitness";
  const opcoes = {
    body: payload.notification?.body || "",
    icon: "/img/icon-192.png",
    badge: "/img/icon-192.png",
  };
  self.registration.showNotification(titulo, opcoes);
});
