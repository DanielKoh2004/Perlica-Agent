import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Vite options tailored for Tauri development and browser mode
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: false,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
