// ============================================================
// mensagens.js — Reclamações, sugestões e elogios (coleção "mensagens").
// Público: só consegue CRIAR. Personal: lê, muda status e exclui.
// ============================================================
import {
  addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc,
} from "firebase/firestore";
import { db } from "./firebase.js";

const COL = "mensagens";

export const TIPOS = ["Reclamação", "Sugestão", "Elogio"];
export const ASSUNTOS = [
  "Atendimento", "Aparelhos e equipamentos", "Limpeza e higiene",
  "Professores e treinos", "Aplicativo", "Horários e aulas", "Financeiro", "Outro",
];
export const STATUS = ["Novo", "Em análise", "Resolvido"];

export async function enviarMensagem({ tipo, setor, mensagem, nome, contato }) {
  await addDoc(collection(db, COL), {
    tipo,
    setor,
    mensagem: String(mensagem).trim().slice(0, 2000),
    nome: String(nome || "").trim().slice(0, 80),
    contato: String(contato || "").trim().slice(0, 80),
    status: "Novo",
    criadoEm: serverTimestamp(),
  });
}

export async function listarMensagens() {
  const snap = await getDocs(collection(db, COL));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));
}

export async function atualizarStatus(id, status) {
  await updateDoc(doc(db, COL, id), { status });
}

export async function excluirMensagem(id) {
  await deleteDoc(doc(db, COL, id));
}
