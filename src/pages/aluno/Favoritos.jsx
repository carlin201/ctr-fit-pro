// ============================================================
// Favoritos.jsx — Lista dos vídeos favoritados pelo aluno.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../services/AuthContext.jsx";
import { loadVideos, carregarPreferenciasVideos, toggleFavoritoVideo } from "../../services/videos.js";
import VideoPlayer from "../../components/VideoPlayer.jsx";
import { ChevronLeft, Heart, Play } from "lucide-react";

export default function Favoritos() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [prefs, setPrefs] = useState({ ids: [] });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadVideos(),
      user?.uid ? carregarPreferenciasVideos(user.uid) : Promise.resolve({ ids: [] }),
    ]).then(([v, p]) => {
      setVideos(v);
      setPrefs(p);
      setLoading(false);
    });
  }, [user?.uid]);

  const favoritos = useMemo(
    () => videos.filter((v) => prefs.ids.includes(v.id)),
    [videos, prefs]
  );

  const desfavoritar = async (e, v) => {
    e.stopPropagation();
    if (!user?.uid) return;
    const novos = await toggleFavoritoVideo(user.uid, v.id, prefs.ids);
    setPrefs({ ...prefs, ids: novos });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Link to="/videos" className="icon-btn" aria-label="Voltar" style={{ width: 36, height: 36 }}>
          <ChevronLeft size={18} />
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Meus favoritos</h1>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Carregando...</p>
      ) : favoritos.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <Heart size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text-muted)" }}>Você ainda não favoritou nenhum vídeo.</p>
        </div>
      ) : (
        <div className="video-grid">
          {favoritos.map((v, i) => (
            <div key={i} className="video-card" onClick={() => setSelected(v)}>
              <div className="video-thumb">
                {v.miniatura ? <img src={v.miniatura} alt={v.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Play fill="white" />}
                <button className="fav-btn" onClick={(e) => desfavoritar(e, v)} aria-label="Remover">
                  <Heart size={16} fill="#ef4444" color="#ef4444" />
                </button>
              </div>
              <div className="video-info">
                <h4>{v.titulo}</h4>
                <span>{v.categoria}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <VideoPlayer video={selected} onClose={() => setSelected(null)} />
    </div>
  );
}