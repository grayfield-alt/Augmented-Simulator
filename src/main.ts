import './index.css';
import { store } from './core/state';
import { GameEngine } from './core/engine';
import { Renderer } from './ui/renderer';
import { InputHandler } from './ui/input';
import { calculateDamage, applyDamage } from './core/combat';
import { PersistenceManager } from './core/persistence';
import { MONSTER_LIBRARY } from './data/monsters';

const canvas = document.createElement('canvas');
canvas.id = 'gameCanvas';
canvas.className = 'absolute inset-0 w-full h-full z-10';
document.getElementById('app')?.appendChild(canvas);

const renderer = new Renderer(canvas);
const input = new InputHandler(canvas);

let isTargeting = false;
let selectedSkill: "normal" | "heavy" | "spin" = "normal";

function resize() {
  const container = document.getElementById('game-container');
  if (container) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    store.player.x = canvas.width / 2;
    store.player.y = canvas.height * 0.85;
  }
}

function updateHUD() {
  const { player } = store;
  const hpEl = document.getElementById('p-hp');
  const apEl = document.getElementById('p-ap');
  const atkEl = document.getElementById('p-atk');
  const defEl = document.getElementById('p-def');

  if (hpEl) hpEl.innerText = Math.ceil(player.hp).toString();
  if (apEl) apEl.innerText = Math.floor(player.ap).toString();
  if (atkEl) atkEl.innerText = player.atk.toString();
  if (defEl) defEl.innerText = player.def.toString();
}

function updateMessage(text: string, duration: number) {
  const msgEl = document.getElementById('message');
  if (msgEl) {
    msgEl.innerText = text;
    msgEl.style.opacity = "1";
    setTimeout(() => {
      msgEl.style.opacity = "0";
    }, duration);
  }
}

function init() {
  window.addEventListener('resize', resize);
  resize();

  // 데이터 로드
  const savedLib = PersistenceManager.loadMonsterLibrary();
  if (savedLib) {
    // 몬스터 라이브러리에 반영 로직 필요 (현재는 기본값 사용)
  }
  
  GameEngine.spawnWave(1);

  // 버튼 바인딩
  document.getElementById('btn-atk')?.addEventListener('click', () => {
    isTargeting = true;
    selectedSkill = "normal";
    updateMessage("Target Select", 1000);
  });
  
  document.getElementById('btn-heavy')?.addEventListener('click', () => {
    isTargeting = true;
    selectedSkill = "heavy";
    updateMessage("Target Select (HEAVY)", 1000);
  });

  // 입력 이벤트
  canvas.addEventListener('click', (e) => {
    if (isTargeting) {
      const coords = input.getCanvasCoordinates(e);
      const target = input.findTarget(coords, store.monsters);
      if (target) {
        const dmg = calculateDamage(store.player.atk, target, store.player, selectedSkill);
        applyDamage(dmg, target);
        isTargeting = false;
        updateMessage(`${dmg} DAMAGE!`, 600);
        renderer.setShake(10);
      }
    }
  });

  requestAnimationFrame(loop);
}

let lastTime = 0;
function loop(time: number) {
  const dt = (time - lastTime) / 16.66;
  lastTime = time;

  GameEngine.update(dt || 1, store.player, store.monsters);
  updateHUD();

  renderer.clear();
  store.monsters.forEach(m => renderer.drawMonster(m, isTargeting));
  renderer.drawPlayer(store.player, store.player.x, store.player.y, 40);
  renderer.restore();

  requestAnimationFrame(loop);
}

init();
