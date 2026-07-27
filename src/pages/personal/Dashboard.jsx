// ============================================================
// Dashboard.jsx — Painel inicial do Personal.
// Mostra apenas a quantidade total de alunos.
// ============================================================
// ============================================================
// Dashboard.jsx — Painel do Personal com contadores e atalhos.
// ============================================================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarAlunos, listarFichas } from "../../services/fichas.js";
import { Users, ClipboardList, Activity, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const nav = useNavigate();
  const [alunos, setAlunos] = useState([]);
  const [fichas, setFichas] = useState([]);

  useEffect(() => {
    listarAlunos().then(setAlunos).catch(() => setAlunos([]));
    listarFichas().then(setFichas).catch(() => setFichas([]));
  }, []);

  const fichasRecentes = [...fichas]
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 5);

  const alunosRecentes = [...alunos]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 5);

  const cards = [
    { icon: Users, label: "Alunos ativos", value: alunos.length, color: "var(--gradient-red)" },
    { icon: ClipboardList, label: "Fichas cadastradas", value: fichas.length, color: "linear-gradient(135deg,#2563eb,#1e3a8a)" },
    { icon: Activity, label: "Atualizadas (7d)", value: fichas.filter(f => f.updatedAt && Date.now() - f.updatedAt < 7 * 864e5).length, color: "linear-gradient(135deg,#16a34a,#065f46)" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginBottom: 24 }}>
        {cards.map((c, i) => (
          <div key={i} className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: c.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <c.icon color="white" size={22} />
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{c.label}</span>
                <b style={{ display: "block", fontSize: 30, fontWeight: 800 }}>{c.value}</b>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Fichas recentes</h3>
          {fichasRecentes.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Nenhuma ficha cadastrada.</p>}
          {fichasRecentes.map((f) => (
            <div key={f.id} onClick={() => nav(`/personal/criar-ficha?aluno=${f.id}`)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
              <div>
                <b style={{ fontSize: 14 }}>{f.nome || "Sem nome"}</b>
                <p style={{ color: "var(--text-muted)", fontSize: 12 }}>{f.updatedAt ? new Date(f.updatedAt).toLocaleDateString("pt-BR") : "-"}</p>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Alunos recentes</h3>
          {alunosRecentes.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Nenhum aluno cadastrado.</p>}
          {alunosRecentes.map((a) => (
            <div key={a.id} onClick={() => nav(`/personal/alunos`)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
              <div>
                <b style={{ fontSize: 14 }}>{a.nome || "Sem nome"}</b>
                <p style={{ color: "var(--text-muted)", fontSize: 12 }}>{a.objetivo || a.email}</p>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}