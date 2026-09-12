// ============================================================
// notifications.js — Notificações push (Firebase Cloud Messaging).
// Coleção no Firestore: notificacoes_tokens/{uid} -> { tokens: [string...] }
// Um usuário pode ter mais de um token (ex.: celular + PC), por isso é lista.
// ============================================================
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, getDoc, setDoc } from "firebase/firestore";
import app, { db } from "./firebase.js";

// Chave pública (VAPID) gerada em:
// Firebase Console > Configurações do projeto > Cloud Messaging > Web Push certificates
const VAPID_KEY = "BGhBuvTYaMsKF4v34B4OgP0zGU6jT73pGjCrRljtR-HjN_Hhn9ban1lE4mg8IlX6h21bDzr4ogUX5SwPAqq3kbY";

let messagingInstance = null;

function getMessagingSafe() {
  // Notificações push não funcionam em todo navegador/contexto
  // (ex.: Safari antigo, iframes, http sem https) — evita quebrar o app nesses casos.
  try {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return null;
    if (!messagingInstance) messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch {
    return null;
  }
}

// Pede permissão ao usuário e, se aceitar, registra o token dele no Firestore.
// Chame isso depois do login (aluno ou personal). Não faz nada se o usuário
// já negou permissão antes, ou se o navegador não suporta.
export async function ativarNotificacoes(uid) {
  const messaging = getMessagingSafe();
  if (!messaging || !uid) return false;

  try {
    const permissao = await Notification.requestPermission();
    if (permissao !== "granted") return false;

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) return false;

    await salvarToken(uid, token);
    return true;
  } catch (err) {
    console.warn("Não foi possível ativar notificações:", err);
    return false;
  }
}

async function salvarToken(uid, token) {
  const ref = doc(db, "notificacoes_tokens", uid);
  const snap = await getDoc(ref);
  const atuais = snap.exists() ? snap.data().tokens || [] : [];
  if (!atuais.includes(token)) {
    await setDoc(ref, { tokens: [...atuais, token] }, { merge: true });
  }
}

// Notificação chegando com o app ABERTO (em primeiro plano).
// Chame uma vez, ex.: dentro de um useEffect no componente raiz do app.
export function escutarNotificacoesEmPrimeiroPlano(callback) {
  const messaging = getMessagingSafe();
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => callback?.(payload));
}
