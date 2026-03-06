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
    if (!ctx || !ctx.canvas) return;

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!state.gameStarted) return;

    // 동적 좌표 할당 (임시: 1:1 전투 기준) (한글)
    const playerX = w * 0.3;
    const playerY = h * 0.6;
    const monsterX = w * 0.7;
    const monsterY = h * 0.6;

    // 1. 플레이어 렌더링 (한글)
    const p = state.player;
    ctx.save();

    // 대시 잔상 효과 (한글)
    if (p.dashTimer > 0) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(playerX - 20, playerY, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1.0;
    // 패링 중이거나 잔여 판정 시간이 있으면 파란색, 기본은 녹색 (한글)
    ctx.fillStyle = (p.isParrying || p.parryTimer > 0) ? "#4a9eff" : "#4ade80";
    ctx.beginPath();
    ctx.arc(playerX, playerY, 25, 0, Math.PI * 2);
    ctx.fill();

    // 플레이어 체력 바 (한글)
    drawBar(ctx, playerX - 30, playerY + 40, 60, 6, p.hp / Math.max(1, p.maxHp), "#4ade80");
    ctx.restore();

    // 2. 몬스터 렌더링 (한글)
    if (state.monsters && state.monsters.length > 0) {
        const m = state.monsters[0];
        ctx.save();

        let mColor = "#ffffff"; // 대기
        if (m.state === "TELEGRAPH") mColor = "#facc15"; // 경고 (노란색)
        if (m.state === "ATTACK") mColor = "#ff4a4a";    // 공격 (빨간색)

        ctx.fillStyle = mColor;
        ctx.beginPath();
        ctx.roundRect(monsterX - 40, monsterY - 40, 80, 80, 10); // 네모난 몬스터 외형
        ctx.fill();

        // 몬스터 체력 바 (한글)
        drawBar(ctx, monsterX - 40, monsterY - 60, 80, 8, m.hp / Math.max(1, m.maxHp), "#ff4a4a");
        ctx.restore();
    }
}

// 체력 바 그리기 헬퍼 함수 (한글)
function drawBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ratio: number, color: string) {
    ctx.fillStyle = "#333333";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, Math.max(0, w * ratio), h);
}
