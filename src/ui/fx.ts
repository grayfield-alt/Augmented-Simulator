// src/ui/fx.ts (한글)
// 순수 연출(시각적) 레이어로, core 로직에 개입하지 않음

export function playShakeEffect(intensity: 'light' | 'heavy' = 'light') {
    const container = document.getElementById('game-container');
    if (!container) return;

    // 기존 진행 중인 흔들림 초기화
    container.style.animation = 'none';
    container.offsetHeight; // trigger reflow

    // CSS Keyframe에 'shake' 혹은 'shake-heavy' 가 있다고 가정
    // 여기서는 동적 적용 또는 CSS 유틸 클래스 사용으로 처리
    if (intensity === 'heavy') {
        container.style.animation = 'shake-heavy 0.3s cubic-bezier(.36,.07,.19,.97) both';
    } else {
        container.style.animation = 'shake 0.15s cubic-bezier(.36,.07,.19,.97) both';
    }

    setTimeout(() => {
        container.style.animation = '';
    }, intensity === 'heavy' ? 300 : 150);
}

export function playFlashEffect(color: 'white' | 'red' = 'white') {
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.inset = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '500';

    if (color === 'red') {
        overlay.style.background = 'radial-gradient(circle, transparent 50%, rgba(255,0,0,0.4) 150%)';
        overlay.style.boxShadow = 'inset 0 0 50px rgba(255,0,0,0.5)';
        overlay.style.transition = 'opacity 0.2s ease-out';
    } else {
        overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        overlay.style.transition = 'opacity 0.1s ease-out';
    }

    const container = document.getElementById('play-area') || document.body;
    container.appendChild(overlay);

    // Fade out logic
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
            }, 200);
        });
    });
}

// 캔버스 내 특정 좌표에 임팩트 링을 그리는 대신 단순 DOM 기반 이펙트(확장 가능)
export function playImpactRing(x: number, y: number, color: string = '#FFD700') {
    // Canvas 좌표계가 DOM 좌표계와 일치한다고 가정하거나 변환 필요
    // 현재는 코어와 RENDERER가 분리되어 있으므로 UI(DOM)단에서 처리하는 예시
    const playArea = document.getElementById('play-area');
    if (!playArea) return;

    const ring = document.createElement('div');
    ring.style.position = 'absolute';
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    ring.style.width = '10px';
    ring.style.height = '10px';
    ring.style.transform = 'translate(-50%, -50%) scale(1)';
    ring.style.borderRadius = '50%';
    ring.style.border = `4px solid ${color}`;
    ring.style.opacity = '1';
    ring.style.pointerEvents = 'none';
    ring.style.zIndex = '25';
    ring.style.transition = 'all 0.3s cubic-bezier(0.1, 0.9, 0.2, 1)';

    playArea.appendChild(ring);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            ring.style.transform = 'translate(-50%, -50%) scale(8)';
            ring.style.opacity = '0';
            setTimeout(() => ring.remove(), 300);
        });
    });
}
