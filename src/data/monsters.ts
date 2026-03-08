// src/data/monsters.ts
import { MonsterDef } from './types';

export const MONSTERS: Record<string, MonsterDef> = {
    // Round 1
    'm_w1_1': { id: 'm_w1_1', name: 'Scout Drone', hp: 100, atk: 10, def: 0, patterns: ['pat_normal'] },
    'm_w1_2': { id: 'm_w1_2', name: 'Fast Strider', hp: 80, atk: 12, def: 0, patterns: ['pat_fast'] },

    // Round 2
    'm_w2_1': { id: 'm_w2_1', name: 'Shield Core', hp: 150, atk: 8, def: 5, patterns: ['pat_normal', 'pat_slow'] },
    'm_w2_2': { id: 'm_w2_2', name: 'Assault Unit', hp: 120, atk: 15, def: 0, patterns: ['pat_fast', 'pat_normal'] },

    // Boss
    'm_boss': { id: 'm_boss', name: 'VOID OVERSEER', hp: 850, atk: 18, def: 2, patterns: ['pat_normal', 'pat_fast', 'pat_slow', 'pat_heavy'] }
};
