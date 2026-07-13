// ============================================================
// Dashboard.jsx — Painel inicial do Personal.
// Mostra apenas a quantidade total de alunos.
// ============================================================
import { useEffect, useState } from "react";
import { listarAlunos } from "../../services/fichas.js";
import { Users } from "lucide-react";

export default function Dashboard() {
  const [count, setCount] = useState(null);
  useEffect(() => { listarAlunos().then((a) => setCount(a.length)).catch(() => setCount(0)); }, []);
  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Dashboard</h1>
      <div className="card" style={{ maxWidth: 360 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--gradient-red)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users color="white" />
          </div>
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Alunos ativos</span>
            <b style={{ display: "block", fontSize: 36, fontWeight: 800 }}>{count ?? "..."}</b>
          </div>
        </div>
      </div>
    </div>
  );
}