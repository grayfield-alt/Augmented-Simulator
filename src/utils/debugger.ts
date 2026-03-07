import { store } from '../app/store';

declare const __BUILD_ID__: string;

export function initDebugger() {
    // 1. 화면 우측 상단 Debug HUD 생성
    const hud = document.createElement('div');
    hud.id = 'debug-hud';
    hud.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.8);
        border: 1px solid #4a9eff;
        color: #fff;
        padding: 10px;
        font-family: monospace;
        font-size: 11px;
        z-index: 99999;
        pointer-events: none;
        min-width: 200px;
    `;
    document.body.appendChild(hud);

    function renderHUD() {
        const buildId = typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'local';
        const st = store.getState();
        const p = st.player;
        const m = st.monsters && st.monsters.length > 0 ? st.monsters[0] : null;

        const phase = st.gameStarted ? st.currentTurn : 'WAITING';
        const ap = p ? p.ap : 0;
        const parry = p ? Math.round(p.parryTimer) : 0;

        const mState = m ? m.state : 'NONE';
        const mTimer = m ? Math.round(m.attackTimerMs) : 0;

        hud.innerHTML = `
            <div style="color:#ffcc00; font-weight:bold; margin-bottom:5px;">[DEBUG HUD] v.${buildId}</div>
            <div style="color:#4ade80">PHASE: ${phase}</div>
            <div>PLAYER AP: <span style="color:#4a9eff">${ap}</span></div>
            <div>PARRY timer: ${parry > 0 ? parry : '-'}</div>
            <div style="margin-top:5px; padding-top:5px; border-top:1px solid #444;"></div>
            <div style="color:#ff4a4a">M_STATE: ${mState}</div>
            <div style="color:#ff4a4a">M_TIMER: ${mTimer}</div>
        `;
    }
    renderHUD();

    // 2. 주기적인 상태 모니터링
    setInterval(() => {
        renderHUD();
    }, 500);

    // 3. 전역 에러 핸들링 (onerror, unhandledrejection)
    const handleError = (msg: string, stack: string = '') => {
        console.error(`[GLOBAL ERROR CAUGHT] ${msg}`, stack);
    };

    window.onerror = (msg, url, line, col, error) => {
        handleError(`${msg} (Line: ${line})`, error?.stack || '');
        return false;
    };
    window.addEventListener('unhandledrejection', (e) => {
        handleError(`Unhandled Promise: ${e.reason}`);
    });

    // 4. 클릭 가로채기 감지 (Capture Phase)
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;

        // btn-start 클릭 시도 감지
        const startBtn = target.closest('#btn-start');
        if (startBtn) {
            // 버튼 요소 가려짐 여부 경고 (실행을 막지 않음)
            const rect = startBtn.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const topEl = document.elementFromPoint(x, y);

            if (topEl && topEl !== startBtn && !startBtn.contains(topEl)) {
                console.warn(`[DEBUG] Click intercepted! Button covered by:`, topEl);
            }
        }
    }, true);
}
