// ============================================================
// ExercisePicker.jsx — Modal de seleção de exercícios da Biblioteca.
// Pesquisa em tempo real, filtro por categoria, lista A-Z agrupada,
// ícone indicando vídeo e pré-visualização antes de adicionar.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { Search, X, PlayCircle, VideoOff, Plus, ArrowLeft } from "lucide-react";
import {
  CATEGORIAS_BIBLIOTECA,
  filtrarBiblioteca,
  agruparPorCategoria,
} from "../services/biblioteca.js";
import CleanYoutubePlayer from "./CleanYoutubePlayer.jsx";

export default function ExercisePicker({ aberto, biblioteca = [], categoriaInicial = "", onSelecionar, onClose }) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState(categoriaInicial || "");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (aberto) {
      setBusca("");
      setCategoria(categoriaInicial || "");
      setPreview(null);
    }
  }, [aberto, categoriaInicial]);

  const grupos = useMemo(
    () => agruparPorCategoria(filtrarBiblioteca(biblioteca, { busca, categoria })),
    [biblioteca, busca, categoria]
  );

  if (!aberto) return null;

  const total = grupos.reduce((s, g) => s + g.itens.length, 0);

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-sheet" onClick={(e) => e.stopPropagation()}>
        {preview ? (
          <>
            <div className="picker-header">
              <button className="icon-btn" onClick={() => setPreview(null)} aria-label="Voltar"><ArrowLeft size={16} /></button>
              <b>Pré-visualização</b>
              <button className="icon-btn" onClick={onClose} aria-label="Fechar"><X size={16} /></button>
            </div>
            <div className="picker-body">
              {preview.temVideo ? (
                <CleanYoutubePlayer youtubeId={preview.youtubeId} title={preview.titulo} />
              ) : (
                <div className="picker-sem-video"><VideoOff size={22} /> Vídeo ainda não disponível.</div>
              )}
              <h3 className="picker-preview-titulo">{preview.titulo}</h3>
              <span className="picker-tag">{preview.categoria}</span>
              {preview.descricao && <p className="picker-preview-desc">{preview.descricao}</p>}
            </div>
            <div className="picker-footer">
              <button className="btn btn-primary" onClick={() => { onSelecionar(preview); onClose(); }}>
                <Plus size={16} /> Adicionar à ficha
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="picker-header">
              <b>Biblioteca de Exercícios</b>
              <button className="icon-btn" onClick={onClose} aria-label="Fechar"><X size={16} /></button>
            </div>

            <div className="picker-search">
              <Search size={16} />
              <input
                className="input"
                autoFocus
                placeholder="Pesquisar exercício..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className="picker-chips">
              <button className={`chip ${!categoria ? "active" : ""}`} onClick={() => setCategoria("")}>Todos</button>
              {CATEGORIAS_BIBLIOTECA.map((c) => (
                <button key={c} className={`chip ${categoria === c ? "active" : ""}`} onClick={() => setCategoria(c)}>{c}</button>
              ))}
            </div>

            <div className="picker-body">
              {total === 0 && (
                <p className="picker-vazio">Nenhum exercício encontrado para essa pesquisa.</p>
              )}
              {grupos.map((g) => (
                <div key={g.categoria} className="picker-grupo">
                  <p className="picker-grupo-titulo">{g.categoria} <span>({g.itens.length})</span></p>
                  {g.itens.map((e) => (
                    <div key={e.id} className="picker-item">
                      <button className="picker-item-main" onClick={() => setPreview(e)}>
                        <span className="picker-item-icon">
                          {e.temVideo ? <PlayCircle size={18} /> : <VideoOff size={18} />}
                        </span>
                        <span>
                          <b>{e.titulo}</b>
                          <small>{e.categoria}</small>
                        </span>
                      </button>
                      <button
                        className="icon-btn"
                        aria-label={`Adicionar ${e.titulo}`}
                        onClick={() => { onSelecionar(e); onClose(); }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
