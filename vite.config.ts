import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  define: {
    // Suppress console warnings for recharts defaultProps in development
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development",
    ),
    // Define global for compatibility
    global: "globalThis",
  },
  esbuild: {
    // Drop console warnings in production
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
  server: {
    host: true,
    port: 3000,
    strictPort: false,
    hmr: {
      overlay: false, // Disable error overlay completely
    },
    fs: {
      strict: false, // Disable strict file system checks
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
    exclude: [],
  },
  logLevel: "warn", // Reduce log noise
  clearScreen: false, // Don't clear console
});
