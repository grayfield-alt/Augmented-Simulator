// src/data/monsters.ts
import { MonsterDef } from './types';

export const MONSTERS: Record<string, MonsterDef> = {
    // Round 1
    'm_w1_1': { id: 'm_w1_1', name: 'Enemy 1', hp: 100, atk: 10, def: 0, patterns: ['pat_normal'] },
    'm_w1_2': { id: 'm_w1_2', name: 'Enemy 2', hp: 100, atk: 10, def: 0, patterns: ['pat_normal', 'pat_fast'] },

    // Round 2
    'm_w2_1': { id: 'm_w2_1', name: 'Enemy A', hp: 80, atk: 9, def: 0, patterns: ['pat_fast'] },
    'm_w2_2': { id: 'm_w2_2', name: 'Enemy B', hp: 120, atk: 8, def: 0, patterns: ['pat_normal', 'pat_slow'] },

    // Round 4
    'm_w4_1': { id: 'm_w4_1', name: 'Enemy A', hp: 85, atk: 9, def: 0, patterns: ['pat_fast'] },
    'm_w4_2': { id: 'm_w4_2', name: 'Enemy B', hp: 105, atk: 8, def: 0, patterns: ['pat_normal', 'pat_fast'] },
    'm_w4_3': { id: 'm_w4_3', name: 'Enemy C', hp: 130, atk: 7, def: 0, patterns: ['pat_normal', 'pat_fast', 'pat_slow'] },

    // Round 5
    'm_w5_1': { id: 'm_w5_1', name: 'Enemy A', hp: 70, atk: 10, def: 0, patterns: ['pat_fast'] },
    'm_w5_2': { id: 'm_w5_2', name: 'Enemy B', hp: 75, atk: 10, def: 0, patterns: ['pat_normal'] },
    'm_w5_3': { id: 'm_w5_3', name: 'Enemy C', hp: 110, atk: 9, def: 0, patterns: ['pat_normal', 'pat_fast'] },
    'm_w5_4': { id: 'm_w5_4', name: 'Enemy D', hp: 140, atk: 8, def: 0, patterns: ['pat_normal', 'pat_fast', 'pat_slow'] },

    // Round 6 (Boss)
    'm_boss': { id: 'm_boss', name: 'BOSS', hp: 780, atk: 12, def: 0, patterns: ['pat_normal', 'pat_fast', 'pat_slow', 'pat_heavy'] }
};
