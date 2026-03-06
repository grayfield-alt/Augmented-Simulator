// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // 단일 경로 고정: 루트 tests/ 폴더만 스캔 (한글)
        include: ['tests/**/*.test.ts'],
        // 빌드 산출물 및 구버전 폴더 제외 (한글)
        exclude: [
            'dist/**',
            'prototypes/**',
            'public/**',
            'node_modules/**',
            'src/tests/**',  // 구버전 위치 명시적 제외
        ],
        // ESM 모드 안정화를 위한 설정 (한글)
        environment: 'node',
    },
});
