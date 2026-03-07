// src/data/patterns.ts
import { PatternDef } from './types';

export const PATTERNS: Record<string, PatternDef> = {
    'pat_basic_atk': {
        id: 'pat_basic_atk',
        cueFr: 26,
        hitFr: 15, // 돌진 애니메이션에 할애하는 프레임
        recoverFr: 20, // 제자리로 돌아가는 데 걸리는 시간
        flags: { parryable: true, dodgeable: true },
        dmgPct: 1.0
    },
    'pat_heavy_atk': {
        id: 'pat_heavy_atk',
        cueFr: 40,
        hitFr: 15,
        recoverFr: 30,
        flags: { parryable: false, dodgeable: true },
        dmgPct: 2.0
    }
};
