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