import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic", // This allows JSX without React import
    }),
  ],
  optimizeDeps: {
    include: ["@supabase/supabase-js"],
    exclude: ["@supabase/gotrue-js"],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "supabase-vendor": ["@supabase/supabase-js"],
          "redux-vendor": ["@reduxjs/toolkit", "react-redux"],
          "socket-vendor": ["socket.io-client"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "./runtimeConfig": "./runtimeConfig.browser",
    },
  },
  server: {
    port: 3000,
  },
  define: {
    global: "globalThis",
  },
});
