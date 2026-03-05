// src/core/stageRunner.ts
import { GameState } from './state';
import { StagePlan } from '../data/stage_plans';

/**
 * StagePlan의 무결성을 검증합니다.
 * - 노드가 최소 1개 이상 존재해야 합니다.
 * - 마지막 노드는 반드시 BOSS여야 하거나, 전체 노드 중 BOSS가 최소 1개 있어야 합니다. (선택적)
 * 이 함수는 검증 실패 시 Error를 던집니다. (한글)
 */
export function validateStagePlan(plan: StagePlan | null | undefined): void {
    if (!plan) {
        throw new Error("[CRITICAL] StagePlan is null or undefined.");
    }
    if (!Array.isArray(plan.nodes) || plan.nodes.length === 0) {
        throw new Error(`[CRITICAL] StagePlan "${plan.id}" has no nodes.`);
    }

    const hasBoss = plan.nodes.some(n => n.type === 'BOSS');
    if (!hasBoss) {
        throw new Error(`[CRITICAL] StagePlan "${plan.id}" must contain at least one BOSS node.`);
    }

    plan.nodes.forEach((node, idx) => {
        if (!['COMBAT', 'REWARD_AUGMENT', 'REST_CHOICE', 'BOSS'].includes(node.type)) {
            throw new Error(`[CRITICAL] Unknown node type "${node.type}" at index ${idx} in StagePlan "${plan.id}".`);
        }
    });
}

/**
 * 게임을 새로운 스테이지로 진입시킵니다.
 */
export function enterStage(state: GameState, plan: StagePlan): GameState {
    validateStagePlan(plan);
    const next = { ...state };
    next.currentStageId = plan.id;
    next.stagePlan = plan;
    next.currentNodeIndex = 0;
    return next;
}

/**
 * 전투 종료 등, 현재 노드를 완료하고 다음 노드로 전이합니다.
 */
export function advanceStageNode(state: GameState): GameState {
    if (!state.stagePlan) {
        throw new Error("[CRITICAL] Cannot advance node: stagePlan is missing in current state.");
    }

    validateStagePlan(state.stagePlan as StagePlan);

    const next = { ...state };
    next.currentNodeIndex += 1;

    // 만약 현재 인덱스가 노드 길이를 초과했다면 에러 발생 또는 게임 클리어 처리 (한글)
    if (next.currentNodeIndex >= (state.stagePlan as StagePlan).nodes.length) {
        throw new Error(`[CRITICAL] Cannot advance beyond the last node of StagePlan "${next.currentStageId}".`);
    }

    return next;
}
