import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        admin: resolve(__dirname, 'index.html'),
        widget: resolve(__dirname, 'chatBot/index.html'),
      },
    },
  },
})
