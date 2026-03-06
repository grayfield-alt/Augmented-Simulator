
        /**
         * [SAFETY NET] 오류 오버레이 시스템
         * 전역 에러를 포착하여 화면 상단에 즉시 노출 (조용히 망가지기 금지)
         */
        window.onerror = function (msg, url, lineNo, columnNo, error) {
            const overlay = document.getElementById('error-overlay');
            const msgEl = document.getElementById('error-msg');
            const stackEl = document.getElementById('error-stack');
            if (overlay && msgEl) {
                overlay.style.display = 'block';
                msgEl.innerText = `${msg} (Line: ${lineNo})`;
                if (stackEl && error) stackEl.innerText = error.stack;
            }
            return false;
        };

        // --- LAYER 1: UI SELECTORS & MUSTGET GUARD ---
        const UI_ENGINE = {
            SELECTORS: {
                lobby: 'lobby-overlay',
                battleScreen: 'battle-screen',
                overlayAug: 'augment-overlay',
                overlayEvent: 'event-overlay',
                overlayGameOver: 'game-over-overlay',
                inventory: 'inventory-overlay',
                stageEditor: 'stage-editor-overlay',
                overlayGuide: 'guide-overlay',
                hp: 'p-hp',
                atk: 'p-atk',
                def: 'p-def',
                ap: 'p-ap',
                msg: 'message',
                turn: 'turn-indicator-overlay', // [FIX] ID 정합성 확보
                vignette: 'vignette',
                hitIcons: 'hit-icons-container',
                btnReroll: 'btn-reroll',
                btnAtk: 'btn-atk',
                btnSpin: 'btn-spin',
                btnHeavy: 'btn-heavy',
                btnEnd: 'btn-end',
                canvas: 'gameCanvas' // [NEW] 캔버스 ID 중앙 관리
            },

            /**
             * [SAFETY NET] mustGet 가드
             * 요소가 없으면 즉시 에러를 발생시켜 오버레이 노출
             */
            mustGet(id) {
                const el = document.getElementById(id);
                if (!el) throw new Error(`CRITICAL UI ELEMENT MISSING: ${id}`);
                return el;
            }
        };

        // --- LAYER 1.5: CORE RENDERER SETUP ---
        // 기존 전역 코드와의 호환성을 위해 canvas/ctx 전역 선언 유지 (Safety Guarded)
        const canvas = UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.canvas);
        const ctx = canvas.getContext('2d');
        let CANVAS_W = 400;
        let CANVAS_H = 700;

        // --- LAYER 2: GAME_CORE (PURE LOGIC) ---
        // 브라우저 API 접근 금지 규약 준수
        const GAME_CORE = {
            CONFIG: {
                FPS: 60, PARRY_STANCE_DURATION: 21, PERFECT_WINDOW: 8,
                ATTACK_DURATION: 15, RETURN_DURATION: 20, REACTION_WINDOW: 26, K: 50
            },

            // 증강 데이터 (한글)
            AUGMENT_DATA: {
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
            },

            getInitialState() {
                return {
                    gameStarted: false,
                    currentTurn: "NONE",
                    currentRound: 1,
                    player: {
                        hp: 80, maxHp: 80, atk: 45, def: 5, ap: 0, maxAp: 10,
                        isParrying: false, parryTimer: 0, dashTimer: 0,
                        actionsUsed: { atk: false, spin: false, heavy: false }
                    },
                    monsters: [],
                    history: [] // 액션 로그
                };
            }
        };

        // --- LAYER 3: APP_STORE (STATE MANAGEMENT) ---
        const APP_STORE = {
            state: GAME_CORE.getInitialState(),
            subscribers: [],

            dispatch(action) {
                // 이력 저장
                this.state.history.push({ time: Date.now(), action });
                if (this.state.history.length > 10) this.state.history.shift();

                // 리듀서 로직 (리팩터링 시 분리 가능)
                // 현재는 기존 전역 변수 구조를 점진적으로 이전 중
                this.notify();
            },

            notify() {
                this.subscribers.forEach(fn => {
                    try {
                        fn(this.state);
                    } catch (e) {
                        // [SAFETY NET] UI 업데이트 실패 시에도 코어는 계속 진행
                        console.error("UI Update Failed but core continues:", e);
                    }
                });
            }
        };

        // 기존 전역 변수들은 리팩터링 완료 전까지 순차적으로 객체로 이전됩니다.
        // 현재 기존 로직의 프리징 원인인 ID 참조 부분만 우선 수정하여 정상화를 보장합니다.

        // ... (기존 함수의 로직은 유지하되 UI_ENGINE.mustGet을 사용하도록 수정 중)

        const Player = {
            x: 200,
            y: 600,
            radius: 42,
            hp: 100,
            maxHp: 100,
            atk: 50,
            def: 0,
            ap: 0,
            color: "#4a9eff",
            parryTimer: 0,
            isParrying: false,
            dashTimer: 0,
            ghosts: [],
            actionsUsed: { atk: false, spin: false, heavy: false },
            augBuffs: {
                atk: 1.0, spin: 1.0, heavy: 1.0, parryAp: 0, startAp: 0,
                executeLow: 0, stackAtk: 0, heavySunder: 0, killAp: 0, perfectFocus: 0,
                stackAtkEpic: 0, heavyOverheat: 0, spinKillAp: 0, turnAtkPerf: 0,
                startTurnAtk: 0, killStackAtk: 0, heavyExecute: 0, lowApAtk: 1.0,
                inertiaSlice: 0, firstAtkMult: 0, heavyKillAp: 0, spinMultiTarget: 0,
                perfectApBonus: 0, unlimitKillAtk: 0, takeDmgMult: 1.0,
                soloAtk: 0, soloHeavy: 0, executeAll: 0, heavyExecAll: 0,
                heavyChain: 0, highApBuff: 0, perfStackBuff: 0
            },
            state: {
                killsThisTurn: 0, parryApGained: 0, isPrefGainedThisTurn: false,
                consecutiveTarget: null, consecutiveCount: 0,
                heavyUsedLastTurn: false, heavyHitThisTurn: false,
                perfFocusActive: false, perfParryThisTurn: false,
                killStacks: 0, unlimitKills: 0, firstAttackThisTurn: true,
                perfStacks: 0, multiAtkCount: 0, heavyLastTurn: false,
                atkUsedLastTurn: false
            },
            activeAugments: []
        };

        let rerollAvailable = true;
        let currentAugTier = "Common";
        let forcedTier = null;

        function showAugmentSelection(tier = null) {
            currentTurn = "NONE";
            updateInterfaceVisibility();
            ui.overlayAug.style.display = "flex";
            rerollAvailable = true;
            ui.btnReroll.disabled = false;
            ui.btnReroll.innerText = "Reroll (1 Remaining)";

            if (tier) {
                currentAugTier = tier;
                forcedTier = tier;
            } else {
                forcedTier = null;
                const rand = Math.random();
                if (rand < 0.05) currentAugTier = "Unique";
                else if (rand < 0.30) currentAugTier = "Epic";
                else currentAugTier = "Common";
            }

            rollAugments();
        }

        function rollAugments() {
            try {
                const list = GAME_CORE.AUGMENT_DATA[currentAugTier];
                if (!list) throw new Error(`INVALID AUGMENT TIER: ${currentAugTier}`);

                const shuffled = [...list].sort(() => 0.5 - Math.random()).slice(0, 3);
                const container = document.getElementById('augment-cards');
                if (!container) throw new Error("AUGMENT CARDS CONTAINER MISSING");

                container.innerHTML = "";
                shuffled.forEach(aug => {
                    const card = document.createElement('div');
                    card.className = `augment-card tier-${currentAugTier.toLowerCase()}`;
                    card.innerHTML = `<h3>${aug.name}</h3><p style="color:#aaa; font-size:12px; margin:5px 0;">${currentAugTier}</p><p>${aug.desc}</p>`;
                    card.setAttribute('style', 'display: flex !important; flex-direction: column !important; width: 100% !important; cursor: pointer !important; margin: 0 0 12px 0 !important; padding: 20px !important; border-radius: 16px !important; background: rgba(255, 255, 255, 0.03) !important; border: 1px solid var(--glass-border) !important; z-index: 99999 !important;');
                    card.onclick = () => selectAugment(aug);
                    container.appendChild(card);
                });
            } catch (e) {
                console.error("Critical error in rollAugments:", e);
                // 강제 복구: 로비로 이동하거나 게임 재시작 유도 가능
            }
        }

        function selectAugment(aug) {
            aug.effect(Player);
            Player.activeAugments.push(aug);
            ui.overlayAug.style.display = "none";

            if (currentRound === 3) {
                currentRound = 4;
                spawnWave(4);
            } else {
                spawnWave(currentRound);
            }
        }

        function rerollAugments() {
            if (!rerollAvailable) return;
            rerollAvailable = false;
            ui.btnReroll.disabled = true;
            ui.btnReroll.innerText = "Reroll (0 Remaining)";
            rollAugments();
        }

        class Monster {
            constructor(type, hp, atk, telegraph, postdelay, hitstop) {
                this.type = type;
                this.homeX = 0; this.homeY = 0; // Will be set by spawnWave
                this.x = 0; this.y = 0;
                this.radius = 50;
                this.color = type.includes("BOSS") ? "#ff0000" : "#ff4a4a";
                this.hp = hp; this.maxHp = hp; this.atk = atk;
                this.state = "IDLE"; this.timer = 0;
                // Default patterns for custom monsters
                this.patterns = [{ hits: [PATTERN_SPEEDS["NORMAL"]] }];
                if (type.includes("BOSS")) {
                    this.patterns = [
                        { hits: [PATTERN_SPEEDS["NORMAL"], PATTERN_SPEEDS["FAST"], PATTERN_SPEEDS["SLOW"]] },
                        { hits: [PATTERN_SPEEDS["FAST"], PATTERN_SPEEDS["NORMAL"], PATTERN_SPEEDS["FAST"], PATTERN_SPEEDS["SLOW"]] },
                        { hits: [PATTERN_SPEEDS["SLOW"], PATTERN_SPEEDS["NORMAL"], PATTERN_SPEEDS["FAST"]] }
                    ];
                }
                this.currentPatternIdx = 0;
                this.currentPattern = this.patterns[0];
                this.patternStep = 0;
                this.settings = {
                    telegraphMult: telegraph,
                    postDelayMult: postdelay,
                    variance: 0,
                    hitStop: hitstop
                };
            }
            nextPattern() {
                this.currentPatternIdx = (this.currentPatternIdx + 1) % this.patterns.length;
                this.currentPattern = this.patterns[this.currentPatternIdx];
                this.patternStep = 0;
            }
        }

        const WAVE_DATA = {
            1: [
                { type: "Enemy 1", hp: 100, atk: 10, patterns: ["NORMAL"] },
                { type: "Enemy 2", hp: 100, atk: 15, patterns: ["NORMAL", "FAST"] }
            ],
            2: [
                { type: "Enemy A", hp: 80, atk: 9, patterns: ["FAST"] },
                { type: "Enemy B", hp: 120, atk: 12, patterns: ["NORMAL", "SLOW"] }
            ],
            3: [], // Event Round
            4: [
                { type: "Enemy A", hp: 150, atk: 15, patterns: ["FAST"] },
                { type: "Enemy B", hp: 180, atk: 18, patterns: ["NORMAL", "FAST"] },
                { type: "Enemy C", hp: 220, atk: 20, patterns: ["NORMAL", "FAST", "SLOW"] }
            ],
            5: [
                { type: "Enemy A", hp: 120, atk: 15, patterns: ["FAST"] },
                { type: "Enemy B", hp: 150, atk: 18, patterns: ["NORMAL"] },
                { type: "Enemy C", hp: 200, atk: 22, patterns: ["NORMAL", "FAST"] },
                { type: "Enemy D", hp: 250, atk: 25, patterns: ["NORMAL", "FAST", "SLOW"] }
            ],
            6: [
                {
                    type: "BOSS", hp: 1200, atk: 30,
                    multiPatterns: [
                        ["NORMAL", "FAST", "SLOW"],
                        ["FAST", "NORMAL", "FAST", "SLOW"],
                        ["SLOW", "NORMAL", "FAST"]
                    ]
                }
            ],
            7: [{ type: "ANCIENT DRAGON", hp: 3500, atk: 45, patterns: ["NORMAL", "FAST", "FAST", "SLOW"] }],
            8: [{ type: "Rhythm Crasher", hp: 1500, atk: 25, patterns: ["SLOW", "SLOW", "FAST"] }],
            9: [{ type: "Cymbals Duo", hp: 1800, atk: 20, patterns: ["FAST", "FAST", "NORMAL"] }],
            10: [{ type: "Fake Knight", hp: 2500, atk: 35, patterns: ["SLOW", "SLOW", "NORMAL"] }]
            // Note: WAVE_DATA is now only used if customStages is empty for a round.
            // The Monster constructor now handles pattern assignment based on type.
        };

        // --- LAYER 4: UI INITIALIZATION & SYNC ---
        // 소실된 'ui' 객체를 UI_ENGINE.SELECTORS와 mustGet을 사용해 재구축 (한글)
        const ui = {
            lobby: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.lobby),
            battleScreen: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.battleScreen),
            overlayAug: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.overlayAug),
            overlayEvent: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.overlayEvent),
            overlayGameOver: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.overlayGameOver),
            inventory: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.inventory),
            stageEditor: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.stageEditor),
            overlayGuide: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.overlayGuide),
            hp: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.hp),
            atk: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.atk),
            def: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.def),
            ap: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.ap),
            msg: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.msg),
            turn: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.turn),
            vignette: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.vignette),
            hitIcons: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.hitIcons),
            btnReroll: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.btnReroll),
            btns: {
                atk: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.btnAtk),
                spin: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.btnSpin),
                heavy: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.btnHeavy),
                end: UI_ENGINE.mustGet(UI_ENGINE.SELECTORS.btnEnd)
            }
        };

        const CONFIG = GAME_CORE.CONFIG;

        // UI 캐싱 필드 (불필요한 DOM 접근 방지) (한글)
        const uiCache = {
            hp: -1, atk: -1, def: -1, ap: -1, turn: "",
            atkBtn: null, spinBtn: null, heavyBtn: null, endBtn: null
        };

        const PATTERN_SPEEDS = {
            "FAST": 40,
            "NORMAL": 60,
            "SLOW": 90
        };

        let monsters = [];
        let currentTurn = "NONE";
        let currentMonsterIndex = 0;
        let isTargeting = false;
        let selectedSkill = null; // "atk", "spin", "heavy"
        let damageTexts = []; // {x, y, text, timer, color}
        let currentRound = 1;
        let isEndingTurnAutomatically = false;
        let gameStarted = false;
        let roundStartTimer = 0;
        let lastTimestamp = 0;

        let monsterSettings = {
            telegraphMult: 1.0,
            postDelayMult: 1.0,
            variance: 0,
            hitStop: 3
        };
        let hitStopTimer = 0;

        // --- Editor State & Storage ---
        let monsterLibrary = []; // {id, name, hp, atk, telegraph, postdelay, hitstop}
        let customStages = { // round -> [monsterIds]
            1: [], 2: [], 4: [], 5: [], 6: []
        };
        let editingMonsterId = null;

        function loadFromStorage() {
            const savedLib = localStorage.getItem('monster_library');
            const savedStages = localStorage.getItem('custom_stages');
            if (savedLib) monsterLibrary = JSON.parse(savedLib);
            if (savedStages) customStages = JSON.parse(savedStages);
            renderLibrary();
            renderStageEditor();
        }

        function saveToStorage() {
            localStorage.setItem('monster_library', JSON.stringify(monsterLibrary));
            localStorage.setItem('custom_stages', JSON.stringify(customStages));
            showFeedback("전체 저장 완료!", "#4ade80");
        }

        // --- Editor UI Logic ---
        function toggleEditor(show) {
            document.getElementById('editor-overlay').style.display = show ? "flex" : "none";
            if (show) {
                gameStarted = false;
                renderLibrary();
                renderStageEditor();
            } else if (!gameStarted && !ui.lobby.style.display.includes("flex")) {
                // If we closed editor and not in game, show lobby
                ui.lobby.style.display = "flex";
            }
        }

        function openMonsterCreator(id = null) {
            editingMonsterId = id;
            const panel = document.getElementById('monster-creator-panel');
            panel.style.display = 'block';

            if (id) {
                const m = monsterLibrary.find(x => x.id === id);
                document.getElementById('creator-title').innerText = "🛠️ 몬스터 수정";
                document.getElementById('lib-name').value = m.name;
                document.getElementById('lib-hp').value = m.hp;
                document.getElementById('lib-atk').value = m.atk;
                document.getElementById('lib-telegraph').value = m.telegraph;
                document.getElementById('lib-postdelay').value = m.postdelay;
                document.getElementById('lib-hitstop').value = m.hitstop;

                document.getElementById('lib-val-telegraph').innerText = m.telegraph;
                document.getElementById('lib-val-postdelay').innerText = m.postdelay;
                document.getElementById('lib-val-hitstop').innerText = m.hitstop;
            } else {
                document.getElementById('creator-title').innerText = "🛠️ 신규 몬스터 생성";
                document.getElementById('lib-name').value = "신규 몬스터";
                document.getElementById('lib-hp').value = 100;
                document.getElementById('lib-atk').value = 10;
                document.getElementById('lib-telegraph').value = 1.0;
                document.getElementById('lib-postdelay').value = 1.0;
                document.getElementById('lib-hitstop').value = 3;

                document.getElementById('lib-val-telegraph').innerText = "1.0";
                document.getElementById('lib-val-postdelay').innerText = "1.0";
                document.getElementById('lib-val-hitstop').innerText = "3";
            }
        }

        function confirmMonsterSave() {
            const mData = {
                id: editingMonsterId || Date.now().toString(),
                name: document.getElementById('lib-name').value,
                hp: parseInt(document.getElementById('lib-hp').value),
                atk: parseInt(document.getElementById('lib-atk').value),
                telegraph: parseFloat(document.getElementById('lib-telegraph').value),
                postdelay: parseFloat(document.getElementById('lib-postdelay').value),
                hitstop: parseInt(document.getElementById('lib-hitstop').value)
            };

            if (editingMonsterId) {
                const idx = monsterLibrary.findIndex(x => x.id === editingMonsterId);
                monsterLibrary[idx] = mData;
            } else {
                monsterLibrary.push(mData);
            }

            document.getElementById('monster-creator-panel').style.display = 'none';
            renderLibrary();
        }

        function deleteMonster(id) {
            if (!confirm("이 몬스터를 삭제하시겠습니까?")) return;
            monsterLibrary = monsterLibrary.filter(x => x.id !== id);
            // Remove from stages too
            for (let r in customStages) {
                customStages[r] = customStages[r].filter(mid => mid !== id);
            }
            renderLibrary();
            renderStageEditor();
        }

        function renderLibrary() {
            const list = document.getElementById('monster-library-list');
            if (monsterLibrary.length === 0) {
                list.innerHTML = '<p style="opacity:0.5; font-size:12px;">저장된 몬스터가 없습니다.</p>';
                return;
            }
            list.innerHTML = monsterLibrary.map(m => `
                <div class="monster-list-item">
                    <span><b>${m.name}</b> (HP:${m.hp} ATK:${m.atk})</span>
                    <div>
                        <button class="btn-sm action-str" onclick="addMonsterToStagePrompt('${m.id}')">배치</button>
                        <button class="btn-sm action-atk" onclick="openMonsterCreator('${m.id}')">수정</button>
                        <button class="btn-sm guide-close-btn" onclick="deleteMonster('${m.id}')">삭제</button>
                    </div>
                </div>
            `).join('');
        }

        function addMonsterToStagePrompt(monsterId) {
            const round = prompt("배치할 라운드를 입력하세요 (1, 2, 4, 5, 6)", "1");
            if (customStages[round]) {
                customStages[round].push(monsterId);
                renderStageEditor();
            } else if (round !== null) {
                alert("유효한 라운드가 아닙니다.");
            }
        }

        function removeFromStage(round, index) {
            customStages[round].splice(index, 1);
            renderStageEditor();
        }

        function renderStageEditor() {
            const list = document.getElementById('stage-editor-list');
            let html = '';
            for (let r of [1, 2, 4, 5, 6]) {
                const mIds = customStages[r] || [];
                html += `
                    <div class="stage-box">
                        <div style="font-weight:bold; color:#4db8ff; margin-bottom:5px;">Round ${r}</div>
                        <div id="stage-${r}-monsters">
                            ${mIds.map((id, idx) => {
                    const m = monsterLibrary.find(x => x.id === id);
                    return m ? `<span class="stage-monster-pill">${m.name} <span style="margin-left:5px; cursor:pointer; color:#ff4a4a;" onclick="removeFromStage(${r}, ${idx})">×</span></span>` : '';
                }).join('')}
                            ${mIds.length === 0 ? '<span style="opacity:0.3; font-size:11px;">배치된 몬스터 없음</span>' : ''}
                        </div>
                    </div>
                `;
            }
            list.innerHTML = html;
        }

        function toggleGuide(show) {
            ui.overlayGuide.style.display = show ? "flex" : "none";
        }

        function gameOver() {
            gameStarted = false;
            ui.overlayGameOver.style.display = "flex";
        }

        function retryGame() {
            // 초기화
            Player.hp = 100;
            Player.ap = 0;
            Player.activeAugments = [];
            Player.augBuffs = {
                atk: 1.0, spin: 1.0, heavy: 1.0, parryAp: 0, startAp: 0,
                executeLow: 0, stackAtk: 0, heavySunder: 0, killAp: 0, perfectFocus: 0,
                stackAtkEpic: 0, heavyOverheat: 0, spinKillAp: 0, turnAtkPerf: 0,
                startTurnAtk: 0, killStackAtk: 0, heavyExecute: 0, lowApAtk: 1.0,
                inertiaSlice: 0, firstAtkMult: 0, heavyKillAp: 0, spinMultiTarget: 0,
                perfectApBonus: 0, unlimitKillAtk: 0, takeDmgMult: 1.0,
                soloAtk: 0, soloHeavy: 0, executeAll: 0, heavyExecAll: 0,
                heavyChain: 0, highApBuff: 0, perfStackBuff: 0
            };
            Player.state = {
                killsThisTurn: 0, parryApGained: 0, isPrefGainedThisTurn: false,
                consecutiveTarget: null, consecutiveCount: 0,
                heavyUsedLastTurn: false, heavyHitThisTurn: false,
                perfFocusActive: false, perfParryThisTurn: false,
                killStacks: 0, unlimitKills: 0, firstAttackThisTurn: true,
                perfStacks: 0, multiAtkCount: 0, heavyLastTurn: false,
                atkUsedLastTurn: false
            };
            currentRound = 1;
            ui.overlayGameOver.style.display = "none";
            startGame();
        }

        function startGame() {
            // 1. 전투 화면 컨테이너를 먼저 표시
            ui.battleScreen.classList.remove('hidden');
            ui.battleScreen.classList.add('flex');
            ui.lobby.classList.add('hidden');

            // 2. 레이아웃 확정 후 캔버스 리사이징 및 좌표 초기화
            resizeCanvas();

            gameStarted = true;
            lastTimestamp = performance.now();
            spawnWave(currentRound);
            requestAnimationFrame(gameLoop);
        }

        function spawnWave(round) {
            currentTurn = "NONE";
            updateInterfaceVisibility();

            // 상점/이벤트 구간 (3, 7, 12, 16 스테이지)
            const eventRounds = [3, 7, 12, 16];
            if (eventRounds.includes(round)) {
                showEventOverlay();
                return;
            }

            // [개선] 몬스터 정렬 및 배치 로직
            monsters = [];
            let ids = customStages[round];

            // 데이터가 없는 스테이지라면 이전 데이터 재활용 또는 폴백
            if (!ids || ids.length === 0) {
                if (round > 20) {
                    showFeedback("🎉 모든 구역 정복!", "#FFD700");
                    gameStarted = false;
                    return;
                }
                ids = ["mon_tuto_1"];
            }

            let count = ids.length;

            ids.forEach((id, i) => {
                let m = createMonsterFromId(id);
                if (!m) return;

                // X축 균등 배분 (Portrait 최적화: 겹침 방지)
                let xRatio = 0.5;
                if (count === 2) xRatio = (i === 0) ? 0.28 : 0.72;
                else if (count === 3) xRatio = [0.18, 0.5, 0.82][i];

                m.homeX = CANVAS_W * xRatio;
                m.homeY = CANVAS_H * 0.22;
                m.x = m.homeX;
                m.y = m.homeY;
                monsters.push(m);
            });

            showFeedback(`WAVE ${round}`, "#4db8ff");

            // 시뮬레이션용 로그 (상태 기록)
            console.log(`[SIM] WAVE ${round} Started. Monsters: ${count}`);

            currentMonsterIndex = 0;
            currentTurn = "PLAYER"; // 몬스터 배치 완료 후 플레이어 턴으로 시작
            Player.ap = Math.min(Player.maxAp, Player.ap + 3); // 턴 시작 AP 소폭 보정
            updateInterfaceVisibility();
        }

        function createMonsterFromId(id) {
            let libM = monsterLibrary.find(x => x.id === id);
            if (!libM) {
                const defaults = {
                    "mon_tuto_1": { name: "연습용 허수아비", hp: 100, atk: 10, telegraph: 1.2, postdelay: 1.0, hitstop: 3 },
                    "mon_tuto_2": { name: "강화 허수아비", hp: 150, atk: 12, telegraph: 1.0, postdelay: 1.0, hitstop: 3 },
                    "mon_boss_1": { name: "디-스톰파", hp: 1200, atk: 25, telegraph: 0.8, postdelay: 1.2, hitstop: 5 }
                };
                let d = defaults[id] || defaults["mon_tuto_1"];
                libM = { ...d };
            }
            // 밸런스 시트 반영 (스테이지 2 강화 허수아비 등)
            if (id === "mon_tuto_2") {
                libM.hp = 180;
                libM.atk = 24;
            } else if (id === "mon_boss_1") {
                libM.hp = 1500;
                libM.atk = 32;
            }
            return new Monster(libM.name, libM.hp, libM.atk, libM.telegraph, libM.postdelay, libM.hitstop);
        }

        function showEventOverlay() {
            currentTurn = "NONE";
            updateInterfaceVisibility();
            ui.overlayEvent.style.display = "flex";
        }

        function selectEventOption(option) {
            ui.overlayEvent.style.display = "none";
            if (option === 1) {
                showAugmentSelection("Common");
            } else {
                Player.hp = Math.min(Player.maxHp, Math.round(Player.hp + Player.maxHp * 0.35));
                showFeedback("Healed 35% HP", "#4f4");
                currentRound = 4;
                spawnWave(4);
            }
        }

        function winRound() {
            // 최종 보스 클리어 체크
            if (currentRound >= 20) {
                showFeedback("심연을 정복했습니다!", "#FFD700");
                gameStarted = false;
                return;
            }

            currentRound++;

            // 다음 라운드가 이벤트 라운드인지 확인
            const eventRounds = [3, 7, 12, 16];
            if (eventRounds.includes(currentRound)) {
                showEventOverlay();
            } else {
                showAugmentSelection();
            }
        }

        function openInventory() {
            ui.inventory.style.display = "flex";
            renderCompleteInventory();
        }

        function openStageEditor() {
            ui.stageEditor.style.display = "flex";
            renderFullStageEditor();
        }

        function closeOverlay(id) {
            document.getElementById(id).style.display = "none";
        }

        function renderCompleteInventory() {
            const list = document.getElementById('complete-inventory-list');

            // 1. Default Monsters from WAVE_DATA
            const defaults = [
                { id: "def_1", name: "Enemy 1 (Default)", hp: 100, atk: 10, telegraph: 1.0, postdelay: 1.0, hitstop: 3, isDefault: true },
                { id: "def_2", name: "Enemy 2 (Default)", hp: 100, atk: 10, telegraph: 1.0, postdelay: 1.0, hitstop: 3, isDefault: true },
                { id: "def_A", name: "Enemy A (Default)", hp: 80, atk: 9, telegraph: 1.0, postdelay: 1.0, hitstop: 3, isDefault: true },
                { id: "def_B", name: "Enemy B (Default)", hp: 120, atk: 8, telegraph: 1.0, postdelay: 1.0, hitstop: 3, isDefault: true },
                { id: "def_BOSS", name: "BOSS (Default)", hp: 780, atk: 12, telegraph: 1.0, postdelay: 1.0, hitstop: 3, isDefault: true }
            ];

            const allMonsters = [...defaults, ...monsterLibrary];

            list.innerHTML = allMonsters.map(m => `
                <div class="monster-card ${m.isDefault ? 'system' : 'custom'}">
                    <div class="monster-info">
                        <h4>${m.name}</h4>
                        <p>HP: ${m.hp} | ATK: ${m.atk} | TG: ${m.telegraph}x</p>
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn-sm action-str" onclick="addMonsterToStagePrompt('${m.id}')">배치</button>
                        ${!m.isDefault ? `
                            <button class="btn-sm action-atk" onclick="openMonsterCreator('${m.id}')">수정</button>
                            <button class="btn-sm guide-close-btn" onclick="deleteMonster('${m.id}')">삭제</button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }

        function renderFullStageEditor() {
            const container = document.getElementById('full-stage-list');
            let html = '';
            const rounds = [1, 2, 4, 5, 6];

            rounds.forEach(r => {
                const mIds = customStages[r] || [];
                html += `
                    <div class="stage-box" style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-weight:bold; color:#4db8ff; font-size: 18px;">Round ${r}</span>
                            <span style="font-size: 12px; color: #666;">탭하여 편집</span>
                        </div>
                        <div style="min-height: 40px; border: 1px dashed #333; padding: 10px; border-radius: 8px;">
                            ${mIds.map((id, idx) => {
                    // Find in library or defaults
                    let m = monsterLibrary.find(x => x.id === id);
                    if (!m) {
                        const defs = [
                            { id: "def_1", name: "Enemy 1" }, { id: "def_2", name: "Enemy 2" },
                            { id: "def_A", name: "Enemy A" }, { id: "def_B", name: "Enemy B" },
                            { id: "def_BOSS", name: "BOSS" }
                        ];
                        m = defs.find(x => x.id === id);
                    }
                    return m ? `
                                    <div class="stage-monster-pill">
                                        ${m.name} <span style="margin-left:8px; cursor:pointer; color:#ff4a4a; font-weight:bold;" onclick="removeFromStage(${r}, ${idx})">×</span>
                                    </div>
                                ` : '';
                }).join('')}
                            ${mIds.length === 0 ? '<div style="color:#444; font-size:12px; text-align:center;">배치된 몬스터가 없습니다.</div>' : ''}
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        function resetStagesToDefault() {
            if (!confirm("모든 스테이지 배치를 초기 상태로 되돌리시겠습니까?")) return;
            // --- 확장된 몬스터 라이브러리 (학습 -> 다수 -> 엘리트 -> 보스 순환용) ---
            const monsterLibrary = [
                // 1. 학습용 (단일)
                { id: "mon_tuto_1", name: "나무 허수아비", hp: 120, atk: 10, telegraph: 1.5, postdelay: 1.2, hitstop: 3 },
                { id: "mon_tuto_2", name: "녹슨 기갑병", hp: 200, atk: 15, telegraph: 1.2, postdelay: 1.0, hitstop: 4 },

                // 2. 다수 구성용 (약한 적들)
                { id: "mon_swarm_1", name: "그림자 슬라임", hp: 80, atk: 8, telegraph: 1.0, postdelay: 0.8, hitstop: 2 },
                { id: "mon_swarm_2", name: "떠도는 불꽃", hp: 60, atk: 12, telegraph: 0.9, postdelay: 1.2, hitstop: 2 },

                // 3. 엘리트 (단일/쌍)
                { id: "mon_elite_1", name: "침묵의 집행자", hp: 600, atk: 22, telegraph: 0.8, postdelay: 1.0, hitstop: 5 },
                { id: "mon_elite_2", name: "고대의 기사", hp: 850, atk: 28, telegraph: 0.7, postdelay: 1.1, hitstop: 6 },
                { id: "mon_elite_3", name: "광기어린 암살자", hp: 450, atk: 35, telegraph: 0.6, postdelay: 0.8, hitstop: 4 },

                // 4. 보스 급
                { id: "mon_boss_1", name: "폐허의 제왕", hp: 2500, atk: 40, telegraph: 0.65, postdelay: 1.3, hitstop: 8 },
                { id: "mon_boss_final", name: "심연의 지배자", hp: 5000, atk: 55, telegraph: 0.55, postdelay: 1.4, hitstop: 10 },

                // 5. 성장 체감용 (강한 단일몹)
                { id: "mon_growth_1", name: "거대 바위 골렘", hp: 1200, atk: 30, telegraph: 1.1, postdelay: 1.5, hitstop: 8 },
                { id: "mon_growth_2", name: "정예 방패병", hp: 1500, atk: 18, telegraph: 1.0, postdelay: 1.0, hitstop: 6 }
            ];

            // --- 순환형 난이도 스테이지 설계 (20단계 이상) ---
            let customStages = {
                1: ["mon_tuto_1"],                               // 1. 학습
                2: ["mon_tuto_2"],                               // 2. 학습 심화
                4: ["mon_swarm_1", "mon_swarm_1"],               // 4. 다수 (성장 시범)
                5: ["mon_swarm_2", "mon_swarm_2", "mon_swarm_2"],// 5. 다수 (분기)
                6: ["mon_elite_1"],                              // 6. 첫 엘리트
                7: ["mon_growth_1"],                             // 7. 성장 체감 (보너스 느낌)
                8: ["mon_swarm_1", "mon_swarm_2", "mon_elite_1"],// 8. 혼합 구성
                9: ["mon_elite_2"],                              // 9. 중간 보스급 엘리트
                10: ["mon_boss_1"],                              // 10. 1차 보스
                11: ["mon_growth_2"],                             // 11. 강화된 성장 체감 (강력해진 유저)
                12: ["mon_elite_1", "mon_elite_1"],               // 12. 엘리트 듀오
                13: ["mon_elite_2", "mon_elite_3"],               // 13. 엘리트 듀오 (변칙)
                14: ["mon_swarm_2", "mon_swarm_2", "mon_swarm_1"],// 14. 물량전
                15: ["mon_elite_3"],                              // 15. 속도형 엘리트
                16: ["mon_growth_1", "mon_growth_2"],             // 16. 거대 몹 듀오
                17: ["mon_elite_2", "mon_elite_2", "mon_elite_2"],// 17. 극한의 3인 엘리트
                18: ["mon_boss_1", "mon_elite_1"],                // 18. 보스 + 엘리트
                19: ["mon_growth_2"],                             // 19. 최종 결전 전 숨고르기
                20: ["mon_boss_final"]                            // 20. 최종 보스
            };
            localStorage.removeItem('custom_stages');
            renderFullStageEditor();
            showFeedback("초기화 완료!", "#4db8ff");
        }

        function startSkill(skill) {
            const alive = monsters.filter(m => m.hp > 0);
            if (alive.length === 0) return;

            // If only 1 target remains, auto-attack
            if (alive.length === 1) {
                if (skill === "atk") executeAttack(alive[0]);
                else if (skill === "heavy") executeHeavyStrike(alive[0]);
                return;
            }

            isTargeting = true;
            selectedSkill = skill;
            showFeedback("Select Target!", "#fff");
        }



        function handleTargeting(e) {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            monsters.forEach((m) => {
                const dist = Math.sqrt((mx - m.x) ** 2 + (my - m.y) ** 2);
                if (dist < m.radius * 2 && m.hp > 0) {
                    if (selectedSkill === "atk") executeAttack(m);
                    else if (selectedSkill === "heavy") executeHeavyStrike(m);
                    isTargeting = false;
                    selectedSkill = null;
                }
            });
        }

        function executeAttack(target) {
            if (Player.ap < 2) return;
            Player.ap -= 2;
            dealDamage(Player.atk, target, "normal");
            Player.actionsUsed.atk = true;
            Player.state.multiAtkCount++;
            updateUI();
        }

        function executeHeavyStrike(target) {
            if (Player.ap < 5) return;
            Player.ap -= 5;
            dealDamage(Player.atk * 2, target, "heavy");
            Player.actionsUsed.heavy = true;
            updateUI();
        }

        function executeSpinSlash() {
            if (Player.ap < 3) return;
            const alive = monsters.filter(m => m.hp > 0);
            if (alive.length === 0) return;
            Player.ap -= 3;
            let mult = 1.2;
            if (alive.length >= 2) mult *= (1 + Player.augBuffs.spinMultiTarget);
            const totalDmg = Player.atk * mult;
            const dmgPer = totalDmg / alive.length;
            alive.forEach(m => dealDamage(dmgPer, m, "spin"));
            Player.actionsUsed.spin = true;
            showFeedback("SPIN SLASH!", "#4a4");
            updateUI();
        }

        function dealDamage(amount, target, type = "normal") {
            let mult = Player.augBuffs.atk;
            if (type === "spin") mult = Player.augBuffs.spin;
            if (type === "heavy") {
                mult = Player.augBuffs.heavy;
                // 증강: 단두의 각
                if (target.hp / target.maxHp <= 0.3) mult *= (1 + Player.augBuffs.heavyExecute);
                // 증강: 집행인의 판결
                if (target.hp / target.maxHp <= 0.4) mult *= (1 + Player.augBuffs.heavyExecAll);
            }

            // 공통 증강 효과
            if (target.hp / target.maxHp <= Player.augBuffs.executeLow) mult *= 1.15;
            if (target.hp / target.maxHp <= 0.4) mult *= (1 + Player.augBuffs.executeAll);

            // 약점 파악/해부
            if (Player.state.consecutiveTarget === target) {
                if (Player.state.consecutiveCount >= 1) mult *= (1 + Player.augBuffs.stackAtk);
                mult *= (1 + Player.augBuffs.stackAtkEpic * Math.min(Player.state.consecutiveCount, 5));
            }

            // 조건부 버프들
            if (Player.state.heavyUsedLastTurn && Player.state.firstAttackThisTurn) {
                mult *= (1 + Player.augBuffs.heavySunder);
                mult *= (1 + Player.augBuffs.heavyOverheat);
            }
            if (Player.state.atkUsedLastTurn && Player.state.firstAttackThisTurn) {
                mult *= (1 + Player.augBuffs.inertiaSlice); // Epic 9: 관성 베기
            }
            if (Player.state.perfParryThisTurn) mult *= (1 + Player.augBuffs.turnAtkPerf);
            if (Player.state.perfFocusActive) {
                mult *= (1 + Player.augBuffs.perfectFocus); // 집중력
                Player.state.perfFocusActive = false;
            }
            if (Player.state.unlimitKills > 0) mult *= (1 + Player.augBuffs.unlimitKillAtk * Player.state.unlimitKills);
            if (Player.state.killStacks > 0) mult *= (1 + Player.augBuffs.killStackAtk * Math.min(Player.state.killStacks, 10));

            //  Unique: 정점의 호흡, 결투가
            if (Player.state.highApAtkActive) mult *= (1 + Player.augBuffs.highApBuff);
            if (monsters.length === 1) {
                mult *= (1 + Player.augBuffs.soloAtk);
                if (type === "heavy") mult *= (1 + Player.augBuffs.soloHeavy);
            }
            if (Player.state.perfStacks > 0) mult *= (1 + Player.augBuffs.perfStackBuff * Player.state.perfStacks);
            if (Player.state.firstAttackThisTurn) {
                mult *= (1 + Player.augBuffs.firstAtkMult);
                if (type === "heavy") mult *= 1.08; // 파괴의 맥박(강타시 추가) -> +0.1 보정
            }
            // if (type === "normal" && Player.state.multiAtkCount >= 1) mult *= Player.augBuffs.multiAtkAtk; // This was removed in previous edits

            const finalDmg = Math.ceil(amount * mult);
            target.hp = Math.max(0, target.hp - finalDmg);
            addDamageText(target.x, target.y - 30, `-${finalDmg}`, "#ff4a4a");

            Player.state.firstAttackThisTurn = false;
            Player.state.consecutiveTarget = target;
            Player.state.consecutiveCount++;
            if (type === "heavy") Player.state.heavyHitThisTurn = true;

            if (target.hp <= 0) {
                target.state = "DONE";
                // 증강: 피의 회수, 원심 폭발
                if (Player.state.killsThisTurn < 2) Player.ap += Player.augBuffs.killAp;
                if (type === "spin" && Player.state.killsThisTurn < 2) Player.ap += Player.augBuffs.spinKillAp;
                if (type === "heavy" && Player.state.killsThisTurn < 1) Player.ap += Player.augBuffs.heavyKillAp;

                Player.state.killStacks++;
                Player.state.unlimitKills++;
                Player.state.killsThisTurn++;

                setTimeout(() => {
                    monsters = monsters.filter(m => m.hp > 0);
                    if (monsters.length === 0) {
                        winRound();
                    }
                }, 100);
            }
        }

        function endPlayerTurn() {
            if (currentTurn !== "PLAYER") return;
            currentTurn = "MONSTER";
            currentMonsterIndex = 0;
            // 턴 종료 시 상태 갱신
            Player.state.heavyUsedLastTurn = Player.actionsUsed.heavy;
            Player.state.atkUsedLastTurn = Player.actionsUsed.atk; // Epic 9 위해 저장
            Player.state.killsThisTurn = 0;
            isTargeting = false;
            selectedSkill = null;
            Player.actionsUsed = { atk: false, spin: false, heavy: false };
            isEndingTurnAutomatically = false;
            roundStartTimer = 25;

            // UI Toggle (Safety Guarded)
            try {
                updateInterfaceVisibility();
                ui.turn.innerText = "Monster's Turn";
                updateHitIcons();
                updateUI();
            } catch (e) {
                console.warn("Turn transition UI update failed, but game logic continues:", e);
            }

            monsters.forEach(m => {
                if (m.hp > 0) {
                    m.state = "IDLE";
                    m.patternStep = 0;
                    m.timer = 0;
                }
            });
        }

        function updateHitIcons() {
            ui.hitIcons.innerHTML = "";
            const m = monsters[currentMonsterIndex];
            if (!m || !m.patterns || !m.currentPattern || currentTurn !== "MONSTER") return;

            const p = m.currentPattern;
            p.hits.forEach((h, i) => {
                const icon = document.createElement("div");
                icon.className = "hit-icon" + (i < m.patternStep ? " used" : "");
                ui.hitIcons.appendChild(icon);
            });
        }

        function showFeedback(text, color) {
            ui.msg.innerText = text;
            ui.msg.style.color = color;
            ui.msg.style.opacity = 1;
            setTimeout(() => ui.msg.style.opacity = 0, 800);
        }

        function addDamageText(x, y, text, color) {
            damageTexts.push({ x, y, text, color, timer: 60 });
        }

        function triggerVignette() {
            ui.vignette.classList.add('active');
            setTimeout(() => ui.vignette.classList.remove('active'), 300);
        }

        function update(dt) {
            if (!gameStarted) return;

            // Hit Stop
            if (hitStopTimer > 0) {
                hitStopTimer -= 1; // Approx 1 frame
                return;
            }

            // 파워 텍스트 업데이트
            for (let i = damageTexts.length - 1; i >= 0; i--) {
                const dt_item = damageTexts[i];
                dt_item.y -= 0.5 * dt;
                dt_item.timer -= dt;
                if (dt_item.timer <= 0) damageTexts.splice(i, 1);
            }

            if (currentTurn === "PLAYER") {
                updateUI();
                checkAutoTurnEnd();
                return;
            }

            if (roundStartTimer > 0) {
                roundStartTimer -= dt;
                if (roundStartTimer <= 0) {
                    roundStartTimer = 0;
                    ui.turn.innerText = (currentRound === 6) ? "Boss Round" : "Monster's Turn";
                    updateHitIcons();
                    // 증강: 정점의 호흡 (턴 시작 시 체크)
                    Player.state.highApAtkActive = (Player.ap >= 5);
                }
                updateUI();
                return;
            }

            // --- 몬스터 턴 로직 ---
            if (Player.parryTimer > 0) Player.parryTimer -= dt;
            else { Player.parryTimer = 0; Player.isParrying = false; }

            if (Player.dashTimer > 0) {
                Player.dashTimer -= dt;
                if (Math.random() < 0.3) Player.ghosts.push({ x: Player.x, y: Player.y, a: 0.5 });
            }
            Player.ghosts.forEach(g => g.a -= 0.02 * dt);
            Player.ghosts = Player.ghosts.filter(g => g.a > 0);

            const m = monsters[currentMonsterIndex];
            if (!m) { nextMonsterOrTurn(); return; }
            if (m.hp <= 0) { m.state = "DONE"; nextMonsterOrTurn(); return; }

            if (m.state === "IDLE") {
                m.timer += dt;
                const set = m.settings || monsterSettings;
                if (m.timer > (30 * set.postDelayMult)) {
                    m.currentPattern = m.patterns[m.currentPatternIdx];
                    m.state = "TELEGRAPH";
                    m.timer = 0;
                    m.startX = m.homeX; m.startY = m.homeY;
                    updateHitIcons();
                }
            } else if (m.state === "TELEGRAPH") {
                m.timer += dt;
                const set = m.settings || monsterSettings;
                const waitFrames = (m.currentPattern.hits[m.patternStep] * set.telegraphMult) + set.variance;
                const prepRatio = Math.min(m.timer / waitFrames, 1);
                // Vertical Shake
                m.y = m.homeY + Math.sin(prepRatio * Math.PI) * 15;

                // [NEW] 26프레임 반응 기준용 Cue(신호) 발생 로직
                const remainingTelegraph = waitFrames - m.timer;
                if (remainingTelegraph + CONFIG.ATTACK_DURATION <= CONFIG.REACTION_WINDOW) {
                    m.cueActive = true;
                } else {
                    m.cueActive = false;
                }

                if (m.timer >= waitFrames) {
                    m.state = "ATTACK";
                    m.timer = 0;
                    m.startX = m.x;
                    m.startY = m.y;
                    m.cueActive = false; // 공격 시작 시 신호 종료
                }
            } else if (m.state === "ATTACK") {
                m.timer += dt;
                let t = m.timer / CONFIG.ATTACK_DURATION;
                m.x = m.startX + (Player.x - m.startX) * (t * t);
                m.y = m.startY + (Player.y - Player.radius - m.startY) * (t * t);

                // 판정 타이밍 (0~2프레임 오차 허용을 위해 범위 체크)
                if (m.timer >= CONFIG.ATTACK_DURATION - 2 && m.timer < CONFIG.ATTACK_DURATION && !m.hitTriggered) {
                    m.hitTriggered = true;
                    if (Player.dashTimer > 0) {
                        showFeedback("EVADE", "#aaa");
                    } else if (Player.isParrying) {
                        const elapsed = CONFIG.PARRY_STANCE_DURATION - Player.parryTimer;
                        if (elapsed <= CONFIG.PERFECT_WINDOW) {
                            showFeedback("PERFECT!", "#FFD700");
                            Player.ap += 2.0;
                            if (!Player.state.isPrefGainedThisTurn) {
                                Player.ap += Player.augBuffs.parryAp;
                                Player.state.isPrefGainedThisTurn = true;
                            }
                            if (Player.state.parryApGained < 2) {
                                Player.ap += Player.augBuffs.perfectApBonus;
                                Player.state.parryApGained++;
                            }
                            Player.state.perfFocusActive = true;
                            Player.state.perfParryThisTurn = true;
                            Player.state.perfStacks = Math.min(Player.state.perfStacks + 1, 3);
                        } else {
                            showFeedback("GOOD", "#00FF00");
                            Player.ap += 1.0;
                            if (!Player.state.isPrefGainedThisTurn) {
                                Player.ap += Player.augBuffs.parryAp;
                                Player.state.isPrefGainedThisTurn = true;
                            }
                        }
                    } else {
                        const finalDmg = Math.round(m.atk * (CONFIG.K / (CONFIG.K + Player.def)) * Player.augBuffs.takeDmgMult);
                        Player.hp = Math.max(0, Player.hp - finalDmg);
                        addDamageText(Player.x, Player.y - 40, `-${finalDmg}`, "#ff4a4a");
                        Player.state.perfStacks = 0;
                        triggerVignette();

                        const set = m.settings || monsterSettings;
                        hitStopTimer = set.hitStop;

                        if (Player.hp <= 0) gameOver();
                    }
                }

                if (m.timer >= CONFIG.ATTACK_DURATION) {
                    m.state = "RETURN"; m.returnStartX = m.x; m.returnStartY = m.y; m.timer = 0; m.hitTriggered = false;
                    m.patternStep++; updateHitIcons();
                }
            } else if (m.state === "RETURN") {
                m.timer += dt;
                const isLastHit = m.patternStep === m.currentPattern.hits.length;
                const duration = isLastHit ? CONFIG.RETURN_DURATION : 25;
                const targetX = isLastHit ? m.homeX : (m.homeX + m.returnStartX) / 2;
                const targetY = isLastHit ? m.homeY : (m.homeY + m.returnStartY) / 2;

                let t = m.timer / duration;
                m.x = m.returnStartX + (targetX - m.returnStartX) * (1 - Math.pow(1 - t, 2));
                m.y = m.returnStartY + (targetY - m.returnStartY) * (1 - Math.pow(1 - t, 2));

                if (m.timer >= duration) {
                    if (m.patternStep < m.currentPattern.hits.length) {
                        m.state = "ATTACK"; m.timer = 0; m.startX = m.x; m.startY = m.y;
                    } else {
                        if (currentRound === 6) m.nextPattern();
                        m.state = "DONE";
                        nextMonsterOrTurn();
                    }
                }
            }
            updateUI();
        }

        function checkAutoTurnEnd() {
            if (isEndingTurnAutomatically) return;

            // 소수점 오차 방지를 위해 floor 처리된 AP 사용 및 약간의 마진(0.1) 추가
            const fAp = Math.floor(Player.ap + 0.01);
            const canAtk = !Player.actionsUsed.atk && fAp >= 2;
            const canSpin = !Player.actionsUsed.spin && fAp >= 3;
            const canHeavy = !Player.actionsUsed.heavy && fAp >= 5;

            if (!canAtk && !canSpin && !canHeavy) {
                isEndingTurnAutomatically = true;
                setTimeout(endPlayerTurn, 800);
            }
        }

        function nextMonsterOrTurn() {
            if (currentMonsterIndex < monsters.length - 1) {
                currentMonsterIndex++;
                // 다음 몬스터가 죽어있을 경우에 대한 예외 처리
                if (monsters[currentMonsterIndex].hp <= 0) {
                    monsters[currentMonsterIndex].state = "DONE";
                    nextMonsterOrTurn();
                }
                updateHitIcons();
            } else {
                currentTurn = "PLAYER";
                ui.turn.innerText = "Player's Turn";
                ui.hitIcons.innerHTML = "";

                // UI Toggle
                updateInterfaceVisibility();
            }
        }

        function updateInterfaceVisibility() {
            try {
                const overlays = [ui.lobby, ui.overlayAug, ui.overlayEvent, ui.overlayGameOver, ui.stageEditor, ui.monsterCreator, ui.inventory, ui.overlayGuide];
                const isAnyOverlayVisible = overlays.some(o => o && (o.style.display === "flex" || o.style.display === "block" || (o.classList && !o.classList.contains('hidden'))));

                const bottomUI = document.getElementById('bottom-ui');
                const topHUD = document.getElementById('top-status');
                const turnIndicator = ui.turn; // 중앙 관리된 참조 사용

                // 오버레이가 떠있거나 게임 시작 전이면 전투 UI 숨김
                if (isAnyOverlayVisible || !gameStarted) {
                    if (bottomUI) bottomUI.classList.add('hidden');
                    if (topHUD) topHUD.classList.add('hidden');
                    if (turnIndicator) turnIndicator.classList.add('hidden');
                    return;
                }

                // 전투 중에는 기본적으로 HUD 표시 (NONE 턴 포함)
                if (bottomUI) bottomUI.classList.remove('hidden');
                if (topHUD) topHUD.classList.remove('hidden');

                const playerActions = document.getElementById('player-actions');
                const monsterActions = document.getElementById('monster-actions');

                if (currentTurn === "PLAYER") {
                    if (playerActions) { playerActions.classList.remove('hidden'); playerActions.classList.add('flex'); }
                    if (monsterActions) { monsterActions.classList.add('hidden'); monsterActions.classList.remove('flex'); }

                    if (turnIndicator) {
                        turnIndicator.classList.remove('hidden');
                        turnIndicator.innerText = "PLAYER'S TURN";
                        turnIndicator.style.color = "var(--primary)";
                    }
                } else if (currentTurn === "MONSTER") {
                    if (playerActions) { playerActions.classList.add('hidden'); playerActions.classList.remove('flex'); }
                    if (monsterActions) { monsterActions.classList.remove('hidden'); monsterActions.classList.add('flex'); }

                    if (turnIndicator) {
                        turnIndicator.classList.remove('hidden');
                        turnIndicator.innerText = "MONSTER'S TURN";
                        turnIndicator.style.color = "var(--danger)";
                    }
                } else {
                    if (playerActions) playerActions.classList.add('hidden');
                    if (monsterActions) monsterActions.classList.add('hidden');
                    if (turnIndicator) turnIndicator.classList.add('hidden');
                }
            } catch (e) {
                // [SAFETY NET] UI 가시성 처리 실패 시에도 턴은 넘어감
                console.warn("Visibility Update Failed, ignoring to prevent freeze:", e);
            }
        }

        function updateUI() {
            updateInterfaceVisibility();

            if (uiCache.hp !== Player.hp) { ui.hp.innerText = Player.hp; uiCache.hp = Player.hp; }
            if (uiCache.atk !== Player.atk) { ui.atk.innerText = Player.atk; uiCache.atk = Player.atk; }
            if (uiCache.def !== Player.def) { ui.def.innerText = Player.def; uiCache.def = Player.def; }

            const fAp = Math.floor(Player.ap);
            if (uiCache.ap !== fAp) { ui.ap.innerText = fAp; uiCache.ap = fAp; }

            const isPlayer = currentTurn === "PLAYER";
            const atkD = !isPlayer || Player.ap < 2 || Player.actionsUsed.atk;
            const spinD = !isPlayer || Player.ap < 3 || Player.actionsUsed.spin;
            const heavyD = !isPlayer || Player.ap < 5 || Player.actionsUsed.heavy;
            const endD = !isPlayer;

            if (uiCache.atkBtn !== atkD) { ui.btns.atk.disabled = atkD; uiCache.atkBtn = atkD; }
            if (uiCache.spinBtn !== spinD) { ui.btns.spin.disabled = spinD; uiCache.spinBtn = spinD; }
            if (uiCache.heavyBtn !== heavyD) { ui.btns.heavy.disabled = heavyD; uiCache.heavyBtn = heavyD; }
            if (uiCache.endBtn !== endD) { ui.btns.end.disabled = endD; uiCache.endBtn = endD; }

            // AP 부족 시 자동 턴 종료 체크
            if (isPlayer && !isEndingTurnAutomatically && atkD && spinD && heavyD) {
                isEndingTurnAutomatically = true;
                setTimeout(() => {
                    if (currentTurn === "PLAYER") endPlayerTurn();
                }, 800);
            }
        }

        let canvasShake = 0;
        function shakeCanvas(amt) { canvasShake = amt; }

        function draw() {
            ctx.save();
            if (canvasShake > 0) {
                ctx.translate(Math.random() * canvasShake - canvasShake / 2, Math.random() * canvasShake - canvasShake / 2);
                canvasShake *= 0.9;
                if (canvasShake < 0.5) canvasShake = 0;
            }
            ctx.clearRect(-100, -100, canvas.width + 200, canvas.height + 200);
            if (!gameStarted) { ctx.restore(); return; }

            // 1. Draw Monsters
            monsters.forEach((m) => {
                let color = m.color;
                if (m.state === "TELEGRAPH") {
                    const set = m.settings || monsterSettings;
                    const waitFrames = (m.currentPattern.hits[m.patternStep] * set.telegraphMult) + set.variance;
                    const alpha = Math.min(m.timer / waitFrames, 1);
                    color = `rgb(${255}, ${74 + 181 * alpha}, ${74 + 181 * alpha})`;

                    // 신호(Cue) 발생 시 하얀색으로 강조
                    if (m.cueActive) {
                        color = "#ffffff";
                        ctx.shadowBlur = 20;
                        ctx.shadowColor = "#ffffff";
                    }
                }

                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
                ctx.fill();

                // 몬스터 HP 수치만 표시
                ctx.fillStyle = "#fff";
                ctx.font = "bold 14px Inter";
                ctx.textAlign = "center";
                ctx.fillText(`${Math.ceil(m.hp)}`, m.x, m.y - m.radius - 10);

                // 타겟팅 하이라이트
                if (isTargeting && m.hp > 0) {
                    ctx.strokeStyle = "#fff";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(m.x, m.y, m.radius + 5, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });

            // 2. Draw Damage Texts
            damageTexts.forEach(dt => {
                ctx.fillStyle = dt.color;
                ctx.font = "bold 24px Inter";
                ctx.fillText(dt.text, dt.x, dt.y);
            });

            // 3. Draw Player & Ghosts
            Player.ghosts.forEach(g => {
                ctx.fillStyle = `rgba(74, 158, 255, ${g.a})`;
                ctx.beginPath(); ctx.arc(g.x, g.y, Player.radius, 0, Math.PI * 2); ctx.fill();
            });

            if (Player.isParrying) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = "#FFD700";
                ctx.strokeStyle = "#FFD700";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(Player.x, Player.y, Player.radius + 5, 0, Math.PI * 2);
                ctx.stroke();
            } else if (Player.dashTimer > 0) {
                ctx.strokeStyle = "#aaa";
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.arc(Player.x, Player.y, Player.radius + 5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]); // Reset dash
            }

            ctx.fillStyle = Player.color;
            ctx.beginPath();
            ctx.arc(Player.x, Player.y, Player.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        function gameLoop(timestamp) {
            if (!lastTimestamp) lastTimestamp = timestamp;
            let elapsed = timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            // 델타 타임 계산 (60FPS 기준 1.0)
            // 브라우저 탭 전환 등으로 인한 과도한 점프 방지 (최대 100ms)
            let dt = (Math.min(elapsed, 100) / 16.66);

            update(dt);
            draw();
            requestAnimationFrame(gameLoop);
        }

        function executeDash() {
            if (Player.dashTimer > 0) return;
            Player.dashTimer = 20;
            showFeedback("DASH!", "#aaa");
        }

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        function resizeCanvas() {
            const root = document.getElementById('game-container');
            const playArea = document.getElementById('play-area');

            if (!root || !playArea) return;

            // 1. 실제 렌더링된 컨테이너의 크기를 정확히 파악
            const rect = playArea.getBoundingClientRect();

            // 2. 캔버스의 내부 해상도를 CSS 크기와 1:1로 일치시켜 왜곡 방지
            canvas.width = rect.width || 412;
            canvas.height = rect.height || 500;

            CANVAS_W = canvas.width;
            CANVAS_H = canvas.height;

            // 3. 캐릭터 좌표 설정 (캔버스 크기 대비 백분율 유지)
            Player.x = CANVAS_W / 2;
            Player.y = CANVAS_H * 0.85;

            monsters.forEach(m => {
                m.homeX = CANVAS_W / 2;
                m.homeY = CANVAS_H * 0.22;
                if (m.state === "IDLE" || m.state === "DONE") {
                    m.x = m.homeX;
                    m.y = m.homeY;
                }
            });

            // 4. CSS 스케일링으로 인한 찌그러짐 방지 (auto 설정)
            canvas.style.width = "100%";
            canvas.style.height = "100%";
        }

        function init() {
            try {
                lucide.createIcons();
                loadFromStorage();
                window.addEventListener('resize', resizeCanvas);

                // 전역 컨텍스트 메뉴 차단 (PC 우클릭 조작을 위해 필수)
                window.addEventListener('contextmenu', e => e.preventDefault());

                // 입력 핸들링 (캔버스 본체)
                canvas.addEventListener('mousedown', handleInput);
                canvas.addEventListener('touchstart', handleInput, { passive: false });

                // 조작 가이드 / 버튼 설정
                const pcGuide = document.getElementById('pc-guide');
                const mobBtns = document.getElementById('mobile-buttons');
                const btnParry = document.getElementById('btn-parry');
                const btnDash = document.getElementById('btn-dash');

                if (isMobile) {
                    if (mobBtns) mobBtns.style.display = 'flex';
                    if (pcGuide) pcGuide.style.display = 'none';
                    if (btnParry) {
                        btnParry.addEventListener('touchstart', (e) => {
                            e.preventDefault();
                            Player.parryTimer = CONFIG.PARRY_STANCE_DURATION;
                            Player.isParrying = true;
                        }, { passive: false });
                    }
                    if (btnDash) btnDash.onclick = executeDash;
                } else {
                    if (pcGuide) pcGuide.style.display = 'block';
                    if (mobBtns) mobBtns.style.display = 'none';
                }

                resizeCanvas();
                requestAnimationFrame(gameLoop);
            } catch (e) {
                console.error("Critical Init Error:", e);
            }
        }

        function handleInput(e) {
            if (!gameStarted) return;
            if (currentTurn === "PLAYER") {
                if (isTargeting) handleTargeting(e);
                return;
            }
            if (currentTurn === "MONSTER") {
                if (e.target !== canvas) return;
                e.preventDefault();
                if (!isMobile) {
                    if (e.button === 0) { // 좌클릭 (Parry)
                        Player.parryTimer = CONFIG.PARRY_STANCE_DURATION;
                        Player.isParrying = true;
                    } else if (e.button === 2) { // 우클릭 (Dash)
                        executeDash();
                    }
                } else {
                    Player.parryTimer = CONFIG.PARRY_STANCE_DURATION;
                    Player.isParrying = true;
                }
            }
        }

        init();
    