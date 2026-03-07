// tests/core.test.ts (한글)
import { describe, it, expect } from 'vitest';
import { getInitialGameState } from '../src/core/state';
import { processTurn, calculateDamage } from '../src/core/engine';
import { validateState } from '../src/core/validator';

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

    describe('패링 Vertical Slice 판정 검증 (TDD)', () => {
        // 임시 프레임 변환 헬퍼 (다음 커밋에서 엔진 완전 Fr 개조 후 제거됨)
        const tickFr = (state: any, frames: number) => processTurn(state, { type: 'TICK', dtMs: frames * (1000 / 60) });

        it('11. Perfect Parry -> AP+2, 데미지 0 적용 (hit 시점 parry 경과 프레임 <= 8Fr)', () => {
            let state = getInitialGameState();
            // 몬스터 공격 CUE 설정 (26프레임 뒤 타격)
            state.monsters = [{ id: 'm1', name: 'M1', hp: 100, maxHp: 100, atk: 10, def: 0, state: 'CUE', attackTimerMs: 26 * (1000 / 60), maxTimerMs: 26 * (1000 / 60) }];
            state.player.ap = 0;

            // 20프레임 진행 (남은 시간 6프레임) -> 패링 입력!
            state = tickFr(state, 20);
            state = processTurn(state, { type: 'PARRY_START' });

            // 6프레임 진행 -> HIT 시점 (6Fr 경과 = Perfect Window 이내)
            state = tickFr(state, 6);

            expect(state.player.hp).toBe(100); // 데미지 무효화
            expect(state.player.ap).toBe(2);   // 퍼펙트 패링 보상
        });

        it('12. Good Parry -> AP+1, 데미지 0 적용 (8Fr < hit 시점 parry 경과 프레임 <= 21Fr)', () => {
            let state = getInitialGameState();
            state.monsters = [{ id: 'm1', name: 'M1', hp: 100, maxHp: 100, atk: 10, def: 0, state: 'CUE', attackTimerMs: 26 * (1000 / 60), maxTimerMs: 26 * (1000 / 60) }];
            state.player.ap = 0;

            // 6프레임 진행 (남은 시간 20프레임) -> 패링 입력!
            state = tickFr(state, 6);
            state = processTurn(state, { type: 'PARRY_START' });

            // 20프레임 진행 -> HIT 시점 (20Fr 경과 = Good Window 이내)
            state = tickFr(state, 20);

            expect(state.player.hp).toBe(100); // 데미지 무효화
            expect(state.player.ap).toBe(1);   // 일반 패링 보상
        });

        it('13. Unparry Hit -> 데미지 적용, AP 증가 없음 (패링 안함 또는 21Fr 수명 초과)', () => {
            let state = getInitialGameState();
            state.monsters = [{ id: 'm1', name: 'M1', hp: 100, maxHp: 100, atk: 10, def: 0, state: 'CUE', attackTimerMs: 26 * (1000 / 60), maxTimerMs: 26 * (1000 / 60) }];
            state.player.ap = 0;

            // 패링 없이 26프레임 진행 -> HIT 시점
            state = tickFr(state, 26);

            expect(state.player.hp).toBe(90);  // 100 - 10 데미지
            expect(state.player.ap).toBe(0);   // 보상 없음
        });
    });
});
