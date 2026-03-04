/**
 * Input Management for V3
 */
export class InputHandler {
    constructor(canvas, onInput) {
        this.canvas = canvas;
        this.onInput = onInput;
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        this.init();
    }

    init() {
        // Mouse Events
        this.canvas.addEventListener('mousedown', (e) => {
            this.onInput({
                type: 'POINTER',
                button: e.button,
                x: e.clientX,
                y: e.clientY,
                target: e.target
            });
        });

        // Context Menu Prevention for Right Click Dash
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());

        // Touch Events (Abstracted)
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent zoom/scroll
            const touch = e.touches[0];
            this.onInput({
                type: 'POINTER',
                button: 0, // Treat as left click
                x: touch.clientX,
                y: touch.clientY,
                target: e.target
            });
        }, { passive: false });
    }
}
