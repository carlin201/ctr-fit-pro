// ============================================================
// Login.jsx — Tela de login do Aluno.
// Suporta: Google, Email/Senha, Criar Conta, Esqueci senha,
// e link para o login do Personal.
// ============================================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext.jsx";
import Toast from "../components/Toast.jsx";
import { Mail, UserPlus, KeyRound, Dumbbell } from "lucide-react";

export default function Login() {
  const nav = useNavigate();
  const { login, signup, loginGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState("choice"); // choice | email | signup | reset
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const handle = async (fn, ok) => {
    setLoading(true);
    try {
      await fn();
      if (ok) setToast({ type: "success", msg: ok });
      else nav("/");
    } catch (e) {
      setToast({ type: "error", msg: traduzErro(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Banner + logo */}
      <div className="login-banner">
        <img src="/img/logo.png" alt="CTR Fitness" className="logo" />
      </div>

      <div className="login-content">
        <h1 className="login-title">
          {mode === "signup" ? "Criar conta" :
           mode === "reset"  ? "Recuperar senha" :
           mode === "email"  ? "Entrar" : "Bem-vindo"}
        </h1>
        <p className="login-sub">
          {mode === "choice" ? "Escolha como deseja acessar sua conta" : "Preencha os dados abaixo"}
        </p>

        {mode === "choice" && (
          <div className="login-actions">
            <button className="btn btn-primary" disabled={loading} onClick={() => handle(loginGoogle)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.6c2.1-1.9 3.2-4.8 3.2-8.2z"/><path d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8C3.9 20.5 7.7 23 12 23z"/><path d="M5.8 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7.1H2.1C1.4 8.5 1 10.2 1 12s.4 3.5 1.1 4.9l3.7-2.8z"/><path d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.1-3.1C17.4 2.1 15 1 12 1 7.7 1 3.9 3.5 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>
              Continuar com Google
            </button>
            <button className="btn btn-secondary" onClick={() => setMode("email")}><Mail size={18}/> Entrar com Email</button>
            <button className="btn btn-secondary" onClick={() => setMode("signup")}><UserPlus size={18}/> Criar Conta</button>
            <button className="btn btn-ghost" onClick={() => setMode("reset")}><KeyRound size={16}/> Esqueci minha senha</button>

            <div className="login-divider">ou</div>

            <button className="btn btn-secondary" onClick={() => nav("/personal/login")}>
              <Dumbbell size={18}/> Entrar como Personal
            </button>
          </div>
        )}

        {(mode === "email" || mode === "signup") && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handle(() => (mode === "signup" ? signup(email, pass) : login(email, pass)));
            }}
          >
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Senha</label>
              <input className="input" type="password" required minLength={6} value={pass} onChange={(e) => setPass(e.target.value)} />
            </div>
            <button className="btn btn-primary" disabled={loading}>
              {mode === "signup" ? "Criar conta" : "Entrar"}
            </button>
            <p className="login-link" onClick={() => setMode("choice")} style={{ cursor: "pointer" }}>← Voltar</p>
          </form>
        )}

        {mode === "reset" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handle(() => resetPassword(email), "Email de recuperação enviado!");
            }}
          >
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn btn-primary" disabled={loading}>Enviar link</button>
            <p className="login-link" onClick={() => setMode("choice")} style={{ cursor: "pointer" }}>← Voltar</p>
          </form>
        )}
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

// Converte códigos do Firebase em mensagens amigáveis.
function traduzErro(e) {
  const c = e?.code || "";
  if (c.includes("invalid-credential") || c.includes("wrong-password")) return "Email ou senha incorretos.";
  if (c.includes("email-already-in-use")) return "Este email já está cadastrado.";
  if (c.includes("weak-password")) return "Senha muito fraca (mínimo 6 caracteres).";
  if (c.includes("user-not-found")) return "Usuário não encontrado.";
  if (c.includes("popup-closed")) return "Login cancelado.";
  if (c.includes("invalid-api-key") || c.includes("api-key-not-valid")) return "Firebase não configurado. Edite src/services/firebase.js.";
  return e?.message || "Erro inesperado.";
}