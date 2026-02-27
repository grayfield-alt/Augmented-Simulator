export const PLAYER_CONFIG = {
    INITIAL_HP: 100,
    INITIAL_ATK: 50,
    INITIAL_DEF: 0,
    INITIAL_AP: 0,
    RADIUS: 30,
    PARRY_STANCE_DURATION: 21,
    DASH_DURATION: 50, // 회피 지속 시간 (리턴 없음)
    PERFECT_WINDOW: 8,
    ATTACK_DURATION: 15,
    RETURN_DURATION: 20,
    K: 50 // Defense constant
};

export const MONSTER_CONFIG = {
    BASE_RADIUS: 25,
    BOSS_RADIUS: 60,
    PATTERN_SPEEDS: {
        VERY_FAST: 30, // 0.25s (극한의 반응 속도)
        FAST: 40,      // 0.33s (숙련자 반응 속도)
        NORMAL: 60,    // 0.50s (표준)
        SLOW: 90       // 0.75s (여유)
    }
};

export const AUGMENT_DATA = {
    "Common": [
        { id: "c1", name: "날카로움", desc: "공격력 ×1.10", effect: p => p.augBuffs.atk *= 1.1 },
        { id: "c2", name: "축적된 분노", desc: "강타 공격력 ×1.20", effect: p => p.augBuffs.heavy *= 1.2 },
        { id: "c3", name: "회전 가속", desc: "회전베기 공격력 ×1.15", effect: p => p.augBuffs.spin *= 1.15 },
        { id: "c4", name: "정밀 방어", desc: "패링 성공 시 AP +1 (턴당 1회)", effect: p => p.augBuffs.parryAp += 1 },
        { id: "c5", name: "연속 호흡", desc: "전투 시작 시 AP +2", effect: p => p.augBuffs.startAp += 2 },
        { id: "c6", name: "처형 본능", desc: "대상 HP 30% 이하일 때 공격력 ×1.15", effect: p => p.augBuffs.executeLow = 0.3 },
        { id: "c7", name: "약점 파악", desc: "같은 적 연속 공격 시 2타부터 공격력 ×1.10", effect: p => p.augBuffs.stackAtk = 0.1 },
        { id: "c8", name: "철갑 분쇄", desc: "강타 적중 시 다음 턴 첫 공격 공격력 ×1.15", effect: p => p.augBuffs.heavySunder = 0.15 },
        { id: "c9", name: "피의 회수", desc: "적 처치 시 AP +1 (턴당 2회)", effect: p => p.augBuffs.killAp += 1 },
        { id: "c10", name: "집중력", desc: "퍼펙트 패링 성공 시 다음 공격력 ×1.20", effect: p => p.augBuffs.perfectFocus = 0.20 }
    ],
    "Epic": [
        { id: "e1", name: "약점 해부", desc: "같은 적 연속 공격 시 공격력 ×1.06 (최대 5중첩)", effect: p => p.augBuffs.stackAtkEpic = 0.06 },
        { id: "e2", name: "과열 타격", desc: "강타 사용 후 다음 턴 첫 공격 공격력 ×1.35", effect: p => p.augBuffs.heavyOverheat = 0.35 },
        { id: "e3", name: "원심 폭발", desc: "회전베기 공격력 ×1.25 / 처치 시 AP +1", effect: p => { p.augBuffs.spin *= 1.25; p.augBuffs.spinKillAp += 1; } },
        { id: "e4", name: "완벽한 리듬", desc: "퍼펙트 패링 시 이번 턴 공격력 ×1.20", effect: p => p.augBuffs.turnAtkPerf = 0.2 },
        { id: "e5", name: "초반 가속", desc: "전투 시작 시 AP +3 / 첫 턴 공격력 ×1.10", effect: p => { p.augBuffs.startAp += 3; p.augBuffs.startTurnAtk = 0.1; } },
        { id: "e6", name: "피의 수확", desc: "적 처치 시 공격력 ×1.04 (최대 10중첩)", effect: p => p.augBuffs.killStackAtk = 0.04 },
        { id: "e7", name: "단두의 각", desc: "적 HP 30% 이하일 때 강타 공격력 ×1.40", effect: p => p.augBuffs.heavyExecute = 0.4 },
        { id: "e8", name: "침착한 폭력", desc: "현재 AP 가 0~2일 때 공격력 ×1.18", effect: p => p.augBuffs.lowApAtk = 1.18 },
        { id: "e9", name: "관성 베기", desc: "기본 공격 사용 시 다음 턴 첫 공격 공격력 ×1.15", effect: p => p.augBuffs.inertiaSlice = 0.15 },
        { id: "e10", name: "파괴의 맥박", desc: "매 턴 첫 공격 공격력 ×1.15 (강타라면 x1.25)", effect: p => p.augBuffs.firstAtkMult = 0.15 }
    ],
    "Unique": [
        { id: "u1", name: "검성의 서약", desc: "모든 스킬 공격력 ×1.20", effect: p => { p.augBuffs.atk *= 1.2; p.augBuffs.spin *= 1.2; p.augBuffs.heavy *= 1.2; } },
        { id: "u2", name: "큰 한 방", desc: "강타 공격력 ×1.60 / 강타 처치 시 AP +2", effect: p => { p.augBuffs.heavy *= 1.6; p.augBuffs.heavyKillAp += 2; } },
        { id: "u3", name: "폭풍의 중심", desc: "회전베기 공격력 ×1.50 / 적 2마리 이상 시 추가 x1.1", effect: p => { p.augBuffs.spin *= 1.5; p.augBuffs.spinMultiTarget = 0.1; } },
        { id: "u4", name: "무한 템포", desc: "전투 시작 AP +4 / 퍼펙트 패링 시 AP +1 (턴당 2)", effect: p => { p.augBuffs.startAp += 4; p.augBuffs.perfectApBonus += 1; } },
        { id: "u5", name: "피의 엔진", desc: "적 처치 시 공격력 ×1.06 (무제한) / 피격 피해 x1.1", effect: p => { p.augBuffs.unlimitKillAtk = 0.06; p.augBuffs.takeDmgMult *= 1.1; } },
        { id: "u6", name: "결투가", desc: "적 1마리일 때 공격력 ×1.35 / 강타 추가 x1.15", effect: p => { p.augBuffs.soloAtk = 0.35; p.augBuffs.soloHeavy = 0.15; } },
        { id: "u7", name: "집행인의 판결", desc: "적 HP 40% 이하 시 Atk x1.25 / 강타 추가 x1.2", effect: p => { p.augBuffs.executeAll = 0.25; p.augBuffs.heavyExecAll = 0.2; } },
        { id: "u8", name: "연쇄 분쇄", desc: "강타 연속 사용(연속 턴) 시 공격력 ×1.50", effect: p => p.augBuffs.heavyChain = 0.5 },
        { id: "u9", name: "정점의 호흡", desc: "턴 시작 시 AP 5 이상이면 공격력 ×1.25", effect: p => p.augBuffs.highApBuff = 0.25 },
        { id: "u10", name: "완전무결", desc: "퍼펙트 패링 당 Atk x1.08 (최대 3) / 피격 시 소멸", effect: p => p.augBuffs.perfStackBuff = 0.08 }
    ]
};

export const WAVE_DATA = {
    1: [
        { type: "Standard Soldier", hp: 100, atk: 10, y: 150, patterns: { steps: [{ type: "TELEGRAPH", duration: 60, action: "ATTACK" }] } },
        { type: "Fast Scout", hp: 80, atk: 12, y: 350, patterns: { steps: [{ type: "TELEGRAPH", duration: 40, action: "ATTACK" }, { type: "TELEGRAPH", duration: 40, action: "ATTACK" }] } }
    ],
    2: [
        { type: "Heavy Guard", hp: 200, atk: 15, y: 150, patterns: { steps: [{ type: "TELEGRAPH", duration: 80, action: "ATTACK", damageMult: 1.2 }] } },
        { type: "Agile Assasin", hp: 100, atk: 8, y: 350, patterns: { steps: [{ type: "TELEGRAPH", duration: 30, action: "ATTACK" }, { type: "TELEGRAPH", duration: 30, action: "ATTACK" }, { type: "TELEGRAPH", duration: 30, action: "ATTACK" }] } }
    ],
    3: { type: "EVENT" },
    4: [
        { type: "Elite Unit A", hp: 150, atk: 12, y: 100, patterns: { steps: [{ type: "TELEGRAPH", duration: 45, action: "ATTACK" }, { type: "TELEGRAPH", duration: 60, action: "ATTACK" }] } },
        { type: "Elite Unit B", hp: 150, atk: 12, y: 250, patterns: { steps: [{ type: "TELEGRAPH", duration: 60, action: "ATTACK" }, { type: "TELEGRAPH", duration: 45, action: "ATTACK" }] } },
        { type: "Elite Unit C", hp: 200, atk: 10, y: 400, patterns: { steps: [{ type: "TELEGRAPH", duration: 90, action: "ATTACK", damageMult: 1.5 }] } }
    ],
    5: [
        { type: "Shadow Master", hp: 300, atk: 15, y: 225, patterns: { steps: [{ type: "TELEGRAPH", duration: 40, action: "ATTACK" }, { type: "TELEGRAPH", duration: 30, action: "ATTACK" }, { type: "TELEGRAPH", duration: 20, action: "ATTACK" }, { type: "TELEGRAPH", duration: 60, action: "ATTACK", damageMult: 2.0 }] } }
    ],
    6: [
        {
            type: "BOSS", hp: 1200, atk: 18, y: 225,
            multiPatterns: [
                {
                    id: "phase1",
                    steps: [
                        { type: "TELEGRAPH", duration: 60, action: "ATTACK" },
                        { type: "TELEGRAPH", duration: 45, action: "ATTACK" },
                        { type: "TELEGRAPH", duration: 30, action: "ATTACK" }
                    ]
                },
                {
                    id: "heavy_slam",
                    steps: [
                        { type: "TELEGRAPH", duration: 90, action: "ATTACK", damageMult: 2.5, unparriable: true }
                    ]
                },
                {
                    id: "fury_swipes",
                    steps: [
                        { type: "TELEGRAPH", duration: 25, action: "ATTACK" },
                        { type: "TELEGRAPH", duration: 25, action: "ATTACK" },
                        { type: "TELEGRAPH", duration: 25, action: "ATTACK" },
                        { type: "TELEGRAPH", duration: 25, action: "ATTACK" }
                    ]
                }
            ]
        }
    ],
    7: [
        {
            type: "ANCIENT DRAGON", hp: 3000, atk: 30, y: 225,
            multiPatterns: [
                ["SLOW", "NORMAL", "FAST"], // Tail swipe -> Claw -> Bite
                ["FAST", "FAST", "NORMAL"], // Double claw -> Slam
                ["SLOW", "SLOW", "SLOW"],   // Heavy stomp sequence
                ["FAST", "NORMAL", "FAST", "NORMAL", "SLOW"] // Frenzy
            ]
        }
    ]
};
