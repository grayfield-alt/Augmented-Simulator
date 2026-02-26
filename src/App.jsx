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
        const waitFrames = m.currentPattern.hits[m.patternStep];
        const alpha = m.timer / waitFrames;
        ctx.fillStyle = `rgb(${255}, ${74 + 181 * alpha}, ${74 + 181 * alpha})`;
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
    }
    ctx.fillStyle = "#4a9eff";
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
      if (m.timer > 30) {
        m.state = "TELEGRAPH";
        m.timer = 0;
      }
    } else if (m.state === "TELEGRAPH") {
      m.timer += dt;
      const waitFrames = m.currentPattern.hits[m.patternStep];
      if (m.timer >= waitFrames) {
        m.state = "ATTACK";
        m.timer = 0;
        m.startX = m.x;
        m.startY = m.y;
      }
    } else if (m.state === "ATTACK") {
      m.timer += dt;
      let t = m.timer / PLAYER_CONFIG.ATTACK_DURATION;
      m.x = m.startX + (150 + player.radius - m.startX) * (t * t);
      m.y = m.startY + (225 - m.startY) * (t * t);

      if (m.timer >= PLAYER_CONFIG.ATTACK_DURATION - 2 && !m.hitTriggered) {
        m.hitTriggered = true;
        resolveParry(m);
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
      const isLastHit = m.patternStep + 1 === m.currentPattern.hits.length;
      const duration = isLastHit ? PLAYER_CONFIG.RETURN_DURATION : 20;
      const targetX = isLastHit ? m.homeX : (m.homeX + m.returnStartX) / 2;
      const targetY = isLastHit ? m.homeY : (m.homeY + m.returnStartY) / 2;

      let t = m.timer / duration;
      m.x = m.returnStartX + (targetX - m.returnStartX) * (1 - Math.pow(1 - t, 2));
      m.y = m.returnStartY + (targetY - m.returnStartY) * (1 - Math.pow(1 - t, 2));

      if (m.timer >= duration) {
        m.patternStep++;
        if (m.patternStep < m.currentPattern.hits.length) {
          m.state = "TELEGRAPH";
          m.timer = 0;
        } else {
          m.state = "DONE";
          nextMonsterOrTurn();
        }
      }
    }
  };

  const resolveParry = (m) => {
    if (player.parryTimer > 0) {
      const elapsed = PLAYER_CONFIG.PARRY_STANCE_DURATION - player.parryTimer;
      if (elapsed <= PLAYER_CONFIG.PERFECT_WINDOW) {
        showVisualFeedback("PERFECT!", "#FFD700");
        engine.player.ap += 2.0;
      } else {
        showVisualFeedback("GOOD", "#00FF00");
        engine.player.ap += 1.0;
      }
    } else {
      const finalDmg = Math.round(m.atk * (50 / (50 + player.def)) * player.augBuffs.takeDmgMult);
      engine.player.hp = Math.max(0, engine.player.hp - finalDmg);
      addDamageText(150, 225 - 40, `-${finalDmg}`, "#ff4a4a");
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
    }
  };

  // --- Handlers ---
  const handleCanvasClick = () => {
    if (currentTurn === "MONSTER") {
      engine.player.parryTimer = PLAYER_CONFIG.PARRY_STANCE_DURATION;
      setPlayer({ ...engine.player });
    }
    if (isTargeting) {
      // Handled via canvas coords logic usually, keep it simple for now
    }
  };

  const startCombat = () => {
    engine.player.ap += engine.player.augBuffs.startAp;
    const newMonsters = engine.getMonsters(engine.currentRound);
    setMonsters(newMonsters);
    setCurrentMonsterIdx(0);
    setCurrentTurn("MONSTER");
    setGameState("fighting");
    setPlayer({ ...engine.player });
  };

  const executeSkill = (type) => {
    if (type === 'spin') {
      const alive = monsters.filter(m => m.hp > 0);
      const dmgPer = (engine.player.atk * 1.2 * engine.player.augBuffs.spin) / alive.length;
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
      dmg *= 2;
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

  const showVisualFeedback = (text, color) => {
    setFeedback({ text, color });
    setTimeout(() => setFeedback(null), 800);
  };

  const addDamageText = (x, y, text, color) => {
    setDamageTexts(prev => [...prev, { x, y, text, color, timer: 60 }]);
  };

  return (
    <div className="min-h-screen bg-background text-slate-300 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <header className="premium-card flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Swords className="text-primary w-8 h-8" />
            <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Augmented Prototype</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setView('menu')} className={`glass-button ${view === 'menu' && 'bg-white/10'}`}><Settings /></button>
            <button onClick={() => setView('analytics')} className={`glass-button ${view === 'analytics' && 'bg-white/10'}`}><BarChart2 /></button>
          </div>
        </header>

        {view === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="premium-card flex flex-col gap-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><Trophy className="text-gold" /> Player Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <StatItem label="HP" value={player.hp} icon={<Heart className="text-danger" />} />
                <StatItem label="ATK" value={player.atk} icon={<Target className="text-primary" />} />
                <StatItem label="DEF" value={player.def} icon={<Shield className="text-success" />} />
                <StatItem label="Next Round" value={engine.currentRound} icon={<History className="text-accent" />} />
              </div>
              <button onClick={startCombat} className="glass-button primary-button py-4 text-xl">⚔️ START ROUND {engine.currentRound}</button>
            </section>
            <section className="premium-card bg-primary/5">
              <h3 className="text-primary font-bold mb-2 flex items-center gap-2"><Info /> Guide</h3>
              <ul className="text-sm space-y-2 opacity-80">
                <li>• Click anywhere on the canvas during Enemy turn to Parry.</li>
                <li>• <b>PERFECT</b> timing gives +2 AP, <b>GOOD</b> gives +1 AP.</li>
                <li>• Use AP to cast skills during your turn.</li>
              </ul>
            </section>
          </div>
        )}

        {view === 'play' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center premium-card py-2 px-6">
              <div className="flex gap-8">
                <div className="flex flex-col"><span className="text-[10px] text-slate-500 font-bold">HP</span><span className="text-danger font-mono font-bold">{Math.ceil(player.hp)}</span></div>
                <div className="flex flex-col"><span className="text-[10px] text-slate-500 font-bold">AP</span><span className="text-success font-mono font-bold">{Math.floor(player.ap)}</span></div>
              </div>
              <div className="text-xl font-black italic text-primary">{currentTurn === 'PLAYER' ? "YOUR TURN" : "ENEMY TURN"}</div>
              <div className="text-slate-400 font-mono">ROUND {engine.currentRound}</div>
            </div>

            <div className="relative group cursor-crosshair" onClick={handleCanvasClick}>
              <canvas ref={canvasRef} width={800} height={500} className="premium-card bg-surface/50 p-0 overflow-hidden" />
              {feedback && (
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 pointer-events-none">
                  <span className="text-6xl font-black italic scale-150 drop-shadow-2xl" style={{ color: feedback.color }}>{feedback.text}</span>
                </div>
              )}
              {isTargeting && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary/20 backdrop-blur-md px-4 py-1 rounded-full border border-primary/50 text-xs text-primary font-bold animate-pulse">
                  SELECT TARGET
                </div>
              )}
              {/* Invisible targets for clicking */}
              {isTargeting && monsters.map(m => (
                <div
                  key={m.id}
                  style={{ position: 'absolute', left: m.x - m.radius, top: m.y - m.radius, width: m.radius * 2, height: m.radius * 2, borderRadius: '50%' }}
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={(e) => { e.stopPropagation(); handleTargeting(m); }}
                />
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4">
              <SkillButton label="Attack" cost={2} disabled={currentTurn !== 'PLAYER' || player.ap < 2} onClick={() => executeSkill('atk')} />
              <SkillButton label="Spin Slash" cost={3} disabled={currentTurn !== 'PLAYER' || player.ap < 3} onClick={() => executeSkill('spin')} />
              <SkillButton label="Heavy Strike" cost={5} disabled={currentTurn !== 'PLAYER' || player.ap < 5} onClick={() => executeSkill('heavy')} />
              <button onClick={() => setCurrentTurn('MONSTER')} className="glass-button bg-danger/20 hover:bg-danger/40 text-danger border-danger/50">END TURN</button>
            </div>
          </div>
        )}

        {gameState === 'choosing_augment' && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex flex-col items-center justify-center p-8">
            <h2 className="text-4xl font-black text-white mb-12 tracking-tighter">VICTORY! <span className="text-gold">CHOOSE AUGMENT</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              {augments.map((aug, i) => (
                <div key={i} onClick={() => { engine.selectAugment(aug); engine.currentRound++; setView('menu'); setGameState('idle'); }}
                  className="premium-card cursor-pointer hover:scale-105 transition-all hover:border-primary border-white/10 group bg-surface">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary">{aug.name}</h3>
                  <p className="text-sm text-slate-400">{aug.desc}</p>
                </div>
              ))}
            </div>
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
