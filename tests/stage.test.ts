// tests/stage.test.ts (한글)
import { describe, it, expect } from 'vitest';
import { getInitialGameState } from '../src/core/state';
import { processTurn } from '../src/core/engine';
import { validateStagePlan } from '../src/core/stageRunner';

describe('Augmented Simulator V3 - Stage Loop System', () => {

    const validPlan = {
        id: "test_stage_1",
        name: "Test Stage",
        nodes: [
            { type: 'COMBAT', waveLevel: 1 },
            { type: 'REST_CHOICE' },
            { type: 'REWARD_AUGMENT' },
            { type: 'BOSS', waveLevel: 2 }
        ] as any
    };

    it('1. 잘 구성된 StagePlan은 무결성 검증을 통과한다 (한글)', () => {
        expect(() => validateStagePlan(validPlan)).not.toThrow();
    });

    it('2. 보스 노드가 없거나 노드가 비어있으면 에러를 던진다 (한글)', () => {
        const noBossPlan = { id: "p2", name: "No Boss", nodes: [{ type: 'COMBAT' }] as any };
        const emptyPlan = { id: "p3", name: "Empty", nodes: [] };
        const invalidTypePlan = { id: "p4", name: "Invalid", nodes: [{ type: 'UNKNOWN_MAGIC' }, { type: 'BOSS' }] as any };

        expect(() => validateStagePlan(noBossPlan)).toThrow(/must contain at least one BOSS/);
        expect(() => validateStagePlan(emptyPlan)).toThrow(/has no nodes/);
        expect(() => validateStagePlan(invalidTypePlan)).toThrow(/Unknown node type/);
    });

    it('3. 스테이지 진입 시 현재 인덱스가 0으로 초기화된다 (한글)', () => {
        let state = getInitialGameState();
        state = processTurn(state, { type: 'ENTER_STAGE', stagePlan: validPlan });

        expect(state.currentStageId).toBe("test_stage_1");
        expect(state.currentNodeIndex).toBe(0);
        expect(state.stagePlan.nodes[state.currentNodeIndex].type).toBe('COMBAT');
    });

    it('4. 전투 승리 등 성공 행동 이후 ADVANCE_NODE 됨으로써 다음 노드로 넘어간다 (한글)', () => {
        let state = getInitialGameState();
        state = processTurn(state, { type: 'ENTER_STAGE', stagePlan: validPlan });

        // 전투(0) 끝 -> 다음(1, REST_CHOICE)
        state = processTurn(state, { type: 'ADVANCE_NODE' });
        expect(state.currentNodeIndex).toBe(1);
        expect(state.stagePlan.nodes[state.currentNodeIndex].type).toBe('REST_CHOICE');
    });

    it('5. REST_CHOICE에서 heal 선택 시 체력이 회복되고 다음 노드로 전이한다 (한글)', () => {
        let state = getInitialGameState();
        state = processTurn(state, { type: 'ENTER_STAGE', stagePlan: validPlan });

        // 체력을 임의로 깎음
        state.player.hp = 50;
        state.player.maxHp = 100;

        // 현재 노드를 1로 옮김 (REST_CHOICE)
        state = processTurn(state, { type: 'ADVANCE_NODE' });

        // 회복 선택
        state = processTurn(state, { type: 'REST_CHOICE_MADE', choice: 'heal' });

        // 회복되었는지 50 + 35% = 85
        expect(state.player.hp).toBe(85);
        // 그 다음 노드 (2, REWARD_AUGMENT) 로 이동했는지 체크
        expect(state.currentNodeIndex).toBe(2);
        expect(state.stagePlan.nodes[state.currentNodeIndex].type).toBe('REWARD_AUGMENT');
    });

    it('6. 마지막 노드(BOSS) 완료 후 더 이상 넘어가려 하면 에러가 난다 (한글)', () => {
        let state = getInitialGameState();
        state = processTurn(state, { type: 'ENTER_STAGE', stagePlan: validPlan });
        state = processTurn(state, { type: 'ADVANCE_NODE' }); // index 1
        state = processTurn(state, { type: 'ADVANCE_NODE' }); // index 2
        state = processTurn(state, { type: 'ADVANCE_NODE' }); // index 3 (BOSS)

        expect(() => processTurn(state, { type: 'ADVANCE_NODE' })).toThrow(/Cannot advance beyond the last node/);
    });
});
