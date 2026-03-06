import { GameState } from '../core/state';
import { SELECTORS, mustGet } from './selectors';
import { renderStageFlow } from './stageFlowView';

export function renderUI(state: GameState) {
    // 1. 상태 텍스트 업데이트 (한글)
    const hp = mustGet(SELECTORS.hp);
    const atk = mustGet(SELECTORS.atk);
    const def = mustGet(SELECTORS.def);
    const ap = mustGet(SELECTORS.ap);

    hp.innerText = Math.ceil(state.player.hp).toString();
    atk.innerText = state.player.atk.toString();
    def.innerText = state.player.def.toString();
    ap.innerText = Math.floor(state.player.ap).toString();

    // 2. 턴 표시기 업데이트 (한글)
    const turnIndicator = mustGet(SELECTORS.turn);
    if (state.currentTurn === 'PLAYER') {
        turnIndicator.innerText = "PLAYER'S TURN";
        turnIndicator.style.color = "var(--primary)";
        turnIndicator.style.display = "block";
    } else if (state.currentTurn === 'MONSTER') {
        turnIndicator.innerText = "MONSTER'S TURN";
        turnIndicator.style.color = "var(--danger)";
        turnIndicator.style.display = "block";
    } else {
        turnIndicator.style.display = "none";
    }

    // 3. 화면 전환 (로비 vs 배틀) (한글)
    const lobby = mustGet(SELECTORS.lobby);
    const battle = mustGet(SELECTORS.battleScreen);

    if (state.gameStarted) {
        lobby.classList.add('hidden');
        battle.classList.remove('hidden');
        battle.classList.add('flex');
    } else {
        lobby.classList.remove('hidden');
        battle.classList.add('hidden');
    }

    // 4. 오버레이 상태 관리 (한글) - 필요 시 추가 구현
    const augOverlay = document.getElementById(SELECTORS.overlayAug);
    if (augOverlay) {
        augOverlay.classList.toggle('hidden', !state.showAugmentOverlay);
    }

    // 5. 스테이지 노드 기반 UI 렌더링 연동 (한글)
    renderStageFlow(state);
}

export function drawGame(ctx: CanvasRenderingContext2D, state: GameState) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // ... 캔버스 그리기 로직 (Player, Monster) (한글)
}
