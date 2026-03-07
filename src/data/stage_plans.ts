// src/data/stage_plans.ts
import { StagePlan } from './types';

export const STAGE_PLANS: Record<string, StagePlan> = {
    'tutorial': {
        id: 'tutorial',
        nodes: [
            { type: 'COMBAT', encounterIds: ['m_dummy'] },
            { type: 'BOSS' }
        ]
    }
};
