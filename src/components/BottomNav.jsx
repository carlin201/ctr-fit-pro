// ============================================================
// BottomNav.jsx — Menu inferior do Aluno (mobile-first).
// Para adicionar um novo item: adicionar objeto no array `items`.
// ============================================================
import { NavLink } from "react-router-dom";
import { Home, PlayCircle, ClipboardList, User } from "lucide-react";

const items = [
  { to: "/",       label: "Home",   Icon: Home },
  { to: "/videos", label: "Vídeos", Icon: PlayCircle },
  { to: "/ficha",  label: "Ficha",  Icon: ClipboardList },
  { to: "/perfil", label: "Perfil", Icon: User },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} end={to === "/"}>
          {({ isActive }) => (
            <span className={isActive ? "nav-item active" : "nav-item"} style={{ display: "contents" }}>
              <Icon /> {label}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}