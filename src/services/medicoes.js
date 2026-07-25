// ============================================================
// medicoes.js — CRUD de medições/evolução do aluno.
//
// Coleção: medicoes/{alunoId}/itens/{docId}
// Estrutura: { data: ISOString, peso, altura, obs, criadoEm }
// ============================================================
import {
  collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase.js";

const col = (uid) => collection(db, "medicoes", uid, "itens");

export async function listarMedicoes(uid) {
  if (!uid) return [];
  try {
    const snap = await getDocs(query(col(uid), orderBy("data", "asc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

export async function adicionarMedicao(uid, medicao) {
  return await addDoc(col(uid), { ...medicao, criadoEm: serverTimestamp() });
}

export async function excluirMedicao(uid, medicaoId) {
  await deleteDoc(doc(db, "medicoes", uid, "itens", medicaoId));
}

// Calcula o IMC a partir de peso (kg) e altura (cm). Retorna null se dados inválidos.
export function calcularIMC(peso, alturaCm) {
  const p = parseFloat(peso);
  const a = parseFloat(alturaCm);
  if (!p || !a) return null;
  const alturaM = a / 100;
  return +(p / (alturaM * alturaM)).toFixed(1);
}

// Classificação simples do IMC segundo a OMS
export function classificacaoIMC(imc) {
  if (imc == null) return "";
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 25) return "Peso normal";
  if (imc < 30) return "Sobrepeso";
  if (imc < 35) return "Obesidade grau 1";
  if (imc < 40) return "Obesidade grau 2";
  return "Obesidade grau 3";
}