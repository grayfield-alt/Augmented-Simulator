// src/core/engine.ts (한글)
import { GameState, PlayerState } from './state';
import { validateState } from './validator';
import { enterStage, advanceStageNode } from './stageRunner';

export const CONFIG_FR = {
    FPS: 60,
    PARRY_MAX_FR: 21,
    PERFECT_FR: 8,
    REACTION_FR: 26, // 기본 CUE 지속 프레임 (한글)
    RECOVER_FR: 20,  // 공격 후 대기(복귀) 프레임 (한글)
    K: 50
};

export function calculateDamage(atk: number, def: number): number {
    const dmg = Math.max(1, Math.round(atk * (CONFIG_FR.K / (CONFIG_FR.K + def))));
    if (!Number.isFinite(dmg)) throw new Error(`[CRITICAL] Damage calculation resulted in non-finite value: ${dmg}`);
    return dmg;
}

export function tickFr(state: GameState, steps: number): GameState {
    let current = state;
    for (let i = 0; i < steps; i++) {
        current = reduce(current, { type: 'TICK_FR_STEP' });
    }
    return current;
}

export function reduce(state: GameState, action: any): GameState {
    // 1. 입력 상태 검증 (한글)
    validateState(state);

    let next = JSON.parse(JSON.stringify(state)) as GameState;
    const p = next.player;

    switch (action.type) {
        case 'START_GAME':
            next.gameStarted = true;
            next.currentTurn = 'MONSTER'; // 첫 턴은 몬스터부터 시작
            next.currentRound = 1;
            console.log("[ENGINE] START_GAME: 몬스터 1기 CUE 진입 (Vertical Slice)");
            next.monsters = [{
                id: 'm1',
                name: 'M1',
                hp: 100,
                maxHp: 100,
                atk: 10,
                def: 0,
                state: 'CUE',
                attackTimerFr: CONFIG_FR.REACTION_FR,
                maxTimerFr: CONFIG_FR.REACTION_FR,
                currentAttack: {
                    isUnparryable: false,
                    isUndodgeable: false
                }
            }];
            break;

        case 'START_TURN':
            next.currentTurn = action.turn;
            if (action.turn === 'PLAYER') {
                const gain = 3 + (p.augBuffs.startAp || 0);
                p.ap = Math.min(p.maxAp, p.ap + gain);
                p.actionsUsed = { atk: false, spin: false, heavy: false };
                p.state.killsThisTurn = 0;
            }
            break;

        case 'EXECUTE_SKILL':
            // type: 'EXECUTE_SKILL', skill: 'atk' | 'spin' | 'heavy'
            if (p.hp <= 0) break;

            const skillType = action.skill;
            let cost = 0;
            let damageMult = 0;
            let isMulti = false;

            if (skillType === 'atk') { cost = 2; damageMult = 1.0; }
            else if (skillType === 'spin') { cost = 3; damageMult = 1.2; isMulti = true; }
            else if (skillType === 'heavy') { cost = 5; damageMult = 2.0; }

            if (p.ap < cost) {
                console.warn(`[ENGINE] Not enough AP for ${skillType}. Need ${cost}, have ${p.ap}`);
                break;
            }

            p.ap -= cost;
            p.actionsUsed[skillType as keyof typeof p.actionsUsed] = true;

            const aliveMonsters = next.monsters.filter((m: any) => m.hp > 0);
            if (aliveMonsters.length > 0) {
                if (isMulti) {
                    const baseDamage = p.atk * damageMult;
                    const damagePerTarget = baseDamage / aliveMonsters.length;
                    aliveMonsters.forEach((m: any) => {
                        const finalDmg = calculateDamage(damagePerTarget * (p.augBuffs.takeDmgMult || 1.0), m.def);
                        m.hp = Math.max(0, m.hp - finalDmg);
                        console.log(`[ENGINE] Player used ${skillType}! Monster ${m.name} HP reduced to ${m.hp}`);
                    });
                } else {
                    const target = aliveMonsters[0];
                    const baseDamage = p.atk * damageMult;
                    const finalDmg = calculateDamage(baseDamage * (p.augBuffs.takeDmgMult || 1.0), target.def);
                    target.hp = Math.max(0, target.hp - finalDmg);
                    console.log(`[ENGINE] Player used ${skillType}! Monster ${target.name} HP reduced to ${target.hp}`);
                }
            }
            break;

        case 'PARRY_START':
            if (p.parryTimerFr === 0 && p.dashTimerFr === 0) {
                p.isParrying = true;
                p.parryTimerFr = CONFIG_FR.PARRY_MAX_FR;
            }
            break;

        case 'TICK_FR_STEP':
            // 1프레임 틱 진행 (한글)

            // 1) 몬스터 공격 사이클 처리 (CUE -> HIT -> RECOVER -> CUE)
            if (next.monsters && next.monsters.length > 0 && next.currentTurn === 'MONSTER') {
                const m = next.monsters[0];

                if (m.state === 'CUE') {
                    if (m.attackTimerFr > 0) m.attackTimerFr -= 1;

                    if (m.attackTimerFr <= 0) {
                        m.state = 'HIT';
                        console.log("[ENGINE] Monster HIT triggered");

                        // 타격 순간 패링 판정 (Resolve)
                        const isUnparryable = m.currentAttack ? m.currentAttack.isUnparryable : false;

                        if (p.isParrying && !isUnparryable) {
                            // 프레임 기반 소요 시간 계산
                            const elapsedFr = CONFIG_FR.PARRY_MAX_FR - (p.parryTimerFr - 1); // 이번 틱 차감치 1을 미리 반영

                            if (elapsedFr <= CONFIG_FR.PERFECT_FR) {
                                p.ap = Math.min(p.maxAp, p.ap + 2 + (p.augBuffs.parryAp || 0));
                                p.state.perfParryThisTurn = true;
                                console.log(`[ENGINE] PERFECT PARRY! (소요: ${elapsedFr}Fr) AP+2 -> ${p.ap}`);
                            } else {
                                p.ap = Math.min(p.maxAp, p.ap + 1 + (p.augBuffs.parryAp || 0));
                                console.log(`[ENGINE] GOOD PARRY! (소요: ${elapsedFr}Fr) AP+1 -> ${p.ap}`);
                            }
                        } else {
                            const rawDmg = m.atk * (p.augBuffs.takeDmgMult || 1.0);
                            const finalDmg = calculateDamage(rawDmg, p.def);
                            p.hp = Math.max(0, p.hp - finalDmg);

                            if (p.isParrying && isUnparryable) {
                                console.log(`[ENGINE] UNPARRYABLE TARGET HIT! Player HP 감소: ${finalDmg} -> ${p.hp}`);
                            } else {
                                console.log(`[ENGINE] NORMAL HIT (Failed to parry)! Player HP 감소: ${finalDmg} -> ${p.hp}`);
                            }
                        }
                    }
                } else if (m.state === 'HIT') {
                    // HIT 프레임을 1프레임 동안만 화면에 유지한 뒤 RECOVER로 전이
                    m.state = 'RECOVER';
                    m.attackTimerFr = CONFIG_FR.RECOVER_FR;

                    // 몬스터 공격 종료 -> 플레이어 턴 시작
                    next.currentTurn = 'PLAYER';
                    const gain = 3 + (p.augBuffs.startAp || 0);
                    p.ap = Math.min(p.maxAp, p.ap + gain);
                    p.actionsUsed = { atk: false, spin: false, heavy: false };
                    p.state.killsThisTurn = 0;
                    console.log("[ENGINE] Turn switched to PLAYER");
                } else if (m.state === 'RECOVER') {
                    if (m.attackTimerFr > 0) m.attackTimerFr -= 1;

                    if (m.attackTimerFr <= 0) {
                        // RECOVER 완료 -> 다음 CUE 진입 (루프)
                        m.state = 'CUE';
                        m.attackTimerFr = CONFIG_FR.REACTION_FR;
                        m.maxTimerFr = CONFIG_FR.REACTION_FR;
                        console.log("[ENGINE] Monster RECOVER done, starting next CUE");
                    }
                }
            }

            // 1.5) 플레이어 턴 자동 종료 판단 (최소 요구 AP: 2)
            if (next.currentTurn === 'PLAYER' && p.ap < 2) {
                next.currentTurn = 'MONSTER';
                console.log("[ENGINE] Player out of AP, Auto-switched to MONSTER turn");
            }

            // 2) 플레이어 자세(타이머) 차감
            if (p.parryTimerFr > 0) {
                p.parryTimerFr -= 1;
                if (p.parryTimerFr <= 0) {
                    p.parryTimerFr = 0;
                    p.isParrying = false;
                }
            }
            if (p.dashTimerFr > 0) {
                p.dashTimerFr -= 1;
            }
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
            next = advanceStageNode(next);
            break;
    }

    // 2. 결과 상태 검증 (한글)
    validateState(next);

    return next;
}

