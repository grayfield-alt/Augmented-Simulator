import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load JSON data
const rawData = fs.readFileSync(path.join(__dirname, 'augments.json'), 'utf-8');
export const AUGMENTS = JSON.parse(rawData);

// Logic implementation map
const LOGIC_MAP = {
    "CHANCE_RESCUE": (isParried, chance, augment) => {
        if (!isParried && Math.random() < augment.value) {
            return true; // Rescue!
        }
        return isParried;
    },
    "CHANCE_DAMAGE": (player, monster, augment) => {
        if (Math.random() < augment.value) {
            monster.hp -= augment.extraDamage;
            return augment.extraDamage;
        }
        return 0;
    }
};

export function getAugmentHooks(activeAugments) {
    const hooks = {};

    activeAugments.forEach(aug => {
        const logic = LOGIC_MAP[aug.logicType];
        if (!logic) return;

        if (aug.trigger === 'onParryCheck') {
            const prev = hooks.onParryCheck || ((p) => p);
            hooks.onParryCheck = (isParried, chance) => {
                const result = logic(isParried, chance, aug);
                return prev(result, chance);
            };
        }

        if (aug.trigger === 'onParrySuccess') {
            const prev = hooks.onParrySuccess || (() => 0);
            hooks.onParrySuccess = (player, monster) => {
                return prev(player, monster) + logic(player, monster, aug);
            };
        }
    });

    return hooks;
}
