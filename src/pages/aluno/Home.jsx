// ============================================================
// Home.jsx — Tela inicial do Aluno.
// Mostra foto, nome e mensagem de boas-vindas.
// ============================================================
import { useAuth } from "../../services/AuthContext.jsx";

export default function Home() {
  const { user, profile } = useAuth();
  const primeiroNome = (profile?.nome || "Aluno").split(" ")[0];
  const iniciais = primeiroNome[0]?.toUpperCase() || "?";
  const saudacao = getSaudacao();

  return (
    <div>
      <div className="hero-card">
        <div className="hero-avatar">
          {user?.photoURL ? <img src={user.photoURL} alt={primeiroNome} /> : iniciais}
        </div>
        <div className="hero-text">
          <h2>{saudacao}, {primeiroNome}!</h2>
          <p>Pronto para treinar hoje?</p>
        </div>
      </div>

      <h3 className="section-title">Seus dados</h3>
      <div className="stat-grid">
        <div className="card stat"><span>Peso</span><b>{profile?.peso || "-"} kg</b></div>
        <div className="card stat"><span>Altura</span><b>{profile?.altura || "-"} cm</b></div>
        <div className="card stat"><span>Idade</span><b>{profile?.idade || "-"}</b></div>
        <div className="card stat"><span>Objetivo</span><b style={{ fontSize: 16 }}>{profile?.objetivo || "-"}</b></div>
      </div>

      <h3 className="section-title">Dica CTR</h3>
      <div className="card">
        <p style={{ lineHeight: 1.6, color: "var(--text-muted)" }}>
          Consistência supera intensidade. Um treino leve feito hoje vale mais que o treino perfeito de amanhã.
        </p>
      </div>
    </div>
  );
}

function getSaudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}