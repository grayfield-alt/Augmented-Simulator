// src/core/engine.ts (한글)
import { GameState, PlayerState } from './state';

export const GAME_CONFIG = {
    FPS: 60,
    PARRY_STANCE_DURATION: 21,
    PERFECT_WINDOW: 8,
    ATTACK_DURATION: 15,
    RETURN_DURATION: 20,
    REACTION_WINDOW: 26,
    K: 50 // 방어 상수
};

// 순수 함수: 데미지 계산 (한글)
export function calculateDamage(atk: number, def: number): number {
    return Math.max(1, Math.round(atk * (GAME_CONFIG.K / (GAME_CONFIG.K + def))));
}

// 순수 함수: 상태 업데이트 (Reducer 패턴) (한글)
export function processTurn(state: GameState, action: any): GameState {
    const nextState = JSON.parse(JSON.stringify(state)); // Deep Clone for purity

    switch (action.type) {
        case 'START_TURN':
            nextState.currentTurn = action.turn;
            if (action.turn === 'PLAYER') {
                nextState.player.ap = Math.min(nextState.player.maxAp, nextState.player.ap + 3);
                nextState.player.actionsUsed = { atk: false, spin: false, heavy: false };
            }
            break;

        case 'TAKE_DAMAGE':
            const dmg = calculateDamage(action.atk, nextState.player.def);
            nextState.player.hp = Math.max(0, nextState.player.hp - dmg);
            break;

        // ... 추가 리듀서 로직
    }

    return nextState;
}

// 시뮬레이션 로직 (DOM 접근 금지) (한글)
export class CombatSimulator {
    static validateAction(state: GameState, actionType: string): boolean {
        const p = state.player;
        if (state.currentTurn !== 'PLAYER') return false;

        if (actionType === 'atk') return p.ap >= 2 && !p.actionsUsed.atk;
        if (actionType === 'spin') return p.ap >= 3 && !p.actionsUsed.spin;
        if (actionType === 'heavy') return p.ap >= 5 && !p.actionsUsed.heavy;

        return true;
    }
}
