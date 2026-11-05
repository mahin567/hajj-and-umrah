import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: {
    // Django in dev. Docker Compose sets VITE_PROXY_TARGET=http://backend:8000
    proxy: { "/api": process.env.VITE_PROXY_TARGET || "http://127.0.0.1:8000" },
    // Docker on Windows/Mac does not send file-change events; polling makes hot reload work there
    watch: process.env.VITE_USE_POLLING ? { usePolling: true } : undefined,
  },
  build: {
    target: "es2020",
    sourcemap: false, // do not publish source code
    rollupOptions: { output: { manualChunks: { react: ["react", "react-dom"], motion: ["framer-motion"] } } },
  },
});
