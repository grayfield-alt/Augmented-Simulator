export const BALANCE = {
    PLAYER: {
        INITIAL_STATS: {
            hp: 1000,
            atk: 50,
            def: 10,
            luck: 5,
            critRate: 0.05,
            critDmg: 1.5,
            counterDmg: 1.2,
            maxPosture: 100,
        },
        MASTERY_SPEED: 0.5,
        COMBO_MULTIPLIERS: [1.0, 1.1, 1.2, 1.5, 2.0],
    },
    MONSTER: {
        BASE_HP: 300,
        BASE_ATK: 40,
        BASE_DEF: 5,
        BASE_POSTURE: 50,
        SECTOR_GROWTH: 0.12,
        BOSS_POWER_JUMP: 2.5,
        PATTERN_COMPLEXITY_FACTOR: 0.02,
    },
    SYSTEM: {
        GROGGY_DURATION: 3,
        GROGGY_DMG_MULT: 2.0,
        GUARD_DMG_REDUCTION: 0.7,
        RESOURCE_PER_SECTOR: 100,
        EXTERNAL_UPGRADE_COST: 1000,
        PARRY_WINDOW_MS: 300, // For manual play mode
    },
    LUCK_BONUS: {
        AUGMENT_CHANCE: 0.01, // 1% per luck
        RESOURCE_BONUS: 0.02, // 2% per luck
    }
};

export const AUGMENTS = [
    {
        id: 'auto_parry',
        name: 'Auto Parry',
        description: '15% chance to automatically parry when failing.',
        type: 'DEFENSE',
        effect: 'RESCUE_PARRY',
        value: 0.15,
        rarity: 'Common'
    },
    {
        id: 'lightning_bash',
        name: 'Lightning Bash',
        description: 'Parrying deals extra 30% ATK as damage.',
        type: 'ATTACK',
        effect: 'PARRY_DAMAGE',
        value: 0.3,
        atkBonus: 0.1,
        rarity: 'Rare'
    },
    {
        id: 'lucky_coin',
        name: 'Lucky Coin',
        description: 'Increases Luck by 10.',
        type: 'UTILITY',
        effect: 'ADD_LUCK',
        value: 10,
        rarity: 'Common'
    }
];
