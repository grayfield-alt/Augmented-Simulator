// src/main.ts (한글)
import './ui/style.css';
import { setupGlobalHandlers } from './ui/selectors';
import { store } from './app/store';
import { renderUI } from './ui/renderer';
import { initDebugger } from './utils/debugger';

initDebugger(); // V3 Boot 이전에 디버그 레일 우선 활성화 (한글)

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

    // 4. 이벤트 위임(Event Delegation)을 통한 버튼 클릭 바인딩 (사용자 지침 A 반영) (한글)
    document.body.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('#btn-start')) {
            if (typeof (window as any).startGame === 'function') {
                (window as any).startGame();
            } else {
                console.error("Global startGame function not found.");
            }
        } else if (target.closest('#btn-archive')) {
            if (typeof (window as any).openInventory === 'function') {
                (window as any).openInventory();
            }
        } else if (target.closest('#btn-briefing')) {
            if (typeof (window as any).toggleGuide === 'function') {
                (window as any).toggleGuide(true);
            }
        }
    });

    console.log("V3 Core Operational. Game Loop initialized via Event Delegation.");
}

document.addEventListener('DOMContentLoaded', boot);
