import { Player, Monster } from './types';

export const calculateDamage = (
  baseAmount: number,
  target: Monster,
  player: Player,
  type: "normal" | "heavy" | "spin" = "normal"
): number => {
  let mult = player.augBuffs.atk;
  
  if (type === "spin") {
    mult = player.augBuffs.spin;
  } else if (type === "heavy") {
    mult = player.augBuffs.heavy;
    // 증강: 단두의 각 (HP 30% 이하 시 강타 공격력 증가)
    if (target.hp / target.maxHp <= 0.3) mult *= (1 + player.augBuffs.heavyExecute);
    // 증강: 집행인의 판결 (HP 40% 이하 시 강타 공격력 증가)
    if (target.hp / target.maxHp <= 0.4) mult *= (1 + player.augBuffs.heavyExecAll);
  }

  // 공통 증강 효과
  // 증강: 처형 본능 (HP 30% 이하 시)
  if (target.hp / target.maxHp <= player.augBuffs.executeLow) mult *= 1.15;
  // 증강: 집행인의 판결 (HP 40% 이하 시 전체 공격력 증가)
  if (target.hp / target.maxHp <= 0.4) mult *= (1 + player.augBuffs.executeAll);

  // 약점 파악/해부 (연속 공격 버프)
  if (player.state.consecutiveTarget === target) {
    if (player.state.consecutiveCount >= 1) mult *= (1 + player.augBuffs.stackAtk);
    mult *= (1 + player.augBuffs.stackAtkEpic * Math.min(player.state.consecutiveCount, 5));
  }

  // 이전 턴 행동 연계 버프
  if (player.state.heavyUsedLastTurn && player.state.firstAttackThisTurn) {
    mult *= (1 + player.augBuffs.heavySunder);
    mult *= (1 + player.augBuffs.heavyOverheat);
  }
  if (player.state.atkUsedLastTurn && player.state.firstAttackThisTurn) {
    mult *= (1 + player.augBuffs.inertiaSlice);
  }

  // 이번 턴 실시간 버프
  if (player.state.perfParryThisTurn) mult *= (1 + player.augBuffs.turnAtkPerf);
  if (player.state.perfFocusActive) mult *= (1 + player.augBuffs.perfectFocus);
  if (player.state.highApAtkActive) mult *= (1 + player.augBuffs.highApBuff);

  // 첫 공격 버프
  if (player.state.firstAttackThisTurn) {
    let firstMult = player.augBuffs.firstAtkMult;
    if (type === "heavy") firstMult *= 1.25; // 강타면 추가 보너스
    mult *= (1 + firstMult);
    mult *= (1 + player.augBuffs.startTurnAtk);
  }

  return Math.round(baseAmount * mult);
};

export const applyDamage = (amount: number, target: Monster): void => {
  target.hp = Math.max(0, target.hp - amount);
  if (target.hp <= 0) {
    target.state = "DEAD";
  } else {
    target.state = "HIT";
    target.timer = 10; // 히트 경직 시간
  }
};
