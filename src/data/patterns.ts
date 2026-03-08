// src/data/patterns.ts
import { PatternDef, AttackSpeed } from './types';

export const PATTERNS: Record<string, PatternDef> = {
    'pat_fast': {
        id: 'pat_fast',
        speed: AttackSpeed.FAST,
        hitFr: 15,
        recoverFr: 20,
        flags: { parryable: true, dodgeable: true },
        dmgPct: 1.0
    },
    'pat_normal': {
        id: 'pat_normal',
        speed: AttackSpeed.NORMAL,
        hitFr: 15,
        recoverFr: 20,
        flags: { parryable: true, dodgeable: true },
        dmgPct: 1.0
    },
    'pat_slow': {
        id: 'pat_slow',
        speed: AttackSpeed.SLOW,
        hitFr: 15,
        recoverFr: 20,
        flags: { parryable: true, dodgeable: true },
        dmgPct: 1.0
    },
    'pat_heavy': {
        id: 'pat_heavy',
        speed: AttackSpeed.SLOW, // 무거운 공격은 기본적으로 느림
        hitFr: 15,
        recoverFr: 30, // 후딜레이만 길게 설정
        flags: { parryable: true, dodgeable: true },
        dmgPct: 1.5
    }
};
