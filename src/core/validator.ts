// src/core/validator.ts (한글)
import { GameState } from './state';

import { validateStagePlan } from './stageRunner';

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

    // 5. 스테이지 플랜 무결성 검증 (로드된 경우에 한함) (한글)
    if (state.stagePlan !== null) {
        validateStagePlan(state.stagePlan as any);
        if (typeof state.currentNodeIndex !== 'number' || state.currentNodeIndex < 0) {
            throw new Error(`[INVALID_STATE] currentNodeIndex is invalid: ${state.currentNodeIndex}`);
        }
    }
}

/**
 * 게임 데이터(monsters, patterns, stage_plans, augments) 참조 스키마 무결성 검증
 * - 누락된 ID나 스폰 불가능한 참조를 초기 로드 시 체크하여 종료함
 */
import { MONSTERS } from '../data/monsters';
import { PATTERNS } from '../data/patterns';
import { STAGE_PLANS } from '../data/stage_plans';

export function validateDataSchema(): void {
    console.log("[VALIDATOR] Verifying data schema references...");

    // 1. Monster -> Pattern references
    for (const [mId, mDef] of Object.entries(MONSTERS)) {
        if (!mDef.patterns || mDef.patterns.length === 0) {
            throw new Error(`[INVALID_SCHEMA] Monster ${mId} has no patterns defined`);
        }
        for (const pId of mDef.patterns) {
            if (!PATTERNS[pId]) {
                throw new Error(`[INVALID_SCHEMA] Monster ${mId} references missing pattern ID: ${pId}`);
            }
        }
    }

    // 2. StagePlan -> Monster references
    for (const [sId, plan] of Object.entries(STAGE_PLANS)) {
        for (let i = 0; i < plan.nodes.length; i++) {
            const node = plan.nodes[i];
            if (node.type === 'COMBAT') {
                if (!node.encounterIds || node.encounterIds.length === 0) {
                    throw new Error(`[INVALID_SCHEMA] Stage ${sId} Node[${i}] (COMBAT) has no encounterIds`);
                }
                for (const mId of node.encounterIds) {
                    if (!MONSTERS[mId]) {
                        throw new Error(`[INVALID_SCHEMA] Stage ${sId} Node[${i}] references missing monster ID: ${mId}`);
                    }
                }
            }
        }
    }

    console.log("[VALIDATOR] Data schema validation passed. All ID references are intact.");
}
