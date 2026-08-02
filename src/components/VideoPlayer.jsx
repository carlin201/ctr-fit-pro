// ============================================================
// VideoPlayer.jsx — Modal com player do YouTube (iframe embed).
// Se o vídeo não tiver youtubeId preenchido, mostra um card elegante
// avisando que o vídeo ainda não está disponível.
// ============================================================
import { X, VideoOff } from "lucide-react";
import { youtubeEmbedUrl, temVideo } from "../services/videos.js";

export default function VideoPlayer({ video, onClose }) {
  if (!video) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Fechar"><X /></button>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {temVideo(video) ? (
          <div className="yt-frame">
            <iframe
              src={youtubeEmbedUrl(video.youtubeId, true)}
              title={video.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          <div className="video-unavailable">
            <VideoOff size={28} />
            <p>Vídeo ainda não disponível.</p>
          </div>
        )}
        <div className="modal-body">
          <span style={{ color: "var(--primary)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>
            {video.categoria}
          </span>
          <h3 style={{ fontSize: 22, fontWeight: 700, margin: "6px 0 8px" }}>{video.titulo}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.5 }}>{video.descricao}</p>
        </div>
      </div>
    </div>
  );
}