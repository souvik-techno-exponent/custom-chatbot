import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// Build the widget app and the embeddable loader script
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        loader: resolve(__dirname, 'src/bootstrap.js')
      },
      output: {
        entryFileNames: (chunk) => chunk.name === 'loader' ? 'loader.js' : 'assets/[name]-[hash].js'
      }
    }
  }
})
