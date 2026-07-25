// ============================================================
// Videos.jsx — Biblioteca de vídeos do Aluno.
// Carrega public/videos/videos.json, filtra por categoria e busca.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadVideos, CATEGORIAS, carregarPreferenciasVideos, toggleFavoritoVideo, registrarVisualizacao } from "../../services/videos.js";
import { useAuth } from "../../services/AuthContext.jsx";
import VideoPlayer from "../../components/VideoPlayer.jsx";
import { Play, Search, Heart } from "lucide-react";

export default function Videos() {
  const { user } = useAuth();
  const [all, setAll] = useState([]);
  const [cat, setCat] = useState("Todos");
  const [q, setQ] = useState("");
  const [aba, setAba] = useState("todos"); // "todos" | "recentes" | "populares"
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState({ ids: [], visualizacoes: {}, recentes: [] });

  useEffect(() => {
    loadVideos().then((v) => { setAll(v); setLoading(false); });
  }, []);

  useEffect(() => {
    if (user?.uid) carregarPreferenciasVideos(user.uid).then(setPrefs);
  }, [user?.uid]);

  const filtered = useMemo(() => {
    let base = all.filter((v) => {
      const okCat = cat === "Todos" || v.categoria === cat;
      const okQ = !q || v.titulo.toLowerCase().includes(q.toLowerCase());
      return okCat && okQ;
    });
    if (aba === "recentes") {
      base = prefs.recentes
        .map((id) => base.find((v) => String(v.id) === String(id)))
        .filter(Boolean);
    } else if (aba === "populares") {
      base = [...base].sort((a, b) => (prefs.visualizacoes[b.id] || 0) - (prefs.visualizacoes[a.id] || 0));
    }
    return base;
  }, [all, cat, q, aba, prefs]);

  const abrir = async (v) => {
    setSelected(v);
    if (user?.uid) {
      const novo = await registrarVisualizacao(user.uid, v.id, prefs);
      setPrefs(novo);
    }
  };

  const favoritar = async (e, v) => {
    e.stopPropagation();
    if (!user?.uid) return;
    const novos = await toggleFavoritoVideo(user.uid, v.id, prefs.ids);
    setPrefs({ ...prefs, ids: novos });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Biblioteca</h1>
        <Link to="/favoritos" className="icon-btn" title="Favoritos" aria-label="Favoritos"
          style={{ width: 40, height: 40, borderRadius: 12 }}>
          <Heart size={18} />
        </Link>
      </div>

      <div className="field" style={{ position: "relative" }}>
        <Search size={18} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-muted)" }} />
        <input
          className="input"
          style={{ paddingLeft: 42 }}
          placeholder="Buscar exercício..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="chip-row">
        <button className={`chip ${aba === "todos" ? "active" : ""}`} onClick={() => setAba("todos")}>Todos</button>
        <button className={`chip ${aba === "recentes" ? "active" : ""}`} onClick={() => setAba("recentes")}>Recentes</button>
        <button className={`chip ${aba === "populares" ? "active" : ""}`} onClick={() => setAba("populares")}>Mais assistidos</button>
      </div>

      <div className="chip-row">
        <button className={`chip ${cat === "Todos" ? "active" : ""}`} onClick={() => setCat("Todos")}>Todos</button>
        {CATEGORIAS.map((c) => (
          <button key={c} className={`chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Carregando vídeos...</p>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--text-muted)" }}>
            Nenhum vídeo encontrado. Adicione arquivos em <code>public/videos/</code> e registre em <code>videos.json</code>.
          </p>
        </div>
      ) : (
        <div className="video-grid">
          {filtered.map((v, i) => {
            const isFav = prefs.ids.includes(v.id);
            return (
              <div key={i} className="video-card" onClick={() => abrir(v)}>
                <div className="video-thumb">
                  {v.miniatura ? <img src={v.miniatura} alt={v.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Play fill="white" />}
                  <button className="fav-btn" onClick={(e) => favoritar(e, v)} aria-label="Favoritar" title="Favoritar">
                    <Heart size={16} fill={isFav ? "#ef4444" : "none"} color={isFav ? "#ef4444" : "white"} />
                  </button>
                </div>
                <div className="video-info">
                  <h4>{v.titulo}</h4>
                  <span>{v.categoria}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <VideoPlayer video={selected} onClose={() => setSelected(null)} />
    </div>
  );
}