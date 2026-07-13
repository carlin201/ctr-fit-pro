// ============================================================
// workout.js — Funções auxiliares do Modo Treino.
// Não mexe em Firebase/Firestore diretamente (isso fica em fichas.js
// e AuthContext.jsx), só organiza dados para a tela de treino.
// ============================================================

// Transforma o objeto `dias` da ficha numa lista plana de exercícios
// do dia informado, já numerados.
export function exerciciosDoDia(ficha, dia) {
  return (ficha?.dias?.[dia] || []).map((ex, i) => ({
    ...ex,
    _index: i,
    seriesTotais: parseInt(ex.series, 10) || 0,
  }));
}

// Normaliza texto para comparar nomes sem se importar com
// maiúsculas/acentos (ex: "Supino reto" === "SUPINO RETO").
function normalizar(txt = "") {
  return txt
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Acha o vídeo cujo título bate com o nome do exercício.
export function encontrarVideoDoExercicio(videos, nomeExercicio) {
  if (!nomeExercicio || !videos?.length) return null;
  const alvo = normalizar(nomeExercicio);
  return videos.find((v) => normalizar(v.titulo) === alvo) || null;
}

// Formata segundos como MM:SS
export function formatarTempo(segundos) {
  const s = Math.max(0, Math.floor(segundos));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

// Dia da semana atual no formato usado pela ficha (segunda, terca, ...)
export function diaDaSemanaAtual() {
  const idx = new Date().getDay(); // 0 = domingo
  const mapa = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  return mapa[idx];
}

// --- Persistência local do progresso (para pausar/retomar) ---
function chaveProgresso(uid) {
  return `ctr_treino_progresso_${uid}`;
}

export function salvarProgressoLocal(uid, progresso) {
  try {
    localStorage.setItem(chaveProgresso(uid), JSON.stringify(progresso));
  } catch {}
}

export function carregarProgressoLocal(uid) {
  try {
    const raw = localStorage.getItem(chaveProgresso(uid));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function limparProgressoLocal(uid) {
  try {
    localStorage.removeItem(chaveProgresso(uid));
  } catch {}
}