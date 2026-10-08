// ============================================================
// ModelosFicha.jsx — Reaproveitar treinos entre alunos.
//
// Faz 3 coisas:
//   1. "Salvar como modelo"  -> guarda a ficha aberta como modelo reutilizável.
//   2. "Usar modelo"         -> carrega um modelo na ficha aberta (o autosave grava no aluno).
//   3. "Enviar para vários alunos" -> aplica este treino em vários alunos de uma vez.
//
// Props:
//   ficha            ficha aberta no editor
//   alunos           lista de alunos [{ id, nome, ... }]
//   alunoAtualId     aluno aberto no editor (fica fora da lista de destino)
//   onUsarModelo(estrutura)  chamado ao carregar um modelo no editor
//   onToast({type,msg})      mostra avisos
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { BookmarkPlus, LayoutTemplate, Users, X, Trash2, Search } from "lucide-react";
import {
  listarModelos, salvarModelo, deletarModelo, extrairEstrutura,
  contarExercicios, aplicarEstruturaEmAlunos,
} from "../services/modelos.js";
import { listarFichas } from "../services/fichas.js";

export default function ModelosFicha({ ficha, alunos = [], alunoAtualId, onUsarModelo, onToast }) {
  const [modelos, setModelos] = useState([]);
  const [modeloId, setModeloId] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const total = contarExercicios(ficha);
  const modeloSel = modelos.find((m) => m.id === modeloId);

  const recarregar = () =>
    listarModelos().then(setModelos).catch(() => setModelos([]));

  useEffect(() => { recarregar(); }, []);

  const salvarComoModelo = async () => {
    if (!total) return onToast({ type: "error", msg: "Adicione exercícios antes de salvar como modelo." });
    const nome = window.prompt("Nome do modelo (ex: Hipertrofia ABC – Iniciante):");
    if (!nome || !nome.trim()) return;
    setOcupado(true);
    try {
      const novo = await salvarModelo(nome, ficha);
      await recarregar();
      setModeloId(novo.id);
      onToast({ type: "success", msg: `Modelo "${novo.nome}" salvo!` });
    } catch (e) {
      onToast({ type: "error", msg: "Erro ao salvar modelo: " + (e.message || "verifique o Firebase.") });
    } finally { setOcupado(false); }
  };

  const usarModelo = () => {
    if (!modeloSel) return;
    if (total > 0 && !window.confirm(`Substituir os exercícios atuais pelo modelo "${modeloSel.nome}"? (o histórico guarda a versão anterior)`)) return;
    onUsarModelo(extrairEstrutura(modeloSel));
    onToast({ type: "success", msg: `Modelo "${modeloSel.nome}" carregado.` });
  };

  const excluirModelo = async () => {
    if (!modeloSel) return;
    if (!window.confirm(`Excluir o modelo "${modeloSel.nome}"? As fichas dos alunos não são afetadas.`)) return;
    try {
      await deletarModelo(modeloSel.id);
      setModeloId("");
      await recarregar();
      onToast({ type: "success", msg: "Modelo excluído." });
    } catch (e) {
      onToast({ type: "error", msg: "Erro ao excluir modelo." });
    }
  };

  return (
    <div className="card" style={{ marginBottom: 20, maxWidth: 640 }}>
      <h3 style={{ marginBottom: 6, fontSize: 16, fontWeight: 700 }}>
        <LayoutTemplate size={16} style={{ display: "inline", verticalAlign: "-2px" }} /> Modelos de treino
      </h3>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 14 }}>
        Monte o treino uma vez e reaproveite em outros alunos. Os dados pessoais (nome, peso, altura, objetivo) de cada aluno são mantidos.
      </p>

      <div className="field">
        <label>Usar um modelo salvo</label>
        <select className="select" value={modeloId} onChange={(e) => setModeloId(e.target.value)}>
          <option value="">— escolher modelo —</option>
          {modelos.map((m) => (
            <option key={m.id} value={m.id}>{m.nome} ({contarExercicios(m)} exercícios)</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button type="button" className="btn btn-secondary" style={{ width: "auto" }} disabled={!modeloSel} onClick={usarModelo}>
          <LayoutTemplate size={16} /> Carregar modelo
        </button>
        <button type="button" className="btn btn-secondary" style={{ width: "auto" }} disabled={ocupado} onClick={salvarComoModelo}>
          <BookmarkPlus size={16} /> Salvar como modelo
        </button>
        <button type="button" className="btn btn-primary" style={{ width: "auto" }} disabled={!total} onClick={() => setModalAberto(true)}>
          <Users size={16} /> Enviar para vários alunos
        </button>
        {modeloSel && (
          <button type="button" className="btn btn-danger" style={{ width: "auto" }} onClick={excluirModelo}>
            <Trash2 size={16} /> Excluir modelo
          </button>
        )}
      </div>

      {modalAberto && (
        <EnviarVariosModal
          estrutura={extrairEstrutura(ficha)}
          alunos={alunos.filter((a) => a.id !== alunoAtualId)}
          onClose={() => setModalAberto(false)}
          onToast={onToast}
        />
      )}
    </div>
  );
}

// Modal: escolher alunos e aplicar o treino em todos de uma vez.
function EnviarVariosModal({ estrutura, alunos, onClose, onToast }) {
  const [busca, setBusca] = useState("");
  const [marcados, setMarcados] = useState({});
  const [comFicha, setComFicha] = useState({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarFichas().then((lista) => {
      const mapa = {};
      lista.forEach((f) => { if (contarExercicios(f) > 0) mapa[f.id] = true; });
      setComFicha(mapa);
    });
  }, []);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return alunos
      .filter((a) => !q || String(a.nome || a.email || "").toLowerCase().includes(q))
      .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
  }, [alunos, busca]);

  const ids = Object.keys(marcados).filter((id) => marcados[id]);
  const vaiSubstituir = ids.filter((id) => comFicha[id]).length;

  const alternar = (id) => setMarcados((m) => ({ ...m, [id]: !m[id] }));
  const marcarTodos = () => {
    const todos = filtrados.every((a) => marcados[a.id]);
    setMarcados((m) => {
      const novo = { ...m };
      filtrados.forEach((a) => { novo[a.id] = !todos; });
      return novo;
    });
  };

  const enviar = async () => {
    if (!ids.length) return;
    const aviso = vaiSubstituir
      ? `${vaiSubstituir} aluno(s) já têm ficha e terão o treino substituído (a versão anterior fica no histórico). Continuar?`
      : `Enviar este treino para ${ids.length} aluno(s)?`;
    if (!window.confirm(aviso)) return;
    setEnviando(true);
    const destino = alunos.filter((a) => marcados[a.id]);
    const r = await aplicarEstruturaEmAlunos(estrutura, destino);
    setEnviando(false);
    if (r.erro.length) {
      onToast({ type: "error", msg: `${r.ok.length} enviado(s), ${r.erro.length} com erro: ${r.erro[0].msg}` });
    } else {
      onToast({ type: "success", msg: `Treino enviado para ${r.ok.length} aluno(s)!` });
      onClose();
    }
  };

  return (
    <div className="picker-overlay" onClick={enviando ? undefined : onClose}>
      <div className="picker-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="picker-header">
          <b>Enviar treino para vários alunos</b>
          <button className="icon-btn" onClick={onClose} disabled={enviando} aria-label="Fechar"><X size={16} /></button>
        </div>

        <div className="picker-search">
          <Search size={16} />
          <input className="input" placeholder="Buscar aluno..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>

        <div className="picker-body">
          <label style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 0", fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={filtrados.length > 0 && filtrados.every((a) => marcados[a.id])} onChange={marcarTodos} />
            Selecionar todos ({filtrados.length})
          </label>
          {filtrados.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhum aluno encontrado.</p>}
          {filtrados.map((a) => (
            <label key={a.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 0", fontSize: 14, cursor: "pointer", borderTop: "1px solid var(--border)" }}>
              <input type="checkbox" checked={!!marcados[a.id]} onChange={() => alternar(a.id)} />
              <span style={{ flex: 1 }}>{a.nome || a.email || a.id}</span>
              {comFicha[a.id] && <span className="picker-tag">já tem ficha</span>}
            </label>
          ))}
        </div>

        <div className="picker-footer">
          <button className="btn btn-primary" disabled={!ids.length || enviando} onClick={enviar}>
            {enviando ? "Enviando..." : `Enviar para ${ids.length} aluno(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
