import { Player, AugmentBuffs, PlayerState } from './types';

export const createInitialAugmentBuffs = (): AugmentBuffs => ({
  atk: 1.0, spin: 1.0, heavy: 1.0, parryAp: 0, startAp: 0,
  executeLow: 0, stackAtk: 0, heavySunder: 0, killAp: 0, perfectFocus: 0,
  stackAtkEpic: 0, heavyOverheat: 0, spinKillAp: 0, turnAtkPerf: 0,
  startTurnAtk: 0, killStackAtk: 0, heavyExecute: 0, lowApAtk: 1.0,
  inertiaSlice: 0, firstAtkMult: 0, heavyKillAp: 0, spinMultiTarget: 0,
  perfectApBonus: 0, unlimitKillAtk: 0, takeDmgMult: 1.0,
  soloAtk: 0, soloHeavy: 0, executeAll: 0, heavyExecAll: 0,
  heavyChain: 0, highApBuff: 0, perfStackBuff: 0
});

export const createInitialPlayerState = (): PlayerState => ({
  killsThisTurn: 0, parryApGained: 0, isPrefGainedThisTurn: false,
  consecutiveTarget: null, consecutiveCount: 0,
  heavyUsedLastTurn: false, heavyHitThisTurn: false,
  perfFocusActive: false, perfParryThisTurn: false,
  killStacks: 0, unlimitKills: 0, firstAttackThisTurn: true,
  perfStacks: 0, multiAtkCount: 0, heavyLastTurn: false,
  atkUsedLastTurn: false,
  highApAtkActive: false
});

export const createInitialPlayer = (): Player => ({
  hp: 100,
  maxHp: 100,
  atk: 50,
  def: 0,
  ap: 0,
  x: 200,
  y: 600,
  augBuffs: createInitialAugmentBuffs(),
  state: createInitialPlayerState(),
  activeAugments: []
});

// 전역 게임 상태 관리를 위한 클래스 (또는 간단한 객체)
export class GameStore {
  player: Player;
  currentRound: number = 1;
  monsters: any[] = [];
  currentTurn: string = "NONE";

  constructor() {
    this.player = createInitialPlayer();
  }

  reset() {
    this.player = createInitialPlayer();
    this.currentRound = 1;
    this.monsters = [];
    this.currentTurn = "NONE";
  }
}

export const store = new GameStore();
