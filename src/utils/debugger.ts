// src/utils/debugger.ts (한글)
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
        min-width: 250px;
    `;
    document.body.appendChild(hud);

    let debugState = {
        startBind: 'UNKNOWN',
        inputLocked: 'WAITING',
        lastAction: 'None',
        lastGlobalError: 'None',
        lastRenderError: 'None'
    };

    function renderHUD() {
        // 전역 객체에서 렌더링 에러 스니핑 (한글)
        if ((window as any).lastDrawGameError) {
            const err = (window as any).lastDrawGameError;
            debugState.lastRenderError = err.stack ? err.stack.split('\n')[0] : String(err);
        }

        hud.innerHTML = `
            <div style="color:#ffcc00; font-weight:bold; margin-bottom:5px;">[DEBUG HUD]</div>
            <div>Start Bind: <span style="color:${debugState.startBind === 'OK' ? '#0f0' : '#f00'}">${debugState.startBind}</span></div>
            <div>Input Locked (gameStarted): ${debugState.inputLocked}</div>
            <div>Last Action: <span style="color:#4a9eff">${debugState.lastAction}</span></div>
            <div style="color:#ff4a4a">Global Err: ${debugState.lastGlobalError}</div>
            <div style="color:#ff4a4a">Render Err: ${debugState.lastRenderError}</div>
        `;
    }
    renderHUD();

    // 2. 주기적인 상태 모니터링 (Start 버튼 바인딩, 게임 시작 여부 등)
    setInterval(() => {
        const hasStartGame = typeof (window as any).startGame === 'function';
        debugState.startBind = hasStartGame ? 'OK' : 'NO HANDLER';
        debugState.inputLocked = (window as any).gameStarted ? 'RUNNING(true)' : 'WAITING(false)';
        renderHUD();
    }, 500);

    // 3. 전역 에러 핸들링 (onerror, unhandledrejection)
    const handleError = (msg: string, stack: string = '') => {
        debugState.lastGlobalError = msg;
        renderHUD();
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
        debugState.lastAction = `CLICK: ${target.tagName}${target.id ? '#' + target.id : ''}`;
        renderHUD();

        // btn-start 클릭 시도 감지
        const startBtn = target.closest('#btn-start');
        if (startBtn) {
            // 버튼 요소 가려짐 여부 경고 (실행을 막지 않음)
            const rect = startBtn.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const topEl = document.elementFromPoint(x, y);

            if (topEl && topEl !== startBtn && !startBtn.contains(topEl)) {
                const overlayName = `${topEl.tagName}${topEl.id ? '#' + topEl.id : ''}`;
                console.warn(`[DEBUG] Click intercepted! Button covered by:`, topEl);
            }

            // 500ms 이후 gameStarted 지연 경고 (로직 차단 없음)
            setTimeout(() => {
                if (!(window as any).gameStarted) {
                    console.warn(`[DEBUG] START_WARN: gameStarted is still false 500ms after clicking Start.`);
                }
            }, 500);
        }
    }, true);
}
