// src/core/engine.ts (한글)
import { GameState } from './state';
import { validateState } from './validator';
import { STAGE_PLANS } from '../data/stage_plans';
import { MONSTERS } from '../data/monsters';
import { PATTERNS } from '../data/patterns';
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

function initCurrentNode(state: GameState): GameState {
    const plan = state.stagePlan;
    if (!plan) return state;
    const node = plan.nodes[state.currentNodeIndex];
    if (!node) return state;

    if (node.type === 'COMBAT' || node.type === 'BOSS') {
        state.currentTurn = 'MONSTER';
        state.roundStartTimerFr = 100; // proto: 100fr 대기 (약 1.6초)
        const roundNum = state.currentNodeIndex + 1;
        console.log(`[ENGINE] Round ${roundNum} Start!`);

        state.monsters = (node.encounterIds || []).map((mId: string, idx: number) => {
            const mDef = MONSTERS[mId];
            if (!mDef) throw new Error(`Monster ${mId} not found`);
            return {
                id: `${mId}_${idx}`,
                name: mDef.name,
                hp: mDef.hp,
                maxHp: mDef.hp,
                atk: mDef.atk,
                def: mDef.def,
                patterns: mDef.patterns,
                state: 'IDLE',
                attackTimerFr: 60,
                maxTimerFr: 60,
                currentPatternIdx: 0,
                currentAttack: {
                    isUnparryable: false,
                    isUndodgeable: false,
                    dmgPct: 1.0,
                    hitFr: 15,
                    recoverFr: 20
                }
            };
        });
        state.currentMonsterIndex = 0;
        state.player.state.killsThisTurn = 0;
        state.player.state.firstAttackThisTurn = true;
    } else if (node.type === 'REWARD_AUGMENT') {
        state.showAugmentOverlay = true;
    } else if (node.type === 'REST_CHOICE') {
        state.showEventOverlay = true;
    }

    return state;
}

export function reduce(state: GameState, action: any): GameState {
    // 1. 입력 상태 검증 (한글)
    validateState(state);

    let next = JSON.parse(JSON.stringify(state)) as GameState;
    const p = next.player;

    switch (action.type) {
        case 'START_GAME':
            const tutorialPlan = STAGE_PLANS['tutorial'];
            if (!tutorialPlan) throw new Error("튜토리얼 스테이지 플랜이 없습니다.");

            next.gameStarted = true;
            next.currentRound = 1;
            next.currentStageId = tutorialPlan.id;
            next.stagePlan = tutorialPlan;
            next.currentNodeIndex = 0;

            next = initCurrentNode(next);
            console.log(`[ENGINE] START_GAME: 스폰 완료 (${next.monsters ? next.monsters.length : 0}기)`);
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
            if (p.parryTimerFr === 0 && p.dashTimerFr === 0 && next.currentTurn === 'MONSTER') {
                p.isParrying = true;
                p.parryTimerFr = CONFIG_FR.PARRY_MAX_FR;
            }
            break;

        case 'DODGE_START':
            if (p.dashTimerFr === 0 && p.parryTimerFr === 0 && next.currentTurn === 'MONSTER') {
                p.dashTimerFr = 50; // 50/60fps 회피
                console.log("[ENGINE] EVASION ACTIVATED");
            }
            break;

        case 'TICK_FR_STEP':
            // 1프레임 틱 진행 (한글)

            // 진행 중인 전투가 있다면 모든 몬스터의 생존 잔존 확인
            if (next.monsters && next.monsters.length > 0) {
                const aliveMonsters = next.monsters.filter((m: any) => m.hp > 0);
                next.monsters = aliveMonsters; // 죽은 몬스터는 배열에서 영구 제거 (렌더/턴 대상 기반)

                // 방금 적들이 모두 죽었다면 전투 페이즈 강제 종료
                if (aliveMonsters.length === 0) {
                    console.log("[ENGINE] Encounter Ended - All monsters defeated.");
                    next.currentTurn = 'PLAYER';
                    next.isEndingTurnAutomatically = false;
                    next.playerEndTimerFr = 0;
                    next.combatFeedback = null;
                    next = advanceStageNode(next); // REWARD_AUGMENT 단계로 전환됨
                    break; // 이번 틱 전체 루프 정지
                }
            }

            if (next.combatFeedback) {
                next.combatFeedback.timerFr--;
                if (next.combatFeedback.timerFr <= 0) next.combatFeedback = null;
            }

            // 1) 플레이어 턴 종료 대기 로직
            if (next.currentTurn === 'PLAYER') {
                if (!next.isEndingTurnAutomatically) {
                    const fAp = Math.floor(p.ap + 0.01);
                    const canAtk = !p.actionsUsed.atk && fAp >= 2;
                    const canSpin = !p.actionsUsed.spin && fAp >= 3;
                    const canHeavy = !p.actionsUsed.heavy && fAp >= 5;

                    if (!canAtk && !canSpin && !canHeavy) {
                        next.isEndingTurnAutomatically = true;
                        next.playerEndTimerFr = 48; // 800ms 대기 (proto 규격)
                    }
                } else {
                    if (next.playerEndTimerFr > 0) next.playerEndTimerFr--;
                    if (next.playerEndTimerFr <= 0) {
                        next.currentTurn = 'MONSTER';
                        next.currentMonsterIndex = 0;
                        p.state.heavyUsedLastTurn = p.actionsUsed.heavy;
                        p.state.atkUsedLastTurn = p.actionsUsed.atk;
                        p.state.killsThisTurn = 0;
                        p.actionsUsed = { atk: false, spin: false, heavy: false };
                        next.isEndingTurnAutomatically = false;
                        next.roundStartTimerFr = 50; // 턴 전환 대기

                        // 몬스터 상태 초기화
                        next.monsters.forEach((m: any) => {
                            if (m.hp > 0) {
                                m.state = 'IDLE';
                                m.attackTimerFr = 60;
                                m.maxTimerFr = 60;
                            }
                        });
                        console.log("[ENGINE] Turn switched to MONSTER");
                    }
                }
                break;
            }

            // 2) 턴 전환 대기 (roundStartTimer)
            if (next.roundStartTimerFr > 0) {
                next.roundStartTimerFr--;
                if (next.roundStartTimerFr <= 0) {
                    if (p.ap >= 5) p.state.highApAtkActive = true;
                }
                break;
            }

            // 3) 몬스터 턴 로직
            if (p.parryTimerFr > 0) p.parryTimerFr--;
            else { p.parryTimerFr = 0; p.isParrying = false; }

            if (p.dashTimerFr > 0) p.dashTimerFr--; // 회피 지속 차감

            const m = next.monsters[next.currentMonsterIndex];
            if (!m) {
                if (next.currentMonsterIndex < next.monsters.length - 1) {
                    next.currentMonsterIndex++;
                } else {
                    next.currentTurn = 'PLAYER';
                    console.log("[ENGINE] All monsters finished, Turn switched to PLAYER");
                }
                break;
            }
            if (m.hp <= 0) {
                m.state = "DONE";
                if (next.currentMonsterIndex < next.monsters.length - 1) {
                    next.currentMonsterIndex++;
                } else {
                    next.currentTurn = 'PLAYER';
                    console.log("[ENGINE] All monsters finished, Turn switched to PLAYER");
                }
                break;
            }

            // Proto 상태머신 (IDLE -> CUE[TELEGRAPH] -> HIT[ATTACK] -> RECOVER[RETURN])
            if (m.state === "IDLE") {
                if (m.attackTimerFr > 0) m.attackTimerFr--;
                if (m.attackTimerFr <= 0) {
                    m.state = "CUE"; // proto's TELEGRAPH

                    // 패턴 순환 로직
                    const hasPatterns = m.patterns && m.patterns.length > 0;
                    const patId = hasPatterns ? m.patterns[m.currentPatternIdx] : 'pat_normal';
                    const pDef = PATTERNS[patId] || PATTERNS['pat_normal'];

                    if (hasPatterns) {
                        m.currentPatternIdx = (m.currentPatternIdx + 1) % m.patterns.length;
                    }

                    m.attackTimerFr = pDef ? pDef.cueFr : 60;
                    m.maxTimerFr = m.attackTimerFr;
                    m.currentAttack = {
                        isUnparryable: pDef ? !pDef.flags.parryable : false,
                        isUndodgeable: pDef ? !pDef.flags.dodgeable : false,
                        dmgPct: pDef ? pDef.dmgPct : 1.0,
                        hitFr: pDef ? pDef.hitFr : 15,
                        recoverFr: pDef ? pDef.recoverFr : 20
                    };
                }
            } else if (m.state === "CUE") {
                if (m.attackTimerFr > 0) m.attackTimerFr--;
                if (m.attackTimerFr <= 0) {
                    m.state = "HIT"; // proto's ATTACK
                    m.attackTimerFr = m.currentAttack.hitFr || 15;
                    m.maxTimerFr = m.attackTimerFr;
                    m.hitTriggered = false;
                }
            } else if (m.state === "HIT") {
                if (m.attackTimerFr > 0) m.attackTimerFr--;

                // 타격 판정 (proto: 0~2프레임 오차 허용)
                if (m.attackTimerFr <= 2 && !m.hitTriggered) {
                    m.hitTriggered = true;

                    // 1순위: 회피 판정
                    if (p.dashTimerFr > 0) {
                        next.combatFeedback = { text: "EVADED!", color: "#88ccff", timerFr: 45 };
                        console.log("[ENGINE] EVASION SUCCESS! (Damage Nullified)");
                        // AP 리턴 없음
                    }
                    else {
                        const isUnparryable = m.currentAttack.isUnparryable;

                        // 2순위: 패링 판정
                        if (p.isParrying && !isUnparryable) {
                            const elapsed = CONFIG_FR.PARRY_MAX_FR - p.parryTimerFr; // 소요 프레임
                            if (elapsed <= CONFIG_FR.PERFECT_FR) {
                                next.combatFeedback = { text: "PERFECT!", color: "#FFD700", timerFr: 45 };
                                console.log(`[ENGINE] PERFECT PARRY! (elapsed: ${elapsed})`);
                                p.ap += 2.0;
                                if (!p.state.isPrefGainedThisTurn) {
                                    p.ap += (p.augBuffs.parryAp || 0);
                                    p.state.isPrefGainedThisTurn = true;
                                }
                                if ((p.state.parryApGained || 0) < 2) {
                                    p.ap += (p.augBuffs.perfectApBonus || 0);
                                    p.state.parryApGained = (p.state.parryApGained || 0) + 1;
                                }
                                p.state.perfFocusActive = true;
                                p.state.perfParryThisTurn = true;
                                p.state.perfStacks = Math.min((p.state.perfStacks || 0) + 1, 3);
                            } else {
                                next.combatFeedback = { text: "GOOD", color: "#00FF00", timerFr: 45 };
                                console.log(`[ENGINE] GOOD PARRY! (elapsed: ${elapsed})`);
                                p.ap += 1.0;
                                if (!p.state.isPrefGainedThisTurn) {
                                    p.ap += (p.augBuffs.parryAp || 0);
                                    p.state.isPrefGainedThisTurn = true;
                                }
                            }
                        }
                        // 3순위: 피격 (패링 불가 or 실패)
                        else {
                            const rawDmg = m.atk * (m.currentAttack.dmgPct || 1.0) * (p.augBuffs.takeDmgMult || 1.0);
                            const finalDmg = calculateDamage(rawDmg, p.def);
                            p.hp = Math.max(0, p.hp - finalDmg);
                            p.state.perfStacks = 0;
                            if (p.isParrying && isUnparryable) {
                                next.combatFeedback = { text: "UNPARRIABLE!", color: "#ff4a4a", timerFr: 45 };
                                console.log("[ENGINE] UNPARRYABLE HIT PENETRATED GUARD!");
                            } else {
                                console.log(`[ENGINE] HIT DETECTED! Player HP: ${p.hp}`);
                            }
                        }
                    }
                }

                if (m.attackTimerFr <= 0) {
                    m.state = "RECOVER";
                    m.attackTimerFr = m.currentAttack.recoverFr || 20;
                    m.maxTimerFr = m.attackTimerFr;
                    m.hitTriggered = false;
                }
            } else if (m.state === "RECOVER") {
                if (m.attackTimerFr > 0) m.attackTimerFr--;
                if (m.attackTimerFr <= 0) {
                    m.state = "DONE";
                    // 다음 몬스터 턴으로
                    if (next.currentMonsterIndex < next.monsters.length - 1) {
                        next.currentMonsterIndex++;
                    } else {
                        next.currentTurn = 'PLAYER';
                        console.log("[ENGINE] Last monster finished, Turn switched to PLAYER");
                    }
                }
            }
            break;

        case 'ENTER_STAGE':
            next = enterStage(next, action.stagePlan);
            break;

        case 'ADVANCE_NODE':
            next = advanceStageNode(next);
            next = initCurrentNode(next);
            break;

        case 'REST_CHOICE_MADE':
            if (action.choice === 'heal') {
                p.hp = Math.min(p.maxHp, Math.round(p.hp + p.maxHp * 0.35));
            }
            // 휴식 후 다음 노드로 진행
            next = advanceStageNode(next);
            next = initCurrentNode(next);
            break;
    }

    // 2. 결과 상태 검증 (한글)
    validateState(next);

    return next;
}

