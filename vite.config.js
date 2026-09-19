import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Nota: Per il prerendering completo (Open Graph per WhatsApp),
    // configura vite-plugin-prerender o react-snap in fase di deploy.
    // Vedi CONFIGURAZIONE_OPEN_GRAPH.md per dettagli.
  ],
  server: {
    host: "0.0.0.0",
    port: 3001,
    strictPort: true,
    hmr: {
      port: 3001,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          leaflet: ['leaflet'],
        }
      }
    }
  }
});
