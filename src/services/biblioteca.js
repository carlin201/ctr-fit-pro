// ============================================================
// biblioteca.js — Biblioteca oficial de exercícios do CTR Fitness.
// A fonte de dados é public/videos/videos.json (mesma usada na
// biblioteca de vídeos do aluno). Aqui apenas organizamos/resolvemos
// os exercícios para o editor de fichas e para a tela do aluno.
//
// Formato salvo na ficha (novo):
//   { exercicioId, series, reps, descanso, carga, obs }
// Fichas antigas (com `nome` digitado) continuam funcionando.
// ============================================================
import { loadVideos, extrairYoutubeId, temVideo } from "./videos.js";

// Categorias oficiais do sistema (ordem usada nos filtros)
export const CATEGORIAS_BIBLIOTECA = [
  "Peito",
  "Costas",
  "Ombro",
  "Bíceps",
  "Tríceps",
  "Pernas",
  "Glúteos",
  "Abdômen",
  "Panturrilha",
  "Punho",
  "Cardio",
  "Alongamento",
  "Mobilidade",
];

export function normalizarTexto(txt = "") {
  return String(txt)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Compara categorias ignorando acentos ("Biceps" === "Bíceps")
export function mesmaCategoria(a, b) {
  return normalizarTexto(a) === normalizarTexto(b);
}

// Carrega a biblioteca: só exercícios com título preenchido, ordem A-Z.
export async function carregarBiblioteca() {
  const videos = await loadVideos();
  return (videos || [])
    .filter((v) => v && String(v.titulo || "").trim())
    .map((v) => ({
      id: v.id,
      titulo: v.titulo,
      categoria: v.categoria || "",
      descricao: v.descricao || "",
      youtubeId: extrairYoutubeId(v.youtubeId),
      temVideo: temVideo(v),
    }))
    .sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
}

// Busca um exercício da biblioteca pelo id.
export function acharPorId(biblioteca = [], id) {
  if (id === undefined || id === null || id === "") return null;
  return biblioteca.find((e) => String(e.id) === String(id)) || null;
}

// Busca pelo nome (compatibilidade com fichas antigas).
export function acharPorNome(biblioteca = [], nome) {
  if (!nome) return null;
  const alvo = normalizarTexto(nome);
  return biblioteca.find((e) => normalizarTexto(e.titulo) === alvo) || null;
}

// Resolve um item da ficha para exibição: junta os dados salvos com
// as informações vindas da biblioteca (nome, categoria, vídeo, descrição).
export function resolverExercicio(item, biblioteca = []) {
  const base =
    acharPorId(biblioteca, item?.exercicioId) ||
    acharPorNome(biblioteca, item?.nome);
  return {
    ...item,
    nome: base?.titulo || item?.nome || "Exercício",
    categoria: base?.categoria || item?.categoria || "",
    descricao: base?.descricao || "",
    youtubeId: base?.youtubeId || "",
    temVideo: Boolean(base?.temVideo),
    _biblioteca: base || null,
  };
}

// Filtra + ordena a biblioteca para a janela de seleção.
export function filtrarBiblioteca(biblioteca = [], { busca = "", categoria = "" } = {}) {
  const q = normalizarTexto(busca);
  return biblioteca.filter((e) => {
    const okCat = !categoria || mesmaCategoria(e.categoria, categoria);
    const okBusca =
      !q ||
      normalizarTexto(e.titulo).includes(q) ||
      normalizarTexto(e.descricao).includes(q) ||
      normalizarTexto(e.categoria).includes(q);
    return okCat && okBusca;
  });
}

// Agrupa por categoria (usado na listagem organizada do modal).
export function agruparPorCategoria(lista = []) {
  const grupos = {};
  lista.forEach((e) => {
    const c = e.categoria || "Outros";
    (grupos[c] = grupos[c] || []).push(e);
  });
  return Object.keys(grupos)
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((c) => ({ categoria: c, itens: grupos[c] }));
}
