import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Root .env contains deployment and wallet secrets. Never load it into Vite.
export default defineConfig({
  plugins: [react()],
  envDir: false,
  build: { sourcemap: false },
  server: { strictPort: true },
});
