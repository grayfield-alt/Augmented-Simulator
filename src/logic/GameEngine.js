import { BALANCE, AUGMENTS } from './constants';
import { CombatEngine } from './CombatEngine';

export class GameEngine {
    constructor() {
        this.combat = new CombatEngine();
        this.resetSession();
    }

    resetSession() {
        this.player = { ...BALANCE.PLAYER.INITIAL_STATS, comboCount: 0 };
        this.activeAugments = [];
        this.currentStage = 1;
        this.currentSector = 1;
        this.isGameOver = false;
        this.log = [];
        this.history = []; // For death zone heatmap
    }

    generateMonster(stage, sector) {
        const growthFactor = Math.pow(1 + BALANCE.MONSTER.SECTOR_GROWTH, (stage - 1) * 10 + (sector - 1));
        const bossMult = sector === 10 ? BALANCE.MONSTER.BOSS_POWER_JUMP : 1;

        return {
            id: `monster_${stage}_${sector}`,
            name: sector === 10 ? `Boss ${stage}-10` : `Monster ${stage}-${sector}`,
            hp: BALANCE.MONSTER.BASE_HP * growthFactor * bossMult,
            maxHp: BALANCE.MONSTER.BASE_HP * growthFactor * bossMult,
            atk: BALANCE.MONSTER.BASE_ATK * growthFactor * bossMult,
            def: BALANCE.MONSTER.BASE_DEF * growthFactor,
            posture: BALANCE.MONSTER.BASE_POSTURE * growthFactor * bossMult,
            maxPosture: BALANCE.MONSTER.BASE_POSTURE * growthFactor * bossMult,
            complexity: (stage - 1) * 2 + (sector === 10 ? 5 : 0),
            groggyTurns: 0
        };
    }

    getNextAugments() {
        // Luck bonus logic
        const luck = this.player.luck;
        // Simple logic: higher luck might replace Common with Rare more often
        const sample = [];
        for (let i = 0; i < 3; i++) {
            const pool = Math.random() < (0.1 + luck * 0.01) ? AUGMENTS : AUGMENTS.filter(a => a.rarity === 'Common');
            sample.push(pool[Math.floor(Math.random() * pool.length)]);
        }
        return sample;
    }

    selectAugment(augment) {
        this.activeAugments.push(augment);
        // Apply immediate stat changes if any (actually getStats handles it)
        this.currentSector++;
        if (this.currentSector > 10) {
            this.currentSector = 1;
            this.currentStage++;
        }
    }
}
