import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const allowedHosts = [
  "libertyloft.cz",
  "www.libertyloft.cz",
  ...(process.env.ALLOWED_HOSTS?.split(",").map((host) => host.trim()) ?? []),
].filter(Boolean);

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts,
    hmr: {
      overlay: false,
    },
  },
  preview: {
    host: "::",
    port: 8080,
    allowedHosts,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
