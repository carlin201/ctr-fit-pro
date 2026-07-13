// ============================================================
// Perfil.jsx — Perfil do Aluno.
// Exibe foto, nome, email e dados. Permite sair da conta.
// ============================================================
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../services/AuthContext.jsx";
import { LogOut } from "lucide-react";

export default function Perfil() {
  const { user, profile, logout } = useAuth();
  const nav = useNavigate();
  const iniciais = (profile?.nome || "?")[0].toUpperCase();

  const sair = async () => {
    await logout();
    nav("/login", { replace: true });
  };

  return (
    <div>
      <h1 className="section-title" style={{ fontSize: 28, fontWeight: 800 }}>Perfil</h1>

      <div className="card" style={{ textAlign: "center", padding: 32 }}>
        <div className="hero-avatar" style={{ margin: "0 auto 16px", width: 88, height: 88, fontSize: 32, background: "var(--gradient-red)" }}>
          {user?.photoURL ? <img src={user.photoURL} alt="" /> : iniciais}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{profile?.nome || "Aluno"}</h2>
        <p style={{ color: "var(--text-muted)", marginTop: 4 }}>{user?.email}</p>
      </div>

      <div className="stat-grid" style={{ marginTop: 20 }}>
        <div className="card stat"><span>Peso</span><b>{profile?.peso || "-"} kg</b></div>
        <div className="card stat"><span>Altura</span><b>{profile?.altura || "-"} cm</b></div>
        <div className="card stat"><span>Idade</span><b>{profile?.idade || "-"}</b></div>
        <div className="card stat"><span>Objetivo</span><b style={{ fontSize: 15 }}>{profile?.objetivo || "-"}</b></div>
      </div>

      <button className="btn btn-danger" style={{ marginTop: 24 }} onClick={sair}>
        <LogOut size={16}/> Sair da conta
      </button>
    </div>
  );
}