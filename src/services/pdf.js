// ============================================================
// pdf.js — Geração de PDF a partir da ficha de treino.
// Usa a biblioteca jsPDF.
// ============================================================
import jsPDF from "jspdf";
import { DIAS, DIAS_LABEL } from "./fichas.js";

export function gerarPDFFicha(ficha) {
  const pdf = new jsPDF();
  const margin = 15;
  let y = margin;

  pdf.setFontSize(20);
  pdf.setTextColor(220, 38, 38); // vermelho CTR
  pdf.text("CTR FITNESS", margin, y);
  y += 8;

  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Aluno: ${ficha.nome || "-"}`, margin, y); y += 6;
  pdf.text(`Peso: ${ficha.peso || "-"} kg   Altura: ${ficha.altura || "-"} cm`, margin, y); y += 6;
  pdf.text(`Objetivo: ${ficha.objetivo || "-"}`, margin, y); y += 6;
  pdf.text(`Professor: ${ficha.professor || "-"}`, margin, y); y += 10;

  DIAS.forEach((dia) => {
    const exs = ficha.dias?.[dia] || [];
    if (exs.length === 0) return;
    if (y > 260) { pdf.addPage(); y = margin; }
    pdf.setFontSize(14);
    pdf.setTextColor(220, 38, 38);
    pdf.text(DIAS_LABEL[dia], margin, y); y += 7;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    exs.forEach((ex, i) => {
      if (y > 275) { pdf.addPage(); y = margin; }
      pdf.text(`${i + 1}. ${ex.nome} — ${ex.series}x${ex.reps} | Desc: ${ex.descanso}`, margin, y);
      y += 5;
      if (ex.obs) { pdf.text(`   Obs: ${ex.obs}`, margin, y); y += 5; }
    });
    y += 4;
  });

  pdf.save(`ficha-${(ficha.nome || "treino").toLowerCase().replace(/\s+/g, "-")}.pdf`);
}