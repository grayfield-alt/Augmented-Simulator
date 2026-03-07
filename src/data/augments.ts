// src/data/augments.ts
import { AugmentDef } from './types';

export const AUGMENTS: Record<string, AugmentDef> = {
    'aug_ap_boost': {
        id: 'aug_ap_boost',
        name: 'AP Boost',
        desc: 'Start battles with +1 AP',
        hooks: {},
        params: { amount: 1 }
    }
};
