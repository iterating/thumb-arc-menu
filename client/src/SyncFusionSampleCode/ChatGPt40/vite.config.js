import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'src/SyncFusionSampleCode/ChatGPt40',  // Set root to our example directory
  base: './',  // Use relative paths
});
