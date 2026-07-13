// ============================================================
// Videos.jsx — Biblioteca de vídeos do Aluno.
// Carrega public/videos/videos.json, filtra por categoria e busca.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { loadVideos, CATEGORIAS } from "../../services/videos.js";
import VideoPlayer from "../../components/VideoPlayer.jsx";
import { Play, Search } from "lucide-react";

export default function Videos() {
  const [all, setAll] = useState([]);
  const [cat, setCat] = useState("Todos");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos().then((v) => { setAll(v); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return all.filter((v) => {
      const okCat = cat === "Todos" || v.categoria === cat;
      const okQ = !q || v.titulo.toLowerCase().includes(q.toLowerCase());
      return okCat && okQ;
    });
  }, [all, cat, q]);

  return (
    <div>
      <h1 className="section-title" style={{ fontSize: 28, fontWeight: 800 }}>Biblioteca</h1>

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
          {filtered.map((v, i) => (
            <div key={i} className="video-card" onClick={() => setSelected(v)}>
              <div className="video-thumb"><Play fill="white" /></div>
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