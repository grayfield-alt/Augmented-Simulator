/**
 * Augmented Simulator V3 - Main Entry
 */
import { initErrorHandler } from './utils/ErrorHandler.js';
import { GameStore } from './core/State.js';
import { Renderer } from './ui/Renderer.js';
import { UIManager } from './ui/UIManager.js';
import { InputHandler } from './ui/InputHandler.js';
import { Monster } from './core/MonsterSystem.js';
import { SkillSystem } from './core/SkillSystem.js';
import { MONSTER_LIBRARY } from './data/monsters.js';
import { STAGE_DATA } from './data/stages.js';

let renderer, ui, input;

async function init() {
    initErrorHandler();

    renderer = new Renderer('gameCanvas');
    ui = new UIManager();

    window.addEventListener('resize', () => renderer.resize('play-area'));
    renderer.resize('play-area');

    input = new InputHandler(renderer.canvas, handleGlobalInput);

    // Global Action Bridge for HTML Buttons
    window.gameAction = (action) => {
        const state = GameStore.getState();
        if (state.currentTurn !== 'PLAYER') return;

        let result;
        if (action === 'atk') result = SkillSystem.executeAttack(state.monsters[0]);
        if (action === 'spin') result = SkillSystem.executeSpinSlash(state.monsters);
        if (action === 'heavy') result = SkillSystem.executeHeavyStrike(state.monsters[0]);
        if (action === 'end') endTurn();

        if (result) {
            ui.showMessage(result.msg, "#FFD700");
            checkVictory();
        }
    };

    GameStore.subscribe((state) => ui.update(state));

    startGame();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    spawnWave(1);
    GameStore.setState({ gameStarted: true });
}

function spawnWave(round) {
    const stage = STAGE_DATA[round];
    if (!stage || stage === "EVENT") return;

    const monsters = stage.map((id, i) => {
        const data = MONSTER_LIBRARY.find(m => m.id === id);
        const m = new Monster(id, data);
        m.x = renderer.width / (stage.length + 1) * (i + 1);
        m.y = renderer.height * 0.25;
        return m;
    });

    GameStore.setState({ monsters, currentTurn: 'MONSTER', round });
}

function handleGlobalInput(inputData) {
    const state = GameStore.getState();
    if (state.currentTurn === 'MONSTER') {
        if (inputData.button === 0) { // Left Click / Touch -> Parry
            GameStore.setState({ player: { ...state.player, parryTimer: 15, isParrying: true } });
        } else if (inputData.button === 2) { // Right Click -> Dash
            GameStore.setState({ player: { ...state.player, dashTimer: 20 } });
        }
    }
}

function gameLoop(time) {
    const state = GameStore.getState();
    if (!state.gameStarted) return;

    // 1. Update Logic
    const p = state.player;
    if (p.parryTimer > 0) p.parryTimer--;
    else p.isParrying = false;

    if (p.dashTimer > 0) p.dashTimer--;

    state.monsters.forEach(m => {
        m.update();
        // Attack logic
        if (state.currentTurn === 'MONSTER' && m.state === 'IDLE' && Math.random() < 0.01) {
            m.startAttack();
        }
        // Hit check
        if (m.state === 'ATTACK' && m.timer === 1) {
            if (p.dashTimer <= 0 && !p.isParrying) {
                p.hp -= m.atk;
                ui.showMessage(`HIT! -${m.atk}`, "#ff4444");
            } else if (p.isParrying) {
                ui.showMessage("PARRIED!", "#44ff44");
                p.ap += 1;
            } else {
                ui.showMessage("EVADED!", "#aaa");
            }
        }
    });

    // 2. Render
    renderer.clear();
    renderer.drawPlayer(p);
    state.monsters.forEach(m => renderer.drawMonster(m));

    requestAnimationFrame(gameLoop);
}

function endTurn() {
    GameStore.setState({ currentTurn: 'MONSTER' });
}

function checkVictory() {
    const state = GameStore.getState();
    if (state.monsters.every(m => m.hp <= 0)) {
        ui.showMessage("WAVE CLEAR!", "#FFD700");
        setTimeout(() => spawnWave(state.round + 1), 1000);
    }
}

init();
