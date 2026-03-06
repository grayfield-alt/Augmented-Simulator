// src/ui/selectors.ts (한글)

export const SELECTORS = {
    app: 'app',
    canvas: 'gameCanvas',
    hp: 'p-hp',
    atk: 'p-atk',
    def: 'p-def',
    ap: 'p-ap',
    turn: 'turn-indicator-overlay',
    message: 'message',
    errorOverlay: 'error-overlay',
    btnAtk: 'btn-atk',
    btnSpin: 'btn-spin',
    btnHeavy: 'btn-heavy',
    btnEnd: 'btn-end',
    lobby: 'lobby-overlay',
    battleScreen: 'battle-screen',
    overlayAug: 'augment-overlay',
    overlayEvent: 'event-overlay',
    overlayGameOver: 'game-over-overlay',
    inventory: 'inventory-overlay',
    stageEditor: 'stage-editor-overlay',
    overlayGuide: 'guide-overlay',
    vignette: 'vignette',
    hitIcons: 'hit-icons-container',
    btnReroll: 'btn-reroll',
    msg: 'msg-container'
};

export const REQUIRED_IDS = [
    SELECTORS.hp,
    SELECTORS.atk,
    SELECTORS.def,
    SELECTORS.ap,
    SELECTORS.canvas,
    SELECTORS.lobby,
    SELECTORS.battleScreen,
    SELECTORS.turn,
    SELECTORS.errorOverlay
];

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
