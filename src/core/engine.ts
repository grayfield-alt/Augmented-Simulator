import { store } from './state';
import { Monster, Player } from './types';
import { calculateDamage, applyDamage } from './combat';
import { MONSTER_LIBRARY } from '../data/monsters';

export class GameEngine {
  static spawnWave(round: number) {
    store.currentRound = round;
    store.monsters = [];
    
    // 임시: 튜토리얼 몬스터 소환
    const mData = MONSTER_LIBRARY[0]; 
    const monster: Monster = {
      id: mData.id,
      name: mData.name,
      hp: mData.hp,
      maxHp: mData.hp,
      atk: mData.atk,
      x: 200, y: 150,
      homeX: 200, homeY: 150,
      radius: 40,
      state: "IDLE",
      timer: 0
    };
    store.monsters.push(monster);
    store.currentTurn = "PLAYER";
  }

  static update(dt: number, player: Player, monsters: Monster[]) {
    monsters.forEach(m => {
      if (m.hp <= 0) return;
      
      switch (m.state) {
        case "IDLE":
          // 몬스터 턴일 때 공격 시작 (예시용 단순 로직)
          if (store.currentTurn === "MONSTER" && m.timer <= 0) {
            m.state = "TELEGRAPH";
            m.timer = 60; // 1초 전조
          }
          break;
        case "TELEGRAPH":
          m.timer -= dt;
          if (m.timer <= 0) {
            m.state = "ATTACK";
            m.timer = 0;
          }
          break;
        case "ATTACK":
          m.timer += dt;
          const attackDuration = 15;
          const t = m.timer / attackDuration;
          m.x = m.homeX + (player.x - m.homeX) * (1 - Math.pow(1 - t, 2));
          m.y = m.homeY + (player.y - m.homeY) * (1 - Math.pow(1 - t, 2));
          
          if (m.timer >= attackDuration) {
            // 플레이어 피격 (나중에 패링 판정 추가)
            const damage = Math.round(m.atk * (50 / (50 + player.def)));
            player.hp = Math.max(0, player.hp - damage);
            
            m.state = "RETURN";
            m.timer = 0;
          }
          break;
        case "RETURN":
          m.timer += dt;
          const returnDuration = 20;
          const tr = m.timer / returnDuration;
          m.x = player.x + (m.homeX - player.x) * (1 - Math.pow(1 - tr, 2));
          m.y = player.y + (m.homeY - player.y) * (1 - Math.pow(1 - tr, 2));
          
          if (m.timer >= returnDuration) {
            m.state = "IDLE";
            m.x = m.homeX;
            m.y = m.homeY;
            m.timer = 100; // 공격 사이 간격
          }
          break;
        case "HIT":
          m.timer -= dt;
          if (m.timer <= 0) m.state = "IDLE";
          break;
      }
    });
  }

  static endPlayerTurn() {
    store.currentTurn = "MONSTER";
    // 몬스터 공격 시작 로직 (추후 구현)
  }
}
