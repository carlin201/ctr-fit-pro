// ============================================================
// WorkoutExercise.jsx — Card do exercício atual no Modo Treino.
// Renderiza vídeo (se existir), dados do exercício e o controle de séries.
// Props:
//   exercicio { nome, series, reps, descanso, obs, seriesTotais }
//   video (ou null)
//   seriesConcluidas: array de booleans
//   onConcluirSerie(index)
// ============================================================
import { Check } from "lucide-react";
import { temVideo } from "../services/videos.js";
import CleanYoutubePlayer from "./CleanYoutubePlayer.jsx";

export default function WorkoutExercise({ exercicio, video, seriesConcluidas, onConcluirSerie }) {
  if (!exercicio) return null;

  return (
    <div className="workout-exercise-card">
      {video && temVideo(video) && (
        <div className="workout-video">
          <CleanYoutubePlayer youtubeId={video.youtubeId} title={video.titulo} />
        </div>
      )}

      <h2 className="workout-exercise-nome">{exercicio.nome?.toUpperCase()}</h2>

      <div className="workout-exercise-stats">
        <div><b>{exercicio.series}</b><span>séries</span></div>
        <div><b>{exercicio.reps}</b><span>repetições</span></div>
        <div><b>{exercicio.descanso}</b><span>descanso</span></div>
      </div>

      {exercicio.obs && (
        <p className="workout-exercise-obs">{exercicio.obs}</p>
      )}

      <div className="workout-series-list">
        {seriesConcluidas.map((feita, i) => (
          <button
            key={i}
            className={`workout-serie-chip ${feita ? "feita" : ""}`}
            onClick={() => !feita && onConcluirSerie(i)}
            disabled={feita}
          >
            {feita ? <Check size={14} /> : null} Série {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}