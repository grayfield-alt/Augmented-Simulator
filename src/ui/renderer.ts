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

    if (p.isParrying || p.parryTimerFr > 0) {
        // 패링 황금색 오라 (proto.html 복구)
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#FFD700";
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(playerX, playerY, 25 + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

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
    ctx.fillStyle = (p.isParrying || p.parryTimerFr > 0) ? "#4a9eff" : "#4ade80";
    ctx.beginPath();
    ctx.arc(playerX, playerY, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. 몬스터 렌더링 (상단)
    if (state.monsters && state.monsters.length > 0) {
        const m = state.monsters[0];

        // 몬스터 상태 애니메이션 계산 (proto.html 복구, 세로형 조정)
        let drawX = monsterX;
        let drawY = monsterY;
        let mColor = "#ffffff"; // 대기

        if (m.state === "CUE") {
            // 전조: 떨림 및 색상 변화
            const ratio = 1 - (m.attackTimerFr / Math.max(1, m.maxTimerFr));
            mColor = `rgb(255, ${Math.floor(255 - 255 * ratio)}, 0)`; // white to orange/red
            drawX += Math.sin(ratio * Math.PI * 10) * 10;
        } else if (m.state === "HIT") {
            // 타격: 플레이어 방향으로 돌진
            mColor = "#ff4a4a";
            drawY += (playerY - monsterY) * 0.6; // 플레이어 쪽으로 급격히 이동
        } else if (m.state === "RECOVER") {
            // 복귀: 원래 자리로
            mColor = "#aaaaaa";
            const ratio = m.attackTimerFr / Math.max(1, m.maxTimerFr);
            drawY += (playerY - Math.abs(drawY)) * 0.6 * ratio; // 잔존 위치에서 스르륵 복귀
        }

        ctx.save();
        ctx.fillStyle = mColor;
        ctx.beginPath();
        ctx.arc(drawX, drawY, 30, 0, Math.PI * 2);
        ctx.fill();

        // 몬스터 HP 텍스트 복구 (proto.html)
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px Inter";
        ctx.textAlign = "center";
        ctx.fillText(`HP ${Math.ceil(m.hp)}`, drawX, drawY + 30 + 20);
        ctx.restore();
    }
}
