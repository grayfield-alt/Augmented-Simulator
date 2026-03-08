import { GameState } from '../core/state';
import { SELECTORS, mustGet } from './selectors';
import { renderStageFlow } from './stageFlowView';

export function renderUI(state: GameState) {
    // 1. 상태 데이터 업데이트 (HP/AP)
    const hpLabel = document.getElementById(SELECTORS.hpLabel);
    const apLabel = document.getElementById(SELECTORS.apLabel);
    const hpBar = mustGet(SELECTORS.hpBar);
    const apBar = mustGet(SELECTORS.apBar);

    if (hpLabel) hpLabel.innerText = `${Math.ceil(state.player.hp)} / ${state.player.maxHp}`;
    if (apLabel) apLabel.innerText = Math.floor(state.player.ap).toString();

    const hpPct = (state.player.hp / state.player.maxHp) * 100;
    hpBar.style.width = `${Math.max(0, hpPct)}%`;
    const hpBarMini = document.getElementById(SELECTORS.hpBarMini);
    if (hpBarMini) hpBarMini.style.width = `${Math.max(0, hpPct)}%`;

    const apPct = (state.player.ap / state.player.maxAp) * 100;
    apBar.style.width = `${Math.max(0, apPct)}%`;
    const apBarMini = document.getElementById(SELECTORS.apBarMini);
    if (apBarMini) apBarMini.style.width = `${Math.max(0, apPct)}%`;

    // 2. 턴 표시기 (TOP HUD 내 배치 - Grid 1번 컬럼)
    const turnIndicator = mustGet(SELECTORS.turn);
    if (state.currentTurn === 'PLAYER') {
        turnIndicator.innerText = "PLAYER PHASE";
        turnIndicator.className = "text-sm font-black text-[#fae133] italic tracking-tighter uppercase opacity-90";
    } else if (state.currentTurn === 'MONSTER') {
        turnIndicator.innerText = "ENEMY PHASE";
        turnIndicator.className = "text-sm font-black text-red-500 italic tracking-tighter uppercase opacity-90";
    }

    // 3. 상단 토스트 메시지 (안내 메시지만 처리 - Grid 2번 컬럼)
    const toastMessageEl = mustGet(SELECTORS.message);
    const toastContainer = document.getElementById(SELECTORS.toastContainer);
    if (state.targetingSkill) {
        toastMessageEl.innerText = "공격할 적을 선택하세요";
        toastContainer?.classList.remove('hidden');
    } else {
        toastMessageEl.innerText = "";
        toastContainer?.classList.add('hidden');
    }

    // 4. 버튼 상태 (AP 부족 시 비활성화)
    const skillButtons = [
        { id: SELECTORS.btnSkillAtk, cost: 2 },
        { id: SELECTORS.btnSkillSpin, cost: 3 },
        { id: SELECTORS.btnSkillHeavy, cost: 5 }
    ];

    skillButtons.forEach(btn => {
        const el = document.getElementById(btn.id) as HTMLButtonElement;
        if (el) {
            const insufficientAp = state.player.ap < btn.cost;
            el.disabled = insufficientAp;
            // CSS 클래스로 처리 (style.css 에 정의됨)
        }
    });

    // 5. 컨트롤 패널 토글 및 애니메이션 (3구역 시스템 준수)
    const playerControls = document.getElementById('player-controls');
    const monsterControls = document.getElementById('monster-controls');
    const controlContainer = document.getElementById('control-container');

    if (state.targetingSkill) {
        // 타겟팅 모드: 모든 컨트롤 숨김 (슬라이드 다운)
        if (controlContainer) {
            controlContainer.classList.remove('slide-up');
            controlContainer.classList.add('slide-down');
        }
    } else {
        if (state.currentTurn === 'PLAYER') {
            if (controlContainer) {
                controlContainer.classList.remove('slide-down');
                controlContainer.classList.add('slide-up');
            }
            if (playerControls) playerControls.style.display = 'flex';
            if (monsterControls) monsterControls.style.display = 'none';
        } else if (state.currentTurn === 'MONSTER') {
            if (controlContainer) {
                // 몬스터 턴에도 방어 컨트롤이 필요하므로 슬라이드 업 상태 유지 또는 grid 전환
                controlContainer.classList.remove('slide-down');
                controlContainer.classList.add('slide-up');
            }
            if (playerControls) playerControls.style.display = 'none';
            if (monsterControls) monsterControls.style.display = 'grid';
        } else {
            if (controlContainer) {
                controlContainer.classList.remove('slide-up');
                controlContainer.classList.add('slide-down');
            }
        }
    }

    // 6. 디버그 HUD 정보 업데이트
    const debugHub = document.getElementById(SELECTORS.debugHub);
    if (debugHub) {
        debugHub.innerHTML = `
            PHASE: ${state.currentTurn}<br/>
            PLAYER AP: ${state.player.ap.toFixed(1)}<br/>
            MONSTERS: ${state.monsters.filter(m => m.hp > 0).length} ALIVE
        `;
    }

    // 7. 화면 전환 및 오버레이
    const lobby = mustGet(SELECTORS.lobby);
    const battle = mustGet(SELECTORS.battleScreen);

    // 스타일 직접 제어로 Tailwind flex/hidden 충돌 방지
    if (state.gameStarted) {
        lobby.style.display = 'none';
        battle.style.display = 'flex';
    } else {
        lobby.style.display = 'flex';
        battle.style.display = 'none';
    }

    const gameOverOverlay = document.getElementById(SELECTORS.overlayGameOver);
    if (gameOverOverlay) {
        gameOverOverlay.classList.toggle('hidden', !state.showGameOverOverlay);
        if (state.showGameOverOverlay) {
            gameOverOverlay.innerHTML = `
                <div class="animate-in fade-in zoom-in duration-500 flex flex-col items-center">
                    <h2 class="text-6xl font-black italic text-red-600 mb-4 tracking-tighter">TERMINATED</h2>
                    <button onclick="location.reload()" class="bg-red-600 text-white px-10 py-3 rounded-full font-bold italic active:scale-95 transition-transform shadow-lg shadow-red-900/40">REBOOT</button>
                </div>
            `;
        }
    }

    renderStageFlow(state);
}

export function drawGame(ctx: CanvasRenderingContext2D, state: GameState) {
    if (!ctx || !ctx.canvas) return;

    const w = ctx.canvas.clientWidth;
    const h = ctx.canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    if (!state.gameStarted) return;

    // 3-ZONE 계약에 따라 캔버스는 중앙 60% 공간임. 
    // 내부 좌표는 상대적으로 배치 (h 가 이미 60% 높이)
    const playerX = w * 0.5;
    const playerY = h * 0.82;
    const monsterX = w * 0.5;
    const monsterY = h * 0.25;

    // 1. 플레이어 렌더링
    const p = state.player;

    if (p.isParrying || p.parryTimerFr > 0) {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#FFD700";
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(playerX, playerY, 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    if (p.dashTimerFr > 0) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "#88ccff";
        ctx.lineWidth = 2;
        const t = 1 - (p.dashTimerFr / 50);
        const radius = 35 + 10 * Math.sin(t * Math.PI);
        ctx.beginPath();
        ctx.arc(playerX, playerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = (p.isParrying || p.parryTimerFr > 0) ? "#3b82f6" : "#10b981";
    ctx.beginPath();
    ctx.arc(playerX, playerY, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. 몬스터 렌더링
    if (state.monsters && state.monsters.length > 0) {
        const totalMonsters = state.monsters.length;
        const spacing = 110;
        const startX = monsterX - ((totalMonsters - 1) * spacing) / 2;

        state.monsters.forEach((m: any, idx: number) => {
            const monsterStartX = startX + idx * spacing;
            const monsterStartY = monsterY;

            let drawX = monsterStartX;
            let drawY = monsterStartY;
            let mColor = "#ef4444";

            if (m.state === "CUE") {
                const t = 1 - (m.attackTimerFr / Math.max(1, m.maxTimerFr));
                drawY -= Math.sin(t * Math.PI) * 20;
                mColor = `rgb(255, ${Math.floor(68 + 180 * t)}, ${Math.floor(68 + 180 * t)})`;
            } else if (m.state === "HIT") {
                const t = 1 - (m.attackTimerFr / Math.max(1, m.maxTimerFr));
                drawX = monsterStartX + (playerX - monsterStartX) * (t * t);
                drawY = monsterStartY + (playerY - monsterStartY) * (t * t);
            } else if (m.state === "RECOVER") {
                const t = 1 - (m.attackTimerFr / Math.max(1, m.maxTimerFr));
                drawX = playerX + (monsterStartX - playerX) * t;
                drawY = playerY + (monsterStartY - playerY) * t;
            }

            ctx.save();
            if (state.targetingSkill && m.hp > 0) {
                ctx.shadowBlur = 20;
                ctx.shadowColor = "#fae133";
                ctx.strokeStyle = "#fae133";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(drawX, drawY, 48, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.fillStyle = mColor;
            ctx.beginPath();
            ctx.arc(drawX, drawY, 40, 0, Math.PI * 2);
            ctx.fill();

            // Minimalist Monster HP
            if (m.hp > 0) {
                ctx.fillStyle = "white";
                ctx.font = "bold 12px Outfit";
                ctx.textAlign = "center";
                ctx.fillText(`${Math.ceil(m.hp)}`, drawX, drawY + 5);
            }
            ctx.restore();
        });
    }

    // 3. 전투 피드백 (캔버스 중앙 상단)
    if (state.combatFeedback && state.combatFeedback.timerFr > 0) {
        ctx.save();
        ctx.fillStyle = state.combatFeedback.color;
        ctx.font = "900 32px Outfit";
        ctx.textAlign = "center";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 5;

        const alpha = Math.min(1.0, state.combatFeedback.timerFr / 10);
        ctx.globalAlpha = alpha;
        const yPos = h * 0.45 - (45 - state.combatFeedback.timerFr);
        ctx.fillText(state.combatFeedback.text, w * 0.5, yPos);
        ctx.restore();
    }
}
