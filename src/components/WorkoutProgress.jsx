// ============================================================
// WorkoutProgress.jsx — Barra de progresso do Modo Treino.
// Props: atual (1-based), total
// ============================================================
export default function WorkoutProgress({ atual, total }) {
  const percentual = total > 0 ? Math.round((atual / total) * 100) : 0;

  return (
    <div className="workout-progress">
      <div className="workout-progress-track">
        <div className="workout-progress-fill" style={{ width: `${percentual}%` }} />
      </div>
      <div className="workout-progress-label">
        <span>Exercício {atual} de {total}</span>
        <span>{percentual}%</span>
      </div>
    </div>
  );
}