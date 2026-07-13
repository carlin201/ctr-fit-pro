// ============================================================
// vite.config.js
// Configuração do Vite para o projeto CTR FITNESS.
// - Habilita o plugin do React.
// - Cria alias "@" apontando para a pasta src/.
// - Configura porta 8080 para desenvolvimento.
// ============================================================
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 8080,
    strictPort: true,
  },
});