import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic", // This allows JSX without React import
    }),
  ],
  // Add favicon configuration
  optimizeDeps: {
    include: ["@supabase/supabase-js"],
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
