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

// Personalize aqui: cada vez que a notificação disparar, ela pega a
// próxima mensagem da lista (e volta pro início quando acaba).
// Pode adicionar, remover ou reescrever quantas quiser.
const TITULO = "CTR Fitness";
const MENSAGENS = [
  "Hora de dar uma olhada no seu treino! 💪",
  "Já bebeu água hoje? Mantenha-se hidratado! 💧",
  "Não esqueça de registrar seu treino de hoje ✅",
  "Foco e consistência levam ao resultado 🔥",
];

export default function LembretePeriodico() {
  useEffect(() => {
    if (!("Notification" in window)) return undefined;

    let indice = 0;
    const disparar = () => {
      if (Notification.permission !== "granted") return;
      const mensagem = MENSAGENS[indice % MENSAGENS.length];
      indice += 1;
      // Evita empilhar notificação em cima de notificação: usa uma "tag" fixa,
      // então a nova substitui a anterior em vez de acumular.
      new Notification(TITULO, {
        body: mensagem,
        icon: "/img/icon-192.png",
        tag: "lembrete-periodico",
      });
    };

    const id = setInterval(disparar, INTERVALO_MS);
    return () => clearInterval(id);
  }, []);

  return null;
}
