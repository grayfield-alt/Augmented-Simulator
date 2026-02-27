import { PLAYER_CONFIG, MONSTER_CONFIG, WAVE_DATA, AUGMENT_DATA } from './constants';

export class GameEngine {
    constructor() {
        this.resetSession();
    }

    resetSession() {
        this.player = {
            hp: PLAYER_CONFIG.INITIAL_HP,
            maxHp: PLAYER_CONFIG.INITIAL_HP,
            atk: PLAYER_CONFIG.INITIAL_ATK,
            def: PLAYER_CONFIG.INITIAL_DEF,
            ap: PLAYER_CONFIG.INITIAL_AP,
            radius: PLAYER_CONFIG.RADIUS,
            comboCount: 0,
            parryTimer: 0,
            isParrying: false,
            actionsUsed: { atk: false, spin: false, heavy: false },
            augBuffs: {
                atk: 1.0, spin: 1.0, heavy: 1.0, parryAp: 0, startAp: 0,
                executeLow: 0, stackAtk: 0, heavySunder: 0, killAp: 0, perfectFocus: 0,
                stackAtkEpic: 0, heavyOverheat: 0, spinKillAp: 0, turnAtkPerf: 0,
                startTurnAtk: 0, killStackAtk: 0, heavyExecute: 0, lowApAtk: 1.0,
                inertiaSlice: 0, firstAtkMult: 0, heavyKillAp: 0, spinMultiTarget: 0,
                perfectApBonus: 0, unlimitKillAtk: 0, takeDmgMult: 1.0,
                soloAtk: 0, soloHeavy: 0, executeAll: 0, heavyExecAll: 0,
                heavyChain: 0, highApBuff: 0, perfStackBuff: 0
            },
            state: {
                killsThisTurn: 0, parryApGained: 0, isPrefGainedThisTurn: false,
                consecutiveTarget: null, consecutiveCount: 0,
                heavyUsedLastTurn: false, firstAttackThisTurn: true,
                perfFocusActive: false, perfParryThisTurn: false,
                killStacks: 0, unlimitKills: 0, perfStacks: 0,
                atkUsedLastTurn: false, highApAtkActive: false
            }
        };
        this.activeAugments = [];
        this.currentRound = 1;
        this.isGameOver = false;
        this.history = [];
    }

    getMonsters(round) {
        const data = WAVE_DATA[round];
        if (!data || data.type === "EVENT") return [];

        return data.map(t => {
            let patterns = [];
            if (t.multiPatterns) {
                patterns = t.multiPatterns.map(p => ({
                    hits: p.map(s => MONSTER_CONFIG.PATTERN_SPEEDS[s])
                }));
            } else {
                patterns = [{
                    hits: t.patterns.map(s => MONSTER_CONFIG.PATTERN_SPEEDS[s])
                }];
            }

            const isDragon = t.type === "ANCIENT DRAGON";
            const isBoss = t.type === "BOSS" || isDragon;

            return {
                id: Math.random().toString(36).substr(2, 9),
                name: t.type,
                homeX: 600,
                homeY: t.y,
                x: 600,
                y: t.y,
                radius: isDragon ? 100 : (isBoss ? MONSTER_CONFIG.BOSS_RADIUS : MONSTER_CONFIG.BASE_RADIUS),
                hp: t.hp,
                maxHp: t.hp,
                atk: t.atk,
                color: isDragon ? "#8b0000" : (isBoss ? "#ff0000" : "#ff4a4a"),
                state: "IDLE",
                timer: 0,
                patterns: patterns,
                currentPatternIdx: 0,
                currentPattern: patterns[0],
                patternStep: 0,
                hitTriggered: false
            };
        });
    }

    getNextAugments(tier = "Common") {
        const list = AUGMENT_DATA[tier];
        return [...list].sort(() => 0.5 - Math.random()).slice(0, 3);
    }

    selectAugment(aug) {
        if (aug.effect) aug.effect(this.player);
        this.activeAugments.push(aug);
    }
}
