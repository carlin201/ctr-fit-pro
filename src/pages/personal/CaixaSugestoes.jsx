// ============================================================
// CaixaSugestoes.jsx — Painel do Personal/ADM para ver as
// reclamações, sugestões e elogios enviados em /fale-conosco.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import {
  listarMensagens, atualizarStatus, excluirMensagem, TIPOS, ASSUNTOS, STATUS,
} from "../../services/mensagens.js";
import Toast from "../../components/Toast.jsx";
import { Search, Trash2, Link as LinkIcon, RefreshCw } from "lucide-react";

const COR_TIPO = { "Reclamação": "#ef4444", "Sugestão": "#3b82f6", "Elogio": "#22c55e" };

function formatarData(ts) {
  if (!ts?.seconds) return "—";
  return new Date(ts.seconds * 1000).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function CaixaSugestoes() {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [fStatus, setFStatus] = useState("Todos");
  const [fTipo, setFTipo] = useState("Todos");
  const [fAssunto, setFAssunto] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [toast, setToast] = useState(null);

  const link = `${window.location.origin}/fale-conosco`;

  const carregar = () => {
    setCarregando(true);
    listarMensagens()
      .then(setItens)
      .catch(() => setToast({ type: "error", msg: "Erro ao carregar. Verifique as regras do Firestore." }))
      .finally(() => setCarregando(false));
  };

  useEffect(carregar, []);

  const contagem = useMemo(() => {
    const c = { Todos: itens.length };
    STATUS.forEach((s) => { c[s] = itens.filter((i) => (i.status || "Novo") === s).length; });
    return c;
  }, [itens]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return itens.filter((i) => {
      if (fStatus !== "Todos" && (i.status || "Novo") !== fStatus) return false;
      if (fTipo !== "Todos" && i.tipo !== fTipo) return false;
      if (fAssunto !== "Todos" && i.setor !== fAssunto) return false;
      if (q && !`${i.mensagem} ${i.nome} ${i.contato}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [itens, fStatus, fTipo, fAssunto, busca]);

  const mudarStatus = async (item, status) => {
    try {
      await atualizarStatus(item.id, status);
      setItens((lista) => lista.map((i) => (i.id === item.id ? { ...i, status } : i)));
    } catch {
      setToast({ type: "error", msg: "Erro ao atualizar o status." });
    }
  };

  const excluir = async (item) => {
    if (!window.confirm("Excluir esta mensagem definitivamente?")) return;
    try {
      await excluirMensagem(item.id);
      setItens((lista) => lista.filter((i) => i.id !== item.id));
      setToast({ type: "success", msg: "Mensagem excluída." });
    } catch {
      setToast({ type: "error", msg: "Erro ao excluir." });
    }
  };

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setToast({ type: "success", msg: "Link copiado!" });
    } catch {
      window.prompt("Copie o link:", link);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Caixa de Sugestões</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" style={{ width: "auto" }} onClick={carregar}><RefreshCw size={16} /> Atualizar</button>
          <button className="btn btn-secondary" style={{ width: "auto" }} onClick={copiarLink}><LinkIcon size={16} /> Copiar link do formulário</button>
        </div>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20, wordBreak: "break-all" }}>
        Link público para os alunos: {link}
      </p>

      <div className="chip-row">
        {["Todos", ...STATUS].map((s) => (
          <button key={s} className={"chip" + (fStatus === s ? " active" : "")} onClick={() => setFStatus(s)}>
            {s} ({contagem[s] ?? 0})
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, maxWidth: 760, marginBottom: 12 }}>
        <select className="select" value={fTipo} onChange={(e) => setFTipo(e.target.value)}>
          <option>Todos</option>
          {TIPOS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="select" value={fAssunto} onChange={(e) => setFAssunto(e.target.value)}>
          <option>Todos</option>
          {ASSUNTOS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>

      <div className="field" style={{ position: "relative", maxWidth: 760 }}>
        <Search size={18} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-muted)" }} />
        <input className="input" style={{ paddingLeft: 42 }} placeholder="Buscar no texto, nome ou contato..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>{filtrados.length} mensagem(ns)</p>

      <div style={{ maxWidth: 760 }}>
        {carregando && <p style={{ color: "var(--text-muted)" }}>Carregando...</p>}
        {!carregando && filtrados.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>Nenhuma mensagem encontrada.</p>
        )}

        {filtrados.map((i) => {
          const status = i.status || "Novo";
          return (
            <div key={i.id} className="card" style={{ marginBottom: 12, borderLeft: `4px solid ${COR_TIPO[i.tipo] || "var(--border, #444)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                <b style={{ color: COR_TIPO[i.tipo] }}>{i.tipo} · <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i.setor}</span></b>
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{formatarData(i.criadoEm)}</span>
              </div>

              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.5, marginBottom: 10 }}>{i.mensagem}</p>

              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 12 }}>
                {i.nome || "Anônimo"}{i.contato ? ` · ${i.contato}` : ""}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {STATUS.map((s) => (
                  <button
                    key={s}
                    className={"chip" + (status === s ? " active" : "")}
                    onClick={() => status !== s && mudarStatus(i, s)}
                  >
                    {s}
                  </button>
                ))}
                <button className="btn btn-danger" style={{ width: "auto", padding: "8px 12px", fontSize: 13, marginLeft: "auto" }} onClick={() => excluir(i)}>
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
