// ============================================================
// Evolucao.jsx — Página de acompanhamento de peso e medidas do aluno.
// Mostra peso inicial, peso atual, IMC e gráfico simples (recharts).
// Salva medições no Firestore (medicoes/{uid}/itens).
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../services/AuthContext.jsx";
import { listarMedicoes, adicionarMedicao, excluirMedicao, calcularIMC, classificacaoIMC } from "../../services/medicoes.js";
import Toast from "../../components/Toast.jsx";
import { ChevronLeft, Plus, Trash2, TrendingUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export default function Evolucao() {
  const { user, profile } = useAuth();
  const [medicoes, setMedicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ data: hoje(), peso: "", obs: "" });

  useEffect(() => {
    if (!user) return;
    listarMedicoes(user.uid).then((m) => {
      setMedicoes(m);
      setLoading(false);
    });
  }, [user]);

  const pesoInicial = useMemo(() => {
    if (medicoes.length > 0) return medicoes[0].peso;
    return profile?.peso || "-";
  }, [medicoes, profile]);

  const pesoAtual = useMemo(() => {
    if (medicoes.length > 0) return medicoes[medicoes.length - 1].peso;
    return profile?.peso || "-";
  }, [medicoes, profile]);

  const imc = calcularIMC(pesoAtual, profile?.altura);
  const dadosGrafico = medicoes.map((m) => ({
    data: new Date(m.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    peso: parseFloat(m.peso) || 0,
  }));

  const salvar = async (e) => {
    e.preventDefault();
    if (!form.peso) return setToast({ type: "error", msg: "Informe o peso." });
    try {
      const doc = await adicionarMedicao(user.uid, { data: form.data, peso: form.peso, obs: form.obs });
      setMedicoes((prev) => [...prev, { id: doc.id, ...form }].sort((a, b) => a.data.localeCompare(b.data)));
      setForm({ data: hoje(), peso: "", obs: "" });
      setToast({ type: "success", msg: "Medição registrada." });
    } catch {
      setToast({ type: "error", msg: "Erro ao salvar medição." });
    }
  };

  const remover = async (id) => {
    if (!window.confirm("Excluir esta medição?")) return;
    try {
      await excluirMedicao(user.uid, id);
      setMedicoes((prev) => prev.filter((m) => m.id !== id));
      setToast({ type: "success", msg: "Medição excluída." });
    } catch {
      setToast({ type: "error", msg: "Erro ao excluir." });
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Link to="/" className="icon-btn" aria-label="Voltar" style={{ width: 36, height: 36 }}>
          <ChevronLeft size={18} />
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Minha Evolução</h1>
      </div>

      <div className="stat-grid">
        <div className="card stat"><span>Peso inicial</span><b>{pesoInicial} kg</b></div>
        <div className="card stat"><span>Peso atual</span><b>{pesoAtual} kg</b></div>
        <div className="card stat"><span>Altura</span><b>{profile?.altura || "-"} cm</b></div>
        <div className="card stat"><span>Objetivo</span><b style={{ fontSize: 14 }}>{profile?.objetivo || "-"}</b></div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>IMC</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
          <b style={{ fontSize: 32 }}>{imc ?? "-"}</b>
          <span style={{ color: "var(--text-muted)" }}>{classificacaoIMC(imc)}</span>
        </div>
      </div>

      {dadosGrafico.length > 0 && (
        <>
          <h3 className="section-title"><TrendingUp size={16} style={{ display: "inline", marginRight: 6 }} />Evolução do peso</h3>
          <div className="card" style={{ padding: 12, marginBottom: 20 }}>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={dadosGrafico} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="data" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} domain={["dataMin - 2", "dataMax + 2"]} />
                  <Tooltip contentStyle={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="peso" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      <h3 className="section-title">Nova medição</h3>
      <form onSubmit={salvar} className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="field"><label>Data</label>
            <input className="input" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required />
          </div>
          <div className="field"><label>Peso (kg)</label>
            <input className="input" type="number" step="0.1" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })} required />
          </div>
        </div>
        <div className="field"><label>Observações</label>
          <input className="input" value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} placeholder="opcional" />
        </div>
        <button className="btn btn-primary"><Plus size={16} /> Adicionar</button>
      </form>

      <h3 className="section-title">Histórico</h3>
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Carregando...</p>
      ) : medicoes.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <p style={{ color: "var(--text-muted)" }}>Nenhuma medição registrada ainda.</p>
        </div>
      ) : (
        <div className="config-group">
          {[...medicoes].reverse().map((m) => (
            <div key={m.id} className="config-row" style={{ cursor: "default" }}>
              <span className="config-row-left">
                <div>
                  <b>{m.peso} kg</b>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {new Date(m.data).toLocaleDateString("pt-BR")}
                    {m.obs ? ` · ${m.obs}` : ""}
                  </p>
                </div>
              </span>
              <button className="icon-btn" onClick={() => remover(m.id)} aria-label="Excluir"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

function hoje() {
  const d = new Date();
  const iso = d.toISOString().slice(0, 10);
  return iso;
}