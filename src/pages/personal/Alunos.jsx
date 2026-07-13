// ============================================================
// Alunos.jsx — Lista de alunos com busca.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { listarAlunos } from "../../services/fichas.js";
import { Search } from "lucide-react";

export default function Alunos() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);

  useEffect(() => { listarAlunos().then(setList).catch(() => setList([])); }, []);

  const filtered = useMemo(
    () => list.filter((a) => (a.nome || "").toLowerCase().includes(q.toLowerCase())),
    [list, q]
  );

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Alunos</h1>

      <div className="field" style={{ position: "relative", maxWidth: 480 }}>
        <Search size={18} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-muted)" }} />
        <input className="input" style={{ paddingLeft: 42 }} placeholder="Buscar aluno..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div style={{ maxWidth: 640 }}>
        {filtered.length === 0 && <p style={{ color: "var(--text-muted)" }}>Nenhum aluno cadastrado.</p>}
        {filtered.map((a) => (
          <div key={a.id} className={`aluno-item ${sel?.id === a.id ? "selected" : ""}`} onClick={() => setSel(a)}>
            <div className="avatar">{(a.nome || "?")[0]?.toUpperCase()}</div>
            <div className="info">
              <h4>{a.nome || "Sem nome"}</h4>
              <p>{a.email} · {a.objetivo || "-"}</p>
            </div>
          </div>
        ))}
      </div>

      {sel && (
        <div className="card" style={{ marginTop: 20, maxWidth: 640 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{sel.nome}</h3>
          <div className="stat-grid">
            <div className="stat"><span>Peso</span><b>{sel.peso || "-"} kg</b></div>
            <div className="stat"><span>Altura</span><b>{sel.altura || "-"} cm</b></div>
            <div className="stat"><span>Idade</span><b>{sel.idade || "-"}</b></div>
            <div className="stat"><span>Objetivo</span><b style={{ fontSize: 15 }}>{sel.objetivo || "-"}</b></div>
          </div>
        </div>
      )}
    </div>
  );
}