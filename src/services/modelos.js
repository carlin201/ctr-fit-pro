// ============================================================
// modelos.js — Modelos de treino reutilizáveis.
//
// Um MODELO é a "estrutura" de uma ficha (dias, exercícios, séries, reps,
// descanso, categorias, nomes dos dias), SEM os dados pessoais do aluno
// (nome, peso, altura, objetivo, professor).
//
// Coleção Firestore: "modelos_treino" -> um documento por modelo:
//   { nome, dias, categorias, nomesDias, ordemDias, criadoEm, updatedAt }
//
// Usos:
//   - salvarModelo(nome, ficha)            -> guarda a ficha atual como modelo
//   - listarModelos()                      -> lista os modelos salvos
//   - aplicarEstruturaEmAlunos(...)        -> copia um treino para vários alunos
//   - estruturaParaFicha(estrutura, base)  -> monta uma ficha mantendo os dados do aluno
// ============================================================
import {
  collection, addDoc, getDocs, deleteDoc, doc, setDoc,
} from "firebase/firestore";
import { db } from "./firebase.js";
import { DIAS, fichaVazia, carregarFicha, salvarFicha } from "./fichas.js";

const COL = "modelos_treino";

// Remove campos `undefined` (o Firestore não aceita) e copia em profundidade.
const limpar = (v) => JSON.parse(JSON.stringify(v ?? null));

// Extrai só a estrutura do treino de uma ficha (sem dados pessoais).
export function extrairEstrutura(ficha) {
  const base = fichaVazia();
  return limpar({
    dias: { ...base.dias, ...(ficha?.dias || {}) },
    categorias: ficha?.categorias || {},
    nomesDias: { ...base.nomesDias, ...(ficha?.nomesDias || {}) },
    ordemDias: Array.isArray(ficha?.ordemDias) ? ficha.ordemDias : [...DIAS],
  });
}

// Quantos exercícios existem na estrutura/ficha.
export function contarExercicios(obj) {
  return Object.values(obj?.dias || {}).reduce((s, arr) => s + (arr?.length || 0), 0);
}

// Monta uma ficha com a estrutura do modelo, preservando os dados do aluno.
export function estruturaParaFicha(estrutura, dadosAluno = {}) {
  const base = fichaVazia();
  const e = extrairEstrutura(estrutura);
  return {
    ...base,
    nome: dadosAluno.nome || "",
    peso: dadosAluno.peso || "",
    altura: dadosAluno.altura || "",
    objetivo: dadosAluno.objetivo || "",
    professor: dadosAluno.professor || "",
    ...e,
  };
}

export async function listarModelos() {
  const snap = await getDocs(collection(db, COL));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}

export async function salvarModelo(nome, ficha) {
  const agora = Date.now();
  const payload = { nome: String(nome).trim(), ...extrairEstrutura(ficha), criadoEm: agora, updatedAt: agora };
  const ref = await addDoc(collection(db, COL), payload);
  return { id: ref.id, ...payload };
}

// Substitui a estrutura de um modelo já existente (mantém o nome).
export async function atualizarModelo(id, nome, ficha) {
  const payload = { nome: String(nome).trim(), ...extrairEstrutura(ficha), updatedAt: Date.now() };
  await setDoc(doc(db, COL, id), payload, { merge: true });
}

export async function deletarModelo(id) {
  await deleteDoc(doc(db, COL, id));
}

// Copia a estrutura de um treino para vários alunos de uma vez.
// - Mantém nome/peso/altura/objetivo/professor de cada aluno.
// - Usa salvarFicha(), então a versão anterior fica no histórico (fichas_historico).
// Retorna { ok: [ids], erro: [{id, msg}] }.
export async function aplicarEstruturaEmAlunos(estrutura, alunos) {
  const resultado = { ok: [], erro: [] };
  for (const aluno of alunos) {
    try {
      const existente = await carregarFicha(aluno.id);
      const dados = {
        nome: existente?.nome || aluno.nome || "",
        peso: existente?.peso || aluno.peso || "",
        altura: existente?.altura || aluno.altura || "",
        objetivo: existente?.objetivo || aluno.objetivo || "",
        professor: existente?.professor || "",
      };
      await salvarFicha(aluno.id, estruturaParaFicha(estrutura, dados));
      resultado.ok.push(aluno.id);
    } catch (e) {
      resultado.erro.push({ id: aluno.id, msg: e?.message || "erro" });
    }
  }
  return resultado;
}
