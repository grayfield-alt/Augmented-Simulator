// src/data/constants.ts
import { AttackSpeed } from './types';

export const ATTACK_SPEED_FRAMES: Record<AttackSpeed, number> = {
    [AttackSpeed.FAST]: 11,
    [AttackSpeed.NORMAL]: 15,
    [AttackSpeed.SLOW]: 20
};

export const DEFAULT_HIT_FR = 15;
export const DEFAULT_RECOVER_FR = 20;
