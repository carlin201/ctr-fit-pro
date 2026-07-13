// ============================================================
// PersonalLayout.jsx — Layout com menu lateral do Personal.
// ============================================================
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, ClipboardEdit, LogOut } from "lucide-react";

export default function PersonalLayout() {
  const nav = useNavigate();
  const sair = () => { localStorage.removeItem("ctr_personal_auth"); nav("/personal/login", { replace: true }); };

  const link = ({ isActive }) => (isActive ? "active" : "");

  return (
    <div className="personal-layout">
      <aside className="side-nav">
        <div className="brand">CTR • Personal</div>
        <NavLink to="/personal/dashboard" className={link}><LayoutDashboard size={18}/> Dashboard</NavLink>
        <NavLink to="/personal/alunos" className={link}><Users size={18}/> Alunos</NavLink>
        <NavLink to="/personal/criar-ficha" className={link}><ClipboardEdit size={18}/> Criar Ficha</NavLink>
        <button className="logout" onClick={sair} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, marginTop: "auto" }}>
          <LogOut size={18}/> Sair
        </button>
      </aside>
      <main className="personal-main"><Outlet /></main>
    </div>
  );
}