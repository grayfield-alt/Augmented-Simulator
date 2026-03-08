// src/ui/stageFlowView.ts (한글)
import { GameState } from '../core/state';
import { SELECTORS } from './selectors';

/**
 * 현재 StagePlan의 노드 타입에 따라 UI 오버레이를 표시하거나 숨깁니다.
 * 이 모듈은 순수하게 DOM의 디스플레이 옵션만 조작하며, 로직 처리는 Dispatch 호출로 코어에 위임합니다.
 */
export function renderStageFlow(state: GameState): void {
    if (!state.gameStarted || !state.stagePlan) return;

    const currentNode = state.stagePlan.nodes[state.currentNodeIndex];
    if (!currentNode) return;

    // DOM 요소를 가져오되, SELECTORS 상의 ID가 최신 index.html과 일치하도록 함 (한글)
    const overlayAug = document.getElementById(SELECTORS.overlayAug);
    const overlayEvent = document.getElementById(SELECTORS.overlayEvent);
    const battleActions = document.getElementById('player-controls'); // index.html 확인 필요

    // 초기 상태 리셋 (한글)
    if (overlayAug) overlayAug.style.display = 'none';
    if (overlayEvent) overlayEvent.style.display = 'none';
    if (battleActions) battleActions.classList.remove('hidden');

    switch (currentNode.type) {
        case 'REWARD_AUGMENT':
            if (overlayAug) {
                overlayAug.style.display = 'flex';
                // 임시 증강 선택 UI 렌더링 (한글)
                overlayAug.innerHTML = `
                    <div class="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                        <div class="text-center mb-4">
                            <h2 class="text-3xl font-black italic text-[#fae133] tracking-tighter">AUGMENT ACQUIRED</h2>
                            <p class="text-[10px] text-white/40 uppercase tracking-widest">Select one enhancement to proceed</p>
                        </div>
                        <div class="grid grid-cols-1 gap-4 w-full max-w-sm px-4">
                            <button class="glass-panel p-5 rounded-2xl border border-white/10 hover:border-[#fae133]/50 hover:bg-white/5 transition-all text-left group active:scale-95" onclick="location.reload()">
                                <div class="flex justify-between items-start mb-1">
                                    <span class="text-[#fae133] font-black italic tracking-tight group-hover:translate-x-1 transition-transform">RECOVERY CORE</span>
                                    <span class="text-[8px] bg-white/10 px-2 py-0.5 rounded-full text-white/60">COMMON</span>
                                </div>
                                <div class="text-[11px] text-white/60 leading-tight">Restores <span class="text-white font-bold">20 HP</span> immediately after selection.</div>
                            </button>
                            
                            <button class="glass-panel p-5 rounded-2xl border border-white/10 hover:border-[#fae133]/50 hover:bg-white/5 transition-all text-left group active:scale-95" onclick="location.reload()">
                                <div class="flex justify-between items-start mb-1">
                                    <span class="text-[#fae133] font-black italic tracking-tight group-hover:translate-x-1 transition-transform">OVERCHARGE</span>
                                    <span class="text-[8px] bg-[#fae133]/20 px-2 py-0.5 rounded-full text-[#fae133]">RARE</span>
                                </div>
                                <div class="text-[11px] text-white/60 leading-tight">Increases <span class="text-white font-bold">ATK by 10%</span> for the rest of the operation.</div>
                            </button>
                        </div>
                        <div class="mt-8">
                             <div class="text-[9px] text-white/20 italic animate-pulse">SYSTEM: TEST MODE - CLICKING REBOOTS TO LOBBY</div>
                        </div>
                    </div>
                `;
            }
            if (battleActions) battleActions.classList.add('hidden');
            break;

        case 'REST_CHOICE':
            if (overlayEvent) overlayEvent.style.display = 'flex';
            if (battleActions) battleActions.classList.add('hidden');
            break;

        case 'COMBAT':
        case 'BOSS':
            break;

        default:
            console.warn(`[UI] Unknown node type: ${currentNode.type}`);
            break;
    }
}
