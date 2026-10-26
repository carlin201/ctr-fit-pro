// ============================================================
// FaleConosco.jsx — Página PÚBLICA (sem login) para enviar
// reclamação, sugestão ou elogio. Rota: /fale-conosco
// ============================================================
import { useState } from "react";
import { enviarMensagem, TIPOS, ASSUNTOS } from "../services/mensagens.js";
import Toast from "../components/Toast.jsx";
import { Send } from "lucide-react";

const ESPERA_MS = 60 * 1000; // 1 envio por minuto por aparelho

export default function FaleConosco() {
  const [tipo, setTipo] = useState("Reclamação");
  const [setor, setSetor] = useState(ASSUNTOS[0]);
  const [mensagem, setMensagem] = useState("");
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [website, setWebsite] = useState(""); // armadilha anti-robô
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [toast, setToast] = useState(null);

  const enviar = async (e) => {
    e.preventDefault();
    if (website) return; // robô
    if (mensagem.trim().length < 10) {
      return setToast({ type: "error", msg: "Escreva uma mensagem com pelo menos 10 caracteres." });
    }
    let ultimo = 0;
    try { ultimo = Number(localStorage.getItem("ctr_msg_ultimo") || 0); } catch { /* ignora */ }
    if (Date.now() - ultimo < ESPERA_MS) {
      return setToast({ type: "error", msg: "Aguarde um minuto para enviar outra mensagem." });
    }
    setEnviando(true);
    try {
      await enviarMensagem({ tipo, setor, mensagem, nome, contato });
      try { localStorage.setItem("ctr_msg_ultimo", String(Date.now())); } catch { /* ignora */ }
      setEnviado(true);
    } catch {
      setToast({ type: "error", msg: "Não foi possível enviar agora. Tente novamente." });
    } finally {
      setEnviando(false);
    }
  };

  const novaMensagem = () => {
    setMensagem(""); setNome(""); setContato(""); setEnviado(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <img src="/img/logo.png" alt="CTR" style={{ height: 56, marginBottom: 12 }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "4px 0 6px" }}>Fale com a gente</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
          Envie uma reclamação, sugestão ou elogio. Sua mensagem chega direto para a administração.
          Você pode enviar sem se identificar.
        </p>

        {enviado ? (
          <div className="card" style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>Mensagem enviada!</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>Obrigado por ajudar a melhorar a nossa academia.</p>
            <button className="btn btn-secondary" onClick={novaMensagem}>Enviar outra mensagem</button>
          </div>
        ) : (
          <form className="card" onSubmit={enviar} noValidate>
            <div className="field">
              <label>O que você quer enviar?</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {TIPOS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={"chip" + (tipo === t ? " active" : "")}
                    style={{ justifyContent: "center" }}
                    onClick={() => setTipo(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Sobre qual assunto?</label>
              <select className="select" value={setor} onChange={(e) => setSetor(e.target.value)}>
                {ASSUNTOS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Sua mensagem *</label>
              <textarea
                className="input"
                style={{ minHeight: 130, resize: "vertical" }}
                maxLength={2000}
                placeholder="Conte com detalhes o que aconteceu ou o que você sugere..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Seu nome (opcional)</label>
              <input className="input" maxLength={80} placeholder="Deixe em branco para enviar anonimamente" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>

            <div className="field">
              <label>Telefone ou e-mail (opcional)</label>
              <input className="input" maxLength={80} placeholder="Só se quiser receber uma resposta" value={contato} onChange={(e) => setContato(e.target.value)} />
            </div>

            {/* anti-spam: pessoas não veem, robôs preenchem */}
            <div aria-hidden="true" style={{ position: "absolute", left: -9999, height: 0, overflow: "hidden" }}>
              <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            <button className="btn btn-primary" disabled={enviando}>
              <Send size={16} /> {enviando ? "Enviando..." : "Enviar"}
            </button>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12, textAlign: "center" }}>
              Suas informações são usadas apenas para tratar sua mensagem.
            </p>
          </form>
        )}
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
}
