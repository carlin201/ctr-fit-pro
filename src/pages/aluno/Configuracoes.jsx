// ============================================================
// Configuracoes.jsx — Central de configurações do Aluno.
// Reúne: acesso rápido ao perfil, ações de segurança (alterar senha,
// alterar e-mail, excluir conta), informações do app e logout.
// ============================================================
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../services/AuthContext.jsx";
import Toast from "../../components/Toast.jsx";
import {
  User, KeyRound, Mail, Info, FileText, ShieldCheck,
  LogOut, Trash2, ChevronRight, X,
} from "lucide-react";

const APP_VERSION = "1.1.0";

// Identifica se o usuário logado usa provider Google (bloqueia troca de senha)
function useIsGoogleUser() {
  const { user } = useAuth();
  return user?.providerData?.[0]?.providerId === "google.com";
}

// Linha clicável no estilo iOS/Apple
function Row({ icon: Icon, label, onClick, danger, to }) {
  const Comp = to ? Link : "button";
  const props = to ? { to } : { onClick, type: "button" };
  return (
    <Comp
      {...props}
      className="config-row"
      style={{ color: danger ? "#ef4444" : "var(--text)" }}
    >
      <span className="config-row-left">
        <Icon size={18} />
        <span>{label}</span>
      </span>
      <ChevronRight size={16} style={{ opacity: 0.5 }} />
    </Comp>
  );
}

// Modal reutilizável simples
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
            <button className="icon-btn" onClick={onClose} aria-label="Fechar"><X size={16} /></button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Configuracoes() {
  const { user, logout, changePassword, changeEmail, deleteAccount } = useAuth();
  const nav = useNavigate();
  const isGoogle = useIsGoogleUser();
  const [modal, setModal] = useState(null); // "senha" | "email" | "excluir" | "sobre" | "privacidade" | "termos"
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(false);

  // Estados dos formulários
  const [pwd, setPwd] = useState({ atual: "", nova: "", conf: "" });
  const [mail, setMail] = useState({ atual: "", novoEmail: "" });
  const [del, setDel] = useState({ atual: "", confirmar: "" });

  const fechar = () => { setModal(null); setPwd({ atual: "", nova: "", conf: "" }); setMail({ atual: "", novoEmail: "" }); setDel({ atual: "", confirmar: "" }); };

  const sair = async () => {
    await logout();
    nav("/login", { replace: true });
  };

  const submitSenha = async (e) => {
    e.preventDefault();
    if (pwd.nova.length < 6) return setToast({ type: "error", msg: "A nova senha deve ter no mínimo 6 caracteres." });
    if (pwd.nova !== pwd.conf) return setToast({ type: "error", msg: "As senhas não conferem." });
    setBusy(true);
    try {
      await changePassword(pwd.atual, pwd.nova);
      setToast({ type: "success", msg: "Senha atualizada com sucesso." });
      fechar();
    } catch (err) {
      setToast({ type: "error", msg: traduzirErro(err) });
    } finally { setBusy(false); }
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    if (!mail.novoEmail.includes("@")) return setToast({ type: "error", msg: "E-mail inválido." });
    setBusy(true);
    try {
      await changeEmail(mail.atual, mail.novoEmail);
      setToast({ type: "success", msg: "E-mail atualizado com sucesso." });
      fechar();
    } catch (err) {
      setToast({ type: "error", msg: traduzirErro(err) });
    } finally { setBusy(false); }
  };

  const submitExcluir = async (e) => {
    e.preventDefault();
    if (del.confirmar !== "EXCLUIR") return setToast({ type: "error", msg: "Digite EXCLUIR para confirmar." });
    setBusy(true);
    try {
      await deleteAccount(del.atual);
      nav("/login", { replace: true });
    } catch (err) {
      setToast({ type: "error", msg: traduzirErro(err) });
    } finally { setBusy(false); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 20 }}>Configurações</h1>

      <h3 className="section-title">Conta</h3>
      <div className="config-group">
        <Row icon={User} label="Perfil" to="/perfil" />
        <Row icon={KeyRound} label="Alterar senha" onClick={() => setModal("senha")} />
        <Row icon={Mail} label="Alterar e-mail" onClick={() => setModal("email")} />
      </div>

      <h3 className="section-title" style={{ marginTop: 24 }}>Sobre o aplicativo</h3>
      <div className="config-group">
        <Row icon={Info} label={`Versão ${APP_VERSION}`} onClick={() => setModal("sobre")} />
        <Row icon={ShieldCheck} label="Política de privacidade" onClick={() => setModal("privacidade")} />
        <Row icon={FileText} label="Termos de uso" onClick={() => setModal("termos")} />
      </div>

      <h3 className="section-title" style={{ marginTop: 24 }}>Sessão</h3>
      <div className="config-group">
        <Row icon={LogOut} label="Sair da conta" onClick={sair} />
        <Row icon={Trash2} label="Excluir conta" onClick={() => setModal("excluir")} danger />
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center", marginTop: 24 }}>
        CTR Fitness · v{APP_VERSION}
      </p>

      {/* ============ MODAIS ============ */}
      {modal === "senha" && (
        <Modal title="Alterar senha" onClose={fechar}>
          {isGoogle ? (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              Sua conta usa login com Google. A senha é gerenciada diretamente pela sua conta Google.
            </p>
          ) : (
            <form onSubmit={submitSenha}>
              <div className="field"><label>Senha atual</label>
                <input className="input" type="password" required value={pwd.atual} onChange={(e) => setPwd({ ...pwd, atual: e.target.value })} />
              </div>
              <div className="field"><label>Nova senha</label>
                <input className="input" type="password" required value={pwd.nova} onChange={(e) => setPwd({ ...pwd, nova: e.target.value })} />
              </div>
              <div className="field"><label>Confirmar nova senha</label>
                <input className="input" type="password" required value={pwd.conf} onChange={(e) => setPwd({ ...pwd, conf: e.target.value })} />
              </div>
              <button className="btn btn-primary" disabled={busy}>{busy ? "Salvando..." : "Alterar senha"}</button>
            </form>
          )}
        </Modal>
      )}

      {modal === "email" && (
        <Modal title="Alterar e-mail" onClose={fechar}>
          <form onSubmit={submitEmail}>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>E-mail atual: <b>{user?.email}</b></p>
            {!isGoogle && (
              <div className="field"><label>Senha atual</label>
                <input className="input" type="password" required value={mail.atual} onChange={(e) => setMail({ ...mail, atual: e.target.value })} />
              </div>
            )}
            <div className="field"><label>Novo e-mail</label>
              <input className="input" type="email" required value={mail.novoEmail} onChange={(e) => setMail({ ...mail, novoEmail: e.target.value })} />
            </div>
            <button className="btn btn-primary" disabled={busy}>{busy ? "Salvando..." : "Alterar e-mail"}</button>
          </form>
        </Modal>
      )}

      {modal === "excluir" && (
        <Modal title="Excluir conta" onClose={fechar}>
          <p style={{ fontSize: 14, marginBottom: 14, color: "#ef4444" }}>
            Esta ação é <b>irreversível</b>. Todos os seus dados, ficha e histórico serão apagados.
          </p>
          <form onSubmit={submitExcluir}>
            {!isGoogle && (
              <div className="field"><label>Senha atual</label>
                <input className="input" type="password" required value={del.atual} onChange={(e) => setDel({ ...del, atual: e.target.value })} />
              </div>
            )}
            <div className="field"><label>Digite <b>EXCLUIR</b> para confirmar</label>
              <input className="input" required value={del.confirmar} onChange={(e) => setDel({ ...del, confirmar: e.target.value })} />
            </div>
            <button className="btn btn-danger" disabled={busy} style={{ background: "#ef4444", color: "white", borderColor: "#ef4444" }}>
              <Trash2 size={16} /> {busy ? "Excluindo..." : "Excluir minha conta"}
            </button>
          </form>
        </Modal>
      )}

      {modal === "sobre" && (
        <Modal title="Sobre o CTR Fitness" onClose={fechar}>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
            CTR Fitness é o aplicativo oficial da academia para acompanhamento de treinos,
            fichas personalizadas e evolução dos alunos.
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10 }}>Versão {APP_VERSION}</p>
        </Modal>
      )}

      {modal === "privacidade" && (
        <Modal title="Política de privacidade" onClose={fechar}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, maxHeight: 320, overflow: "auto" }}>
            <p>Seus dados pessoais são armazenados de forma segura e usados exclusivamente para personalizar seu treino e comunicação com o seu personal trainer.</p>
            <p style={{ marginTop: 10 }}>Não compartilhamos suas informações com terceiros. Você pode solicitar a exclusão dos seus dados a qualquer momento pela opção "Excluir conta".</p>
          </div>
        </Modal>
      )}

      {modal === "termos" && (
        <Modal title="Termos de uso" onClose={fechar}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, maxHeight: 320, overflow: "auto" }}>
            <p>Ao utilizar o CTR Fitness você concorda em fornecer informações verdadeiras e a utilizá-lo apenas para fins pessoais de acompanhamento de treinos.</p>
            <p style={{ marginTop: 10 }}>O aplicativo não substitui a orientação de um profissional de educação física. Sempre siga as orientações do seu personal.</p>
          </div>
        </Modal>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

function traduzirErro(err) {
  const code = err?.code || "";
  if (code.includes("wrong-password")) return "Senha atual incorreta.";
  if (code.includes("invalid-credential")) return "Credenciais inválidas.";
  if (code.includes("requires-recent-login")) return "Faça login novamente para continuar.";
  if (code.includes("email-already-in-use")) return "E-mail já está em uso.";
  if (code.includes("invalid-email")) return "E-mail inválido.";
  if (code.includes("weak-password")) return "Senha muito fraca.";
  if (code.includes("popup-closed-by-user")) return "Autenticação cancelada.";
  return err?.message || "Erro ao processar. Tente novamente.";
}