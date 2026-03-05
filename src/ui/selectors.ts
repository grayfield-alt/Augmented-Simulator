// src/ui/selectors.ts (한글)

export const SELECTORS = {
    app: 'app',
    canvas: 'gameCanvas',
    hp: 'p-hp',
    atk: 'p-atk',
    def: 'p-def',
    ap: 'p-ap',
    turn: 'turn-indicator',
    message: 'message',
    errorOverlay: 'error-overlay',
    // ... 버튼 및 오버레이 ID 생략/추가
};

// 에러 스로틀링 관리 (한글)
const errorCounts: Record<string, number> = {};
const ERROR_LIMIT = 3;

export function mustGet<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(id) as T;
    if (!el) {
        const errorMsg = `CRITICAL UI ELEMENT MISSING: ${id}`;
        showErrorOverlay(errorMsg);
        throw new Error(errorMsg);
    }
    return el;
}

export function showErrorOverlay(msg: string) {
    const overlay = document.getElementById(SELECTORS.errorOverlay);
    if (overlay) {
        // 동일 에러 반복 출력 스로틀링 (한글)
        const count = errorCounts[msg] || 0;
        if (count < ERROR_LIMIT) {
            overlay.style.display = 'block';
            overlay.innerText = `[SYSTEM ERROR] ${msg}\n\n${new Error().stack}`;
            errorCounts[msg] = count + 1;
        }
        if (count === ERROR_LIMIT) {
            console.warn(`Error throttled: ${msg}`);
        }
    }
    console.error(msg);
}

export function setupGlobalHandlers() {
    window.onerror = (msg, url, line, col, error) => {
        showErrorOverlay(`Uncaught Error: ${msg} at ${line}:${col}`);
        return false; // 기본 핸들러 유지
    };

    window.onunhandledrejection = (event) => {
        showErrorOverlay(`Unhandled Promise Rejection: ${event.reason}`);
    };
}
