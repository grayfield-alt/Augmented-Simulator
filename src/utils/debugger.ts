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
        inputLocked: 'UNKNOWN',
        lastAction: 'None',
        lastError: 'None'
    };

    function renderHUD() {
        hud.innerHTML = `
            <div style="color:#ffcc00; font-weight:bold; margin-bottom:5px;">[DEBUG HUD]</div>
            <div>Start Bind: <span style="color:${debugState.startBind === 'OK' ? '#0f0' : '#f00'}">${debugState.startBind}</span></div>
            <div>Input Locked (gameStarted): ${debugState.inputLocked}</div>
            <div>Last Action: <span style="color:#4a9eff">${debugState.lastAction}</span></div>
            <div style="color:#ff4a4a">Last Error: ${debugState.lastError}</div>
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
        debugState.lastError = msg;
        renderHUD();
        console.error(`[GLOBAL ERROR CAUGHT] ${msg}`, stack);

        let overlay = document.getElementById('debug-error-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'debug-error-overlay';
            overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; padding:20px; background:rgba(255,0,0,0.9); color:white; z-index:100000; font-family:monospace; white-space:pre-wrap; font-size:12px;';
            document.body.appendChild(overlay);
        }
        overlay.innerText = `CRITICAL ERROR:\n${msg}\n\nSTACK:\n${stack}`;
        setTimeout(() => overlay && overlay.remove(), 5000); // 5초 노출 후 숨김
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
            // 버튼 중심 좌표를 기준으로 elementFromPoint 추적
            const rect = startBtn.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const topEl = document.elementFromPoint(x, y);

            if (topEl && topEl !== startBtn && !startBtn.contains(topEl)) {
                const overlayName = `${topEl.tagName}${topEl.id ? '#' + topEl.id : ''}`;
                console.warn(`[DEBUG] Click intercepted! Button covered by:`, topEl);
                debugState.lastError = `Overlay Blocking: ${overlayName}`;
                renderHUD();
            }

            // 5. 실패 조건 로직 (500ms 내 RUNNING 전환 확인)
            setTimeout(() => {
                if (!(window as any).gameStarted) {
                    let failReason = 'Unknown Error';
                    if (debugState.startBind === 'NO HANDLER') failReason = 'Missing startGame function';
                    else if (debugState.lastError.includes('Overlay Blocking')) failReason = 'Blocked by UI Overlay';
                    else failReason = 'Logical Input Lock (Script error on load)';

                    debugState.lastError = `START_FAIL (${failReason})`;
                    renderHUD();
                    console.error(`[DEBUG] Start operation failed! Reason: ${failReason}`);
                }
            }, 500);
        }
    }, true); // Capture phase로 설정하여 가장 먼저 이벤트 인지
}
