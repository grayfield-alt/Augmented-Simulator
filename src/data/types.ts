// src/data/types.ts
export enum AttackSpeed {
    FAST = 'FAST',
    NORMAL = 'NORMAL',
    SLOW = 'SLOW'
}

export interface PatternDef {
    id: string;
    speed: AttackSpeed; // NEW: Enum 기반 속도
    cueFr?: number;     // Optional: 명시적 재정의용
    hitFr: number;
    recoverFr: number;
    flags: {
        parryable: boolean;
        dodgeable: boolean;
    };
    dmgPct: number;
}

export interface MonsterDef {
    id: string;
    name: string;
    hp: number;
    atk: number;
    def: number;
    patterns: string[]; // references PatternDef.id
}

export interface StageNode {
    type: 'COMBAT' | 'REWARD_AUGMENT' | 'REST_CHOICE' | 'BOSS';
    encounterIds?: string[]; // references MonsterDef.id
}

export interface StagePlan {
    id: string;
    nodes: StageNode[];
}

export interface AugmentDef {
    id: string;
    name: string;
    desc: string;
    hooks: {
        onParrySuccess?: string;
        onKill?: string;
        onSkillUsed?: string;
    };
    params?: any;
}
