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
  return { nome: "", peso: "", altura: "", objetivo: "", professor: "", dias };
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