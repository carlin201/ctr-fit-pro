// ============================================================
// FirstAccess.jsx — Formulário do primeiro acesso do Aluno.
// Coleta: nome, idade, peso, altura, objetivo.
// Salva no Firestore (coleção "alunos", id = uid).
// ============================================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext.jsx";

export default function FirstAccess() {
  const { user, profile, saveProfile, loading } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ nome: "", idade: "", peso: "", altura: "", objetivo: "Hipertrofia" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) nav("/login", { replace: true });
    else if (profile?.nome) nav("/", { replace: true });
  }, [user, profile, loading, nav]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await saveProfile(form);
    nav("/", { replace: true });
  };

  return (
    <div className="aluno-layout">
      <main className="aluno-main" style={{ paddingTop: 40 }}>
        <h1 className="login-title">Vamos te conhecer</h1>
        <p className="login-sub">Preencha suas informações para personalizar seus treinos.</p>

        <form onSubmit={submit} className="card" style={{ marginTop: 20 }}>
          <div className="field"><label>Nome</label><input className="input" required value={form.nome} onChange={set("nome")} /></div>
          <div className="field"><label>Idade</label><input className="input" type="number" required value={form.idade} onChange={set("idade")} /></div>
          <div className="field"><label>Peso (kg)</label><input className="input" type="number" step="0.1" required value={form.peso} onChange={set("peso")} /></div>
          <div className="field"><label>Altura (cm)</label><input className="input" type="number" required value={form.altura} onChange={set("altura")} /></div>
          <div className="field">
            <label>Objetivo</label>
            <select className="select" value={form.objetivo} onChange={set("objetivo")}>
              <option>Hipertrofia</option>
              <option>Emagrecimento</option>
              <option>Condicionamento</option>
              <option>Saúde</option>
              <option>Definição</option>
            </select>
          </div>
          <button className="btn btn-primary" disabled={saving}>{saving ? "Salvando..." : "Continuar"}</button>
        </form>
      </main>
    </div>
  );
}