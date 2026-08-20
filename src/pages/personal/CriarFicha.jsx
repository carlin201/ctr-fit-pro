// ============================================================
// CriarFicha.jsx — Editor de ficha de treino (modelo profissional).
// Fluxo:
//   1. Selecionar aluno (ou vir pré-selecionado via ?aluno=ID na URL).
//   2. Preencher dados (nome, peso, altura, objetivo, professor).
//   3. Definir a categoria do treino de cada dia (ex: "Segunda • Peito").
//   4. Adicionar exercícios pela Biblioteca de Exercícios (videos.json).
//   5. Ajustar séries, reps, descanso, carga e observações.
//   6. Autosave, PDF, envio ao aluno e exclusão da ficha.
//
// Na ficha salvamos apenas: exercicioId, series, reps, descanso, carga, obs.
// Nome/categoria/vídeo vêm da Biblioteca automaticamente.
// ============================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listarAlunos, salvarFicha, carregarFicha, deletarFicha, fichaVazia, DIAS, DIAS_LABEL, diasOrdenados, nomeDoDia, rotuloDoDia } from "../../services/fichas.js";
import { gerarPDFFicha } from "../../services/pdf.js";
import {
  carregarBiblioteca, resolverExercicio, CATEGORIAS_BIBLIOTECA,
} from "../../services/biblioteca.js";
import ExercisePicker from "../../components/ExercisePicker.jsx";
import Toast from "../../components/Toast.jsx";
import { Plus, Trash2, Save, Download, Send, Copy, GripVertical, PlayCircle, VideoOff, CopyPlus, ChevronUp, ChevronDown } from "lucide-react";

// Categorias de treino do dia (biblioteca + combinações comuns)
const CATEGORIAS_DIA = [
  ...CATEGORIAS_BIBLIOTECA,
  "Braços",
  "Peito e Tríceps",
  "Costas e Bíceps",
  "Superiores",
  "Inferiores",
  "Full Body",
  "Descanso",
];

export default function CriarFicha() {
  const [searchParams] = useSearchParams();
  const [alunos, setAlunos] = useState([]);
  const [alunoId, setAlunoId] = useState("");
  const [ficha, setFicha] = useState(fichaVazia());
  const [fichaExiste, setFichaExiste] = useState(false);
  const [excluindoFicha, setExcluindoFicha] = useState(false);
  const [toast, setToast] = useState(null);
  const [autosaveStatus, setAutosaveStatus] = useState("");
  const [biblioteca, setBiblioteca] = useState([]);
  const [pickerDia, setPickerDia] = useState(null);
  const [drag, setDrag] = useState(null); // { dia, index }
  const autosaveTimer = useRef(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    carregarBiblioteca().then(setBiblioteca).catch(() => setBiblioteca([]));
    listarAlunos().then((lista) => {
      setAlunos(lista);
      const alunoPreSelecionado = searchParams.get("aluno");
      if (alunoPreSelecionado && lista.some((a) => a.id === alunoPreSelecionado)) {
        selecionarAluno(alunoPreSelecionado, lista);
      }
    }).catch(() => setAlunos([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selecionarAluno = async (id, listaAlunos = alunos) => {
    setAlunoId(id);
    firstLoad.current = true;
    if (!id) { setFicha(fichaVazia()); setFichaExiste(false); return; }
    const aluno = listaAlunos.find((a) => a.id === id);
    const existente = await carregarFicha(id);
    if (existente) {
      setFicha({ ...fichaVazia(), ...existente });
      setFichaExiste(true);
    } else {
      setFicha({
        ...fichaVazia(),
        nome: aluno?.nome || "",
        peso: aluno?.peso || "",
        altura: aluno?.altura || "",
        objetivo: aluno?.objetivo || "",
      });
      setFichaExiste(false);
    }
  };

  // Autosave com debounce (2s) quando a ficha muda
  useEffect(() => {
    if (!alunoId) return;
    if (firstLoad.current) { firstLoad.current = false; return; }
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    setAutosaveStatus("Alterações não salvas...");
    autosaveTimer.current = setTimeout(async () => {
      try {
        await salvarFicha(alunoId, ficha);
        setFichaExiste(true);
        setAutosaveStatus("Salvo automaticamente ✓");
        setTimeout(() => setAutosaveStatus(""), 2500);
      } catch {
        setAutosaveStatus("Erro ao salvar");
      }
    }, 2000);
    return () => autosaveTimer.current && clearTimeout(autosaveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ficha]);

  const setCampo = (k) => (e) => setFicha({ ...ficha, [k]: e.target.value });

  const setDia = (dia, arr) => setFicha((f) => ({ ...f, dias: { ...f.dias, [dia]: arr } }));

  // Adiciona um exercício escolhido na Biblioteca
  const adicionarDaBiblioteca = (dia, exercicio) => {
    const novo = {
      exercicioId: exercicio.id,
      series: "4",
      reps: "10",
      descanso: "60s",
      carga: "",
      obs: "",
    };
    setDia(dia, [...(ficha.dias[dia] || []), novo]);
  };

  const duplicarExercicio = (dia, i) => {
    const arr = [...(ficha.dias[dia] || [])];
    arr.splice(i + 1, 0, { ...arr[i] });
    setDia(dia, arr);
  };

  const removeExercicio = (dia, i) => {
    const ex = resolverExercicio((ficha.dias[dia] || [])[i] || {}, biblioteca);
    if (!window.confirm(`Remover "${ex.nome}" deste dia?`)) return;
    setDia(dia, (ficha.dias[dia] || []).filter((_, idx) => idx !== i));
  };

  const updateExercicio = (dia, i, k, v) => {
    const arr = [...(ficha.dias[dia] || [])];
    arr[i] = { ...arr[i], [k]: v };
    setDia(dia, arr);
  };

  const setCategoriaDia = (dia, cat) => {
    setFicha({ ...ficha, categorias: { ...(ficha.categorias || {}), [dia]: cat } });
  };

  // Nome personalizado do dia (ex: "Treino A")
  const setNomeDia = (dia, nome) => {
    setFicha((f) => ({ ...f, nomesDias: { ...(f.nomesDias || {}), [dia]: nome } }));
  };

  // Move o dia na ordem da ficha
  const moverDia = (dia, delta) => {
    setFicha((f) => {
      const ordem = diasOrdenados(f);
      const i = ordem.indexOf(dia);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= ordem.length) return f;
      const nova = [...ordem];
      [nova[i], nova[j]] = [nova[j], nova[i]];
      return { ...f, ordemDias: nova };
    });
  };

  // Limpa todos os exercícios de um dia
  const limparDia = (dia) => {
    if (!(ficha.dias[dia] || []).length) return;
    if (!window.confirm(`Apagar todos os exercícios de ${nomeDoDia(ficha, dia)}?`)) return;
    setDia(dia, []);
  };

  // Duplica o dia completo (exercícios + categoria) para outro dia
  const duplicarDia = (dia, destino) => {
    if (!destino) return;
    setFicha((f) => ({
      ...f,
      dias: { ...f.dias, [destino]: (f.dias[dia] || []).map((e) => ({ ...e })) },
      categorias: { ...(f.categorias || {}), [destino]: (f.categorias || {})[dia] || "" },
    }));
    setToast({ type: "success", msg: `Treino copiado para ${DIAS_LABEL[destino]}.` });
  };

  // --- Drag and drop para reordenar exercícios ---
  const onDrop = (dia, index) => {
    if (!drag || drag.dia !== dia || drag.index === index) return setDrag(null);
    const arr = [...(ficha.dias[dia] || [])];
    const [movido] = arr.splice(drag.index, 1);
    arr.splice(index, 0, movido);
    setDia(dia, arr);
    setDrag(null);
  };

  const salvar = async (mostrar = "Ficha salva!") => {
    if (!alunoId) return setToast({ type: "error", msg: "Selecione um aluno primeiro." });
    try {
      await salvarFicha(alunoId, ficha);
      setFichaExiste(true);
      setToast({ type: "success", msg: mostrar });
    } catch (e) {
      setToast({ type: "error", msg: "Erro ao salvar: " + (e.message || "verifique o Firebase.") });
    }
  };

  const apagarFicha = async () => {
    if (!alunoId) return;
    const confirmar = window.confirm("Tem certeza que deseja apagar esta ficha? Essa ação não pode ser desfeita.");
    if (!confirmar) return;
    setExcluindoFicha(true);
    try {
      await deletarFicha(alunoId);
      setFicha(fichaVazia());
      setFichaExiste(false);
      setToast({ type: "success", msg: "Ficha apagada com sucesso." });
    } catch (e) {
      setToast({ type: "error", msg: "Erro ao apagar a ficha. Tente novamente." });
    } finally {
      setExcluindoFicha(false);
    }
  };

  const totalExercicios = useMemo(
    () => DIAS.reduce((s, d) => s + (ficha.dias?.[d]?.length || 0), 0),
    [ficha]
  );

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Criar Ficha</h1>

      <div className="card" style={{ marginBottom: 20, maxWidth: 640 }}>
        <div className="field">
          <label>Selecione o aluno</label>
          <select className="select" value={alunoId} onChange={(e) => selecionarAluno(e.target.value)}>
            <option value="">— escolha —</option>
            {alunos.map((a) => <option key={a.id} value={a.id}>{a.nome || a.email}</option>)}
          </select>
        </div>
      </div>

      {alunoId && (
        <>
          {/* Dados da ficha */}
          <div className="card" style={{ marginBottom: 20, maxWidth: 640 }}>
            <h3 style={{ marginBottom: 14, fontSize: 16, fontWeight: 700 }}>Dados da ficha</h3>
            <div className="field"><label>Nome</label><input className="input" value={ficha.nome} onChange={setCampo("nome")} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field"><label>Peso (kg)</label><input className="input" value={ficha.peso} onChange={setCampo("peso")} /></div>
              <div className="field"><label>Altura (cm)</label><input className="input" value={ficha.altura} onChange={setCampo("altura")} /></div>
            </div>
            <div className="field"><label>Objetivo</label><input className="input" value={ficha.objetivo} onChange={setCampo("objetivo")} /></div>
            <div className="field"><label>Professor</label><input className="input" value={ficha.professor} onChange={setCampo("professor")} /></div>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{totalExercicios} exercícios na ficha</p>
          </div>

          {/* Dias da semana */}
          {DIAS.map((dia) => {
            const lista = ficha.dias[dia] || [];
            const catDia = ficha.categorias?.[dia] || "";
            return (
              <details key={dia} className="dia-editor" open>
                <summary>
                  <span>
                    {DIAS_LABEL[dia]}{catDia ? ` • ${catDia}` : ""}
                    <span style={{ color: "var(--text-muted)", fontWeight: 400 }}> ({lista.length} exercícios)</span>
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: "auto", padding: "8px 12px", fontSize: 13 }}
                    onClick={(e) => { e.preventDefault(); setPickerDia(dia); }}
                  >
                    <Plus size={14}/> Adicionar Exercício
                  </button>
                </summary>

                <div className="dia-config">
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>Categoria do treino</label>
                    <select className="select" value={catDia} onChange={(e) => setCategoriaDia(dia, e.target.value)}>
                      <option value="">— sem categoria —</option>
                      {CATEGORIAS_DIA.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>Duplicar este dia para</label>
                    <select className="select" value="" onChange={(e) => { duplicarDia(dia, e.target.value); e.target.value = ""; }}>
                      <option value="">— escolher dia —</option>
                      {DIAS.filter((d) => d !== dia).map((d) => <option key={d} value={d}>{DIAS_LABEL[d]}</option>)}
                    </select>
                  </div>
                </div>

                {lista.length === 0 && (
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    Nenhum exercício. Clique em "Adicionar Exercício" para escolher na biblioteca.
                  </p>
                )}

                {lista.map((item, i) => {
                  const ex = resolverExercicio(item, biblioteca);
                  return (
                    <div
                      key={i}
                      className={`ex-card ${drag?.dia === dia && drag?.index === i ? "dragging" : ""}`}
                      draggable
                      onDragStart={() => setDrag({ dia, index: i })}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDrop(dia, i)}
                      onDragEnd={() => setDrag(null)}
                    >
                      <div className="ex-card-head">
                        <span className="ex-drag" title="Arraste para reordenar"><GripVertical size={16} /></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <b className="ex-nome">{ex.nome}</b>
                          <div className="ex-meta">
                            {ex.categoria && <span className="picker-tag">{ex.categoria}</span>}
                            {ex.temVideo
                              ? <span className="ex-video ok"><PlayCircle size={13}/> vídeo</span>
                              : <span className="ex-video"><VideoOff size={13}/> sem vídeo</span>}
                          </div>
                        </div>
                        <button type="button" className="icon-btn" onClick={() => duplicarExercicio(dia, i)} aria-label="Duplicar"><Copy size={14}/></button>
                        <button type="button" className="icon-btn" onClick={() => removeExercicio(dia, i)} aria-label="Remover"><Trash2 size={14}/></button>
                      </div>

                      <div className="ex-grid">
                        <div className="field" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 11 }}>Séries</label>
                          <input className="input" value={item.series || ""} onChange={(e) => updateExercicio(dia, i, "series", e.target.value)} />
                        </div>
                        <div className="field" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 11 }}>Repetições</label>
                          <input className="input" value={item.reps || ""} onChange={(e) => updateExercicio(dia, i, "reps", e.target.value)} />
                        </div>
                        <div className="field" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 11 }}>Descanso</label>
                          <input className="input" value={item.descanso || ""} onChange={(e) => updateExercicio(dia, i, "descanso", e.target.value)} />
                        </div>
                        <div className="field" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 11 }}>Carga (opcional)</label>
                          <input className="input" placeholder="ex: 40kg" value={item.carga || ""} onChange={(e) => updateExercicio(dia, i, "carga", e.target.value)} />
                        </div>
                      </div>
                      <input
                        className="input"
                        style={{ marginTop: 8 }}
                        placeholder="Observações (opcional)"
                        value={item.obs || ""}
                        onChange={(e) => updateExercicio(dia, i, "obs", e.target.value)}
                      />
                    </div>
                  );
                })}

                {lista.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: "auto", padding: "8px 12px", fontSize: 13, marginTop: 4 }}
                    onClick={() => setPickerDia(dia)}
                  >
                    <CopyPlus size={14}/> Adicionar outro exercício
                  </button>
                )}
              </details>
            );
          })}

          {/* Ações finais */}
          {autosaveStatus && (
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 12 }}>{autosaveStatus}</p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20, maxWidth: 640 }}>
            <button className="btn btn-secondary" style={{ width: "auto" }} onClick={() => salvar()}><Save size={16}/> Salvar</button>
            <button className="btn btn-secondary" style={{ width: "auto" }} onClick={() => gerarPDFFicha(ficha, biblioteca)}><Download size={16}/> Gerar PDF</button>
            <button className="btn btn-primary" style={{ width: "auto" }} onClick={() => salvar("Ficha enviada para o aluno!")}><Send size={16}/> Enviar para o aluno</button>
            {fichaExiste && (
              <button
                className="btn btn-danger"
                style={{ width: "auto" }}
                onClick={apagarFicha}
                disabled={excluindoFicha}
              >
                <Trash2 size={16}/> {excluindoFicha ? "Apagando..." : "Apagar Ficha"}
              </button>
            )}
          </div>
        </>
      )}

      <ExercisePicker
        aberto={Boolean(pickerDia)}
        biblioteca={biblioteca}
        categoriaInicial={pickerDia ? (ficha.categorias?.[pickerDia] || "") : ""}
        onSelecionar={(ex) => adicionarDaBiblioteca(pickerDia, ex)}
        onClose={() => setPickerDia(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
