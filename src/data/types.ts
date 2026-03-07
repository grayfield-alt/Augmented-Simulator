// src/data/types.ts

export interface PatternDef {
    id: string;
    cueFr: number;
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
