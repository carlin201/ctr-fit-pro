// ============================================================
// ThemeContext.jsx — Gerencia o tema visual do app (Vermelho/Preto/Branco).
// Salva a preferência no localStorage e aplica via atributo data-theme no <html>.
// ============================================================
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = "ctr_theme";
const TEMAS_VALIDOS = ["vermelho", "preto", "branco"];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const salvo = localStorage.getItem(STORAGE_KEY);
    return TEMAS_VALIDOS.includes(salvo) ? salvo : "vermelho";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (novoTema) => {
    if (TEMAS_VALIDOS.includes(novoTema)) setThemeState(novoTema);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}