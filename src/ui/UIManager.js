/**
 * UI State Sync for V3
 */
export class UIManager {
    constructor() {
        this.elements = {
            hp: document.getElementById('p-hp'),
            atk: document.getElementById('p-atk'),
            def: document.getElementById('p-def'),
            ap: document.getElementById('p-ap'),
            msg: document.getElementById('message'),
            turnIndicator: document.getElementById('turn-indicator')
        };
    }

    update(state) {
        const { player, currentTurn } = state;

        // Stats
        if (this.elements.hp) this.elements.hp.textContent = Math.ceil(player.hp);
        if (this.elements.atk) this.elements.atk.textContent = player.atk;
        if (this.elements.def) this.elements.def.textContent = player.def;
        if (this.elements.ap) this.elements.ap.textContent = player.ap;

        // Turn Indicator
        if (this.elements.turnIndicator) {
            this.elements.turnIndicator.textContent = currentTurn === 'PLAYER' ? "Player's Turn" : "Monster's Turn";
            this.elements.turnIndicator.style.color = currentTurn === 'PLAYER' ? "#444" : "#ff4444";
        }
    }

    showMessage(msg, color = "#fff") {
        if (!this.elements.msg) return;
        this.elements.msg.textContent = msg;
        this.elements.msg.style.color = color;
        this.elements.msg.classList.add('fade-in');
        setTimeout(() => this.elements.msg.classList.remove('fade-in'), 500);
    }
}
