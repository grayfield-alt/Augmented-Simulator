// src/core/validator.ts (한글)
import { GameState } from './state';

/**
 * 게임 상태의 무결성을 검증합니다.
 * 필수 필드 누락, NaN 값, 비정상적인 범위 등을 체크하여 에러를 던집니다. (한글)
 */
export function validateState(state: GameState): void {
    const p = state.player;

    // 1. 필수 숫자 필드 존재 및 유효성(Finite Number) 검사 (한글)
    const requiredNumbers: (keyof typeof p)[] = ['hp', 'maxHp', 'atk', 'def', 'ap', 'maxAp'];

    for (const field of requiredNumbers) {
        const val = p[field];
        if (typeof val !== 'number' || !Number.isFinite(val)) {
            throw new Error(`[INVALID_STATE] Player field "${field}" is not a finite number: ${val}`);
        }
    }

    // 2. 논리적 범위 검증 (한글)
    if (p.maxHp <= 0) throw new Error(`[INVALID_STATE] maxHp must be greater than 0: ${p.maxHp}`);
    if (p.maxAp <= 0) throw new Error(`[INVALID_STATE] maxAp must be greater than 0: ${p.maxAp}`);

    // 3. 필드 존재 여부 명시적 검사 (스키마 누락 방지) (한글)
    if (p.actionsUsed === undefined) throw new Error(`[INVALID_STATE] actionsUsed is missing`);
    if (p.augBuffs === undefined) throw new Error(`[INVALID_STATE] augBuffs is missing`);

    // 4. 턴 상태 검증 (한글)
    if (!['PLAYER', 'MONSTER', 'NONE'].includes(state.currentTurn)) {
        throw new Error(`[INVALID_STATE] Invalid currentTurn: ${state.currentTurn}`);
    }
}
