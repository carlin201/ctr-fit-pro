// ============================================================
// LembretePeriodico.jsx — Notificação local a cada 30 minutos.
// 100% gratuito: não usa Cloud Functions nem servidor. É só o próprio
// navegador mostrando uma notificação enquanto o app está aberto
// (aba aberta, mesmo minimizada ou em outra aba — não precisa estar
// em foco). Se o navegador/aba for totalmente fechado, ela para.
// Usa a permissão que já foi concedida em notifications.js.
// ============================================================
import { useEffect } from "react";

const INTERVALO_MS = 30 * 60 * 1000; // 30 minutos

// Personalize a mensagem aqui:
const TITULO = "CTR Fitness";
const MENSAGEM = "Hora de dar uma olhada no seu treino! 💪";

export default function LembretePeriodico() {
  useEffect(() => {
    if (!("Notification" in window)) return undefined;

    const disparar = () => {
      if (Notification.permission !== "granted") return;
      // Evita empilhar notificação em cima de notificação: usa uma "tag" fixa,
      // então a nova substitui a anterior em vez de acumular.
      new Notification(TITULO, {
        body: MENSAGEM,
        icon: "/img/icon-192.png",
        tag: "lembrete-periodico",
      });
    };

    const id = setInterval(disparar, INTERVALO_MS);
    return () => clearInterval(id);
  }, []);

  return null;
}
