// ============================================================
// Historico.jsx — Lista de versões antigas da ficha do aluno.
// Permite abrir e visualizar (somente leitura) uma versão passada.
// ============================================================
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../services/AuthContext.jsx";
import { listarHistoricoFichas, DIAS, DIAS_LABEL, carregarFicha } from "../../services/fichas.js";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Historico() {
  const { user } = useAuth();
  const [atual, setAtual] = useState(null);
  const [versoes, setVersoes] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      carregarFicha(user.uid),
      listarHistoricoFichas(user.uid, 30),
    ]).then(([f, hist]) => {
      setAtual(f);
      setVersoes(hist);
      setLoading(false);
    });
  }, [user]);

  if (selecionada) return <DetalheFicha ficha={selecionada} onVoltar={() => setSelecionada(null)} />;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Link to="/ficha" className="icon-btn" aria-label="Voltar" style={{ width: 36, height: 36 }}>
          <ChevronLeft size={18} />
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Histórico de fichas</h1>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Carregando...</p>
      ) : (
        <>
          {atual && (
            <>
              <h3 className="section-title">Ficha atual</h3>
              <button className="card config-row" onClick={() => setSelecionada(atual)} style={{ marginBottom: 20 }}>
                <span className="config-row-left">
                  <div>
                    <b>{atual.objetivo || "Ficha atual"}</b>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                      {atual.professor || "Personal"} · {atual.updatedAt ? new Date(atual.updatedAt).toLocaleDateString("pt-BR") : "-"}
                    </p>
                  </div>
                </span>
                <ChevronRight size={16} />
              </button>
            </>
          )}

          <h3 className="section-title">Versões anteriores</h3>
          {versoes.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 32 }}>
              <p style={{ color: "var(--text-muted)" }}>Nenhuma versão anterior registrada ainda.</p>
            </div>
          ) : (
            <div className="config-group">
              {versoes.map((v) => (
                <button key={v.id} className="config-row" onClick={() => setSelecionada(v)}>
                  <span className="config-row-left">
                    <div>
                      <b>{v.objetivo || "Ficha"}</b>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                        {v.professor || "Personal"} · {v.updatedAt ? new Date(v.updatedAt).toLocaleDateString("pt-BR") : "-"}
                      </p>
                    </div>
                  </span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DetalheFicha({ ficha, onVoltar }) {
  const data = ficha.updatedAt ? new Date(ficha.updatedAt).toLocaleDateString("pt-BR") : "-";
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <button className="icon-btn" onClick={onVoltar} aria-label="Voltar" style={{ width: 36, height: 36 }}>
          <ChevronLeft size={18} />
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Ficha de {data}</h1>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Professor</p>
        <b>{ficha.professor || "-"}</b>
        {ficha.objetivo && <p style={{ marginTop: 8, color: "var(--text-muted)" }}>🎯 {ficha.objetivo}</p>}
      </div>

      {DIAS.map((d) => {
        const exs = ficha.dias?.[d] || [];
        return (
          <div key={d} className="card dia-card">
            <h3>{DIAS_LABEL[d]}</h3>
            {exs.length === 0 ? (
              <p className="empty-day">Descanso</p>
            ) : exs.map((ex, i) => (
              <div key={i} className="exercicio">
                <h4>{ex.nome}</h4>
                <p>{ex.series} séries × {ex.reps} reps · Desc: {ex.descanso}</p>
                {ex.obs && <p className="obs">{ex.obs}</p>}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}