import { Augment } from '../data/augments';

export type Turn = "PLAYER" | "MONSTER" | "NONE";

export interface AugmentBuffs {
  atk: number; spin: number; heavy: number; parryAp: number; startAp: number;
  executeLow: number; stackAtk: number; heavySunder: number; killAp: number; perfectFocus: number;
  stackAtkEpic: number; heavyOverheat: number; spinKillAp: number; turnAtkPerf: number;
  startTurnAtk: number; killStackAtk: number; heavyExecute: number; lowApAtk: number;
  inertiaSlice: number; firstAtkMult: number; heavyKillAp: number; spinMultiTarget: number;
  perfectApBonus: number; unlimitKillAtk: number; takeDmgMult: number;
  soloAtk: number; soloHeavy: number; executeAll: number; heavyExecAll: number;
  heavyChain: number; highApBuff: number; perfStackBuff: number;
}

export interface PlayerState {
  killsThisTurn: number; parryApGained: number; isPrefGainedThisTurn: boolean;
  consecutiveTarget: any | null; consecutiveCount: number;
  heavyUsedLastTurn: boolean; heavyHitThisTurn: boolean;
  perfFocusActive: boolean; perfParryThisTurn: boolean;
  killStacks: number; unlimitKills: number; firstAttackThisTurn: boolean;
  perfStacks: number; multiAtkCount: number; heavyLastTurn: boolean;
  atkUsedLastTurn: boolean;
  highApAtkActive: boolean;
}

export interface Player {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  ap: number;
  x: number;
  y: number;
  augBuffs: AugmentBuffs;
  state: PlayerState;
  activeAugments: Augment[];
}

export interface Monster {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  radius: number;
  state: "IDLE" | "ATTACK" | "HIT" | "DEAD" | "TELEGRAPH" | "RETURN";
  timer: number;
}
