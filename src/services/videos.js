export const CATEGORIAS = [
  "Todos",
  "Peito",
  "Costas",
  "Pernas",
  "Ombro",
  "Bíceps",
  "Tríceps",
  "Abdômen",
  "Cardio",
  "Alongamento",
  "Mobilidade"
];

export async function loadVideos() {
  try {
    const response = await fetch("/videos/videos.json", {
      cache: "no-store"
    });

    if (!response.ok) return [];

    return await response.json();

  } catch (error) {
    console.error(error);
    return [];
  }
}

// ============================================================
// Favoritos e histórico de vídeos assistidos (Firestore + fallback local).
// Coleção: favoritos_videos/{uid} -> { ids: [videoId], visualizacoes: {id:count}, recentes: [id...] }
// ============================================================
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase.js";

const ref = (uid) => doc(db, "favoritos_videos", uid);

export async function carregarPreferenciasVideos(uid) {
  if (!uid) return { ids: [], visualizacoes: {}, recentes: [] };
  try {
    const snap = await getDoc(ref(uid));
    if (!snap.exists()) return { ids: [], visualizacoes: {}, recentes: [] };
    const d = snap.data();
    return {
      ids: d.ids || [],
      visualizacoes: d.visualizacoes || {},
      recentes: d.recentes || [],
    };
  } catch {
    return { ids: [], visualizacoes: {}, recentes: [] };
  }
}

export async function toggleFavoritoVideo(uid, videoId, atualId) {
  if (!uid) return atualId;
  const jaEh = atualId.includes(videoId);
  const novos = jaEh ? atualId.filter((id) => id !== videoId) : [...atualId, videoId];
  try {
    await setDoc(ref(uid), { ids: novos }, { merge: true });
  } catch {}
  return novos;
}

export async function registrarVisualizacao(uid, videoId, prefs) {
  if (!uid) return prefs;
  const visualizacoes = { ...(prefs.visualizacoes || {}) };
  visualizacoes[videoId] = (visualizacoes[videoId] || 0) + 1;
  const recentes = [videoId, ...(prefs.recentes || []).filter((x) => x !== videoId)].slice(0, 12);
  try {
    await setDoc(ref(uid), { visualizacoes, recentes }, { merge: true });
  } catch {}
  return { ...prefs, visualizacoes, recentes };
}