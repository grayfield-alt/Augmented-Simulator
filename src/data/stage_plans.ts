// src/data/stage_plans.ts
import { StagePlan } from './types';

export const STAGE_PLANS: Record<string, StagePlan> = {
    'tutorial': {
        id: 'tutorial',
        nodes: [
            // Round 1
            { type: 'COMBAT', encounterIds: ['m_w1_1', 'm_w1_2'] },
            { type: 'REWARD_AUGMENT' },
            // Round 2
            { type: 'COMBAT', encounterIds: ['m_w2_1', 'm_w2_2'] },
            // Round 3
            { type: 'REST_CHOICE' },
            // Round 4
            { type: 'COMBAT', encounterIds: ['m_w4_1', 'm_w4_2', 'm_w4_3'] },
            { type: 'REWARD_AUGMENT' },
            // Round 5
            { type: 'COMBAT', encounterIds: ['m_w5_1', 'm_w5_2', 'm_w5_3', 'm_w5_4'] },
            { type: 'REWARD_AUGMENT' },
            // Round 6 (Boss)
            { type: 'BOSS', encounterIds: ['m_boss'] }
        ]
    }
};
