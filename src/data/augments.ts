// src/data/augments.ts
import { AugmentDef } from './types';

export const AUGMENTS: Record<string, AugmentDef> = {
    'aug_ap_boost': {
        id: 'aug_ap_boost',
        name: 'AP Boost',
        desc: '전투 시작 시 AP +1 (Start battles with +1 AP)',
        hooks: {},
        params: { amount: 1 }
    },
    'aug_parry_master': {
        id: 'aug_parry_master',
        name: 'Parry Master',
        desc: '패링 성공 시 AP 추가 회복 (Extra AP on Parry)',
        hooks: { onParrySuccess: 'gain_ap' },
        params: { amount: 0.5 }
    },
    'aug_heavy_impact': {
        id: 'aug_heavy_impact',
        name: 'Heavy Impact',
        desc: '강타 스킬 공격력 증폭 (Heavy Attack multiplier +0.5x)',
        hooks: {},
        params: { heavyMult: 0.5 }
    }
};
