// ============================================================
// MinhaFicha.jsx — Ficha de treino do Aluno.
// Carrega automaticamente a ficha enviada pelo personal.
// Permite baixar PDF, compartilhar no WhatsApp e iniciar o Modo Treino.
// ============================================================
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../services/AuthContext.jsx";
import { carregarFicha, diasOrdenados, nomeDoDia, rotuloDoDia } from "../../services/fichas.js";
import { gerarPDFFicha } from "../../services/pdf.js";
import {
  diaDaSemanaAtual, encontrarVideoDoExercicio,
  carregarConcluidos, salvarConcluidos,
} from "../../services/workout.js";
import { loadVideos } from "../../services/videos.js";
import { resolverExercicio } from "../../services/biblioteca.js";
import VideoPlayer from "../../components/VideoPlayer.jsx";
import { Download, Share2, Play, History, Check } from "lucide-react";

export default function MinhaFicha() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [videoAberto, setVideoAberto] = useState(null);
  const [diaAtivo, setDiaAtivo] = useState(diaDaSemanaAtual());
  const [concluidos, setConcluidos] = useState([]);

  useEffect(() => {
    if (!user) return;
    carregarFicha(user.uid).then((f) => { setFicha(f); setLoading(false); });
    loadVideos().then(setVideos);
  }, [user]);

  useEffect(() => {
    if (user?.uid) setConcluidos(carregarConcluidos(user.uid, diaAtivo));
  }, [user?.uid, diaAtivo]);

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

  const diaHoje = diaDaSemanaAtual();
  const temTreinoHoje = (ficha.dias?.[diaHoje] || []).length > 0;
  const dataAtualizacao = ficha.updatedAt ? new Date(ficha.updatedAt).toLocaleDateString("pt-BR") : "-";

  const compartilhar = () => {
    let txt = `🏋️ *Ficha CTR Fitness* — ${ficha.nome}\n\n`;
    diasOrdenados(ficha).forEach((d) => {
      const exs = ficha.dias?.[d] || [];
      if (!exs.length) return;
      txt += `*${rotuloDoDia(ficha, d)}*\n`;
      exs.forEach((item, i) => {
        const e = resolverExercicio(item, videos);
        txt += `${i + 1}. ${e.nome} — ${e.series}x${e.reps} (${e.descanso})${e.carga ? ` · ${e.carga}` : ""}\n`;
      });
      txt += "\n";
    });
    const url = `https://wa.me/?text=${encodeURIComponent(txt)}`;
    window.open(url, "_blank");
  };

  const ordem = diasOrdenados(ficha);
  const listaDia = ficha.dias?.[diaAtivo] || [];
  const feitos = listaDia.filter((_, i) => concluidos.includes(i)).length;
  const percentual = listaDia.length ? Math.round((feitos / listaDia.length) * 100) : 0;

  const alternarConcluido = (i) => {
    const novo = concluidos.includes(i) ? concluidos.filter((x) => x !== i) : [...concluidos, i];
    setConcluidos(novo);
    if (user?.uid) salvarConcluidos(user.uid, diaAtivo, novo);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Minha Ficha</h1>
        <Link to="/historico" className="icon-btn" title="Histórico" aria-label="Histórico"
          style={{ width: 40, height: 40, borderRadius: 12 }}>
          <History size={18} />
        </Link>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Professor</p>
            <b style={{ fontSize: 16 }}>{ficha.professor || "-"}</b>
          </div>
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Atualizada em</p>
            <b style={{ fontSize: 16 }}>{dataAtualizacao}</b>
          </div>
        </div>
        {ficha.objetivo && (
          <p style={{ marginTop: 12, color: "var(--text-muted)" }}>🎯 {ficha.objetivo}</p>
        )}
      </div>

      {temTreinoHoje && (
        <button
          className="btn btn-primary"
          style={{ marginBottom: 16, fontSize: 16, padding: "16px 20px" }}
          onClick={() => nav("/treino")}
        >
          <Play size={18} fill="white" /> Iniciar Treino
        </button>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button className="btn btn-secondary" onClick={() => gerarPDFFicha(ficha, videos)}><Download size={16}/> PDF</button>
        <button className="btn btn-secondary" onClick={compartilhar}><Share2 size={16}/> WhatsApp</button>
      </div>

      {/* Abas de dias (respeita a ordem e os nomes definidos pelo personal) */}
      <div className="ficha-dias">
        {ordem.map((d) => {
          const qtd = (ficha.dias?.[d] || []).length;
          return (
            <button
              key={d}
              className={`ficha-dia-tab ${diaAtivo === d ? "active" : ""}`}
              onClick={() => setDiaAtivo(d)}
            >
              {nomeDoDia(ficha, d)}
              <small>{ficha.categorias?.[d] || (qtd ? `${qtd} exercícios` : "Descanso")}</small>
            </button>
          );
        })}
      </div>

      {/* Progresso do treino do dia */}
      {listaDia.length > 0 && (
        <div className="ficha-progress">
          <div className="ficha-progress-track">
            <div className="ficha-progress-fill" style={{ width: `${percentual}%` }} />
          </div>
          <div className="ficha-progress-label">
            <span>{feitos}/{listaDia.length} exercícios concluídos</span>
            <span>{percentual}%</span>
          </div>
        </div>
      )}

      <div className="card dia-card">
        <h3 style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
          {nomeDoDia(ficha, diaAtivo)}
          {ficha.categorias?.[diaAtivo] && (
            <span style={{ marginLeft: 6, color: "var(--primary)" }}>• {ficha.categorias[diaAtivo]}</span>
          )}
        </h3>

        {listaDia.length === 0 ? (
          <p className="empty-day">Descanso</p>
        ) : listaDia.map((item, i) => {
          const ex = resolverExercicio(item, videos);
          const video = ex.temVideo
            ? { id: `${diaAtivo}-${i}`, titulo: ex.nome, youtubeId: ex.youtubeId, descricao: ex.descricao, categoria: ex.categoria }
            : encontrarVideoDoExercicio(videos, ex.nome);
          const feito = concluidos.includes(i);
          return (
            <div key={i} className={`exercicio ficha-ex ficha-card ${feito ? "feito" : ""}`}>
              <div className="ficha-card-head">
                <button
                  className={`ficha-check ${feito ? "on" : ""}`}
                  onClick={() => alternarConcluido(i)}
                  aria-label={feito ? "Desmarcar exercício" : "Marcar como concluído"}
                >
                  <Check size={16} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ textDecoration: feito ? "line-through" : "none" }}>{ex.nome}</h4>
                  <div className="ficha-specs">
                    <span className="ficha-spec"><b>{ex.series}</b> séries</span>
                    <span className="ficha-spec"><b>{ex.reps}</b> repetições</span>
                    {ex.descanso && <span className="ficha-spec">Descanso <b>{ex.descanso}</b></span>}
                    {ex.carga && <span className="ficha-spec">Carga <b>{ex.carga}</b></span>}
                    {ex.tempo && <span className="ficha-spec">Tempo <b>{ex.tempo}</b></span>}
                    {ex.distancia && <span className="ficha-spec">Distância <b>{ex.distancia}</b></span>}
                  </div>
                  {ex.obs && <p className="ficha-obs">{ex.obs}</p>}
                </div>
              </div>
              {video && (
                <button
                  className="btn btn-secondary ficha-ex-video"
                  onClick={() => setVideoAberto(video)}
                >
                  <Play size={14} /> Assistir Execução
                </button>
              )}
            </div>
          );
        })}
      </div>

      <VideoPlayer video={videoAberto} onClose={() => setVideoAberto(null)} />
    </div>
  );
}