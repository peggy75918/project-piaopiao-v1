import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // 允許外部訪問
    port: 5173, // 確保 Vite 使用正確的 Port
    strictPort: true, // 確保固定 Port
    https: false, // ngrok 會提供 HTTPS，這裡保持 HTTP
    cors: true, // 允許 CORS（解決 ngrok 請求被攔截）
    hmr: {
      clientPort: 443, // 確保 Hot Module Reload (HMR) 運行在 HTTPS
    },
    allowedHosts: [
      "localhost", "e9ca-219-85-43-234.ngrok-free.app" // 或者改為 ["localhost", "your-ngrok-subdomain.ngrok-free.app"]
    ],
  },
});
