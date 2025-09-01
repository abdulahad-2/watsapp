import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic", // This allows JSX without React import
    }),
  ],
  optimizeDeps: {
    include: ["@supabase/supabase-js", "simple-peer"],
    exclude: ["@supabase/gotrue-js"],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
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
    css: {
      modules: {
        localsConvention: "camelCase",
      },
      postcss: {
        plugins: [require("tailwindcss"), require("autoprefixer")],
      },
    },
  },
  resolve: {
    alias: {
      "./runtimeConfig": "./runtimeConfig.browser",
      util: "rollup-plugin-node-polyfills/polyfills/util",
      stream: "rollup-plugin-node-polyfills/polyfills/stream",
      events: "rollup-plugin-node-polyfills/polyfills/events",
    },
  },
  server: {
    port: 3000,
  },
  define: {
    global: "globalThis",
    "process.env": process.env,
  },
  envPrefix: "VITE_",
});
