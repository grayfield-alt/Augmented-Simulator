// src/main.ts (한글)
import './ui/style.css';
import { setupGlobalHandlers } from './ui/selectors';
import { store } from './app/store';
import { renderUI, drawGame } from './ui/renderer';
import * as FX from './ui/fx';
import { initDebugger } from './utils/debugger';
import { validateDataSchema } from './core/validator';

initDebugger(); // V3 Boot 이전에 디버그 레일 우선 활성화 (한글)

function boot() {
    console.log("Augmented Simulator V3 Booting...");

    // 0. 데이터 스키마 무결성 검증 (한글)
    validateDataSchema();

    // 1. 시스템 안정장치 및 아이콘 활성화
    setupGlobalHandlers();
    if ((window as any).lucide) (window as any).lucide.createIcons();

    // 2. 스토어 변경 구독 (UI 렌더러 연결)
    let dirty = false;
    store.subscribe((state) => {
        (window as any).gameStarted = state.gameStarted;
        dirty = true;
    });

    // 3. 초기 상태 갱신
    store.dispatch({ type: 'INIT' });

    // 3.5. 캔버스 렌더링 루프
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const resizeCanvas = () => {
                const parent = canvas.parentElement;
                if (!parent) return;
                const cssWidth = parent.clientWidth;
                const cssHeight = parent.clientHeight;
                if (cssWidth === 0 || cssHeight === 0) return;

                const dpr = window.devicePixelRatio || 1;
                canvas.width = Math.floor(cssWidth * dpr);
                canvas.height = Math.floor(cssHeight * dpr);
                canvas.style.width = `${cssWidth}px`;
                canvas.style.height = `${cssHeight}px`;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            };

            resizeCanvas();
            if (canvas.parentElement) {
                new ResizeObserver(() => requestAnimationFrame(resizeCanvas)).observe(canvas.parentElement);
            }

            let lastTime = performance.now();
            let accumulator = 0;
            const fixedDt = 1000 / 60;

            function loop(time: number) {
                const dt = time - lastTime;
                lastTime = time;
                accumulator += dt;
                if (accumulator > 200) accumulator = 200;

                while (accumulator >= fixedDt) {
                    const state = store.getState();
                    if (state.gameStarted) {
                        // 런타임 데이터 검증 (몬스터 ID 유효성 상시 체크)
                        state.monsters.forEach(m => {
                            if (m.hp > 0 && !m.id) {
                                console.error("[VALIDATOR] Invalid Monster detected in pool!");
                            }
                        });

                        store.dispatch({ type: 'TICK_FR_STEP' });

                        const ev = store.getState().lastEvent;
                        if (ev) {
                            if (ev === 'HIT') {
                                FX.playShakeEffect('heavy');
                                FX.playFlashEffect('red');
                            } else if (ev === 'PARRY') {
                                FX.playShakeEffect('light');
                                FX.playFlashEffect('white');
                            } else if (ev === 'PERFECT_PARRY') {
                                FX.playShakeEffect('heavy');
                                FX.playFlashEffect('white');
                                // 캔버스 좌표 기반 임팩트 (중앙 하단 플레이어 위치)
                                FX.playImpactRing(canvas.clientWidth / 2, canvas.clientHeight * 0.82);
                            } else if (ev === 'EVADE') {
                                FX.playShakeEffect('light');
                            } else if (ev === 'PLAYER_HIT') {
                                FX.playShakeEffect('light');
                                FX.playFlashEffect('white');
                            }
                        }
                    }
                    accumulator -= fixedDt;
                }

                const state = store.getState();
                if (dirty) {
                    renderUI(state);
                    dirty = false;
                }
                drawGame(ctx!, state);
                requestAnimationFrame(loop);
            }
            requestAnimationFrame(loop);

            canvas.addEventListener('pointerdown', (e) => {
                const state = store.getState();
                if (state.gameStarted) {
                    e.preventDefault();
                    if (state.targetingSkill) {
                        const rect = canvas.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;

                        const totalMonsters = state.monsters.length;
                        const spacing = 110; // Sync with renderer
                        const monsterX = rect.width * 0.5;
                        const monsterY = rect.height * 0.25; // Sync with renderer
                        const startX = monsterX - ((totalMonsters - 1) * spacing) / 2;

                        let nearestIdx = -1;
                        let minDist = 60;

                        state.monsters.forEach((m: any, idx: number) => {
                            if (m.hp <= 0) return;
                            const mx = startX + idx * spacing;
                            const my = monsterY;
                            const dist = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
                            if (dist < minDist) { minDist = dist; nearestIdx = idx; }
                        });

                        if (nearestIdx !== -1) {
                            store.dispatch({ type: 'SELECT_TARGET', index: nearestIdx });
                        }
                        return;
                    }

                    if (e.button === 2) store.dispatch({ type: 'DODGE_START' });
                    else store.dispatch({ type: 'PARRY_START' });
                }
            });
            canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        }
    }

    // 4. 이벤트 위임
    document.body.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;

        // HUD Toggle Logic
        const toggleBtn = target.closest('#btn-hud-toggle');
        if (toggleBtn) {
            const expanded = document.getElementById('hud-expanded');
            if (expanded) {
                expanded.classList.toggle('hidden');
                expanded.classList.add('animate-expanded');
            }
            return;
        }

        if (target.closest('#btn-start')) (window as any).startGame();
        if (target.closest('#btn-skill-atk')) store.dispatch({ type: 'EXECUTE_SKILL', skill: 'atk' });
        if (target.closest('#btn-skill-spin')) store.dispatch({ type: 'EXECUTE_SKILL', skill: 'spin' });
        if (target.closest('#btn-skill-heavy')) store.dispatch({ type: 'EXECUTE_SKILL', skill: 'heavy' });
        if (target.closest('#btn-turn-end')) store.dispatch({ type: 'END_TURN_MANUAL' });
        if (target.closest('#btn-parry')) store.dispatch({ type: 'PARRY_START' });
        if (target.closest('#btn-dodge')) store.dispatch({ type: 'DODGE_START' });
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
