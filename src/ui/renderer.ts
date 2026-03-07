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
        const totalMonsters = state.monsters.length;
        const spacing = 90; // 다중 몬스터 간격
        const startX = monsterX - ((totalMonsters - 1) * spacing) / 2;

        state.monsters.forEach((m: any, idx: number) => {
            // 몬스터 상태 애니메이션 계산 (세로형 기반)
            let drawX = startX + idx * spacing;
            let drawY = monsterY;
            let mColor = "#ffffff"; // 대기

            if (m.state === "CUE") {
                // 전조: 공격 전 후방(위쪽)으로 살짝 밀림
                const t = 1 - (m.attackTimerFr / Math.max(1, m.maxTimerFr));
                mColor = `rgb(255, ${Math.floor(255 - 181 * t)}, ${Math.floor(255 - 181 * t)})`;
                drawY -= Math.sin(t * Math.PI) * 20; // 위쪽 방향으로 진동/후퇴
            } else if (m.state === "HIT") {
                // 공격 돌진: t * t (아래 플레이어 방향)
                const t = 1 - (m.attackTimerFr / Math.max(1, m.maxTimerFr));
                mColor = "#ff4a4a";
                drawY += (playerY - monsterY) * (t * t);
            } else if (m.state === "RECOVER") {
                // 복귀: 1 - (1-t)^2
                const t = 1 - (m.attackTimerFr / Math.max(1, m.maxTimerFr));
                mColor = "#ff4a4a"; // proto에서는 맞을 때만 빨간색 돌아갈땐 그대로 유지 (기본 레드)
                const targetY = monsterY;
                const startY = playerY;
                drawY = startY + (targetY - startY) * (1 - Math.pow(1 - t, 2));
            } else {
                mColor = "#ff4a4a"; // 기본 레드로 복구
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
            ctx.fillText(`HP ${Math.ceil(m.hp)}`, drawX, Math.max(drawY + 50, monsterY + 50));
            // 하단 UI와 겹치는 걸 방지하기 위해 최소 위치 보정
            ctx.restore();
        });
    }

    // 3. 전투 피드백 메시지 (퍼펙트, 굿, 회피) 출력 (한글)
    if (state.combatFeedback) {
        ctx.save();
        ctx.fillStyle = state.combatFeedback.color;
        ctx.font = "900 36px Inter";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 10;

        // 프레임에 따른 페이드 아웃 연출
        const alpha = Math.min(1.0, state.combatFeedback.timerFr / 15);
        ctx.globalAlpha = alpha;

        // 살짝 위로 올라가는 효과
        const yOffset = (45 - state.combatFeedback.timerFr) * 0.5;
        ctx.fillText(state.combatFeedback.text, w * 0.5, h * 0.45 - yOffset);

        ctx.restore();
    }
}
