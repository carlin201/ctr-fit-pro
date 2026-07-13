// ============================================================
// MinhaFicha.jsx — Ficha de treino do Aluno.
// Carrega automaticamente a ficha enviada pelo personal.
// Permite baixar PDF e compartilhar no WhatsApp.
// ============================================================
import { useEffect, useState } from "react";
import { useAuth } from "../../services/AuthContext.jsx";
import { carregarFicha, DIAS, DIAS_LABEL } from "../../services/fichas.js";
import { gerarPDFFicha } from "../../services/pdf.js";
import { Download, Share2 } from "lucide-react";

export default function MinhaFicha() {
  const { user } = useAuth();
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    carregarFicha(user.uid).then((f) => { setFicha(f); setLoading(false); });
  }, [user]);

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Carregando ficha...</p>;

  if (!ficha) {
    return (
      <div>
        <h1 className="section-title" style={{ fontSize: 28, fontWeight: 800 }}>Minha Ficha</h1>
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--text-muted)" }}>Sua ficha ainda não foi criada pelo personal.</p>
        </div>
      </div>
    );
  }

  const compartilhar = () => {
    let txt = `🏋️ *Ficha CTR Fitness* — ${ficha.nome}\n\n`;
    DIAS.forEach((d) => {
      const exs = ficha.dias?.[d] || [];
      if (!exs.length) return;
      txt += `*${DIAS_LABEL[d]}*\n`;
      exs.forEach((e, i) => { txt += `${i + 1}. ${e.nome} — ${e.series}x${e.reps} (${e.descanso})\n`; });
      txt += "\n";
    });
    const url = `https://wa.me/?text=${encodeURIComponent(txt)}`;
    window.open(url, "_blank");
  };

  return (
    <div>
      <h1 className="section-title" style={{ fontSize: 28, fontWeight: 800 }}>Minha Ficha</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Professor</p>
        <b style={{ fontSize: 18 }}>{ficha.professor || "-"}</b>
        <p style={{ marginTop: 8, color: "var(--text-muted)" }}>{ficha.objetivo}</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button className="btn btn-secondary" onClick={() => gerarPDFFicha(ficha)}><Download size={16}/> PDF</button>
        <button className="btn btn-secondary" onClick={compartilhar}><Share2 size={16}/> WhatsApp</button>
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