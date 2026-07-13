// ============================================================
// WorkoutFinish.jsx — Tela de conclusão do treino.
// Props: stats { totalExercicios, tempoGastoSegundos }, onHome, onVerFicha
// ============================================================
import { formatarTempo } from "../services/workout.js";

export default function WorkoutFinish({ stats, onHome, onVerFicha }) {
  return (
    <div className="workout-finish">
      <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>PARABÉNS!</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>Treino concluído com sucesso.</p>

      <div className="stat-grid" style={{ maxWidth: 320, margin: "0 auto 28px" }}>
        <div className="card stat"><span>Exercícios</span><b>{stats.totalExercicios}</b></div>
        <div className="card stat"><span>Tempo</span><b>{formatarTempo(stats.tempoGastoSegundos)}</b></div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 320, margin: "0 auto" }}>
        <button className="btn btn-primary" onClick={onHome}>Voltar para Home</button>
        <button className="btn btn-secondary" onClick={onVerFicha}>Ver Minha Ficha</button>
      </div>
    </div>
  );
}