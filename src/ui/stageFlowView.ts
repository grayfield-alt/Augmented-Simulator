// src/ui/stageFlowView.ts (한글)
import { GameState } from '../core/state';

/**
 * 현재 StagePlan의 노드 타입에 따라 UI 오버레이를 표시하거나 숨깁니다.
 * 이 모듈은 순수하게 DOM의 디스플레이 옵션만 조작하며, 로직 처리는 Dispatch 호출로 코어에 위임합니다.
 */
export function renderStageFlow(state: GameState): void {
    if (!state.gameStarted || !state.stagePlan) return;

    const currentNode = state.stagePlan.nodes[state.currentNodeIndex];
    if (!currentNode) return;

    // DOM 요소를 가져오되, (구 proto2.html과 호환성을 위해 ID 기반 접근)
    const overlayAug = document.getElementById('overlay-aug');
    const overlayEvent = document.getElementById('overlay-event');
    const battleActions = document.getElementById('player-actions');

    // 초기 상태 리셋 (한글)
    if (overlayAug) overlayAug.style.display = 'none';
    if (overlayEvent) overlayEvent.style.display = 'none';
    if (battleActions) battleActions.classList.remove('hidden');

    switch (currentNode.type) {
        case 'REWARD_AUGMENT':
            // 증강 선택 오버레이 활성화 (한글)
            if (overlayAug) overlayAug.style.display = 'flex';
            if (battleActions) battleActions.classList.add('hidden');
            break;

        case 'REST_CHOICE':
            // 휴식/이벤트 선택 오버레이 활성화 (한글)
            if (overlayEvent) overlayEvent.style.display = 'flex';
            if (battleActions) battleActions.classList.add('hidden');
            break;

        case 'COMBAT':
        case 'BOSS':
            // 전투 UI 활성화 (상단 renderer 로직에 의해 관리됨) (한글)
            break;

        default:
            console.warn(`[UI] Unknown node type: ${currentNode.type}`);
            break;
    }
}
