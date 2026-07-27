// ============================================================
// Alunos.jsx — Lista de alunos com busca, edição de ficha e exclusão.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarAlunos, deletarAluno } from "../../services/fichas.js";
import { Search, Trash2, ClipboardEdit, ArrowUpDown } from "lucide-react";

export default function Alunos() {
  const nav = useNavigate();
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [ordem, setOrdem] = useState("nome");

  useEffect(() => { listarAlunos().then(setList).catch(() => setList([])); }, []);

  const filtered = useMemo(() => {
    const arr = list.filter((a) =>
      (a.nome || "").toLowerCase().includes(q.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(q.toLowerCase())
    );
    if (ordem === "nome") arr.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
    if (ordem === "recente") arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    if (ordem === "objetivo") arr.sort((a, b) => (a.objetivo || "").localeCompare(b.objetivo || ""));
    return arr;
  }, [list, q, ordem]);

  const confirmarExclusao = async (aluno, e) => {
    e.stopPropagation();
    const confirmar = window.confirm(`Tem certeza que deseja apagar ${aluno.nome || "este aluno"}? Essa ação não pode ser desfeita.`);
    if (!confirmar) return;

    setExcluindo(true);
    try {
      await deletarAluno(aluno.id);
      setList((prev) => prev.filter((a) => a.id !== aluno.id));
      if (sel?.id === aluno.id) setSel(null);
    } catch (err) {
      alert("Não foi possível apagar o aluno. Tente novamente.");
    } finally {
      setExcluindo(false);
    }
  };

  const editarFicha = (aluno, e) => {
    e.stopPropagation();
    nav(`/personal/criar-ficha?aluno=${aluno.id}`);
  };

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Alunos</h1>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", maxWidth: 640, marginBottom: 8 }}>
        <div className="field" style={{ position: "relative", flex: 1, minWidth: 220, marginBottom: 0 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-muted)" }} />
          <input className="input" style={{ paddingLeft: 42 }} placeholder="Buscar por nome ou e-mail..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 0, minWidth: 180, position: "relative" }}>
          <ArrowUpDown size={16} style={{ position: "absolute", left: 12, top: 15, color: "var(--text-muted)" }} />
          <select className="select" style={{ paddingLeft: 38 }} value={ordem} onChange={(e) => setOrdem(e.target.value)}>
            <option value="nome">Nome (A-Z)</option>
            <option value="recente">Mais recentes</option>
            <option value="objetivo">Objetivo</option>
          </select>
        </div>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>{filtered.length} aluno(s)</p>

      <div style={{ maxWidth: 640 }}>
        {filtered.length === 0 && <p style={{ color: "var(--text-muted)" }}>Nenhum aluno cadastrado.</p>}
        {filtered.map((a) => (
          <div
            key={a.id}
            className={`aluno-item ${sel?.id === a.id ? "selected" : ""}`}
            onClick={() => setSel(a)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="avatar" style={{ overflow: "hidden" }}>
                {a.foto ? (
                  <img src={a.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                ) : (
                  (a.nome || "?")[0]?.toUpperCase()
                )}
              </div>
              <div className="info">
                <h4>{a.nome || "Sem nome"}</h4>
                <p>{a.email} · {a.objetivo || "-"}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={(e) => editarFicha(a, e)}
                title="Editar ficha"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: 8,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ClipboardEdit size={18} />
              </button>

              <button
                onClick={(e) => confirmarExclusao(a, e)}
                disabled={excluindo}
                title="Apagar aluno"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--danger, #e53935)",
                  cursor: "pointer",
                  padding: 8,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Trash2 size={18} />
              </button>
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