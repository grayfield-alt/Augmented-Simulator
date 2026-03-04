/**
 * Global Error Handling System
 * Captures runtime errors and displays a user-friendly crash overlay.
 */
export function initErrorHandler() {
    window.onerror = function (message, source, lineno, colno, error) {
        showErrorOverlay(`Runtime Error`, `${message}\nat ${source}:${lineno}:${colno}`);
        return false;
    };

    window.onunhandledrejection = function (event) {
        showErrorOverlay(`Unhandled Promise Rejection`, event.reason);
    };

    console.log("ErrorHandler: Initialized");
}

function showErrorOverlay(title, stack) {
    const overlay = document.createElement('div');
    overlay.id = 'crash-overlay';
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(40, 0, 0, 0.95); color: #ff6b6b; z-index: 10000;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        padding: 2rem; font-family: monospace; text-align: left; overflow-y: auto;
    `;

    overlay.innerHTML = `
        <h1 style="margin-bottom: 1rem; border-bottom: 2px solid #ff6b6b; width: 100%; max-width: 600px;">⚠️ SYSTEM CRASH</h1>
        <div style="width: 100%; max-width: 600px;">
            <p><strong>${title}</strong></p>
            <pre style="background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 4px; white-space: pre-wrap;">${stack}</pre>
            <button onclick="location.reload()" style="
                margin-top: 2rem; padding: 1rem 2rem; background: #ff6b6b; color: white;
                border: none; cursor: pointer; font-weight: bold; border-radius: 4px;
            ">REBOOT SYSTEM</button>
        </div>
    `;

    document.body.appendChild(overlay);
}
