// ============================================================
// AuthContext.jsx
// Contexto de autenticação do ALUNO (Firebase Auth + perfil no Firestore).
//
// Fornece:
//   - user     -> objeto do Firebase Auth
//   - profile  -> documento do Firestore com dados do aluno
//   - loading  -> flag de carregamento inicial
//   - login/signup/loginGoogle/logout/resetPassword
//
// COMO USAR em qualquer componente:
//   const { user, profile, logout } = useAuth();
// ============================================================
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mantém o usuário logado entre sessões
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, "alunos", u.uid));
          setProfile(snap.exists() ? snap.data() : null);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Salva/atualiza o perfil do aluno no Firestore
  const saveProfile = async (data) => {
    if (!user) return;
    await setDoc(doc(db, "alunos", user.uid), { ...data, email: user.email }, { merge: true });
    setProfile((p) => ({ ...(p || {}), ...data, email: user.email }));
  };

  const value = {
    user,
    profile,
    loading,
    saveProfile,
    login: (email, pass) => signInWithEmailAndPassword(auth, email, pass),
    signup: (email, pass) => createUserWithEmailAndPassword(auth, email, pass),
    loginGoogle: () => signInWithPopup(auth, googleProvider),
    logout: () => signOut(auth),
    resetPassword: (email) => sendPasswordResetEmail(auth, email),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}