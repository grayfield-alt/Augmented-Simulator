import { BALANCE } from './constants';

export class CombatEngine {
    constructor() {
        this.masteryMap = new Map();
    }

    getStats(actor, activeAugments = []) {
        let stats = { ...actor };

        // Apply Augments
        activeAugments.forEach(aug => {
            if (aug.effect === 'ADD_LUCK') stats.luck += aug.value;
            if (aug.atkBonus) stats.atk *= (1 + aug.atkBonus);
        });

        // Luck Effects
        stats.augmentTriggerBonus = stats.luck * BALANCE.LUCK_BONUS.AUGMENT_CHANCE;
        stats.resourceBonus = stats.luck * BALANCE.LUCK_BONUS.RESOURCE_BONUS;

        return stats;
    }

    calculateDamage(attacker, defender, isCrit = false, comboMult = 1, groggyMult = 1) {
        const rawDmg = attacker.atk * comboMult * groggyMult * (isCrit ? attacker.critDmg : 1);
        const finalDmg = Math.max(1, rawDmg - defender.def);
        return finalDmg;
    }

    calculateTurn(player, monster, isManualCheck = null) {
        const pStats = this.getStats(player);
        const mStats = monster; // Assuming monster stats are already scaled

        // Parry Logic
        let state = 'HIT';
        const parryRate = this.getParryRate(monster.id, mStats.complexity);

        if (isManualCheck !== null) {
            state = isManualCheck;
        } else {
            const rand = Math.random();
            if (rand < parryRate) state = 'PARRY';
            else if (rand < parryRate + 0.3) state = 'GUARD';
        }

        // Damage & Posture
        let playerDamage = 0;
        let monsterDamage = 0;
        let pPostureChange = 0;
        let mPostureChange = 0;

        if (state === 'PARRY') {
            player.comboCount++;
            mPostureChange = -20;
            // Counter damage
            monsterDamage = this.calculateDamage(pStats, mStats, false, 1, 1) * pStats.counterDmg;
        } else if (state === 'GUARD') {
            player.comboCount = 0;
            pPostureChange = -10;
            playerDamage = mStats.atk * (1 - BALANCE.SYSTEM.GUARD_DMG_REDUCTION);
        } else {
            player.comboCount = 0;
            pPostureChange = -20;
            playerDamage = mStats.atk;
        }

        // Groggy
        let groggyMult = 1;
        if (mStats.groggyTurns > 0) {
            groggyMult = BALANCE.SYSTEM.GROGGY_DMG_MULT;
            mStats.groggyTurns--;
        }

        // Player Normal Attack
        const comboIdx = Math.min(player.comboCount, BALANCE.PLAYER.COMBO_MULTIPLIERS.length - 1);
        const comboMult = BALANCE.PLAYER.COMBO_MULTIPLIERS[comboIdx];
        const isCrit = Math.random() < pStats.critRate;

        monsterDamage += this.calculateDamage(pStats, mStats, isCrit, comboMult, groggyMult);

        player.hp -= playerDamage;
        monster.hp -= monsterDamage;
        player.posture += pPostureChange;
        monster.posture += mPostureChange;

        // Posture Bounds
        if (player.posture <= 0) {
            player.hp -= 50;
            player.posture = player.maxPosture;
        }
        if (monster.posture <= 0) {
            monster.groggyTurns = BALANCE.SYSTEM.GROGGY_DURATION;
            monster.posture = mStats.maxPosture;
        }

        return {
            state,
            playerDamage,
            monsterDamage,
            isCrit,
            comboMult
        };
    }

    getParryRate(monsterId, complexity = 0) {
        const count = this.masteryMap.get(monsterId) || 0;
        const { PARRY_BASE_RATE, PARRY_MAX_RATE, MASTERY_SPEED } = BALANCE.PLAYER;
        const masteryBonus = (0.85 - 0.40) * (1 - Math.exp(-0.5 * (count)));
        const penalty = complexity * 0.02;
        return Math.min(0.85, Math.max(0.1, 0.40 + masteryBonus - penalty));
    }
}
