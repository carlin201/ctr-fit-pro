// ============================================================
// FichasProntas.jsx — Fichas prontas (modelos) do Personal.
//
// O personal cria o treino UMA vez (sem escolher aluno), salva e depois
// compartilha com um ou vários alunos. Usa a coleção "modelos_treino"
// (services/modelos.js) e o modal de envio de ModelosFicha.jsx.
//
// Telas:
//   - Lista: busca, editar, duplicar, excluir e compartilhar.
//   - Editor: nome do modelo + dias + exercícios (da Biblioteca).
// ============================================================
import { useEffect, useMemo, useState } from "react";
import {
  listarModelos, salvarModelo, atualizarModelo, deletarModelo,
  extrairEstrutura, contarExercicios,
} from "../../services/modelos.js";
import {
  listarAlunos, fichaVazia, DIAS_LABEL, diasOrdenados, rotuloDoDia,
} from "../../services/fichas.js";
import {
  carregarBiblioteca, resolverExercicio, CATEGORIAS_BIBLIOTECA,
} from "../../services/biblioteca.js";
import ExercisePicker from "../../components/ExercisePicker.jsx";
import { EnviarVariosModal } from "../../components/ModelosFicha.jsx";
import Toast from "../../components/Toast.jsx";
import {
  Plus, Search, Pencil, Copy, Trash2, Share2, Save, ArrowLeft, ChevronUp, ChevronDown,
} from "lucide-react";

const CATEGORIAS_DIA = [
  ...CATEGORIAS_BIBLIOTECA,
  "Braços", "Peito e Tríceps", "Costas e Bíceps",
  "Superiores", "Inferiores", "Full Body", "Descanso",
];

export default function FichasProntas() {
  const [modelos, setModelos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [biblioteca, setBiblioteca] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(null); // { id|null, nome, ficha }
  const [compartilhando, setCompartilhando] = useState(null); // modelo
  const [pickerDia, setPickerDia] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState(null);

  const recarregar = () =>
    listarModelos().then(setModelos).catch(() => setModelos([])).finally(() => setCarregando(false));

  useEffect(() => {
    recarregar();
    listarAlunos().then(setAlunos).catch(() => setAlunos([]));
    carregarBiblioteca().then(setBiblioteca).catch(() => setBiblioteca([]));
  }, []);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return modelos.filter((m) => !q || String(m.nome || "").toLowerCase().includes(q));
  }, [modelos, busca]);

  // ---------- ações da lista ----------
  const novo = () => setEditando({ id: null, nome: "", ficha: fichaVazia() });

  const editar = (m) =>
    setEditando({ id: m.id, nome: m.nome || "", ficha: { ...fichaVazia(), ...extrairEstrutura(m) } });

  const duplicar = async (m) => {
    try {
      await salvarModelo(`Cópia de ${m.nome}`, m);
      await recarregar();
      setToast({ type: "success", msg: "Ficha pronta duplicada." });
    } catch {
      setToast({ type: "error", msg: "Erro ao duplicar." });
    }
  };

  const excluir = async (m) => {
    if (!window.confirm(`Excluir a ficha pronta "${m.nome}"? As fichas dos alunos não são afetadas.`)) return;
    try {
      await deletarModelo(m.id);
      await recarregar();
      setToast({ type: "success", msg: "Ficha pronta excluída." });
    } catch {
      setToast({ type: "error", msg: "Erro ao excluir." });
    }
  };

  // ---------- ações do editor ----------
  const setFicha = (fn) => setEditando((e) => ({ ...e, ficha: fn(e.ficha) }));
  const setDia = (dia, arr) => setFicha((f) => ({ ...f, dias: { ...f.dias, [dia]: arr } }));

  const adicionarExercicio = (dia, ex) =>
    setDia(dia, [
      ...(editando.ficha.dias[dia] || []),
      { exercicioId: ex.id, series: "4", reps: "10", descanso: "60s", carga: "", obs: "" },
    ]);

  const atualizarExercicio = (dia, i, k, v) => {
    const arr = [...(editando.ficha.dias[dia] || [])];
    arr[i] = { ...arr[i], [k]: v };
    setDia(dia, arr);
  };

  const removerExercicio = (dia, i) =>
    setDia(dia, (editando.ficha.dias[dia] || []).filter((_, idx) => idx !== i));

  const moverExercicio = (dia, i, delta) => {
    const arr = [...(editando.ficha.dias[dia] || [])];
    const j = i + delta;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setDia(dia, arr);
  };

  const setCategoria = (dia, cat) =>
    setFicha((f) => ({ ...f, categorias: { ...(f.categorias || {}), [dia]: cat } }));

  const setNomeDia = (dia, nome) =>
    setFicha((f) => ({ ...f, nomesDias: { ...(f.nomesDias || {}), [dia]: nome } }));

  const salvarEdicao = async () => {
    const nome = editando.nome.trim();
    if (!nome) return setToast({ type: "error", msg: "Dê um nome para a ficha pronta." });
    if (!contarExercicios(editando.ficha)) return setToast({ type: "error", msg: "Adicione ao menos um exercício." });
    setSalvando(true);
    try {
      if (editando.id) await atualizarModelo(editando.id, nome, editando.ficha);
      else await salvarModelo(nome, editando.ficha);
      await recarregar();
      setEditando(null);
      setToast({ type: "success", msg: "Ficha pronta salva!" });
    } catch (e) {
      setToast({ type: "error", msg: "Erro ao salvar: " + (e.message || "verifique o Firebase.") });
    } finally {
      setSalvando(false);
    }
  };

  const sairEditor = () => {
    if (window.confirm("Sair sem salvar? As alterações serão perdidas.")) setEditando(null);
  };

  // ============================================================
  // EDITOR
  // ============================================================
  if (editando) {
    const { ficha } = editando;
    return (
      <div>
        <button className="btn btn-secondary" style={{ width: "auto", marginBottom: 16 }} onClick={sairEditor}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>
          {editando.id ? "Editar ficha pronta" : "Nova ficha pronta"}
        </h1>

        <div className="card" style={{ marginBottom: 20, maxWidth: 640 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Nome da ficha pronta</label>
            <input
              className="input"
              placeholder="ex: Hipertrofia ABC – Iniciante"
              value={editando.nome}
              onChange={(e) => setEditando((x) => ({ ...x, nome: e.target.value }))}
            />
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 10 }}>
            {contarExercicios(ficha)} exercícios. Dados do aluno (nome, peso, altura, objetivo) não entram aqui.
          </p>
        </div>

        {diasOrdenados(ficha).map((dia) => {
          const lista = ficha.dias[dia] || [];
          return (
            <details key={dia} className="dia-editor" open={lista.length > 0}>
              <summary>
                <span>
                  {rotuloDoDia(ficha, dia)}
                  <span style={{ color: "var(--text-muted)", fontWeight: 400 }}> ({lista.length} exercícios)</span>
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: "auto", padding: "8px 12px", fontSize: 13 }}
                  onClick={(e) => { e.preventDefault(); setPickerDia(dia); }}
                >
                  <Plus size={14} /> Adicionar Exercício
                </button>
              </summary>

              <div className="dia-config">
                <div className="field" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: 12 }}>Nome do dia (opcional)</label>
                  <input
                    className="input"
                    placeholder={DIAS_LABEL[dia]}
                    value={ficha.nomesDias?.[dia] || ""}
                    onChange={(e) => setNomeDia(dia, e.target.value)}
                  />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: 12 }}>Categoria do treino</label>
                  <select className="select" value={ficha.categorias?.[dia] || ""} onChange={(e) => setCategoria(dia, e.target.value)}>
                    <option value="">— sem categoria —</option>
                    {CATEGORIAS_DIA.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {lista.length === 0 && (
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Dia sem exercícios.</p>
              )}

              {lista.map((item, i) => {
                const ex = resolverExercicio(item, biblioteca);
                return (
                  <div key={i} className="ex-card">
                    <div className="ex-card-head">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <b className="ex-nome">{ex.nome}</b>
                        <div className="ex-meta">
                          {ex.categoria && <span className="picker-tag">{ex.categoria}</span>}
                        </div>
                      </div>
                      <button type="button" className="icon-btn" disabled={i === 0} onClick={() => moverExercicio(dia, i, -1)} aria-label="Subir"><ChevronUp size={14} /></button>
                      <button type="button" className="icon-btn" disabled={i === lista.length - 1} onClick={() => moverExercicio(dia, i, 1)} aria-label="Descer"><ChevronDown size={14} /></button>
                      <button type="button" className="icon-btn" onClick={() => removerExercicio(dia, i)} aria-label="Remover"><Trash2 size={14} /></button>
                    </div>
                    <div className="ex-grid">
                      {[["series", "Séries"], ["reps", "Repetições"], ["descanso", "Descanso"], ["carga", "Carga (opcional)"]].map(([k, rotulo]) => (
                        <div key={k} className="field" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 11 }}>{rotulo}</label>
                          <input className="input" value={item[k] || ""} onChange={(e) => atualizarExercicio(dia, i, k, e.target.value)} />
                        </div>
                      ))}
                    </div>
                    <input
                      className="input"
                      style={{ marginTop: 8 }}
                      placeholder="Observações (opcional)"
                      value={item.obs || ""}
                      onChange={(e) => atualizarExercicio(dia, i, "obs", e.target.value)}
                    />
                  </div>
                );
              })}
            </details>
          );
        })}

        <div style={{ display: "flex", gap: 12, marginTop: 20, maxWidth: 640 }}>
          <button className="btn btn-primary" style={{ width: "auto" }} disabled={salvando} onClick={salvarEdicao}>
            <Save size={16} /> {salvando ? "Salvando..." : "Salvar ficha pronta"}
          </button>
        </div>

        <ExercisePicker
          aberto={Boolean(pickerDia)}
          biblioteca={biblioteca}
          categoriaInicial={pickerDia ? (ficha.categorias?.[pickerDia] || "") : ""}
          onSelecionar={(ex) => adicionarExercicio(pickerDia, ex)}
          onClose={() => setPickerDia(null)}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  // ============================================================
  // LISTA
  // ============================================================
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Fichas Prontas</h1>
        <button className="btn btn-primary" style={{ width: "auto" }} onClick={novo}>
          <Plus size={16} /> Nova ficha pronta
        </button>
      </div>

      <div className="field" style={{ position: "relative", maxWidth: 640 }}>
        <Search size={18} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-muted)" }} />
        <input className="input" style={{ paddingLeft: 42 }} placeholder="Buscar ficha pronta..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>{filtrados.length} ficha(s) pronta(s)</p>

      <div style={{ maxWidth: 640 }}>
        {carregando && <p style={{ color: "var(--text-muted)" }}>Carregando...</p>}
        {!carregando && filtrados.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>
            Nenhuma ficha pronta ainda. Clique em "Nova ficha pronta" para criar a primeira.
          </p>
        )}
        {filtrados.map((m) => (
          <div key={m.id} className="card" style={{ marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{m.nome}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "4px 0 12px" }}>
              {contarExercicios(m)} exercícios · {diasOrdenados(m).filter((d) => (m.dias?.[d] || []).length).length} dia(s) de treino
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button className="btn btn-primary" style={{ width: "auto", padding: "8px 12px", fontSize: 13 }} onClick={() => setCompartilhando(m)}>
                <Share2 size={14} /> Compartilhar com alunos
              </button>
              <button className="btn btn-secondary" style={{ width: "auto", padding: "8px 12px", fontSize: 13 }} onClick={() => editar(m)}>
                <Pencil size={14} /> Editar
              </button>
              <button className="btn btn-secondary" style={{ width: "auto", padding: "8px 12px", fontSize: 13 }} onClick={() => duplicar(m)}>
                <Copy size={14} /> Duplicar
              </button>
              <button className="btn btn-danger" style={{ width: "auto", padding: "8px 12px", fontSize: 13 }} onClick={() => excluir(m)}>
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {compartilhando && (
        <EnviarVariosModal
          estrutura={extrairEstrutura(compartilhando)}
          alunos={alunos}
          onClose={() => setCompartilhando(null)}
          onToast={setToast}
        />
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
