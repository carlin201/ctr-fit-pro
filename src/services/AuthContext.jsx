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
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
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

  // Reautentica o usuário atual. Para contas Google usa popup; para email/senha
  // exige a senha atual passada em `currentPassword`.
  const reauthenticate = async (currentPassword) => {
    if (!auth.currentUser) throw new Error("Nenhum usuário autenticado.");
    const providerId = auth.currentUser.providerData[0]?.providerId;
    if (providerId === "google.com") {
      await reauthenticateWithPopup(auth.currentUser, googleProvider);
    } else {
      if (!currentPassword) throw new Error("Informe sua senha atual.");
      const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, cred);
    }
  };

  // Altera a senha do usuário (apenas para provider email/senha)
  const changePassword = async (currentPassword, newPassword) => {
    await reauthenticate(currentPassword);
    await updatePassword(auth.currentUser, newPassword);
  };

  // Altera o e-mail do usuário
  const changeEmail = async (currentPassword, newEmail) => {
    await reauthenticate(currentPassword);
    await updateEmail(auth.currentUser, newEmail);
    // Atualiza documento no Firestore
    await setDoc(doc(db, "alunos", auth.currentUser.uid), { email: newEmail }, { merge: true });
    setProfile((p) => ({ ...(p || {}), email: newEmail }));
  };

  // Exclui a conta: remove documentos relacionados no Firestore e o usuário no Auth
  const deleteAccount = async (currentPassword) => {
    await reauthenticate(currentPassword);
    const uid = auth.currentUser.uid;
    await Promise.allSettled([
      deleteDoc(doc(db, "alunos", uid)),
      deleteDoc(doc(db, "fichas", uid)),
    ]);
    await deleteUser(auth.currentUser);
  };

  const value = {
    user,
    profile,
    loading,
    saveProfile,
    reauthenticate,
    changePassword,
    changeEmail,
    deleteAccount,
    login: (email, pass) => signInWithEmailAndPassword(auth, email, pass),
    signup: (email, pass) => createUserWithEmailAndPassword(auth, email, pass),
    loginGoogle: () => signInWithPopup(auth, googleProvider),
    logout: () => signOut(auth),
    resetPassword: (email) => sendPasswordResetEmail(auth, email),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}