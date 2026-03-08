import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
    plugins: [react(), viteSingleFile()],
    build: {
        target: 'esnext',
        assetsInlineLimit: 100000000, // 모든 자산을 인라이닝
        chunkSizeWarningLimit: 100000000,
        cssCodeSplit: false,
        brotliSize: false,
        rollupOptions: {
            inlineDynamicImports: true,
        },
    },
})
