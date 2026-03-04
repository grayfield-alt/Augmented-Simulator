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
            dashTimer: 0,
            isDashing: false,
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

    // Helper to process scripted patterns or fallback to legacy speed strings
    processPattern(p) {
        if (typeof p === 'string') {
            return {
                steps: [{ type: "TELEGRAPH", duration: MONSTER_CONFIG.PATTERN_SPEEDS[p], action: "ATTACK" }]
            };
        }
        if (Array.isArray(p)) {
            return {
                steps: p.map(step => {
                    if (typeof step === 'string') {
                        return { type: "TELEGRAPH", duration: MONSTER_CONFIG.PATTERN_SPEEDS[step], action: "ATTACK" };
                    }
                    return step;
                })
            };
        }
        return p; // Already a script object
    }

    getMonsters(round, customSettings = null) {
        const data = WAVE_DATA[round];
        if (!data || data.type === "EVENT") return [];

        return data.map(t => {
            let patternScripts = [];
            if (t.multiPatterns) {
                patternScripts = t.multiPatterns.map(p => this.processPattern(p));
            } else {
                patternScripts = [this.processPattern(t.patterns)];
            }

            const isDragon = t.type === "ANCIENT DRAGON";
            const isBoss = t.type === "BOSS" || isDragon;

            const baseMonster = {
                id: Math.random().toString(36).substr(2, 9),
                name: t.type,
                homeX: 300,
                homeY: t.y * 0.4, // 상단 영역으로 더 밀착
                x: 300,
                y: t.y * 0.4,
                radius: isDragon ? 100 : (isBoss ? MONSTER_CONFIG.BOSS_RADIUS : MONSTER_CONFIG.BASE_RADIUS),
                hp: t.hp,
                maxHp: t.hp,
                atk: t.atk,
                color: isDragon ? "#8b0000" : (isBoss ? "#ff0000" : "#ff4a4a"),
                patterns: t.patterns,
                grade: t.grade || "NORMAL",
                currentType: "basic", // "basic" 또는 "skills"
                currentPatternIdx: 0,
                stepIdx: 0,
                hitTriggered: false,
                cueActive: false,
                settings: {
                    telegraphMult: 1.0,
                    postDelayMult: 1.0,
                    variance: 0,
                    hitStop: 3,
                    shakeScale: 1.0
                }
            };

            if (customSettings) {
                baseMonster.settings = { ...baseMonster.settings, ...customSettings };
            }

            return baseMonster;
        });
    }

    updateMonsterSettings(monsters, newSettings) {
        monsters.forEach(m => {
            m.settings = { ...m.settings, ...newSettings };
            // Re-process patterns if needed, or simply let the next pattern pick up new settings
        });
    }

    getNextAugments(tier = "Common") {
        const list = AUGMENT_DATA[tier] || AUGMENT_DATA["Common"];
        return [...list].sort(() => 0.5 - Math.random()).slice(0, 3);
    }

    selectAugment(aug) {
        if (aug.effect) aug.effect(this.player);
        this.activeAugments.push(aug);
    }
}
