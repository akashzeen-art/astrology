import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    global: "globalThis",
  },
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
  server: {
    host: true,
    port: 3000,
    strictPort: false,
    hmr: {
      overlay: false,
    },
    fs: {
      strict: false,
    },
    watch: {
      usePolling: true, // Ensures file changes are picked up correctly on Windows
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          gsap: ["gsap"],
          charts: ["recharts"],
          ui: [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
          ],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["gsap", "gsap/ScrollTrigger"],
  },
  logLevel: "info", // Show all normal logs (fixes your issue)
  clearScreen: false, // Do not clear terminal on restart
});
