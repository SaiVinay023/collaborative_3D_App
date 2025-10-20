import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      external: ["@react-three/fiber",
        "@react-three/drei",
        "lucide-react",
        "socket.io-client"
      ]
    }
  }
});
