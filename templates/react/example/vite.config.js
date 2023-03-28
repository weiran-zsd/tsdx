import { defineConfig } from 'vite';
import ReactPlugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  resovle: {
    alias: {
      react: '../node_modules/react',
      'react-dom': '../node_modules/react-dom/profiling',
      'scheduler/tracing': '../node_modules/scheduler/tracing-profiling',
    },
  },
  plugins: [ReactPlugin()],
});
