import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../../services/firebase.js";
import { PERSONAL_USER, PERSONAL_PASS } from "../../services/personalConfig.js";
import Toast from "../../components/Toast.jsx";
import { Dumbbell } from "lucide-react";

export default function PersonalLogin() {
  const nav = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [toast, setToast] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (user.trim().toUpperCase() === PERSONAL_USER && pass === PERSONAL_PASS) {
      try {
        await signInAnonymously(auth);
        localStorage.setItem("ctr_personal_auth", "1");
        nav("/personal/dashboard", { replace: true });
      } catch (err) {
        setToast({ type: "error", msg: "Erro ao autenticar. Tente novamente." });
      }
    } else {
      setToast({ type: "error", msg: "Usuário ou senha incorretos." });
    }
  };

  return (
    <div className="login-page">
      <div className="login-banner"><img src="/img/logo.png" alt="CTR" className="logo" /></div>
      <div className="login-content">
        <h1 className="login-title"><Dumbbell style={{ display: "inline", verticalAlign: "-4px" }} /> Personal</h1>
        <p className="login-sub">Acesso restrito ao professor.</p>
        <form onSubmit={submit}>
          <div className="field"><label>Usuário</label><input className="input" required value={user} onChange={(e) => setUser(e.target.value)} /></div>
          <div className="field"><label>Senha</label><input className="input" type="password" required value={pass} onChange={(e) => setPass(e.target.value)} /></div>
          <button className="btn btn-primary">Entrar</button>
          <p className="login-link" style={{ cursor: "pointer" }} onClick={() => nav("/login")}>← Sou aluno</p>
        </form>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}