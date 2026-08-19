// ============================================================
// fichas.js — Operações sobre as fichas de treino no Firestore.
//
// Coleção: "fichas" -> documento com id = uid do aluno.
// Estrutura de uma ficha:
// {
//   alunoId, nome, peso, altura, objetivo, professor,
//   dias: {
//     segunda: [{ nome, series, reps, descanso, obs }, ...],
//     terca: [...], ...
//   },
//   updatedAt
// }
// ============================================================
import {
  doc, getDoc, setDoc, deleteDoc, collection, getDocs,
  addDoc, query, orderBy, limit, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase.js";

export const DIAS = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];
export const DIAS_LABEL = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
  domingo: "Domingo",
};

export function fichaVazia() {
  const dias = {};
  DIAS.forEach((d) => (dias[d] = []));
  const nomesDias = {};
  DIAS.forEach((d) => (nomesDias[d] = ""));
  return {
    nome: "", peso: "", altura: "", objetivo: "", professor: "",
    dias,
    categorias: {},
    nomesDias,          // nome personalizado do dia (ex: "Treino A", "Push")
    ordemDias: [...DIAS], // ordem em que os dias aparecem
  };
}

// Ordem dos dias da ficha (compatível com fichas antigas sem `ordemDias`).
export function diasOrdenados(ficha) {
  const salvos = Array.isArray(ficha?.ordemDias) ? ficha.ordemDias.filter((d) => DIAS.includes(d)) : [];
  const faltando = DIAS.filter((d) => !salvos.includes(d));
  return [...salvos, ...faltando];
}

// Nome exibido de um dia: usa o nome personalizado quando existir.
export function nomeDoDia(ficha, dia) {
  const custom = String(ficha?.nomesDias?.[dia] || "").trim();
  return custom || DIAS_LABEL[dia] || dia;
}

// Rótulo completo do dia: "Segunda • Peito"
export function rotuloDoDia(ficha, dia) {
  const cat = String(ficha?.categorias?.[dia] || "").trim();
  return `${nomeDoDia(ficha, dia)}${cat ? ` • ${cat}` : ""}`;
}

export async function salvarFicha(alunoId, ficha) {
  const payload = { ...ficha, alunoId, updatedAt: Date.now() };
  await setDoc(doc(db, "fichas", alunoId), payload, { merge: false });
  // Registra uma versão no histórico (não bloqueia se falhar)
  try {
    await addDoc(collection(db, "fichas_historico", alunoId, "versoes"), {
      ...payload, criadoEm: serverTimestamp(),
    });
  } catch {}
}

export async function carregarFicha(alunoId) {
  const snap = await getDoc(doc(db, "fichas", alunoId));
  return snap.exists() ? snap.data() : null;
}

export async function listarAlunos() {
  const snap = await getDocs(collection(db, "alunos"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deletarAluno(alunoId) {
  await deleteDoc(doc(db, "alunos", alunoId));
  await deleteDoc(doc(db, "fichas", alunoId)).catch(() => {});
}

export async function deletarFicha(alunoId) {
  await deleteDoc(doc(db, "fichas", alunoId));
}

// Duplica a ficha de um aluno para outro aluno (copia estrutura, mantém dados do destino)
export async function duplicarFicha(alunoOrigemId, alunoDestinoId) {
  const origem = await carregarFicha(alunoOrigemId);
  if (!origem) throw new Error("Ficha de origem não encontrada.");
  const destino = await carregarFicha(alunoDestinoId);
  const nova = {
    ...origem,
    nome: destino?.nome || origem.nome,
    peso: destino?.peso || origem.peso,
    altura: destino?.altura || origem.altura,
    objetivo: destino?.objetivo || origem.objetivo,
  };
  await salvarFicha(alunoDestinoId, nova);
  return nova;
}

// Lista as versões antigas da ficha do aluno (ordenadas da mais recente para a mais antiga)
export async function listarHistoricoFichas(alunoId, max = 20) {
  try {
    const q = query(
      collection(db, "fichas_historico", alunoId, "versoes"),
      orderBy("updatedAt", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

// Lista as fichas mais recentes de todos os alunos (para o painel do personal)
export async function listarFichas() {
  try {
    const snap = await getDocs(collection(db, "fichas"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}