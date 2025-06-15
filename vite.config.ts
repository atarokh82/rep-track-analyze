import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/rep-track-analyze/' : '/',
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    sourcemap: true
  },
  define: {
    // Explicitly define the environment variables
    __SUPABASE_URL__: JSON.stringify("https://rfaopncdcgmkpdwaqgjg.supabase.co"),
    __SUPABASE_ANON_KEY__: JSON.stringify("eyJhbGciOiJIUzI1NiIsInR5ncCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmYW9wbmNkY2dta3Bkd2FxZ2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzgxNTYsImV4cCI6MjA2NTE1NDE1Nn0.69O2xq-OaRF1f6d4Qd-NI3hOVl-o1fjAMPZDCgHWnqo"),
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
