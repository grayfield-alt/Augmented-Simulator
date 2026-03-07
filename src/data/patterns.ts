// src/data/patterns.ts
import { PatternDef } from './types';

export const PATTERNS: Record<string, PatternDef> = {
    'pat_basic_atk': {
        id: 'pat_basic_atk',
        cueFr: 26,
        hitFr: 1,
        recoverFr: 40,
        flags: { parryable: true, dodgeable: true },
        dmgPct: 1.0
    },
    'pat_heavy_atk': {
        id: 'pat_heavy_atk',
        cueFr: 40,
        hitFr: 1,
        recoverFr: 60,
        flags: { parryable: false, dodgeable: true },
        dmgPct: 2.0
    }
};
