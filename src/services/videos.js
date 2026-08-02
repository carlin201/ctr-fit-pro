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
// Helpers de YouTube
// ============================================================

// Aceita ID puro ou uma URL completa do YouTube e devolve só o ID.
export function extrairYoutubeId(valor = "") {
  const v = String(valor).trim();
  if (!v) return "";
  const m = v.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : v;
}

// true quando o vídeo tem youtubeId preenchido.
export function temVideo(video) {
  return Boolean(extrairYoutubeId(video?.youtubeId));
}

// URL de embed do YouTube.
export function youtubeEmbedUrl(youtubeId, autoplay = false) {
  const id = extrairYoutubeId(youtubeId);
  if (!id) return "";
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1${autoplay ? "&autoplay=1" : ""}`;
}

// Miniatura automática do YouTube (usada quando não há campo miniatura).
export function youtubeThumb(youtubeId) {
  const id = extrairYoutubeId(youtubeId);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}

// Contagem de exercícios por categoria.
export function contarPorCategoria(videos = []) {
  return videos.reduce((acc, v) => {
    acc[v.categoria] = (acc[v.categoria] || 0) + 1;
    return acc;
  }, {});
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