// src/main.ts (한글)
import './ui/style.css';
import { setupGlobalHandlers } from './ui/selectors';
import { store } from './app/store';
import { renderUI, drawGame } from './ui/renderer';
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

    // 3.5. 캔버스 렌더링 루프 및 해상도 동기화 (한글)
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // 해상도 조절 함수 (한글)
            const resizeCanvas = () => {
                const parent = canvas.parentElement;
                if (!parent) return;

                const cssWidth = parent.clientWidth;
                const cssHeight = parent.clientHeight;

                // 만약 부모가 hidden 상태라 크기가 0이면 무시하거나 임시 최소값 지정
                if (cssWidth === 0 || cssHeight === 0) return;

                const dpr = window.devicePixelRatio || 1;

                // 실제 픽셀 해상도를 CSS 크기 * DPR로 설정 
                canvas.width = Math.floor(cssWidth * dpr);
                canvas.height = Math.floor(cssHeight * dpr);

                // CSS 표시 크기는 그대로 유지
                canvas.style.width = `${cssWidth}px`;
                canvas.style.height = `${cssHeight}px`;
                canvas.style.display = 'block';

                // DPR 스케일링 적용
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

                console.log(`[canvas] w:${canvas.width}/h:${canvas.height} clientW:${cssWidth}/clientH:${cssHeight} dpr:${dpr}`);
            };

            // 초기 1회 실행 및 여러 이벤트에 리사이즈 바인딩 (한글)
            resizeCanvas();
            requestAnimationFrame(() => requestAnimationFrame(resizeCanvas));

            window.addEventListener('resize', () => {
                requestAnimationFrame(resizeCanvas);
            });

            // ResizeObserver를 통해 부모(play-area) 크기 변경 감지 (display:none -> block 될 때 갱신)
            if (canvas.parentElement) {
                const ro = new ResizeObserver(() => {
                    requestAnimationFrame(resizeCanvas);
                });
                ro.observe(canvas.parentElement);
            }

            let lastTime = performance.now();
            let accumulator = 0;
            const fixedDt = 1000 / 60;
            let firstTick = false;

            function loop(time: number) {
                const dt = time - lastTime;
                lastTime = time;
                accumulator += dt;

                // 성능 저하 시 무한 루프 방지 (한글)
                if (accumulator > 200) accumulator = 200;

                while (accumulator >= fixedDt) {
                    if (store.getState().gameStarted) {
                        store.dispatch({ type: 'TICK_FR_STEP' });
                        if (!firstTick) {
                            console.log("FIRST_TICK_DISPATCHED");
                            firstTick = true;
                        }
                    }
                    accumulator -= fixedDt;
                }

                try {
                    drawGame(ctx!, store.getState());
                } catch (err) {
                    (window as any).lastDrawGameError = err;
                }
                requestAnimationFrame(loop);
            }
            requestAnimationFrame(loop);

            // 캔버스 자체 입력 (패링/터치) 액션 연결 (한글)
            canvas.addEventListener('pointerdown', (e) => {
                if (store.getState().gameStarted) {
                    e.preventDefault();
                    console.log("[INPUT] PARRY_START");
                    store.dispatch({ type: 'PARRY_START' });
                }
            });
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
        } else if (target.closest('#btn-skill-atk')) {
            store.dispatch({ type: 'EXECUTE_SKILL', skill: 'atk' });
        } else if (target.closest('#btn-skill-spin')) {
            store.dispatch({ type: 'EXECUTE_SKILL', skill: 'spin' });
        } else if (target.closest('#btn-skill-heavy')) {
            store.dispatch({ type: 'EXECUTE_SKILL', skill: 'heavy' });
        }
    });

    // 5. 전역 액션 브릿지 등록 (Legacy 호환성 및 버튼 바인딩용) (한글)
    let _inputLock = false; // 중복 실행 방지 락 (한글)

    (window as any).startGame = () => {
        if (_inputLock) return;
        _inputLock = true;
        try {
            console.log("Game Start Signal Received.");
            store.dispatch({ type: 'START_GAME' });
        } catch (err) {
            console.error(err);
        } finally {
            _inputLock = false; // 에러가 나도 반드시 락 해제 (한글)
        }
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
