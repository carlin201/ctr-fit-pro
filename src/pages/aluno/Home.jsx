// ============================================================
// Home.jsx — Tela inicial do Aluno.
// Mostra foto, nome, treino de hoje, últimos vídeos, banner e frase motivacional.
// ============================================================
import { useEffect, useState } from "react";
import { useAuth } from "../../services/AuthContext.jsx";
import { carregarFicha, DIAS, DIAS_LABEL } from "../../services/fichas.js";
import { loadVideos } from "../../services/videos.js";
import { Play } from "lucide-react";

const FRASES = [
  "Consistência supera intensidade. Um treino leve feito hoje vale mais que o treino perfeito de amanhã.",
  "Seu único limite é você mesmo ontem.",
  "Não pare quando estiver cansado, pare quando terminar.",
  "Todo treino é um passo mais perto do seu objetivo.",
  "Disciplina é escolher entre o que você quer agora e o que você quer mais.",
];

function diaDaSemanaAtual() {
  const idx = new Date().getDay(); // 0 = domingo
  const mapa = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  return mapa[idx];
}

export default function Home() {
  const { user, profile } = useAuth();
  const primeiroNome = (profile?.nome || "Aluno").split(" ")[0];
  const iniciais = primeiroNome[0]?.toUpperCase() || "?";
  const saudacao = getSaudacao();
  const frase = useState(() => FRASES[Math.floor(Math.random() * FRASES.length)])[0];

  const [treinoHoje, setTreinoHoje] = useState(null);
  const [carregandoTreino, setCarregandoTreino] = useState(true);
  const [ultimosVideos, setUltimosVideos] = useState([]);

  useEffect(() => {
    if (user?.uid) {
      carregarFicha(user.uid)
        .then((ficha) => {
          const dia = diaDaSemanaAtual();
          setTreinoHoje(ficha?.dias?.[dia] || []);
        })
        .catch(() => setTreinoHoje([]))
        .finally(() => setCarregandoTreino(false));
    } else {
      setCarregandoTreino(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadVideos().then((videos) => setUltimosVideos(videos.slice(0, 6)));
  }, []);

  const diaLabel = DIAS_LABEL[diaDaSemanaAtual()] || "Hoje";

  return (
    <div>
      <div className="hero-card">
        <div className="hero-avatar">
          {profile?.foto ? (
            <img src={profile.foto} alt={primeiroNome} />
          ) : user?.photoURL ? (
            <img src={user.photoURL} alt={primeiroNome} />
          ) : (
            iniciais
          )}
        </div>
        <div className="hero-text">
          <h2>{saudacao}, {primeiroNome} 👋</h2>
          <p>Pronto para treinar hoje?</p>
        </div>
      </div>

      <div className="banner-academia">
        <span>💪 CTR Fitness — sua evolução começa aqui</span>
      </div>

      <h3 className="section-title">Treino de hoje · {diaLabel}</h3>
      <div className="card" style={{ marginBottom: 24 }}>
        {carregandoTreino ? (
          <p style={{ color: "var(--text-muted)" }}>Carregando...</p>
        ) : treinoHoje && treinoHoje.length > 0 ? (
          treinoHoje.map((ex, i) => (
            <div key={i} className="exercicio" style={{ marginBottom: i === treinoHoje.length - 1 ? 0 : 8 }}>
              <h4>{ex.nome || "Exercício"}</h4>
              <p>{ex.series} séries × {ex.reps} reps · descanso {ex.descanso}</p>
            </div>
          ))
        ) : (
          <p style={{ color: "var(--text-muted)" }}>Nenhum treino registrado para hoje. Aproveite para descansar ou revisar sua ficha completa.</p>
        )}
      </div>

      {ultimosVideos.length > 0 && (
        <>
          <h3 className="section-title">Últimos vídeos</h3>
          <div className="mini-video-row">
            {ultimosVideos.map((v, i) => (
              <div key={i} className="mini-video-card">
                <div className="mini-video-thumb"><Play fill="white" /></div>
                <p>{v.titulo}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <h3 className="section-title">Seus dados</h3>
      <div className="stat-grid">
        <div className="card stat"><span>Peso</span><b>{profile?.peso || "-"} kg</b></div>
        <div className="card stat"><span>Altura</span><b>{profile?.altura || "-"} cm</b></div>
        <div className="card stat"><span>Idade</span><b>{profile?.idade || "-"}</b></div>
        <div className="card stat"><span>Objetivo</span><b style={{ fontSize: 16 }}>{profile?.objetivo || "-"}</b></div>
      </div>

      <h3 className="section-title">Dica CTR</h3>
      <div className="card">
        <p style={{ lineHeight: 1.6, color: "var(--text-muted)" }}>{frase}</p>
      </div>
    </div>
  );
}

function getSaudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}