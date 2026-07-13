// ============================================================
// videos.js — Carrega o catálogo de vídeos do arquivo public/videos/videos.json.
//
// COMO ADICIONAR UM NOVO VÍDEO:
//   1. Copie o arquivo .mp4 para a pasta correta em public/videos/<categoria>/
//   2. Adicione uma entrada no arquivo public/videos/videos.json:
//        { "titulo": "...", "categoria": "Peito", "arquivo": "/videos/peito/x.mp4", "descricao": "..." }
//   Nenhum outro arquivo precisa ser alterado.
// ============================================================

// Lista fixa de categorias (usada como filtro na tela de vídeos).
// Para adicionar uma NOVA CATEGORIA:
//   1. Adicione o nome aqui.
//   2. Crie a pasta correspondente em public/videos/<nome-em-minusculo>/
//   3. Adicione vídeos no videos.json com a nova categoria.
export const CATEGORIAS = [
  "Peito",
  "Costas",
  "Pernas",
  "Ombro",
  "Bíceps",
  "Tríceps",
  "Abdômen",
  "Cardio",
  "Alongamento",
  "Mobilidade",
];

// Busca a lista completa de vídeos.
export async function loadVideos() {
  try {
    const res = await fetch("/videos/videos.json", { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}