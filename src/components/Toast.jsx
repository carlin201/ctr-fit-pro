// ============================================================
// Toast.jsx — Notificação temporária simples.
// Uso:
//   const [toast, setToast] = useState(null);
//   setToast({ type: "success", msg: "Salvo!" });
//   <Toast toast={toast} onClose={() => setToast(null)} />
// ============================================================
import { useEffect } from "react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  return <div className={`toast ${toast.type || ""}`}>{toast.msg}</div>;
}