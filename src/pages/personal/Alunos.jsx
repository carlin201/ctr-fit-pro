// ============================================================
// Alunos.jsx — Lista de alunos com busca, edição de ficha e exclusão.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarAlunos, deletarAluno } from "../../services/fichas.js";
import { Search, Trash2, ClipboardEdit } from "lucide-react";

export default function Alunos() {
  const nav = useNavigate();
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => { listarAlunos().then(setList).catch(() => setList([])); }, []);

  const filtered = useMemo(
    () => list.filter((a) => (a.nome || "").toLowerCase().includes(q.toLowerCase())),
    [list, q]
  );

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

      <div className="field" style={{ position: "relative", maxWidth: 480 }}>
        <Search size={18} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-muted)" }} />
        <input className="input" style={{ paddingLeft: 42 }} placeholder="Buscar aluno..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

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