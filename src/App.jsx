// ============================================================
// App.jsx
// Define todas as rotas do sistema.
//
// Rotas públicas:
//   /login              -> Tela de login do Aluno
//   /personal/login     -> Tela de login do Personal
//
// Rotas do Aluno (protegidas):
//   /                   -> Home
//   /videos             -> Biblioteca de vídeos
//   /ficha              -> Ficha de treino
//   /perfil             -> Perfil do usuário
//   /primeiro-acesso    -> Formulário inicial
//   /treino             -> Modo Treino guiado (tela cheia, sem menu inferior)
//
// Rotas do Personal (protegidas):
//   /personal/dashboard
//   /personal/alunos
//   /personal/criar-ficha
//
// Para adicionar uma nova rota:
//   1. Crie a página em src/pages/
//   2. Adicione um <Route ... /> aqui.
// ============================================================
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./services/AuthContext.jsx";

import Login from "./pages/Login.jsx";
import FirstAccess from "./pages/FirstAccess.jsx";

import AlunoLayout from "./pages/aluno/AlunoLayout.jsx";
import Home from "./pages/aluno/Home.jsx";
import Videos from "./pages/aluno/Videos.jsx";
import MinhaFicha from "./pages/aluno/MinhaFicha.jsx";
import Perfil from "./pages/aluno/Perfil.jsx";
import WorkoutMode from "./pages/aluno/WorkoutMode.jsx";
import Configuracoes from "./pages/aluno/Configuracoes.jsx";
import Historico from "./pages/aluno/Historico.jsx";
import Evolucao from "./pages/aluno/Evolucao.jsx";
import Favoritos from "./pages/aluno/Favoritos.jsx";

import PersonalLogin from "./pages/personal/PersonalLogin.jsx";
import PersonalLayout from "./pages/personal/PersonalLayout.jsx";
import Dashboard from "./pages/personal/Dashboard.jsx";
import Alunos from "./pages/personal/Alunos.jsx";
import CriarFicha from "./pages/personal/CriarFicha.jsx";

// Guard: aluno precisa estar logado
function AlunoRoute({ children }) {
  const { user, loading, profile } = useAuth();
  if (loading) return <div className="loading-screen">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile?.nome) return <Navigate to="/primeiro-acesso" replace />;
  return children;
}

// Guard: personal precisa estar autenticado (via localStorage)
function PersonalRoute({ children }) {
  const isPersonal = localStorage.getItem("ctr_personal_auth") === "1";
  if (!isPersonal) return <Navigate to="/personal/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* PÚBLICAS */}
      <Route path="/login" element={<Login />} />
      <Route path="/personal/login" element={<PersonalLogin />} />

      {/* Primeiro acesso (precisa estar logado, sem perfil ainda) */}
      <Route path="/primeiro-acesso" element={<FirstAccess />} />

      {/* Modo Treino — tela cheia, fora do AlunoLayout (sem menu inferior) */}
      <Route
        path="/treino"
        element={
          <AlunoRoute>
            <WorkoutMode />
          </AlunoRoute>
        }
      />

      {/* ALUNO */}
      <Route
        element={
          <AlunoRoute>
            <AlunoLayout />
          </AlunoRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/ficha" element={<MinhaFicha />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/evolucao" element={<Evolucao />} />
        <Route path="/favoritos" element={<Favoritos />} />
      </Route>

      {/* PERSONAL */}
      <Route
        element={
          <PersonalRoute>
            <PersonalLayout />
          </PersonalRoute>
        }
      >
        <Route path="/personal/dashboard" element={<Dashboard />} />
        <Route path="/personal/alunos" element={<Alunos />} />
        <Route path="/personal/criar-ficha" element={<CriarFicha />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}