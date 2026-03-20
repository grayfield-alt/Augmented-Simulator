import { Player, Monster } from '../core/types';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private shakeAmount: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  setShake(amount: number) {
    this.shakeAmount = amount;
  }

  clear() {
    this.ctx.save();
    if (this.shakeAmount > 0) {
      this.ctx.translate(
        Math.random() * this.shakeAmount - this.shakeAmount / 2,
        Math.random() * this.shakeAmount - this.shakeAmount / 2
      );
      this.shakeAmount *= 0.9;
      if (this.shakeAmount < 0.5) this.shakeAmount = 0;
    }
    this.ctx.clearRect(-100, -100, this.canvas.width + 200, this.canvas.height + 200);
  }

  restore() {
    this.ctx.restore();
  }

  drawMonster(m: Monster, isTargeting: boolean) {
    if (m.hp <= 0 && m.state !== "DEAD") return;

    let color = m.hp <= 0 ? "#222" : (m.name.includes("BOSS") ? "#ff0000" : "#ff4a4a");
    
    // 텔레그래프 및 큐 효과는 나중에 추가
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // HP 표시
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "bold 14px Inter";
    this.ctx.textAlign = "center";
    this.ctx.fillText(`${Math.ceil(m.hp)}`, m.x, m.y - m.radius - 10);

    // 타겟팅 하이라이트
    if (isTargeting && m.hp > 0) {
      this.ctx.strokeStyle = "#fff";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(m.x, m.y, m.radius + 5, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  drawPlayer(player: Player, x: number, y: number, radius: number) {
    // 패링 효과
    if (player.hp > 0 && player.state.perfParryThisTurn) {
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = "#FFD700";
        this.ctx.strokeStyle = "#FFD700";
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    this.ctx.fillStyle = "#4a9eff";
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 그림자 초기화
    this.ctx.shadowBlur = 0;
  }

  drawDamageText(x: number, y: number, text: string, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.font = "bold 24px Outfit";
    this.ctx.textAlign = "center";
    this.ctx.fillText(text, x, y);
  }
}
