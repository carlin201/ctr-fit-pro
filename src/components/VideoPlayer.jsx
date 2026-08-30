// ============================================================
// VideoPlayer.jsx — Modal de vídeo em tela cheia (YouTube embed).
// Regras de UX:
//   • abre sobre toda a tela, sem precisar rolar a página
//   • bloqueia o scroll do body enquanto está aberto
//   • fecha no X grande (canto superior direito) ou com ESC
//   • mantém a posição de scroll da página ao fechar
//   • mostra "carregando" enquanto o YouTube inicializa
//   • botão de tela cheia (Fullscreen API), sem sair do app
// Se não houver youtubeId, mostra card "Vídeo ainda não disponível."
// ============================================================
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, VideoOff, Maximize2, Loader2 } from "lucide-react";
import { temVideo } from "../services/videos.js";
import CleanYoutubePlayer from "./CleanYoutubePlayer.jsx";

export default function VideoPlayer({ video, onClose }) {
  const stageRef = useRef(null);
  const [carregando, setCarregando] = useState(true);

  const aberto = Boolean(video);

  // Fechar com ESC
  useEffect(() => {
    if (!aberto) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto, onClose]);

  // Bloqueia o scroll da página sem perder a posição atual
  useEffect(() => {
    if (!aberto) return undefined;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setCarregando(true);
    return () => { document.body.style.overflow = anterior; };
  }, [aberto, video?.id]);

  if (!aberto) return null;

  const telaCheia = () => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  };

  return createPortal(
    <div className="video-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <button className="video-modal-close" onClick={onClose} aria-label="Fechar vídeo">
        <X size={26} />
      </button>

      <div className="video-modal-inner" onClick={(e) => e.stopPropagation()}>
        <div className="video-modal-stage" ref={stageRef}>
          {temVideo(video) ? (
            <>
              <CleanYoutubePlayer
                youtubeId={video.youtubeId}
                title={video.titulo}
                onReady={() => setCarregando(false)}
              />
              {carregando && (
                <div className="video-modal-loading">
                  <Loader2 size={30} className="spin" />
                  <span>Carregando vídeo...</span>
                </div>
              )}
              <button className="video-modal-fs" onClick={telaCheia} aria-label="Tela cheia">
                <Maximize2 size={18} />
              </button>
            </>
          ) : (
            <div className="video-unavailable">
              <VideoOff size={28} />
              <p>Vídeo ainda não disponível.</p>
            </div>
          )}
        </div>

        <div className="video-modal-info">
          {video.categoria && <span className="video-modal-cat">{video.categoria}</span>}
          <h3>{video.titulo}</h3>
          {video.descricao && <p>{video.descricao}</p>}
        </div>
      </div>
    </div>,
    document.body
  );
}
