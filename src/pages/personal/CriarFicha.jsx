// ============================================================
// CriarFicha.jsx — Editor completo de ficha de treino.
// Fluxo:
//   1. Selecionar aluno (ou vir pré-selecionado via ?aluno=ID na URL).
//   2. Preencher dados (nome, peso, altura, objetivo, professor).
//   3. Adicionar exercícios em cada dia da semana.
//   4. Salvar / Gerar PDF / Enviar para o aluno / Apagar ficha.
// ============================================================
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listarAlunos, salvarFicha, carregarFicha, deletarFicha, fichaVazia, DIAS, DIAS_LABEL } from "../../services/fichas.js";
import { gerarPDFFicha } from "../../services/pdf.js";
import Toast from "../../components/Toast.jsx";
import { Plus, Trash2, Save, Download, Send } from "lucide-react";

export default function CriarFicha() {
  const [searchParams] = useSearchParams();
  const [alunos, setAlunos] = useState([]);
  const [alunoId, setAlunoId] = useState("");
  const [ficha, setFicha] = useState(fichaVazia());
  const [fichaExiste, setFichaExiste] = useState(false);
  const [excluindoFicha, setExcluindoFicha] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
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

  const setCampo = (k) => (e) => setFicha({ ...ficha, [k]: e.target.value });

  const addExercicio = (dia) => {
    const dias = { ...ficha.dias, [dia]: [...(ficha.dias[dia] || []), { nome: "", series: "3", reps: "12", descanso: "60s", obs: "" }] };
    setFicha({ ...ficha, dias });
  };
  const removeExercicio = (dia, i) => {
    const dias = { ...ficha.dias, [dia]: ficha.dias[dia].filter((_, idx) => idx !== i) };
    setFicha({ ...ficha, dias });
  };
  const updateExercicio = (dia, i, k, v) => {
    const arr = [...ficha.dias[dia]];
    arr[i] = { ...arr[i], [k]: v };
    setFicha({ ...ficha, dias: { ...ficha.dias, [dia]: arr } });
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
          </div>

          {/* Dias da semana */}
          {DIAS.map((dia) => (
            <details key={dia} className="dia-editor" open>
              <summary>
                <span>{DIAS_LABEL[dia]} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({ficha.dias[dia]?.length || 0} exercícios)</span></span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: "auto", padding: "8px 12px", fontSize: 13 }}
                  onClick={(e) => { e.preventDefault(); addExercicio(dia); }}
                >
                  <Plus size={14}/> Exercício
                </button>
              </summary>

              {(ficha.dias[dia] || []).length === 0 && (
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhum exercício. Clique em "Exercício" acima.</p>
              )}

              {(ficha.dias[dia] || []).map((ex, i) => (
                <div key={i} style={{ marginBottom: 12, padding: 12, background: "var(--bg-elev)", borderRadius: 10 }}>
                  <div className="ex-row">
                    <input className="input" placeholder="Nome do exercício" value={ex.nome} onChange={(e) => updateExercicio(dia, i, "nome", e.target.value)} />
                    <input className="input" placeholder="Séries" value={ex.series} onChange={(e) => updateExercicio(dia, i, "series", e.target.value)} />
                    <input className="input" placeholder="Reps" value={ex.reps} onChange={(e) => updateExercicio(dia, i, "reps", e.target.value)} />
                    <input className="input" placeholder="Desc." value={ex.descanso} onChange={(e) => updateExercicio(dia, i, "descanso", e.target.value)} />
                    <button type="button" className="icon-btn" onClick={() => removeExercicio(dia, i)} aria-label="Remover"><Trash2 size={14}/></button>
                  </div>
                  <input className="input" placeholder="Observações (opcional)" value={ex.obs} onChange={(e) => updateExercicio(dia, i, "obs", e.target.value)} />
                </div>
              ))}
            </details>
          ))}

          {/* Ações finais */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20, maxWidth: 640 }}>
            <button className="btn btn-secondary" style={{ width: "auto" }} onClick={() => salvar()}><Save size={16}/> Salvar</button>
            <button className="btn btn-secondary" style={{ width: "auto" }} onClick={() => gerarPDFFicha(ficha)}><Download size={16}/> Gerar PDF</button>
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

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}