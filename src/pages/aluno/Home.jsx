// ============================================================
// Home.jsx — Tela inicial do Aluno.
// Mostra foto, nome, treino de hoje, último treino realizado,
// últimos vídeos, banner e frase motivacional.
// ============================================================
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../services/AuthContext.jsx";
import { carregarFicha, DIAS_LABEL } from "../../services/fichas.js";
import { loadVideos } from "../../services/videos.js";
import { diaDaSemanaAtual, formatarTempo } from "../../services/workout.js";
import { ClipboardList, PlayCircle, TrendingUp, Target, Weight, Ruler, ArrowRight } from "lucide-react";

const FRASES = [
  "Consistência supera intensidade. Um treino leve feito hoje vale mais que o treino perfeito de amanhã.",
  "Seu único limite é você mesmo ontem.",
  "Não pare quando estiver cansado, pare quando terminar.",
  "Todo treino é um passo mais perto do seu objetivo.",
  "Disciplina é escolher entre o que você quer agora e o que você quer mais.",
];

export default function Home() {
  const { user, profile } = useAuth();
  const primeiroNome = (profile?.nome || "Aluno").split(" ")[0];
  const iniciais = primeiroNome[0]?.toUpperCase() || "?";
  const saudacao = getSaudacao();
  const frase = useState(() => FRASES[Math.floor(Math.random() * FRASES.length)])[0];

  const [treinoHoje, setTreinoHoje] = useState(null);
  const [carregandoTreino, setCarregandoTreino] = useState(true);
  const [totalVideos, setTotalVideos] = useState(0);
  const [ficha, setFicha] = useState(null);
  const [totalExerciciosFicha, setTotalExerciciosFicha] = useState(0);

  useEffect(() => {
    if (user?.uid) {
      carregarFicha(user.uid)
        .then((f) => {
          setFicha(f);
          const dia = diaDaSemanaAtual();
          setTreinoHoje(f?.dias?.[dia] || []);
          // Conta total de exercícios cadastrados na semana toda
          const total = f?.dias
            ? Object.values(f.dias).reduce((acc, arr) => acc + (arr?.length || 0), 0)
            : 0;
          setTotalExerciciosFicha(total);
        })
        .catch(() => setTreinoHoje([]))
        .finally(() => setCarregandoTreino(false));
    } else {
      setCarregandoTreino(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadVideos().then((videos) => setTotalVideos(videos.length));
  }, []);

  const diaLabel = DIAS_LABEL[diaDaSemanaAtual()] || "Hoje";
  const ultimoTreino = profile?.ultimoTreino;
  const dataUltimaFicha = ficha?.updatedAt ? new Date(ficha.updatedAt).toLocaleDateString("pt-BR") : "-";

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

      {/* Ações rápidas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <Link to="/ficha" className="card action-card">
          <ClipboardList size={22} />
          <b>Minha ficha</b>
          <ArrowRight size={14} className="action-arrow" />
        </Link>
        <Link to="/videos" className="card action-card">
          <PlayCircle size={22} />
          <b>Biblioteca</b>
          <ArrowRight size={14} className="action-arrow" />
        </Link>
        <Link to="/evolucao" className="card action-card">
          <TrendingUp size={22} />
          <b>Evolução</b>
          <ArrowRight size={14} className="action-arrow" />
        </Link>
        <Link to="/historico" className="card action-card">
          <ClipboardList size={22} />
          <b>Histórico</b>
          <ArrowRight size={14} className="action-arrow" />
        </Link>
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

      {/* Resumo de conteúdo */}
      <h3 className="section-title">Resumo</h3>
      <div className="stat-grid">
        <div className="card stat">
          <span>Última ficha</span>
          <b style={{ fontSize: 16 }}>{dataUltimaFicha}</b>
        </div>
        <div className="card stat">
          <span>Exercícios</span>
          <b>{totalExerciciosFicha}</b>
        </div>
        <div className="card stat">
          <span>Vídeos</span>
          <b>{totalVideos}</b>
        </div>
        <div className="card stat">
          <span>Último acesso</span>
          <b style={{ fontSize: 15 }}>{ultimoTreino ? new Date(ultimoTreino.data).toLocaleDateString("pt-BR") : "-"}</b>
        </div>
      </div>

      {ultimoTreino && (
        <>
          <h3 className="section-title">Último treino</h3>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="stat-grid" style={{ marginBottom: 0 }}>
              <div className="stat">
                <span>Data</span>
                <b style={{ fontSize: 15 }}>{new Date(ultimoTreino.data).toLocaleDateString("pt-BR")}</b>
              </div>
              <div className="stat">
                <span>Hora</span>
                <b style={{ fontSize: 15 }}>{new Date(ultimoTreino.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</b>
              </div>
              <div className="stat"><span>Exercícios</span><b>{ultimoTreino.quantidadeExercicios}</b></div>
              <div className="stat"><span>Tempo</span><b>{formatarTempo(ultimoTreino.tempoGastoSegundos)}</b></div>
            </div>
          </div>
        </>
      )}

      <h3 className="section-title">Seus dados</h3>
      <div className="stat-grid">
        <div className="card stat"><Weight size={14} style={{ color: "var(--primary)" }} /><span>Peso</span><b>{profile?.peso || "-"} kg</b></div>
        <div className="card stat"><Ruler size={14} style={{ color: "var(--primary)" }} /><span>Altura</span><b>{profile?.altura || "-"} cm</b></div>
        <div className="card stat"><Target size={14} style={{ color: "var(--primary)" }} /><span>Objetivo</span><b style={{ fontSize: 15 }}>{profile?.objetivo || "-"}</b></div>
        <div className="card stat"><span>Nível</span><b style={{ fontSize: 15 }}>{profile?.nivel || "-"}</b></div>
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