// src/main.ts (한글)
import './ui/style.css';
import { setupGlobalHandlers } from './ui/selectors';
import { store } from './app/store';
import { renderUI } from './ui/renderer';

function boot() {
    console.log("Augmented Simulator V3 Booting...");

    // 1. 시스템 안정장치 활성화 (한글)
    setupGlobalHandlers();

    // 2. 스토어 변경 구독 (UI 렌더러 연결) (한글)
    store.subscribe((state) => {
        renderUI(state);
    });

    // 3. 초기 상태 갱신 (한글)
    store.dispatch({ type: 'INIT' });

    console.log("V3 Core Operational.");
}

document.addEventListener('DOMContentLoaded', boot);
