/**
 * Canvas Renderer for V3
 */
import { CONFIG } from '../config.js';

export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
    }

    resize(containerId) {
        const container = document.getElementById(containerId);
        const rect = container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = rect.width;
        this.height = rect.height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawPlayer(player) {
        const { x, y, parryTimer, dashTimer } = player;
        this.ctx.save();

        // Dash Ghost Effect
        if (dashTimer > 0) {
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillStyle = "#fff";
            this.ctx.beginPath();
            this.ctx.arc(x - 20, y, 20, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1.0;
        this.ctx.fillStyle = parryTimer > 0 ? CONFIG.PRIMARY_COLOR : CONFIG.SECONDARY_COLOR;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 25, 0, Math.PI * 2);
        this.ctx.fill();

        // HP Bar
        this.drawBar(x - 30, y + 40, 60, 6, player.hp / player.maxHp, "#4caf50");

        this.ctx.restore();
    }

    drawMonster(monster) {
        const { x, y, state, hp, maxHp } = monster;
        this.ctx.save();

        let color = "#fff";
        if (state === "TELEGRAPH") color = "#ff9800";
        if (state === "ATTACK") color = "#f44336";

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.roundRect(x - 40, y - 40, 80, 80, 10);
        this.ctx.fill();

        this.drawBar(x - 40, y - 60, 80, 8, hp / maxHp, "#f44336");

        this.ctx.restore();
    }

    drawBar(x, y, w, h, ratio, color) {
        this.ctx.fillStyle = "#333";
        this.ctx.fillRect(x, y, w, h);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w * ratio, h);
    }
}
