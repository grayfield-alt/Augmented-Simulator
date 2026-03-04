/**
 * Pure Combat Logic for V3
 */
export const CombatEngine = {
    /**
     * Calculates damage after defense
     */
    calculateDamage(atk, def) {
        const damage = Math.max(1, atk - def);
        return Math.floor(damage);
    },

    /**
     * Checks if a parry is successful
     */
    checkParry(monsterPos, monsterAtkZone, playerParryWindow) {
        // Simple radial check for now, can be expanded to vector-based
        return playerParryWindow > 0;
    },

    /**
     * Checks if an attack hits or is evaded
     */
    isHit(playerDashTimer) {
        return playerDashTimer <= 0;
    }
};
