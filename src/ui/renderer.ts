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

    // 6. 스킬 버튼 상태 연동 (AP 부족 시 비활성화) (한글)
    const btnAtk = document.getElementById('btn-skill-atk') as HTMLButtonElement;
    const btnSpin = document.getElementById('btn-skill-spin') as HTMLButtonElement;
    const btnHeavy = document.getElementById('btn-skill-heavy') as HTMLButtonElement;

    if (btnAtk) btnAtk.disabled = state.player.ap < 2;
    if (btnSpin) btnSpin.disabled = state.player.ap < 3;
    if (btnHeavy) btnHeavy.disabled = state.player.ap < 5;
}

export function drawGame(ctx: CanvasRenderingContext2D, state: GameState) {
    if (!ctx || !ctx.canvas) return;

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!state.gameStarted) return;

    // 동적 좌표 할당 (포트레이트 세로형 레이아웃 규칙 적용) (한글)
    // 몬스터는 화면 상단, 플레이어는 화면 하단
    const playerX = w * 0.5;
    const playerY = h * 0.8;
    const monsterX = w * 0.5;
    const monsterY = h * 0.25;

    // 1. 플레이어 렌더링 (하단)
    const p = state.player;
    ctx.save();

    // 대시 잔상 효과
    if (p.dashTimerFr > 0) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(playerX, playerY - 30, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1.0;
    // 패링 중이거나 잔여 판정 시간이 있으면 파란색, 기본은 녹색
    ctx.fillStyle = (p.isParrying || p.parryTimerFr > 0) ? "#4a9eff" : "#4ade80";
    ctx.beginPath();
    ctx.arc(playerX, playerY, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. 몬스터 렌더링 (상단)
    if (state.monsters && state.monsters.length > 0) {
        const m = state.monsters[0];
        ctx.save();

        let mColor = "#ffffff"; // 대기
        if (m.state === "CUE" || m.state === "TELEGRAPH") mColor = "#facc15"; // 경고 (노란색)
        if (m.state === "HIT" || m.state === "ATTACK") mColor = "#ff4a4a";    // 공격 (빨간색)

        ctx.fillStyle = mColor;
        ctx.beginPath();
        ctx.arc(monsterX, monsterY, 30, 0, Math.PI * 2); // 둥근 몬스터 외형 (proto 기준)
        ctx.fill();
        ctx.restore();
    }
}
