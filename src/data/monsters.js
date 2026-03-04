/**
 * Default Monster Library for V3
 */
export const MONSTER_LIBRARY = [
    { id: "def_1", name: "Enemy 1", hp: 100, atk: 10, telegraph: 1.0, postdelay: 1.0, hitstop: 3, patterns: ["NORMAL"] },
    { id: "def_2", name: "Enemy 2", hp: 100, atk: 12, telegraph: 1.0, postdelay: 1.0, hitstop: 3, patterns: ["NORMAL"] },
    { id: "def_A", name: "Enemy A", hp: 80, atk: 9, telegraph: 0.8, postdelay: 1.2, hitstop: 2, patterns: ["FAST"] },
    { id: "def_B", name: "Enemy B", hp: 150, atk: 8, telegraph: 1.2, postdelay: 0.8, hitstop: 4, patterns: ["SLOW"] },
    { id: "def_BOSS", name: "BOSS", hp: 800, atk: 15, telegraph: 1.0, postdelay: 1.0, hitstop: 5, patterns: ["NORMAL", "FAST", "SLOW"] }
];

export const PATTERN_SPEEDS = {
    "NORMAL": [30, 30, 30],
    "FAST": [15, 15, 15],
    "SLOW": [60, 60],
    "BOSS": [40, 20, 40]
};
