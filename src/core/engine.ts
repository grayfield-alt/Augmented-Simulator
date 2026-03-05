// src/core/engine.ts (한글)
import { GameState, PlayerState } from './state';
import { validateState } from './validator';

export const GAME_CONFIG = {
    FPS: 60,
    PARRY_STANCE_DURATION: 21,
    PERFECT_WINDOW: 8,
    ATTACK_DURATION: 15,
    RETURN_DURATION: 20,
    REACTION_WINDOW: 26,
    K: 50
};

export function calculateDamage(atk: number, def: number): number {
    const dmg = Math.max(1, Math.round(atk * (GAME_CONFIG.K / (GAME_CONFIG.K + def))));
    if (!Number.isFinite(dmg)) throw new Error(`[CRITICAL] Damage calculation resulted in non-finite value: ${dmg}`);
    return dmg;
}

import { enterStage, advanceStageNode } from './stageRunner';

export function processTurn(state: GameState, action: any): GameState {
    // 1. 입력 상태 검증 (한글)
    validateState(state);

    let next = JSON.parse(JSON.stringify(state)) as GameState;
    const p = next.player;

    switch (action.type) {
        case 'START_TURN':
            next.currentTurn = action.turn;
            if (action.turn === 'PLAYER') {
                // AP 누적 로직 (한글)
                const gain = 3 + (p.augBuffs.startAp || 0);
                p.ap = Math.min(p.maxAp, p.ap + gain);
                p.actionsUsed = { atk: false, spin: false, heavy: false };
                p.state.killsThisTurn = 0;
            }
            break;

        case 'EXECUTE_SKILL':
            const cost = action.skill === 'atk' ? 2 : (action.skill === 'spin' ? 3 : 5);
            if (p.ap >= cost) {
                p.ap -= cost;
                // 데미지 및 효과 처리는 시뮬레이터에서 별도 수행 후 상태 반영 (한글)
            }
            break;

        case 'PARRY_SUCCESS':
            const parryGain = action.isPerfect ? 2 : 1;
            p.ap = Math.min(p.maxAp, p.ap + parryGain + (p.augBuffs.parryAp || 0));
            break;

        case 'TAKE_DAMAGE':
            const rawDmg = action.atk * (p.augBuffs.takeDmgMult || 1.0);
            const finalDmg = calculateDamage(rawDmg, p.def);
            p.hp = Math.max(0, p.hp - finalDmg);
            break;

        case 'ENTER_STAGE':
            next = enterStage(next, action.stagePlan);
            break;

        case 'ADVANCE_NODE':
            next = advanceStageNode(next);
            break;

        case 'REST_CHOICE_MADE':
            if (action.choice === 'heal') {
                p.hp = Math.min(p.maxHp, Math.round(p.hp + p.maxHp * 0.35));
            }
            // (증강 선택 시 다른 액션이나, 단순히 노드만 넘길수도 있음)
            next = advanceStageNode(next);
            break;
    }

    // 2. 결과 상태 검증 (한글)
    validateState(next);

    return next;
}

