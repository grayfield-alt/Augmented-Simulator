import { Monster } from '../core/types';

export class InputHandler {
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  getCanvasCoordinates(e: MouseEvent | TouchEvent): { x: number, y: number } {
    const rect = this.canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    // 캔버스 크기 비율 계산
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  findTarget(coords: { x: number, y: number }, monsters: Monster[]): Monster | null {
    for (const m of monsters) {
      if (m.hp <= 0) continue;
      const dist = Math.sqrt((coords.x - m.x) ** 2 + (coords.y - m.y) ** 2);
      if (dist < m.radius * 2) {
        return m;
      }
    }
    return null;
  }
}
