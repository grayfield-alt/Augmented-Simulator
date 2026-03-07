// src/data/monsters.ts
import { MonsterDef } from './types';

export const MONSTERS: Record<string, MonsterDef> = {
    'm_dummy': {
        id: 'm_dummy',
        name: 'Training Dummy',
        hp: 100,
        atk: 10,
        def: 0,
        patterns: ['pat_basic_atk']
    }
};
