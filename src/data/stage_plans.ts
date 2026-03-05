// src/data/stage_plans.ts
export type NodeType = 'COMBAT' | 'REWARD_AUGMENT' | 'REST_CHOICE' | 'BOSS';

export interface StageNode {
    type: NodeType;
    waveLevel?: number; // COMBAT이나 BOSS일 때 사용할 난이도/레벨 (한글)
    encounterIds?: string[]; // 출현할 몬스터 ID 리스트 (한글)
}

export interface StagePlan {
    id: string;
    name: string;
    nodes: StageNode[];
}

export const stagePlans: Record<string, StagePlan> = {
    "stage_1": {
        id: "stage_1",
        name: "Stage 1: The Beginning",
        nodes: [
            { type: 'COMBAT', waveLevel: 1, encounterIds: ['mon_tuto_1'] },
            { type: 'REWARD_AUGMENT' },
            { type: 'COMBAT', waveLevel: 2, encounterIds: ['mon_tuto_2'] },
            { type: 'REWARD_AUGMENT' },
            { type: 'COMBAT', waveLevel: 3, encounterIds: ['mon_swarm_1'] },
            { type: 'REWARD_AUGMENT' },
            { type: 'REST_CHOICE' },
            { type: 'COMBAT', waveLevel: 5, encounterIds: ['mon_elite_1'] },
            { type: 'REWARD_AUGMENT' },
            { type: 'COMBAT', waveLevel: 6, encounterIds: ['mon_swarm_2', 'mon_swarm_2'] },
            { type: 'REWARD_AUGMENT' },
            { type: 'COMBAT', waveLevel: 7, encounterIds: ['mon_growth_1'] },
            { type: 'REWARD_AUGMENT' },
            { type: 'BOSS', waveLevel: 8, encounterIds: ['mon_boss_1'] }
        ]
    }
};
