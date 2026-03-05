// src/core/state.ts (한글)

export interface PlayerState {
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    ap: number;
    maxAp: number;
    isParrying: boolean;
    parryTimer: number;
    dashTimer: number;
    actionsUsed: {
        atk: boolean;
        spin: boolean;
        heavy: boolean;
    };
    augBuffs: any; // 증강 버프 데이터
    state: any;    // 런타임 상태 데이터
    activeAugments: any[];
}

export interface GameState {
    gameStarted: boolean;
    currentTurn: "PLAYER" | "MONSTER" | "NONE";
    currentRound: number;
    player: PlayerState;
    monsters: any[];
    history: any[];
}

export const getInitialPlayerState = (): PlayerState => ({
    hp: 100,
    maxHp: 100,
    atk: 50,
    def: 0,
    ap: 0,
    maxAp: 10,
    isParrying: false,
    parryTimer: 0,
    dashTimer: 0,
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
        heavyUsedLastTurn: false, heavyHitThisTurn: false,
        perfFocusActive: false, perfParryThisTurn: false,
        killStacks: 0, unlimitKills: 0, firstAttackThisTurn: true,
        perfStacks: 0, multiAtkCount: 0, heavyLastTurn: false,
        atkUsedLastTurn: false
    },
    activeAugments: []
});

export const getInitialGameState = (): GameState => ({
    gameStarted: false,
    currentTurn: "NONE",
    currentRound: 1,
    player: getInitialPlayerState(),
    monsters: [],
    history: []
});
