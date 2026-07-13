// ============================================================
// Perfil.jsx — Perfil do Aluno.
// Exibe foto, nome, email, dados, seletor de tema e permite sair da conta.
// ============================================================
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../services/AuthContext.jsx";
import { useTheme } from "../../services/ThemeContext.jsx";
import { LogOut, Camera, Check } from "lucide-react";

function comprimirImagem(file, tamanho = 200, qualidade = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = tamanho;
        canvas.height = tamanho;
        const ctx = canvas.getContext("2d");
        const lado = Math.min(img.width, img.height);
        const offsetX = (img.width - lado) / 2;
        const offsetY = (img.height - lado) / 2;
        ctx.drawImage(img, offsetX, offsetY, lado, lado, 0, 0, tamanho, tamanho);
        resolve(canvas.toDataURL("image/jpeg", qualidade));
      };
      img.onerror = () => reject(new Error("Não foi possível carregar a imagem."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

const TEMAS = [
  { id: "vermelho", label: "Vermelho", cor: "#dc2626" },
  { id: "preto", label: "Preto", cor: "#000000" },
  { id: "branco", label: "Branco", cor: "#ffffff" },
];

export default function Perfil() {
  const { user, profile, saveProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const nav = useNavigate();
  const fileInputRef = useRef(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const iniciais = (profile?.nome || "?")[0].toUpperCase();

  const sair = async () => {
    await logout();
    nav("/login", { replace: true });
  };

  const escolherFoto = () => fileInputRef.current?.click();

  const onFotoSelecionada = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErro("Selecione um arquivo de imagem válido.");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      const base64 = await comprimirImagem(file, 200, 0.7);
      await saveProfile({ foto: base64 });
    } catch (err) {
      setErro("Não foi possível salvar a foto. Tente uma imagem menor.");
    } finally {
      setEnviando(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <h1 className="section-title" style={{ fontSize: 28, fontWeight: 800 }}>Perfil</h1>

      <div className="card" style={{ textAlign: "center", padding: 32 }}>
        <div
          className="hero-avatar"
          style={{
            margin: "0 auto 16px", width: 88, height: 88, fontSize: 32,
            background: "var(--gradient-red)", position: "relative",
            cursor: "pointer", overflow: "hidden", borderRadius: "50%",
          }}
          onClick={escolherFoto}
          title="Clique para alterar a foto"
        >
          {profile?.foto ? (
            <img src={profile.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : user?.photoURL ? (
            <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            iniciais
          )}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "rgba(0,0,0,0.55)", display: "flex",
            alignItems: "center", justifyContent: "center", padding: "4px 0",
          }}>
            <Camera size={14} color="#fff" />
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFotoSelecionada} />

        {enviando && <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 8 }}>Enviando foto...</p>}
        {erro && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 8 }}>{erro}</p>}

        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{profile?.nome || "Aluno"}</h2>
        <p style={{ color: "var(--text-muted)", marginTop: 4 }}>{user?.email}</p>
      </div>

      <div className="stat-grid" style={{ marginTop: 20 }}>
        <div className="card stat"><span>Peso</span><b>{profile?.peso || "-"} kg</b></div>
        <div className="card stat"><span>Altura</span><b>{profile?.altura || "-"} cm</b></div>
        <div className="card stat"><span>Idade</span><b>{profile?.idade || "-"}</b></div>
        <div className="card stat"><span>Objetivo</span><b style={{ fontSize: 15 }}>{profile?.objetivo || "-"}</b></div>
      </div>

      <h3 className="section-title" style={{ marginTop: 8 }}>Tema</h3>
      <div className="card">
        <div className="theme-picker">
          {TEMAS.map((t) => (
            <button
              key={t.id}
              className={`theme-option ${theme === t.id ? "selected" : ""}`}
              onClick={() => setTheme(t.id)}
              type="button"
            >
              <div className="theme-swatch" style={{ background: t.cor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {theme === t.id && <Check size={16} color={t.id === "branco" ? "#111" : "#fff"} />}
              </div>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-danger" style={{ marginTop: 24 }} onClick={sair}>
        <LogOut size={16}/> Sair da conta
      </button>
    </div>
  );
}