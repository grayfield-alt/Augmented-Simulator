import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  return {
    base: command === 'build' ? '/Augmented-Simulator/' : '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      minify: 'terser',
      sourcemap: true,
    },
    server: {
      port: 5173,
      open: true,
    },
  };
});
