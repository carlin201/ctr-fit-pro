// ============================================================
// AlunoLayout.jsx — Layout comum das páginas do Aluno.
// Renderiza o conteúdo da rota atual + o menu inferior.
// ============================================================
import { Outlet } from "react-router-dom";
import BottomNav from "../../components/BottomNav.jsx";

export default function AlunoLayout() {
  return (
    <div className="aluno-layout">
      <main className="aluno-main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}