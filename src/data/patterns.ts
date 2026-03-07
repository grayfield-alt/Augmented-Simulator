// src/data/patterns.ts
import { PatternDef } from './types';

export const PATTERNS: Record<string, PatternDef> = {
    'pat_fast': {
        id: 'pat_fast',
        cueFr: 40,
        hitFr: 15,
        recoverFr: 20,
        flags: { parryable: true, dodgeable: true },
        dmgPct: 1.0
    },
    'pat_normal': {
        id: 'pat_normal',
        cueFr: 60,
        hitFr: 15,
        recoverFr: 20,
        flags: { parryable: true, dodgeable: true },
        dmgPct: 1.0
    },
    'pat_slow': {
        id: 'pat_slow',
        cueFr: 90,
        hitFr: 15,
        recoverFr: 20,
        flags: { parryable: true, dodgeable: true },
        dmgPct: 1.0
    },
    'pat_heavy': {
        id: 'pat_heavy',
        cueFr: 90,
        hitFr: 15,
        recoverFr: 30, // proto의 보스 딜레이나 막기 불가 대응 시 활용
        flags: { parryable: true, dodgeable: true },
        dmgPct: 1.5
    }
};
