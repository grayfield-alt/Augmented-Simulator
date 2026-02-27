import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameEngine } from './logic/GameEngine';
import { PLAYER_CONFIG, MONSTER_CONFIG, WAVE_DATA } from './logic/constants';
import Dashboard from './components/Dashboard';
import {
  Heart, Shield, Zap, Target, Swords, Trophy,
  BarChart2, Settings, History, Info
} from 'lucide-react';

const engine = new GameEngine();

export default function App() {
  const [view, setView] = useState('menu');
  const [gameState, setGameState] = useState('idle'); // idle, fighting, event, choosing_augment, game_over
  const [player, setPlayer] = useState(engine.player);
  const [monsters, setMonsters] = useState([]);
  const [currentMonsterIdx, setCurrentMonsterIdx] = useState(0);
  const [combatLog, setCombatLog] = useState([]);
  const [currentTurn, setCurrentTurn] = useState("NONE");
  const [feedback, setFeedback] = useState(null);
  const [augments, setAugments] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isTargeting, setIsTargeting] = useState(false);
  const [damageTexts, setDamageTexts] = useState([]);
  const [isVignetteActive, setIsVignetteActive] = useState(false); // Added: Vignette state

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);

  // --- Game Loop ---
  const update = useCallback((dt) => {
    if (gameState !== 'fighting') return;

    // Update monsters
    const currentMonster = monsters[currentMonsterIdx];
    if (!currentMonster) {
      if (monsters.length > 0 && currentTurn === "MONSTER") {
        nextMonsterOrTurn();
      }
      return;
    }

    if (currentTurn === "MONSTER") {
      updateMonsterTurn(currentMonster, dt);
      // 대시 타이머 업데이트
      if (engine.player.dashTimer > 0) {
        engine.player.dashTimer -= dt;
        if (engine.player.dashTimer <= 0) {
          engine.player.dashTimer = 0;
          engine.player.isDashing = false;
        }
        setPlayer({ ...engine.player });
      }
      if (engine.player.parryTimer > 0) {
        engine.player.parryTimer -= dt;
        setPlayer({ ...engine.player });
      }
    }

    // Update damage texts
    setDamageTexts(prev => prev.map(d => ({ ...d, y: d.y - 0.5 * dt, timer: d.timer - dt })).filter(d => d.timer > 0));
  }, [gameState, monsters, currentMonsterIdx, currentTurn]);

  const draw = useCallback((ctx) => {
    ctx.clearRect(0, 0, 800, 500);

    // Draw Monsters
    monsters.forEach(m => {
      if (m.hp <= 0) return;
      ctx.fillStyle = m.color;

      // Telegraphing color change
      if (m.state === "TELEGRAPH") {
        const step = m.currentScript.steps[m.stepIdx];
        const waitFrames = step.duration;
        const alpha = m.timer / waitFrames;

        if (m.drawColor) {
          ctx.fillStyle = m.drawColor; // 패리 불가 시 보라색
        } else {
          ctx.fillStyle = `rgb(${255}, ${74 + 181 * alpha}, ${74 + 181 * alpha})`;
        }
      }

      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      ctx.fill();

      // HP Text
      ctx.fillStyle = "#fff";
      ctx.font = "14px bold Inter";
      ctx.textAlign = "center";
      ctx.fillText(`HP ${Math.ceil(m.hp)}`, m.x, m.y + m.radius + 20);

      // Target Highlight
      if (isTargeting) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Draw Player
    ctx.save();
    if (player.parryTimer > 0) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#FFD700";
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(150, 225, player.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (player.isDashing) {
      // 회피 효과 (회색 잔상/아우라)
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#AAA";
      ctx.strokeStyle = "#AAA";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(150, 225, player.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = player.isDashing ? "#888" : "#4a9eff";
    ctx.beginPath();
    ctx.arc(150, 225, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Damage Texts
    damageTexts.forEach(dt => {
      ctx.fillStyle = dt.color;
      ctx.font = "bold 24px Inter";
      ctx.fillText(dt.text, dt.x, dt.y);
    });
  }, [monsters, player, isTargeting, damageTexts]);

  useEffect(() => {
    const loop = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const elapsed = time - lastTimeRef.current;
      lastTimeRef.current = time;
      const dt = (Math.min(elapsed, 100) / 16.66) * 2.0;

      update(dt);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        draw(ctx);
      }
      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [update, draw]);

  // --- Monster Logic ---
  const updateMonsterTurn = (m, dt) => {
    if (m.state === "IDLE") {
      m.timer += dt;
      if (m.timer > 60) { // proto.html 기준 60 (dt*2 적용 시 0.5초)
        m.state = "TELEGRAPH";
        m.timer = 0;
        m.startX = m.homeX;
        m.startY = m.homeY;
      }
    } else if (m.state === "TELEGRAPH") {
      m.timer += dt;
      const step = m.currentScript.steps[m.stepIdx];
      const waitFrames = step.duration;

      // 100% 피델리티: TELEGRAPH 상태에서의 미세한 흔들림 (proto.html L1104)
      const prepRatio = Math.min(m.timer / waitFrames, 1);
      m.x = m.homeX + Math.sin(prepRatio * Math.PI) * 20;

      // 패리 불가 공격이면 막판에 보라색 점멸 (패리 불가 예보)
      if (step.unparriable && prepRatio > 0.8) {
        m.drawColor = "#A020F0";
      } else {
        m.drawColor = null;
      }

      if (m.timer >= waitFrames) {
        m.state = "ATTACK";
        m.timer = 0;
        m.startX = m.x;
        m.startY = m.y;
      }
    } else if (m.state === "ATTACK") {
      m.timer += dt;
      let t = m.timer / PLAYER_CONFIG.ATTACK_DURATION;
      // 100% 피델리티를 위한 가감속 보정 (Quadratic Ease-In)
      m.x = m.startX + (150 + player.radius - m.startX) * (t * t);
      m.y = m.startY + (225 - m.startY) * (t * t);

      if (m.timer >= PLAYER_CONFIG.ATTACK_DURATION - 2 && !m.hitTriggered) {
        m.hitTriggered = true;
        const step = m.currentScript.steps[m.stepIdx];
        resolveParry(m, step);
      }

      if (m.timer >= PLAYER_CONFIG.ATTACK_DURATION) {
        m.state = "RETURN";
        m.returnStartX = m.x;
        m.returnStartY = m.y;
        m.timer = 0;
        m.hitTriggered = false;
      }
    } else if (m.state === "RETURN") {
      m.timer += dt;
      const isLastStep = m.stepIdx + 1 === m.currentScript.steps.length;
      const duration = isLastStep ? PLAYER_CONFIG.RETURN_DURATION : 20;
      const targetX = isLastStep ? m.homeX : (m.homeX + m.returnStartX) / 2;
      const targetY = isLastStep ? m.homeY : (m.homeY + m.returnStartY) / 2;

      let t = m.timer / duration;
      // Quadratic Ease-Out
      m.x = m.returnStartX + (targetX - m.returnStartX) * (1 - Math.pow(1 - t, 2));
      m.y = m.returnStartY + (targetY - m.returnStartY) * (1 - Math.pow(1 - t, 2));

      if (m.timer >= duration) {
        m.stepIdx++;
        if (m.stepIdx < m.currentScript.steps.length) {
          m.state = "TELEGRAPH";
          m.timer = 0;
        } else {
          m.state = "DONE";
          nextMonsterOrTurn();
        }
      }
    }
  };

  const resolveParry = (m, step) => {
    // 1. 회피 판정 (가장 우선순위 높음, 리턴 없음)
    if (player.isDashing) {
      showVisualFeedback("EVADE", "#AAA");
      setCombatLog(prev => ["[SYSTEM] 회피 성공!", ...prev]);
      return;
    }

    // 2. 패리 판정 (패리 불가 공격이 아닐 때만 가능)
    if (player.parryTimer > 0 && !step.unparriable) {
      const elapsed = PLAYER_CONFIG.PARRY_STANCE_DURATION - player.parryTimer;
      if (elapsed <= PLAYER_CONFIG.PERFECT_WINDOW) {
        showVisualFeedback("PERFECT!", "#FFD700");
        engine.player.ap += 2.0;
      } else {
        showVisualFeedback("GOOD", "#00FF00");
        engine.player.ap += 1.0;
      }
    } else {
      // 3. 피격 판정
      if (step.unparriable && player.parryTimer > 0) {
        showVisualFeedback("UNPARRIABLE!", "#A020F0");
        setCombatLog(prev => ["[DANGER] 패리 불가 공격에 당했습니다!", ...prev]);
      }
      const dmgMult = step.damageMult || 1.0;
      const finalDmg = Math.round(m.atk * dmgMult * (50 / (50 + player.def)) * player.augBuffs.takeDmgMult);
      engine.player.hp = Math.max(0, engine.player.hp - finalDmg);
      addDamageText(150, 225 - 40, `-${finalDmg}`, "#ff4a4a");
      triggerVignette();
      if (engine.player.hp <= 0) setGameState('game_over');
    }
    setPlayer({ ...engine.player });
  };

  const nextMonsterOrTurn = () => {
    const nextIdx = currentMonsterIdx + 1;
    if (nextIdx < monsters.length) {
      setCurrentMonsterIdx(nextIdx);
    } else {
      setCurrentTurn("PLAYER");
      engine.player.state.firstAttackThisTurn = true;
      // 턴 시작 시 AP 보너스 등 증강 로직 처리 가능
    }
  };

  // --- Handlers ---
  const handleCanvasClick = (e) => {
    if (currentTurn === "MONSTER") {
      // 좌클릭: 패링, 우클릭: 회피
      if (e.button === 0) { // Left Click
        engine.player.parryTimer = PLAYER_CONFIG.PARRY_STANCE_DURATION;
      } else if (e.button === 2) { // Right Click
        engine.player.dashTimer = PLAYER_CONFIG.DASH_DURATION;
        engine.player.isDashing = true;
      }
      setPlayer({ ...engine.player });
    }
  };

  const preventDefault = (e) => e.preventDefault();

  const startCombat = () => {
    engine.player.ap += engine.player.augBuffs.startAp;
    const newMonsters = engine.getMonsters(engine.currentRound);
    setMonsters(newMonsters);
    setCurrentMonsterIdx(0);
    setCurrentTurn("MONSTER");
    setGameState("fighting");
    setPlayer({ ...engine.player });
    setView('play');
  };

  const executeSkill = (type) => {
    if (type === 'spin') {
      const alive = monsters.filter(m => m.hp > 0);
      const dmgTotal = engine.player.atk * 1.2 * engine.player.augBuffs.spin;
      const dmgPer = dmgTotal / alive.length;
      alive.forEach(m => {
        m.hp -= dmgPer;
        addDamageText(m.x, m.y - 30, `-${Math.ceil(dmgPer)}`, "#4a4");
      });
      engine.player.ap -= 3;
      checkWinCondition();
    } else {
      setSelectedSkill(type);
      setIsTargeting(true);
    }
    setPlayer({ ...engine.player });
  };

  const handleTargeting = (m) => {
    let dmg = engine.player.atk;
    let cost = 2;
    if (selectedSkill === 'heavy') {
      dmg *= 2 * engine.player.augBuffs.heavy;
      cost = 5;
    }
    m.hp -= dmg;
    addDamageText(m.x, m.y - 30, `-${Math.ceil(dmg)}`, "#ff4a4a");
    engine.player.ap -= cost;
    setIsTargeting(false);
    setSelectedSkill(null);
    checkWinCondition();
    setPlayer({ ...engine.player });
  };

  const checkWinCondition = () => {
    const alive = monsters.filter(m => m.hp > 0);
    if (alive.length === 0) {
      setGameState('choosing_augment');
      setAugments(engine.getNextAugments());
    }
  };

  const addAugmentDev = (aug) => {
    engine.selectAugment(aug);
    setPlayer({ ...engine.player });
    setCombatLog(prev => [`[DEV] 증강 추가: ${aug.name}`, ...prev]);
  };

  const showVisualFeedback = (text, color) => {
    setFeedback({ text, color });
    setTimeout(() => setFeedback(null), 800);
  };

  const triggerVignette = () => {
    setIsVignetteActive(true);
    setTimeout(() => setIsVignetteActive(false), 300);
  };

  const addDamageText = (x, y, text, color) => {
    setDamageTexts(prev => [...prev, { x, y, text, color, timer: 60 }]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <header className="premium-card flex justify-between items-center bg-slate-900/50 backdrop-blur border border-white/5">
          <div className="flex items-center gap-3">
            <Swords className="text-primary w-8 h-8" />
            <h1 className="text-2xl font-black text-white tracking-widest uppercase">Augmented Proto <span className="text-xs text-primary font-mono ml-2">v.Restored</span></h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setView('menu')} className={`glass-button ${view === 'menu' && 'bg-white/10'}`}><Settings /></button>
            <button onClick={() => setView('analytics')} className={`glass-button ${view === 'analytics' && 'bg-white/10'}`}><BarChart2 /></button>
          </div>
        </header>

        {view === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="premium-card flex flex-col gap-6 bg-slate-900/50">
              <h2 className="text-xl font-bold flex items-center gap-2"><Trophy className="text-gold" /> Player Status</h2>
              <div className="grid grid-cols-2 gap-4">
                <StatItem label="HP" value={player.hp} icon={<Heart className="text-danger" />} />
                <StatItem label="ATK" value={player.atk} icon={<Target className="text-primary" />} />
                <StatItem label="DEF" value={player.def} icon={<Shield className="text-success" />} />
                <StatItem label="Next Round" value={engine.currentRound} icon={<History className="text-accent" />} />
              </div>
              <button onClick={startCombat} className="glass-button primary-button py-4 text-xl bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all">⚔️ START ROUND {engine.currentRound}</button>
            </section>

            {/* DEV: Augment Simulator Panel */}
            <section className="premium-card bg-slate-900/50 border-primary/20">
              <h3 className="text-primary font-bold mb-4 flex items-center gap-2"><Zap /> 증강 시뮬레이터</h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {Object.keys(AUGMENT_DATA).map(tier => (
                    <button key={tier} onClick={() => setAugments(engine.getNextAugments(tier))}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold border border-white/10">
                      {tier} 리스트 갱신
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {augments.map(aug => (
                    <div key={aug.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5 hover:border-primary/50 transition-colors">
                      <div>
                        <div className="text-xs font-bold text-white">{aug.name}</div>
                        <div className="text-[10px] text-slate-500">{aug.desc}</div>
                      </div>
                      <button onClick={() => addAugmentDev(aug)} className="p-1 text-primary hover:bg-primary/10 rounded"><Zap size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {view === 'play' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between items-center premium-card py-2 px-6 bg-slate-900/80">
                <div className="flex gap-8">
                  <div className="flex flex-col"><span className="text-[10px] text-slate-500 font-bold">HP</span><span className="text-danger font-mono font-bold text-2xl">{Math.ceil(player.hp)}</span></div>
                  <div className="flex flex-col"><span className="text-[10px] text-slate-500 font-bold">AP</span><span className="text-success font-mono font-bold text-2xl">{Math.floor(player.ap)}</span></div>
                </div>
                <div className="text-3xl font-black italic tracking-tighter text-white animate-pulse">
                  {currentTurn === 'PLAYER' ? <span className="text-primary">YOUR TURN</span> : <span className="opacity-50">ENEMY TURN</span>}
                </div>
                <div className="text-slate-400 font-mono text-sm leading-tight flex flex-col items-end">
                  <span>ROUND {engine.currentRound}</span>
                  <span className="text-[10px] opacity-50">ACTIVE AUG: {engine.activeAugments.length}</span>
                </div>
              </div>

              {/* Monster Pattern Icons (Dots) */}
              <div className="flex justify-center gap-2 py-2 bg-slate-900/40 rounded-xl border border-white/5">
                {currentTurn === "MONSTER" && monsters[currentMonsterIdx] && monsters[currentMonsterIdx].currentScript.steps.map((step, idx) => (
                  <div key={idx}
                    className={`w-3 h-3 rounded-full border border-white/20 transition-all duration-300
                       ${idx < monsters[currentMonsterIdx].stepIdx ? 'opacity-20 scale-75' : 'opacity-100 scale-100'}
                       ${step.unparriable ? 'bg-purple-500 shadow-[0_0_10px_rgba(160,32,240,0.5)]' : 'bg-emerald-500'}
                       `}
                  />
                ))}
                {currentTurn === "PLAYER" && <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ready for Next Turn</div>}
              </div>
            </div>

            <div className="relative group cursor-crosshair overflow-hidden rounded-2xl border-2 border-white/5 shadow-2xl"
              onClick={handleCanvasClick} onContextMenu={(e) => e.preventDefault()} onMouseDown={handleCanvasClick}>
              <canvas ref={canvasRef} width={800} height={500} className="bg-slate-900 p-0" />

              {/* Impact Vignette */}
              <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 bg-radial-gradient from-transparent to-red-600/30 ${isVignetteActive ? 'opacity-100' : 'opacity-0'}`} />

              {feedback && (
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20">
                  <span className="text-8xl font-black italic drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] animate-bounce" style={{ color: feedback.color }}>{feedback.text}</span>
                </div>
              )}

              {isTargeting && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary/40 backdrop-blur-md px-6 py-2 rounded-full border border-primary/50 text-sm text-white font-black animate-pulse z-20">
                  CLICK ENEMY TO STRIKE
                </div>
              )}

              {/* Invisible targets for clicking */}
              {isTargeting && monsters.map(m => (
                <div
                  key={m.id}
                  style={{ position: 'absolute', left: m.x - m.radius, top: m.y - m.radius, width: m.radius * 2, height: m.radius * 2, borderRadius: '50%' }}
                  className="cursor-pointer hover:bg-white/10 transition-colors z-10"
                  onClick={(e) => { e.stopPropagation(); handleTargeting(m); }}
                />
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4">
              <SkillButton label="Normal Attack" cost={2} disabled={currentTurn !== 'PLAYER' || player.ap < 2} onClick={() => executeSkill('atk')} />
              <SkillButton label="Cyclone Slash" cost={3} disabled={currentTurn !== 'PLAYER' || player.ap < 3} onClick={() => executeSkill('spin')} />
              <SkillButton label="Grand Slam" cost={5} disabled={currentTurn !== 'PLAYER' || player.ap < 5} onClick={() => executeSkill('heavy')} />
              <button onClick={() => setCurrentTurn('MONSTER')} className="glass-button bg-red-950/30 hover:bg-red-900/50 text-red-500 border border-red-900/50 font-black tracking-widest uppercase">End Turn</button>
            </div>

            {/* Real-time Combat Log */}
            <div className="premium-card bg-black/40 text-xs font-mono h-24 overflow-y-auto custom-scrollbar p-3 border-white/5">
              {combatLog.map((log, i) => <div key={i} className="opacity-60 mb-1">{log}</div>)}
              {combatLog.length === 0 && <div className="opacity-20 italic">전투 로그가 여기에 표시됩니다...</div>}
            </div>
          </div>
        )}

        {gameState === 'choosing_augment' && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-8 animate-fade-in">
            <h2 className="text-5xl font-black text-white mb-2 tracking-tighter">VICTORY</h2>
            <div className="text-primary font-bold mb-12 flex items-center gap-2 tracking-widest"><Zap /> CHOOSE YOUR POWER</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
              {augments.map((aug, i) => (
                <div key={i} onClick={() => { engine.selectAugment(aug); engine.currentRound++; setView('menu'); setGameState('idle'); }}
                  className="premium-card cursor-pointer hover:scale-105 transition-all hover:border-primary border-white/5 group bg-slate-900/50 p-8 flex flex-col items-center text-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-6 group-hover:bg-primary/20 transition-colors"><Zap className="text-primary w-8 h-8" /></div>
                  <h3 className="text-2xl font-black text-white mb-3 group-hover:text-primary leading-tight">{aug.name}</h3>
                  <p className="text-slate-400 group-hover:text-slate-300">{aug.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {gameState === 'game_over' && (
          <div className="fixed inset-0 bg-red-950/90 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-8 animate-fade-in">
            <h2 className="text-7xl font-black text-white mb-4 tracking-tighter italic">YOU DIED</h2>
            <button onClick={() => { engine.resetSession(); setPlayer({ ...engine.player }); setView('menu'); setGameState('idle'); }}
              className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-none">
              Restart from Round 1
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
      <div className="p-3 bg-black/20 rounded-xl">{icon}</div>
      <div>
        <div className="text-[10px] font-bold text-slate-500 uppercase">{label}</div>
        <div className="text-xl font-mono font-bold text-white">{Math.round(value)}</div>
      </div>
    </div>
  );
}

function SkillButton({ label, cost, disabled, onClick }) {
  return (
    <button disabled={disabled} onClick={onClick}
      className={`glass-button flex flex-col items-center py-4 ${disabled ? 'opacity-30' : 'bg-primary/10 hover:bg-primary/20 border-primary/30'}`}>
      <span className="font-bold text-white">{label}</span>
      <span className="text-[10px] font-mono text-primary">{cost} AP</span>
    </button>
  );
}
