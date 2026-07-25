// ============================================================
// Perfil.jsx — Perfil do Aluno.
// Exibe foto, nome, email, dados, seletor de tema e permite sair da conta.
// ============================================================
import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../services/AuthContext.jsx";
import { useTheme } from "../../services/ThemeContext.jsx";
import Toast from "../../components/Toast.jsx";
import { Camera, Check, Settings, Save, X } from "lucide-react";

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

const OBJETIVOS = ["Hipertrofia", "Emagrecimento", "Condicionamento", "Saúde", "Definição"];
const NIVEIS = ["Iniciante", "Intermediário", "Avançado"];
const SEXOS = ["Masculino", "Feminino", "Outro"];

const camposIniciais = (p = {}) => ({
  nome: p.nome || "",
  telefone: p.telefone || "",
  nascimento: p.nascimento || "",
  peso: p.peso || "",
  altura: p.altura || "",
  sexo: p.sexo || "",
  objetivo: p.objetivo || "Hipertrofia",
  nivel: p.nivel || "Iniciante",
});

export default function Perfil() {
  const { user, profile, saveProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef(null);
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState(() => camposIniciais(profile));
  const [salvando, setSalvando] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Recarrega o formulário quando o profile chega/atualiza
  useEffect(() => {
    setForm(camposIniciais(profile));
    setDirty(false);
  }, [profile]);

  const iniciais = (profile?.nome || "?")[0].toUpperCase();

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setDirty(true);
  };

  const escolherFoto = () => fileInputRef.current?.click();

  const onFotoSelecionada = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToast({ type: "error", msg: "Selecione um arquivo de imagem válido." });
      return;
    }
    setEnviando(true);
    try {
      const base64 = await comprimirImagem(file, 200, 0.7);
      await saveProfile({ foto: base64 });
      setToast({ type: "success", msg: "Foto atualizada." });
    } catch (err) {
      setToast({ type: "error", msg: "Não foi possível salvar a foto." });
    } finally {
      setEnviando(false);
      e.target.value = "";
    }
  };

  const salvar = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setToast({ type: "error", msg: "O nome é obrigatório." });
      return;
    }
    setSalvando(true);
    try {
      await saveProfile(form);
      setDirty(false);
      setToast({ type: "success", msg: "Dados atualizados com sucesso." });
    } catch (err) {
      setToast({ type: "error", msg: "Erro ao atualizar." });
    } finally {
      setSalvando(false);
    }
  };

  const cancelar = () => {
    setForm(camposIniciais(profile));
    setDirty(false);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Perfil</h1>
        <Link to="/configuracoes" className="icon-btn" aria-label="Configurações" title="Configurações"
          style={{ width: 40, height: 40, borderRadius: 12 }}>
          <Settings size={18} />
        </Link>
      </div>

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

        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{profile?.nome || "Aluno"}</h2>
        <p style={{ color: "var(--text-muted)", marginTop: 4 }}>{user?.email}</p>
      </div>

      <h3 className="section-title" style={{ marginTop: 24 }}>Meus dados</h3>
      <form onSubmit={salvar} className="card">
        <div className="field"><label>Nome</label>
          <input className="input" value={form.nome} onChange={set("nome")} required />
        </div>
        <div className="field"><label>Telefone</label>
          <input className="input" type="tel" value={form.telefone} onChange={set("telefone")} placeholder="(00) 00000-0000" />
        </div>
        <div className="field"><label>Data de nascimento</label>
          <input className="input" type="date" value={form.nascimento} onChange={set("nascimento")} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="field"><label>Peso (kg)</label>
            <input className="input" type="number" step="0.1" value={form.peso} onChange={set("peso")} />
          </div>
          <div className="field"><label>Altura (cm)</label>
            <input className="input" type="number" value={form.altura} onChange={set("altura")} />
          </div>
        </div>
        <div className="field"><label>Sexo</label>
          <select className="select" value={form.sexo} onChange={set("sexo")}>
            <option value="">Selecione</option>
            {SEXOS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="field"><label>Objetivo</label>
          <select className="select" value={form.objetivo} onChange={set("objetivo")}>
            {OBJETIVOS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="field"><label>Nível de treino</label>
          <select className="select" value={form.nivel} onChange={set("nivel")}>
            {NIVEIS.map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={!dirty || salvando}>
            <Save size={16} /> {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={cancelar} disabled={!dirty || salvando}>
            <X size={16} /> Cancelar
          </button>
        </div>
      </form>

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

      <Link to="/configuracoes" className="btn btn-secondary" style={{ marginTop: 24 }}>
        <Settings size={16} /> Configurações e Segurança
      </Link>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}