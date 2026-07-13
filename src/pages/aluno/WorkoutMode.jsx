// ============================================================
// WorkoutMode.jsx — Tela do Modo Treino guiado.
// Rota: /treino
// Não mexe em fichas/Firestore existentes — só lê a ficha do dia
// e, ao concluir, salva um resumo em alunos/{uid}.ultimoTreino
// ============================================================
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../services/AuthContext.jsx";
import { carregarFicha, DIAS_LABEL } from "../../services/fichas.js";
import { loadVideos } from "../../services/videos.js";
import {
  exerciciosDoDia,
  encontrarVideoDoExercicio,
  diaDaSemanaAtual,
  salvarProgressoLocal,
  carregarProgressoLocal,
  limparProgressoLocal,
} from "../../services/workout.js";
import RestTimer from "../../components/RestTimer.jsx";
import WorkoutProgress from "../../components/WorkoutProgress.jsx";
import WorkoutExercise from "../../components/WorkoutExercise.jsx";
import WorkoutFinish from "../../components/WorkoutFinish.jsx";
import { Pause, X } from "lucide-react";

export default function WorkoutMode() {
  const { user, saveProfile } = useAuth();
  const nav = useNavigate();

  const [carregando, setCarregando] = useState(true);
  const [exercicios, setExercicios] = useState([]);
  const [videos, setVideos] = useState([]);
  const [diaLabel, setDiaLabel] = useState("");

  const [indiceAtual, setIndiceAtual] = useState(0);
  const [seriesPorExercicio, setSeriesPorExercicio] = useState({}); // { indice: [bool,...] }
  const [descansando, setDescansando] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const [inicioTreino] = useState(() => Date.now());

  useEffect(() => {
    if (!user) return;
    (async () => {
      const ficha = await carregarFicha(user.uid);
      const dia = diaDaSemanaAtual();
      const lista = exerciciosDoDia(ficha, dia);
      const todosVideos = await loadVideos();

      setExercicios(lista);
      setVideos(todosVideos);
      setDiaLabel(DIAS_LABEL[dia] || "Hoje");

      // Retoma progresso salvo, se existir e for do mesmo treino (mesma quantidade de exercícios)
      const salvo = carregarProgressoLocal(user.uid);
      if (salvo && salvo.totalExercicios === lista.length) {
        setIndiceAtual(salvo.indiceAtual || 0);
        setSeriesPorExercicio(salvo.seriesPorExercicio || {});
      } else {
        const inicial = {};
        lista.forEach((ex, i) => { inicial[i] = new Array(ex.seriesTotais || 0).fill(false); });
        setSeriesPorExercicio(inicial);
      }

      setCarregando(false);
    })();
  }, [user]);

  // Persiste progresso local a cada mudança (permite pausar e voltar depois)
  useEffect(() => {
    if (carregando || !user || finalizado) return;
    salvarProgressoLocal(user.uid, {
      indiceAtual,
      seriesPorExercicio,
      totalExercicios: exercicios.length,
    });
  }, [indiceAtual, seriesPorExercicio, carregando, finalizado]);

  const exercicioAtual = exercicios[indiceAtual];
  const proximoExercicio = exercicios[indiceAtual + 1];

  const videoAtual = useMemo(
    () => encontrarVideoDoExercicio(videos, exercicioAtual?.nome),
    [videos, exercicioAtual]
  );

  const seriesAtuais = seriesPorExercicio[indiceAtual] || [];
  const todasSeriesFeitas = seriesAtuais.length > 0 && seriesAtuais.every(Boolean);
  const ehUltimoExercicio = indiceAtual === exercicios.length - 1;

  const concluirSerie = (i) => {
    setSeriesPorExercicio((prev) => {
      const atual = [...(prev[indiceAtual] || [])];
      atual[i] = true;
      return { ...prev, [indiceAtual]: atual };
    });
    setDescansando(true);
  };

  const avancarExercicio = () => {
    if (ehUltimoExercicio) {
      finalizarTreino();
    } else {
      setIndiceAtual((i) => i + 1);
    }
  };

  const finalizarTreino = async () => {
    const tempoGastoSegundos = Math.round((Date.now() - inicioTreino) / 1000);
    setFinalizado(true);
    if (user) {
      limparProgressoLocal(user.uid);
      try {
        await saveProfile({
          ultimoTreino: {
            data: new Date().toISOString(),
            quantidadeExercicios: exercicios.length,
            tempoGastoSegundos,
          },
        });
      } catch {
        // Não bloqueia a experiência do aluno se o salvamento falhar
      }
    }
  };

  const pausarESair = () => nav("/ficha");
  const cancelarTreino = () => {
    if (user) limparProgressoLocal(user.uid);
    nav("/ficha");
  };

  if (carregando) {
    return <div className="loading-screen">Carregando treino...</div>;
  }

  if (exercicios.length === 0) {
    return (
      <div className="workout-mode-screen">
        <div className="card" style={{ textAlign: "center", padding: 40, margin: "auto" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>Nenhum treino registrado para hoje.</p>
          <button className="btn btn-primary" style={{ width: "auto" }} onClick={() => nav("/ficha")}>Voltar para Ficha</button>
        </div>
      </div>
    );
  }

  if (finalizado) {
    return (
      <div className="workout-mode-screen">
        <WorkoutFinish
          stats={{
            totalExercicios: exercicios.length,
            tempoGastoSegundos: Math.round((Date.now() - inicioTreino) / 1000),
          }}
          onHome={() => nav("/")}
          onVerFicha={() => nav("/ficha")}
        />
      </div>
    );
  }

  return (
    <div className="workout-mode-screen">
      <header className="workout-header">
        <div>
          <p className="workout-header-eyebrow">Treino de Hoje</p>
          <h1 className="workout-header-title">{diaLabel}</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="icon-btn" onClick={pausarESair} title="Pausar treino">
            <Pause size={16} />
          </button>
          <button className="icon-btn" onClick={cancelarTreino} title="Cancelar treino">
            <X size={16} />
          </button>
        </div>
      </header>

      <WorkoutProgress atual={indiceAtual + 1} total={exercicios.length} />

      <div key={indiceAtual} className="workout-exercise-transition">
        {descansando ? (
          <RestTimer
            tempoInicial={parseInt(exercicioAtual.descanso, 10) || 60}
            onFinish={() => {}}
            onCancel={() => setDescansando(false)}
          />
        ) : (
          <WorkoutExercise
            exercicio={exercicioAtual}
            video={videoAtual}
            seriesConcluidas={seriesAtuais}
            onConcluirSerie={concluirSerie}
          />
        )}
      </div>

      {!descansando && (
        <button
          className="btn btn-primary workout-next-btn"
          disabled={!todasSeriesFeitas}
          onClick={avancarExercicio}
        >
          {ehUltimoExercicio ? "Concluir Treino 🎉" : "➡ Próximo Exercício"}
        </button>
      )}

      {proximoExercicio && !descansando && (
        <p className="workout-next-preview">
          A seguir: <b>{proximoExercicio.nome}</b>
        </p>
      )}
    </div>
  );
}