export interface MonsterTemplate {
  id: string;
  name: string;
  hp: number;
  atk: number;
  telegraph: number;
  postdelay: number;
  hitstop: number;
  isDefault?: boolean;
}

export const MONSTER_LIBRARY: MonsterTemplate[] = [
  { id: "mon_tuto_1", name: "나무 허수아비", hp: 120, atk: 10, telegraph: 1.5, postdelay: 1.2, hitstop: 3, isDefault: true },
  { id: "mon_tuto_2", name: "육중한 갑옷병", hp: 200, atk: 15, telegraph: 1.2, postdelay: 1.0, hitstop: 4, isDefault: true },
  { id: "mon_swarm_1", name: "그림자 슬라임", hp: 80, atk: 8, telegraph: 1.0, postdelay: 0.8, hitstop: 2, isDefault: true },
  { id: "mon_swarm_2", name: "떠도는 불꽃", hp: 60, atk: 12, telegraph: 0.9, postdelay: 1.2, hitstop: 2, isDefault: true },
  { id: "mon_elite_1", name: "침묵의 집행자", hp: 600, atk: 22, telegraph: 0.8, postdelay: 1.0, hitstop: 5, isDefault: true },
  { id: "mon_boss_1", name: "부활한 사자왕", hp: 2500, atk: 40, telegraph: 0.65, postdelay: 1.3, hitstop: 8, isDefault: true },
];

export const WAVE_DATA: Record<number, string[]> = {
  1: ["mon_tuto_1"],
  2: ["mon_tuto_2"],
  4: ["mon_swarm_1", "mon_swarm_1"],
  5: ["mon_swarm_2", "mon_swarm_2", "mon_swarm_2"],
  6: ["mon_elite_1"],
  10: ["mon_boss_1"]
};

export const PATTERN_SPEEDS = {
  "FAST": 40,
  "NORMAL": 60,
  "SLOW": 90
};
