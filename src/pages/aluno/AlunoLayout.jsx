// ============================================================
// AlunoLayout.jsx — Layout comum das páginas do Aluno.
// Renderiza o conteúdo da rota atual (com animação de transição) + menu inferior.
// ============================================================
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "../../components/BottomNav.jsx";

export default function AlunoLayout() {
  const location = useLocation();

  return (
    <div className="aluno-layout">
      <main className="aluno-main">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}