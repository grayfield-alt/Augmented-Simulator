// tests/core.test.ts (한글)
import { describe, it, expect } from 'vitest';
import { initialState } from '../src/core/state';
import { reduce, calculateDamage, tickFr, CONFIG_FR } from '../src/core/engine';
import { validateState } from '../src/core/validator';

describe('Augmented Simulator V3 Core Logic', () => {

    it('1. 초기 상태가 무결성 검사(validateState)를 통과해야 함 (한글)', () => {
        const state = initialState();
        expect(() => validateState(state)).not.toThrow();
    });

    it('2. 데미지 계산 결과는 반드시 유한한 양의 정수여야 함 (한글)', () => {
        const dmg = calculateDamage(100, 10);
        expect(Number.isFinite(dmg)).toBe(true);
        expect(dmg).toBeGreaterThanOrEqual(1);
    });

    it('3. 플레이어 턴 시작 시 AP가 정상적으로 회복되어야 함 (한글)', () => {
        const state = initialState();
        state.player.ap = 0;
        const next = reduce(state, { type: 'START_TURN', turn: 'PLAYER' });
        expect(next.player.ap).toBeGreaterThan(0);
        expect(next.player.ap).toBeLessThanOrEqual(next.player.maxAp);
    });

    it('4. AP 회복 시 maxAp를 초과할 수 없음 (한글)', () => {
        const state = initialState();
        state.player.ap = 9;
        const next = reduce(state, { type: 'START_TURN', turn: 'PLAYER' });
        expect(next.player.ap).toBe(10); // maxAp=10 (한글)
    });

    it('5. 스킬 사용 시 AP가 정확히 차감되어야 함 (한글)', () => {
        const state = initialState();
        state.player.ap = 10;
        const next = reduce(state, { type: 'EXECUTE_SKILL', skill: 'atk' });
        expect(next.player.ap).toBe(8); // cost=2 (한글)
    });

    it('6. AP 부족 시 스킬을 사용하여도 상태가 변하지 않아야 함 (한글)', () => {
        const state = initialState();
        state.player.ap = 1;
        const next = reduce(state, { type: 'EXECUTE_SKILL', skill: 'atk' });
        expect(next.player.ap).toBe(1);
    });

    it('7. 데미지를 입었을 때 HP가 정상적으로 감소하고 0 이하로 내려가지 않아야 함 (한글)', () => {
        const state = initialState();
        state.player.hp = 10;
        const next = reduce(state, { type: 'TAKE_DAMAGE', atk: 1000 });
        expect(next.player.hp).toBe(0);
    });

    it('8. 상태 검증기(Validator)가 NaN 발생 시 즉시 에러를 던져야 함 (한글)', () => {
        const state = initialState();
        (state.player.ap as any) = NaN;
        expect(() => validateState(state)).toThrow('[INVALID_STATE]');
    });

    it('9. 턴 전환 시 actionsUsed가 초기화되어야 함 (한글)', () => {
        const state = initialState();
        state.player.actionsUsed.atk = true;
        const next = reduce(state, { type: 'START_TURN', turn: 'PLAYER' });
        expect(next.player.actionsUsed.atk).toBe(false);
    });

    describe('패링 Vertical Slice 판정 검증 (Fr 단위)', () => {
        // CUE 상태의 몬스터가 공격하기 직전 타이밍 모의
        it(`10. Perfect Parry -> AP+2, 데미지 0 적용 (hit 시점 parry 경과 프레임 <= ${CONFIG_FR.PERFECT_FR}Fr)`, () => {
            let state = initialState();
            state.currentTurn = 'MONSTER';
            state.monsters = [{ id: 'm1', name: 'M1', hp: 100, maxHp: 100, atk: 10, def: 0, state: 'CUE', attackTimerFr: 26, maxTimerFr: 26 }];
            state.player.ap = 0;

            // 20프레임 진행 (CUE 남은 시간: 6프레임)
            state = tickFr(state, 20);

            // 패링 켜기 (21Fr 수명 시작)
            state = reduce(state, { type: 'PARRY_START' });

            // 6프레임 진행 -> CUE 타이머가 0이 되면서 HIT 발생. 
            // 방어 시작 후 6프레임 째(<= 8)이므로 Perfect!
            state = tickFr(state, 6);

            expect(state.player.hp).toBe(100); // 100 그대로 무피해
            expect(state.player.ap).toBe(2);   // 퍼펙트 보상 +2
        });

        it(`11. Good Parry -> AP+1, 데미지 0 적용 (${CONFIG_FR.PERFECT_FR}Fr < hit 시점 parry 경과 <= ${CONFIG_FR.PARRY_MAX_FR}Fr)`, () => {
            let state = initialState();
            state.currentTurn = 'MONSTER';
            state.monsters = [{ id: 'm1', name: 'M1', hp: 100, maxHp: 100, atk: 10, def: 0, state: 'CUE', attackTimerFr: 26, maxTimerFr: 26 }];
            state.player.ap = 0;

            // 6프레임 진행 (CUE 남은 시간: 20프레임)
            state = tickFr(state, 6);

            // 일찍 패링 시작
            state = reduce(state, { type: 'PARRY_START' });

            // 20프레임 진행 -> CUE 타이머 0 도달, HIT.
            // 방어 시작 후 20프레임 째(> 8, <= 21)이므로 Good!
            state = tickFr(state, 20);

            expect(state.player.hp).toBe(100);
            expect(state.player.ap).toBe(1); // 일반 패링 보상 +1
        });

        it('12. Unparry Hit -> 데미지 적용, AP 증가 없음', () => {
            let state = initialState();
            state.currentTurn = 'MONSTER';
            state.monsters = [{ id: 'm1', name: 'M1', hp: 100, maxHp: 100, atk: 10, def: 0, state: 'CUE', attackTimerFr: 26, maxTimerFr: 26 }];
            state.player.ap = 0;

            // 패링 전혀 안 하고 26프레임 흘러서 바로 쳐맞음 (HIT 프레임 진입)
            state = tickFr(state, 26);

            expect(state.player.hp).toBe(90);  // 100 - base 10 = 90
            expect(state.player.ap).toBe(0);   // 보상 기각
            expect(state.monsters[0].state).toBe('HIT'); // HIT 상태 1프레임 대기

            // 1프레임 추가 진행 시 RECOVER 진입
            state = tickFr(state, 1);
            expect(state.monsters[0].state).toBe('RECOVER');
        });
    });
});
