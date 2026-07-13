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
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
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
  await setDoc(
    doc(db, "fichas", alunoId),
    { ...ficha, alunoId, updatedAt: Date.now() },
    { merge: false }
  );
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