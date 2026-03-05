// src/main.ts (한글)
import './ui/style.css';
import { setupGlobalHandlers } from './ui/selectors';
import { store } from './app/store';

// 초기 부팅 로직 (한글)
document.addEventListener('DOMContentLoaded', () => {
    console.log("Augmented Simulator V3 Core Booting...");

    // 1. 전역 에러 핸들러 설정 (한글)
    setupGlobalHandlers();

    // 2. 초기 상태 렌더링 (한글)
    const state = store.getState();
    // renderInitialUI(state); // 향후 UI 모듈 완성 시 연동

    console.log("V3 Ready.");
});
