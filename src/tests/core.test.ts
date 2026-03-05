// src/tests/core.test.ts (한글)
import { describe, it, expect } from 'vitest';
import { getInitialGameState } from '../core/state';
import { processTurn, calculateDamage } from '../core/engine';
import { validateState } from '../core/validator';

describe('Augmented Simulator V3 Core Logic', () => {

    it('1. 초기 상태가 무결성 검사(validateState)를 통과해야 함 (한글)', () => {
        const state = getInitialGameState();
        expect(() => validateState(state)).not.toThrow();
    });

    it('2. 데미지 계산 결과는 반드시 유한한 양의 정수여야 함 (한글)', () => {
        const dmg = calculateDamage(100, 10);
        expect(Number.isFinite(dmg)).toBe(true);
        expect(dmg).toBeGreaterThanOrEqual(1);
    });

    it('3. 플레이어 턴 시작 시 AP가 정상적으로 회복되어야 함 (한글)', () => {
        const state = getInitialGameState();
        state.player.ap = 0;
        const next = processTurn(state, { type: 'START_TURN', turn: 'PLAYER' });
        expect(next.player.ap).toBeGreaterThan(0);
        expect(next.player.ap).toBeLessThanOrEqual(next.player.maxAp);
    });

    it('4. AP 회복 시 maxAp를 초과할 수 없음 (한글)', () => {
        const state = getInitialGameState();
        state.player.ap = 9;
        const next = processTurn(state, { type: 'START_TURN', turn: 'PLAYER' });
        expect(next.player.ap).toBe(10); // maxAp=10 (한글)
    });

    it('5. 스킬 사용 시 AP가 정확히 차감되어야 함 (한글)', () => {
        const state = getInitialGameState();
        state.player.ap = 10;
        const next = processTurn(state, { type: 'EXECUTE_SKILL', skill: 'atk' });
        expect(next.player.ap).toBe(8); // cost=2 (한글)
    });

    it('6. AP 부족 시 스킬을 사용하여도 상태가 변하지 않아야 함 (한글)', () => {
        const state = getInitialGameState();
        state.player.ap = 1;
        const next = processTurn(state, { type: 'EXECUTE_SKILL', skill: 'atk' });
        expect(next.player.ap).toBe(1);
    });

    it('7. 패링(Parry) 성공 시 필드 설정에 따른 AP 보상이 지급되어야 함 (한글)', () => {
        const state = getInitialGameState();
        state.player.ap = 5;
        const next = processTurn(state, { type: 'PARRY_SUCCESS', isPerfect: true });
        expect(next.player.ap).toBe(7); // 보상=2 (한글)
    });

    it('8. 데미지를 입었을 때 HP가 정상적으로 감소하고 0 이하로 내려가지 않아야 함 (한글)', () => {
        const state = getInitialGameState();
        state.player.hp = 10;
        const next = processTurn(state, { type: 'TAKE_DAMAGE', atk: 1000 });
        expect(next.player.hp).toBe(0);
    });

    it('9. 상태 검증기(Validator)가 NaN 발생 시 즉시 에러를 던져야 함 (한글)', () => {
        const state = getInitialGameState();
        (state.player.ap as any) = NaN;
        expect(() => validateState(state)).toThrow('[INVALID_STATE]');
    });

    it('10. 턴 전환 시 actionsUsed가 초기화되어야 함 (한글)', () => {
        const state = getInitialGameState();
        state.player.actionsUsed.atk = true;
        const next = processTurn(state, { type: 'START_TURN', turn: 'PLAYER' });
        expect(next.player.actionsUsed.atk).toBe(false);
    });
});
