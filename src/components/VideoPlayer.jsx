// ============================================================
// VideoPlayer.jsx — Modal com player HTML5 nativo (suporta tela cheia).
// ============================================================
import { X } from "lucide-react";

export default function VideoPlayer({ video, onClose }) {
  if (!video) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Fechar"><X /></button>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <video src={video.arquivo} controls autoPlay playsInline />
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