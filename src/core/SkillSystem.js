/**
 * Skill logic for V3
 */
import { GameStore } from './State.js';
import { CombatEngine } from './CombatEngine.js';

export const SkillSystem = {
    executeAttack(target) {
        const state = GameStore.getState();
        if (state.player.ap < 2) return false;

        const dmg = CombatEngine.calculateDamage(state.player.atk, 0);
        target.hp = Math.max(0, target.hp - dmg);

        GameStore.setState({
            player: { ...state.player, ap: state.player.ap - 2 }
        });
        return { msg: "ATTACK!", dmg };
    },

    executeSpinSlash(monsters) {
        const state = GameStore.getState();
        if (state.player.ap < 3) return false;

        const alive = monsters.filter(m => m.hp > 0);
        const dmg = CombatEngine.calculateDamage(state.player.atk * 1.2, 0) / alive.length;

        alive.forEach(m => {
            m.hp = Math.max(0, m.hp - dmg);
        });

        GameStore.setState({
            player: { ...state.player, ap: state.player.ap - 3 }
        });
        return { msg: "SPIN SLASH!", dmg };
    },

    executeHeavyStrike(target) {
        const state = GameStore.getState();
        if (state.player.ap < 5) return false;

        const dmg = CombatEngine.calculateDamage(state.player.atk * 2.5, 0);
        target.hp = Math.max(0, target.hp - dmg);

        GameStore.setState({
            player: { ...state.player, ap: state.player.ap - 5 }
        });
        return { msg: "HEAVY STRIKE!", dmg };
    }
};
