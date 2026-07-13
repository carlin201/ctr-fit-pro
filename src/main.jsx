// ============================================================
// main.jsx — Ponto de entrada do React.
// Monta o App dentro do #root, aplica o tema salvo, remove a splash
// screen e registra o service worker do PWA.
// ============================================================
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./services/AuthContext.jsx";
import { ThemeProvider } from "./services/ThemeContext.jsx";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Remove a splash screen depois que o app montou (mínimo ~1s de exibição)
const splash = document.getElementById("splash-screen");
if (splash) {
  const inicio = Date.now();
  const MIN_DURACAO = 1000;
  const esconder = () => {
    const decorrido = Date.now() - inicio;
    const espera = Math.max(MIN_DURACAO - decorrido, 0);
    setTimeout(() => {
      splash.classList.add("splash-hide");
      setTimeout(() => splash.remove(), 400);
    }, espera);
  };
  // requestAnimationFrame garante que o React já pintou a tela
  requestAnimationFrame(() => requestAnimationFrame(esconder));
}

// Registro do Service Worker (PWA) — só em produção.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}