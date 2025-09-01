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
  build: {
    sourcemap: true, // ✅ enable source maps for debugging
  },
});
