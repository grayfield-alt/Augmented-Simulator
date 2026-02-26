import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameEngine } from './logic/GameEngine';
import { BALANCE } from './logic/constants';
import Dashboard from './components/Dashboard';
import {
  Heart, Shield, Zap, Target, Swords, Trophy,
  BarChart2, MousePointer2, Settings, History
} from 'lucide-react';

const engine = new GameEngine();

export default function App() {
  const [view, setView] = useState('menu'); // menu, play, analytics
  const [gameState, setGameState] = useState('idle'); // idle, fighting, choosing_augment, game_over
  const [player, setPlayer] = useState(engine.player);
  const [monster, setMonster] = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [parryWindowActive, setParryWindowActive] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [augments, setAugments] = useState([]);

  // Timing logic for manual parry
  const parryTimer = useRef(null);

  const startCombat = useCallback(() => {
    const newMonster = engine.generateMonster(engine.currentStage, engine.currentSector);
    setMonster(newMonster);
    setGameState('fighting');
    setCombatLog([{ text: `${newMonster.name} appeared!`, type: 'info' }]);

    // Start monster attack loop
    scheduleMonsterAttack();
  }, []);

  const scheduleMonsterAttack = useCallback(() => {
    // Monster attacks every 2.5 seconds
    const interval = setTimeout(() => {
      setParryWindowActive(true);
      setFeedback('GET READY...');

      // Parry window lasts for BALANCE.SYSTEM.PARRY_WINDOW_MS
      parryTimer.current = setTimeout(() => {
        setParryWindowActive(false);
        // If no parry was recorded, apply 'HIT'
        handleDefend('HIT');
      }, BALANCE.SYSTEM.PARRY_WINDOW_MS);
    }, 2500);

    return () => clearTimeout(interval);
  }, []);

  const handleDefend = (state) => {
    if (parryTimer.current) clearTimeout(parryTimer.current);
    setParryWindowActive(false);

    const result = engine.combat.calculateTurn(engine.player, monster, state);

    setPlayer({ ...engine.player });
    setMonster({ ...monster });
    setFeedback(state === 'PARRY' ? 'PERFECT!' : state === 'GUARD' ? 'GOOD' : 'MISS');

    setCombatLog(prev => [
      { text: `Monster dealt ${result.playerDamage.toFixed(1)} damage. You dealt ${result.monsterDamage.toFixed(1)} damage.`, type: 'combat' },
      ...prev.slice(0, 4)
    ]);

    if (!monster || monster.hp <= 0) {
      setGameState('choosing_augment');
      setAugments(engine.getNextAugments());
    } else if (engine.player.hp <= 0) {
      setGameState('game_over');
    } else {
      scheduleMonsterAttack();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && parryWindowActive) {
        handleDefend('PARRY');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [parryWindowActive]);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="flex justify-between items-center premium-card">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/20 rounded-xl">
            <Swords className="text-primary w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Augmented Simulator</h1>
            <p className="text-sm text-slate-400">Interactive Rogue-lite Engine</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('menu')} className={`glass-button ${view === 'menu' ? 'bg-white/10' : ''}`}>
            <Settings className="w-5 h-5" />
          </button>
          <button onClick={() => setView('analytics')} className={`glass-button ${view === 'analytics' ? 'bg-white/10' : ''}`}>
            <BarChart2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {view === 'menu' && (
        <main className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="premium-card flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Trophy className="text-gold" /> Session Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <StatItem label="HP" value={player.hp} max={player.maxHp} icon={<Heart className="text-danger" />} />
              <StatItem label="Luck" value={player.luck} icon={<Zap className="text-gold" />} />
              <StatItem label="ATK" value={player.atk} icon={<Target className="text-primary" />} />
              <StatItem label="DEF" value={player.def} icon={<Shield className="text-success" />} />
            </div>
            <button
              onClick={() => { setView('play'); startCombat(); }}
              className="glass-button primary-button py-4 text-lg w-full mt-4"
            >
              Start Session (Stage 1-1)
            </button>
          </section>

          <section className="premium-card bg-primary/5 border-primary/20">
            <h3 className="text-lg font-medium text-primary mb-4">Mastery Progress</h3>
            <div className="text-sm text-slate-400 leading-relaxed">
              Play manually to increase your Parry Mastery. Each encounter makes your timing window more forgiving and increases your counter damage.
            </div>
          </section>
        </main>
      )}

      {view === 'play' && (
        <main className="flex flex-col gap-8 items-center animate-in zoom-in-95 duration-300">
          {/* Battle Arena */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Player Side */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <span className="text-blue-400 font-bold">PLAYER</span>
                <span className="text-xl font-mono text-white">Combo {player.comboCount}x</span>
              </div>
              <div className="premium-card relative">
                <StatBar label="HP" value={player.hp} max={player.maxHp} color="bg-danger" />
                <StatBar label="Posture" value={player.posture} max={BALANCE.PLAYER.INITIAL_STATS.maxPosture} color="bg-warning" className="mt-4" />
                {feedback && <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl font-black text-white italic animate-bounce font-sans">{feedback}</div>}
              </div>
            </div>

            {/* Monster Side */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <span className="text-red-400 font-bold">{monster?.name || 'ENEMY'}</span>
                <span className="text-sm text-slate-500">Stage {engine.currentStage}-{engine.currentSector}</span>
              </div>
              <div className="premium-card">
                <StatBar label="HP" value={monster?.hp || 0} max={monster?.maxHp || 100} color="bg-danger" flip />
                <StatBar label="Posture" value={monster?.posture || 0} max={monster?.maxPosture || 100} color="bg-warning" flip className="mt-4" />
              </div>
            </div>
          </div>

          {/* Interaction Area */}
          <div className="w-full flex flex-col items-center gap-6 mt-8">
            <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center transition-all duration-100 ${parryWindowActive ? 'border-primary ring-8 ring-primary/20 scale-110' : 'border-white/5'}`}>
              <span className="text-sm font-bold text-slate-500">PRESS SPACE</span>
            </div>

            <div className="premium-card w-full max-w-md bg-black/40 h-32 overflow-y-auto flex flex-col gap-1 p-3">
              {combatLog.map((log, i) => (
                <div key={i} className={`text-xs font-mono ${log.type === 'info' ? 'text-primary' : 'text-slate-400'}`}>
                  {log.text}
                </div>
              ))}
            </div>
          </div>

          {gameState === 'choosing_augment' && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-4xl flex flex-col gap-8">
                <h2 className="text-4xl font-bold text-center text-white">Victory! Choose an Augment</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {augments.map((aug, i) => (
                    <button
                      key={i}
                      onClick={() => { engine.selectAugment(aug); startCombat(); }}
                      className="premium-card hover:bg-white/5 hover:border-primary/50 transition-all flex flex-col gap-4 text-left group"
                    >
                      <span className={`text-xs font-bold px-2 py-1 rounded w-fit ${aug.rarity === 'Rare' ? 'bg-secondary/20 text-secondary' : 'bg-slate-700 text-white'}`}>
                        {aug.rarity}
                      </span>
                      <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{aug.name}</h3>
                      <p className="text-sm text-slate-400">{aug.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {view === 'analytics' && (
        <main className="animate-in fade-in duration-500">
          <Dashboard simulationResults={engine.history} />
        </main>
      )}
    </div>
  );
}

function StatItem({ label, value, max, icon }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
      <div className="p-2 bg-black/20 rounded-lg">{icon}</div>
      <div>
        <div className="text-[10px] font-bold text-slate-500 uppercase">{label}</div>
        <div className="text-lg font-bold text-white leading-tight">{value}</div>
      </div>
    </div>
  );
}

function StatBar({ label, value, max, color, flip, className }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={className}>
      <div className={`flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1 ${flip ? 'flex-row-reverse' : ''}`}>
        <span>{label}</span>
        <span>{Math.ceil(value)} / {Math.ceil(max)}</span>
      </div>
      <div className="stat-bar-bg">
        <div className={`stat-bar-fill ${color} ${flip ? 'float-right' : ''}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}
