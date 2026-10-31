import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { proxy: { "/api": "http://127.0.0.1:8000" } }, // Django in dev
  build: {
    target: "es2020",
    sourcemap: false, // do not publish source code
    rollupOptions: { output: { manualChunks: { react: ["react", "react-dom"], motion: ["framer-motion"] } } },
  },
});
