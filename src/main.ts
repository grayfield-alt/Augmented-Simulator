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
        // 전역 상태 동기화 (debugger.ts 등에서 활용) (한글)
        (window as any).gameStarted = state.gameStarted;
        renderUI(state);
    });

    // 3. 초기 상태 갱신 (한글)
    store.dispatch({ type: 'INIT' });

    // 3.5. 캔버스 렌더링 루프 시작 (한글)
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            function loop() {
                import('./ui/renderer').then(({ drawGame }) => {
                    drawGame(ctx!, store.getState());
                });
                requestAnimationFrame(loop);
            }
            requestAnimationFrame(loop);
        }
    }

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

    // 5. 전역 액션 브릿지 등록 (Legacy 호환성 및 버튼 바인딩용) (한글)
    (window as any).startGame = () => {
        console.log("Game Start Signal Received.");
        store.dispatch({ type: 'START_GAME' });
    };

    (window as any).openInventory = () => {
        console.log("Inventory Open Signal Received.");
        // 구현 예정 (한글)
    };

    (window as any).toggleGuide = (show: boolean) => {
        console.log("Guide Toggle Signal Received:", show);
        // 구현 예정 (한글)
    };

    console.log("V3 Core Operational. Game Loop initialized via Event Delegation.");
}

document.addEventListener('DOMContentLoaded', boot);
